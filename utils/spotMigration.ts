/**
 * Utilidades de Migración - Spot Model V1.2
 * 
 * Este módulo proporciona funciones para migrar spots del modelo actual (Spot) 
 * al nuevo modelo simplificado (SpotV1_2) según las decisiones de producto FLOWYA V1.2.
 * 
 * FASE 1: Preparación del nuevo modelo
 * - Definir tipos paralelos (SpotV1_2)
 * - Crear funciones de migración
 * - Validadores para verificar cumplimiento del nuevo modelo
 * 
 * IMPORTANTE:
 * - NO modifica el modelo actual (Spot)
 * - NO migra datos automáticamente
 * - Solo prepara la infraestructura para la migración
 * 
 * @see definitions/FLOWYA V1.2/ANALISIS_MIGRACION_SPOT_V1.2.md
 */

import { Spot, SpotImage, SpotType, SpotV1_2 } from '@/data/spots';

/**
 * Migrar Spot V1.1/V2.0 → SpotV1_2
 * 
 * Convierte un spot del modelo actual al nuevo modelo simplificado.
 * Aplica las siguientes transformaciones:
 * 
 * - location.latitude/longitude → location.lat/lng
 * - locationRegion.city/country → location.city/country
 * - photos[0] → image.url (toma primera foto)
 * - description o whyItMatters → shortDescription
 * - aiGenerated !== undefined → hasGeneratedContent
 * - name opcional → name requerido (usa string vacío si no existe)
 * 
 * @param spot Spot del modelo actual
 * @returns SpotV1_2 del nuevo modelo
 */
export function migrateSpotToV1_2(spot: Spot): SpotV1_2 {
  // Extraer city y country de locationRegion si existe
  // LocationRegion tiene: label, type, countryCode
  // city se extrae del label cuando type es 'city'
  // country se convierte de countryCode (ISO 3166-1 alpha-2) a nombre de país
  let city: string | undefined = undefined;
  let country: string | undefined = undefined;

  if (spot.locationRegion) {
    // Extraer city del label cuando el tipo es city
    if (spot.locationRegion.type === 'city') {
      city = spot.locationRegion.label;
    }
    
    // Convertir countryCode a nombre de país (simplificado, podría expandirse)
    // Por ahora, dejamos el código de país. En el futuro se puede expandir a nombre completo
    // Ejemplo: "MX" → "Mexico", "ES" → "Spain", etc.
    if (spot.locationRegion.countryCode) {
      // Por ahora, mantener el código. Se puede expandir con un mapeo completo
      country = spot.locationRegion.countryCode;
      
      // Mapeo básico de códigos a nombres (se puede expandir)
      const countryCodeMap: Record<string, string> = {
        'MX': 'Mexico',
        'US': 'United States',
        'ES': 'Spain',
        'FR': 'France',
        'IT': 'Italy',
        'PT': 'Portugal',
        // Agregar más según necesidad
      };
      
      // Si hay mapeo, usar nombre, sino mantener código
      country = countryCodeMap[spot.locationRegion.countryCode] || spot.locationRegion.countryCode;
    }
  }

  // FASE 4-5: Migrar location (compatible con ambos formatos)
  let lat: number;
  let lng: number;
  
  const loc = spot.location as { lat?: number; lng?: number; latitude?: number; longitude?: number };
  
  if ('lat' in loc && loc.lat !== undefined && 'lng' in loc && loc.lng !== undefined) {
    // Ya está en formato nuevo
    lat = loc.lat;
    lng = loc.lng;
  } else if ('latitude' in loc && loc.latitude !== undefined && 'longitude' in loc && loc.longitude !== undefined) {
    // Formato antiguo, migrar
    lat = loc.latitude;
    lng = loc.longitude;
  } else {
    // Fallback a campos legacy
    lat = spot.locationLatitude || 0;
    lng = spot.locationLongitude || 0;
  }
  
  const location = {
    lat,
    lng,
    // Usar city/country del location si ya existe (formato nuevo)
    ...(spot.location.city && { city: spot.location.city }),
    ...(spot.location.country && { country: spot.location.country }),
    // O usar de locationRegion si no existe en location
    ...(!spot.location.city && city && { city }),
    ...(!spot.location.country && country && { country }),
  };

  // FASE 5: Migrar imagen (compatible con ambos formatos)
  // FASE 6A: image.url puede ser string vacío (permitido según modelo V1.2)
  let imageUrl: string = '';
  if (spot.image && spot.image.url) {
    // Ya está en formato nuevo (image.url)
    imageUrl = spot.image.url;
  } else if (spot.photos && spot.photos.length > 0) {
    // Formato antiguo (photos[]), tomar primera foto
    imageUrl = spot.photos[0] || '';
  }
  // Si no hay imagen, imageUrl queda como string vacío (permitido)
  
  const image: SpotImage = {
    url: imageUrl,
    // Usar metadata del image si existe (formato nuevo)
    ...(spot.image?.source && { source: spot.image.source }),
    ...(spot.image?.license && { license: spot.image.license }),
  };

  // FASE 4: Migrar descripción (compatible con ambos formatos)
  // Si no hay shortDescription, usar whyItMatters o description, o string vacío
  const shortDescription = spot.shortDescription || spot.whyItMatters || spot.description || '';

  // FASE 4: Migrar flag de generación IA (compatible con ambos formatos)
  const hasGeneratedContent = spot.hasGeneratedContent !== undefined 
    ? spot.hasGeneratedContent 
    : (spot.aiGenerated !== undefined && spot.aiGenerated !== null);

  // FASE 4: Migrar name (convertir opcional a requerido)
  const name = spot.name || '';

  // Construir spot migrado
  // FASE 6A: shortDescription es opcional según SpotV1_2, pero preferiblemente no vacío
  const spotV1_2: SpotV1_2 = {
    id: spot.id,
    name: name || '', // Asegurar que name nunca sea undefined (requerido)
    type: spot.type,
    location,
    // shortDescription es opcional, usar undefined si está vacío
    ...(shortDescription && shortDescription.trim().length > 0 && { shortDescription }),
    image,
    hasGeneratedContent: hasGeneratedContent !== undefined ? hasGeneratedContent : false, // Asegurar que siempre sea boolean
    // Timestamps requeridos en SpotV1_2
    createdAt: spot.createdAt || new Date(),
    updatedAt: spot.updatedAt || new Date(),
  };

  return spotV1_2;
}

