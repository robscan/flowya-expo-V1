/**
 * Script de Generación de Reporte Final
 * 
 * Genera reporte completo después de limpieza y curación
 */

import { supabase } from '../utils/supabase';

interface ReportData {
  totalSpots: number;
  worldSpots: number;
  nonWorldSpots: number;
  spotsByRegion: Array<{ country: string; city: string; count: number }>;
  spotsByType: Array<{ type: string; count: number }>;
  allWorldSpots: Array<{
    id: string;
    name: string;
    type: string;
    city: string;
    country: string;
  }>;
}

async function generateReport(): Promise<ReportData> {
  if (!supabase) {
    throw new Error('Supabase client no está configurado');
  }

  console.log('📊 Generando reporte final...\n');

  try {
    // 1. Conteo total
    const { data: allSpots, error: allError } = await supabase
      .from('spots')
      .select('id, spot_type');

    if (allError) throw allError;

    const totalSpots = allSpots?.length || 0;
    const worldSpots = allSpots?.filter(s => s.spot_type === 'world').length || 0;
    const nonWorldSpots = totalSpots - worldSpots;

    // 2. Distribución por región
    const { data: spotsWithLocation, error: locationError } = await supabase
      .from('spots')
      .select('id, name, type, location, spot_type')
      .eq('spot_type', 'world');

    if (locationError) throw locationError;

    const regionMap = new Map<string, number>();
    spotsWithLocation?.forEach((spot: any) => {
      const country = spot.location?.country || 'Unknown';
      const city = spot.location?.city || 'Unknown';
      const key = `${country}::${city}`;
      regionMap.set(key, (regionMap.get(key) || 0) + 1);
    });

    const spotsByRegion = Array.from(regionMap.entries())
      .map(([key, count]) => {
        const [country, city] = key.split('::');
        return { country, city, count };
      })
      .sort((a, b) => b.count - a.count || a.country.localeCompare(b.country));

    // 3. Distribución por tipo
    const typeMap = new Map<string, number>();
    spotsWithLocation?.forEach((spot: any) => {
      const type = spot.type || 'unknown';
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });

    const spotsByType = Array.from(typeMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    // 4. Lista completa de spots del mundo
    const allWorldSpots = (spotsWithLocation || []).map((spot: any) => ({
      id: spot.id,
      name: spot.name,
      type: spot.type,
      city: spot.location?.city || 'Unknown',
      country: spot.location?.country || 'Unknown',
    })).sort((a, b) => 
      a.country.localeCompare(b.country) || 
      a.city.localeCompare(b.city) || 
      a.name.localeCompare(b.name)
    );

    // 5. Generar reporte formateado
    console.log('='.repeat(60));
    console.log('📊 REPORTE FINAL - SPOTS DEL MUNDO');
    console.log('='.repeat(60));
    console.log(`\nTotal de spots: ${totalSpots}`);
    console.log(`✅ Spots del mundo: ${worldSpots}`);
    console.log(`❌ Spots NO del mundo: ${nonWorldSpots}`);

    console.log('\n' + '='.repeat(60));
    console.log('🌍 DISTRIBUCIÓN POR REGIÓN');
    console.log('='.repeat(60));
    spotsByRegion.forEach(({ country, city, count }) => {
      console.log(`${country} - ${city}: ${count} spots`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('🏷️  DISTRIBUCIÓN POR TIPO');
    console.log('='.repeat(60));
    spotsByType.forEach(({ type, count }) => {
      console.log(`${type}: ${count} spots`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('📋 LISTA COMPLETA DE SPOTS DEL MUNDO');
    console.log('='.repeat(60));
    allWorldSpots.forEach((spot, index) => {
      console.log(`${index + 1}. ${spot.id} - ${spot.name} (${spot.type})`);
      console.log(`   ${spot.city}, ${spot.country}`);
    });

    // 6. Identificar zonas débiles
    console.log('\n' + '='.repeat(60));
    console.log('⚠️  ZONAS DÉBILES (menos de 10 spots)');
    console.log('='.repeat(60));
    const weakZones = spotsByRegion.filter(r => r.count < 10);
    if (weakZones.length > 0) {
      weakZones.forEach(({ country, city, count }) => {
        console.log(`${country} - ${city}: ${count} spots (necesita más contenido)`);
      });
    } else {
      console.log('✅ Todas las regiones tienen buena cobertura');
    }

    return {
      totalSpots,
      worldSpots,
      nonWorldSpots,
      spotsByRegion,
      spotsByType,
      allWorldSpots,
    };

  } catch (error: any) {
    console.error('❌ Error generando reporte:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  generateReport()
    .then(() => {
      console.log('\n✅ Reporte generado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

export { generateReport };
