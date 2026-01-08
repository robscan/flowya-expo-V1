# Análisis Funcional: Integración OpenAI API en FLOWYA

## Resumen Ejecutivo

### Funcionalidad Principal

La integración con OpenAI API permite la generación automática de contenido contemplativo para Spots usando GPT-4o. El sistema genera campos específicos (`whyItMatters`, `culturalContext`, `howToVisit`, `narration`) de forma inteligente, sin duplicar contenido existente.

### Alcance

- **Scope 12.1:** Generación de contenido con OpenAI para spots
- **Modelo:** GPT-4o (fallback a gpt-4-turbo-preview si no está disponible)
- **Idioma:** Español (contenido generado)
- **Tono:** Contemplativo y emocional, siguiendo los principios de FLOWYA

---

## 1. Arquitectura de la Integración

### 1.1. Archivos Principales

| Archivo | Propósito | Ubicación |
|---------|-----------|-----------|
| `utils/aiConfig.ts` | Configuración y validación de API key | Líneas 1-60 |
| `utils/aiContentGenerator.ts` | Lógica de generación de contenido | Líneas 1-281 |
| `contexts/SpotContext.tsx` | Integración con contexto de Spots | Líneas 140-161 |
| `app/create-spot.tsx` | UI de creación con botón AI | Líneas 172-220 |
| `app/spot-detail.tsx` | UI de edición con botón AI | Líneas 290-332 |

### 1.2. Flujo de Datos

```
Usuario presiona "AI" 
  ↓
Validar configuración (isAIConfigured)
  ↓
Crear spot temporal con datos actuales
  ↓
Detectar campos faltantes (detectMissingFields)
  ↓
Generar prompt específico (createPrompt)
  ↓
Llamar OpenAI API (callOpenAI)
  ↓
Parsear respuesta JSON
  ↓
Combinar con contenido existente
  ↓
Pre-llenar campos en UI
  ↓
Usuario edita si desea
  ↓
Guardar spot actualizado
```

---

## 2. Configuración (aiConfig.ts)

### 2.1. Variables de Entorno

**Variable requerida:**
```bash
EXPO_PUBLIC_OPENAI_API_KEY=sk-...
```

**Línea:** `utils/aiConfig.ts:8`

### 2.2. Configuración de Modelo

**Modelo principal:** `gpt-4o`
**Fallback:** `gpt-4-turbo-preview` (si gpt-4o no está disponible)

**Línea:** `utils/aiConfig.ts:9`

### 2.3. Parámetros de Generación

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| `maxTokens` | 1000 | Máximo de tokens en la respuesta |
| `temperature` | 0.7 | Balance creatividad/precisión (0.0-2.0) |
| `timeout` | 30000 | Timeout en milisegundos (30 segundos) |

**Líneas:** `utils/aiConfig.ts:19-25`

### 2.4. Validación de Configuración

**Función:** `isAIConfigured()`

**Comportamiento:**
```typescript
export function isAIConfigured(): boolean {
  return !!aiConfig.apiKey && aiConfig.apiKey.trim().length > 0;
}
```

**Retorna:**
- `true`: API key está configurada y no está vacía
- `false`: API key no está configurada o está vacía

**Línea:** `utils/aiConfig.ts:30-32`

**Mensaje de error:**
```typescript
export function getAIConfigError(): string | null {
  if (!isAIConfigured()) {
    return 'OpenAI API key not configured. Please set EXPO_PUBLIC_OPENAI_API_KEY in .env';
  }
  return null;
}
```

**Línea:** `utils/aiConfig.ts:37-42`

### 2.5. Rate Limiting

**Función:** `canMakeRequest()`

**Comportamiento:**
- Intervalo mínimo entre requests: **2 segundos**
- Implementación: Client-side (básica)
- **Nota:** En producción debería manejarse en backend

**Lógica:**
```typescript
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 segundos

export function canMakeRequest(): boolean {
  const now = Date.now();
  if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
    return false;
  }
  lastRequestTime = now;
  return true;
}
```

**Líneas:** `utils/aiConfig.ts:48-58`