/**
 * Validar que un Spot cumple con el modelo SpotV1_2
 * 
 * Verifica que el spot tenga todos los campos requeridos y cumpla con
 * las restricciones del nuevo modelo:
 * - id es string no vacío
 * - name es string no vacío
 * - type es un SpotType válido
 * - location.lat y location.lng son números válidos
 * - image.url es string no vacío
 * - hasGeneratedContent es boolean
 * 
 * @param spot Spot a validar (puede ser Spot o SpotV1_2)
 * @returns true si cumple con el modelo SpotV1_2, false en caso contrario
 */
export function isValidSpotV1_2(spot: Spot | SpotV1_2): boolean {
  // Validar id
  if (!spot.id || typeof spot.id !== 'string' || spot.id.trim().length === 0) {
    return false;
  }

  // Validar name (requerido en V1_2)
  // FASE 6A: name debe ser string (puede ser vacío según modelo, pero preferiblemente no vacío)
  if (!('name' in spot) || typeof spot.name !== 'string') {
    return false;
  }

  // Validar type
  const validTypes: SpotType[] = ['beach', 'cafe', 'viewpoint', 'museum', 'restaurant', 'park', 'monument', 'market', 'other'];
  if (!spot.type || !validTypes.includes(spot.type)) {
    return false;
  }

  // Validar location (FASE 4-5: compatible con ambos formatos)
  if (!spot.location) {
    return false;
  }

  // Validar location (compatible con lat/lng y latitude/longitude)
  let latValid = false;
  let lngValid = false;
  
  const loc = spot.location as { lat?: number; lng?: number; latitude?: number; longitude?: number };
  
  if ('lat' in loc && loc.lat !== undefined && 'lng' in loc && loc.lng !== undefined) {
    // Formato nuevo
    latValid = typeof loc.lat === 'number' && !isNaN(loc.lat);
    lngValid = typeof loc.lng === 'number' && !isNaN(loc.lng);
  } else if ('latitude' in loc && loc.latitude !== undefined && 'longitude' in loc && loc.longitude !== undefined) {
    // Formato antiguo
    latValid = typeof loc.latitude === 'number' && !isNaN(loc.latitude);
    lngValid = typeof loc.longitude === 'number' && !isNaN(loc.longitude);
  }
  
  if (!latValid || !lngValid) {
    return false;
  }

  // Validar image (FASE 5: compatible con ambos formatos)
  // FASE 6A: image.url debe existir (puede ser string vacío según modelo V1.2)
  let imageValid = false;
  if ('image' in spot && spot.image) {
    // Formato nuevo (image.url) - debe ser string (puede ser vacío)
    imageValid = typeof spot.image.url === 'string';
  } else if ('photos' in spot && spot.photos) {
    // Formato antiguo (photos[]), validar que tenga al menos una foto
    imageValid = Array.isArray(spot.photos) && spot.photos.length > 0 && typeof spot.photos[0] === 'string' && spot.photos[0].trim().length > 0;
  } else {
    // Sin imagen - permitido (se migrará a string vacío)
    imageValid = true;
  }
  
  if (!imageValid) {
    return false;
  }

  // Validar hasGeneratedContent (FASE 4: requerido en V1_2)
  if ('hasGeneratedContent' in spot) {
    if (typeof spot.hasGeneratedContent !== 'boolean') {
      return false;
    }
  } else {
    // Si no existe, asumir false (compatibilidad temporal)
    // En FASE 6 se migrarán todos los spots
  }

  return true;
}

