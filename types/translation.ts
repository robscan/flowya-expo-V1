export type TranslationStatus = 'machine' | 'reviewed' | 'published';
export type TranslationLanguage = 'es' | 'en';

export type TranslationEntityType = 'spot' | 'flow';

export interface TranslationRecord {
  id: string;
  entity_type: TranslationEntityType;
  entity_id: string;
  field: string;
  lang: TranslationLanguage;
  status: TranslationStatus;
  text: string;
  source?: string | null;
  created_at: string;
  updated_at: string;
}
