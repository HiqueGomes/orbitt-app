import { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import {
  getPendingRegistration,
  clearPendingRegistration,
  saveUser,
  setCurrentUser,
  type PendingRegistration,
  type StoredUser,
} from '@/lib/auth-storage';
import { clearSelectedEvents } from '@/lib/event-storage';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const [pending, setPending] = useState<PendingRegistration | null>(null);
  const [photos, setPhotos] = useState<(string | null)[]>(Array(8).fill(null));
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const [about, setAbout] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getPendingRegistration().then((data) => {
      if (data) setPending(data);
      else router.replace('/(auth)/register');
    });
  }, [router]);

  function handleBackPress() {
    router.back();
  }

  async function handleSavePress() {
    setSubmitted(true);

    const hasPhoto = photos.some((uri) => uri !== null);
    if (!hasPhoto) {
      return;
    }

    if (!about.trim()) {
      return;
    }

    if (!pending) {
      return;
    }

    const tempUris = photos.filter((uri): uri is string => uri !== null);
    const userId = Date.now().toString();
    let photoUris: string[] = [];

    if (Platform.OS === 'web') {
      photoUris = [...tempUris];
    } else {
      const dir = `${FileSystem.documentDirectory ?? ''}orbit_profile_photos/`;
      try {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      } catch {
        // diretório pode já existir
      }
      for (let i = 0; i < tempUris.length; i++) {
        const uri = tempUris[i];
        const ext = uri.split('.').pop()?.toLowerCase()?.replace(/\?.*$/, '') || 'jpg';
        const filename = `profile_${userId}_${i}.${ext}`;
        const toPath = `${dir}${filename}`;
        try {
          await FileSystem.copyAsync({ from: uri, to: toPath });
          photoUris.push(toPath);
        } catch (e) {
          console.warn('Falha ao copiar foto:', e);
          photoUris.push(uri);
        }
      }
    }

    const user: StoredUser = {
      id: userId,
      firstName: pending.firstName,
      lastName: pending.lastName,
      email: pending.email,
      birthDate: pending.birthDate,
      cpf: pending.cpf,
      password: pending.password,
      photoUris,
      about: about.trim(),
    };

    await saveUser(user);
    await clearPendingRegistration();
    await clearSelectedEvents(); // novo usuário começa sem eventos (evita herdar do anterior)
    await setCurrentUser(user);
    router.replace('/(tabs)');
  }

  async function handlePickPhoto(index: number) {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      console.warn('Permissão para acessar a galeria negada');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: false,
    });

    if (result.canceled || result.assets.length === 0) {
      return;
    }

    const uri = result.assets[0].uri;
    setPhotos((current) => {
      const next = [...current];
      next[index] = uri;
      return next;
    });
    setSelectedIndex(index);
    setScale(1);
  }

  function handleIncreaseScale() {
    setScale((current) => {
      if (current >= 1.8) {
        return current;
      }
      return Number((current + 0.1).toFixed(2));
    });
  }

  function handleDecreaseScale() {
    setScale((current) => {
      if (current <= 0.6) {
        return current;
      }
      return Number((current - 0.1).toFixed(2));
    });
  }

  return (
    <ThemedView style={styles.root}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
              <Text style={styles.backIcon}>{'<'}</Text>
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <View style={styles.logoCircleOuter}>
                <View style={styles.logoCircleInner} />
              </View>
              <ThemedText style={styles.brand}>Orbit</ThemedText>
            </View>
          </View>

          <ThemedText style={styles.sectionTitle}>Adicionar fotos</ThemedText>

          <View style={styles.photosGrid}>
            {Array.from({ length: 8 }).map((_, index) => {
              const uri = photos[index];
              const isSelected = selectedIndex === index;

              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.photoSlot, isSelected && styles.photoSlotSelected]}
                  onPress={() => handlePickPhoto(index)}>
                  {uri ? (
                    <View style={styles.photoInner}>
                      <Image
                        source={{ uri }}
                        style={[
                          styles.photoImage,
                          {
                            transform: [{ scale: isSelected ? scale : 1 }],
                          },
                        ]}
                      />
                    </View>
                  ) : (
                    <Text style={styles.plus}>+</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedIndex !== null && photos[selectedIndex] && (
            <View style={styles.scaleControls}>
              <Text style={styles.scaleLabel}>Ajustar tamanho</Text>
              <View style={styles.scaleButtonsRow}>
                <TouchableOpacity style={styles.scaleButton} onPress={handleDecreaseScale}>
                  <Text style={styles.scaleButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.scaleValue}>{scale.toFixed(1)}x</Text>
                <TouchableOpacity style={styles.scaleButton} onPress={handleIncreaseScale}>
                  <Text style={styles.scaleButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <ThemedText style={styles.sectionTitle}>Sobre mim</ThemedText>
          <TextInput
            style={styles.aboutInput}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={about}
            onChangeText={setAbout}
          />
          {submitted && !about.trim() && (
            <Text style={styles.errorText}>Escreva algo sobre você.</Text>
          )}

          <TouchableOpacity style={styles.saveButton} onPress={handleSavePress}>
            <Text style={styles.saveButtonText}>Salvar</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const ORANGE = '#FF7A2A';
const TILE_BG = '#FFE1CC';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  backIcon: {
    fontSize: 20,
    fontWeight: '600',
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
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: ORANGE,
  },
  brand: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoSlot: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: ORANGE,
    borderStyle: 'dashed',
    backgroundColor: TILE_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoSlotSelected: {
    borderStyle: 'solid',
  },
  photoInner: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: 8,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  plus: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  aboutInput: {
    marginTop: 4,
    backgroundColor: TILE_BG,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    minHeight: 120,
    fontSize: 14,
  },
  scaleControls: {
    marginTop: 16,
  },
  scaleLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
    color: '#111111',
  },
  scaleButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  scaleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scaleButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: ORANGE,
  },
  scaleValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  errorText: {
    marginTop: 4,
    marginBottom: 4,
    fontSize: 12,
    color: ORANGE,
  },
  saveButton: {
    alignSelf: 'center',
    marginTop: 24,
    backgroundColor: ORANGE,
    borderRadius: 24,
    paddingHorizontal: 48,
    paddingVertical: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

