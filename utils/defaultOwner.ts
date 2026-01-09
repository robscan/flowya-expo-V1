/**
 * Default Owner Utility
 * 
 * ⚠️ DEPRECATED: Esta función ya NO se usa en el código.
 * 
 * Los owners legacy se migran usando utils/ownerMigration.ts (migración única permanente).
 * Los spots nuevos usan user.id del usuario autenticado directamente.
 * 
 * Este archivo se mantiene solo para referencia histórica.
 * NO usar getDefaultOwnerId() en código nuevo.
 * 
 * @deprecated Use utils/ownerMigration.ts for legacy owner migration instead
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const DEFAULT_OWNER_EMAIL = 'oscar@agenciaparadigma.com';
const DEFAULT_OWNER_STORAGE_KEY = '@flowya_default_owner_id';

// Cache en memoria del userId resuelto
let cachedDefaultOwnerId: string | null = null;
let isResolvingDefaultOwner = false;

/**
 * Resuelve el userId del usuario por defecto desde el usuario autenticado actual
 * Primero intenta desde AsyncStorage (ya resuelto previamente)
 * Luego intenta desde supabase.auth.getUser()
 * Solo asigna owner si el usuario autenticado es oscar@agenciaparadigma.com
 * @returns userId del usuario oscar@agenciaparadigma.com o null si no se encuentra
 */
async function resolveDefaultOwnerId(): Promise<string | null> {
  // Retornar cache si ya está resuelto
  if (cachedDefaultOwnerId !== null) {
    return cachedDefaultOwnerId;
  }

  // Evitar múltiples consultas simultáneas
  if (isResolvingDefaultOwner) {
    // Esperar un poco y reintentar (otra consulta podría estar en curso)
    await new Promise(resolve => setTimeout(resolve, 100));
    if (cachedDefaultOwnerId !== null) {
      return cachedDefaultOwnerId;
    }
  }

  isResolvingDefaultOwner = true;

  try {
    // 1. Intentar cargar desde AsyncStorage (ya resuelto previamente)
    const stored = await AsyncStorage.getItem(DEFAULT_OWNER_STORAGE_KEY);
    if (stored) {
      cachedDefaultOwnerId = stored;
      isResolvingDefaultOwner = false;
      return stored;
    }

    // 2. Resolver desde usuario autenticado actual
    if (!supabase) {
      if (__DEV__) {
        console.warn('⚠️ Supabase not configured. Cannot resolve default owner ID.');
      }
      isResolvingDefaultOwner = false;
      return null;
    }

    // Obtener usuario autenticado actual
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      if (__DEV__) {
        console.warn('⚠️ No authenticated user. Cannot resolve default owner ID.');
      }
      isResolvingDefaultOwner = false;
      return null;
    }

    // Verificar si el email es oscar@agenciaparadigma.com
    if (user.email?.toLowerCase() === DEFAULT_OWNER_EMAIL.toLowerCase()) {
      cachedDefaultOwnerId = user.id;
      // Guardar en AsyncStorage para próxima vez
      await AsyncStorage.setItem(DEFAULT_OWNER_STORAGE_KEY, user.id);
      isResolvingDefaultOwner = false;
      return user.id;
    }

    // Usuario autenticado pero no es el owner por defecto
    if (__DEV__) {
      console.warn(`⚠️ Authenticated user (${user.email}) is not the default owner. No owner assigned to legacy spots.`);
    }
    isResolvingDefaultOwner = false;
    return null;
  } catch (error) {
    if (__DEV__) {
      console.error('Error resolving default owner ID:', error);
    }
    isResolvingDefaultOwner = false;
    return null;
  }
}

/**
 * Obtiene el userId por defecto
 * 
 * ⚠️ DEPRECATED: Esta función ya NO se usa en el código.
 * Los owners legacy se migran usando utils/ownerMigration.ts (migración única permanente).
 * 
 * @deprecated Use utils/ownerMigration.ts for legacy owner migration instead
 * @returns userId resuelto o string vacío si no se puede resolver
 */
export async function getDefaultOwnerId(): Promise<string> {
  if (__DEV__) {
    console.warn(
      '⚠️ DEPRECATED: getDefaultOwnerId() is deprecated. ' +
      'Use utils/ownerMigration.ts for legacy owner migration instead.'
    );
  }
  
  const resolvedId = await resolveDefaultOwnerId();
  
  if (resolvedId) {
    return resolvedId;
  }

  // Si no se puede resolver, retornar string vacío
  if (__DEV__) {
    console.warn('⚠️ Cannot resolve default owner ID.');
  }
  return '';
}

/**
 * Establece el userId del usuario por defecto manualmente
 * Útil cuando se resuelve el userId desde otra fuente (config, admin, etc.)
 * @param userId userId del usuario por defecto
 */
export async function setDefaultOwnerId(userId: string): Promise<void> {
  cachedDefaultOwnerId = userId;
  await AsyncStorage.setItem(DEFAULT_OWNER_STORAGE_KEY, userId);
}
