/**
 * AI Content Generator
 * Scope 12.1: Generación de contenido con OpenAI para spots
 * 
 * Genera contenido visual y narrativo para spots usando GPT-4
 * No duplica contenido existente - solo genera campos faltantes
 */

import { Spot, SpotType } from '@/data/spots';
import { aiConfig, isAIConfigured, getAIConfigError, canMakeRequest } from './aiConfig';

export interface GenerateContentOptions {
  forceRegenerate?: boolean; // Forzar regeneración incluso si hay contenido
  fields?: string[]; // Campos específicos a generar (whyItMatters, culturalContext, etc.)
}

export interface GeneratedContent {
  whyItMatters?: string;
  culturalContext?: string;
  howToVisit?: {
    bestTime?: { icon: string; text: string };
    photography?: { icon: string; text: string };
  };
  narration?: {
    anticipation?: string;
    presence?: string;
    transition?: string;
  };
  aiGenerated?: {
    generatedAt: Date;
    model: string;
    source: 'ai' | 'manual' | 'hybrid';
  };
}

/**
 * Obtener prompt base según tipo de spot
 */
function getSpotTypePrompt(type: SpotType): string {
  const prompts: Record<SpotType, string> = {
    beach: 'a beautiful beach',
    cafe: 'a cozy café',
    viewpoint: 'a scenic viewpoint',
    museum: 'a cultural museum',
    restaurant: 'a local restaurant',
    park: 'a peaceful park',
    monument: 'a historical monument',
    market: 'a vibrant market',
    other: 'a special place',
  };
  return prompts[type] || prompts.other;
}

/**
 * Crear prompt para GPT-4
 */
function createPrompt(spot: Spot, fieldsToGenerate: string[]): string {
  const spotType = getSpotTypePrompt(spot.type);
  const location = spot.location ? `located at ${spot.location.latitude}, ${spot.location.longitude}` : '';
  const name = spot.name || 'this place';
  const existingDescription = spot.description || spot.whyItMatters || '';

  let prompt = `You are a contemplative travel writer helping create content for FLOWYA, an app that encourages mindful exploration of places. 

Context: ${name} is ${spotType} ${location}.

${existingDescription ? `Existing information: ${existingDescription}` : ''}

Generate content following these principles:
- Emotional and contemplative tone
- Short, breathable phrases
- Not exhaustive, only essential
- Spanish language
- Respectful of the place's cultural significance

Generate ONLY the following fields (as JSON, no markdown):
`;

  if (fieldsToGenerate.includes('whyItMatters')) {
    prompt += `- whyItMatters: A brief, emotional explanation of why this place matters (2-3 sentences max)\n`;
  }

  if (fieldsToGenerate.includes('culturalContext')) {
    prompt += `- culturalContext: Cultural and historical context (2-3 sentences max)\n`;
  }

  if (fieldsToGenerate.includes('howToVisit')) {
    prompt += `- howToVisit: {
  bestTime: { icon: "sun" or "moon" or "clock", text: "Best time to visit (1 sentence)" },
  photography: { icon: "camera", text: "Photography tip (1 sentence)" }
}\n`;
  }

  // Narration se genera si está en fieldsToGenerate (NO es visible para el usuario)
  // Se usa automáticamente durante Flow
  if (fieldsToGenerate.includes('narration')) {
    prompt += `- narration: {
  anticipation: "Short emotional text for when approaching (1 sentence)",
  presence: "Short contemplative text for when arriving (1 sentence)",
  transition: "Short text for when leaving (1 sentence)"
}\n`;
  }

  prompt += `\nReturn ONLY valid JSON with the requested fields. No explanations, no markdown.`;

  return prompt;
}

/**
 * Llamar a OpenAI API
 */
