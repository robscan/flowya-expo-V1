import { aiConfig, canMakeRequest, getAIConfigError, isAIConfigured } from '@/utils/aiConfig';
import type { SpotType } from '@/data/spots';

export interface SpotEnrichmentResult {
  type?: SpotType;
  shortDescription?: string;
}

const allowedTypes: SpotType[] = [
  'beach',
  'cafe',
  'viewpoint',
  'museum',
  'restaurant',
  'park',
  'monument',
  'market',
  'other',
];

export async function enrichSpotWithAi(params: {
  name: string;
  category?: string;
  signal?: AbortSignal;
}): Promise<{ data: SpotEnrichmentResult | null; error?: string }> {
  if (!isAIConfigured()) {
    return { data: null, error: getAIConfigError() || 'OpenAI not configured' };
  }

  if (!canMakeRequest()) {
    return { data: null, error: 'Rate limit: try again later' };
  }

  const prompt = `Given a place name and optional category, infer a suitable FLOWYA spot type
from the allowed list and write a short 1-2 line Spanish description.
Do NOT invent coordinates or extra facts.

Allowed types: ${allowedTypes.join(', ')}

Return ONLY JSON with the exact shape:
{
  "type": "one_of_allowed_types",
  "shortDescription": ""
}

Name: ${params.name}
Category: ${params.category || 'n/a'}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aiConfig.apiKey}`,
      },
      signal: params.signal,
      body: JSON.stringify({
        model: aiConfig.model,
        messages: [
          { role: 'system', content: 'You are a careful, concise translator and classifier.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { data: null, error: `OpenAI error: ${errorText}` };
    }

    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (!content) {
      return { data: null, error: 'Empty response from OpenAI' };
    }

    const parsed = JSON.parse(content);
    const typeCandidate = typeof parsed.type === 'string' ? parsed.type.trim() : '';
    const shortDescriptionCandidate =
      typeof parsed.shortDescription === 'string' ? parsed.shortDescription.trim() : '';

    const type = allowedTypes.includes(typeCandidate as SpotType)
      ? (typeCandidate as SpotType)
      : undefined;

    return {
      data: {
        type,
        shortDescription: shortDescriptionCandidate || undefined,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI enrichment error';
    return { data: null, error: message };
  }
}
