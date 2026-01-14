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

const supabaseUrl = getEnvVar('EXPO_PUBLIC_SUPABASE_URL');
// Buscar ambas variantes: EXPO_PUBLIC_SUPABASE_ANON_KEY o EXPO_PUBLIC_SUPABASE_KEY
const supabaseAnonKey = getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY') || getEnvVar('EXPO_PUBLIC_SUPABASE_KEY');

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
        // Nota: Cuando la verificación de email está habilitada, Supabase puede intentar
        // hacer sign-in automáticamente internamente después de signUp, lo cual genera
        // un error 400 esperado en la consola. Este error no afecta el flujo ya que
        // manejamos correctamente el caso de verificación de email requerida en AuthContext.
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
