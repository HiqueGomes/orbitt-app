import AsyncStorage from '@react-native-async-storage/async-storage';

const MATCHES_PREFIX = '@orbit_matches_';

export interface MatchEntry {
  id: string;
  name: string;
  photoUri: string | null;
  lastMessage?: string;
  lastMessageAt?: number;
}

function storageKey(userId: string): string {
  return `${MATCHES_PREFIX}${userId}`;
}

export async function getMatches(userId: string): Promise<MatchEntry[]> {
  const raw = await AsyncStorage.getItem(storageKey(userId));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as MatchEntry[];
  } catch {
    return [];
  }
}

export async function addMatch(
  userId: string,
  entry: {
    id: string;
    name: string;
    photoUri?: string | null;
  }
): Promise<void> {
  const current = await getMatches(userId);
  if (current.some((m) => m.id === entry.id)) return;
  const newEntry: MatchEntry = {
    id: entry.id,
    name: entry.name,
    photoUri: entry.photoUri ?? null,
  };
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify([...current, newEntry]));
}

export async function updateMatchLastMessage(
  userId: string,
  id: string,
  lastMessage: string
): Promise<void> {
  const current = await getMatches(userId);
  const next = current.map((m) =>
    m.id === id ? { ...m, lastMessage, lastMessageAt: Date.now() } : m
  );
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(next));
}

export async function removeMatch(userId: string, id: string): Promise<void> {
  const raw = await AsyncStorage.getItem(storageKey(userId));
  const current = raw ? (JSON.parse(raw) as MatchEntry[]) : [];
  const idStr = String(id).trim();
  const next = current.filter((m) => String(m.id).trim() !== idStr);
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(next));
}
