import AsyncStorage from '@react-native-async-storage/async-storage';

const MESSAGES_PREFIX = '@orbit_messages_';

export interface ChatMessage {
  id: string;
  fromMe: boolean;
  text: string;
  timestamp: number;
}

function storageKey(userId: string, matchId: string): string {
  return `${MESSAGES_PREFIX}${userId}_${matchId}`;
}

export async function getMessages(userId: string, matchId: string): Promise<ChatMessage[]> {
  const raw = await AsyncStorage.getItem(storageKey(userId, matchId));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ChatMessage[];
  } catch {
    return [];
  }
}

export async function addMessage(
  userId: string,
  matchId: string,
  fromMe: boolean,
  text: string
): Promise<ChatMessage> {
  const current = await getMessages(userId, matchId);
  const message: ChatMessage = {
    id: `${matchId}-${Date.now()}`,
    fromMe,
    text,
    timestamp: Date.now(),
  };
  const next = [...current, message];
  await AsyncStorage.setItem(storageKey(userId, matchId), JSON.stringify(next));
  return message;
}

/** Remove todas as mensagens da conversa com o match (ex.: ao desfazer match ou bloquear). */
export async function clearMessages(userId: string, matchId: string): Promise<void> {
  await AsyncStorage.removeItem(storageKey(userId, String(matchId).trim()));
}
