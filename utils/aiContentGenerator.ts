/**
 * AI Content Generator - FLOWYA V1.2
 * 
 * FASE 2: Refactorización para nuevo modelo simplificado
 * 
 * Genera SOLO shortDescription (texto evocativo de 1-2 líneas) bajo demanda.
 * NO genera flow narrative ni campos estructurados.
 * NO se ejecuta durante la creación de un Spot.
 * SOLO se ejecuta bajo demanda cuando el usuario abre un Spot sin contenido.
 * 
 * @see definitions/FLOWYA V1.2/ANALISIS_MIGRACION_SPOT_V1.2.md
 */

import { Spot, SpotType } from '@/data/spots';
import { aiConfig, isAIConfigured, getAIConfigError, canMakeRequest } from './aiConfig';

export interface GenerateContentOptions {
  forceRegenerate?: boolean; // Forzar regeneración incluso si hay contenido
  fields?: string[]; // Campos solicitados (actualmente ignorado)
}

/**
 * Respuesta de IA según nuevo modelo V1.2
 * Solo genera shortDescription (texto evocativo)
 */
export interface AIGeneratedResponse {
  shortDescription: string; // 1-2 líneas, evocativo
}

/**
 * Contenido generado (compatible con modelo actual durante migración)
 * FASE 2: Simplificado a solo shortDescription
 */
export interface GeneratedContent {
  shortDescription?: string; // Nuevo campo principal
  // Campos legacy para compatibilidad temporal (se eliminarán en fase 4)
  spotDescription?: string; // Alias de shortDescription para compatibilidad
  whyItMatters?: string; // Deprecated - usar shortDescription
  culturalContext?: string; // Deprecated - eliminar
  planInfo?: string; // Deprecated - eliminar
  howToVisit?: {
    bestTime?: { icon: string; text: string };
    photography?: { icon: string; text: string };
  }; // Deprecated - eliminar
  // FASE 3: narration eliminado - Flow narrative eliminado del modelo Spot
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
 * Crear prompt para GPT-4 - FLOWYA V1.2 (Simplificado)
 * 
 * FASE 2: Solo genera shortDescription (texto evocativo de 1-2 líneas)
 */
function createPrompt(spot: Spot): string {
  const spotType = getSpotTypePrompt(spot.type);
  const latitude =
    spot.location && 'lat' in spot.location ? spot.location.lat : spot.location?.latitude;
  const longitude =
    spot.location && 'lng' in spot.location ? spot.location.lng : spot.location?.longitude;
  const location =
    typeof latitude === 'number' && typeof longitude === 'number'
      ? `located at ${latitude}, ${longitude}`
      : '';
  const name = spot.name || 'this place';
  const existingDescription = spot.description || spot.whyItMatters || spot.shortDescription || '';

  const prompt = `You are writing content for FLOWYA, an app for mindful exploration of places.

Context: ${name} is ${spotType} ${location}.
${existingDescription ? `Existing information: ${existingDescription}` : ''}

FLOWYA V1.2 generates content only when:
- The user explicitly requests it (under demand)
- The spot has no previous generated content
- AI does NOT decide logic
- AI does NOT invent data
- AI does NOT replace existing content

You must return EXACTLY this JSON structure (no additional fields, no markdown):
{
  "shortDescription": ""
}

Editorial rules for shortDescription:

ROLE: You write evocative, concise descriptions for places in FLOWYA.

STYLE RULES:
- Evocative but human
- No hype
- No exaggeration
- No emojis
- No calls to action
- Contemplative tone

CONTENT RULES:
- Describe what the place is
- Evoke why it matters (subtly)
- Avoid opinions
- Avoid adjectives like "best", "amazing", "unique"
- Focus on essence and atmosphere

LENGTH:
- 1 to 2 lines maximum
- Very short sentences
- Designed for mobile reading
- Poetic but not flowery
- Clear and direct
- Can be read without audio

EXAMPLES:
- "A quiet beach where the horizon stretches endlessly. The sound of waves accompanies moments of reflection."
- "A local café that preserves the rhythm of neighborhood life. Coffee, conversation, and the slow passage of time."
- "A viewpoint that reveals the city below. A pause to observe, breathe, and remember why we travel."

IMPORTANT:
- Must be a single string
- Maximum 2 lines (approximately 150-200 characters)
- Never return null or undefined
- If uncertain, return a generic but evocative description

SECURITY RULES:
- If information cannot be generated with certainty → generic but evocative text
- Never invent specific local data
- All content must be editable by user
- Last human edit always wins

Return ONLY valid JSON with this exact field. No explanations, no markdown, no additional text.`;

  return prompt;
}

/**
 * SCOPE 3: Función pública de prueba de conexión IA
 */
export async function testAIConnection(): Promise<boolean> {
  try {
    const isValid = await validateAIConnection();
    if (isValid) {
      console.log('[AI] Connection test: OK');
    } else {
      console.error('[AI] Connection test: FAILED - Validation returned false');
    }
    return isValid;
  } catch (error: any) {
    console.error('[AI] Connection test: FAILED -', error.message || error);
    return false;
  }
}

/**
 * Validar conexión con IA mediante prompt de prueba
 * SCOPE 0: Validación de conexión antes de generar contenido
 */
async function validateAIConnection(): Promise<boolean> {
  if (!isAIConfigured()) {
    console.error('[FLOWYA AI] Connection validation failed: AI not configured');
    return false;
  }

  const testPrompt = 'System check: Respond with the exact phrase: "FLOWYA_AI_CONNECTION_OK"';
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
            role: 'user',
            content: testPrompt,
          },
        ],
        max_tokens: 50, // Respuesta corta
        temperature: 0, // Sin creatividad para respuesta exacta
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[FLOWYA AI] Connection validation failed:', errorData.error?.message || response.statusText);
      return false;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (content === 'FLOWYA_AI_CONNECTION_OK') {
      console.log('[FLOWYA AI] Connection OK');
      return true;
    } else {
      console.error('[FLOWYA AI] Connection validation failed: Unexpected response:', content);
      return false;
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error('[FLOWYA AI] Connection validation failed: Request timeout');
    } else {
      console.error('[FLOWYA AI] Connection validation failed:', error.message || error);
    }
    return false;
  }
}

