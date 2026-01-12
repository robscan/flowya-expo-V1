/**
 * Utilidades para cálculo de distancias
 * Cálculo de distancia entre coordenadas usando fórmula de Haversine
 */

/**
 * Calcular distancia entre dos puntos geográficos usando fórmula de Haversine
 * @param lat1 Latitud del primer punto
 * @param lon1 Longitud del primer punto
 * @param lat2 Latitud del segundo punto
 * @param lon2 Longitud del segundo punto
 * @returns Distancia en metros
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Radio de la Tierra en metros
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Convertir grados a radianes
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * FASE 4: Calcular distancia desde ubicación del usuario a un spot
 * Compatible con ambos formatos: lat/lng y latitude/longitude
 */
export function calculateDistanceToSpot(
  userLocation: { lat: number; lng: number } | { latitude: number; longitude: number } | null,
  spotLocation: { lat: number; lng: number } | { latitude: number; longitude: number }
): number | null {
  if (!userLocation) {
    return null;
  }
  
  // FASE 4: Normalizar location del usuario
  const userLat = 'lat' in userLocation ? userLocation.lat : userLocation.latitude;
  const userLng = 'lng' in userLocation ? userLocation.lng : userLocation.longitude;
  
  // FASE 4: Normalizar location del spot
  const spotLat = 'lat' in spotLocation ? spotLocation.lat : spotLocation.latitude;
  const spotLng = 'lng' in spotLocation ? spotLocation.lng : spotLocation.longitude;
  
  return calculateDistance(
    userLat,
    userLng,
    spotLat,
    spotLng
  );
}

/**
 * FASE 4: Calcular distancia total de un path sumando distancias entre spots consecutivos
 * Compatible con ambos formatos: lat/lng y latitude/longitude
 */
export function calculatePathDistance(
  path: { spots: string[] }, 
  spots: Array<{ id: string; location: { lat: number; lng: number } | { latitude: number; longitude: number } }>
): number {
  if (path.spots.length < 2) {
    return 0;
  }

  let totalDistance = 0;

  for (let i = 0; i < path.spots.length - 1; i++) {
    const currentSpotId = path.spots[i];
    const nextSpotId = path.spots[i + 1];

    const currentSpot = spots.find(s => s.id === currentSpotId);
    const nextSpot = spots.find(s => s.id === nextSpotId);

    if (currentSpot && nextSpot) {
      // FASE 4: Normalizar locations
      const currentLat = 'lat' in currentSpot.location ? currentSpot.location.lat : currentSpot.location.latitude;
      const currentLng = 'lng' in currentSpot.location ? currentSpot.location.lng : currentSpot.location.longitude;
      const nextLat = 'lat' in nextSpot.location ? nextSpot.location.lat : nextSpot.location.latitude;
      const nextLng = 'lng' in nextSpot.location ? nextSpot.location.lng : nextSpot.location.longitude;
      
      const segmentDistance = calculateDistance(
        currentLat,
        currentLng,
        nextLat,
        nextLng
      );
      totalDistance += segmentDistance;
    }
  }

  return totalDistance;
}

/**
 * Formatear distancia en formato legible (metros/kilómetros o pies/millas)
 * @param distance Distancia en metros
 * @param useMiles Si es true, usa sistema imperial (pies/millas), sino usa métrico (metros/kilómetros)
 * @returns String formateado o null si distance es undefined/null
 */
export function formatDistance(distance?: number, useMiles: boolean = false): string | null {
  if (distance === undefined || distance === null) {
    return null;
  }

  if (useMiles) {
    // Sistema imperial: pies y millas
    const feet = distance * 3.28084; // 1 metro = 3.28084 pies
    if (feet < 528) {
      // Menos de 528 pies (0.1 millas) → mostrar en pies
      return `${Math.round(feet)} ft`;
    } else {
      // 528 pies o más → mostrar en millas
      const miles = feet / 5280; // 1 milla = 5280 pies
      if (miles < 10) {
        return `${miles.toFixed(1)} mi`;
      } else {
        return `${Math.round(miles)} mi`;
      }
    }
  } else {
    // Sistema métrico: metros y kilómetros
    if (distance < 1000) {
      // Menos de 1km → mostrar en metros
      return `${Math.round(distance)} m`;
    } else {
      // 1km o más → mostrar en kilómetros
      const kilometers = distance / 1000;
      if (kilometers < 10) {
        return `${kilometers.toFixed(1)} km`;
      } else {
        return `${Math.round(kilometers)} km`;
      }
    }
  }
}

