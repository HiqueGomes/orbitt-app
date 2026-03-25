import { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { getSelectedEvents } from '@/lib/event-storage';
import { buildCurtidaSections } from '@/lib/curtidas-from-events';
import { getMockAvatarSourceForProfileId } from '@/lib/mock-profile-avatars';
import { useCurtidasBadge } from '@/contexts/CurtidasBadgeContext';

const ORANGE = '#FF7A2A';
const PURPLE_ACCENT = '#A855F7';

export default function CurtidasScreen() {
  const { refreshCurtidasBadge } = useCurtidasBadge();
  const [sections, setSections] = useState(() => buildCurtidaSections([]));

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      getSelectedEvents().then((list) => {
        if (!mounted) return;
        setSections(buildCurtidaSections(list));
      });
      void refreshCurtidasBadge();
      return () => {
        mounted = false;
      };
    }, [refreshCurtidasBadge])
  );

  const hasEvents = sections.length > 0;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoCircleOuter}>
            <View style={styles.logoCircleInner} />
          </View>
          <Text style={styles.brand}>Orbitt</Text>
        </View>
        <TouchableOpacity style={styles.shieldButton} hitSlop={12} activeOpacity={0.7}>
          <MaterialIcons name="verified-user" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      {hasEvents ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.freeTierHint}>
            Plano gratuito: você vê apenas uma prévia desfocada de quem curtiu você. Assine o Orbitt
            Plus para revelar os perfis.
          </Text>

          {sections.map((section) => (
            <View key={section.title} style={styles.block}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.row}>
                {section.likers.map((liker) => {
                  const src = getMockAvatarSourceForProfileId(liker.profileId);
                  const borderColor =
                    liker.accent === 'purple' ? PURPLE_ACCENT : ORANGE;
                  return (
                    <View
                      key={`${section.title}-${liker.profileId}-${liker.accent ?? ''}`}
                      style={[styles.card, { borderColor }]}>
                      {src ? (
                        <View style={styles.cardImageWrap}>
                          <Image
                            source={src}
                            style={styles.cardImage}
                            resizeMode="cover"
                            blurRadius={Platform.OS === 'ios' ? 22 : 12}
                          />
                          <View style={styles.cardFrostOverlay} pointerEvents="none" />
                        </View>
                      ) : (
                        <View style={styles.cardFallback}>
                          <Text style={styles.cardFallbackText}>
                            {liker.profileId.charAt(0)}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIconCircle}>
            <MaterialIcons name="favorite-border" size={48} color={ORANGE} />
          </View>
          <Text style={styles.emptyTitle}>Nenhuma curtida no momento</Text>
          <Text style={styles.emptySubtitle}>
            As prévias de quem curtiu você aparecem com base nos eventos que você programa. Adicione
            rolês na aba Eventos para ver tudo aqui.
          </Text>
        </View>
      )}
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  freeTierHint: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
    marginBottom: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFF7ED',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,122,42,0.25)',
  },
  block: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 8,
  },
  card: {
    width: 56,
    height: 72,
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  cardImageWrap: {
    width: '100%',
    height: '100%',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.08 }],
  },
  cardFrostOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.42)',
  },
  cardFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5E7EB',
  },
  cardFallbackText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6B7280',
  },
  emptyWrap: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 48,
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,122,42,0.2)',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 320,
  },
});
