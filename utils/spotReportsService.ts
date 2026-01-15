import { supabase } from '@/utils/supabase';
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

  const { data, error } = await supabase
    .from('spot_reports')
    .insert({
      spot_id: params.spotId,
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
