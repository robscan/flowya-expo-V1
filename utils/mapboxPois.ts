import { MAPBOX_ACCESS_TOKEN, isMapboxConfigured } from '@/utils/mapsConfig';

export interface MapboxPoiResult {
  id: string;
  name: string;
  placeName: string;
  category?: string;
  center: {
    latitude: number;
    longitude: number;
  };
}

const DEFAULT_QUERIES = [
  'restaurant',
  'cafe',
  'park',
  'museum',
  'monument',
  'market',
  'viewpoint',
  'beach',
];

const dedupePois = (pois: MapboxPoiResult[]) => {
  const seen = new Set<string>();
  return pois.filter((poi) => {
    const key = `${poi.name}-${poi.center.latitude.toFixed(5)}-${poi.center.longitude.toFixed(5)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const expandBbox = (
  bbox: { north: number; south: number; east: number; west: number },
  factor: number
) => {
  const latSpan = bbox.north - bbox.south;
  const lngSpan = bbox.east - bbox.west;
  const latPad = (latSpan * (factor - 1)) / 2;
  const lngPad = (lngSpan * (factor - 1)) / 2;
  return {
    north: bbox.north + latPad,
    south: bbox.south - latPad,
    east: bbox.east + lngPad,
    west: bbox.west - lngPad,
  };
};

const logMapboxSanityCheck = async (language: string) => {
  try {
    const origin = typeof window !== 'undefined' ? window.location?.origin : 'unknown';
    const url =
      `https://api.mapbox.com/geocoding/v5/mapbox.places/restaurant.json` +
      `?access_token=${MAPBOX_ACCESS_TOKEN}` +
      `&limit=1` +
      `&language=${language}` +
      `&types=poi`;
    const response = await fetch(url);
    const payload = await response.json().catch(() => ({}));
    const features = Array.isArray(payload?.features) ? payload.features : [];
    const placeUrl =
      `https://api.mapbox.com/geocoding/v5/mapbox.places/cancun.json` +
      `?access_token=${MAPBOX_ACCESS_TOKEN}` +
      `&limit=1` +
      `&language=en` +
      `&types=place`;
    const placeResponse = await fetch(placeUrl);
    const placePayload = await placeResponse.json().catch(() => ({}));
    const placeFeatures = Array.isArray(placePayload?.features) ? placePayload.features : [];
    const restaurantUrl =
      `https://api.mapbox.com/geocoding/v5/mapbox.places/restaurant.json` +
      `?access_token=${MAPBOX_ACCESS_TOKEN}` +
      `&limit=1` +
      `&language=en`;
    const restaurantResponse = await fetch(restaurantUrl);
    const restaurantPayload = await restaurantResponse.json().catch(() => ({}));
    const restaurantFeatures = Array.isArray(restaurantPayload?.features)
      ? restaurantPayload.features
      : [];
    const restaurantMixedUrl =
      `https://api.mapbox.com/geocoding/v5/mapbox.places/restaurant.json` +
      `?access_token=${MAPBOX_ACCESS_TOKEN}` +
      `&limit=1` +
      `&language=en` +
      `&types=poi,place`;
    const restaurantMixedResponse = await fetch(restaurantMixedUrl);
    const restaurantMixedPayload = await restaurantMixedResponse.json().catch(() => ({}));
    const restaurantMixedFeatures = Array.isArray(restaurantMixedPayload?.features)
      ? restaurantMixedPayload.features
      : [];
    console.warn('[AI Coverage] Mapbox sanity check', {
      origin,
      status: response.status,
      statusText: response.statusText,
      message: payload?.message,
      features: features.length,
    });
  } catch (error) {
    console.warn('[AI Coverage] Mapbox sanity check failed', {
      reason: error instanceof Error ? error.message : String(error),
    });
  }
};

export async function fetchMapboxPoisInBbox(params: {
  bbox: { north: number; south: number; east: number; west: number };
  limit?: number;
  language?: string;
  queries?: string[];
  types?: string;
  signal?: AbortSignal;
}): Promise<{ data: MapboxPoiResult[]; error?: string }> {
  if (!isMapboxConfigured()) {
    console.warn('[AI Coverage] Mapbox no configurado');
    return { data: [], error: 'Mapbox not configured' };
  }

  const limit = params.limit ?? 10;
  const queries = params.queries?.length ? params.queries : DEFAULT_QUERIES;
  const perQuery = Math.max(1, Math.ceil(limit / queries.length));
  const language = params.language || 'es';
  const typesParam = params.types ?? '';

  const runQuery = async (bbox: { north: number; south: number; east: number; west: number }) => {
    const bboxParam = `${bbox.west},${bbox.south},${bbox.east},${bbox.north}`;
    const requests = queries.map(async (query) => {
      const encodedQuery = encodeURIComponent(query);
      const url =
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json` +
        `?access_token=${MAPBOX_ACCESS_TOKEN}` +
        `&limit=${perQuery}` +
        `&language=${language}` +
        `${typesParam ? `&types=${encodeURIComponent(typesParam)}` : ''}` +
        `&bbox=${bboxParam}`;

      const response = await fetch(url, { signal: params.signal });
      if (!response.ok) {
        console.warn('[AI Coverage] Mapbox response not ok', {
          status: response.status,
          statusText: response.statusText,
          query,
          bbox: bboxParam,
        });
        return [];
      }
      const payload = await response.json();
      if (payload?.message) {
        console.warn('[AI Coverage] Mapbox payload message', {
          message: payload.message,
          query,
          bbox: bboxParam,
        });
      }
      const features = Array.isArray(payload?.features) ? payload.features : [];
      if (features.length === 0) {
        console.warn('[AI Coverage] Mapbox features vacías', {
          query,
          bbox: bboxParam,
          language,
        });
      }
      return features
        .map((feature: any) => {
          const center = feature?.center;
          if (!Array.isArray(center) || center.length < 2) {
            return null;
          }
          return {
            id: feature.id || `${feature.text}-${center[0]}-${center[1]}`,
            name: feature.text || feature.place_name || query,
            placeName: feature.place_name || '',
            category: feature?.properties?.category || feature?.properties?.category_en || '',
            center: {
              longitude: center[0],
              latitude: center[1],
            },
          } as MapboxPoiResult;
        })
        .filter((item: MapboxPoiResult | null): item is MapboxPoiResult => item !== null);
    });

    const results = await Promise.allSettled(requests);
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.warn('[AI Coverage] Mapbox request rejected', {
          query: queries[index],
          bbox: bboxParam,
          reason: result.reason instanceof Error ? result.reason.message : String(result.reason),
        });
      }
    });
    const allPois = results.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
    const unique = dedupePois(allPois).slice(0, limit);
    if (unique.length === 0) {
      console.warn('[AI Coverage] Mapbox sin resultados', {
        bbox: bboxParam,
        queries,
        perQuery,
      });
    }
    return unique;
  };

  try {
    const initial = await runQuery(params.bbox);
    if (initial.length > 0) {
      return { data: initial };
    }
    // Fallback: ampliar bbox si está vacío (QA / zonas densas con bbox pequeño)
    const expanded = expandBbox(params.bbox, 3);
    const fallback = await runQuery(expanded);
    if (fallback.length === 0 && typeof __DEV__ !== 'undefined' && __DEV__) {
      await logMapboxSanityCheck(language);
    }
    return { data: fallback };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Mapbox POI error';
    return { data: [], error: message };
  }
}
