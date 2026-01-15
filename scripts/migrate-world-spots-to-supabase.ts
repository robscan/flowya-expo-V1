/**
 * Script para Migrar/Marcar Spots del Mundo en Supabase
 * 
 * 1. Inserta spots del seedSpots.v1.2.json en Supabase con spot_type = 'world'
 * 2. Marca spots existentes como 'world' si coinciden con seeds
 * 3. Valida que todos los spots del mundo estén en Supabase
 */

import { supabase } from '../utils/supabase';
import seedSpots from '../data/seedSpots.v1.2.json';

interface WorldSpot {
  id: string;
  name: string;
  type: string;
  location: {
    lat: number;
    lng: number;
    city?: string;
    country?: string;
  };
  shortDescription: string;
  image: {
    url: string;
    source?: string;
    license?: string;
  };
  hasGeneratedContent: boolean;
}

async function migrateWorldSpotsToSupabase(dryRun: boolean = true) {
  if (!supabase) {
    throw new Error('Supabase client no está configurado');
  }

  console.log(`🌍 ${dryRun ? 'DRY RUN' : 'EJECUTANDO'} migración de spots del mundo...\n`);

  const results = {
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: [] as string[],
  };

  try {
    // Convertir seedSpots a formato Supabase
    const worldSpots: WorldSpot[] = seedSpots as any[];

    console.log(`📦 Procesando ${worldSpots.length} spots del mundo...\n`);

    for (const spot of worldSpots) {
      try {
        // Verificar si el spot ya existe
        const { data: existing, error: fetchError } = await supabase
          .from('spots')
          .select('id, spot_type')
          .eq('id', spot.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
          results.errors.push(`Spot ${spot.id}: Error verificando existencia: ${fetchError.message}`);
          results.skipped++;
          continue;
        }

        if (existing) {
          // Spot existe, actualizar spot_type a 'world' si no lo es
          if (existing.spot_type !== 'world') {
            if (dryRun) {
              console.log(`🔄 [DRY RUN] Actualizaría spot_type a 'world': ${spot.id} - ${spot.name}`);
            } else {
              const { error: updateError } = await supabase
                .from('spots')
                .update({ spot_type: 'world' })
                .eq('id', spot.id);

              if (updateError) {
                results.errors.push(`Spot ${spot.id}: Error actualizando: ${updateError.message}`);
                results.skipped++;
              } else {
                console.log(`✅ Actualizado: ${spot.id} - ${spot.name}`);
                results.updated++;
              }
            }
          } else {
            console.log(`⏭️  Ya es spot del mundo: ${spot.id} - ${spot.name}`);
            results.skipped++;
          }
        } else {
          // Spot no existe, insertarlo
          if (dryRun) {
            console.log(`➕ [DRY RUN] Insertaría: ${spot.id} - ${spot.name}`);
          } else {
            const { error: insertError } = await supabase
              .from('spots')
              .insert({
                id: spot.id,
                name: spot.name,
                type: spot.type,
                location: spot.location,
                short_description: spot.shortDescription,
                image: spot.image,
                spot_type: 'world',
                has_generated_content: spot.hasGeneratedContent || false,
                created_by: null,
                created_at: spot.createdAt || new Date().toISOString(),
                updated_at: spot.updatedAt || new Date().toISOString(),
              });

            if (insertError) {
              results.errors.push(`Spot ${spot.id}: Error insertando: ${insertError.message}`);
              results.skipped++;
            } else {
              console.log(`✅ Insertado: ${spot.id} - ${spot.name}`);
              results.inserted++;
            }
          }
        }

      } catch (error: any) {
        results.errors.push(`Spot ${spot.id}: ${error.message || String(error)}`);
        results.skipped++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESULTADO DE MIGRACIÓN');
    console.log('='.repeat(60));
    console.log(`Insertados: ${results.inserted}`);
    console.log(`Actualizados: ${results.updated}`);
    console.log(`Saltados: ${results.skipped}`);
    console.log(`Errores: ${results.errors.length}`);
    if (results.errors.length > 0) {
      console.log('\nErrores:');
      results.errors.forEach(err => console.log(`  - ${err}`));
    }

    return results;

  } catch (error: any) {
    console.error('❌ Error en migración:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const dryRun = process.argv.includes('--dry-run') || process.argv.includes('--dryrun');
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(dryRun ? '🔍 MODO DRY RUN' : '⚠️ MODO EJECUCIÓN REAL');
  console.log('='.repeat(60) + '\n');

  migrateWorldSpotsToSupabase(dryRun)
    .then(() => {
      console.log('\n✅ Migración completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

export { migrateWorldSpotsToSupabase };