async function callOpenAI(prompt: string): Promise<string> {
  if (!isAIConfigured()) {
    throw new Error(getAIConfigError() || 'AI not configured');
  }

  if (!canMakeRequest()) {
    throw new Error('Rate limit: Please wait before making another request');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), aiConfig.timeout);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: aiConfig.model,
        messages: [
          {
            role: 'system',
            content: 'You are a contemplative travel writer for FLOWYA. Generate emotional, short, respectful content about places. Always respond with valid JSON only, no markdown.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: aiConfig.maxTokens,
        temperature: aiConfig.temperature,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    // Limpiar el contenido (remover markdown si existe)
    const cleanedContent = content.trim().replace(/^```json\n?/i, '').replace(/```\n?$/i, '').trim();

    return cleanedContent;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout: AI service took too long to respond');
    }
    throw error;
  }
}

/**
 * Detectar qué campos faltan en el spot
 */
function detectMissingFields(spot: Spot, options?: GenerateContentOptions): string[] {
  if (options?.forceRegenerate) {
    // Si forceRegenerate está activo, generar todos los campos especificados o todos por defecto
    return options.fields || ['whyItMatters', 'culturalContext', 'howToVisit', 'narration'];
  }

  // Si se especificaron campos, solo generar esos (incluso si ya tienen contenido)
  if (options?.fields) {
    return options.fields;
  }

  // Si no se especificaron campos, generar todos los faltantes + narration (siempre para Flow)
  const missing: string[] = [];

  if (!spot.whyItMatters && !spot.description) {
    missing.push('whyItMatters');
  }

  if (!spot.culturalContext) {
    missing.push('culturalContext');
  }

  if (!spot.howToVisit) {
    missing.push('howToVisit');
  }

  // Narration siempre se incluye en generación completa para uso en Flow
  // (incluso si ya existe, puede regenerarse con mejor contexto)
  if (!spot.narration) {
    missing.push('narration');
  }

  return missing;
}

/**
 * Generar contenido para un spot
 */
export async function generateSpotContent(
  spot: Spot,
  options?: GenerateContentOptions
): Promise<GeneratedContent> {
  // Verificar configuración
  if (!isAIConfigured()) {
    throw new Error(getAIConfigError() || 'AI not configured');
  }

  // Detectar campos faltantes
  const fieldsToGenerate = detectMissingFields(spot, options);

  if (fieldsToGenerate.length === 0) {
    // No hay campos para generar, retornar contenido existente
    return {
      whyItMatters: spot.whyItMatters,
      culturalContext: spot.culturalContext,
      howToVisit: spot.howToVisit,
      narration: spot.narration,
      aiGenerated: spot.aiGenerated,
    };
  }

  // Crear prompt
  const prompt = createPrompt(spot, fieldsToGenerate);

  // Llamar a OpenAI
  let generatedJson: string;
  try {
    generatedJson = await callOpenAI(prompt);
  } catch (error: any) {
    // Fallback: retornar contenido existente si hay error
    console.error('Error generating AI content:', error);
    // Retornar contenido existente en lugar de lanzar error
    return {
      whyItMatters: spot.whyItMatters || spot.description,
      culturalContext: spot.culturalContext,
      howToVisit: spot.howToVisit,
      narration: spot.narration,
      aiGenerated: spot.aiGenerated,
    };
  }

  // Parsear respuesta JSON
  let parsedContent: any;
  try {
    parsedContent = JSON.parse(generatedJson);
  } catch (error) {
    console.error('Error parsing AI response:', error);
    throw new Error('Invalid JSON response from AI');
  }

  // Combinar contenido existente con nuevo generado
  const result: GeneratedContent = {
    whyItMatters: parsedContent.whyItMatters || spot.whyItMatters || spot.description,
    culturalContext: parsedContent.culturalContext || spot.culturalContext,
    howToVisit: parsedContent.howToVisit || spot.howToVisit,
    narration: parsedContent.narration || spot.narration,
    aiGenerated: {
      generatedAt: new Date(),
      model: aiConfig.model,
      source: spot.whyItMatters || spot.culturalContext ? 'hybrid' : 'ai',
    },
  };

  return result;
}

/**
 * Clase AIContentGenerator (para uso futuro si se necesita estado)
 */
export class AIContentGenerator {
  async generateContent(spot: Spot, options?: GenerateContentOptions): Promise<GeneratedContent> {
    return generateSpotContent(spot, options);
  }
}

