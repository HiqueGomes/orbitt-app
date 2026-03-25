import { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { getCurrentUser, updateUser, type StoredUser } from '@/lib/auth-storage';
import { MUSIC_STYLE_OPTIONS } from '@/lib/music-styles';
import { APP_VENUES } from '@/lib/catalog-venues';

const ORANGE = '#FF7A2A';

const SLOT_COUNT = 8;

export default function EditProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [photos, setPhotos] = useState<(string | null)[]>(Array(SLOT_COUNT).fill(null));
  const [about, setAbout] = useState('');
  const [musicStyles, setMusicStyles] = useState<string[]>([]);
  const [favoriteVenueIds, setFavoriteVenueIds] = useState<string[]>([]);
  const [venueSearch, setVenueSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredVenues = useMemo(() => {
    const q = venueSearch.trim().toLowerCase();
    if (!q) return APP_VENUES;
    return APP_VENUES.filter((v) => v.name.toLowerCase().includes(q));
  }, [venueSearch]);

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (u) {
        setUser(u);
        const uris = [...u.photoUris];
        const slots = Array(SLOT_COUNT)
          .fill(null)
          .map((_, i) => uris[i] ?? null);
        setPhotos(slots);
        setAbout(u.about ?? '');
        setMusicStyles(u.musicStyles ?? []);
        setFavoriteVenueIds(u.favoriteVenueIds ?? []);
      } else {
        router.replace('/(tabs)/profile');
      }
    });
  }, [router]);

  function toggleMusic(id: string) {
    setMusicStyles((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleVenue(id: string) {
    setFavoriteVenueIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handlePickPhoto(index: number, allowsEditing = true) {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing,
      aspect: allowsEditing ? [1, 1] : undefined,
    });
    if (result.canceled || result.assets.length === 0) return;
    const uri = result.assets[0].uri;
    setPhotos((prev) => {
      const next = [...prev];
      next[index] = uri;
      return next;
    });
  }

  function handlePhotoSlotPress(index: number) {
    const currentUri = photos[index];
    if (currentUri) {
      Alert.alert('Foto', 'O que deseja fazer?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Trocar foto', onPress: () => handlePickPhoto(index, true) },
        { text: 'Remover foto', style: 'destructive', onPress: () => handleRemovePhoto(index) },
      ]);
    } else {
      handlePickPhoto(index, true);
    }
  }

  function handleRemovePhoto(index: number) {
    setPhotos((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      const nonNull = photos.filter((uri): uri is string => uri !== null);
      let photoUris: string[] = [];

      if (Platform.OS === 'web') {
        photoUris = [...nonNull];
      } else {
        const dir = `${FileSystem.documentDirectory ?? ''}orbit_profile_photos/`;
        try {
          await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
        } catch {
          // diretório pode já existir
        }
        for (let i = 0; i < nonNull.length; i++) {
          const uri = nonNull[i];
          const isLocal = uri.startsWith(dir) || (FileSystem.documentDirectory != null && uri.startsWith(FileSystem.documentDirectory));
          if (isLocal) {
            photoUris.push(uri);
            continue;
          }
          const ext = uri.split('.').pop()?.toLowerCase()?.replace(/\?.*$/, '') || 'jpg';
          const filename = `profile_${user.id}_${i}.${ext}`;
          const toPath = `${dir}${filename}`;
          try {
            await FileSystem.copyAsync({ from: uri, to: toPath });
            photoUris.push(toPath);
          } catch {
            photoUris.push(uri);
          }
        }
      }
      const updated: StoredUser = {
        ...user,
        photoUris,
        about: about.trim(),
        musicStyles,
        favoriteVenueIds,
      };
      await updateUser(updated);
      router.replace('/(tabs)/profile');
    } catch (e) {
      console.warn('Erro ao salvar perfil:', e);
    } finally {
      setSaving(false);
    }
  }

  function handleBack() {
    router.replace('/(tabs)/profile');
  }

  if (!user) {
    return (
      <View style={styles.root}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.logoCircleOuter}>
            <View style={styles.logoCircleInner} />
          </View>
          <Text style={styles.brand}>Orbitt</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Adicionar fotos</Text>
        <View style={styles.photosGrid}>
          {photos.map((uri, index) => (
            <View key={index} style={styles.photoSlotWrap}>
              <TouchableOpacity
                style={styles.photoSlot}
                onPress={() => handlePhotoSlotPress(index)}
                activeOpacity={0.8}>
                {uri ? (
                  <Image source={{ uri }} style={styles.photoImage} />
                ) : (
                  <Text style={styles.plus}>+</Text>
                )}
              </TouchableOpacity>
              {uri ? (
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => handleRemovePhoto(index)}
                  hitSlop={8}>
                  <MaterialIcons name="close" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              ) : null}
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Sobre mim</Text>
        <TextInput
          style={styles.aboutInput}
          placeholder="Conte um pouco sobre você..."
          placeholderTextColor="#9CA3AF"
          value={about}
          onChangeText={setAbout}
          multiline
          numberOfLines={4}
        />

        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>Estilos de música que curte</Text>
          <Text style={styles.optionalTag}> (opcional)</Text>
        </View>
        <Text style={styles.hintText}>Toque para selecionar quantos quiser.</Text>
        <View style={styles.chipWrap}>
          {MUSIC_STYLE_OPTIONS.map((opt) => {
            const on = musicStyles.includes(opt.id);
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.chip, on && styles.chipSelected]}
                onPress={() => toggleMusic(opt.id)}
                activeOpacity={0.8}>
                <Text style={[styles.chipText, on && styles.chipTextSelected]}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>Lugares favoritos</Text>
          <Text style={styles.optionalTag}> (opcional)</Text>
        </View>
        <Text style={styles.hintText}>Locais cadastrados no Orbitt.</Text>
        <View style={styles.searchRow}>
          <MaterialIcons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            value={venueSearch}
            onChangeText={setVenueSearch}
            placeholder="Pesquisar local ou evento..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        <View style={styles.chipWrap}>
          {filteredVenues.map((v) => {
            const on = favoriteVenueIds.includes(v.id);
            return (
              <TouchableOpacity
                key={v.id}
                style={[styles.chip, on && styles.chipSelected]}
                onPress={() => toggleVenue(v.id)}
                activeOpacity={0.8}>
                <Text style={[styles.chipText, on && styles.chipTextSelected]} numberOfLines={2}>
                  {v.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {venueSearch.trim() && filteredVenues.length === 0 && (
          <Text style={styles.searchEmptyText}>Nenhum local encontrado para essa busca.</Text>
        )}

        <View style={styles.saveButtonSpacer} />
      </ScrollView>

      <View style={styles.saveButtonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.9}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.saveButtonText}>{saving ? 'Salvando...' : 'Salvar'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    alignSelf: 'center',
    marginTop: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoCircleOuter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircleInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: ORANGE,
  },
  brand: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  headerRight: {
    width: 32,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 48,
    flexGrow: 1,
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    marginBottom: 4,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  optionalTag: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  hintText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 10,
    marginTop: 0,
    lineHeight: 18,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    minHeight: 44,
    paddingVertical: 10,
    fontSize: 15,
    color: '#000000',
  },
  searchEmptyText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: ORANGE,
    backgroundColor: '#FFE8D9',
  },
  chipSelected: {
    backgroundColor: ORANGE,
    borderColor: ORANGE,
  },
  chipText: {
    fontSize: 13,
    color: '#111111',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  photoSlotWrap: {
    width: '23%',
    aspectRatio: 1,
    position: 'relative',
  },
  photoSlot: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: ORANGE,
    borderStyle: 'dashed',
    backgroundColor: '#FFE8D9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  plus: {
    fontSize: 28,
    fontWeight: '700',
    color: ORANGE,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutInput: {
    backgroundColor: '#FFE8D9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 120,
    fontSize: 15,
    color: '#000000',
    textAlignVertical: 'top',
  },
  saveButtonSpacer: {
    height: 24,
  },
  saveButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    alignSelf: 'center',
    backgroundColor: ORANGE,
    borderRadius: 24,
    paddingHorizontal: 48,
    paddingVertical: 14,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
