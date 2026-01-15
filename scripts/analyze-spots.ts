/**
 * Script de Análisis de Spots en Supabase
 * 
 * Analiza todos los spots existentes y los clasifica por spot_type
 * Genera reporte de spots del mundo vs spots a eliminar
 */

import { supabase } from '../utils/supabase';

interface SpotAnalysis {
  id: string;
  name: string;
  type: string;
  spot_type: string | null;
  created_by: string | null;
  created_at: string;
  location: {
    lat?: number;
    lng?: number;
    city?: string;
    country?: string;
  };
}

async function analyzeSpots() {
  if (!supabase) {
    console.error('❌ Supabase client no está configurado');
    return;
  }

  console.log('🔍 Analizando spots en Supabase...\n');

  try {
    // 1. Verificar estructura de tabla
    console.log('📊 Verificando estructura de tabla spots...');
    const { data: columns, error: columnsError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'spots'
        ORDER BY ordinal_position;
      `
    });

    if (columnsError) {
      console.warn('⚠️ No se pudo verificar estructura (puede requerir permisos especiales)');
    } else {
      console.log('✅ Estructura de tabla verificada');
      console.log('Columnas:', columns);
    }

    // 2. Obtener todos los spots
    console.log('\n📦 Obteniendo todos los spots...');
    const { data: spots, error: spotsError } = await supabase
      .from('spots')
      .select('*')
      .order('created_at', { ascending: false });

    if (spotsError) {
      console.error('❌ Error obteniendo spots:', spotsError);
      return;
    }

    if (!spots || spots.length === 0) {
      console.log('ℹ️ No hay spots en la base de datos');
      return;
    }

    console.log(`✅ Obtenidos ${spots.length} spots\n`);

    // 3. Clasificar spots
    const worldSpots: SpotAnalysis[] = [];
    const nonWorldSpots: SpotAnalysis[] = [];

    spots.forEach((spot: any) => {
      const analysis: SpotAnalysis = {
        id: spot.id,
        name: spot.name || 'Sin nombre',
        type: spot.type || 'unknown',
        spot_type: spot.spot_type || null,
        created_by: spot.created_by || null,
        created_at: spot.created_at || 'unknown',
        location: spot.location || {},
      };

      if (spot.spot_type === 'world') {
        worldSpots.push(analysis);
      } else {
        nonWorldSpots.push(analysis);
      }
    });

    // 4. Generar reporte
    console.log('='.repeat(60));
    console.log('📊 REPORTE DE ANÁLISIS DE SPOTS');
    console.log('='.repeat(60));
    console.log(`\nTotal de spots: ${spots.length}`);
    console.log(`✅ Spots del mundo (spot_type = 'world'): ${worldSpots.length}`);
    console.log(`❌ Spots a eliminar: ${nonWorldSpots.length}`);
    console.log(`\nSpots con created_by: ${spots.filter((s: any) => s.created_by).length}`);
    console.log(`Spots sin spot_type: ${spots.filter((s: any) => !s.spot_type).length}`);

    // 5. Detalles de spots a eliminar
    if (nonWorldSpots.length > 0) {
      console.log('\n' + '='.repeat(60));
      console.log('❌ SPOTS A ELIMINAR');
      console.log('='.repeat(60));
      nonWorldSpots.forEach((spot, index) => {
        console.log(`\n${index + 1}. ID: ${spot.id}`);
        console.log(`   Nombre: ${spot.name}`);
        console.log(`   Tipo: ${spot.type}`);
        console.log(`   spot_type: ${spot.spot_type || 'NULL'}`);
        console.log(`   created_by: ${spot.created_by || 'NULL'}`);
        console.log(`   Ubicación: ${spot.location.city || 'N/A'}, ${spot.location.country || 'N/A'}`);
        console.log(`   Creado: ${spot.created_at}`);
      });
    }

    // 6. Verificar pins asociados
    console.log('\n' + '='.repeat(60));
    console.log('📌 VERIFICANDO PINS ASOCIADOS');
    console.log('='.repeat(60));

    if (nonWorldSpots.length > 0) {
      const spotIdsToDelete = nonWorldSpots.map(s => s.id);
      const { data: pins, error: pinsError } = await supabase
        .from('pins')
        .select('id, spot_id, user_id, state')
        .in('spot_id', spotIdsToDelete);

      if (pinsError) {
        console.error('❌ Error obteniendo pins:', pinsError);
      } else {
        console.log(`\n⚠️ Pins asociados a spots a eliminar: ${pins?.length || 0}`);
        if (pins && pins.length > 0) {
          console.log('\nPins a eliminar:');
          pins.forEach((pin: any, index: number) => {
            console.log(`  ${index + 1}. Pin ID: ${pin.id}, Spot ID: ${pin.spot_id}, User: ${pin.user_id}, State: ${pin.state}`);
          });
        }
      }
    } else {
      console.log('\n✅ No hay spots a eliminar, no hay pins asociados');
    }

    // 7. Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📋 RESUMEN');
    console.log('='.repeat(60));
    console.log(`Total spots: ${spots.length}`);
    console.log(`✅ Spots del mundo: ${worldSpots.length}`);
    console.log(`❌ Spots a eliminar: ${nonWorldSpots.length}`);
    console.log(`📌 Pins a eliminar: ${pins?.length || 0}`);

    return {
      total: spots.length,
      worldSpots: worldSpots.length,
      nonWorldSpots: nonWorldSpots.length,
      spotsToDelete: nonWorldSpots,
      pinsToDelete: pins || [],
    };

  } catch (error) {
    console.error('❌ Error en análisis:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  analyzeSpots()
    .then(() => {
      console.log('\n✅ Análisis completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

export { analyzeSpots };
