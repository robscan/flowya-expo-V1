/**
 * Hook para cargar el script de Mapbox Search Box
 * Solo se carga en web (Platform.OS === 'web')
 * 
 * El script se carga una sola vez y se reutiliza en toda la aplicación
 */

import { useEffect, useState, useRef } from 'react';
import { Platform } from 'react-native';

interface UseMapboxSearchBoxScriptResult {
  isLoaded: boolean;
  isLoading: boolean;
  error: Error | null;
}

const SCRIPT_URL = 'https://api.mapbox.com/search-js/v1.5.0/web.js';
const SCRIPT_ID = 'mapbox-search-js';

// Estado global para evitar cargar el script múltiples veces
let globalScriptState: {
  isLoaded: boolean;
  isLoading: boolean;
  error: Error | null;
} = {
  isLoaded: false,
  isLoading: false,
  error: null,
};

// Listeners para notificar cuando el script se carga
const loadListeners: Set<() => void> = new Set();
const errorListeners: Set<(error: Error) => void> = new Set();

/**
 * Hook para cargar el script de Mapbox Search Box
 * Solo funciona en web, retorna estado inmediato en native
 */
export function useMapboxSearchBoxScript(): UseMapboxSearchBoxScriptResult {
  const [state, setState] = useState<UseMapboxSearchBoxScriptResult>({
    isLoaded: globalScriptState.isLoaded,
    isLoading: globalScriptState.isLoading,
    error: globalScriptState.error,
  });

  const hasSubscribedRef = useRef(false);

  useEffect(() => {
    // En native, retornar estado inmediato (no se carga nada)
    if (Platform.OS !== 'web') {
      return;
    }

    // Si ya está cargado, retornar inmediatamente
    if (globalScriptState.isLoaded) {
      setState({
        isLoaded: true,
        isLoading: false,
        error: null,
      });
      return;
    }

    // Si hay error, retornar error
    if (globalScriptState.error) {
      setState({
        isLoaded: false,
        isLoading: false,
        error: globalScriptState.error,
      });
      return;
    }

    // Si ya se está cargando, suscribirse a eventos
    if (globalScriptState.isLoading) {
      if (!hasSubscribedRef.current) {
        hasSubscribedRef.current = true;

        const onLoad = () => {
          setState({
            isLoaded: true,
            isLoading: false,
            error: null,
          });
          loadListeners.delete(onLoad);
          errorListeners.delete(onError);
        };

        const onError = (err: Error) => {
          setState({
            isLoaded: false,
            isLoading: false,
            error: err,
          });
          loadListeners.delete(onLoad);
          errorListeners.delete(onError);
        };

        loadListeners.add(onLoad);
        errorListeners.add(onError);
      }
      return;
    }

    // Iniciar carga del script
    globalScriptState.isLoading = true;
    setState({
      isLoaded: false,
      isLoading: true,
      error: null,
    });

    // Verificar si el script ya existe en el DOM
    const existingScript = document.getElementById(SCRIPT_ID);
    if (existingScript) {
      // Script ya existe, verificar si está cargado
      if (window.mapboxsearch) {
        globalScriptState.isLoaded = true;
        globalScriptState.isLoading = false;
        setState({
          isLoaded: true,
          isLoading: false,
          error: null,
        });
        return;
      }
      // Script existe pero no está cargado, esperar al evento load
      existingScript.addEventListener('load', () => {
        globalScriptState.isLoaded = true;
        globalScriptState.isLoading = false;
        setState({
          isLoaded: true,
          isLoading: false,
          error: null,
        });
        loadListeners.forEach((listener) => listener());
        loadListeners.clear();
      });
      existingScript.addEventListener('error', () => {
        const error = new Error('Failed to load Mapbox Search Box script');
        globalScriptState.error = error;
        globalScriptState.isLoading = false;
        setState({
          isLoaded: false,
          isLoading: false,
          error,
        });
        errorListeners.forEach((listener) => listener(error));
        errorListeners.clear();
      });
      return;
    }

    // Crear y cargar el script
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = SCRIPT_URL;
    script.defer = true;

    script.onload = () => {
      globalScriptState.isLoaded = true;
      globalScriptState.isLoading = false;
      setState({
        isLoaded: true,
        isLoading: false,
        error: null,
      });
      loadListeners.forEach((listener) => listener());
      loadListeners.clear();
    };

    script.onerror = () => {
      const error = new Error('Failed to load Mapbox Search Box script');
      globalScriptState.error = error;
      globalScriptState.isLoading = false;
      setState({
        isLoaded: false,
        isLoading: false,
        error,
      });
      errorListeners.forEach((listener) => listener(error));
      errorListeners.clear();
    };

    document.head.appendChild(script);

    // Cleanup: remover listeners si el componente se desmonta
    return () => {
      if (hasSubscribedRef.current) {
        loadListeners.forEach((listener) => {
          // No remover aquí, se remueven cuando se ejecutan
        });
        errorListeners.forEach((listener) => {
          // No remover aquí, se remueven cuando se ejecutan
        });
      }
    };
  }, []);

  return state;
}
