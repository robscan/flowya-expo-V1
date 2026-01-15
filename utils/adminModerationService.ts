import { supabase } from '@/utils/supabase';
import type {
  SpotContributionRecord,
  SpotMediaPublicRecord,
  SpotReportRecord,
  SpotVersionRecord,
} from '@/types/spotContributions';
import type { Spot } from '@/data/spots';
import type { AdminAuditRecord } from '@/types/adminAudit';

async function logAdminAction(params: {
  action: string;
  entityType: string;
  entityId?: string | null;
  payload?: Record<string, unknown> | null;
}): Promise<void> {
  if (!supabase) return;
  await supabase.from('admin_audit_log').insert({
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId ?? null,
    payload: params.payload ?? null,
  });
}

export async function fetchPendingContributions(): Promise<{
  data: SpotContributionRecord[];
  error?: string;
}> {
  if (!supabase) {
    return { data: [], error: 'Supabase not configured' };
  }

  const { data, error } = await supabase
    .from('spot_contributions')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: (data || []) as SpotContributionRecord[] };
}

export async function fetchSpotById(spotId: string): Promise<{
  data: Spot | null;
  error?: string;
}> {
  if (!supabase) {
    return { data: null, error: 'Supabase not configured' };
  }

  const { data, error } = await supabase
    .from('spots')
    .select('*')
    .eq('id', spotId)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as Spot };
}

export async function fetchContributionsBySpot(spotId: string): Promise<{
  data: SpotContributionRecord[];
  error?: string;
}> {
  if (!supabase) {
    return { data: [], error: 'Supabase not configured' };
  }

  const { data, error } = await supabase
    .from('spot_contributions')
    .select('*')
    .eq('spot_id', spotId)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: (data || []) as SpotContributionRecord[] };
}

export async function fetchReportsBySpot(spotId: string): Promise<{
  data: SpotReportRecord[];
  error?: string;
}> {
  if (!supabase) {
    return { data: [], error: 'Supabase not configured' };
  }

  const { data, error } = await supabase
    .from('spot_reports')
    .select('*')
    .eq('spot_id', spotId)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: (data || []) as SpotReportRecord[] };
}

export async function fetchMediaBySpot(spotId: string): Promise<{
  data: SpotMediaPublicRecord[];
  error?: string;
}> {
  if (!supabase) {
    return { data: [], error: 'Supabase not configured' };
  }

  const { data, error } = await supabase
    .from('spot_media_public')
    .select('*')
    .eq('spot_id', spotId)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: (data || []) as SpotMediaPublicRecord[] };
}

export async function applyContribution(contributionId: string): Promise<{ error?: string }> {
  if (!supabase) {
    return { error: 'Supabase not configured' };
  }

  const { error } = await supabase.rpc('apply_spot_contribution_admin', {
    contribution_id: contributionId,
  });

  if (error) {
    return { error: error.message };
  }

  await logAdminAction({
    action: 'apply_contribution',
    entityType: 'spot_contribution',
    entityId: contributionId,
  });

  return {};
}

export async function rejectContribution(
  contributionId: string,
  reviewReason?: string
): Promise<{ error?: string }> {
  if (!supabase) {
    return { error: 'Supabase not configured' };
  }

  const { data, error } = await supabase
    .from('spot_contributions')
    .update({
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      review_reason: reviewReason ?? null,
    })
    .select('id,status')
    .eq('id', contributionId);

  if (error) {
    return { error: error.message };
  }

  await logAdminAction({
    action: 'reject_contribution',
    entityType: 'spot_contribution',
    entityId: contributionId,
    payload: reviewReason ? { review_reason: reviewReason } : null,
  });

  return {};
}

