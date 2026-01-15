/**
 * normalizeSpotId - Normaliza IDs de Spot provenientes de fuentes legacy.
 * Reglas: trim, minúsculas, guiones estables, sin caracteres inválidos.
 */
export function normalizeSpotId(rawId: string | null | undefined): string {
  if (!rawId) return '';
  const trimmed = rawId.trim();
  if (!trimmed) return '';

  const lower = trimmed.toLowerCase();
  const normalized = lower
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || lower;
}

export function normalizeSpotIds(rawIds: string[] | null | undefined): string[] {
  if (!rawIds) return [];
  const normalized = rawIds
    .map((id) => normalizeSpotId(id))
    .filter((id) => id.length > 0);
  return Array.from(new Set(normalized));
}
