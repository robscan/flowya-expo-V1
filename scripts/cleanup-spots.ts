/**
 * Script de Limpieza de Spots en Supabase
 * 
 * Elimina todos los spots que NO sean del mundo (spot_type != 'world')
 * Elimina primero los pins asociados para evitar referencias rotas
 */

import { supabase } from '../utils/supabase';

interface CleanupResult {
  pinsDeleted: number;
  spotsDeleted: number;
  deletedSpotIds: string[];
  errors: string[];
}

async function cleanupNonWorldSpots(dryRun: boolean = true): Promise<CleanupResult> {
  if (!supabase) {
    throw new Error('Supabase client no está configurado');
  }

  const result: CleanupResult = {
    pinsDeleted: 0,
    spotsDeleted: 0,
    deletedSpotIds: [],
    errors: [],
  };

  console.log(`🔧 ${dryRun ? 'DRY RUN' : 'EJECUTANDO'} limpieza de spots...\n`);

  try {
    // 1. Identificar spots a eliminar
    console.log('📋 Identificando spots a eliminar...');
    const { data: spotsToDelete, error: spotsError } = await supabase
      .from('spots')
      .select('id, name, spot_type')
      .or('spot_type.is.null,spot_type.neq.world');

    if (spotsError) {
      throw new Error(`Error obteniendo spots: ${spotsError.message}`);
    }

    if (!spotsToDelete || spotsToDelete.length === 0) {
      console.log('✅ No hay spots a eliminar');
      return result;
    }

    console.log(`⚠️ Encontrados ${spotsToDelete.length} spots a eliminar\n`);

    const spotIdsToDelete = spotsToDelete.map(s => s.id);
    result.deletedSpotIds = spotIdsToDelete;

    // 2. Identificar pins asociados
    console.log('📌 Identificando pins asociados...');
    const { data: pinsToDelete, error: pinsError } = await supabase
      .from('pins')
      .select('id, spot_id')
      .in('spot_id', spotIdsToDelete.map(id => id.toString()));

    if (pinsError) {
      console.warn('⚠️ Error obteniendo pins (puede que no existan):', pinsError.message);
    } else {
      console.log(`📌 Encontrados ${pinsToDelete?.length || 0} pins a eliminar\n`);
    }

    if (dryRun) {
      console.log('🔍 DRY RUN - No se eliminará nada');
      console.log(`   Pins a eliminar: ${pinsToDelete?.length || 0}`);
      console.log(`   Spots a eliminar: ${spotsToDelete.length}`);
      console.log('\n   IDs de spots a eliminar:');
      spotsToDelete.forEach((spot, index) => {
        console.log(`   ${index + 1}. ${spot.id} - ${spot.name} (spot_type: ${spot.spot_type || 'NULL'})`);
      });
      return result;
    }

    // 3. Eliminar pins primero
    if (pinsToDelete && pinsToDelete.length > 0) {
      console.log(`🗑️ Eliminando ${pinsToDelete.length} pins...`);
      const pinIdsToDelete = pinsToDelete.map(p => p.id);
      
      const { error: deletePinsError } = await supabase
        .from('pins')
        .delete()
        .in('id', pinIdsToDelete);

      if (deletePinsError) {
        result.errors.push(`Error eliminando pins: ${deletePinsError.message}`);
        console.error('❌ Error eliminando pins:', deletePinsError);
      } else {
        result.pinsDeleted = pinsToDelete.length;
        console.log(`✅ ${pinsToDelete.length} pins eliminados\n`);
      }
    } else {
      console.log('✅ No hay pins a eliminar\n');
    }

    // 4. Eliminar spots
    console.log(`🗑️ Eliminando ${spotsToDelete.length} spots...`);
    const { error: deleteSpotsError } = await supabase
      .from('spots')
      .delete()
      .in('id', spotIdsToDelete);

    if (deleteSpotsError) {
      result.errors.push(`Error eliminando spots: ${deleteSpotsError.message}`);
      console.error('❌ Error eliminando spots:', deleteSpotsError);
    } else {
      result.spotsDeleted = spotsToDelete.length;
      console.log(`✅ ${spotsToDelete.length} spots eliminados\n`);
    }

    // 5. Validar eliminación
    console.log('✅ Validando eliminación...');
    const { data: remainingSpots, error: validateError } = await supabase
      .from('spots')
      .select('id')
      .or('spot_type.is.null,spot_type.neq.world');

    if (validateError) {
      console.warn('⚠️ Error validando:', validateError.message);
    } else {
      const remainingCount = remainingSpots?.length || 0;
      if (remainingCount === 0) {
        console.log('✅ Validación exitosa: Solo quedan spots del mundo');
      } else {
        console.warn(`⚠️ Aún quedan ${remainingCount} spots NO del mundo`);
        result.errors.push(`${remainingCount} spots NO del mundo aún existen`);
      }
    }

    return result;

  } catch (error: any) {
    console.error('❌ Error en limpieza:', error);
    result.errors.push(error.message || String(error));
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const dryRun = process.argv.includes('--dry-run') || process.argv.includes('--dryrun');
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(dryRun ? '🔍 MODO DRY RUN' : '⚠️ MODO EJECUCIÓN REAL');
  console.log('='.repeat(60) + '\n');

  if (!dryRun) {
    console.log('⚠️ ADVERTENCIA: Esto eliminará spots y pins permanentemente');
    console.log('⚠️ Presiona Ctrl+C para cancelar en los próximos 5 segundos...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  cleanupNonWorldSpots(dryRun)
    .then((result) => {
      console.log('\n' + '='.repeat(60));
      console.log('📊 RESULTADO DE LIMPIEZA');
      console.log('='.repeat(60));
      console.log(`Pins eliminados: ${result.pinsDeleted}`);
      console.log(`Spots eliminados: ${result.spotsDeleted}`);
      console.log(`Errores: ${result.errors.length}`);
      if (result.errors.length > 0) {
        console.log('\nErrores:');
        result.errors.forEach(err => console.log(`  - ${err}`));
      }
      console.log('\n✅ Limpieza completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

export { cleanupNonWorldSpots };
