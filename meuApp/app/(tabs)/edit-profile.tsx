import { useState, useEffect } from 'react';
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

const ORANGE = '#FF7A2A';

const SLOT_COUNT = 8;

export default function EditProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [photos, setPhotos] = useState<(string | null)[]>(Array(SLOT_COUNT).fill(null));
  const [about, setAbout] = useState('');
  const [saving, setSaving] = useState(false);

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
      } else {
        router.replace('/(tabs)/profile');
      }
    });
  }, [router]);

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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    marginTop: 8,
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
