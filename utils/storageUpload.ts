import Constants from 'expo-constants';

import { supabase } from '@/utils/supabase';

const DEFAULT_STORAGE_BUCKET = 'flowya-public-spots';
const DEFAULT_PRIVATE_STORAGE_BUCKET = 'flowya-private-pins';
const PRIVATE_URL_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 dias

const getEnvVar = (key: string): string => {
  if (Constants.expoConfig?.extra?.[key]) {
    return Constants.expoConfig.extra[key] || '';
  }
  if (process.env[key]) {
    return process.env[key] || '';
  }
  return '';
};

export const getStorageBucketName = (): string => {
  return (
    getEnvVar('EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET') ||
    getEnvVar('EXPO_PUBLIC_STORAGE_BUCKET') ||
    DEFAULT_STORAGE_BUCKET
  );
};

export const getPrivateStorageBucketName = (): string => {
  return (
    getEnvVar('EXPO_PUBLIC_SUPABASE_PRIVATE_STORAGE_BUCKET') ||
    getEnvVar('EXPO_PUBLIC_PRIVATE_STORAGE_BUCKET') ||
    DEFAULT_PRIVATE_STORAGE_BUCKET
  );
};

export const isPublicStorageUrl = (url: string): boolean => {
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    return trimmed.includes('/storage/v1/object/public/');
  } catch {
    return false;
  }
};

const getFileExtension = (uri: string, contentType?: string): string => {
  const normalizedUri = uri.split('?')[0];
  const extensionFromUri = normalizedUri.includes('.')
    ? normalizedUri.split('.').pop()?.toLowerCase()
    : undefined;
  if (extensionFromUri && extensionFromUri.length <= 5) {
    return extensionFromUri;
  }
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/webp') return 'webp';
  if (contentType === 'image/jpeg') return 'jpg';
  return 'jpg';
};

const getContentType = (extension: string, fallback?: string): string => {
  const normalized = extension.toLowerCase();
  if (normalized === 'png') return 'image/png';
  if (normalized === 'webp') return 'image/webp';
  if (normalized === 'jpg' || normalized === 'jpeg') return 'image/jpeg';
  if (fallback && fallback.trim().length > 0) return fallback;
  return 'image/jpeg';
};

export async function uploadImageToStorage(params: {
  uri: string;
  pathPrefix: string;
  bucket?: string;
}): Promise<{ publicUrl: string | null; error?: string }> {
  if (!supabase) {
    return { publicUrl: null, error: 'Supabase not configured' };
  }

  const trimmedUri = params.uri.trim();
  if (!trimmedUri) {
    return { publicUrl: null, error: 'Invalid image URI' };
  }

  if (isPublicStorageUrl(trimmedUri)) {
    return { publicUrl: trimmedUri };
  }

  const response = await fetch(trimmedUri);
  if (!response.ok) {
    return { publicUrl: null, error: `Failed to read image (${response.status})` };
  }
  const blob = await response.blob();
  if (!blob || blob.size === 0) {
    return { publicUrl: null, error: 'Empty image blob' };
  }
  const extension = getFileExtension(trimmedUri, blob.type);
  const contentType = getContentType(extension, blob.type);
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
  const path = `${params.pathPrefix}/${fileName}`;
  const bucket = params.bucket?.trim() || getStorageBucketName();

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, blob, {
      contentType,
      upsert: true,
    });
  if (uploadError) {
    const status = (uploadError as { statusCode?: number } | null)?.statusCode;
    const details = (uploadError as { error?: string } | null)?.error;
    const parts = [
      uploadError.message,
      details,
      status ? `status ${status}` : null,
      `bucket ${bucket}`,
      `path ${path}`,
    ].filter(Boolean);
    return { publicUrl: null, error: parts.join(' | ') };
  }

  if (bucket === getPrivateStorageBucketName()) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, PRIVATE_URL_TTL_SECONDS);
    if (error) {
      return { publicUrl: null, error: error.message };
    }
    return { publicUrl: data?.signedUrl ?? null };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { publicUrl: data?.publicUrl ?? null };
}
