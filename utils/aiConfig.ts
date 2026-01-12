/**
 * AI Configuration
 * Scope 12.1: Configuración de OpenAI API para generación de contenido
 * 
 * Configuración y validación de API key de OpenAI
 * 
 * IMPORTANTE: Usa el mismo patrón que supabase.ts y mapsConfig.ts para funcionar
 * en desarrollo local y en builds estáticos (expo export / Vercel).
 * 
 * Variables de entorno necesarias:
 * - EXPO_PUBLIC_OPENAI_API_KEY (definida en Vercel o .env local)
 */

import Constants from 'expo-constants';

const OPENAI_MODEL = 'gpt-4o'; // Usar gpt-4o si está disponible, sino gpt-4-turbo-preview

// ARQUITECTÓNICO: Priorizar Constants.expoConfig.extra para builds estáticos (expo export)
// En builds estáticos, process.env se evalúa en build time y puede estar undefined
// app.config.js inyecta las variables en expoConfig.extra, disponibles en runtime
// SCOPE 0.2: Mejorar lectura para priorizar correctamente todas las fuentes
// NOTA: Expo no permite acceso dinámico a process.env, usar acceso directo
const getOpenAIKey = (): string => {
  // PRIORIDAD 1: Constants.expoConfig.extra (build time injection desde app.config.js)
  // Esto funciona en builds estáticos donde process.env puede estar congelado
  const fromExtra = Constants.expoConfig?.extra?.EXPO_PUBLIC_OPENAI_API_KEY;
  if (fromExtra && typeof fromExtra === 'string' && fromExtra.trim().length > 0) {
    return fromExtra.trim();
  }
  
  // PRIORIDAD 2: process.env (runtime, funciona en desarrollo con expo start)
  // Acceso directo (no dinámico) para cumplir con eslint-plugin-expo
  const fromEnv = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (fromEnv && typeof fromEnv === 'string' && fromEnv.trim().length > 0) {
    return fromEnv.trim();
  }
  
  // Retornar cadena vacía si no se encuentra en ninguna fuente
  return '';
};

const OPENAI_API_KEY = getOpenAIKey();

export interface AIConfig {
  apiKey: string | undefined;
  model: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
}

export const aiConfig: AIConfig = {
  apiKey: OPENAI_API_KEY || undefined,
  model: OPENAI_MODEL,
  maxTokens: 1000,
  temperature: 0.7, // Balance entre creatividad y precisión
  timeout: 30000, // 30 segundos
};

// Variable estática para mostrar el warning solo una vez
let hasShownWarning = false;

/**
 * Validar que la API key esté configurada
 * SCOPE 0: Logging (sin exponer la key) y validación explícita
 */
export function isAIConfigured(): boolean {
  const hasKey = !!aiConfig.apiKey && aiConfig.apiKey.trim().length > 0;
  
  // Solo mostrar warning una vez en desarrollo cuando no está configurado
  if (__DEV__ && !hasKey && !hasShownWarning) {
    hasShownWarning = true;
    console.warn('[AI Config] OpenAI API key NOT configured. Set EXPO_PUBLIC_OPENAI_API_KEY in .env or Vercel Environment Variables');
  }
  
  return hasKey;
}

/**
 * Obtener mensaje de error si la API key no está configurada
 */
export function getAIConfigError(): string | null {
  if (!isAIConfigured()) {
    return 'OpenAI API key not configured. Please set EXPO_PUBLIC_OPENAI_API_KEY in .env or Vercel Environment Variables';
  }
  return null;
}

/**
 * Rate limiting básico
 * Nota: En producción, esto debería manejarse en el backend
 */
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 segundos entre requests

export function canMakeRequest(): boolean {
  const now = Date.now();
  if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
    return false;
  }
  lastRequestTime = now;
  return true;
}

