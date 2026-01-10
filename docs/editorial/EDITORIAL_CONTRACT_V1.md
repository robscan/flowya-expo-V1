# Contrato Editorial FLOWYA V1

## Estado del Contrato

Este contrato define FLOWYA V1. Cambios requieren versión nueva.

**Versión**: V1.0  
**Fecha**: 2025-01-XX  
**Estado**: Cerrada

## 1. Principios

- La IA asiste, no decide
- El usuario controla
- La última edición humana gana
- IA solo genera cuando el usuario lo solicita explícitamente
- IA nunca sobrescribe contenido sin confirmación
- IA nunca genera duplicados
- IA nunca se ejecuta silenciosamente

## 2. Qué genera IA

Para spots nuevos (no duplicados), la IA genera:

- **Spot Description**: Descripción breve (máx. 3-4 líneas), clara y directa, no poética, no marketing
- **Narration**: Tres momentos narrativos
  - `anticipation`: 1-2 frases, atmosférico, prepara emocionalmente
  - `presence`: Puede extenderse, storytelling calmado, cuenta secretos del lugar, contexto cultural, historia breve, por qué importa
  - `transition`: 1 frase, cierre suave
- **How to Visit**: Información práctica mínima (acceso, filas/espera, si es libre o controlado). Cauteloso con hechos, no inventa horarios o precios.
- **Plan Info**: Ayuda a decidir si encaja en el día (duración aproximada, nivel de energía, combinación con otros spots cercanos)

## 3. Qué NO genera IA

- ❌ Imágenes
- ❌ Títulos
- ❌ Tags
- ❌ Datos exactos (horarios, precios) si no están disponibles
- ❌ Contenido sin consentimiento del usuario

## 4. Reglas de Duplicidad

- Un spot se considera duplicado si: mismo nombre (case-insensitive) + ubicación igual o muy cercana (≤30m)
- Si existe spot duplicado: NO se llama a OpenAI, se reutiliza contenido existente
- Si NO existe duplicado: Se permite generar contenido con OpenAI

## 5. Audio y Narración

- El texto generado debe ser compatible con TTS (Text-to-Speech)
- Frases naturales
- Sin símbolos raros
- Sin saltos artificiales
- Diseñado para lectura en voz alta
- Máximo ~200 caracteres por bloque de narración

## 6. Prompts Editoriales

### Spot Description
- Objetivo: Explicar qué es el lugar en términos humanos y prácticos
- Máx. 3-4 líneas (no 2 párrafos)
- No poético, no narrativo, no marketing
- Claro y directo
- Puede leerse sin audio

### Narration
- (Ya definida - ver implementación en `utils/aiContentGenerator.ts`)
- anticipation: 1-2 frases, atmosférico, prepara emocionalmente
- presence: Puede extenderse, storytelling calmado, cuenta secretos, contexto cultural, por qué importa
- transition: 1 frase, cierre suave

### How to Visit
- Objetivo: Ayudar al usuario a no frustrarse al llegar
- Solo lo esencial
- Si no se sabe → no inventar
- No horarios falsos, no precios falsos
- Cauteloso con hechos, lenguaje genérico si incierto

### Plan Info
- Objetivo: Ayudar a responder "¿Esto encaja en mi plan ahora o después?"
- Duración aproximada
- Nivel de energía (bajo / medio)
- Si combina bien con otros spots cercanos (sin nombrarlos)
- Sin tiempos exactos, lenguaje aproximado

## 7. Metadatos de Generación

Cada contenido generado por IA incluye metadatos internos:

- `generatedByAI: boolean` (implícito en `aiGenerated.source === 'ai'`)
- `generatedAt: timestamp`
- `model: string` (modelo de IA usado)

Los metadatos son:
- Internos (no visibles al usuario)
- No bloquean edición
- No cambian UI (solo referencia futura)

## 8. Flujo de Generación

1. Usuario crea/edita spot
2. Usuario presiona "Generar con IA"
3. Sistema valida duplicidad (nombre + ubicación cercana)
4. Si existe duplicado: Carga contenido existente, NO llama OpenAI
5. Si NO existe duplicado: Llama OpenAI, genera contenido, guarda metadatos
6. Usuario revisa contenido generado
7. Usuario puede editar cualquier campo
8. Usuario guarda spot

## 9. Versión

**Versión**: V1.0  
**Fecha**: 2025-01-XX  
**Estado**: Cerrada

Cambios futuros requieren crear V2 del contrato.
