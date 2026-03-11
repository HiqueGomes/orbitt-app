import AsyncStorage from '@react-native-async-storage/async-storage';

const SELECTED_EVENTS_KEY = '@orbit_selected_events';

export interface SelectedEventEntry {
  id: string;
  eventId: string;
  venueName: string;
  day: string;
}

function shortDay(day: string): string {
  const map: Record<string, string> = {
    'Segunda-feira': 'Seg',
    'Terça-feira': 'Ter',
    'Quarta-feira': 'Quarta',
    'Quinta-feira': 'Quinta',
    'Sexta-feira': 'Sexta',
    'Sábado': 'Sábado',
    'Domingo': 'Domingo',
  };
  return map[day] ?? day;
}

export function getShortDay(day: string): string {
  return shortDay(day);
}

export async function getSelectedEvents(): Promise<SelectedEventEntry[]> {
  const raw = await AsyncStorage.getItem(SELECTED_EVENTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SelectedEventEntry[];
  } catch {
    return [];
  }
}

/** Remove todos os eventos selecionados (ex.: ao cadastrar novo usuário). */
export async function clearSelectedEvents(): Promise<void> {
  await AsyncStorage.removeItem(SELECTED_EVENTS_KEY);
}

export async function addSelectedEvents(
  eventId: string,
  venueName: string,
  days: string[]
): Promise<void> {
  const current = await getSelectedEvents();
  const withoutThisVenue = current.filter((e) => e.eventId !== eventId);
  const newEntries: SelectedEventEntry[] = days.map((day, i) => ({
    id: `${eventId}-${day}-${Date.now()}-${i}`,
    eventId,
    venueName,
    day,
  }));
  const next = [...withoutThisVenue, ...newEntries];
  await AsyncStorage.setItem(SELECTED_EVENTS_KEY, JSON.stringify(next));
}

export async function removeSelectedEvent(id: string): Promise<void> {
  const current = await getSelectedEvents();
  const next = current.filter((e) => e.id !== id);
  await AsyncStorage.setItem(SELECTED_EVENTS_KEY, JSON.stringify(next));
}
