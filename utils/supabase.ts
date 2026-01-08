/**
 * Supabase Client
 * Scope 8: Autenticación con Supabase
 * 
 * Cliente de Supabase configurado para autenticación.
 * 
 * Variables de entorno necesarias:
 * - EXPO_PUBLIC_SUPABASE_URL
 * - EXPO_PUBLIC_SUPABASE_ANON_KEY
 * 
 * IMPORTANTE: Para Vercel deployment, estas variables deben estar configuradas
 * en Vercel Environment Variables (Settings > Environment Variables), no en el .env del repo.
 * El código busca primero en process.env (funciona en desarrollo y Vercel) y luego
 * en Constants.expoConfig.extra (para builds nativos).
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// En Expo, las variables de entorno pueden estar en process.env o en Constants.expoConfig.extra
const getEnvVar = (key: string): string => {
  // Primero intentar process.env (funciona en desarrollo y web)
  if (process.env[key]) {
    return process.env[key] || '';
  }
  // Fallback a Constants.expoConfig.extra (para builds nativos)
  if (Constants.expoConfig?.extra?.[key]) {
    return Constants.expoConfig.extra[key] || '';
  }
  return '';
};

const supabaseUrl = getEnvVar('EXPO_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY');

// Solo crear el cliente si las credenciales están configuradas
let supabase: SupabaseClient | null = null;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase credentials not configured. ' +
    'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file'
  );
  // Debug: mostrar qué variables están disponibles
  if (__DEV__) {
    console.log('Available env vars:', {
      hasUrl: !!process.env.EXPO_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      urlLength: supabaseUrl.length,
      keyLength: supabaseAnonKey.length,
    });
  }
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: undefined, // Usaremos AsyncStorage manualmente en AuthContext
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
    if (__DEV__) {
      console.log('✅ Supabase client initialized successfully');
    }
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    supabase = null;
  }
}

// Exportar el cliente o null
export { supabase };
