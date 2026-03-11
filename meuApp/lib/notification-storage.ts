import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMatches } from '@/lib/match-storage';

const READ_NOTIFICATIONS_KEY = '@orbit_read_notifications';

export type NotificationType = 'match' | 'promo' | 'update';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
  /** Para match: id do match para navegar */
  matchId?: string;
}

async function getReadIds(userId: string): Promise<Set<string>> {
  const raw = await AsyncStorage.getItem(`${READ_NOTIFICATIONS_KEY}_${userId}`);
  if (!raw) return new Set();
  try {
    const arr = JSON.parse(raw) as string[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

export async function getNotifications(userId: string): Promise<AppNotification[]> {
  const readIds = await getReadIds(userId);
  const now = Date.now();
  const list: AppNotification[] = [];

  const matches = await getMatches(userId);
  matches.forEach((m) => {
    list.push({
      id: `match-${m.id}`,
      type: 'match',
      title: 'Novo match!',
      body: `Você e ${m.name} deram match. Comece a conversar!`,
      createdAt: now - list.length * 60000,
      read: readIds.has(`match-${m.id}`),
      matchId: m.id,
    });
  });

  const promos: { id: string; title: string; body: string }[] = [
    { id: 'promo-1', title: 'Promoção especial', body: '20% de desconto no seu primeiro evento da semana. Válido até domingo.' },
    { id: 'promo-2', title: 'Happy hour Orbitt', body: 'Mostre seu perfil em parceiros selecionados e ganhe um drink por nossa conta.' },
  ];
  promos.forEach((p, i) => {
    list.push({
      id: p.id,
      type: 'promo',
      title: p.title,
      body: p.body,
      createdAt: now - (matches.length + i + 1) * 3600000,
      read: readIds.has(p.id),
    });
  });

  const updates: { id: string; title: string; body: string }[] = [
    { id: 'update-1', title: 'Atualização do app', body: 'Novo: filtro por local e data nos eventos. Confira em Eventos.' },
    { id: 'update-2', title: 'Melhorias', body: 'Agora você pode ver várias fotos do perfil antes de dar like.' },
  ];
  updates.forEach((u, i) => {
    list.push({
      id: u.id,
      type: 'update',
      title: u.title,
      body: u.body,
      createdAt: now - (matches.length + promos.length + i + 1) * 86400000,
      read: readIds.has(u.id),
    });
  });

  list.sort((a, b) => b.createdAt - a.createdAt);
  return list;
}

export async function markNotificationRead(userId: string, notificationId: string): Promise<void> {
  const raw = await AsyncStorage.getItem(`${READ_NOTIFICATIONS_KEY}_${userId}`);
  const current: string[] = raw ? JSON.parse(raw) : [];
  if (current.includes(notificationId)) return;
  await AsyncStorage.setItem(
    `${READ_NOTIFICATIONS_KEY}_${userId}`,
    JSON.stringify([...current, notificationId])
  );
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const list = await getNotifications(userId);
  const ids = list.map((n) => n.id);
  await AsyncStorage.setItem(`${READ_NOTIFICATIONS_KEY}_${userId}`, JSON.stringify(ids));
}

export function hasUnreadNotifications(list: AppNotification[]): boolean {
  return list.some((n) => !n.read);
}
