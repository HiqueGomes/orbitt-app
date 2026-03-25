import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { getCurrentUser, setCurrentUser, type StoredUser } from '@/lib/auth-storage';
import { clearSelectedEvents } from '@/lib/event-storage';
import { getMusicStyleLabel } from '@/lib/music-styles';
import { getVenueNameById } from '@/lib/catalog-venues';
import { formatDisplayFullName, formatNamePart } from '@/lib/format-name';

const ORANGE = '#FF7A2A';

/** Calcula a idade a partir da data de nascimento. Aceita DD/MM/AAAA ou AAAA-MM-DD. */
function parseAge(birthDate: string | undefined): number | null {
  const raw = (birthDate ?? '').trim();
  if (!raw) return null;
  const parts = raw.split(/[/\-.]/).map((p) => p.trim()).filter(Boolean);
  if (parts.length !== 3) return null;

  let day: number;
  let month: number;
  let year: number;

  const a = parseInt(parts[0], 10);
  const b = parseInt(parts[1], 10);
  const c = parseInt(parts[2], 10);
  if (Number.isNaN(a) || Number.isNaN(b) || Number.isNaN(c)) return null;

  // Formato AAAA-MM-DD ou AAAA/MM/DD (ano com 4 dígitos na primeira posição)
  if (parts[0].length === 4 && a > 31 && a >= 1900 && a <= 2100) {
    year = a;
    month = b - 1;
    day = c;
  } else {
    // Formato DD/MM/AAAA (cadastro brasileiro)
    day = a;
    month = b - 1;
    year = c;
  }

  const birth = new Date(year, month, day);
  if (Number.isNaN(birth.getTime())) return null;
  if (birth.getDate() !== day || birth.getMonth() !== month) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 && age <= 150 ? age : null;
}

