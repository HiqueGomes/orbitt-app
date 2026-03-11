import { useState } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const ORANGE = '#FF7A2A';
const FILTER_BG = '#E88B5C';

export type EventTypeFilter = 'todos' | 'bar' | 'balada';

const WEEK_EVENTS: { id: string; name: string; style: string; type: 'bar' | 'balada' }[] = [
  { id: '1', name: 'Beco Espeto', style: 'badge', type: 'bar' },
  { id: '2', name: 'VILAK', style: 'simple', type: 'balada' },
  { id: '3', name: 'GALERIA BAR', style: 'gradient', type: 'bar' },
  { id: '4', name: 'MAHAU', style: 'simple', type: 'balada' },
  { id: '5', name: 'AMATA', style: 'simple', type: 'balada' },
  { id: '6', name: 'VITRINNI Lounge Beer', style: 'gold', type: 'bar' },
  { id: '7', name: 'D-Edge', style: 'gradient', type: 'balada' },
  { id: '8', name: 'Skye', style: 'gold', type: 'bar' },
  { id: '9', name: 'Beco 203', style: 'simple', type: 'bar' },
  { id: '10', name: 'Blitz Haus', style: 'badge', type: 'bar' },
  { id: '11', name: 'Selvagem', style: 'simple', type: 'balada' },
  { id: '12', name: 'Ó do Borogodó', style: 'gradient', type: 'bar' },
  { id: '13', name: 'Trackers', style: 'simple', type: 'bar' },
  { id: '14', name: 'All Black', style: 'badge', type: 'balada' },
  { id: '15', name: 'Canto da Ema', style: 'gold', type: 'bar' },
  { id: '16', name: 'Veloso', style: 'simple', type: 'bar' },
  { id: '17', name: 'Lions Nightclub', style: 'gradient', type: 'balada' },
  { id: '18', name: 'Bourbon Street', style: 'gold', type: 'bar' },
  { id: '19', name: 'The Week', style: 'badge', type: 'balada' },
  { id: '20', name: 'Astor', style: 'simple', type: 'bar' },
  { id: '21', name: 'Mamba Negra', style: 'gradient', type: 'balada' },
  { id: '22', name: 'Bar do Zé', style: 'simple', type: 'bar' },
  { id: '23', name: 'Club Noir', style: 'badge', type: 'balada' },
  { id: '24', name: 'Empório Alto de Pinheiros', style: 'gold', type: 'bar' },
  { id: '25', name: 'JazzB', style: 'simple', type: 'bar' },
  { id: '26', name: 'View Rooftop', style: 'gradient', type: 'bar' },
  { id: '27', name: 'Casa da Luz', style: 'simple', type: 'balada' },
  { id: '28', name: 'Bar dos Artesãos', style: 'gold', type: 'bar' },
  { id: '29', name: 'Laroc Club', style: 'badge', type: 'balada' },
  { id: '30', name: 'Boteco do Espanha', style: 'simple', type: 'bar' },
];

const FILTER_LABELS: Record<EventTypeFilter, string> = {
  todos: 'Todos',
  bar: 'Bar',
  balada: 'Balada',
};

export default function ScheduledEventsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<EventTypeFilter>('todos');
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const filteredEvents = WEEK_EVENTS.filter((event) => {
    const matchSearch = !search.trim() || event.name.toLowerCase().includes(search.trim().toLowerCase());
    const matchType = eventTypeFilter === 'todos' || event.type === eventTypeFilter;
    return matchSearch && matchType;
  });

  function handleBack() {
    router.replace('/(tabs)/explore');
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
        <Text style={styles.sectionTitle}>Eventos da semana</Text>

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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
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
});
