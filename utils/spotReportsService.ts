import { supabase } from '@/utils/supabase';
import { normalizeSpotId } from '@/utils/normalizeSpotId';
import type { SpotReportReason, SpotReportRecord } from '@/types/spotContributions';

export async function createSpotReport(params: {
  spotId: string;
  reporterId: string;
  reason: SpotReportReason;
  mediaId?: string | null;
}): Promise<{ data: SpotReportRecord | null; error?: string }> {
  if (!supabase) {
    return { data: null, error: 'Supabase not configured' };
  }
  if (!params.reporterId) {
    return { data: null, error: 'Reporter is required' };
  }
  const normalizedSpotId = normalizeSpotId(params.spotId) || params.spotId;
  await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('spot_reports')
    .insert({
      spot_id: normalizedSpotId,
      reporter_id: params.reporterId,
      reason: params.reason,
      media_id: params.mediaId ?? null,
    })
    .select('*')
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as SpotReportRecord };
}