function profileCompletePercent(user: StoredUser): number {
  let n = 0;
  const total = 7;
  if (user.photoUris.length > 0) n++;
  if (user.about.trim()) n++;
  if (user.firstName.trim()) n++;
  if (user.birthDate.trim()) n++;
  if (user.email.trim()) n++;
  if ((user.musicStyles ?? []).length > 0) n++;
  if ((user.favoriteVenueIds ?? []).length > 0) n++;
  return Math.round((n / total) * 100);
}

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [photoLoadFailed, setPhotoLoadFailed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      getCurrentUser().then((u) => {
        if (mounted) setUser(u);
      });
      return () => {
        mounted = false;
      };
    }, [])
  );

  useEffect(() => {
    setPhotoLoadFailed(false);
  }, [user?.id]);

  async function handleLogout() {
    await setCurrentUser(null);
    await clearSelectedEvents();
    router.replace('/(auth)/login');
  }

  function handleEditProfile() {
    router.push('/(tabs)/edit-profile');
  }

  function handleSettings() {
    console.log('Configurações');
  }

  function handleSecurityAndTerms() {
    router.push('/(tabs)/security-and-terms');
  }

  if (user === null) {
    return (
      <View style={styles.root}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  const profilePhotoUri = user.photoUris.length > 0 ? user.photoUris[0] : null;
  const showPhoto = profilePhotoUri && !photoLoadFailed;
  const displayFirst = formatNamePart(user.firstName);
  const displayLast = formatNamePart(user.lastName);
  const fullName = formatDisplayFullName(user.firstName, user.lastName) || 'Usuário';
  const initialA = (displayFirst || user.firstName.trim()).charAt(0).toUpperCase();
  const initialB = (displayLast || user.lastName.trim()).charAt(0).toUpperCase();
  const initials = `${initialA}${initialB}`.trim() || '?';
  const age = parseAge(user.birthDate);
  const percent = profileCompletePercent(user);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoCircleOuter}>
            <View style={styles.logoCircleInner} />
          </View>
          <Text style={styles.brand}>Orbitt</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleSecurityAndTerms}
            hitSlop={12}>
            <MaterialIcons name="verified-user" size={22} color="#000000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleSettings} hitSlop={12}>
            <MaterialIcons name="settings" size={22} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Photo + Editar perfil */}
        <View style={styles.photoSection}>
          <View style={styles.photoWrapper}>
            {showPhoto ? (
              <Image
                source={{ uri: profilePhotoUri! }}
                style={styles.photo}
                onError={() => setPhotoLoadFailed(true)}
              />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderText}>{initials}</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={handleEditProfile}
              activeOpacity={0.9}>
              <MaterialIcons name="edit" size={16} color="#FFFFFF" />
              <Text style={styles.editProfileButtonText}>Editar perfil</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.nameRow}>
            <Text style={styles.name}>
              {fullName}
              {age !== null ? `, ${age} anos` : ''}
            </Text>
            <MaterialIcons name="verified" size={22} color="#22C55E" style={styles.verifiedIcon} />
          </View>

          <Text style={styles.completionLabel}>Seu perfil está {percent}% completo</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${percent}%` }]} />
          </View>
        </View>

        {/* Bio */}
        <View style={styles.bioBox}>
          <Text style={styles.bioText}>{user.about.trim() || 'Nenhuma descrição.'}</Text>
        </View>

        {(user.musicStyles?.length ?? 0) > 0 && (
          <View style={styles.prefSection}>
            <Text style={styles.prefTitle}>Estilos de música</Text>
            <View style={styles.prefChips}>
              {(user.musicStyles ?? []).map((id) => (
                <View key={id} style={styles.prefChip}>
                  <Text style={styles.prefChipText}>{getMusicStyleLabel(id)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {(user.favoriteVenueIds?.length ?? 0) > 0 && (
          <View style={styles.prefSection}>
            <Text style={styles.prefTitle}>Lugares favoritos</Text>
            <View style={styles.prefChips}>
              {(user.favoriteVenueIds ?? []).map((id) => {
                const name = getVenueNameById(id) ?? id;
                return (
                  <View key={id} style={styles.prefChip}>
                    <Text style={styles.prefChipText}>{name}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Plano Orbitt - Grátis vs Plus */}
        <View style={styles.planBox}>
          <View style={styles.planHeader}>
            <Text style={styles.planTitle}>Orbitt —</Text>
            <TouchableOpacity style={styles.updateButton}>
              <Text style={styles.updateButtonText}>Atualizar</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.planRow}>
            <Text style={styles.planRowLabel}>Comparativo</Text>
            <View style={styles.planCols}>
              <Text style={styles.planColTitle}>Grátis</Text>
              <Text style={styles.planColTitle}>Plus</Text>
            </View>
          </View>
          {[
            { label: 'Ver quem curtiu você', free: false, plus: true },
            { label: 'Perfil em destaque', free: false, plus: true },
            { label: 'Super likes ilimitados', free: false, plus: true },
            { label: 'Suporte prioritário', free: false, plus: true },
          ].map((item, i) => (
            <View key={i} style={styles.planRow}>
              <Text style={styles.planRowLabel} numberOfLines={2}>
                {item.label}
              </Text>
              <View style={styles.planCols}>
                {item.free ? (
                  <MaterialIcons name="check" size={20} color="#FFFFFF" />
                ) : (
                  <MaterialIcons name="remove" size={20} color="rgba(255,255,255,0.7)" />
                )}
                {item.plus ? (
                  <MaterialIcons name="check" size={20} color="#FFFFFF" />
                ) : (
                  <MaterialIcons name="remove" size={20} color="rgba(255,255,255,0.7)" />
                )}
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Sair e voltar ao login</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoCircleOuter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircleInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: ORANGE,
  },
  brand: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photoWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: ORANGE,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: ORANGE,
    backgroundColor: '#FFE1CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 32,
    fontWeight: '700',
    color: ORANGE,
  },
  editProfileButton: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ORANGE,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  editProfileButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
  },
  verifiedIcon: {
    marginLeft: 6,
  },
  completionLabel: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 6,
  },
  progressTrack: {
    height: 6,
    width: '100%',
    maxWidth: 280,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: ORANGE,
    borderRadius: 3,
  },
  bioBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  bioText: {
    fontSize: 14,
    color: '#374151',
  },
  prefSection: {
    marginBottom: 16,
  },
  prefTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  prefChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  prefChip: {
    backgroundColor: '#FFE8D9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ORANGE,
  },
  prefChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C2410C',
  },
  planBox: {
    backgroundColor: ORANGE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  updateButton: {
    backgroundColor: '#000000',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  updateButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  planRowLabel: {
    flex: 1,
    fontSize: 12,
    color: '#FFFFFF',
    marginRight: 8,
  },
  planCols: {
    width: 88,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planColTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  planDashes: {
    width: 100,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  logoutButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: ORANGE,
    backgroundColor: '#FFFFFF',
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: ORANGE,
  },
});
