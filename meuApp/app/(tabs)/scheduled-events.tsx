import { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
  Modal,
  Pressable,
  TouchableWithoutFeedback,
  BackHandler,
} from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { APP_VENUES, venuesMatchingUserMusicStyles } from '@/lib/catalog-venues';
import { getMusicStyleLabel } from '@/lib/music-styles';
import { getCurrentUser } from '@/lib/auth-storage';
import { getSelectedEvents } from '@/lib/event-storage';
import { useCurtidasBadge } from '@/contexts/CurtidasBadgeContext';

const ORANGE = '#FF7A2A';
const FILTER_BG = '#E88B5C';

export type EventTypeFilter = 'todos' | 'bar' | 'balada';

const WEEK_EVENTS = APP_VENUES;

const FILTER_LABELS: Record<EventTypeFilter, string> = {
  todos: 'Todos',
  bar: 'Bar',
  balada: 'Balada',
};

export default function ScheduledEventsScreen() {
  const { refreshCurtidasBadge } = useCurtidasBadge();
  const [search, setSearch] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<EventTypeFilter>('todos');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [userMusicStyles, setUserMusicStyles] = useState<string[]>([]);
  const [scheduledVenueIds, setScheduledVenueIds] = useState<Set<string>>(new Set());

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      getCurrentUser().then((user) => {
        if (!mounted) return;
        setUserMusicStyles(user && Array.isArray(user.musicStyles) ? user.musicStyles : []);
      });
      getSelectedEvents().then((list) => {
        if (!mounted) return;
        setScheduledVenueIds(new Set(list.map((e) => e.eventId)));
      });
      void refreshCurtidasBadge();
      return () => {
        mounted = false;
      };
    }, [refreshCurtidasBadge])
  );

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        router.dismissTo('/(tabs)/explore');
        return true;
      });
      return () => sub.remove();
    }, [])
  );

  const recommendedVenues = useMemo(() => {
    const matched = venuesMatchingUserMusicStyles(userMusicStyles);
    const filtered = matched.filter((v) => !scheduledVenueIds.has(v.id));
    const scored = filtered.map((v) => ({
      v,
      score: v.topMusicStyles.filter((m) => userMusicStyles.includes(m)).length,
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.map((s) => s.v).slice(0, 16);
  }, [userMusicStyles, scheduledVenueIds]);

  const filteredEvents = WEEK_EVENTS.filter((event) => {
    const matchSearch = !search.trim() || event.name.toLowerCase().includes(search.trim().toLowerCase());
    const matchType = eventTypeFilter === 'todos' || event.type === eventTypeFilter;
    return matchSearch && matchType;
  });

  function handleBack() {
    router.dismissTo('/(tabs)/explore');
  }

  function handleSelectEvent(id: string) {
    router.push({ pathname: '/(tabs)/event-detail', params: { id } });
  }

  function selectFilter(value: EventTypeFilter) {
    setEventTypeFilter(value);
    setDropdownVisible(false);
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} hitSlop={12}>
          <View style={styles.backCircle}>
            <MaterialIcons name="arrow-back" size={22} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.logoCircleOuter}>
            <View style={styles.logoCircleInner} />
          </View>
          <Text style={styles.brand}>Orbitt</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <MaterialIcons name="search" size={22} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar eventos"
          placeholderTextColor="#9CA3AF"
          style={styles.searchInput}
        />
      </View>

      {/* Filter Bar/Balada - dropdown */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setDropdownVisible(true)}
        activeOpacity={0.8}>
        <Text style={styles.filterButtonText}>{FILTER_LABELS[eventTypeFilter]}</Text>
        <MaterialIcons name="keyboard-arrow-down" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal visible={dropdownVisible} transparent animationType="fade">
        <Pressable style={styles.dropdownOverlay} onPress={() => setDropdownVisible(false)}>
          <TouchableWithoutFeedback>
            <View style={styles.dropdownBox}>
            <Text style={styles.dropdownTitle}>Tipo de evento</Text>
            {(['todos', 'bar', 'balada'] as const).map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.dropdownOption, eventTypeFilter === opt && styles.dropdownOptionActive]}
                onPress={() => selectFilter(opt)}>
                <Text style={[styles.dropdownOptionText, eventTypeFilter === opt && styles.dropdownOptionTextActive]}>
                  {FILTER_LABELS[opt]}
                </Text>
                {eventTypeFilter === opt && (
                  <MaterialIcons name="check" size={22} color={ORANGE} />
                )}
              </TouchableOpacity>
            ))}
            </View>
          </TouchableWithoutFeedback>
        </Pressable>
      </Modal>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.recSectionTitle}>Recomendados para você</Text>
        <Text style={styles.recSectionSubtitle}>
          Locais no catálogo que combinam com os estilos musicais do seu cadastro (toque para ver detalhes e
          programar).
        </Text>
        {userMusicStyles.length === 0 ? (
          <Text style={styles.recHintText}>
            Adicione estilos musicais no seu perfil para ver sugestões personalizadas aqui.
          </Text>
        ) : recommendedVenues.length === 0 ? (
          <Text style={styles.recHintText}>
            Não há mais locais que combinem com seu gosto neste catálogo, ou você já os programou.
          </Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recRow}
            style={styles.recHorizontal}>
            {recommendedVenues.map((v) => (
              <TouchableOpacity
                key={v.id}
                style={styles.recCard}
                onPress={() => handleSelectEvent(v.id)}
                activeOpacity={0.85}>
                <Text style={styles.recCardName} numberOfLines={2}>
                  {v.name}
                </Text>
                <Text style={styles.recCardMeta}>{v.type === 'balada' ? 'Balada' : 'Bar'}</Text>
                <View style={styles.recCardTags}>
                  {v.topMusicStyles.map((sid) => (
                    <View key={sid} style={styles.recTagChip}>
                      <Text style={styles.recTagChipText}>{getMusicStyleLabel(sid)}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <Text style={[styles.sectionTitle, styles.sectionTitleAfterRec]}>Eventos da semana</Text>

        {filteredEvents.length === 0 ? (
          <Text style={styles.emptyFilter}>
            Nenhum evento encontrado. Tente outro filtro ou busca.
          </Text>
        ) : (
          <View style={styles.grid}>
            {filteredEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={[
                  styles.card,
                  event.style === 'badge' && styles.cardBadge,
                  event.style === 'gradient' && styles.cardGradient,
                  event.style === 'gold' && styles.cardGold,
                ]}
                onPress={() => handleSelectEvent(event.id)}
                activeOpacity={0.85}>
                <Text
                  style={[
                    styles.cardText,
                    event.style === 'badge' && styles.cardTextBadge,
                    event.style === 'gradient' && styles.cardTextGradient,
                    event.style === 'gold' && styles.cardTextGold,
                  ]}
                  numberOfLines={2}>
                  {event.name}
                </Text>
                <View style={styles.cardStylesRow}>
                  {event.topMusicStyles.slice(0, 2).map((sid) => (
                    <Text
                      key={sid}
                      style={[
                        styles.cardStyleLabel,
                        event.style === 'gradient' && styles.cardStyleLabelGradient,
                        event.style === 'gold' && styles.cardStyleLabelGold,
                      ]}
                      numberOfLines={1}>
                      {getMusicStyleLabel(sid)}
                    </Text>
                  ))}
                </View>
                {event.style === 'badge' && (
                  <Text style={styles.cardStars}>★★★</Text>
                )}
                {event.style === 'gold' && (
                  <MaterialIcons name="star" size={16} color="#D4AF37" style={styles.cardCrown} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#F3F4F6',
  },
  backButton: {
    padding: 4,
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    pointerEvents: 'none',
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
    borderWidth: 2,
    borderColor: ORANGE,
  },
  brand: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  headerRight: {
    width: 48,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#000000',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: FILTER_BG,
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  filterButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dropdownBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 220,
  },
  dropdownTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dropdownOptionActive: {
    backgroundColor: '#FFF7ED',
  },
  dropdownOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  dropdownOptionTextActive: {
    fontWeight: '700',
    color: ORANGE,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  recSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 6,
  },
  recSectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 14,
  },
  recHintText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 20,
  },
  recHorizontal: {
    marginHorizontal: -20,
    marginBottom: 8,
  },
  recRow: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 10,
  },
  recCard: {
    width: 168,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 12,
    backgroundColor: '#FAFAFA',
  },
  recCardName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  recCardMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  recCardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  recTagChip: {
    backgroundColor: 'rgba(255,122,42,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  recTagChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: ORANGE,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  sectionTitleAfterRec: {
    marginTop: 12,
  },
  emptyFilter: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '31%',
    aspectRatio: 0.95,
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBadge: {
    backgroundColor: '#000000',
  },
  cardGradient: {
    backgroundColor: '#1F2937',
  },
  cardGold: {
    backgroundColor: '#1C1917',
  },
  cardText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  cardTextBadge: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  cardTextGradient: {
    color: '#F97316',
    fontSize: 10,
  },
  cardTextGold: {
    color: '#D4AF37',
    fontSize: 9,
    fontStyle: 'italic',
  },
  cardStars: {
    fontSize: 8,
    color: '#FFFFFF',
    marginTop: 4,
  },
  cardCrown: {
    position: 'absolute',
    top: 6,
  },
  cardStylesRow: {
    marginTop: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 3,
    maxWidth: '100%',
  },
  cardStyleLabel: {
    fontSize: 7,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
  },
  cardStyleLabelGradient: {
    color: 'rgba(249,115,22,0.95)',
  },
  cardStyleLabelGold: {
    color: 'rgba(212,175,55,0.95)',
  },
});
