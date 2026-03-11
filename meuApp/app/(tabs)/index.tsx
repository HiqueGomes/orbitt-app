import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Modal,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { getSelectedEvents, getShortDay, type SelectedEventEntry } from '@/lib/event-storage';
import { addMatch } from '@/lib/match-storage';
import { getCurrentUser } from '@/lib/auth-storage';
import {
  getNotifications,
  markAllNotificationsRead,
  hasUnreadNotifications,
  type AppNotification,
} from '@/lib/notification-storage';
import { NotificationsModal } from '@/components/NotificationsModal';

const ORANGE = '#FF7A2A';
const SWIPE_THRESHOLD = 60;
const SWIPE_OUT = Dimensions.get('window').width * 0.8;
const SCREEN_WIDTH = Dimensions.get('window').width;
const CIRCLE_OUTER = SCREEN_WIDTH + 80;
const CIRCLE_INNER = CIRCLE_OUTER * 0.52;

interface DiscoverProfile {
  id: string;
  name: string;
  age: number;
  photoUri: string | null;
  /** Lista de fotos do perfil (galeria). Se vazio ou ausente, mostra placeholder. */
  photos?: string[];
  events: { venueName: string; day: string }[];
  aboutMe?: string;
  interests?: string[];
  favoritePlaces?: string[];
}

