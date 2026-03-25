/** Locais cadastrados no app (mesma lista de eventos programados). */

export type VenueBandType = 'bar' | 'balada';
export type VenueCardStyle = 'badge' | 'simple' | 'gradient' | 'gold';

export interface AppVenue {
  id: string;
  name: string;
  style: VenueCardStyle;
  type: VenueBandType;
  /** Estilos que mais tocam no local (ids de lib/music-styles) — usado em recomendações na aba Eventos. */
  topMusicStyles: string[];
}

export const APP_VENUES: AppVenue[] = [
  { id: '1', name: 'Beco Espeto', style: 'badge', type: 'bar', topMusicStyles: ['samba_pagode', 'sertanejo', 'mpb'] },
  { id: '2', name: 'VILAK', style: 'simple', type: 'balada', topMusicStyles: ['eletronica', 'funk', 'pop'] },
  { id: '3', name: 'GALERIA BAR', style: 'gradient', type: 'bar', topMusicStyles: ['mpb', 'pop', 'samba_pagode'] },
  { id: '4', name: 'MAHAU', style: 'simple', type: 'balada', topMusicStyles: ['eletronica', 'techno_house'] },
  { id: '5', name: 'AMATA', style: 'simple', type: 'balada', topMusicStyles: ['eletronica', 'pop'] },
  { id: '6', name: 'VITRINNI Lounge Beer', style: 'gold', type: 'bar', topMusicStyles: ['rock', 'pop', 'sertanejo'] },
  { id: '7', name: 'D-Edge', style: 'gradient', type: 'balada', topMusicStyles: ['techno_house', 'eletronica'] },
  { id: '8', name: 'Skye', style: 'gold', type: 'bar', topMusicStyles: ['eletronica', 'pop', 'latin'] },
  { id: '9', name: 'Beco 203', style: 'simple', type: 'bar', topMusicStyles: ['samba_pagode', 'mpb', 'forro'] },
  { id: '10', name: 'Blitz Haus', style: 'badge', type: 'bar', topMusicStyles: ['rock', 'indie_alternativo', 'eletronica'] },
  { id: '11', name: 'Selvagem', style: 'simple', type: 'balada', topMusicStyles: ['eletronica', 'funk'] },
  { id: '12', name: 'Ó do Borogodó', style: 'gradient', type: 'bar', topMusicStyles: ['samba_pagode', 'mpb', 'forro'] },
  { id: '13', name: 'Trackers', style: 'simple', type: 'bar', topMusicStyles: ['rock', 'pop', 'sertanejo'] },
  { id: '14', name: 'All Black', style: 'badge', type: 'balada', topMusicStyles: ['hip_hop', 'funk', 'eletronica'] },
  { id: '15', name: 'Canto da Ema', style: 'gold', type: 'bar', topMusicStyles: ['forro', 'sertanejo', 'samba_pagode'] },
  { id: '16', name: 'Veloso', style: 'simple', type: 'bar', topMusicStyles: ['mpb', 'samba_pagode', 'jazz_blues'] },
  { id: '17', name: 'Lions Nightclub', style: 'gradient', type: 'balada', topMusicStyles: ['funk', 'pop', 'eletronica'] },
  { id: '18', name: 'Bourbon Street', style: 'gold', type: 'bar', topMusicStyles: ['jazz_blues', 'rock', 'mpb'] },
  { id: '19', name: 'The Week', style: 'badge', type: 'balada', topMusicStyles: ['eletronica', 'techno_house'] },
  { id: '20', name: 'Astor', style: 'simple', type: 'bar', topMusicStyles: ['pop', 'indie_alternativo', 'mpb'] },
  { id: '21', name: 'Mamba Negra', style: 'gradient', type: 'balada', topMusicStyles: ['techno_house', 'eletronica'] },
  { id: '22', name: 'Bar do Zé', style: 'simple', type: 'bar', topMusicStyles: ['samba_pagode', 'mpb'] },
  { id: '23', name: 'Club Noir', style: 'badge', type: 'balada', topMusicStyles: ['hip_hop', 'funk'] },
  { id: '24', name: 'Empório Alto de Pinheiros', style: 'gold', type: 'bar', topMusicStyles: ['pop', 'indie_alternativo'] },
  { id: '25', name: 'JazzB', style: 'simple', type: 'bar', topMusicStyles: ['jazz_blues', 'latin', 'mpb'] },
  { id: '26', name: 'View Rooftop', style: 'gradient', type: 'bar', topMusicStyles: ['pop', 'eletronica', 'latin'] },
  { id: '27', name: 'Casa da Luz', style: 'simple', type: 'balada', topMusicStyles: ['funk', 'eletronica', 'pop'] },
  { id: '28', name: 'Bar dos Artesãos', style: 'gold', type: 'bar', topMusicStyles: ['samba_pagode', 'mpb', 'forro'] },
  { id: '29', name: 'Laroc Club', style: 'badge', type: 'balada', topMusicStyles: ['eletronica', 'funk', 'pop'] },
  { id: '30', name: 'Boteco do Espanha', style: 'simple', type: 'bar', topMusicStyles: ['samba_pagode', 'sertanejo', 'forro'] },
];

export function getVenueNameById(id: string): string | undefined {
  return APP_VENUES.find((v) => v.id === id)?.name;
}

export function getVenueById(id: string): AppVenue | undefined {
  return APP_VENUES.find((v) => v.id === id);
}

/** Locais cuja programação típica combina com algum estilo preferido do usuário. */
export function venuesMatchingUserMusicStyles(userStyleIds: string[]): AppVenue[] {
  if (!userStyleIds.length) return [];
  const set = new Set(userStyleIds);
  return APP_VENUES.filter((v) => v.topMusicStyles.some((m) => set.has(m)));
}