/**
 * Validar que un Spot puede migrarse a SpotV1_2
 * 
 * Verifica que el spot tenga los campos mínimos necesarios para migración:
 * - id válido
 * - location válido (latitude/longitude)
 * - type válido
 * 
 * Nota: name puede ser opcional en el modelo actual, pero se convertirá a string vacío si no existe.
 * 
 * @param spot Spot a validar
 * @returns true si puede migrarse, false en caso contrario
 */
/**
 * FASE 4-5: Validar que un Spot puede migrarse a SpotV1_2
 * Compatible con ambos formatos: lat/lng y latitude/longitude
 */
export function canMigrateSpot(spot: Spot): boolean {
  // Validar id
  if (!spot.id || typeof spot.id !== 'string' || spot.id.trim().length === 0) {
    return false;
  }

  // Validar type
  const validTypes: SpotType[] = ['beach', 'cafe', 'viewpoint', 'museum', 'restaurant', 'park', 'monument', 'market', 'other'];
  if (!spot.type || !validTypes.includes(spot.type)) {
    return false;
  }

  // FASE 4-5: Validar location (compatible con ambos formatos)
  if (!spot.location) {
    return false;
  }
  
  let latValid = false;
  let lngValid = false;
  
  const loc = spot.location as { lat?: number; lng?: number; latitude?: number; longitude?: number };
  
  if ('lat' in loc && loc.lat !== undefined && 'lng' in loc && loc.lng !== undefined) {
    // Formato nuevo
    latValid = typeof loc.lat === 'number' && !isNaN(loc.lat);
    lngValid = typeof loc.lng === 'number' && !isNaN(loc.lng);
  } else if ('latitude' in loc && loc.latitude !== undefined && 'longitude' in loc && loc.longitude !== undefined) {
    // Formato antiguo
    latValid = typeof loc.latitude === 'number' && !isNaN(loc.latitude);
    lngValid = typeof loc.longitude === 'number' && !isNaN(loc.longitude);
  } else if (spot.locationLatitude !== undefined && spot.locationLongitude !== undefined) {
    // Fallback a campos legacy
    latValid = typeof spot.locationLatitude === 'number' && !isNaN(spot.locationLatitude);
    lngValid = typeof spot.locationLongitude === 'number' && !isNaN(spot.locationLongitude);
  }
  
  if (!latValid || !lngValid) {
    return false;
  }

  return true;
}

/**
 * Resultado de validación detallado
 */
export interface SpotValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validar SpotV1_2 con mensajes de error detallados
 * 
 * Similar a isValidSpotV1_2, pero retorna un objeto con detalles de errores.
 * Útil para debugging y mostrar mensajes al usuario.
 * 
 * @param spot Spot a validar
 * @returns Resultado de validación con lista de errores
 */