const MOCK_PROFILES: DiscoverProfile[] = [
  {
    id: '1',
    name: 'Mariana',
    age: 21,
    photoUri: null,
    events: [
      { venueName: 'Galleria Bar', day: 'Quinta' },
      { venueName: 'Beco do Espeto', day: 'Sexta' },
    ],
    aboutMe:
      '21 aninhos e a vida só tá começando! Amo um bom rolé com os amigos, seja pra curtir um festival, explorar novos bares ou simplesmente bater papo e rir muito. Mas não vivo só de balada, viu? Também adoro me conectar com a natureza, ler um bom livro e descobrir novas séries. A vida é uma festa, e eu quero dançar até o sol nascer!',
    interests: ['Música', 'Moda', 'Séries', 'Filmes', 'Academia', 'Medicina', 'Games', 'Estudos', 'Noite', 'Festas'],
    favoritePlaces: ['VILAK', 'Beco do Espeto', 'AMATA'],
  },
  {
    id: '2',
    name: 'Letícia',
    age: 24,
    photoUri: null,
    events: [
      { venueName: 'Beco do Espeto', day: 'Sexta' },
      { venueName: 'VILAK', day: 'Sábado' },
    ],
    aboutMe: 'Adoro sair nos fins de semana e conhecer gente nova. Curto muito música eletrônica e um bom ambiente.',
    interests: ['Música', 'Dança', 'Viagens', 'Fotos', 'Yoga'],
    favoritePlaces: ['VILAK', 'Beco do Espeto'],
  },
  {
    id: '3',
    name: 'Ana',
    age: 22,
    photoUri: null,
    events: [{ venueName: 'Galleria Bar', day: 'Quinta' }],
    aboutMe: 'Vibes boas e rolês descontraídos. Amo dançar e fazer novas amizades.',
    interests: ['Dança', 'Música', 'Festas', 'Café'],
    favoritePlaces: ['GALERIA BAR'],
  },
  {
    id: '4',
    name: 'Beatriz',
    age: 26,
    photoUri: null,
    events: [
      { venueName: 'VILAK', day: 'Sábado' },
      { venueName: 'AMATA', day: 'Sexta' },
    ],
    aboutMe: 'Fã de música ao vivo e barzinho. Sempre disposta a conhecer gente nova e trocar ideia.',
    interests: ['Música', 'Cinema', 'Cerveja', 'Viagens'],
    favoritePlaces: ['VILAK', 'Beco do Espeto', 'AMATA'],
  },
  {
    id: '5',
    name: 'Julia',
    age: 23,
    photoUri: null,
    events: [
      { venueName: 'Beco do Espeto', day: 'Sexta' },
      { venueName: 'Galleria Bar', day: 'Sábado' },
    ],
    aboutMe: 'Adoro uma festa e um bom ambiente. Curto desde samba até eletrônica.',
    interests: ['Música', 'Dança', 'Fotografia', 'Viagens', 'Amigos'],
    favoritePlaces: ['Beco do Espeto', 'GALERIA BAR'],
  },
  {
    id: '6',
    name: 'Rafaela',
    age: 25,
    photoUri: null,
    events: [{ venueName: 'VILAK', day: 'Sábado' }],
    aboutMe: 'Noite, música e bons papos. Sempre de boa pra um rolê diferente.',
    interests: ['Eletrônica', 'Games', 'Café', 'Séries'],
    favoritePlaces: ['VILAK', 'AMATA'],
  },
  {
    id: '7',
    name: 'Camila',
    age: 21,
    photoUri: null,
    events: [
      { venueName: 'Galleria Bar', day: 'Quinta' },
      { venueName: 'Beco do Espeto', day: 'Sexta' },
    ],
    aboutMe: 'Vida é curta pra ficar em casa. Amo sair, dançar e rir com os amigos.',
    interests: ['Moda', 'Música', 'Festas', 'Fotos', 'Praia'],
    favoritePlaces: ['GALERIA BAR', 'Beco do Espeto'],
  },
  {
    id: '8',
    name: 'Bruna',
    age: 27,
    photoUri: null,
    events: [
      { venueName: 'AMATA', day: 'Sexta' },
      { venueName: 'VILAK', day: 'Sábado' },
    ],
    aboutMe: 'Trabalho duro, curto mais. Adoro um happy hour e um after.',
    interests: ['Negócios', 'Música', 'Viagens', 'Gastronomia'],
    favoritePlaces: ['AMATA', 'VILAK'],
  },
  {
    id: '9',
    name: 'Larissa',
    age: 20,
    photoUri: null,
    events: [{ venueName: 'Beco do Espeto', day: 'Sexta' }],
    aboutMe: 'Explorando a noite de SP. Amo conhecer lugares novos e pessoas legais.',
    interests: ['Música', 'Cinema', 'Livros', 'Festas'],
    favoritePlaces: ['Beco do Espeto', 'Galleria Bar'],
  },
  {
    id: '10',
    name: 'Fernanda',
    age: 28,
    photoUri: null,
    events: [
      { venueName: 'VILAK', day: 'Sexta' },
      { venueName: 'Beco do Espeto', day: 'Sábado' },
    ],
    aboutMe: 'DJ nas horas vagas. Curto eletrônica, house e um bom ambiente.',
    interests: ['Música', 'Produção', 'Festas', 'Tecnologia'],
    favoritePlaces: ['VILAK', 'Beco do Espeto', 'AMATA'],
  },
  {
    id: '11',
    name: 'Isabela',
    age: 22,
    photoUri: null,
    events: [
      { venueName: 'GALERIA BAR', day: 'Quinta' },
      { venueName: 'VILAK', day: 'Sexta' },
    ],
    aboutMe: 'Amo noite, amigos e uma boa playlist. Sempre animada para um novo rolê.',
    interests: ['Música', 'Moda', 'Festas', 'Fotografia'],
    favoritePlaces: ['GALERIA BAR', 'VILAK'],
  },
  {
    id: '12',
    name: 'Carolina',
    age: 24,
    photoUri: null,
    events: [{ venueName: 'Beco do Espeto', day: 'Sábado' }],
    aboutMe: 'Carioca de coração, paulista de adoption. Curto samba, forró e um bom chopp.',
    interests: ['Samba', 'Praia', 'Música', 'Amigos'],
    favoritePlaces: ['Beco do Espeto', 'AMATA'],
  },
  {
    id: '13',
    name: 'Amanda',
    age: 23,
    photoUri: null,
    events: [
      { venueName: 'AMATA', day: 'Sexta' },
      { venueName: 'GALERIA BAR', day: 'Sábado' },
    ],
    aboutMe: 'Vibes positivas sempre. Amo conhecer pessoas e lugares novos.',
    interests: ['Yoga', 'Música', 'Natureza', 'Festas'],
    favoritePlaces: ['AMATA', 'GALERIA BAR'],
  },
  {
    id: '14',
    name: 'Gabriela',
    age: 21,
    photoUri: null,
    events: [{ venueName: 'VILAK', day: 'Sábado' }],
    aboutMe: 'Estudante de design que não perde uma festa. Amo arte e música ao vivo.',
    interests: ['Arte', 'Design', 'Música', 'Festas', 'Café'],
    favoritePlaces: ['VILAK', 'Beco do Espeto'],
  },
  {
    id: '15',
    name: 'Natália',
    age: 26,
    photoUri: null,
    events: [
      { venueName: 'Beco do Espeto', day: 'Sexta' },
      { venueName: 'VILAK', day: 'Sábado' },
    ],
    aboutMe: 'Profissional que sabe equilibrar trabalho e diversão. Adoro um after no fim da semana.',
    interests: ['Viagens', 'Música', 'Gastronomia', 'Wine'],
    favoritePlaces: ['Beco do Espeto', 'VILAK', 'AMATA'],
  },
  {
    id: '16',
    name: 'Patrícia',
    age: 25,
    photoUri: null,
    events: [{ venueName: 'GALERIA BAR', day: 'Quinta' }],
    aboutMe: 'Amo dançar até o sol nascer. Eletrônica, house e techno são minha vibe.',
    interests: ['Eletrônica', 'Dança', 'Festas', 'Fotografia'],
    favoritePlaces: ['GALERIA BAR', 'VILAK'],
  },
  {
    id: '17',
    name: 'Renata',
    age: 29,
    photoUri: null,
    events: [
      { venueName: 'AMATA', day: 'Sexta' },
      { venueName: 'Beco do Espeto', day: 'Sábado' },
    ],
    aboutMe: 'Vida é curta demais para noites sem música. Sempre de boa para um rolê.',
    interests: ['Música', 'Cerveja', 'Amigos', 'Viagens'],
    favoritePlaces: ['AMATA', 'Beco do Espeto'],
  },
  {
    id: '18',
    name: 'Thaís',
    age: 20,
    photoUri: null,
    events: [{ venueName: 'VILAK', day: 'Sexta' }],
    aboutMe: 'Recém chegada na noite de SP e amando cada segundo. Curto de tudo um pouco.',
    interests: ['Música', 'Moda', 'Festas', 'Séries'],
    favoritePlaces: ['VILAK', 'GALERIA BAR'],
  },
  {
    id: '19',
    name: 'Vanessa',
    age: 27,
    photoUri: null,
    events: [
      { venueName: 'GALERIA BAR', day: 'Quinta' },
      { venueName: 'AMATA', day: 'Sexta' },
    ],
    aboutMe: 'Publicitária que vive de cultura e noite. Amo eventos, exposições e uma boa festa.',
    interests: ['Arte', 'Música', 'Eventos', 'Gastronomia'],
    favoritePlaces: ['GALERIA BAR', 'AMATA', 'VILAK'],
  },
  {
    id: '20',
    name: 'Daniela',
    age: 24,
    photoUri: null,
    events: [
      { venueName: 'Beco do Espeto', day: 'Sexta' },
      { venueName: 'GALERIA BAR', day: 'Sábado' },
    ],
    aboutMe: 'Amo um happy hour que vira noite. Bons drinks, boa música e gente legal.',
    interests: ['Cocktails', 'Música', 'Dança', 'Viagens'],
    favoritePlaces: ['Beco do Espeto', 'GALERIA BAR', 'AMATA'],
  },
  {
    id: '21',
    name: 'Priscila',
    age: 23,
    photoUri: null,
    events: [
      { venueName: 'D-Edge', day: 'Sexta' },
      { venueName: 'Skye', day: 'Sábado' },
    ],
    aboutMe: 'Vibe eletrônica e rooftop. Amo techno e uma vista boa com drink na mão.',
    interests: ['Techno', 'Rooftop', 'Música', 'Fotografia'],
    favoritePlaces: ['D-Edge', 'Skye', 'Mamba Negra'],
  },
  {
    id: '22',
    name: 'Aline',
    age: 25,
    photoUri: null,
    events: [
      { venueName: 'Beco 203', day: 'Sábado' },
      { venueName: 'Ó do Borogodó', day: 'Sexta' },
    ],
    aboutMe: 'Samba no pé e chorinho no coração. Paulista que vive de música brasileira.',
    interests: ['Samba', 'Chorinho', 'Música', 'Cerveja'],
    favoritePlaces: ['Beco 203', 'Ó do Borogodó', 'Bar do Zé'],
  },
  {
    id: '23',
    name: 'Bianca',
    age: 21,
    photoUri: null,
    events: [
      { venueName: 'Blitz Haus', day: 'Sexta' },
      { venueName: 'Selvagem', day: 'Sábado' },
    ],
    aboutMe: 'Indie, rock e festa. Sempre na frente do palco ou na pista.',
    interests: ['Rock', 'Indie', 'Festas', 'Live'],
    favoritePlaces: ['Blitz Haus', 'Selvagem', 'Trackers'],
  },
  {
    id: '24',
    name: 'Débora',
    age: 26,
    photoUri: null,
    events: [
      { venueName: 'All Black', day: 'Sexta' },
      { venueName: 'Lions Nightclub', day: 'Sábado' },
    ],
    aboutMe: 'R&B e hip-hop são minha alma. Adoro uma noite com boa música e gente animada.',
    interests: ['R&B', 'Hip-hop', 'Dança', 'Moda'],
    favoritePlaces: ['All Black', 'Lions Nightclub', 'Club Noir'],
  },
  {
    id: '25',
    name: 'Eduarda',
    age: 22,
    photoUri: null,
    events: [
      { venueName: 'Canto da Ema', day: 'Sexta' },
      { venueName: 'Bar do Zé', day: 'Sábado' },
    ],
    aboutMe: 'Forró e samba no fim de semana. Nordestina de coração em SP.',
    interests: ['Forró', 'Samba', 'Dança', 'Amigos'],
    favoritePlaces: ['Canto da Ema', 'Bar do Zé', 'Beco 203'],
  },
  {
    id: '26',
    name: 'Fabiana',
    age: 24,
    photoUri: null,
    events: [
      { venueName: 'Veloso', day: 'Quinta' },
      { venueName: 'Trackers', day: 'Sexta' },
    ],
    aboutMe: 'Happy hour que vira noite. Amo Pinheiros e um bom chopp com os amigos.',
    interests: ['Cerveja', 'Trivia', 'Música', 'Amigos'],
    favoritePlaces: ['Veloso', 'Trackers', 'Bourbon Street'],
  },
  {
    id: '27',
    name: 'Giovanna',
    age: 20,
    photoUri: null,
    events: [
      { venueName: 'The Week', day: 'Sábado' },
      { venueName: 'Mamba Negra', day: 'Sexta' },
    ],
    aboutMe: 'Festival e balada. Eletrônica e techno até o sol nascer.',
    interests: ['Eletrônica', 'Techno', 'Festivais', 'Festa'],
    favoritePlaces: ['The Week', 'Mamba Negra', 'D-Edge'],
  },
  {
    id: '28',
    name: 'Helena',
    age: 27,
    photoUri: null,
    events: [
      { venueName: 'Bourbon Street', day: 'Sexta' },
      { venueName: 'JazzB', day: 'Sábado' },
    ],
    aboutMe: 'Jazz e blues na veia. Noite boa é com música ao vivo e um drink.',
    interests: ['Jazz', 'Blues', 'Música ao vivo', 'Cocktails'],
    favoritePlaces: ['Bourbon Street', 'JazzB', 'Astor'],
  },
  {
    id: '29',
    name: 'Ivana',
    age: 23,
    photoUri: null,
    events: [
      { venueName: 'View Rooftop', day: 'Sexta' },
      { venueName: 'Skye', day: 'Sábado' },
    ],
    aboutMe: 'Rooftop e vista. Amo um pôr do sol com drink e boa companhia.',
    interests: ['Rooftop', 'Sunset', 'Fotos', 'Drinks'],
    favoritePlaces: ['View Rooftop', 'Skye', 'Astor'],
  },
  {
    id: '30',
    name: 'Juliana',
    age: 25,
    photoUri: null,
    events: [
      { venueName: 'Casa da Luz', day: 'Sábado' },
      { venueName: 'Laroc Club', day: 'Sexta' },
    ],
    aboutMe: 'Balada e funk. Noite é pra dançar e curtir com as amigas.',
    interests: ['Funk', 'Festa', 'Dança', 'Moda'],
    favoritePlaces: ['Casa da Luz', 'Laroc Club', 'Selvagem'],
  },
  {
    id: '31',
    name: 'Karina',
    age: 22,
    photoUri: null,
    events: [
      { venueName: 'Bar dos Artesãos', day: 'Sábado' },
      { venueName: 'Boteco do Espanha', day: 'Sexta' },
    ],
    aboutMe: 'Pagode e samba na Vila Madalena. Vida de bar e música ao vivo.',
    interests: ['Pagode', 'Samba', 'Bar', 'Amigos'],
    favoritePlaces: ['Bar dos Artesãos', 'Boteco do Espanha', 'Bar do Zé'],
  },
  {
    id: '32',
    name: 'Luciana',
    age: 28,
    photoUri: null,
    events: [
      { venueName: 'Astor', day: 'Quinta' },
      { venueName: 'Empório Alto de Pinheiros', day: 'Sexta' },
    ],
    aboutMe: 'Jardins e Pinheiros. Happy hour elegante e uma festa no fim de semana.',
    interests: ['Gastronomia', 'Drinks', 'Música', 'Viagens'],
    favoritePlaces: ['Astor', 'Empório Alto de Pinheiros', 'Skye'],
  },
  {
    id: '33',
    name: 'Michele',
    age: 21,
    photoUri: null,
    events: [
      { venueName: 'Club Noir', day: 'Sábado' },
      { venueName: 'VILAK', day: 'Sexta' },
    ],
    aboutMe: 'Black music e balada. R&B e hip-hop até de madrugada.',
    interests: ['R&B', 'Hip-hop', 'Dança', 'Festas'],
    favoritePlaces: ['Club Noir', 'VILAK', 'All Black'],
  },
  {
    id: '34',
    name: 'Nadia',
    age: 26,
    photoUri: null,
    events: [
      { venueName: 'MAHAU', day: 'Sexta' },
      { venueName: 'D-Edge', day: 'Sábado' },
    ],
    aboutMe: 'Eletrônica em todos os sentidos. Techno e house são minha terapia.',
    interests: ['Techno', 'House', 'Festas', 'Música'],
    favoritePlaces: ['MAHAU', 'D-Edge', 'Mamba Negra'],
  },
  {
    id: '35',
    name: 'Olívia',
    age: 24,
    photoUri: null,
    events: [
      { venueName: 'VITRINNI Lounge Beer', day: 'Quinta' },
      { venueName: 'Veloso', day: 'Sexta' },
    ],
    aboutMe: 'Cerveja boa e ambiente descontraído. Amo um lounge e um chopp gelado.',
    interests: ['Cerveja', 'Lounge', 'Amigos', 'Música'],
    favoritePlaces: ['VITRINNI Lounge Beer', 'Veloso', 'Trackers'],
  },
];

