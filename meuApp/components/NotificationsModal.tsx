import { StyleSheet, Text, TouchableOpacity, View, Modal, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { AppNotification } from '@/lib/notification-storage';

const ORANGE = '#FF7A2A';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  notifications: AppNotification[];
}

export function NotificationsModal({ visible, onClose, notifications }: NotificationsModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.title}>Notificações</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={12}>
            <MaterialIcons name="close" size={28} color="#000000" />
          </TouchableOpacity>
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {notifications.length === 0 ? (
            <Text style={styles.empty}>Nenhuma notificação no momento.</Text>
          ) : (
            notifications.map((n) => (
              <View key={n.id} style={[styles.card, !n.read && styles.cardUnread]}>
                <View style={styles.iconWrap}>
                  <MaterialIcons
                    name={
                      n.type === 'match' ? 'favorite' : n.type === 'promo' ? 'local-offer' : 'info'
                    }
                    size={24}
                    color={
                      n.type === 'match' ? '#EF4444' : n.type === 'promo' ? ORANGE : '#3B82F6'
                    }
                  />
                </View>
                <View style={styles.body}>
                  <Text style={styles.cardTitle}>{n.title}</Text>
                  <Text style={styles.cardBody}>{n.body}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 56,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  closeBtn: {
    padding: 8,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  empty: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 32,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  cardUnread: {
    backgroundColor: '#FFF7ED',
    borderLeftColor: ORANGE,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  body: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  cardBody: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});