export function validateSpotV1_2Detailed(spot: Spot | SpotV1_2): SpotValidationResult {
  const errors: string[] = [];

  // Validar id
  if (!spot.id || typeof spot.id !== 'string' || spot.id.trim().length === 0) {
    errors.push('id es requerido y debe ser un string no vacío');
  }

  // Validar name
  if ('name' in spot && (typeof spot.name !== 'string' || spot.name.trim().length === 0)) {
    errors.push('name es requerido y debe ser un string no vacío');
  }

  // Validar type
  const validTypes: SpotType[] = ['beach', 'cafe', 'viewpoint', 'museum', 'restaurant', 'park', 'monument', 'market', 'other'];
  if (!spot.type || !validTypes.includes(spot.type)) {
    errors.push(`type debe ser uno de: ${validTypes.join(', ')}`);
  }

  // FASE 4-5: Validar location (compatible con ambos formatos)
  if (!spot.location) {
    errors.push('location es requerido');
  } else {
    const loc = spot.location as { lat?: number; lng?: number; latitude?: number; longitude?: number };
    
    if ('latitude' in loc && loc.latitude !== undefined && 'longitude' in loc && loc.longitude !== undefined) {
      // Formato antiguo
      if (
        typeof loc.latitude !== 'number' ||
        typeof loc.longitude !== 'number' ||
        isNaN(loc.latitude) ||
        isNaN(loc.longitude)
      ) {
        errors.push('location.latitude y location.longitude deben ser números válidos');
      }
    } else if ('lat' in loc && loc.lat !== undefined && 'lng' in loc && loc.lng !== undefined) {
      // Formato nuevo
      if (
        typeof loc.lat !== 'number' ||
        typeof loc.lng !== 'number' ||
        isNaN(loc.lat) ||
        isNaN(loc.lng)
      ) {
        errors.push('location.lat y location.lng deben ser números válidos');
      }
    } else {
      errors.push('location debe tener lat/lng o latitude/longitude válidos');
    }
  }

  // Validar image
  if ('image' in spot) {
    const v1_2Spot = spot as SpotV1_2;
    if (!v1_2Spot.image || typeof v1_2Spot.image.url !== 'string' || v1_2Spot.image.url.trim().length === 0) {
      errors.push('image.url es requerido y debe ser un string no vacío');
    }
  } else {
    const currentSpot = spot as Spot;
    if (!currentSpot.photos || !Array.isArray(currentSpot.photos) || currentSpot.photos.length === 0) {
      errors.push('photos debe ser un array con al menos una foto');
    }
  }

  // Validar hasGeneratedContent
  if ('hasGeneratedContent' in spot) {
    if (typeof spot.hasGeneratedContent !== 'boolean') {
      errors.push('hasGeneratedContent debe ser un boolean');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Migrar array de spots
 * 
 * Convierte un array completo de spots del modelo actual al nuevo modelo.
 * Filtra spots que no pueden migrarse (retorna solo los migrables).
 * 
 * @param spots Array de spots del modelo actual
 * @returns Array de spots migrados al modelo SpotV1_2
 */
export function migrateSpotsToV1_2(spots: Spot[]): SpotV1_2[] {
  return spots
    .filter((spot) => canMigrateSpot(spot))
    .map((spot) => migrateSpotToV1_2(spot));
}

/**
 * Estadísticas de migración
 */
export interface MigrationStats {
  total: number;
  migrable: number;
  noMigrable: number;
  errors: { spotId: string; error: string }[];
}

/**
 * Analizar spots para migración y generar estadísticas
 * 
 * Útil para pre-validar migración antes de ejecutarla.
 * 
 * @param spots Array de spots a analizar
 * @returns Estadísticas de migración
 */
export function analyzeMigration(spots: Spot[]): MigrationStats {
  const stats: MigrationStats = {
    total: spots.length,
    migrable: 0,
    noMigrable: 0,
    errors: [],
  };

  spots.forEach((spot) => {
    if (canMigrateSpot(spot)) {
      stats.migrable++;
      
      // Intentar migrar para validar que el resultado es válido
      try {
        const migrated = migrateSpotToV1_2(spot);
        const validation = validateSpotV1_2Detailed(migrated);
        if (!validation.isValid) {
          stats.errors.push({
            spotId: spot.id,
            error: `Spot migrado no válido: ${validation.errors.join(', ')}`,
          });
        }
      } catch (error: any) {
        stats.errors.push({
          spotId: spot.id,
          error: `Error al migrar: ${error.message || String(error)}`,
        });
      }
    } else {
      stats.noMigrable++;
      stats.errors.push({
        spotId: spot.id || 'unknown',
        error: 'Spot no cumple con requisitos mínimos para migración',
      });
    }
  });

  return stats;
}
