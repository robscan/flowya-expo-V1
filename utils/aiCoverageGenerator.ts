import type { Spot, SpotType } from '@/data/spots';
import { fetchMapboxPoisInBbox } from '@/utils/mapboxPois';
import { enrichSpotWithAi } from '@/utils/aiSpotEnrichment';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mapCategoryToSpotType = (category?: string): SpotType => {
  const normalized = (category || '').toLowerCase();
  if (normalized.includes('restaurant') || normalized.includes('food')) return 'restaurant';
  if (normalized.includes('cafe') || normalized.includes('coffee')) return 'cafe';
  if (normalized.includes('park')) return 'park';
  if (normalized.includes('museum')) return 'museum';
  if (normalized.includes('monument') || normalized.includes('historic') || normalized.includes('memorial')) return 'monument';
  if (normalized.includes('market')) return 'market';
  if (normalized.includes('beach')) return 'beach';
  if (normalized.includes('view') || normalized.includes('lookout') || normalized.includes('viewpoint')) return 'viewpoint';
  return 'other';
};

export async function generateAiCoverageSpots(params: {
  bbox: { north: number; south: number; east: number; west: number };
  sessionId: string;
  limit?: number;
  signal?: AbortSignal;
  onStep?: (step: string) => void;
}): Promise<{ data: Spot[]; error?: string }> {
  params.onStep?.('Buscando POIs reales...');
  const poiResult = await fetchMapboxPoisInBbox({
    bbox: params.bbox,
    limit: params.limit ?? 10,
    signal: params.signal,
  });

  if (poiResult.error) {
    return { data: [], error: poiResult.error };
  }
  if (poiResult.data.length === 0) {
    console.warn('[AI Coverage] Sin POIs en bbox', {
      bbox: params.bbox,
      limit: params.limit ?? 10,
    });
    return { data: [], error: 'No se encontraron POIs en este bbox.' };
  }
  if (params.signal?.aborted) {
    return { data: [], error: 'cancelled' };
  }

  const spots: Spot[] = [];

  params.onStep?.('Enriqueciendo con IA...');
  for (let index = 0; index < poiResult.data.length; index += 1) {
    if (params.signal?.aborted) {
      return { data: [], error: 'cancelled' };
    }
    const poi = poiResult.data[index];
    let type: SpotType = mapCategoryToSpotType(poi.category);
    let shortDescription = '';
    let hasGeneratedContent = false;

    const enrichment = await enrichSpotWithAi({
      name: poi.name,
      category: poi.category,
      signal: params.signal,
    });

    if (enrichment.data) {
      type = enrichment.data.type || type;
      shortDescription = enrichment.data.shortDescription || '';
      hasGeneratedContent = true;
      await wait(2000);
    }

    spots.push({
      id: `ai-${params.sessionId}-${index + 1}`,
      name: poi.name,
      type,
      location: {
        lat: poi.center.latitude,
        lng: poi.center.longitude,
      },
      shortDescription,
      image: { url: '' },
      hasGeneratedContent,
      isAiGenerated: true,
      aiCoverageSessionId: params.sessionId,
      aiGenerated: hasGeneratedContent
        ? { generatedAt: new Date(), model: 'ai', source: 'ai' }
        : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return { data: spots };
}