function buildUserEventKeys(selected: SelectedEventEntry[]): Set<string> {
  const set = new Set<string>();
  selected.forEach((e) => {
    const key = `${e.venueName.toLowerCase().trim()}|${getShortDay(e.day)}`;
    set.add(key);
  });
  return set;
}

function profileMatchesUserEvents(profile: DiscoverProfile, userKeys: Set<string>): boolean {
  return profile.events.some(
    (pe) => userKeys.has(`${pe.venueName.toLowerCase().trim()}|${pe.day}`)
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [selectedEvents, setSelectedEvents] = useState<SelectedEventEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const userEventKeys = useMemo(() => buildUserEventKeys(selectedEvents), [selectedEvents]);
  const filteredProfiles = useMemo(
    () => MOCK_PROFILES.filter((p) => profileMatchesUserEvents(p, userEventKeys)),
    [userEventKeys]
  );

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      getSelectedEvents().then((list) => {
        if (mounted) setSelectedEvents(list);
      });
      getCurrentUser().then((user) => {
        if (mounted && user) {
          getNotifications(user.id).then((list) => {
            if (mounted) setNotifications(list);
          });
        }
      });
      return () => {
        mounted = false;
      };
    }, [])
  );

  const hasEvents = selectedEvents.length > 0;
  const hasUnread = hasUnreadNotifications(notifications);

  useEffect(() => {
    if (currentIndex >= filteredProfiles.length && filteredProfiles.length > 0) {
      setCurrentIndex(filteredProfiles.length - 1);
    } else if (currentIndex >= filteredProfiles.length) {
      setCurrentIndex(0);
    }
  }, [filteredProfiles.length, currentIndex]);

  async function openNotifications() {
    const user = await getCurrentUser();
    if (user) {
      const list = await getNotifications(user.id);
      setNotifications(list);
      setShowNotifications(true);
      await markAllNotificationsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }

  function closeNotifications() {
    setShowNotifications(false);
  }

  const profile = filteredProfiles[currentIndex] ?? null;
  const [expandedProfile, setExpandedProfile] = useState<DiscoverProfile | null>(null);
  const [matchProfile, setMatchProfile] = useState<DiscoverProfile | null>(null);
  const [expandedPhotoIndex, setExpandedPhotoIndex] = useState(0);
  const expandedPhotoScrollRef = useRef<ScrollView>(null);
  const cardSlides = useMemo(
    () => (profile ? (profile.photos?.length ? profile.photos : [null, null, null]) : []),
    [profile]
  );
  const [cardPhotoIndexState, setCardPhotoIndexState] = useState(0);
  useEffect(() => {
    setCardPhotoIndexState(0);
  }, [currentIndex]);

  function cardPrevPhoto() {
    if (cardSlides.length <= 1) return;
    setCardPhotoIndexState((i) => Math.max(0, i - 1));
  }
  function cardNextPhoto() {
    if (cardSlides.length <= 1) return;
    setCardPhotoIndexState((i) => Math.min(cardSlides.length - 1, i + 1));
  }
  function expandedPrevPhoto() {
    const slides = expandedProfile?.photos?.length
      ? expandedProfile.photos!
      : [null, null, null];
    if (slides.length <= 1) return;
    const next = Math.max(0, expandedPhotoIndex - 1);
    setExpandedPhotoIndex(next);
    expandedPhotoScrollRef.current?.scrollTo({ x: next * (SCREEN_WIDTH - 40), animated: true });
  }
  function expandedNextPhoto() {
    const slides = expandedProfile?.photos?.length
      ? expandedProfile.photos!
      : [null, null, null];
    if (slides.length <= 1) return;
    const next = Math.min(slides.length - 1, expandedPhotoIndex + 1);
    setExpandedPhotoIndex(next);
    expandedPhotoScrollRef.current?.scrollTo({ x: next * (SCREEN_WIDTH - 40), animated: true });
  }

  const cardTranslateX = useRef(new Animated.Value(0)).current;
  const handleLikeRef = useRef(handleLike);
  const handleRejectRef = useRef(handleReject);
  handleLikeRef.current = handleLike;
  handleRejectRef.current = handleReject;

  useEffect(() => {
    cardTranslateX.setValue(0);
  }, [currentIndex, cardTranslateX]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 18,
        onPanResponderMove: (_, gestureState) => {
          cardTranslateX.setValue(gestureState.dx);
        },
        onPanResponderRelease: (_, gestureState) => {
          const { dx } = gestureState;
          if (dx > SWIPE_THRESHOLD) {
            Animated.timing(cardTranslateX, {
              toValue: SWIPE_OUT,
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              handleLikeRef.current();
              cardTranslateX.setValue(0);
            });
          } else if (dx < -SWIPE_THRESHOLD) {
            Animated.timing(cardTranslateX, {
              toValue: -SWIPE_OUT,
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              handleRejectRef.current();
              cardTranslateX.setValue(0);
            });
          } else {
            Animated.spring(cardTranslateX, {
              toValue: 0,
              useNativeDriver: true,
              friction: 6,
              tension: 80,
            }).start();
          }
        },
      }),
    [cardTranslateX]
  );

  const cardRotate = cardTranslateX.interpolate({
    inputRange: [-SWIPE_OUT / 2, 0, SWIPE_OUT / 2],
    outputRange: ['-12deg', '0deg', '12deg'],
  });
  const likeOpacity = cardTranslateX.interpolate({
    inputRange: [0, SWIPE_THRESHOLD, SWIPE_OUT / 2],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });
  const nopeOpacity = cardTranslateX.interpolate({
    inputRange: [-SWIPE_OUT / 2, -SWIPE_THRESHOLD, 0],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  function handleAddScheduledEvent() {
    router.push('/(tabs)/scheduled-events');
  }

  function handleAddRealtimeEvent() {
    console.log('Adicionar evento em tempo real');
  }

  function handleUndo() {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }

  function handleReject() {
    if (currentIndex < filteredProfiles.length - 1) setCurrentIndex((i) => i + 1);
  }

  async function handleLike() {
    if (!profile) return;
    setExpandedProfile(null);
    const user = await getCurrentUser();
    if (user) {
      await addMatch(user.id, { id: profile.id, name: profile.name, photoUri: profile.photoUri });
    }
    setMatchProfile(profile);
  }

  function closeMatch() {
    setMatchProfile(null);
    if (currentIndex < filteredProfiles.length - 1) setCurrentIndex((i) => i + 1);
  }

  function handleTalkToMatch() {
    if (!matchProfile) return;
    router.push('/(tabs)/chat');
    closeMatch();
  }

  function handleFavorite() {
    console.log('Favorite', profile?.id);
    if (currentIndex < filteredProfiles.length - 1) setCurrentIndex((i) => i + 1);
  }

  function handleExpand() {
    if (profile) {
      setExpandedProfile(profile);
      setExpandedPhotoIndex(0);
    }
  }

  function closeExpanded() {
    setExpandedProfile(null);
  }

  if (!hasEvents) {
    return (
      <View style={styles.root}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoCircleOuter}>
              <View style={styles.logoCircleInner} />
            </View>
            <Text style={styles.brand}>Orbitt</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.bellButton} onPress={openNotifications} hitSlop={12}>
              <MaterialIcons name="notifications" size={24} color="#000000" />
              {hasUnread && <View style={styles.bellDot} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton} hitSlop={12}>
              <MaterialIcons name="tune" size={24} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.content}>
          <View style={styles.circlesBg}>
            <View style={[styles.bgCircle, styles.bgCircleOuter]} />
            <View style={[styles.bgCircle, styles.bgCircleInner]} />
          </View>
          <Text style={styles.emptyTitle}>Você não possui nenhum evento cadastrado</Text>
          <TouchableOpacity
            style={styles.dashedButton}
            onPress={handleAddScheduledEvent}
            activeOpacity={0.8}>
            <Text style={styles.dashedButtonText}>Adicionar evento programado +</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dashedButton}
            onPress={handleAddRealtimeEvent}
            activeOpacity={0.8}>
            <Text style={styles.dashedButtonText}>Adicionar evento em tempo real +</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (hasEvents && filteredProfiles.length === 0) {
    return (
      <View style={styles.root}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoCircleOuter}>
              <View style={styles.logoCircleInner} />
            </View>
            <Text style={styles.brand}>Orbitt</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.bellButton} onPress={openNotifications} hitSlop={12}>
              <MaterialIcons name="notifications" size={24} color="#000000" />
              {hasUnread && <View style={styles.bellDot} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton} hitSlop={12}>
              <MaterialIcons name="tune" size={24} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Nenhum perfil para seus eventos</Text>
          <Text style={styles.emptySubtext}>
            Ninguém com os eventos que você selecionou no momento. Adicione outros eventos em Eventos para ver mais pessoas.
          </Text>
        </View>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.root}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoCircleOuter}>
              <View style={styles.logoCircleInner} />
            </View>
            <Text style={styles.brand}>Orbitt</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.bellButton} onPress={openNotifications} hitSlop={12}>
              <MaterialIcons name="notifications" size={24} color="#000000" />
              {hasUnread && <View style={styles.bellDot} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton} hitSlop={12}>
              <MaterialIcons name="tune" size={24} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Nenhum perfil no momento</Text>
          <Text style={styles.emptySubtext}>
            Continue selecionando eventos para ver mais pessoas.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Modal: perfil expandido (sobe ao tocar na seta) */}
      <Modal
        visible={!!expandedProfile}
        animationType="slide"
        onRequestClose={closeExpanded}
        statusBarTranslucent>
        <View style={styles.expandedRoot}>
          <View style={styles.expandedHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.logoCircleOuter}>
                <View style={styles.logoCircleInner} />
              </View>
              <Text style={styles.brand}>Orbitt</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.bellButton} onPress={openNotifications} hitSlop={12}>
                <MaterialIcons name="notifications" size={24} color="#000000" />
                {hasUnread && <View style={styles.bellDot} />}
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterButton} hitSlop={12}>
                <MaterialIcons name="tune" size={24} color="#000000" />
              </TouchableOpacity>
            </View>
          </View>
          {expandedProfile && (
            <>
              <View style={styles.expandedTitleRow}>
                <Text style={styles.expandedName}>
                  {expandedProfile.name}, {expandedProfile.age}
                </Text>
                <MaterialIcons name="verified" size={22} color="#22C55E" style={styles.verifiedIcon} />
                <TouchableOpacity
                  style={styles.collapseButton}
                  onPress={closeExpanded}
                  hitSlop={12}>
                  <MaterialIcons name="keyboard-arrow-down" size={28} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <View style={styles.expandedPhotoStripWrap}>
                <ScrollView
                  ref={expandedPhotoScrollRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 40));
                    setExpandedPhotoIndex(index);
                  }}
                  contentContainerStyle={styles.expandedPhotoStripContent}
                  style={styles.expandedPhotoStripScroll}>
                  {(expandedProfile.photos && expandedProfile.photos.length > 0
                    ? expandedProfile.photos
                    : [null, null, null]
                  ).map((uri, index) => (
                    <View key={index} style={[styles.expandedPhotoStripSlide, { width: SCREEN_WIDTH - 40 }]}>
                      {uri ? (
                        <Image source={{ uri }} style={styles.expandedPhotoStripImage} />
                      ) : (
                        <View style={styles.expandedPhotoStripPlaceholder}>
                          <Text style={styles.expandedPhotoStripLetter}>
                            {expandedProfile.name.charAt(0)}
                          </Text>
                          <Text style={styles.expandedPhotoStripEmpty}>Nenhuma foto cadastrada</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </ScrollView>
                <View style={styles.expandedPhotoDots}>
                  {(expandedProfile.photos && expandedProfile.photos.length > 0
                    ? expandedProfile.photos
                    : [null, null, null]
                  ).map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.expandedPhotoDot,
                        i === expandedPhotoIndex ? styles.expandedPhotoDotActive : styles.expandedPhotoDotInactive,
                      ]}
                    />
                  ))}
                </View>
                {/* Tap ao lado da foto para anterior/próxima */}
                <TouchableOpacity style={styles.expandedPhotoNavLeft} onPress={expandedPrevPhoto} activeOpacity={1} />
                <TouchableOpacity style={styles.expandedPhotoNavRight} onPress={expandedNextPhoto} activeOpacity={1} />
                {/* Botões seta ao lado da galeria */}
                <TouchableOpacity style={styles.expandedPhotoArrowLeft} onPress={expandedPrevPhoto} hitSlop={12} activeOpacity={0.8}>
                  <MaterialIcons name="chevron-left" size={32} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.expandedPhotoArrowRight} onPress={expandedNextPhoto} hitSlop={12} activeOpacity={0.8}>
                  <MaterialIcons name="chevron-right" size={32} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <ScrollView
                style={styles.expandedScroll}
                contentContainerStyle={styles.expandedScrollContent}
                showsVerticalScrollIndicator={false}>
                <View style={styles.expandedSection}>
                  <Text style={styles.expandedSectionTitle}>Sobre mim</Text>
                  <View style={styles.expandedBox}>
                    <Text style={styles.expandedBoxText}>
                      {expandedProfile.aboutMe || 'Nenhuma descrição.'}
                    </Text>
                  </View>
                </View>
                <View style={styles.expandedSection}>
                  <Text style={styles.expandedSectionTitle}>Interesses</Text>
                  <View style={styles.expandedBox}>
                    <View style={styles.interestsWrap}>
                      {(expandedProfile.interests || []).map((interest, i) => (
                        <View key={i} style={styles.interestChip}>
                          <Text style={styles.interestChipText}>{interest}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
                <View style={styles.expandedSection}>
                  <Text style={styles.expandedSectionTitle}>Lugares favoritos</Text>
                  <View style={styles.expandedBox}>
                    <View style={styles.favoritePlacesWrap}>
                      {(expandedProfile.favoritePlaces || []).map((place, i) => (
                        <View key={i} style={styles.favoritePlaceLogo}>
                          <Text style={styles.favoritePlaceLogoText}>{place}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
                <View style={styles.expandedActionsSpacer} />
              </ScrollView>
              <View style={styles.expandedActions}>
                <TouchableOpacity
                  style={[styles.expandedActionBtn, styles.expandedRejectBtn]}
                  onPress={() => {
                    handleReject();
                    closeExpanded();
                  }}>
                  <MaterialIcons name="close" size={36} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.expandedActionBtn, styles.expandedLikeBtn]}
                  onPress={() => {
                    handleLike();
                    closeExpanded();
                  }}>
                  <MaterialIcons name="favorite" size={36} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>

      {/* Modal: Novo match! */}
      <Modal
        visible={!!matchProfile}
        animationType="fade"
        transparent
        onRequestClose={closeMatch}
        statusBarTranslucent>
        <View style={styles.matchRoot}>
          {matchProfile && (
            <>
              {matchProfile.photoUri ? (
                <Image
                  source={{ uri: matchProfile.photoUri }}
                  style={styles.matchBackgroundImage}
                />
              ) : (
                <View style={styles.matchBackgroundPlaceholder}>
                  <Text style={styles.matchPlaceholderLetter}>
                    {matchProfile.name.charAt(0)}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.matchCloseButton}
                onPress={closeMatch}
                hitSlop={12}>
                <View style={styles.matchCloseCircle}>
                  <MaterialIcons name="close" size={26} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              <View style={styles.matchOverlay}>
                <Text style={styles.matchTitle}>Novo match!</Text>
                <Text style={styles.matchSubtitle}>
                  {matchProfile.name} também te curtiu!
                </Text>
                <Text style={styles.matchPrompt}>
                  Bora animar o role juntos?
                </Text>
                <TouchableOpacity
                  style={styles.matchCtaButton}
                  onPress={handleTalkToMatch}
                  activeOpacity={0.9}>
                  <Text style={styles.matchCtaText}>
                    Falar com {matchProfile.name}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>

      <NotificationsModal
        visible={showNotifications}
        onClose={closeNotifications}
        notifications={notifications}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoCircleOuter}>
            <View style={styles.logoCircleInner} />
          </View>
          <Text style={styles.brand}>Orbitt</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.bellButton} onPress={openNotifications} hitSlop={12}>
            <View>
              <MaterialIcons name="notifications" size={24} color="#000000" />
              {hasUnread && <View style={styles.bellDot} />}
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton} hitSlop={12}>
            <MaterialIcons name="tune" size={24} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Swipe indicator dashes (refletem a foto atual) */}
      <View style={styles.dashes}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.dash, i === cardPhotoIndexState && styles.dashActive]} />
        ))}
      </View>

      {/* Profile card (swipe: direita = like, esquerda = dislike) */}
      <View style={styles.cardWrap}>
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                { translateX: cardTranslateX },
                { rotate: cardRotate },
              ],
            },
          ]}
          {...panResponder.panHandlers}>
          {(() => {
            const uri = cardSlides[cardPhotoIndexState] ?? null;
            return uri ? (
              <Image source={{ uri }} style={styles.cardImage} />
            ) : (
              <View style={styles.cardImagePlaceholder}>
                <Text style={styles.cardImagePlaceholderText}>
                  {profile.name.charAt(0)}
                </Text>
                {cardSlides.length > 1 && (
                  <Text style={styles.cardImagePlaceholderSub}>
                    Foto {cardPhotoIndexState + 1} de {cardSlides.length}
                  </Text>
                )}
              </View>
            );
          })()}

          <View style={styles.cardOverlay}>
            <Animated.View style={[styles.swipeLabel, styles.swipeLabelLike, { opacity: likeOpacity }]} pointerEvents="none">
              <Text style={[styles.swipeLabelText, styles.swipeLabelTextLike]}>LIKE</Text>
            </Animated.View>
            <Animated.View style={[styles.swipeLabel, styles.swipeLabelNope, { opacity: nopeOpacity }]} pointerEvents="none">
              <Text style={[styles.swipeLabelText, styles.swipeLabelTextNope]}>NOPE</Text>
            </Animated.View>
            <View style={styles.cardInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>
                  {profile.name}, {profile.age}
                </Text>
                <MaterialIcons name="verified" size={20} color="#22C55E" style={styles.verifiedIcon} />
              </View>
              <Text style={styles.provablyLabel}>Provavelmente estará em</Text>
              <View style={styles.eventList}>
                <MaterialIcons name="event" size={18} color={ORANGE} style={styles.eventIcon} />
                <View>
                  {profile.events.map((e, i) => (
                    <Text key={i} style={styles.eventItem}>
                      {e.venueName} - {e.day}
                    </Text>
                  ))}
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.expandButton} onPress={handleExpand} hitSlop={8}>
              <MaterialIcons name="keyboard-arrow-up" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Trocar de foto apenas pelos botões seta (não tap na área da foto, para o botão da descrição funcionar) */}
          {cardSlides.length > 1 && (
            <>
              <TouchableOpacity style={styles.cardPhotoArrowLeft} onPress={cardPrevPhoto} activeOpacity={0.8}>
                <MaterialIcons name="chevron-left" size={36} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.cardPhotoArrowRight} onPress={cardNextPhoto} activeOpacity={0.8}>
                <MaterialIcons name="chevron-right" size={36} color="#FFFFFF" />
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionBtn, styles.undoBtn]} onPress={handleUndo}>
          <MaterialIcons name="undo" size={26} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={handleReject}>
          <MaterialIcons name="close" size={32} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.likeBtn]} onPress={handleLike}>
          <MaterialIcons name="favorite" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.favBtn]} onPress={handleFavorite}>
          <MaterialIcons name="star" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
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
    paddingBottom: 12,
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
    borderColor: '#E0E0E0',
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
    gap: 12,
  },
  bellButton: {
    padding: 8,
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ORANGE,
  },
  filterButton: {
    padding: 4,
  },
  dashes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 8,
  },
  dash: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
  },
  dashActive: {
    backgroundColor: ORANGE,
    width: 32,
  },
  cardWrap: {
    flex: 1,
    paddingHorizontal: 16,
    minHeight: 320,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImagePlaceholderText: {
    fontSize: 72,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardImagePlaceholderSub: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 12,
  },
  cardPhotoArrowLeft: {
    position: 'absolute',
    left: 12,
    top: '50%',
    marginTop: -24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 11,
    elevation: 8,
  },
  cardPhotoArrowRight: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 11,
    elevation: 8,
  },
  cardOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  swipeLabel: {
    position: 'absolute',
    top: '30%',
    borderWidth: 3,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  swipeLabelLike: {
    left: 20,
    borderColor: '#22C55E',
    transform: [{ rotate: '-30deg' }],
  },
  swipeLabelNope: {
    right: 20,
    left: undefined,
    borderColor: '#EF4444',
    transform: [{ rotate: '30deg' }],
  },
  swipeLabelText: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 2,
  },
  swipeLabelTextLike: {
    color: '#22C55E',
  },
  swipeLabelTextNope: {
    color: '#EF4444',
  },
  cardInfo: {
    marginBottom: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  verifiedIcon: {
    marginLeft: 6,
  },
  provablyLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 6,
  },
  eventList: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  eventIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  eventItem: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  expandButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  actionBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  undoBtn: {
    backgroundColor: '#3B82F6',
  },
  rejectBtn: {
    backgroundColor: '#EF4444',
  },
  likeBtn: {
    backgroundColor: '#22C55E',
  },
  favBtn: {
    backgroundColor: '#A855F7',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  circlesBg: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  bgCircle: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.18)',
    borderRadius: 9999,
    left: '50%',
  },
  bgCircleOuter: {
    width: CIRCLE_OUTER,
    height: CIRCLE_OUTER,
    borderRadius: CIRCLE_OUTER / 2,
    top: '50%',
    marginTop: -CIRCLE_OUTER / 2,
    marginLeft: -CIRCLE_OUTER / 2,
  },
  bgCircleInner: {
    width: CIRCLE_INNER,
    height: CIRCLE_INNER,
    borderRadius: CIRCLE_INNER / 2,
    top: '50%',
    marginTop: -CIRCLE_INNER / 2,
    marginLeft: -CIRCLE_INNER / 2,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  dashedButton: {
    width: '100%',
    borderWidth: 2,
    borderColor: ORANGE,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 12,
    alignItems: 'center',
  },
  dashedButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  expandedRoot: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 56,
  },
  expandedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  expandedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  expandedName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginRight: 6,
  },
  collapseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  expandedPhotoStripWrap: {
    height: 200,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#9CA3AF',
  },
  expandedPhotoStripScroll: {
    flex: 1,
    borderRadius: 12,
  },
  expandedPhotoStripContent: {
    flexGrow: 1,
  },
  expandedPhotoStripSlide: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  expandedPhotoStripImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  expandedPhotoStripPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedPhotoStripLetter: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  expandedPhotoStripEmpty: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
  },
  expandedPhotoDots: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  expandedPhotoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  expandedPhotoDotActive: {
    backgroundColor: '#FFFFFF',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  expandedPhotoDotInactive: {
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  expandedPhotoNavLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '35%',
  },
  expandedPhotoNavRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '35%',
  },
  expandedPhotoArrowLeft: {
    position: 'absolute',
    left: 8,
    top: '50%',
    marginTop: -22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedPhotoArrowRight: {
    position: 'absolute',
    right: 8,
    top: '50%',
    marginTop: -22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedScroll: {
    flex: 1,
  },
  expandedScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  expandedSection: {
    marginBottom: 20,
  },
  expandedSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 10,
  },
  expandedBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 14,
  },
  expandedBoxText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  interestsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ORANGE,
    backgroundColor: '#FFFFFF',
  },
  interestChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
  },
  favoritePlacesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  favoritePlaceLogo: {
    width: 80,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoritePlaceLogoText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  expandedActionsSpacer: {
    height: 100,
  },
  expandedActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  expandedActionBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedRejectBtn: {
    backgroundColor: '#EF4444',
  },
  expandedLikeBtn: {
    backgroundColor: '#22C55E',
  },
  matchRoot: {
    flex: 1,
    backgroundColor: '#000000',
  },
  matchBackgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  matchBackgroundPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#6B7280',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchPlaceholderLetter: {
    fontSize: 120,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
  },
  matchCloseButton: {
    position: 'absolute',
    top: 56,
    right: 20,
    zIndex: 10,
  },
  matchCloseCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 48,
    alignItems: 'center',
  },
  matchTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  matchSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  matchPrompt: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.95)',
    marginBottom: 24,
  },
  matchCtaButton: {
    alignSelf: 'stretch',
    backgroundColor: ORANGE,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
  },
  matchCtaText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
