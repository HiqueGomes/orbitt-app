import { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { getMatches, type MatchEntry } from '@/lib/match-storage';
import { getCurrentUser } from '@/lib/auth-storage';
import { subscribeChatListRefresh } from '@/lib/chat-list-refresh';
import { matchEntryAvatarSource } from '@/lib/mock-profile-avatars';

const ORANGE = '#FF7A2A';

async function loadMatches(): Promise<MatchEntry[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  return getMatches(user.id);
}

export default function ChatScreen() {
  const router = useRouter();
  const [matches, setMatches] = useState<MatchEntry[]>([]);

  const refetch = useCallback(() => {
    loadMatches().then(setMatches);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  useEffect(() => {
    const unsubscribe = subscribeChatListRefresh(() => {
      refetch();
    });
    return unsubscribe;
  }, [refetch]);

  const hasMatches = matches.length > 0;

  if (!hasMatches) {
    return (
      <View style={styles.root}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoCircleOuter}>
              <View style={styles.logoCircleInner} />
            </View>
            <Text style={styles.brand}>Orbitt</Text>
          </View>
          <TouchableOpacity style={styles.shieldButton} hitSlop={12}>
            <MaterialIcons name="verified-user" size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Matches</Text>
          <View style={styles.emptyCard}>
            <View style={styles.lockIconWrap}>
              <MaterialIcons name="lock" size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.emptyCardText}>Você não possui matches ainda</Text>
          </View>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push('/(tabs)')}
            activeOpacity={0.9}>
            <Text style={styles.ctaButtonText}>Clique aqui para encontrar pessoas</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoCircleOuter}>
            <View style={styles.logoCircleInner} />
          </View>
          <Text style={styles.brand}>Orbitt</Text>
        </View>
        <TouchableOpacity style={styles.shieldButton} hitSlop={12}>
          <MaterialIcons name="verified-user" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Matches</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.matchesRow}>
          <View style={styles.matchLockBadge}>
            <MaterialIcons name="lock" size={24} color={ORANGE} />
            <Text style={styles.matchLockCount}>{matches.length}</Text>
          </View>
          {matches.map((m) => {
            const src = matchEntryAvatarSource(m);
            return (
              <View key={m.id} style={styles.matchAvatarWrap}>
                {src ? (
                  <Image source={src} style={styles.matchAvatar} />
                ) : (
                  <View style={styles.matchAvatarPlaceholder}>
                    <Text style={styles.matchAvatarLetter}>{m.name.charAt(0)}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        <Text style={[styles.sectionTitle, styles.conversasTitle]}>Conversas</Text>
        {matches.map((m) => {
          const src = matchEntryAvatarSource(m);
          return (
            <TouchableOpacity
              key={m.id}
              style={styles.conversaCard}
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/chat-conversation',
                  params: { id: m.id, name: m.name, photoUri: m.photoUri ?? '' },
                })
              }
              activeOpacity={0.8}>
              {src ? (
                <Image source={src} style={styles.conversaAvatar} />
              ) : (
                <View style={styles.conversaAvatarPlaceholder}>
                  <Text style={styles.conversaAvatarLetter}>{m.name.charAt(0)}</Text>
                </View>
              )}
              <View style={styles.conversaInfo}>
                <Text style={styles.conversaName}>{m.name}</Text>
                <Text style={styles.conversaPreview} numberOfLines={1}>
                  {m.lastMessage || 'Conversa iniciada'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  shieldButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: ORANGE,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    backgroundColor: '#FFFFFF',
  },
  lockIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  emptyCardText: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  ctaButton: {
    alignSelf: 'center',
    backgroundColor: ORANGE,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 28,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  matchesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  matchLockBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFE8D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchLockCount: {
    fontSize: 11,
    fontWeight: '700',
    color: ORANGE,
    marginTop: 2,
  },
  matchAvatarWrap: {
    width: 56,
    height: 56,
  },
  matchAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    resizeMode: 'cover',
  },
  matchAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchAvatarLetter: {
    fontSize: 22,
    fontWeight: '700',
    color: '#6B7280',
  },
  conversasTitle: {
    marginBottom: 12,
  },
  conversaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  conversaAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    resizeMode: 'cover',
    marginRight: 14,
  },
  conversaAvatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  conversaAvatarLetter: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6B7280',
  },
  conversaInfo: {
    flex: 1,
    minWidth: 0,
  },
  conversaName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 2,
  },
  conversaPreview: {
    fontSize: 14,
    color: '#6B7280',
  },
});
