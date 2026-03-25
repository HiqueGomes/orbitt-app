import type { ImageSourcePropType } from 'react-native';

const MOCK_AVATAR_SOURCES: ImageSourcePropType[] = [
  require('../assets/mock-profiles/avatar-01.png'),
  require('../assets/mock-profiles/avatar-02.png'),
  require('../assets/mock-profiles/avatar-03.png'),
  require('../assets/mock-profiles/avatar-04.png'),
  require('../assets/mock-profiles/avatar-05.png'),
  require('../assets/mock-profiles/avatar-06.png'),
];

/** IDs só numéricos (perfis mock do discover) — evita confundir com UUID. */
export function getMockAvatarSourceForProfileId(profileId: string): ImageSourcePropType | null {
  const id = profileId.trim();
  if (!/^\d+$/.test(id)) return null;
  const n = parseInt(id, 10);
  if (Number.isNaN(n) || n < 1) return null;
  const idx = (n - 1) % MOCK_AVATAR_SOURCES.length;
  return MOCK_AVATAR_SOURCES[idx] ?? null;
}

export function profileImageSource(
  src: ImageSourcePropType | string | null | undefined
): ImageSourcePropType | null {
  if (src == null || src === '') return null;
  if (typeof src === 'string') return { uri: src };
  return src;
}

/** Avatar no chat / match: URL real ou asset do mock pelo id do perfil. */
export function matchEntryAvatarSource(entry: {
  id: string;
  photoUri: string | null;
}): ImageSourcePropType | null {
  const fromUri = entry.photoUri ? profileImageSource(entry.photoUri) : null;
  if (fromUri) return fromUri;
  return getMockAvatarSourceForProfileId(entry.id);
}
