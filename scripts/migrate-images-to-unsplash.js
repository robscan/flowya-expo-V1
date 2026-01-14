/**
 * Script para migrar imágenes no-Unsplash a Unsplash en seedSpots.v1.2.json
 * V1.3: Migración de imágenes
 * 
 * Uso: node scripts/migrate-images-to-unsplash.js
 */

const fs = require('fs');
const path = require('path');

// URLs de Unsplash por tipo de spot
const UNSPLASH_IMAGES_BY_TYPE = {
  beach: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80',
  ],
  cafe: [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&q=80',
  ],
  viewpoint: [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&q=80',
  ],
  museum: [
    'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop&q=80',
  ],
  restaurant: [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&q=80',
  ],
  park: [
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop&q=80',
  ],
  monument: [
    'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80',
  ],
  market: [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&q=80',
  ],
  other: [
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop&q=80',
  ],
};

function isUnsplashUrl(url) {
  if (!url) return false;
  return url.includes('unsplash.com') || url.includes('images.unsplash.com');
}

function getUnsplashUrlForSpot(spot) {
  const type = spot.type || 'other';
  const options = UNSPLASH_IMAGES_BY_TYPE[type] || UNSPLASH_IMAGES_BY_TYPE.other;
  
  // Usar el ID del spot para seleccionar de forma determinística
  const hash = spot.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % options.length;
  
  return options[index];
}

function migrateSpotImage(spot) {
  const currentUrl = spot.image?.url;
  
  // Si ya es Unsplash, no hacer nada
  if (isUnsplashUrl(currentUrl)) {
    return spot;
  }
  
  // Reemplazar con URL de Unsplash
  const unsplashUrl = getUnsplashUrlForSpot(spot);
  
  return {
    ...spot,
    image: {
      url: unsplashUrl,
      source: 'Unsplash',
      license: 'Unsplash License',
    },
  };
}

async function migrateSeedSpotsFile() {
  try {
    const filePath = path.join(__dirname, '..', 'data', 'seedSpots.v1.2.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const spots = JSON.parse(fileContent);
    
    console.log(`📊 Total de spots: ${spots.length}`);
    
    // Identificar spots con imágenes no-Unsplash
    const spotsToMigrate = spots.filter(spot => {
      const url = spot.image?.url;
      return url && !isUnsplashUrl(url);
    });
    
    console.log(`🔄 Spots con imágenes no-Unsplash: ${spotsToMigrate.length}`);
    
    if (spotsToMigrate.length === 0) {
      console.log('✅ Todas las imágenes ya son de Unsplash. No hay nada que migrar.');
      return;
    }
    
    // Mostrar ejemplos
    if (spotsToMigrate.length > 0) {
      console.log('\n📋 Ejemplos de spots a migrar:');
      spotsToMigrate.slice(0, 5).forEach(spot => {
        console.log(`  - ${spot.id} (${spot.type}): ${spot.image.url.substring(0, 60)}...`);
      });
    }
    
    // Migrar imágenes
    const migratedSpots = spots.map(migrateSpotImage);
    
    // Verificar cuántos cambiaron
    const changedCount = migratedSpots.filter((spot, index) => 
      spots[index].image?.url !== spot.image?.url
    ).length;
    
    console.log(`\n✅ Migradas ${changedCount} imágenes a Unsplash`);
    
    // Guardar archivo actualizado
    fs.writeFileSync(filePath, JSON.stringify(migratedSpots, null, 2), 'utf-8');
    console.log(`\n💾 Archivo guardado: ${filePath}`);
    
  } catch (error) {
    console.error('❌ Error migrando seedSpots:', error);
    process.exit(1);
  }
}

// Ejecutar migración
migrateSeedSpotsFile();
