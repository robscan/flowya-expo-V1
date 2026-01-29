import { supabase } from '@/utils/supabase';
import type {
  SpotContributionPayload,
  SpotContributionRecord,
  SpotVersionRecord,
} from '@/types/spotContributions';

const sanitizeSpotContributionPayload = (
  payload: SpotContributionPayload
): SpotContributionPayload => {
  const sanitized: SpotContributionPayload = {};

  if (payload.name?.trim()) {
    sanitized.name = payload.name.trim();
  }

  if (payload.type) {
    sanitized.type = payload.type;
  }

  if (payload.location && typeof payload.location.lat === 'number' && typeof payload.location.lng === 'number') {
    sanitized.location = {
      lat: payload.location.lat,
      lng: payload.location.lng,
      ...(payload.location.city?.trim() ? { city: payload.location.city.trim() } : {}),
      ...(payload.location.country?.trim() ? { country: payload.location.country.trim() } : {}),
    };
  }

  if (payload.short_description?.trim()) {
    sanitized.short_description = payload.short_description.trim();
  }

  if (payload.description?.trim()) {
    sanitized.description = payload.description.trim();
  }

  if (payload.image?.url?.trim()) {
    sanitized.image = {
      url: payload.image.url.trim(),
      ...(payload.image.source?.trim() ? { source: payload.image.source.trim() } : {}),
      ...(payload.image.license?.trim() ? { license: payload.image.license.trim() } : {}),
    };
  }

  if (typeof payload.has_generated_content === 'boolean') {
    sanitized.has_generated_content = payload.has_generated_content;
  }

  return sanitized;
};

const validateSpotContributionPayload = (
  type: 'create' | 'update',
  payload: SpotContributionPayload
): string | null => {
  if (type === 'create') {
    if (!payload.name) {
      return 'Contribution requires a name.';
    }
    if (!payload.type) {
      return 'Contribution requires a spot type.';
    }
    if (!payload.location) {
      return 'Contribution requires a location.';
    }
  }

  const hasAnyField =
    !!payload.name ||
    !!payload.type ||
    !!payload.location ||
    !!payload.short_description ||
    !!payload.description ||
    !!payload.image ||
    typeof payload.has_generated_content === 'boolean';

  if (!hasAnyField) {
    return 'Contribution payload is empty.';
  }

  if (payload.location && (typeof payload.location.lat !== 'number' || typeof payload.location.lng !== 'number')) {
    return 'Contribution location must include lat and lng.';
  }

  if (payload.image && !payload.image.url) {
    return 'Contribution image must include a valid URL.';
  }

  return null;
};

export async function createSpotContribution(
  spotId: string | null,
  payload: SpotContributionPayload,
  authorId: string
): Promise<{ data: SpotContributionRecord | null; error?: string }> {
  if (!supabase) {
    return { data: null, error: 'Supabase not configured' };
  }
  if (!authorId) {
    return { data: null, error: 'Author is required' };
  }

  const trimmedSpotId = spotId?.trim() || null;
  if (spotId && !trimmedSpotId) {
    return { data: null, error: 'Invalid spotId' };
  }
  const contributionType = trimmedSpotId ? 'update' : 'create';
  const sanitizedPayload = sanitizeSpotContributionPayload(payload);
  const validationError = validateSpotContributionPayload(contributionType, sanitizedPayload);
  if (validationError) {
    return { data: null, error: validationError };
  }

  const insertPayloadBase: Record<string, unknown> = {
    author_id: authorId,
    payload: sanitizedPayload,
    spot_id: trimmedSpotId,
  };

  const insertPayload: Record<string, unknown> = {
    ...insertPayloadBase,
    type: contributionType,
  };

  const insert = async (payloadToInsert: Record<string, unknown>) => {
    return supabase
      .from('spot_contributions')
      .insert(payloadToInsert)
      .select('*')
      .single();
  };

  let { data, error } = await insert(insertPayload);
  if (error) {
    const message = error.message || '';
    const missingTypeColumn =
      (message.includes('column "type"') && message.includes('does not exist')) ||
      (message.includes("'type'") && message.includes('schema cache'));
    const missingIsNewSpotColumn =
      (message.includes('column "is_new_spot"') && message.includes('does not exist')) ||
      (message.includes("'is_new_spot'") && message.includes('schema cache'));
    if (missingTypeColumn || missingIsNewSpotColumn) {
      ({ data, error } = await insert(insertPayloadBase));
    }
  }

  if (error) {
    const { details, hint, code, message: errorMessage } = error as {
      details?: string;
      hint?: string;
      code?: string;
      message?: string;
    };
    const parts = [errorMessage, details, hint, code].filter(Boolean);
    if (__DEV__) {
      console.error('[spot_contributions] Insert failed', {
        spotId: trimmedSpotId,
        type: contributionType,
        payload: sanitizedPayload,
        error,
        errorMessage,
        details,
        hint,
        code,
      });
    }
    const message = parts.length > 0 ? parts.join(' | ') : 'Unknown insert error';
    return { data: null, error: message };
  }

  return { data: data as SpotContributionRecord };
}

export async function fetchUserContributions(
  authorId: string
): Promise<{ data: SpotContributionRecord[]; error?: string }> {
  if (!supabase) {
    return { data: [], error: 'Supabase not configured' };
  }

  const { data, error } = await supabase
    .from('spot_contributions')
    .select('*')
    .eq('author_id', authorId)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: (data || []) as SpotContributionRecord[] };
}

export async function fetchSpotVersions(
  spotId: string
): Promise<{ data: SpotVersionRecord[]; error?: string }> {
  if (!supabase) {
    return { data: [], error: 'Supabase not configured' };
  }

  const { data, error } = await supabase
    .from('spot_versions')
    .select('*')
    .eq('spot_id', spotId)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: (data || []) as SpotVersionRecord[] };
}
