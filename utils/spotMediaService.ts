import { normalizeSpotId } from '@/utils/normalizeSpotId';
import { supabase } from '@/utils/supabase';
import { getStorageBucketName, isPublicStorageUrl } from '@/utils/storageUpload';
import type { SpotMediaPublicRecord } from '@/types/spotContributions';

const extractStoragePath = (urlOrPath: string, bucket: string): string | null => {
  const trimmed = urlOrPath.trim();
  if (!trimmed) return null;
  if (isPublicStorageUrl(trimmed)) {
    const marker = `/storage/v1/object/public/${bucket}/`;
    const idx = trimmed.indexOf(marker);
    if (idx === -1) return null;
    return trimmed.slice(idx + marker.length);
  }
  if (trimmed.startsWith(`${bucket}/`)) {
    return trimmed.slice(bucket.length + 1);
  }
  return trimmed;
};

export async function createSpotMediaPublic(params: {
  spotId: string;
  url: string;
  source?: string | null;
  license?: string | null;
  createdBy: string;
}): Promise<{ data: SpotMediaPublicRecord | null; error?: string }> {
  if (!supabase) {
    return { data: null, error: 'Supabase not configured' };
  }
  if (!params.createdBy) {
    return { data: null, error: 'Author is required' };
  }

  const normalizedSpotId = normalizeSpotId(params.spotId);
  if (!normalizedSpotId) {
    return { data: null, error: 'Invalid spotId' };
  }

  const bucket = getStorageBucketName();
  const storagePath = extractStoragePath(params.url, bucket);
  if (!storagePath) {
    return { data: null, error: 'Media URL must be a public Storage URL' };
  }

  const { data, error } = await supabase
    .from('spot_media_public')
    .insert({
      spot_id: normalizedSpotId,
      storage_path: storagePath,
      source: (params.source?.trim() || 'user') as 'user' | 'seed' | 'unknown',
      created_by: params.createdBy,
      status: 'active',
    })
    .select('*')
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as SpotMediaPublicRecord };
}