**Limitaciones:**
- Solo previene múltiples requests muy rápidos
- No previene requests desde múltiples dispositivos/sesiones
- No tiene límite diario o mensual

---

## 3. Generación de Contenido (aiContentGenerator.ts)

### 3.1. Función Principal

**Función:** `generateSpotContent(spot, options?)`

**Signatura:**
```typescript
export async function generateSpotContent(
  spot: Spot,
  options?: GenerateContentOptions
): Promise<GeneratedContent>
```

**Línea:** `utils/aiContentGenerator.ts:211-214`

### 3.2. Interface de Opciones

```typescript
export interface GenerateContentOptions {
  forceRegenerate?: boolean; // Forzar regeneración incluso si hay contenido
  fields?: string[]; // Campos específicos a generar
}
```

**Campos disponibles:**
- `whyItMatters`
- `culturalContext`
- `howToVisit`
- `narration`

**Línea:** `utils/aiContentGenerator.ts:12-15`

### 3.3. Interface de Contenido Generado

```typescript
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
```

**Línea:** `utils/aiContentGenerator.ts:17-34`

### 3.4. Detección de Campos Faltantes

**Función:** `detectMissingFields(spot, options?)`

**Lógica:**

1. **Si `forceRegenerate === true`:**
   - Genera todos los campos especificados en `options.fields`
   - O todos los campos por defecto si no se especifican

2. **Si `forceRegenerate === false` (default):**
   - Solo genera campos que realmente faltan:
     - `whyItMatters`: Si falta `whyItMatters` Y `description`
     - `culturalContext`: Si falta `culturalContext`
     - `howToVisit`: Si falta `howToVisit`
     - `narration`: Si falta `narration`

3. **Si `options.fields` está especificado:**
   - Solo genera campos que están en la lista Y que faltan

**Línea:** `utils/aiContentGenerator.ts:177-206`

**Ejemplo:**

```typescript
// Spot sin whyItMatters ni description
detectMissingFields(spot)
// Retorna: ['whyItMatters', 'culturalContext', 'howToVisit', 'narration']

// Spot con whyItMatters pero sin culturalContext
detectMissingFields(spot)
// Retorna: ['culturalContext', 'howToVisit', 'narration']

// Forzar regeneración de solo whyItMatters
detectMissingFields(spot, { forceRegenerate: true, fields: ['whyItMatters'] })
// Retorna: ['whyItMatters']
```

### 3.5. Generación de Prompts

**Función:** `createPrompt(spot, fieldsToGenerate)`

**Estructura del Prompt:**

1. **Contexto del Spot:**
   ```
   Context: ${name} is ${spotType} ${location}.
   ```

2. **Información Existente (si hay):**
   ```
   Existing information: ${existingDescription}
   ```

3. **Principios de Escritura:**
   ```
   Generate content following these principles:
   - Emotional and contemplative tone
   - Short, breathable phrases
   - Not exhaustive, only essential
   - Spanish language
   - Respectful of the place's cultural significance
   ```

4. **Campos a Generar (dinámico):**
   - `whyItMatters`: "A brief, emotional explanation of why this place matters (2-3 sentences max)"
   - `culturalContext`: "Cultural and historical context (2-3 sentences max)"
   - `howToVisit`: Objeto con `bestTime` y `photography`
   - `narration`: Objeto con `anticipation`, `presence`, `transition`

**Línea:** `utils/aiContentGenerator.ts:57-105`

**Ejemplo de Prompt Generado:**

```
You are a contemplative travel writer helping create content for FLOWYA, an app that encourages mindful exploration of places. 

Context: Tulum Ruins is a historical monument located at 20.2150, -87.4636.

Existing information: Ancient Mayan ruins overlooking the Caribbean Sea.

Generate content following these principles:
- Emotional and contemplative tone
- Short, breathable phrases
- Not exhaustive, only essential
- Spanish language
- Respectful of the place's cultural significance

Generate ONLY the following fields (as JSON, no markdown):
- whyItMatters: A brief, emotional explanation of why this place matters (2-3 sentences max)
- culturalContext: Cultural and historical context (2-3 sentences max)

Return ONLY valid JSON with the requested fields. No explanations, no markdown.
```

