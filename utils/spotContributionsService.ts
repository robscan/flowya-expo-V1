import { supabase } from '@/utils/supabase';
import type {
  SpotContributionPayload,
  SpotContributionRecord,
  SpotVersionRecord,
} from '@/types/spotContributions';

export async function createSpotContribution(
  spotId: string | null,
  payload: SpotContributionPayload,
  authorId: string
): Promise<{ data: SpotContributionRecord | null; error?: string }> {
  if (!supabase) {
    return { data: null, error: 'Supabase not configured' };
  }

  const insertPayload: Record<string, unknown> = {
    author_id: authorId,
    payload,
    type: spotId ? 'update' : 'create',
    spot_id: spotId ?? null,
  };

  const { data, error } = await supabase
    .from('spot_contributions')
    .insert(insertPayload)
    .select('*')
    .single();

  if (error) {
    return { data: null, error: error.message };
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
