import { useMemo } from 'react';

export type PreferredLanguage = 'es' | 'en';

const resolveDeviceLanguage = (): PreferredLanguage => {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale || 'es';
    return locale.toLowerCase().startsWith('en') ? 'en' : 'es';
  } catch {
    return 'es';
  }
};

export function usePreferredLanguage(): PreferredLanguage {
  return useMemo(() => resolveDeviceLanguage(), []);
}
