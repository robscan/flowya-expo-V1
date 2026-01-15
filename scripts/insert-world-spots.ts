/**
 * Script de Inserción de Nuevos Spots del Mundo
 * 
 * Inserta nuevos spots del mundo curados en Supabase
 * Valida duplicados antes de insertar
 */

import { supabase } from '../utils/supabase';

interface NewWorldSpot {
  id: string; // ID canónico estable
  name: string;
  short_description: string; // máx 140 caracteres
  description?: string; // contextual, no turística genérica
  type: string; // 'beach', 'monument', 'park', etc.
  location: {
    lat: number;
    lng: number;
    city: string;
    country: string;
  };
  image: {
    url: string;
    source: string; // 'Unsplash'
    license: string; // 'Unsplash License'
  };
  spot_type: 'world';
  has_generated_content: boolean; // false para spots curados
  created_by: null;
  region?: string; // Riviera Maya, Península de Yucatán, etc.
  category?: string; // 'nature', 'culture', 'beach', 'city', 'unique'
}

async function checkDuplicate(spot: NewWorldSpot): Promise<boolean> {
  if (!supabase) return false;

  // Verificar por ID
  const { data: byId } = await supabase
    .from('spots')
    .select('id')
    .eq('id', spot.id)
    .single();

  if (byId) {
    return true; // Duplicado por ID
  }

  // Verificar por nombre y ubicación cercana (radio ~1km)
  const { data: byLocation } = await supabase
    .from('spots')
    .select('id, name, location')
    .ilike('name', spot.name)
    .limit(10);

  if (byLocation) {
    for (const existing of byLocation) {
      const loc = existing.location as any;
      const existingLat = loc.lat ?? loc.latitude ?? 0;
      const existingLng = loc.lng ?? loc.longitude ?? 0;
      
      // Calcular distancia (aproximada)
      const latDiff = Math.abs(existingLat - spot.location.lat);
      const lngDiff = Math.abs(existingLng - spot.location.lng);
      
      // Si está dentro de ~1km (aproximadamente 0.01 grados)
      if (latDiff < 0.01 && lngDiff < 0.01) {
        return true; // Duplicado por ubicación
      }
    }
  }

  return false; // No es duplicado
}

async function insertWorldSpots(newSpots: NewWorldSpot[], dryRun: boolean = true) {
  if (!supabase) {
    throw new Error('Supabase client no está configurado');
  }

  console.log(`📦 ${dryRun ? 'DRY RUN' : 'EJECUTANDO'} inserción de ${newSpots.length} spots...\n`);

  const results = {
    inserted: 0,
    skipped: 0,
    errors: [] as string[],
    skippedSpots: [] as string[],
  };

  for (const spot of newSpots) {
    try {
      // Validar campos obligatorios
      if (!spot.id || !spot.name || !spot.short_description || !spot.location || !spot.image) {
        results.errors.push(`Spot ${spot.id || 'sin ID'}: Campos obligatorios faltantes`);
        results.skipped++;
        continue;
      }

      // Validar short_description (máx 140 caracteres)
      if (spot.short_description.length > 140) {
        results.errors.push(`Spot ${spot.id}: short_description excede 140 caracteres (${spot.short_description.length})`);
        results.skipped++;
        continue;
      }

      // Verificar duplicados
      const isDuplicate = await checkDuplicate(spot);
      if (isDuplicate) {
        console.log(`⏭️  Saltando ${spot.id} - ${spot.name} (duplicado)`);
        results.skipped++;
        results.skippedSpots.push(spot.id);
        continue;
      }

      if (dryRun) {
        console.log(`✅ [DRY RUN] Insertaría: ${spot.id} - ${spot.name}`);
        results.inserted++;
        continue;
      }

      // Insertar spot
      const { error } = await supabase
        .from('spots')
        .insert({
          id: spot.id,
          name: spot.name,
          type: spot.type,
          location: spot.location,
          short_description: spot.short_description,
          description: spot.description || null,
          image: spot.image,
          spot_type: 'world',
          has_generated_content: false,
          created_by: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        results.errors.push(`Spot ${spot.id}: ${error.message}`);
        results.skipped++;
      } else {
        console.log(`✅ Insertado: ${spot.id} - ${spot.name}`);
        results.inserted++;
      }

    } catch (error: any) {
      results.errors.push(`Spot ${spot.id}: ${error.message || String(error)}`);
      results.skipped++;
    }
  }

  return results;
}

export { insertWorldSpots, NewWorldSpot };
