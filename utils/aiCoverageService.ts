import type { Spot } from '@/data/spots';
import { supabase } from '@/utils/supabase';
import type { AiCoverageSessionRecord, AiCoverageStatus } from '@/types/aiCoverage';

const COOLDOWN_HOURS = 24;
let spotColumnsCache: string[] | null = null;

const buildBBoxKey = (bbox: { north: number; south: number; east: number; west: number }): string => {
  const round = (value: number) => value.toFixed(3);
  return [round(bbox.north), round(bbox.south), round(bbox.east), round(bbox.west)].join(':');
};

export async function createAiCoverageSession(params: {
  userId: string;
  bbox: { north: number; south: number; east: number; west: number };
  source?: string;
  reason?: string;
}): Promise<{ data: AiCoverageSessionRecord | null; error?: string }> {
  if (!supabase) {
    return { data: null, error: 'Supabase not configured' };
  }

  const { data, error } = await supabase
    .from('ai_coverage_sessions')
    .insert({
      user_id: params.userId,
      bbox: params.bbox,
      bbox_key: buildBBoxKey(params.bbox),
      source: params.source ?? null,
      reason: params.reason ?? null,
      status: 'pending',
    })
    .select('*')
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as AiCoverageSessionRecord };
}

export async function fetchAiCoverageSessions(params?: {
  status?: AiCoverageStatus;
  limit?: number;
}): Promise<{ data: AiCoverageSessionRecord[]; error?: string }> {
  if (!supabase) {
    return { data: [], error: 'Supabase not configured' };
  }

  let query = supabase.from('ai_coverage_sessions').select('*').order('created_at', { ascending: false });
  if (params?.status) {
    query = query.eq('status', params.status);
  }
  if (params?.limit) {
    query = query.limit(params.limit);
  }

  const { data, error } = await query;

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: (data || []) as AiCoverageSessionRecord[] };
}

export async function updateAiCoverageSession(params: {
  id: string;
  status: AiCoverageStatus;
  generatedCount?: number;
  cooldownUntil?: string | null;
}): Promise<{ data: AiCoverageSessionRecord | null; error?: string }> {
  if (!supabase) {
    return { data: null, error: 'Supabase not configured' };
  }

  const { data, error } = await supabase
    .from('ai_coverage_sessions')
    .update({
      status: params.status,
      generated_count: params.generatedCount ?? undefined,
      cooldown_until: params.cooldownUntil ?? undefined,
    })
    .eq('id', params.id)
    .select('*')
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as AiCoverageSessionRecord };
}

export async function fetchLatestAiCoverageSession(params: {
  userId: string;
  bbox: { north: number; south: number; east: number; west: number };
}): Promise<{ data: AiCoverageSessionRecord | null; error?: string }> {
  if (!supabase) {
    return { data: null, error: 'Supabase not configured' };
  }

  const bboxKey = buildBBoxKey(params.bbox);
  const { data, error } = await supabase
    .from('ai_coverage_sessions')
    .select('*')
    .eq('user_id', params.userId)
    .eq('bbox_key', bboxKey)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: (data as AiCoverageSessionRecord) || null };
}

export function isAiCoverageCooldownActive(session: AiCoverageSessionRecord | null): boolean {
  if (!session) return false;
  if (session.cooldown_until) {
    return new Date(session.cooldown_until).getTime() > Date.now();
  }
  const createdAt = new Date(session.created_at).getTime();
  const cooldownMs = COOLDOWN_HOURS * 60 * 60 * 1000;
  return createdAt + cooldownMs > Date.now();
}

/** Persiste spots generados por IA en Supabase para que aparezcan en el mapa tras recargar. */
export async function persistAiCoverageSpots(
  spots: Spot[],
  userId: string
): Promise<{ error?: string }> {
  if (!supabase) {
    return { error: 'Supabase not configured' };
  }
  if (spots.length === 0) {
    return {};
  }

  const columnSet = await (async () => {
    if (spotColumnsCache) return new Set(spotColumnsCache);
    const { data, error } = await supabase.from('spots').select('*').limit(1);
    if (error) {
      return null;
    }
    const columns = data?.[0] ? Object.keys(data[0]) : [];
    spotColumnsCache = columns;
    return new Set(columns);
  })();

  if (!columnSet) {
    return { error: 'No se pudieron cargar columnas de spots' };
  }

  const rows = spots.map((spot) => {
    const baseLat = (spot.location as { lat?: number; latitude?: number }).lat ?? (spot.location as { latitude?: number }).latitude ?? null;
    const baseLng = (spot.location as { lng?: number; longitude?: number }).lng ?? (spot.location as { longitude?: number }).longitude ?? null;
    const baseCity = (spot.location as { city?: string }).city ?? null;
    const baseCountry = (spot.location as { country?: string }).country ?? null;
    const baseRow: Record<string, unknown> = {
      id: spot.id,
      name: spot.name,
      type: spot.type,
      location: spot.location,
      lat: baseLat,
      lng: baseLng,
      latitude: baseLat,
      longitude: baseLng,
      location_lat: baseLat,
      location_lng: baseLng,
      location_city: baseCity,
      location_country: baseCountry,
      short_description: spot.shortDescription ?? null,
      shortDescription: spot.shortDescription ?? null,
      description: spot.description ?? spot.shortDescription ?? null,
      image: spot.image ?? { url: '' },
      image_url: spot.image?.url ?? null,
      has_generated_content: spot.hasGeneratedContent ?? false,
      spot_type: null,
      created_by: userId,
      created_at: (spot.createdAt instanceof Date ? spot.createdAt : new Date(spot.createdAt)).toISOString(),
      updated_at: (spot.updatedAt instanceof Date ? spot.updatedAt : new Date(spot.updatedAt)).toISOString(),
    };
    const filtered: Record<string, unknown> = {};
    Object.keys(baseRow).forEach((key) => {
      if (columnSet.has(key)) {
        filtered[key] = baseRow[key];
      }
    });
    return filtered;
  });

  const { error } = await supabase.from('spots').insert(rows);

  if (error) {
    return { error: error.message };
  }
  return {};
}
