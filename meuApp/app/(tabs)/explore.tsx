import { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  getSelectedEvents,
  removeSelectedEvent,
  getShortDay,
  type SelectedEventEntry,
} from '@/lib/event-storage';
import { getCurrentUser } from '@/lib/auth-storage';
import {
  getNotifications,
  markAllNotificationsRead,
  hasUnreadNotifications,
  type AppNotification,
} from '@/lib/notification-storage';
import { NotificationsModal } from '@/components/NotificationsModal';

const ORANGE = '#FF7A2A';
const SCREEN_WIDTH = Dimensions.get('window').width;
const CIRCLE_OUTER = SCREEN_WIDTH + 80;
const CIRCLE_INNER = CIRCLE_OUTER * 0.52;

export default function EventsScreen() {
  const router = useRouter();
  const [selectedEvents, setSelectedEvents] = useState<SelectedEventEntry[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

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

  const hasUnread = hasUnreadNotifications(notifications);

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

  async function handleRemove(id: string) {
    await removeSelectedEvent(id);
    setSelectedEvents((prev) => prev.filter((e) => e.id !== id));
  }

  function handleAddScheduledEvent() {
    router.push('/(tabs)/scheduled-events');
  }

  function handleAddRealtimeEvent() {
    console.log('Adicionar evento em tempo real');
  }

  const hasEvents = selectedEvents.length > 0;

  return (
    <View style={styles.root}>
      <NotificationsModal
        visible={showNotifications}
        onClose={closeNotifications}
        notifications={notifications}
      />
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
            {(hasUnread || hasEvents) && <View style={styles.bellDot} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton} hitSlop={12}>
            <MaterialIcons name="tune" size={24} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>

      {hasEvents ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitle, styles.sectionTitleInRow]}>
                Meus eventos programados
              </Text>
              <TouchableOpacity style={styles.helpButton} hitSlop={8}>
                <Text style={styles.helpText}>?</Text>
              </TouchableOpacity>
            </View>

            {selectedEvents.map((entry) => (
              <View key={entry.id} style={styles.eventChip}>
                <Text style={styles.eventChipText} numberOfLines={1}>
                  {entry.venueName} - {getShortDay(entry.day)}
                </Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemove(entry.id)}
                  hitSlop={8}>
                  <MaterialIcons name="remove" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={styles.dashedButton}
              onPress={handleAddScheduledEvent}
              activeOpacity={0.8}>
              <Text style={styles.dashedButtonTextOrange}>Adicionar evento +</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Evento em tempo real</Text>
            <TouchableOpacity
              style={styles.dashedButton}
              onPress={handleAddRealtimeEvent}
              activeOpacity={0.8}>
              <Text style={styles.dashedButtonTextOrange}>
                Adicionar evento em tempo real +
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  sectionTitleInRow: {
    marginBottom: 0,
  },
  helpButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  helpText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  eventChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: ORANGE,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  eventChipText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
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
  dashedButtonTextOrange: {
    fontSize: 15,
    fontWeight: '600',
    color: ORANGE,
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
});
