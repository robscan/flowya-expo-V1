import { useEffect, useState } from 'react';

import type { TranslationEntityType } from '@/types/translation';
import { buildTranslationMap, fetchPublishedTranslations } from '@/utils/translationsService';
import { usePreferredLanguage } from '@/hooks/usePreferredLanguage';

export function useEntityTranslations(params: {
  entityType: TranslationEntityType;
  entityId: string | null;
}) {
  const language = usePreferredLanguage();
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadTranslations = async () => {
      if (!params.entityId || language === 'es') {
        setTranslations({});
        return;
      }
      setIsLoading(true);
      const result = await fetchPublishedTranslations({
        entityType: params.entityType,
        entityId: params.entityId,
        lang: language,
      });
      if (result.error) {
        setTranslations({});
        setIsLoading(false);
        return;
      }
      setTranslations(buildTranslationMap(result.data));
      setIsLoading(false);
    };

    loadTranslations();
  }, [params.entityType, params.entityId, language]);

  return {
    language,
    translations,
    isLoading,
  };
}