### 3.6. Llamada a OpenAI API

**Función:** `callOpenAI(prompt)`

**Endpoint:** `https://api.openai.com/v1/chat/completions`

**Método:** POST

**Headers:**
```typescript
{
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${aiConfig.apiKey}`
}
```

**Body:**
```typescript
{
  model: 'gpt-4o',
  messages: [
    {
      role: 'system',
      content: 'You are a contemplative travel writer for FLOWYA. Generate emotional, short, respectful content about places. Always respond with valid JSON only, no markdown.'
    },
    {
      role: 'user',
      content: prompt
    }
  ],
  max_tokens: 1000,
  temperature: 0.7
}
```

**Timeout:** 30 segundos (usando `AbortController`)

**Manejo de Errores:**
- Timeout: "Request timeout: AI service took too long to respond"
- Error de API: Mensaje de error de OpenAI
- Sin contenido: "No content received from OpenAI"
- Rate limit: "Rate limit: Please wait before making another request"

**Limpieza de Respuesta:**
- Remueve markdown code blocks (```json ... ```)
- Trim de espacios en blanco

**Línea:** `utils/aiContentGenerator.ts:110-172`

**Ejemplo de Respuesta Esperada:**

```json
{
  "whyItMatters": "Las ruinas de Tulum son un testimonio silencioso de una civilización que supo honrar la tierra y el mar. Este lugar importa porque nos recuerda que los lugares sagrados no desaparecen; se transforman en espacios de contemplación donde el pasado y el presente se encuentran.",
  "culturalContext": "Construidas alrededor del año 1200 d.C., estas ruinas mayas fueron un importante puerto comercial. Su ubicación estratégica junto al mar Caribe refleja la conexión profunda que los mayas tenían con la naturaleza, utilizando el océano como vía de comunicación y comercio."
}
```

### 3.7. Procesamiento de Respuesta

**Flujo:**

1. **Parsear JSON:**
   ```typescript
   parsedContent = JSON.parse(generatedJson);
   ```

2. **Combinar con Contenido Existente:**
   ```typescript
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
   ```

3. **Determinar Source:**
   - `'ai'`: Todo el contenido fue generado (no había contenido previo)
   - `'hybrid'`: Hay contenido previo + contenido generado
   - `'manual'`: No se usa en generación (solo para spots creados manualmente)

**Línea:** `utils/aiContentGenerator.ts:247-269`

---

## 4. Integración con UI

### 4.1. Creación de Spot (create-spot.tsx)

**Ubicación del Botón:** Barra de acciones inferior (líneas 518-544)

**Condiciones para Mostrar:**
- `isAIConfigured() === true`
- `currentLocation !== null`

**Función:** `handleGenerateAI()` (líneas 172-220)

**Flujo:**

1. Validar ubicación
2. Validar configuración de API
3. Crear spot temporal con datos actuales
4. Llamar `generateSpotContent(tempSpot)`
5. Pre-llenar campo `description` con `whyItMatters` generado
6. Mostrar mensaje: "Content generated, Edit before creating."

**Campos Pre-llenados:**
- Solo `description` (con `whyItMatters` generado)
- **Nota:** Otros campos generados (`culturalContext`, `howToVisit`, `narration`) no se muestran en Create Spot

**Feedback Visual:**
- **Normal:** Botón "AI" con icono estrella + texto
- **Generando:** `ActivityIndicator` en lugar de icono
- **Error:** `Alert.alert()` + mensaje en contenedor bajo botones

### 4.2. Edición de Spot (spot-detail.tsx)

**Ubicación del Botón:** Junto al título "Why it matters" (líneas 664-683)

**Condiciones para Mostrar:**
- `isEditMode === true`
- `isAIConfigured() === true`

**Función:** `handleGenerateAI()` (líneas 290-332)

**Flujo:**

1. Validar configuración de API
2. Crear spot temporal con datos **actuales de edición**:
   ```typescript
   const tempSpot: Spot = {
     ...spot,
     name: editName || spot.name,
     description: editDescription || spot.description,
     whyItMatters: editWhyItMatters || spot.whyItMatters,
     culturalContext: editCulturalContext || spot.culturalContext,
     type: editType,
     location: editLocation || spot.location,
   };
   ```
3. Llamar `generateSpotContent(tempSpot)`
4. Pre-llenar campos:
   - `editWhyItMatters` con `whyItMatters` generado
   - `editCulturalContext` con `culturalContext` generado
5. Mostrar mensaje: "Content generated, Edit before saving."

**Campos Pre-llenados:**
- `whyItMatters`
- `culturalContext`
- **Nota:** `howToVisit` se genera pero no se muestra en formulario de edición

**Feedback Visual:**
- **Normal:** Botón pequeño "AI" con icono estrella + texto
- **Generando:** `ActivityIndicator` pequeño
- **Error:** `Alert.alert()` con mensaje específico

### 4.3. Integración con SpotContext

**Función:** `generateSpotContent(spotId, options?)` (líneas 140-161 en SpotContext.tsx)

**Comportamiento:**
```typescript
const generateSpotContent = async (spotId: string, options?: GenerateContentOptions): Promise<void> => {
  const spot = getSpotById(spotId);
  if (!spot) {
    throw new Error(`Spot with id ${spotId} not found`);
  }

  try {
    const generatedContent = await generateAIContent(spot, options);
    
    // Actualizar spot con contenido generado
    updateSpot(spotId, {
      whyItMatters: generatedContent.whyItMatters || spot.whyItMatters,
      culturalContext: generatedContent.culturalContext || spot.culturalContext,
      howToVisit: generatedContent.howToVisit || spot.howToVisit,
      narration: generatedContent.narration || spot.narration,
      aiGenerated: generatedContent.aiGenerated || spot.aiGenerated,
    });
  } catch (error) {
    console.error('Error generating spot content:', error);
    throw error;
  }
};
```

**Uso:**
- Actualmente **no se usa** desde la UI
- Las pantallas de creación/edición llaman directamente a `generateSpotContent` del util
- Podría usarse para generación programática en el futuro

---

## 5. Campos Generados - Análisis Detallado

### 5.1. whyItMatters

**Tipo:** `string`

**Descripción:** Explicación breve y emocional de por qué importa este lugar

**Formato:** 2-3 oraciones máximo

**Tono:** Contemplativo, emocional, respetuoso

**Ejemplo Generado:**
```
"Las ruinas de Tulum son un testimonio silencioso de una civilización que supo honrar la tierra y el mar. Este lugar importa porque nos recuerda que los lugares sagrados no desaparecen; se transforman en espacios de contemplación donde el pasado y el presente se encuentran."
```

**Cuándo se Genera:**
- Si falta `whyItMatters` Y `description`

**Dónde se Usa:**
- **Create Spot:** Se pre-llena en campo `description`
- **Edit Spot:** Se pre-llena en campo `editWhyItMatters`

### 5.2. culturalContext

**Tipo:** `string`

**Descripción:** Contexto cultural e histórico del lugar

**Formato:** 2-3 oraciones máximo

**Tono:** Informativo pero contemplativo, respetuoso de la cultura

**Ejemplo Generado:**
```
"Construidas alrededor del año 1200 d.C., estas ruinas mayas fueron un importante puerto comercial. Su ubicación estratégica junto al mar Caribe refleja la conexión profunda que los mayas tenían con la naturaleza, utilizando el océano como vía de comunicación y comercio."
```

**Cuándo se Genera:**
- Si falta `culturalContext`

**Dónde se Usa:**
- **Edit Spot:** Se pre-llena en campo `editCulturalContext`
- **Create Spot:** No se muestra (no hay campo en UI)

### 5.3. howToVisit

**Tipo:** `SpotHowToVisit`

**Estructura:**
```typescript
{
  bestTime?: {
    icon: string; // "sun" | "moon" | "clock"
    text: string; // 1 oración
  };
  photography?: {
    icon: string; // "camera"
    text: string; // 1 oración
  };
}
```

**Ejemplo Generado:**
```json
{
  "bestTime": {
    "icon": "sun",
    "text": "Visita temprano en la mañana (8-10 AM) para luz suave y menos multitudes."
  },
  "photography": {
    "icon": "camera",
    "text": "Permitido en todas partes, pero los trípodes requieren un permiso especial."
  }
}
```

**Cuándo se Genera:**
- Si falta `howToVisit`

**Dónde se Usa:**
- **Edit Spot:** No se muestra en formulario (pero se genera y guarda)
- **Create Spot:** No se muestra en formulario
- **Nota:** Este campo se genera pero actualmente no tiene UI de edición

### 5.4. narration

**Tipo:** `SpotNarration`

**Estructura:**
```typescript
{
  anticipation?: string; // Texto para cuando se acerca
  presence?: string;     // Texto para cuando llega
  transition?: string;   // Texto para cuando se va
}
```

**Ejemplo Generado:**
```json
{
  "anticipation": "Mientras te acercas, siente cómo la historia antigua se mezcla con el viento del mar.",
  "presence": "Estás aquí, en un lugar donde el tiempo parece detenerse y la contemplación es inevitable.",
  "transition": "Al partir, lleva contigo la sensación de haber estado en un espacio sagrado."
}
```

**Cuándo se Genera:**
- Si falta `narration`

**Dónde se Usa:**
- **No visible en UI:** Este campo es para narrativas de audio, no para mostrar en pantalla
- Se usa en `NarrationContext` para reproducir durante Flow activo

---

## 6. Manejo de Errores

### 6.1. Errores de Configuración

**Error:** API key no configurada

**Mensaje:**
```
"OpenAI API key is not configured. Please set EXPO_PUBLIC_OPENAI_API_KEY in .env"
```

**Cuándo Ocurre:**
- `isAIConfigured() === false`

**Manejo:**
- `Alert.alert()` en UI
- Botón AI no se muestra o se deshabilita

### 6.2. Errores de Rate Limiting

**Error:** Request muy rápido

**Mensaje:**
```
"Rate limit: Please wait before making another request"
```

**Cuándo Ocurre:**
- `canMakeRequest() === false` (menos de 2 segundos desde último request)

**Manejo:**
- Lanza error
- UI muestra `Alert.alert()`
- Usuario debe esperar 2 segundos

### 6.3. Errores de Timeout

**Error:** Timeout de 30 segundos

**Mensaje:**
```
"Request timeout: AI service took too long to respond"
```

**Cuándo Ocurre:**
- OpenAI API tarda más de 30 segundos en responder

**Manejo:**
- `AbortController` cancela request
- Lanza error con mensaje específico
- UI muestra `Alert.alert()`

### 6.4. Errores de API

**Error:** Error de OpenAI API

**Mensaje:**
```
Error: ${errorData.error?.message || `OpenAI API error: ${response.statusText}`}
```

**Cuándo Ocurre:**
- `response.ok === false`
- Ejemplos: API key inválida, cuota excedida, error de servidor

**Manejo:**
- Extrae mensaje de error de respuesta JSON
- Lanza error con mensaje
- UI muestra `Alert.alert()` con mensaje específico

### 6.5. Errores de Parsing

**Error:** JSON inválido

**Mensaje:**
```
"Invalid JSON response from AI"
```

**Cuándo Ocurre:**
- `JSON.parse()` falla
- Respuesta no es JSON válido

**Manejo:**
- Lanza error
- UI muestra `Alert.alert()`
- Contenido no se aplica

### 6.6. Errores de Sin Contenido

**Error:** Respuesta sin contenido

**Mensaje:**
```
"No content received from OpenAI"
```

**Cuándo Ocurre:**
- `data.choices[0].message.content` es `null` o `undefined`

**Manejo:**
- Lanza error
- UI muestra `Alert.alert()`

### 6.7. Fallback en Caso de Error

**Comportamiento Actual:**
- Si hay error, se lanza excepción
- No hay fallback automático
- Usuario debe intentar de nuevo manualmente

**Posible Mejora Futura:**
- Retornar contenido existente si hay error
- O retornar contenido genérico como fallback

---

## 7. Casos de Uso Detallados

### Caso 1: Generar Contenido en Creación de Spot (Vacío)

**Usuario:** Creador  
**Escenario:** Crear nuevo spot sin contenido previo

**Flujo:**
1. Usuario entra en Create Spot
2. Usuario sube foto
3. Usuario selecciona ubicación
4. Usuario selecciona tipo (beach, cafe, etc.)
5. Usuario opcionalmente escribe nombre
6. Usuario presiona botón "AI"
7. Sistema crea spot temporal:
   ```typescript
   {
     id: 'temp',
     name: name || undefined,
     location: currentLocation,
     photos: [photo],
     type: 'beach',
     // Sin whyItMatters, sin description, sin culturalContext
   }
   ```
8. Sistema detecta campos faltantes: `['whyItMatters', 'culturalContext', 'howToVisit', 'narration']`
9. Sistema genera prompt con todos los campos
10. Sistema llama OpenAI API
11. Sistema recibe JSON con todos los campos generados
12. Sistema pre-llena `description` con `whyItMatters` generado
13. Usuario ve descripción generada
14. Usuario puede editar antes de crear
15. Usuario presiona "Send"
16. Spot se crea con descripción generada

**Resultado:**
- `description`: Pre-llenado con `whyItMatters` generado
- `whyItMatters`: Se genera pero no se guarda en Create Spot (solo description)
- `culturalContext`: Se genera pero no se guarda
- `howToVisit`: Se genera pero no se guarda
- `narration`: Se genera pero no se guarda

**Tiempo Estimado:** 10-20 segundos (generación) + tiempo de edición

---

### Caso 2: Generar Contenido en Edición de Spot (Parcial)

**Usuario:** Editor  
**Escenario:** Editar spot que ya tiene `whyItMatters` pero falta `culturalContext`

**Flujo:**
1. Usuario entra en modo edición
2. Usuario ve que `whyItMatters` tiene contenido pero `culturalContext` está vacío
3. Usuario presiona botón "AI" junto a "Why it matters"
4. Sistema crea spot temporal con datos actuales de edición:
   ```typescript
   {
     ...spot,
     whyItMatters: editWhyItMatters, // Ya tiene contenido
     culturalContext: editCulturalContext, // Vacío
     // ...
   }
   ```
5. Sistema detecta campos faltantes: `['culturalContext', 'howToVisit', 'narration']`
6. Sistema genera prompt solo para campos faltantes
7. Sistema llama OpenAI API
8. Sistema recibe JSON con campos generados
9. Sistema pre-llena:
   - `editWhyItMatters`: Se mantiene (ya tenía contenido)
   - `editCulturalContext`: Se pre-llena con contenido generado
10. Usuario ve `culturalContext` generado
11. Usuario puede editar antes de guardar
12. Usuario presiona "Save"
13. Spot se actualiza con `culturalContext` generado

**Resultado:**
- `whyItMatters`: Se mantiene (no se regenera porque ya tenía contenido)
- `culturalContext`: Pre-llenado y guardado con contenido generado
- `howToVisit`: Se genera pero no se muestra en formulario
- `narration`: Se genera pero no se muestra en formulario

**Tiempo Estimado:** 10-20 segundos (generación) + tiempo de edición

---

### Caso 3: Forzar Regeneración

**Usuario:** Editor  
**Escenario:** Regenerar `whyItMatters` aunque ya tenga contenido

**Código Necesario:**
```typescript
const generatedContent = await generateSpotContent(tempSpot, {
  forceRegenerate: true,
  fields: ['whyItMatters']
});
```

**Nota:** Actualmente no hay UI para `forceRegenerate`. Sería una mejora futura.

**Flujo (si se implementara):**
1. Usuario entra en modo edición
2. Usuario ve `whyItMatters` con contenido existente
3. Usuario presiona "Regenerar" o similar
4. Sistema llama `generateSpotContent` con `forceRegenerate: true`
5. Sistema ignora contenido existente
6. Sistema genera nuevo `whyItMatters`
7. Sistema reemplaza contenido anterior

---

### Caso 4: Error de Configuración

**Usuario:** Cualquiera  
**Escenario:** Intentar usar AI sin API key configurada

**Flujo:**
1. Usuario entra en Create Spot o Edit Spot
2. Usuario presiona botón "AI"
3. Sistema valida: `isAIConfigured() === false`
4. Sistema muestra `Alert.alert('AI not configured', '...')`
5. Botón AI no hace nada

**Mensaje Mostrado:**
```
"OpenAI API key is not configured. Please set EXPO_PUBLIC_OPENAI_API_KEY in .env"
```

**Solución:**
- Usuario debe configurar `EXPO_PUBLIC_OPENAI_API_KEY` en `.env`
- O configurar en Vercel Environment Variables para producción

---

### Caso 5: Error de Rate Limit

**Usuario:** Editor  
**Escenario:** Presionar "AI" múltiples veces muy rápido

**Flujo:**
1. Usuario presiona "AI" → Request exitoso
2. Usuario presiona "AI" otra vez menos de 2 segundos después
3. Sistema valida: `canMakeRequest() === false`
4. Sistema lanza error: "Rate limit: Please wait before making another request"
5. UI muestra `Alert.alert()` con mensaje
6. Usuario espera 2 segundos
7. Usuario puede presionar "AI" de nuevo

---

### Caso 6: Error de Timeout

**Usuario:** Creador  
**Escenario:** OpenAI API tarda más de 30 segundos

**Flujo:**
1. Usuario presiona "AI"
2. Sistema envía request a OpenAI API
3. OpenAI API no responde después de 30 segundos
4. `AbortController` cancela request
5. Sistema lanza error: "Request timeout: AI service took too long to respond"
6. UI muestra `Alert.alert()` con mensaje
7. Usuario puede intentar de nuevo

---

## 8. Limitaciones y Consideraciones

### 8.1. Limitaciones Actuales

1. **Rate Limiting Client-Side:**
   - Solo previene requests rápidos desde el mismo dispositivo
   - No previene múltiples usuarios desde diferentes dispositivos
   - No tiene límite diario/mensual

2. **Solo Genera en Español:**
   - Hardcodeado en prompt
   - No hay opción para otros idiomas

3. **No hay Preview:**
   - Contenido se aplica directamente
   - No hay opción de aceptar/rechazar antes de aplicar

4. **Create Spot no Muestra Todos los Campos:**
   - `culturalContext` se genera pero no se muestra
   - `howToVisit` se genera pero no se muestra
   - `narration` se genera pero no se muestra

5. **Edit Spot no Muestra Todos los Campos:**
   - `howToVisit` se genera pero no tiene UI de edición
   - `narration` se genera pero no tiene UI de edición

6. **No hay Forzar Regeneración desde UI:**
   - No hay botón para regenerar campos que ya tienen contenido
   - Requeriría llamar función directamente con `forceRegenerate: true`

7. **No hay Fallback en Errores:**
   - Si hay error, no hay contenido genérico como fallback
   - Usuario debe intentar de nuevo manualmente

8. **Timeout Fijo:**
   - 30 segundos puede ser corto para generaciones complejas
   - No hay opción de aumentar timeout

### 8.2. Consideraciones de Costos

**Modelo:** GPT-4o

**Estimación de Costos:**
- Por request: ~100-500 tokens de prompt + ~200-800 tokens de respuesta
- Total por request: ~300-1300 tokens
- Costo aproximado: $0.001-0.005 USD por request (depende de pricing actual)

**Recomendaciones:**
- Monitorear uso para evitar costos inesperados
- Considerar límites diarios/mensuales
- Implementar cache para evitar regenerar mismo contenido
- Considerar usar modelo más barato (GPT-3.5-turbo) para ciertos casos

### 8.3. Consideraciones de Privacidad

**Datos Enviados a OpenAI:**
- Nombre del spot (si existe)
- Tipo de spot
- Coordenadas (lat/lng)
- Descripción existente (si existe)

**Datos NO Enviados:**
- Fotos
- Información del usuario
- Otros spots

**Recomendaciones:**
- Revisar términos de servicio de OpenAI
- Considerar si las coordenadas son datos sensibles
- Implementar consentimiento explícito si es necesario

### 8.4. Mejoras Futuras Recomendadas

1. **Backend para Rate Limiting:**
   - Mover rate limiting a backend
   - Implementar límites diarios/mensuales
   - Monitoreo de uso

2. **Soporte Multi-idioma:**
   - Detectar idioma del usuario
   - Generar contenido en idioma correspondiente

3. **Preview de Contenido:**
   - Mostrar contenido generado antes de aplicar
   - Opción de aceptar/rechazar
   - Opción de editar antes de aplicar

4. **UI Completa para Todos los Campos:**
   - Mostrar `culturalContext` en Create Spot
   - UI de edición para `howToVisit`
   - Visualización de `narration` (solo lectura)

5. **Forzar Regeneración desde UI:**
   - Botón "Regenerar" para campos que ya tienen contenido
   - Opción de regenerar todos los campos

6. **Fallback en Errores:**
   - Contenido genérico como fallback
   - O retornar contenido existente si hay error

7. **Cache:**
   - Cachear respuestas para evitar regenerar mismo contenido
   - Invalidar cache si usuario edita contenido

8. **Timeout Configurable:**
   - Permitir aumentar timeout para generaciones complejas
   - O mostrar progreso durante generación larga

---

## 9. Dependencias

### Dependencias Externas

| Dependencia | Versión | Uso |
|-------------|---------|-----|
| OpenAI API | v1 | Chat Completions endpoint |
| Node.js `fetch` | Built-in | HTTP requests |

### Dependencias Internas

| Módulo | Uso |
|--------|-----|
| `@/utils/aiConfig` | Configuración y validación |
| `@/data/spots` | Tipos `Spot`, `SpotType` |
| `@/contexts/SpotContext` | Actualización de spots |

---

## 10. Testing Recomendado

### 10.1. Tests Unitarios

**Funciones a Testear:**

1. `isAIConfigured()`
   - Con API key válida
   - Sin API key
   - Con API key vacía

2. `canMakeRequest()`
   - Primer request (debe permitir)
   - Request dentro de 2 segundos (debe denegar)
   - Request después de 2 segundos (debe permitir)

3. `detectMissingFields()`
   - Spot sin campos
   - Spot con algunos campos
   - Spot con todos los campos
   - Con `forceRegenerate: true`
   - Con `fields` específicos

4. `createPrompt()`
   - Diferentes tipos de spot
   - Con/sin información existente
   - Con diferentes campos a generar

5. `callOpenAI()` (mock)
   - Request exitoso
   - Error de timeout
   - Error de API
   - JSON inválido
   - Sin contenido

### 10.2. Tests de Integración

1. **Flujo Completo de Generación:**
   - Crear spot → Generar contenido → Verificar campos pre-llenados

2. **Flujo de Edición:**
   - Editar spot → Generar contenido → Verificar campos actualizados

3. **Manejo de Errores:**
   - Error de configuración
   - Error de rate limit
   - Error de timeout
   - Error de API

### 10.3. Tests E2E

1. **Crear Spot con AI:**
   - Usuario crea spot → Presiona AI → Espera generación → Verifica contenido

2. **Editar Spot con AI:**
   - Usuario edita spot → Presiona AI → Espera generación → Verifica contenido → Guarda

---

## Conclusión

La integración con OpenAI API está **funcional y completa** para el Scope 12.1, permitiendo:

- ✅ Generación automática de contenido contemplativo
- ✅ Detección inteligente de campos faltantes
- ✅ Validación y manejo de errores
- ✅ Rate limiting básico
- ✅ Integración con UI de creación y edición

**Mejoras Futuras Recomendadas:**
- Backend para rate limiting robusto
- Preview de contenido generado
- UI completa para todos los campos generados
- Cache para evitar regeneraciones innecesarias
- Soporte multi-idioma
- Fallback en errores

---

**Documento generado:** 2024  
**Versión del Proyecto:** 1.0.0  
**Última actualización:** Análisis completo de integración OpenAI API
