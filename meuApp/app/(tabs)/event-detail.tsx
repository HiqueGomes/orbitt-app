import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Linking,
  BackHandler,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { addSelectedEvents, getSelectedEvents } from '@/lib/event-storage';

const ORANGE = '#FF7A2A';

interface DaySchedule {
  day: string;
  time: string;
  performer: string;
}

interface VenueDetail {
  name: string;
  logoText: string;
  address: string;
  website: string;
  schedule: DaySchedule[];
}

const VENUE_DETAILS: Record<string, VenueDetail> = {
  '1': {
    name: 'Beco do Espeto',
    logoText: 'BECO ESPETO',
    address: 'R. Soares de Barros, 80 - Itaim Bibi, São Paulo - SP, 04538-060',
    website: 'obecodoespeto',
    schedule: [
      { day: 'Quarta-feira', time: '17:00 - 00:00', performer: 'DJ BLAKES' },
      { day: 'Quinta-feira', time: '17:00 - 01:00', performer: 'DJ GBR' },
      { day: 'Sexta-feira', time: '17:00 - 02:00', performer: 'PEDRO SAMPAIO' },
      { day: 'Sábado', time: '17:00 - 02:00', performer: 'DJ Pedrinho' },
      { day: 'Domingo', time: '16:00 - 00:00', performer: 'DJ Resident' },
    ],
  },
  '2': {
    name: 'VILAK',
    logoText: 'VILAK',
    address: 'Endereço do local - São Paulo, SP',
    website: 'vilak',
    schedule: [
      { day: 'Sexta-feira', time: '22:00 - 04:00', performer: 'Atração 1' },
      { day: 'Sábado', time: '22:00 - 04:00', performer: 'Atração 2' },
    ],
  },
  '3': {
    name: 'GALERIA BAR',
    logoText: 'GALERIA',
    address: 'Endereço do local - São Paulo, SP',
    website: 'galeriabar',
    schedule: [
      { day: 'Quinta-feira', time: '19:00 - 02:00', performer: 'Live' },
      { day: 'Sexta-feira', time: '19:00 - 03:00', performer: 'DJ' },
      { day: 'Sábado', time: '19:00 - 03:00', performer: 'DJ' },
    ],
  },
  '4': {
    name: 'MAHAU',
    logoText: 'MAHAU',
    address: 'Endereço do local - São Paulo, SP',
    website: 'mahau',
    schedule: [
      { day: 'Sexta-feira', time: '21:00 - 03:00', performer: 'Atração' },
      { day: 'Sábado', time: '21:00 - 03:00', performer: 'Atração' },
    ],
  },
  '5': {
    name: 'AMATA',
    logoText: 'AMATA',
    address: 'Endereço do local - São Paulo, SP',
    website: 'amata',
    schedule: [
      { day: 'Sexta-feira', time: '20:00 - 02:00', performer: 'Atração' },
      { day: 'Sábado', time: '20:00 - 02:00', performer: 'Atração' },
    ],
  },
  '6': {
    name: 'VITRINNI Lounge Beer',
    logoText: 'VITRINNI',
    address: 'Endereço do local - São Paulo, SP',
    website: 'vitrinni',
    schedule: [
      { day: 'Quinta-feira', time: '18:00 - 00:00', performer: 'Happy hour' },
      { day: 'Sexta-feira', time: '18:00 - 02:00', performer: 'DJ' },
      { day: 'Sábado', time: '18:00 - 02:00', performer: 'DJ' },
    ],
  },
  '7': {
    name: 'D-Edge',
    logoText: 'D-EDGE',
    address: 'Al. Campinas, 684 - Jardins, São Paulo - SP',
    website: 'dedge',
    schedule: [
      { day: 'Quinta-feira', time: '23:00 - 06:00', performer: 'Techno Night' },
      { day: 'Sexta-feira', time: '23:00 - 07:00', performer: 'DJ Resident' },
      { day: 'Sábado', time: '23:00 - 08:00', performer: 'Line-up especial' },
    ],
  },
  '8': {
    name: 'Skye',
    logoText: 'SKYE',
    address: 'Av. Brigadeiro Luís Antônio, 4700 - Jardim Paulista, São Paulo - SP',
    website: 'skyebar',
    schedule: [
      { day: 'Quarta-feira', time: '18:00 - 02:00', performer: 'Sunset Session' },
      { day: 'Sexta-feira', time: '18:00 - 03:00', performer: 'Rooftop Party' },
      { day: 'Sábado', time: '18:00 - 03:00', performer: 'DJ ao vivo' },
    ],
  },
  '9': {
    name: 'Beco 203',
    logoText: 'BECO 203',
    address: 'R. da Consolação, 203 - Consolação, São Paulo - SP',
    website: 'beco203',
    schedule: [
      { day: 'Quinta-feira', time: '20:00 - 02:00', performer: 'Samba & Chorinho' },
      { day: 'Sexta-feira', time: '20:00 - 03:00', performer: 'Live music' },
      { day: 'Sábado', time: '20:00 - 03:00', performer: 'Banda ao vivo' },
    ],
  },
  '10': {
    name: 'Blitz Haus',
    logoText: 'BLITZ',
    address: 'R. Barão de Itapetininga, 68 - República, São Paulo - SP',
    website: 'blitzhaus',
    schedule: [
      { day: 'Quinta-feira', time: '22:00 - 04:00', performer: 'Indie & Rock' },
      { day: 'Sexta-feira', time: '22:00 - 05:00', performer: 'Line-up surpresa' },
      { day: 'Sábado', time: '22:00 - 05:00', performer: 'DJ + Live' },
    ],
  },
  '11': {
    name: 'Selvagem',
    logoText: 'SELVAGEM',
    address: 'Av. Brasil, 1.641 - Jardim América, São Paulo - SP',
    website: 'selvagem',
    schedule: [
      { day: 'Sexta-feira', time: '23:00 - 06:00', performer: 'Baile Selvagem' },
      { day: 'Sábado', time: '23:00 - 07:00', performer: 'Festival de música' },
    ],
  },
  '12': {
    name: 'Ó do Borogodó',
    logoText: 'BOROGODÓ',
    address: 'R. Horácio Lane, 21 - Pinheiros, São Paulo - SP',
    website: 'odoroborogodo',
    schedule: [
      { day: 'Quinta-feira', time: '20:00 - 02:00', performer: 'Samba raiz' },
      { day: 'Sexta-feira', time: '20:00 - 03:00', performer: 'Roda de samba' },
      { day: 'Sábado', time: '20:00 - 03:00', performer: 'Samba ao vivo' },
    ],
  },
  '13': {
    name: 'Trackers',
    logoText: 'TRACKERS',
    address: 'R. dos Pinheiros, 913 - Pinheiros, São Paulo - SP',
    website: 'trackers',
    schedule: [
      { day: 'Quarta-feira', time: '19:00 - 01:00', performer: 'Trivia Night' },
      { day: 'Quinta-feira', time: '19:00 - 02:00', performer: 'Happy hour' },
      { day: 'Sexta-feira', time: '19:00 - 03:00', performer: 'DJ' },
      { day: 'Sábado', time: '19:00 - 03:00', performer: 'Festa' },
    ],
  },
  '14': {
    name: 'All Black',
    logoText: 'ALL BLACK',
    address: 'R. Oscar Freire, 163 - Jardins, São Paulo - SP',
    website: 'allblack',
    schedule: [
      { day: 'Quinta-feira', time: '21:00 - 03:00', performer: 'Black music' },
      { day: 'Sexta-feira', time: '22:00 - 05:00', performer: 'R&B & Hip-hop' },
      { day: 'Sábado', time: '22:00 - 05:00', performer: 'Noite especial' },
    ],
  },
  '15': {
    name: 'Canto da Ema',
    logoText: 'C. EMA',
    address: 'R. Agostinho Gomes, 1.344 - Pinheiros, São Paulo - SP',
    website: 'cantodaema',
    schedule: [
      { day: 'Quinta-feira', time: '20:00 - 02:00', performer: 'Forró pé de serra' },
      { day: 'Sexta-feira', time: '20:00 - 03:00', performer: 'Forró ao vivo' },
      { day: 'Sábado', time: '20:00 - 03:00', performer: 'Triângulo do forró' },
    ],
  },
  '16': {
    name: 'Veloso',
    logoText: 'VELOSO',
    address: 'R. Conceição Veloso, 84 - Vila Mariana, São Paulo - SP',
    website: 'veloso',
    schedule: [
      { day: 'Quarta-feira', time: '18:00 - 00:00', performer: 'Happy hour' },
      { day: 'Quinta-feira', time: '18:00 - 01:00', performer: 'DJ' },
      { day: 'Sexta-feira', time: '18:00 - 02:00', performer: 'Festa' },
      { day: 'Sábado', time: '18:00 - 02:00', performer: 'Música ao vivo' },
    ],
  },
  '17': {
    name: 'Lions Nightclub',
    logoText: 'LIONS',
    address: 'R. Oscar Freire, 1.206 - Jardins, São Paulo - SP',
    website: 'lions',
    schedule: [
      { day: 'Sexta-feira', time: '23:00 - 06:00', performer: 'Eletrônica' },
      { day: 'Sábado', time: '23:00 - 07:00', performer: 'Line-up especial' },
    ],
  },
  '18': {
    name: 'Bourbon Street',
    logoText: 'BOURBON',
    address: 'R. dos Pinheiros, 258 - Pinheiros, São Paulo - SP',
    website: 'bourbonstreet',
    schedule: [
      { day: 'Terça-feira', time: '20:00 - 02:00', performer: 'Jazz ao vivo' },
      { day: 'Quarta-feira', time: '20:00 - 02:00', performer: 'Blues' },
      { day: 'Sexta-feira', time: '20:00 - 03:00', performer: 'Live session' },
      { day: 'Sábado', time: '20:00 - 03:00', performer: 'Jazz & Soul' },
    ],
  },
  '19': {
    name: 'The Week',
    logoText: 'THE WEEK',
    address: 'R. Guaipá, 463 - Vila Leopoldina, São Paulo - SP',
    website: 'theweek',
    schedule: [
      { day: 'Sexta-feira', time: '23:00 - 07:00', performer: 'Main room' },
      { day: 'Sábado', time: '23:00 - 08:00', performer: 'Festival' },
    ],
  },
  '20': {
    name: 'Astor',
    logoText: 'ASTOR',
    address: 'R. Doutor Melo Alves, 463 - Jardins, São Paulo - SP',
    website: 'astor',
    schedule: [
      { day: 'Segunda-feira', time: '18:00 - 00:00', performer: 'Happy hour' },
      { day: 'Quinta-feira', time: '18:00 - 02:00', performer: 'DJ' },
      { day: 'Sexta-feira', time: '18:00 - 03:00', performer: 'Festa' },
      { day: 'Sábado', time: '18:00 - 03:00', performer: 'Noite especial' },
    ],
  },
  '21': {
    name: 'Mamba Negra',
    logoText: 'MAMBA',
    address: 'Av. Auro Soares de Moura Andrade, 1.126 - Barra Funda, São Paulo - SP',
    website: 'mambanegra',
    schedule: [
      { day: 'Sexta-feira', time: '23:00 - 06:00', performer: 'Techno & House' },
      { day: 'Sábado', time: '23:00 - 08:00', performer: 'Line-up internacional' },
    ],
  },
  '22': {
    name: 'Bar do Zé',
    logoText: 'BAR ZÉ',
    address: 'R. Aspicuelta, 662 - Vila Madalena, São Paulo - SP',
    website: 'bardoze',
    schedule: [
      { day: 'Quarta-feira', time: '19:00 - 01:00', performer: 'Samba' },
      { day: 'Quinta-feira', time: '19:00 - 02:00', performer: 'Chorinho' },
      { day: 'Sexta-feira', time: '19:00 - 03:00', performer: 'Live' },
      { day: 'Sábado', time: '19:00 - 03:00', performer: 'Música ao vivo' },
    ],
  },
  '23': {
    name: 'Club Noir',
    logoText: 'NOIR',
    address: 'R. Bela Cintra, 2.163 - Jardins, São Paulo - SP',
    website: 'clubnoir',
    schedule: [
      { day: 'Quinta-feira', time: '22:00 - 04:00', performer: 'Black music' },
      { day: 'Sexta-feira', time: '23:00 - 06:00', performer: 'R&B & Hip-hop' },
      { day: 'Sábado', time: '23:00 - 06:00', performer: 'Noite especial' },
    ],
  },
  '24': {
    name: 'Empório Alto de Pinheiros',
    logoText: 'EMPÓRIO',
    address: 'R. dos Pinheiros, 1.084 - Pinheiros, São Paulo - SP',
    website: 'emporioalto',
    schedule: [
      { day: 'Quinta-feira', time: '19:00 - 01:00', performer: 'Happy hour' },
      { day: 'Sexta-feira', time: '19:00 - 02:00', performer: 'DJ' },
      { day: 'Sábado', time: '19:00 - 02:00', performer: 'Festa' },
    ],
  },
  '25': {
    name: 'JazzB',
    logoText: 'JAZZB',
    address: 'R. Fidalga, 267 - Vila Madalena, São Paulo - SP',
    website: 'jazzb',
    schedule: [
      { day: 'Quarta-feira', time: '20:00 - 02:00', performer: 'Jazz ao vivo' },
      { day: 'Sexta-feira', time: '20:00 - 03:00', performer: 'Jam session' },
      { day: 'Sábado', time: '20:00 - 03:00', performer: 'Live jazz' },
    ],
  },
  '26': {
    name: 'View Rooftop',
    logoText: 'VIEW',
    address: 'R. Funchal, 418 - Vila Olímpia, São Paulo - SP',
    website: 'viewrooftop',
    schedule: [
      { day: 'Quarta-feira', time: '18:00 - 02:00', performer: 'Sunset' },
      { day: 'Sexta-feira', time: '18:00 - 03:00', performer: 'Rooftop party' },
      { day: 'Sábado', time: '18:00 - 03:00', performer: 'DJ' },
    ],
  },
  '27': {
    name: 'Casa da Luz',
    logoText: 'C. LUZ',
    address: 'R. Consolação, 2.983 - Consolação, São Paulo - SP',
    website: 'casadaluz',
    schedule: [
      { day: 'Sexta-feira', time: '23:00 - 06:00', performer: 'Eletrônica' },
      { day: 'Sábado', time: '23:00 - 07:00', performer: 'Techno' },
    ],
  },
  '28': {
    name: 'Bar dos Artesãos',
    logoText: 'ARTESÃOS',
    address: 'R. dos Artesãos, 186 - Vila Madalena, São Paulo - SP',
    website: 'bardoartesaos',
    schedule: [
      { day: 'Quinta-feira', time: '19:00 - 01:00', performer: 'Samba' },
      { day: 'Sexta-feira', time: '19:00 - 02:00', performer: 'Pagode' },
      { day: 'Sábado', time: '19:00 - 02:00', performer: 'Música ao vivo' },
    ],
  },
  '29': {
    name: 'Laroc Club',
    logoText: 'LAROC',
    address: 'R. da Consolação, 3.138 - Consolação, São Paulo - SP',
    website: 'laroc',
    schedule: [
      { day: 'Sexta-feira', time: '23:00 - 06:00', performer: 'Funk & Pop' },
      { day: 'Sábado', time: '23:00 - 07:00', performer: 'Festa' },
    ],
  },
  '30': {
    name: 'Boteco do Espanha',
    logoText: 'ESPANHA',
    address: 'R. dos Pinheiros, 694 - Pinheiros, São Paulo - SP',
    website: 'botecodoespanha',
    schedule: [
      { day: 'Quarta-feira', time: '18:00 - 00:00', performer: 'Happy hour' },
      { day: 'Quinta-feira', time: '18:00 - 01:00', performer: 'Samba' },
      { day: 'Sexta-feira', time: '18:00 - 02:00', performer: 'Live' },
      { day: 'Sábado', time: '18:00 - 02:00', performer: 'Música ao vivo' },
    ],
  },
};

