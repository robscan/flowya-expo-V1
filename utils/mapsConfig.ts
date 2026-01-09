/**
 * Maps Configuration
 * Configuración de Mapbox Access Token
 * 
 * Para obtener el Access Token:
 * 1. Ve a https://account.mapbox.com/
 * 2. Crea una cuenta o inicia sesión
 * 3. Navega a Access Tokens
 * 4. Crea un nuevo token o usa el token por defecto
 * 5. Configura las restricciones del token según tu app
 * 
 * Variables de entorno necesarias:
 * - EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN
 */

import Constants from 'expo-constants';

/**
 * Feature flag para usar Mapbox como servicio de mapas
 */
export const USE_MAPBOX = true;

// Helper para obtener variables de entorno (similar a supabase.ts)
// ARQUITECTÓNICO: Priorizar Constants.expoConfig.extra para builds estáticos (expo export)
// En builds estáticos, process.env se evalúa en build time y puede estar undefined
// app.config.js inyecta las variables en expoConfig.extra, disponibles en runtime
const getEnvVar = (key: string): string => {
  // PRIORIDAD 1: Constants.expoConfig.extra (build time injection desde app.config.js)
  // Esto funciona en builds estáticos donde process.env puede estar congelado
  if (Constants.expoConfig?.extra?.[key]) {
    return Constants.expoConfig.extra[key] || '';
  }
  // PRIORIDAD 2: process.env (runtime, funciona en desarrollo con expo start)
  if (process.env[key]) {
    return process.env[key] || '';
  }
  return '';
};

// Mapbox Access Token
export const MAPBOX_ACCESS_TOKEN = getEnvVar('EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN');

/**
 * Verifica si Mapbox está configurado
 */
export function isMapboxConfigured(): boolean {
  const hasToken = !!MAPBOX_ACCESS_TOKEN;
  
  if (__DEV__ && !hasToken) {
    console.warn(
      '⚠️ Mapbox Access Token not configured. ' +
      'Set EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN in your .env file'
    );
  }
  
  return hasToken;
}

/**
 * Obtiene información sobre el estado de configuración de Mapbox
 */
export function getMapsConfigStatus(): {
  mapbox: boolean;
} {
  return {
    mapbox: isMapboxConfigured(),
  };
}

