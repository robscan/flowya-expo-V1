/**
 * Script para Consolidar Todos los Nuevos Spots del Mundo
 * 
 * Combina todos los archivos JSON de nuevas regiones en un solo archivo
 */

import rivieraMaya from '../data/newWorldSpots-riviera-maya.json';
import yucatan from '../data/newWorldSpots-yucatan.json';
import campeche from '../data/newWorldSpots-campeche.json';
import chiapas from '../data/newWorldSpots-chiapas.json';
import oaxaca from '../data/newWorldSpots-oaxaca.json';
import cdmx from '../data/newWorldSpots-cdmx.json';
import guatemala from '../data/newWorldSpots-guatemala.json';
import { writeFileSync } from 'fs';
import { join } from 'path';

function consolidateNewSpots() {
  const allSpots = [
    ...rivieraMaya,
    ...yucatan,
    ...campeche,
    ...chiapas,
    ...oaxaca,
    ...cdmx,
    ...guatemala,
  ];

  // Agregar campos requeridos para Supabase
  const spotsForSupabase = allSpots.map(spot => ({
    id: spot.id,
    name: spot.name,
    type: spot.type,
    location: spot.location,
    short_description: spot.shortDescription,
    description: spot.description || null,
    image: spot.image,
    spot_type: 'world' as const,
    has_generated_content: spot.hasGeneratedContent || false,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  // Guardar archivo consolidado
  const outputPath = join(__dirname, '../data/newWorldSpots-all.json');
  writeFileSync(outputPath, JSON.stringify(spotsForSupabase, null, 2));

  // Estadísticas
  const stats = {
    total: allSpots.length,
    byRegion: {
      'Riviera Maya': rivieraMaya.length,
      'Península de Yucatán': yucatan.length,
      'Campeche': campeche.length,
      'Chiapas': chiapas.length,
      'Oaxaca': oaxaca.length,
      'Ciudad de México': cdmx.length,
      'Guatemala': guatemala.length,
    },
    byCategory: {} as Record<string, number>,
    byType: {} as Record<string, number>,
  };

  allSpots.forEach(spot => {
    stats.byCategory[spot.category || 'unknown'] = (stats.byCategory[spot.category || 'unknown'] || 0) + 1;
    stats.byType[spot.type] = (stats.byType[spot.type] || 0) + 1;
  });

  console.log('='.repeat(60));
  console.log('📊 NUEVOS SPOTS DEL MUNDO CONSOLIDADOS');
  console.log('='.repeat(60));
  console.log(`\nTotal de spots: ${stats.total}`);
  console.log('\nPor región:');
  Object.entries(stats.byRegion).forEach(([region, count]) => {
    console.log(`  ${region}: ${count} spots`);
  });
  console.log('\nPor categoría:');
  Object.entries(stats.byCategory).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} spots`);
  });
  console.log('\nPor tipo:');
  Object.entries(stats.byType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count} spots`);
  });
  console.log(`\n✅ Archivo consolidado guardado en: ${outputPath}`);

  return { spotsForSupabase, stats };
}

if (require.main === module) {
  consolidateNewSpots();
}

export { consolidateNewSpots };