const DEFAULT_VENUE: VenueDetail = {
  name: 'Evento',
  logoText: 'EVENTO',
  address: 'Endereço não informado',
  website: '',
  schedule: [],
};

export default function EventDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params.id ?? '1';
  const venue = VENUE_DETAILS[id] ?? { ...DEFAULT_VENUE, name: `Evento ${id}` };

  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set());

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      const schedule = venue.schedule;
      getSelectedEvents().then((list) => {
        if (!mounted) return;
        const savedForThisEvent = list.filter((e) => e.eventId === id);
        const savedDays = new Set(savedForThisEvent.map((e) => e.day));
        const indices = new Set<number>(
          schedule
            .map((s, i) => (savedDays.has(s.day) ? i : -1))
            .filter((i) => i >= 0)
        );
        setSelectedDays(indices);
      });
      return () => {
        mounted = false;
      };
    }, [id])
  );

  function handleBack() {
    setSelectedDays(new Set());
    router.replace('/(tabs)/explore');
  }

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setSelectedDays(new Set());
      router.replace('/(tabs)/explore');
      return true;
    });
    return () => sub.remove();
  }, [router]);

  async function handleSave() {
    const days = venue.schedule
      .filter((_, index) => selectedDays.has(index))
      .map((s) => s.day);
    if (days.length === 0) return;
    await addSelectedEvents(id, venue.name, days);
    router.replace('/(tabs)/explore');
  }

  function toggleDay(index: number) {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function handleWebsite() {
    if (venue.website) {
      Linking.openURL(`https://${venue.website}.com.br`).catch(() => {});
    }
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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Venue block */}
        <View style={styles.venueBlock}>
          <View style={styles.venueLogo}>
            <Text style={styles.venueLogoText}>{venue.logoText}</Text>
          </View>
          <View style={styles.venueInfo}>
            <Text style={styles.venueName}>{venue.name}</Text>
            <Text style={styles.address}>{venue.address}</Text>
            {venue.website ? (
              <TouchableOpacity onPress={handleWebsite} style={styles.websiteWrap}>
                <MaterialIcons name="link" size={14} color="#000000" />
                <Text style={styles.websiteText}>{venue.website}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Daily schedule */}
        {venue.schedule.length > 0 && (
          <View style={styles.scheduleSection}>
            {venue.schedule.map((item, index) => {
              const isSelected = selectedDays.has(index);
              return (
                <View key={index} style={styles.dayCard}>
                  <View style={styles.dayCardLeft}>
                    <Text style={styles.dayName}>{item.day}</Text>
                    <Text style={styles.dayTime}>{item.time}</Text>
                    <Text style={styles.performer}>{item.performer}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.addButton, isSelected && styles.addButtonSelected]}
                    onPress={() => toggleDay(index)}
                    activeOpacity={0.8}>
                    <MaterialIcons
                      name={isSelected ? 'check' : 'add'}
                      size={24}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {selectedDays.size > 0 && (
          <>
            <Text style={styles.selectedHint}>
              {selectedDays.size} dia(s) selecionado(s) para ir
            </Text>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.9}>
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </>
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
    paddingBottom: 16,
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  venueBlock: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  venueLogo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  venueLogoText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  venueInfo: {
    flex: 1,
  },
  venueName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 6,
  },
  address: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 6,
  },
  websiteWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  websiteText: {
    fontSize: 13,
    color: '#000000',
    textDecorationLine: 'underline',
  },
  scheduleSection: {
    gap: 12,
  },
  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: ORANGE,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dayCardLeft: {
    flex: 1,
  },
  dayName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 2,
  },
  dayTime: {
    fontSize: 13,
    color: '#1F2937',
    marginBottom: 2,
  },
  performer: {
    fontSize: 13,
    color: '#374151',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonSelected: {
    backgroundColor: '#166534',
  },
  selectedHint: {
    marginTop: 20,
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  saveButton: {
    marginTop: 16,
    alignSelf: 'stretch',
    backgroundColor: ORANGE,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
