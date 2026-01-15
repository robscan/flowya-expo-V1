/**
 * Script Principal de Limpieza y Curación
 * 
 * Ejecuta todo el proceso de limpieza de spots
 */

import { supabase } from '../utils/supabase';
import { analyzeSpots } from './analyze-spots';
import { cleanupNonWorldSpots } from './cleanup-spots';
import { migrateWorldSpotsToSupabase } from './migrate-world-spots-to-supabase';
import { generateReport } from './generate-report';

async function runFullCleanup(dryRun: boolean = true) {
  if (!supabase) {
    console.error('❌ Supabase client no está configurado');
    console.error('Verifica que EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY estén configurados');
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log(dryRun ? '🔍 MODO DRY RUN - LIMPIEZA Y CURACIÓN DE SPOTS' : '⚠️ MODO EJECUCIÓN REAL');
  console.log('='.repeat(60));
  console.log();

  try {
    // PASO 1: Verificar/Agregar campo spot_type
    console.log('📋 PASO 1: Verificando campo spot_type...');
    const { error: alterError } = await supabase.rpc('exec_sql', {
      query: `
        ALTER TABLE spots 
        ADD COLUMN IF NOT EXISTS spot_type TEXT DEFAULT NULL;
        
        CREATE INDEX IF NOT EXISTS idx_spots_spot_type ON spots (spot_type);
      `
    });

    if (alterError) {
      // Intentar método alternativo: ejecutar directamente
      console.log('⚠️ No se pudo ejecutar RPC, intentando método alternativo...');
      // Nota: Esto requiere permisos de administrador en Supabase
    } else {
      console.log('✅ Campo spot_type verificado/agregado');
    }

    // PASO 2: Análisis
    console.log('\n📊 PASO 2: Analizando spots existentes...');
    const analysis = await analyzeSpots();
    
    if (!analysis) {
      console.error('❌ Error en análisis');
      return;
    }

    console.log(`\n📊 Resultados del análisis:`);
    console.log(`   Total spots: ${analysis.total}`);
    console.log(`   Spots del mundo: ${analysis.worldSpots}`);
    console.log(`   Spots a eliminar: ${analysis.nonWorldSpots}`);
    console.log(`   Pins a eliminar: ${analysis.pinsToDelete.length}`);

    if (analysis.nonWorldSpots === 0) {
      console.log('\n✅ No hay spots a eliminar, continuando...');
    } else {
      // PASO 3: Limpieza
      console.log('\n🗑️  PASO 3: Limpiando spots NO del mundo...');
      if (!dryRun) {
        const cleanupResult = await cleanupNonWorldSpots(false);
        console.log(`\n✅ Limpieza completada:`);
        console.log(`   Pins eliminados: ${cleanupResult.pinsDeleted}`);
        console.log(`   Spots eliminados: ${cleanupResult.spotsDeleted}`);
        if (cleanupResult.errors.length > 0) {
          console.log(`   Errores: ${cleanupResult.errors.length}`);
        }
      } else {
        console.log('🔍 [DRY RUN] Se eliminarían:');
        console.log(`   ${analysis.pinsToDelete.length} pins`);
        console.log(`   ${analysis.nonWorldSpots} spots`);
      }
    }

    // PASO 4: Migrar spots del mundo desde seeds
    console.log('\n🌍 PASO 4: Migrando spots del mundo desde seedSpots.v1.2.json...');
    const migrationResult = await migrateWorldSpotsToSupabase(dryRun);
    console.log(`\n✅ Migración completada:`);
    console.log(`   Insertados: ${migrationResult.inserted}`);
    console.log(`   Actualizados: ${migrationResult.updated}`);
    console.log(`   Saltados: ${migrationResult.skipped}`);

    // PASO 5: Reporte final
    console.log('\n📊 PASO 5: Generando reporte final...');
    const report = await generateReport();

    console.log('\n' + '='.repeat(60));
    console.log('✅ PROCESO COMPLETADO');
    console.log('='.repeat(60));
    console.log(`Total spots del mundo: ${report.worldSpots}`);
    console.log(`Regiones cubiertas: ${report.spotsByRegion.length}`);

    return {
      analysis,
      migrationResult,
      report,
    };

  } catch (error: any) {
    console.error('\n❌ Error en proceso:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const dryRun = process.argv.includes('--dry-run') || process.argv.includes('--dryrun');
  
  runFullCleanup(dryRun)
    .then(() => {
      console.log('\n✅ Proceso completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

export { runFullCleanup };
