import { getSelectedEvents, getShortDay, type SelectedEventEntry } from '@/lib/event-storage';

export type LikerPreview = { profileId: string; accent?: 'purple' };

export type CurtidaSection = { title: string; likers: LikerPreview[] };

function eventKey(e: SelectedEventEntry): string {
  return `${e.venueName.trim().toLowerCase()}|${e.day}`;
}

function dedupeEventsByVenueAndDay(entries: SelectedEventEntry[]): SelectedEventEntry[] {
  const map = new Map<string, SelectedEventEntry>();
  for (const e of entries) {
    const k = eventKey(e);
    if (!map.has(k)) map.set(k, e);
  }
  return Array.from(map.values());
}

const LIKER_PATTERNS: LikerPreview[][] = [
  [
    { profileId: '2' },
    { profileId: '3' },
    { profileId: '5' },
    { profileId: '8' },
  ],
  [{ profileId: '4' }, { profileId: '11', accent: 'purple' }],
  [
    { profileId: '6' },
    { profileId: '7' },
    { profileId: '9' },
  ],
];

function likersForSectionIndex(sectionIndex: number): LikerPreview[] {
  return LIKER_PATTERNS[sectionIndex % LIKER_PATTERNS.length];
}

export function buildCurtidaSections(entries: SelectedEventEntry[]): CurtidaSection[] {
  const uniq = dedupeEventsByVenueAndDay(entries);
  return uniq.map((e, idx) => ({
    title: `${e.venueName} - ${getShortDay(e.day)}`,
    likers: likersForSectionIndex(idx),
  }));
}

export function totalPreviewLikersFromEntries(entries: SelectedEventEntry[]): number {
  return buildCurtidaSections(entries).reduce((sum, s) => sum + s.likers.length, 0);
}

export async function getCurtidasPreviewCount(): Promise<number> {
  const list = await getSelectedEvents();
  return totalPreviewLikersFromEntries(list);
}
