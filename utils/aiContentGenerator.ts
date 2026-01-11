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

// SCOPE 1: Contrato estricto de salida JSON
export interface AIGeneratedResponse {
  spotDescription: string;
  narration: {
    anticipation: string;
    presence: string;
    transition: string;
  };
  planInfo: string;
  howToVisit: string;
  culturalContext: string;
}

export interface GeneratedContent {
  whyItMatters?: string;
  culturalContext?: string;
  spotDescription?: string; // Nuevo campo según contrato
  planInfo?: string; // Nuevo campo según contrato
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
 * Crear prompt para GPT-4 con contrato estricto (SCOPE 1)
 */
function createPrompt(spot: Spot, fieldsToGenerate: string[]): string {
  const spotType = getSpotTypePrompt(spot.type);
  const location = spot.location ? `located at ${spot.location.latitude}, ${spot.location.longitude}` : '';
  const name = spot.name || 'this place';
  const existingDescription = spot.description || spot.whyItMatters || '';

  // SCOPE 5: Prompts editoriales canónicos FLOWYA V1
  let prompt = `You are writing content for FLOWYA, an app for mindful exploration of places.

Context: ${name} is ${spotType} ${location}.
${existingDescription ? `Existing information: ${existingDescription}` : ''}

FLOWYA generates content only for NEW spots when:
- No duplicate exists by name + location
- The spot has no previous editorial content
- AI does NOT decide logic
- AI does NOT invent data
- AI does NOT replace existing content

Generated content must be:
- Useful
- Sober
- Editable by humans
- Compatible with audio and UI

You must return EXACTLY this JSON structure (no additional fields, no markdown):
{
  "spotDescription": "",
  "narration": {
    "anticipation": "",
    "presence": "",
    "transition": ""
  },
  "howToVisit": "",
  "planInfo": "",
  "culturalContext": ""
}

Editorial rules for each field:

1. spotDescription:
ROLE: You write concise, neutral descriptions for places in FLOWYA.

STYLE RULES:
- Informative but human
- No hype
- No exaggeration
- No emojis
- No calls to action

CONTENT RULES:
- Describe what the place is
- Mention why people usually come
- Avoid opinions
- Avoid adjectives like "best", "amazing", "unique"

LENGTH:
- 2 to 4 short sentences (maximum 3-4 lines)
- Designed for mobile reading
- Not poetic
- Not narrative
- Not marketing
- Clear and direct
- Can be read without audio

OUTPUT: Return a single string.

2. narration:
(Narration blocks already defined - keep exactly as is)
- anticipation: 1-2 sentences, atmospheric, emotionally prepares
- presence: Can extend, calm storytelling, tell secrets, cultural context, why it matters
- transition: 1 sentence, soft closing

3. howToVisit:
ROLE: You provide practical visiting information for real places.

RULES:
- Be cautious with facts
- If information is uncertain, keep it generic
- Never invent prices, schedules or restrictions
- Only essential information
- Help user not get frustrated when arriving

STYLE:
- Neutral
- Simple
- Helpful

CONTENT (IF INFO EXISTS):
- General access (on foot / car / transport)
- If there are usually lines or waiting
- If it's free or normally controlled

LENGTH:
- 2 to 4 short bullet-style sentences
- Plain text (no emojis, no formatting)

OUTPUT: Return a short paragraph as plain text.

4. planInfo:
ROLE: You help users understand how a place fits into their day.

RULES:
- No exact timings
- Use approximate language
- Avoid promises

STYLE:
- Calm
- Practical
- Short

CONTENT:
- Approximate duration
- Energy level required (low / medium)
- If it combines well with other nearby spots (without naming them)

LENGTH:
- 2 to 3 sentences
- Designed for quick scanning

OUTPUT: Return a single short paragraph.

5. culturalContext:
ROLE: You provide cultural and historical context for the place.

STYLE RULES:
- Informative and respectful
- Focus on factual historical or cultural significance
- Avoid opinions or marketing language
- Neutral tone

CONTENT RULES:
- Historical background (if relevant)
- Cultural significance (if relevant)
- Local context or traditions
- If no specific cultural context exists → empty string ""

LENGTH:
- 2 to 4 sentences
- Clear and concise

OUTPUT: Return a single string.

IMPORTANT: All fields must be populated or explicitly empty (empty string ""). Never return null or undefined. All narration blocks (anticipation, presence, transition) must be strings, even if brief.

SECURITY RULES:
- If a field cannot be generated with certainty → generic text or empty
- Never invent specific local data
- All content must be editable by user
- Last human edit always wins

Return ONLY valid JSON with these exact fields. No explanations, no markdown, no additional text.`;

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

  // SCOPE 1: Siempre generar todos los campos del contrato estricto
  // Si forceRegenerate está activo o no hay campos, generar todos
  if (options?.forceRegenerate || !options?.fields) {
    // Siempre generar: spotDescription, narration, planInfo, howToVisit
    return ['all']; // Marca especial para indicar generación completa
  }

  // Si se especificaron campos específicos, solo generar esos
  return options.fields;
}

/**
 * Generar contenido para un spot
 */
export async function generateSpotContent(
  spot: Spot,
  options?: GenerateContentOptions
): Promise<GeneratedContent> {
  // SCOPE: Log claro de generación para spot nuevo
  console.log('[AI] Generating content for NEW spot:', { spotId: spot.id, spotName: spot.name });

  // SCOPE: Validar configuración antes de continuar
  if (!isAIConfigured()) {
    const errorMsg = getAIConfigError() || 'AI not configured';
    console.error('[AI] Content generation cancelled:', errorMsg);
    throw new Error(errorMsg);
  }

  // SCOPE 0: Validar conexión IA antes de generar contenido
  const isConnectionValid = await validateAIConnection();
  if (!isConnectionValid) {
    throw new Error('AI connection validation failed. Cannot generate content.');
  }

  // Detectar campos faltantes
  const fieldsToGenerate = detectMissingFields(spot, options);

  // SCOPE 1: Validar que haya campos para generar (siempre generar todos según contrato)
  if (fieldsToGenerate.length === 0 || (fieldsToGenerate.length === 1 && fieldsToGenerate[0] !== 'all')) {
    // No hay campos para generar, retornar contenido existente
    return {
      spotDescription: spot.description || spot.whyItMatters,
      whyItMatters: spot.whyItMatters,
      culturalContext: spot.culturalContext,
      howToVisit: spot.howToVisit,
      narration: spot.narration,
      aiGenerated: spot.aiGenerated,
    };
  }

  // Crear prompt
  const prompt = createPrompt(spot, fieldsToGenerate);
  
  // SCOPE 2: Log del prompt enviado
  console.log('[AI] Prompt:', prompt.substring(0, 200) + (prompt.length > 200 ? '...' : ''));

  // Llamar a OpenAI
  let generatedJson: string;
  try {
    generatedJson = await callOpenAI(prompt);
    
    // SCOPE 2: Log de respuesta recibida
    console.log('[AI] Response received:', generatedJson.substring(0, 200) + (generatedJson.length > 200 ? '...' : ''));
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

  // Parsear respuesta JSON (SCOPE 1: validar contrato estricto)
  let parsedContent: AIGeneratedResponse;
  try {
    const parsed = JSON.parse(generatedJson);
    
    // SCOPE 2: Validar estructura exacta del contrato - todos los campos deben ser strings (poblados o vacíos)
    if (
      typeof parsed.spotDescription !== 'string' ||
      !parsed.narration ||
      typeof parsed.narration.anticipation !== 'string' ||
      typeof parsed.narration.presence !== 'string' ||
      typeof parsed.narration.transition !== 'string' ||
      typeof parsed.planInfo !== 'string' ||
      typeof parsed.howToVisit !== 'string' ||
      typeof parsed.culturalContext !== 'string'
    ) {
      throw new Error('Invalid JSON structure: missing required fields or fields not strings');
    }

    // SCOPE 2: Validar que todos los campos de narración existan (pueden estar vacíos, pero deben existir)
    if (!parsed.narration.anticipation || !parsed.narration.presence || !parsed.narration.transition) {
      console.warn('[AI] Some narration fields are empty, but structure is valid');
      // No lanzar error - campos vacíos son válidos según requerimientos
    }
    
    parsedContent = parsed as AIGeneratedResponse;
    
    // SCOPE 2: Log de campos generados
    console.log('[AI] Generated fields:', {
      spotDescription: !!parsedContent.spotDescription,
      narration: !!parsedContent.narration,
      narration_anticipation: !!parsedContent.narration?.anticipation,
      narration_presence: !!parsedContent.narration?.presence,
      narration_transition: !!parsedContent.narration?.transition,
      planInfo: !!parsedContent.planInfo,
      howToVisit: !!parsedContent.howToVisit,
      culturalContext: !!parsedContent.culturalContext,
    });
  } catch (error) {
    console.error('Error parsing AI response:', error);
    throw new Error('Invalid JSON response from AI: structure does not match contract');
  }

  // SCOPE 1: Mapear campos del contrato estricto al modelo Spot
  // Parsear howToVisit como string y convertir a estructura esperada
  let howToVisitParsed: GeneratedContent['howToVisit'];
  try {
    // Intentar parsear como JSON si viene estructurado
    const howToVisitJson = JSON.parse(parsedContent.howToVisit);
    if (howToVisitJson.bestTime || howToVisitJson.photography) {
      howToVisitParsed = howToVisitJson;
    } else {
      // Si es texto plano, crear estructura básica
      howToVisitParsed = {
        bestTime: { icon: 'clock', text: parsedContent.howToVisit },
      };
    }
  } catch {
    // Si no es JSON válido, tratar como texto y crear estructura
    howToVisitParsed = {
      bestTime: { icon: 'clock', text: parsedContent.howToVisit },
    };
  }

  // SCOPE 2: Combinar contenido existente con nuevo generado según contrato
  // Asegurar que todos los campos de narración queden poblados o explícitamente vacíos
  const narration: { anticipation: string; presence: string; transition: string } = {
    anticipation: parsedContent.narration.anticipation || spot.narration?.anticipation || '',
    presence: parsedContent.narration.presence || spot.narration?.presence || '',
    transition: parsedContent.narration.transition || spot.narration?.transition || '',
  };

  const result: GeneratedContent = {
    spotDescription: parsedContent.spotDescription || spot.description || spot.whyItMatters || '',
    whyItMatters: parsedContent.spotDescription || spot.whyItMatters || spot.description || '', // Compatibilidad
    culturalContext: parsedContent.culturalContext || spot.culturalContext || '', // CANONICAL: Mapear desde respuesta de IA
    planInfo: parsedContent.planInfo || '',
    howToVisit: howToVisitParsed || spot.howToVisit,
    narration, // SCOPE 2: Narration siempre poblado (campos pueden estar vacíos pero deben existir)
    // SCOPE 2: Agregar metadatos de generación IA
    aiGenerated: {
      generatedAt: new Date(),
      model: aiConfig.model,
      source: 'ai', // SCOPE 2: Siempre 'ai' cuando se genera con OpenAI (aunque haya contenido existente, el generado es nuevo)
    },
  };

  // SCOPE 2: Log de campos generados - verificar que todos estén poblados
  console.log('[AI] Generated content summary:', {
    spotDescription: !!result.spotDescription && result.spotDescription.length > 0,
    narration: {
      anticipation: !!result.narration?.anticipation && result.narration.anticipation.length > 0,
      presence: !!result.narration?.presence && result.narration.presence.length > 0,
      transition: !!result.narration?.transition && result.narration.transition.length > 0,
    },
    planInfo: !!result.planInfo && result.planInfo.length > 0,
    howToVisit: !!result.howToVisit,
    culturalContext: !!result.culturalContext && result.culturalContext.length > 0,
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

