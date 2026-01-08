/**
 * useLocations Hook
 * Hook para cargar todas las ubicaciones disponibles
 * 
 * Características:
 * - Independiente de spots context
 * - Carga ubicaciones directamente desde la base de datos
 * - Maneja estados: loading, empty, success
 */

import { useEffect, useState } from 'react';
import { getAllLocations, PredefinedCity } from '@/utils/geocoding';

export function useLocations() {
  const [locations, setLocations] = useState<PredefinedCity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadLocations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allLocations = await getAllLocations();
      setLocations(allLocations);
    } catch (err) {
      console.error('Error loading locations:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLocations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  return {
    locations,
    isLoading,
    error,
    refresh: loadLocations,
  };
}
