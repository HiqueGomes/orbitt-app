/** Ex.: "joão da silva" → "João Da Silva" (exibição no perfil). */

export function formatNamePart(raw: string): string {
  const s = raw.trim();
  if (!s) return '';
  return s
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const first = word.charAt(0).toLocaleUpperCase('pt-BR');
      const rest = word.slice(1).toLocaleLowerCase('pt-BR');
      return first + rest;
    })
    .join(' ');
}

export function formatDisplayFullName(firstName: string, lastName: string): string {
  const f = formatNamePart(firstName);
  const l = formatNamePart(lastName);
  return `${f} ${l}`.trim();
}
