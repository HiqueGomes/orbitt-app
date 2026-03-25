/** Estilos musicais preferidos (ids estáveis para match com eventos no futuro). */

export interface MusicStyleOption {
  id: string;
  label: string;
}

export const MUSIC_STYLE_OPTIONS: MusicStyleOption[] = [
  { id: 'mpb', label: 'MPB' },
  { id: 'samba_pagode', label: 'Samba / Pagode' },
  { id: 'forro', label: 'Forró' },
  { id: 'sertanejo', label: 'Sertanejo' },
  { id: 'funk', label: 'Funk' },
  { id: 'hip_hop', label: 'Hip-hop / Rap' },
  { id: 'eletronica', label: 'Eletrônica' },
  { id: 'techno_house', label: 'Techno / House' },
  { id: 'rock', label: 'Rock' },
  { id: 'indie_alternativo', label: 'Indie / Alternativo' },
  { id: 'pop', label: 'Pop' },
  { id: 'reggae', label: 'Reggae' },
  { id: 'jazz_blues', label: 'Jazz / Blues' },
  { id: 'latin', label: 'Latinas' },
  { id: 'outros', label: 'Outros' },
];

export function getMusicStyleLabel(id: string): string {
  return MUSIC_STYLE_OPTIONS.find((m) => m.id === id)?.label ?? id;
}
