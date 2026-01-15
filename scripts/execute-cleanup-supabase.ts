/**
 * Script de Ejecución Directa para Actualizar Supabase
 * 
 * Ejecuta todas las operaciones necesarias para limpiar y actualizar spots
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Leer variables de entorno
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no configuradas');
  console.error('Necesitas: EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeCleanup() {
  console.log('='.repeat(60));
  console.log('🚀 EJECUTANDO LIMPIEZA Y ACTUALIZACIÓN DE SPOTS');
  console.log('='.repeat(60));
  console.log();

  try {
    // PASO 1: Verificar/Agregar campo spot_type
    console.log('📋 PASO 1: Verificando campo spot_type...');
    // Nota: ALTER TABLE requiere permisos de administrador
    // Si no tienes acceso, ejecuta manualmente en Supabase SQL Editor:
    // ALTER TABLE spots ADD COLUMN IF NOT EXISTS spot_type TEXT DEFAULT NULL;
    console.log('⚠️  Nota: Ejecuta manualmente en Supabase SQL Editor:');
    console.log('   supabase/migrations/002_add_spot_type_column.sql');
    console.log();

    // PASO 2: Analizar spots existentes
    console.log('📊 PASO 2: Analizando spots existentes...');
    const { data: allSpots, error: spotsError } = await supabase
      .from('spots')
      .select('*');

    if (spotsError) {
      throw new Error(`Error obteniendo spots: ${spotsError.message}`);
    }

    if (!allSpots || allSpots.length === 0) {
      console.log('ℹ️  No hay spots en la base de datos');
      return;
    }

    console.log(`✅ Encontrados ${allSpots.length} spots\n`);

    // Clasificar spots
    const worldSpots = allSpots.filter(s => s.spot_type === 'world');
    const nonWorldSpots = allSpots.filter(s => !s.spot_type || s.spot_type !== 'world');

    console.log(`   Spots del mundo: ${worldSpots.length}`);
    console.log(`   Spots a eliminar: ${nonWorldSpots.length}`);

    // Verificar pins asociados
    if (nonWorldSpots.length > 0) {
      const spotIdsToDelete = nonWorldSpots.map(s => s.id.toString());
      const { data: pinsToDelete, error: pinsError } = await supabase
        .from('pins')
        .select('id, spot_id')
        .in('spot_id', spotIdsToDelete);

      if (pinsError) {
        console.warn('⚠️  Error obteniendo pins:', pinsError.message);
      } else {
        console.log(`   Pins asociados a eliminar: ${pinsToDelete?.length || 0}\n`);
      }

      // PASO 3: Eliminar pins primero
      if (pinsToDelete && pinsToDelete.length > 0) {
        console.log(`🗑️  PASO 3: Eliminando ${pinsToDelete.length} pins...`);
        const pinIds = pinsToDelete.map(p => p.id);
        const { error: deletePinsError } = await supabase
          .from('pins')
          .delete()
          .in('id', pinIds);

        if (deletePinsError) {
          console.error('❌ Error eliminando pins:', deletePinsError.message);
        } else {
          console.log(`✅ ${pinsToDelete.length} pins eliminados\n`);
        }
      }

      // PASO 4: Eliminar spots NO del mundo
      console.log(`🗑️  PASO 4: Eliminando ${nonWorldSpots.length} spots NO del mundo...`);
      const { error: deleteSpotsError } = await supabase
        .from('spots')
        .delete()
        .in('id', nonWorldSpots.map(s => s.id));

      if (deleteSpotsError) {
        console.error('❌ Error eliminando spots:', deleteSpotsError.message);
      } else {
        console.log(`✅ ${nonWorldSpots.length} spots eliminados\n`);
      }
    } else {
      console.log('✅ No hay spots a eliminar\n');
    }

    // PASO 5: Migrar spots del mundo desde seedSpots.v1.2.json
    console.log('🌍 PASO 5: Migrando spots del mundo desde seedSpots.v1.2.json...');
    const seedSpotsPath = path.join(__dirname, '../data/seedSpots.v1.2.json');
    const seedSpots = JSON.parse(fs.readFileSync(seedSpotsPath, 'utf-8'));

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (const seedSpot of seedSpots) {
      // Verificar si existe
      const { data: existing } = await supabase
        .from('spots')
        .select('id, spot_type')
        .eq('id', seedSpot.id)
        .single();

      if (existing) {
        // Actualizar spot_type si no es 'world'
        if (existing.spot_type !== 'world') {
          const { error: updateError } = await supabase
            .from('spots')
            .update({ spot_type: 'world' })
            .eq('id', seedSpot.id);

          if (updateError) {
            console.warn(`⚠️  Error actualizando ${seedSpot.id}: ${updateError.message}`);
            skipped++;
          } else {
            updated++;
          }
        } else {
          skipped++;
        }
      } else {
        // Insertar nuevo spot
        const { error: insertError } = await supabase
          .from('spots')
          .insert({
            id: seedSpot.id,
            name: seedSpot.name,
            type: seedSpot.type,
            location: seedSpot.location,
            short_description: seedSpot.shortDescription,
            image: seedSpot.image,
            spot_type: 'world',
            has_generated_content: seedSpot.hasGeneratedContent || false,
            created_by: null,
            created_at: seedSpot.createdAt || new Date().toISOString(),
            updated_at: seedSpot.updatedAt || new Date().toISOString(),
          });

        if (insertError) {
          console.warn(`⚠️  Error insertando ${seedSpot.id}: ${insertError.message}`);
          skipped++;
        } else {
          inserted++;
        }
      }
    }

    console.log(`✅ Migración completada:`);
    console.log(`   Insertados: ${inserted}`);
    console.log(`   Actualizados: ${updated}`);
    console.log(`   Saltados: ${skipped}\n`);

    // PASO 6: Insertar nuevos spots del mundo
    console.log('➕ PASO 6: Insertando nuevos spots del mundo...');
    const newSpotsFiles = [
      'newWorldSpots-riviera-maya.json',
      'newWorldSpots-yucatan.json',
      'newWorldSpots-campeche.json',
      'newWorldSpots-chiapas.json',
      'newWorldSpots-oaxaca.json',
      'newWorldSpots-cdmx.json',
      'newWorldSpots-guatemala.json',
    ];

    let newInserted = 0;
    let newSkipped = 0;

    for (const file of newSpotsFiles) {
      const filePath = path.join(__dirname, `../data/${file}`);
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  Archivo no encontrado: ${file}`);
        continue;
      }

      const newSpots = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      for (const spot of newSpots) {
        // Verificar duplicados
        const { data: existing } = await supabase
          .from('spots')
          .select('id')
          .eq('id', spot.id)
          .single();

        if (existing) {
          newSkipped++;
          continue;
        }

        // Insertar
        const { error: insertError } = await supabase
          .from('spots')
          .insert({
            id: spot.id,
            name: spot.name,
            type: spot.type,
            location: spot.location,
            short_description: spot.shortDescription,
            description: spot.description || null,
            image: spot.image,
            spot_type: 'world',
            has_generated_content: spot.hasGeneratedContent || false,
            created_by: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (insertError) {
          console.warn(`⚠️  Error insertando ${spot.id}: ${insertError.message}`);
          newSkipped++;
        } else {
          newInserted++;
          console.log(`   ✅ Insertado: ${spot.id} - ${spot.name}`);
        }
      }
    }

    console.log(`\n✅ Nuevos spots insertados:`);
    console.log(`   Insertados: ${newInserted}`);
    console.log(`   Saltados (duplicados): ${newSkipped}\n`);

    // PASO 7: Reporte final
    console.log('📊 PASO 7: Generando reporte final...');
    const { data: finalSpots } = await supabase
      .from('spots')
      .select('id, name, spot_type, location, type')
      .eq('spot_type', 'world');

    console.log(`\n✅ Total spots del mundo: ${finalSpots?.length || 0}`);

    // Distribución por región
    const regionMap = new Map<string, number>();
    finalSpots?.forEach((spot: any) => {
      const country = spot.location?.country || 'Unknown';
      const city = spot.location?.city || 'Unknown';
      const key = `${country}::${city}`;
      regionMap.set(key, (regionMap.get(key) || 0) + 1);
    });

    console.log('\n📊 Distribución por región:');
    Array.from(regionMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([key, count]) => {
        const [country, city] = key.split('::');
        console.log(`   ${country} - ${city}: ${count} spots`);
      });

    console.log('\n' + '='.repeat(60));
    console.log('✅ PROCESO COMPLETADO EXITOSAMENTE');
    console.log('='.repeat(60));

  } catch (error: any) {
    console.error('\n❌ Error en proceso:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar
executeCleanup()
  .then(() => {
    console.log('\n✅ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