/**
 * Llamar a OpenAI API
 * SCOPE: Validación y logging de configuración antes de llamar
 */
async function callOpenAI(prompt: string): Promise<string> {
  // SCOPE: Validar configuración antes de llamar
  if (!isAIConfigured()) {
    const errorMsg = getAIConfigError() || 'AI not configured';
    console.error('[AI] OpenAI API call cancelled:', errorMsg);
    throw new Error(errorMsg);
  }

  if (!canMakeRequest()) {
    const errorMsg = 'Rate limit: Please wait before making another request';
    console.warn('[AI] OpenAI API call cancelled:', errorMsg);
    throw new Error(errorMsg);
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
 * Verificar si el spot necesita generación de contenido
 * 
 * FASE 2: Solo verifica si shortDescription está vacío o si forceRegenerate está activo
 */
function shouldGenerateContent(spot: Spot, options?: GenerateContentOptions): boolean {
  // Si forceRegenerate está activo, siempre generar
  if (options?.forceRegenerate) {
    return true;
  }

  // Si ya tiene shortDescription (o description/whyItMatters como fallback), no generar
  const hasDescription = spot.shortDescription || spot.description || spot.whyItMatters;
  if (hasDescription && hasDescription.trim().length > 0) {
    return false;
  }

  // Si no tiene descripción, necesita generación
  return true;
}

/**
 * Generar contenido para un spot - FLOWYA V1.2 (Simplificado)
 * 
 * FASE 2: Solo genera shortDescription (texto evocativo de 1-2 líneas)
 * NO genera flow narrative ni campos estructurados.
 * 
 * @param spot Spot para generar contenido
 * @param options Opciones de generación
 * @returns Contenido generado (solo shortDescription)
 */
export async function generateSpotContent(
  spot: Spot,
  options?: GenerateContentOptions
): Promise<GeneratedContent> {
  // FASE 2: Log claro de generación bajo demanda
  console.log('[AI V1.2] Generating shortDescription on demand:', { spotId: spot.id, spotName: spot.name });

  // Validar configuración antes de continuar
  if (!isAIConfigured()) {
    const errorMsg = getAIConfigError() || 'AI not configured';
    console.error('[AI] Content generation cancelled:', errorMsg);
    throw new Error(errorMsg);
  }

  // Validar conexión IA antes de generar contenido
  const isConnectionValid = await validateAIConnection();
  if (!isConnectionValid) {
    throw new Error('AI connection validation failed. Cannot generate content.');
  }

  // FASE 2: Verificar si necesita generación
  if (!shouldGenerateContent(spot, options)) {
    // Ya tiene contenido, retornar contenido existente
    console.log('[AI V1.2] Spot already has content, skipping generation');
    return {
      shortDescription: spot.shortDescription || spot.description || spot.whyItMatters,
      spotDescription: spot.description || spot.whyItMatters, // Compatibilidad temporal
      whyItMatters: spot.whyItMatters, // Compatibilidad temporal
    };
  }

  // Crear prompt simplificado
  const prompt = createPrompt(spot);
  
  // Log del prompt enviado
  console.log('[AI V1.2] Prompt:', prompt.substring(0, 200) + (prompt.length > 200 ? '...' : ''));

  // Llamar a OpenAI
  let generatedJson: string;
  try {
    generatedJson = await callOpenAI(prompt);
    
    // Log de respuesta recibida
    console.log('[AI V1.2] Response received:', generatedJson.substring(0, 200) + (generatedJson.length > 200 ? '...' : ''));
  } catch (error: any) {
    // Fallback: retornar contenido existente si hay error
    console.error('[AI V1.2] Error generating content:', error);
    throw error; // Lanzar error para que el llamador pueda manejarlo
  }

  // Parsear respuesta JSON
  let parsedContent: AIGeneratedResponse;
  try {
    const parsed = JSON.parse(generatedJson);
    
    // FASE 2: Validar estructura simplificada - solo shortDescription
    if (typeof parsed.shortDescription !== 'string') {
      throw new Error('Invalid JSON structure: shortDescription must be a string');
    }
    
    parsedContent = parsed as AIGeneratedResponse;
    
    // Log de campo generado
    console.log('[AI V1.2] Generated shortDescription:', {
      length: parsedContent.shortDescription.length,
      preview: parsedContent.shortDescription.substring(0, 50) + '...',
    });
  } catch (error) {
    console.error('[AI V1.2] Error parsing AI response:', error);
    throw new Error('Invalid JSON response from AI: structure does not match contract');
  }

  // FASE 2: Construir resultado solo con shortDescription
  const result: GeneratedContent = {
    shortDescription: parsedContent.shortDescription || '',
    // Campos de compatibilidad temporal (se eliminarán en fase 4)
    spotDescription: parsedContent.shortDescription, // Alias para compatibilidad
    whyItMatters: parsedContent.shortDescription, // Alias para compatibilidad
    // Metadatos de generación
    aiGenerated: {
      generatedAt: new Date(),
      model: aiConfig.model,
      source: 'ai',
    },
  };

  // Log de contenido generado
  console.log('[AI V1.2] Generated content summary:', {
    shortDescription: !!result.shortDescription && result.shortDescription.length > 0,
    length: result.shortDescription?.length || 0,
  });

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

