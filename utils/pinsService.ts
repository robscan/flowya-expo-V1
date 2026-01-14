/**
 * Pins Service - Servicio para interactuar con Supabase para Pins
 * V1.3: Persistencia server-side de Pins
 * 
 * Este servicio maneja todas las operaciones de Pins con Supabase,
 * incluyendo creación, actualización, eliminación y sincronización.
 */

import { supabase } from './supabase';
import type { PinData, PinState } from '@/contexts/SavedContext';

export interface SupabasePin {
  id: string;
  spot_id: string;
  user_id: string;
  state: PinState;
  pinned_at: string; // ISO string
  visited_at: string | null; // ISO string o null
  notes: string | null;
  personal_photos: string[] | null; // JSON array
  created_at: string;
  updated_at: string;
}

/**
 * Convertir PinData (formato local) a formato Supabase
 * 
 * V1.3: Manejo de timestamps según decisiones canónicas:
 * - Con conexión: Supabase genera timestamps automáticamente (server-generated)
 * - Modo offline: Usamos timestamps del cliente que se reconciliarán al sincronizar
 * 
 * Para upsert, enviamos los timestamps del cliente, pero Supabase puede sobrescribirlos
 * si hay conflicto (Last-Write-Wins con timestamp del servidor como fuente de verdad).
 */
function pinDataToSupabase(pin: PinData, userId: string): Omit<SupabasePin, 'id' | 'created_at' | 'updated_at'> {
  return {
    spot_id: pin.spotId,
    user_id: userId,
    state: pin.state,
    // V1.3: Enviar timestamp del cliente (será reconciliado por Supabase si hay conflicto)
    pinned_at: pin.pinnedAt.toISOString(),
    visited_at: pin.visitedAt ? pin.visitedAt.toISOString() : null,
    notes: pin.notes || null,
    personal_photos: pin.personalPhotos || null,
  };
}

/**
 * Convertir SupabasePin a PinData (formato local)
 */
function supabaseToPinData(supabasePin: SupabasePin): PinData {
  return {
    spotId: supabasePin.spot_id,
    state: supabasePin.state,
    pinnedAt: new Date(supabasePin.pinned_at),
    visitedAt: supabasePin.visited_at ? new Date(supabasePin.visited_at) : undefined,
    notes: supabasePin.notes || undefined,
    personalPhotos: supabasePin.personal_photos || undefined,
  };
}

/**
 * Obtener todos los pins del usuario actual desde Supabase
 */
export async function fetchUserPins(userId: string): Promise<Record<string, PinData>> {
  if (!supabase) {
    console.warn('Supabase not configured, returning empty pins');
    return {};
  }

  try {
    const { data, error } = await supabase
      .from('pins')
      .select('*')
      .eq('user_id', userId)
      .order('pinned_at', { ascending: false });

    if (error) {
      console.error('Error fetching pins from Supabase:', error);
      return {};
    }

    if (!data) {
      return {};
    }

    // Convertir a formato local
    const pins: Record<string, PinData> = {};
    data.forEach((pin) => {
      const pinData = supabaseToPinData(pin as SupabasePin);
      pins[pinData.spotId] = pinData;
    });

    return pins;
  } catch (error) {
    console.error('Error in fetchUserPins:', error);
    return {};
  }
}

/**
 * Crear o actualizar un Pin en Supabase (upsert)
 * Usa spot_id + user_id como clave única
 */
export async function upsertPin(pin: PinData, userId: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    console.warn('Supabase not configured, pin not saved to server');
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const pinData = pinDataToSupabase(pin, userId);

    // V1.3: Usar upsert con onConflict para manejar actualización si ya existe
    // Timestamps: Enviamos timestamps del cliente, Supabase los reconciliará según Last-Write-Wins
    // Con conexión: Supabase puede generar timestamps server-side si hay conflicto
    // Modo offline: Timestamps del cliente se usarán y reconciliarán al sincronizar
    const { error } = await supabase
      .from('pins')
      .upsert(
        {
          ...pinData,
          // updated_at se actualiza automáticamente por trigger en DB
          // pinned_at y visited_at se envían desde cliente, servidor puede reconciliar
        },
        {
          onConflict: 'spot_id,user_id',
          ignoreDuplicates: false,
        }
      );

    if (error) {
      console.error('Error upserting pin to Supabase:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in upsertPin:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Eliminar un Pin de Supabase
 */
export async function deletePin(spotId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    console.warn('Supabase not configured, pin not deleted from server');
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabase
      .from('pins')
      .delete()
      .eq('spot_id', spotId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting pin from Supabase:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deletePin:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Migrar pins desde AsyncStorage a Supabase
 */
export async function migratePinsToSupabase(
  localPins: Record<string, PinData>,
  userId: string
): Promise<{ success: boolean; migrated: number; errors: number }> {
  if (!supabase) {
    console.warn('Supabase not configured, migration skipped');
    return { success: false, migrated: 0, errors: 0 };
  }

  let migrated = 0;
  let errors = 0;

  try {
    // Migrar todos los pins en batch
    const pinsToMigrate = Object.values(localPins);
    
    for (const pin of pinsToMigrate) {
      const result = await upsertPin(pin, userId);
      if (result.success) {
        migrated++;
      } else {
        errors++;
        console.error(`Failed to migrate pin for spot ${pin.spotId}:`, result.error);
      }
    }

    return { success: errors === 0, migrated, errors };
  } catch (error) {
    console.error('Error in migratePinsToSupabase:', error);
    return { success: false, migrated, errors };
  }
}