export async function fetchRecentReports(): Promise<{
  data: SpotReportRecord[];
  error?: string;
}> {
  if (!supabase) {
    return { data: [], error: 'Supabase not configured' };
  }

  const { data, error } = await supabase
    .from('spot_reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: (data || []) as SpotReportRecord[] };
}

export async function fetchAdminAuditLog(): Promise<{
  data: AdminAuditRecord[];
  error?: string;
}> {
  if (!supabase) {
    return { data: [], error: 'Supabase not configured' };
  }

  const { data, error } = await supabase
    .from('admin_audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: (data || []) as AdminAuditRecord[] };
}

export async function fetchSpotVersionsForSpot(spotId: string): Promise<{
  data: SpotVersionRecord[];
  error?: string;
}> {
  if (!supabase) {
    return { data: [], error: 'Supabase not configured' };
  }

  const { data, error } = await supabase
    .from('spot_versions')
    .select('*')
    .eq('spot_id', spotId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: (data || []) as SpotVersionRecord[] };
}

export async function fetchMediaByIds(mediaIds: string[]): Promise<{
  data: SpotMediaPublicRecord[];
  error?: string;
}> {
  if (!supabase) {
    return { data: [], error: 'Supabase not configured' };
  }

  if (mediaIds.length === 0) {
    return { data: [] };
  }

  const { data, error } = await supabase
    .from('spot_media_public')
    .select('*')
    .in('id', mediaIds);

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: (data || []) as SpotMediaPublicRecord[] };
}

export async function setMediaSoftHidden(mediaId: string): Promise<{ error?: string }> {
  if (!supabase) {
    return { error: 'Supabase not configured' };
  }

  const { error } = await supabase
    .from('spot_media_public')
    .update({ status: 'soft_hidden' })
    .eq('id', mediaId);

  if (error) {
    return { error: error.message };
  }

  await logAdminAction({
    action: 'soft_hide_media',
    entityType: 'spot_media_public',
    entityId: mediaId,
  });

  return {};
}

export async function markSpotNeedsReview(spotId: string): Promise<{ error?: string }> {
  if (!supabase) {
    return { error: 'Supabase not configured' };
  }

  const { error } = await supabase
    .from('spots')
    .update({
      needs_review: true,
      needs_review_at: new Date().toISOString(),
    })
    .eq('id', spotId);

  if (error) {
    return { error: error.message };
  }

  await logAdminAction({
    action: 'mark_needs_review',
    entityType: 'spot',
    entityId: spotId,
  });

  return {};
}

export async function rollbackSpotToVersion(
  spotId: string,
  versionId: string
): Promise<{ error?: string }> {
  if (!supabase) {
    return { error: 'Supabase not configured' };
  }

  const { error } = await supabase.rpc('rollback_spot_to_version_admin', {
    spot_id_input: spotId,
    version_id_input: versionId,
  });

  if (error) {
    return { error: error.message };
  }

  await logAdminAction({
    action: 'rollback_spot_version',
    entityType: 'spot',
    entityId: spotId,
    payload: { version_id: versionId },
  });

  return {};
}

export async function fetchSoftHiddenMediaCount(): Promise<{
  count: number;
  error?: string;
}> {
  if (!supabase) {
    return { count: 0, error: 'Supabase not configured' };
  }

  const { count, error } = await supabase
    .from('spot_media_public')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'soft_hidden');

  if (error) {
    return { count: 0, error: error.message };
  }

  return { count: count || 0 };
}

export async function fetchNeedsReviewCount(): Promise<{
  count: number;
  error?: string;
}> {
  if (!supabase) {
    return { count: 0, error: 'Supabase not configured' };
  }

  const { count, error } = await supabase
    .from('spots')
    .select('id', { count: 'exact', head: true })
    .eq('needs_review', true);

  if (error) {
    return { count: 0, error: error.message };
  }

  return { count: count || 0 };
}

export async function fetchContributionCountByStatus(status: 'applied' | 'rejected'): Promise<{
  count: number;
  error?: string;
}> {
  if (!supabase) {
    return { count: 0, error: 'Supabase not configured' };
  }

  const { count, error } = await supabase
    .from('spot_contributions')
    .select('id', { count: 'exact', head: true })
    .eq('status', status);

  if (error) {
    return { count: 0, error: error.message };
  }

  return { count: count || 0 };
}

export async function fetchContributionTimings(): Promise<{
  data: Array<{
    created_at: string;
    applied_at?: string | null;
    rejected_at?: string | null;
    status: string;
  }>;
  error?: string;
}> {
  if (!supabase) {
    return { data: [], error: 'Supabase not configured' };
  }

  const { data, error } = await supabase
    .from('spot_contributions')
    .select('created_at, applied_at, rejected_at, status')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: (data || []) as Array<{ created_at: string; applied_at?: string | null; rejected_at?: string | null; status: string }> };
}
