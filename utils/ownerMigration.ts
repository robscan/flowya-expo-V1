/**
 * Owner Migration Utility
 * CANONICAL: Migración única de owners legacy a oscar@agenciaparadigma.com
 * 
 * Esta migración:
 * - Se ejecuta UNA SOLA VEZ
 * - Asigna owner a TODOS los spots sin owner
 * - NO depende de sesión de usuario
 * - Persiste cambios permanentemente
 * - Marca migración como completada
 * 
 * IMPORTANTE: Después de esta migración, el sistema NO debe volver a intentar
 * resolver default owner dinámicamente en runtime.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Spot } from '@/data/spots';
import { supabase } from './supabase';

const OWNER_MIGRATION_KEY = '@flowya_owner_migration_completed';
const DEFAULT_OWNER_EMAIL = 'oscar@agenciaparadigma.com';

/**
 * Constante: userId de Oscar (obtener manualmente desde Supabase Dashboard)
 * 
 * INSTRUCCIONES para obtener este valor:
 * 1. Ir a Supabase Dashboard > Authentication > Users
 * 2. Buscar usuario con email oscar@agenciaparadigma.com
 * 3. Copiar el ID (UUID)
 * 4. Configurar aquí como constante
 * 
 * NOTA: Si no se puede obtener manualmente, la función intentará resolverlo
 * desde auth.getUser() como fallback (requiere que Oscar esté autenticado).
 */
const OSCAR_USER_ID_HARDCODED: string | null = null; // Configurar manualmente si se conoce

/**
 * Resolver userId de Oscar desde Supabase
 * 
 * Estrategia (en orden de prioridad):
 * 1. Valor hardcodeado si está configurado (más confiable)
 * 2. Desde auth.getUser() si el usuario autenticado es Oscar (fallback)
 * 3. null si no se puede resolver
 * 
 * @returns userId de Oscar o null si no se puede resolver
 */
async function resolveOscarUserId(): Promise<string | null> {
  // Opción 1: Usar valor hardcodeado si está configurado (más confiable, no depende de sesión)
  if (OSCAR_USER_ID_HARDCODED) {
    if (__DEV__) {
      console.log(`✅ Using hardcoded Oscar userId: ${OSCAR_USER_ID_HARDCODED}`);
    }
    return OSCAR_USER_ID_HARDCODED;
  }

  // Opción 2: Intentar desde auth.getUser() si está autenticado (fallback)
  // NOTA: Esto requiere que Oscar esté autenticado durante la migración
  if (supabase) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error && user && user.email?.toLowerCase() === DEFAULT_OWNER_EMAIL.toLowerCase()) {
        if (__DEV__) {
          console.log(`✅ Resolved Oscar userId from auth: ${user.id}`);
        }
        return user.id;
      }
    } catch (error) {
      // Ignorar error silenciosamente
    }
  }

  // Opción 3: No se puede resolver
  if (__DEV__) {
    console.warn(
      `⚠️ Cannot resolve userId for ${DEFAULT_OWNER_EMAIL}. ` +
      `Please configure OSCAR_USER_ID_HARDCODED in utils/ownerMigration.ts manually. ` +
      `To get the userId: Supabase Dashboard > Authentication > Users > Find user > Copy ID`
    );
  }
  return null;
}

/**
 * Migrar owners de spots legacy
 * CANONICAL: Ejecutar UNA SOLA VEZ durante carga inicial
 * 
 * Esta función:
 * - Verifica si ya se ejecutó la migración
 * - Si no, resuelve userId de Oscar
 * - Asigna owner a todos los spots sin owner
 * - Marca migración como completada
 * - NO vuelve a ejecutarse
 * 
 * @param spots - Array de spots a migrar
 * @returns Array de spots con owners asignados (si hubo migración) o spots originales
 */
export async function migrateOwnersLegacy(spots: Spot[]): Promise<Spot[]> {
  // Verificar si ya se migró
  const migrated = await AsyncStorage.getItem(OWNER_MIGRATION_KEY);
  if (migrated === 'true') {
    // Ya migrado, retornar spots sin cambios
    return spots;
  }

  if (__DEV__) {
    console.log('🔄 Starting owner migration for legacy spots...');
  }

  // Resolver userId de Oscar
  const oscarUserId = await resolveOscarUserId();
  if (!oscarUserId) {
    // No se puede resolver → no migrar, retornar spots sin cambios
    if (__DEV__) {
      console.warn('⚠️ Cannot resolve Oscar userId. Owner migration skipped.');
    }
    return spots;
  }

  // Contar spots sin owner
  const spotsWithoutOwner = spots.filter((spot) => !spot.createdBy);
  
  if (spotsWithoutOwner.length === 0) {
    // No hay spots sin owner, marcar migración como completada de todas formas
    await AsyncStorage.setItem(OWNER_MIGRATION_KEY, 'true');
    if (__DEV__) {
      console.log('✅ Owner migration: No spots without owner found. Migration marked as completed.');
    }
    return spots;
  }

  // Migrar spots sin owner
  const migratedSpots = spots.map((spot) => {
    if (!spot.createdBy) {
      return {
        ...spot,
        createdBy: oscarUserId,
        updatedAt: new Date(),
      };
    }
    return spot;
  });

  // Marcar migración como completada
  await AsyncStorage.setItem(OWNER_MIGRATION_KEY, 'true');

  const migratedCount = migratedSpots.filter((spot) => spot.createdBy === oscarUserId).length;

  if (__DEV__) {
    console.log(`✅ Owner migration completed: ${migratedCount} spots assigned to ${DEFAULT_OWNER_EMAIL} (${oscarUserId})`);
  }

  return migratedSpots;
}

/**
 * Verificar si la migración de owners ya se completó
 * Útil para debugging o verificación
 */
export async function isOwnerMigrationCompleted(): Promise<boolean> {
  const migrated = await AsyncStorage.getItem(OWNER_MIGRATION_KEY);
  return migrated === 'true';
}

/**
 * Resetear migración de owners (SOLO PARA TESTING/DEBUGGING)
 * NO usar en producción
 */
export async function resetOwnerMigration(): Promise<void> {
  if (__DEV__) {
    await AsyncStorage.removeItem(OWNER_MIGRATION_KEY);
    console.log('⚠️ Owner migration reset (DEBUGGING ONLY)');
  }
}
