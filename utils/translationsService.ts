import { supabase } from '@/utils/supabase';
import type { TranslationLanguage, TranslationRecord, TranslationEntityType, TranslationStatus } from '@/types/translation';
import { generateTranslation } from '@/utils/translationGenerator';

export async function fetchPublishedTranslations(params: {
  entityType: TranslationEntityType;
  entityId: string;
  lang: TranslationLanguage;
}): Promise<{ data: TranslationRecord[]; error?: string }> {
  if (!supabase) {
    return { data: [], error: 'Supabase not configured' };
  }

  const { data, error } = await supabase
    .from('translations')
    .select('*')
    .eq('entity_type', params.entityType)
    .eq('entity_id', params.entityId)
    .eq('lang', params.lang)
    .eq('status', 'published');

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: (data || []) as TranslationRecord[] };
}

export function buildTranslationMap(records: TranslationRecord[]): Record<string, string> {
  return records.reduce<Record<string, string>>((acc, record) => {
    acc[record.field] = record.text;
    return acc;
  }, {});
}

export function resolveTranslatedField(params: {
  translations: Record<string, string>;
  field: string;
  fallback: string;
}): string {
  return params.translations[params.field] || params.fallback;
}

export async function upsertTranslation(params: {
  entityType: TranslationEntityType;
  entityId: string;
  field: string;
  lang: TranslationLanguage;
  status: TranslationStatus;
  text: string;
  source?: string | null;
}): Promise<{ data: TranslationRecord | null; error?: string }> {
  if (!supabase) {
    return { data: null, error: 'Supabase not configured' };
  }

  const { data, error } = await supabase
    .from('translations')
    .upsert({
      entity_type: params.entityType,
      entity_id: params.entityId,
      field: params.field,
      lang: params.lang,
      status: params.status,
      text: params.text,
      source: params.source ?? null,
    })
    .select('*')
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as TranslationRecord };
}

export async function createMachineTranslation(params: {
  entityType: TranslationEntityType;
  entityId: string;
  field: string;
  text: string;
}): Promise<{ data: TranslationRecord | null; error?: string }> {
  const generated = await generateTranslation({
    text: params.text,
    sourceLang: 'es',
    targetLang: 'en',
  });

  if (generated.error || !generated.translation) {
    return { data: null, error: generated.error || 'Translation failed' };
  }

  return upsertTranslation({
    entityType: params.entityType,
    entityId: params.entityId,
    field: params.field,
    lang: 'en',
    status: 'machine',
    text: generated.translation,
    source: 'ai',
  });
}
