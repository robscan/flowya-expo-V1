# Auditoría de Audio — P0-05

**Fecha:** 2024-12-21  
**Versión:** FLOWYA V1.1  
**Prioridad:** P0-05

---

## PROPÓSITO

Este documento registra la auditoría completa de uso de audio en el código relacionado con Flow, como paso previo a la eliminación de audio (según orden recomendado: P0-05 primero, luego P0-08, P0-07, P0-06, P0-09, y finalmente eliminación real de audio).

---

## ARCHIVOS QUE USAN AUDIO

### 1. `utils/audioManager.ts`
**Tipo:** Archivo principal de audio  
**Uso:** Singleton que gestiona reproducción de audio (expo-av, expo-speech)

**Funciones principales:**
- `play(source: AudioSource)` - Reproduce audio o TTS
- `stop()` - Detiene audio
- `pause()` - Pausa audio
- `resume()` - Reanuda audio
- `setMuted(muted: boolean)` - Silencia/activa audio
- `setCallbacks(callbacks: AudioManagerCallbacks)` - Configura callbacks

**Decisiones:**
- Marcar como `@deprecated` (no eliminar todavía - verificar si se usa fuera del Flow)

---

### 2. `contexts/NarrationContext.tsx`
**Tipo:** Context que gestiona narraciones  
**Uso de audio:** Extensivo

**Imports relacionados con audio:**
```typescript
import { audioManager, AudioSource } from '@/utils/audioManager';
```

**Funciones que usan audio:**
- `playNarration()` - Línea 103: `await audioManager.play(audioSource)`
- `stopNarration()` - Línea 180: `await audioManager.stop()`
- `pauseNarration()` - Línea 205: `await audioManager.pause()`
- `resumeNarration()` - Línea 213: `await audioManager.resume()`
- `toggleMute()` - Línea 222: `await audioManager.setMuted(newMutedState)`
- `useEffect` (línea 131) - Configura callbacks del audioManager

**Estados relacionados con audio:**
- `status: NarrationStatus` - Incluye 'playing' | 'paused' (dependiente de audio)
- `isMuted: boolean` - Estado de muted

**Qué se eliminará:**
- Llamadas a `audioManager.play()`, `stop()`, `pause()`, `resume()`, `setMuted()`, `setCallbacks()`
- Import de `audioManager`, `AudioSource`
- Estado `isMuted` y función `toggleMute()` (si no se usa fuera del Flow)
- Cambiar `status: 'playing'` a lógica basada en eventos (mantener compatibilidad temporal)

---

### 3. `components/FlowPlayerControls.tsx`
**Tipo:** Componente de controles del player  
**Uso de audio:** Control de mute

**Props relacionadas con audio:**
- `showMute?: boolean` (default: true) - Línea 35, 54

**Uso de audio:**
- Línea 214: `{narration.isMuted ? 'Muted' : 'Narration active'}` (solo en variant='full')
- Función `toggleMute` no está visible en código actual (debe estar en props o no implementada)

**Qué se eliminará:**
- Prop `showMute` si existe
- Texto "Muted" / "Narration active" en variant='full'
- Cualquier control de mute visible

---

### 4. `app/flow-screen.tsx`
**Tipo:** Pantalla principal del Flow  
**Uso de audio:** Botón mute en header + código de test temporal

**Uso de audio:**
- Líneas 786-789: Botón mute/audio en header actions
  ```typescript
  {
    icon: narration.isMuted ? 'mute' : 'audio',
    onPress: narration.toggleMute,
    tooltip: narration.isMuted ? 'Unmute narration' : 'Mute narration',
  }
  ```
- Líneas 118-141: Código de test temporal de Web Speech API (DEBE eliminarse)

**Qué se eliminará:**
- Botón mute/audio del header (líneas 786-789)
- Código de test temporal de Web Speech API (líneas 118-141)

---

### 5. `design-system/FlowPlayer.tsx`
**Tipo:** Componente canónico del Player  
**Uso de audio:** Reproducción inicial de narración

**Uso de audio:**
- Línea 74: `narration.playNarration(initialNarration)` - Reproduce narración inicial
- Línea 86: `narration.stopNarration()` - Detiene narración en cleanup
- Línea 103: `showMute={false}` - Pasa prop showMute como false

**Qué se eliminará:**
- Llamada a `narration.playNarration()` para narración inicial (línea 74)
- Llamada a `narration.stopNarration()` en cleanup (línea 86) - puede mantenerse si es necesario para limpiar estado
- Prop `showMute={false}` (si se elimina la prop showMute)

**Nota:** El código de test de Web Speech API (líneas 62-81) parece ser código de prueba y debe eliminarse.

---

## RESUMEN DE ELIMINACIONES PLANEADAS

### Archivos a modificar:

1. **`contexts/NarrationContext.tsx`**
   - Eliminar: `import { audioManager, AudioSource }`
   - Eliminar: función `narrationToAudioSource()`
   - Eliminar: llamadas a `audioManager.play()`, `stop()`, `pause()`, `resume()`, `setMuted()`, `setCallbacks()`
   - Eliminar: estado `isMuted` y función `toggleMute()` (si no se usa fuera del Flow)
   - Cambiar: `status: 'playing'` a lógica basada en eventos (mantener compatibilidad temporal)
   - Mantener: `currentNarration` y `status` (pero cambiar lógica de status)

2. **`components/FlowPlayerControls.tsx`**
   - Eliminar: Prop `showMute` (línea 35, 54)
   - Eliminar: Texto "Muted" / "Narration active" (línea 214)
   - Eliminar: Cualquier control de mute visible

3. **`app/flow-screen.tsx`**
   - Eliminar: Botón mute/audio del header (líneas 786-789)
   - Eliminar: Código de test temporal de Web Speech API (líneas 118-141)

4. **`design-system/FlowPlayer.tsx`**
   - Eliminar: Llamada a `narration.playNarration()` para narración inicial (línea 74)
   - Eliminar: Llamada a `narration.stopNarration()` en cleanup (línea 86) - o mantener si necesario para limpiar estado
   - Eliminar: Prop `showMute={false}` (línea 103) - si se elimina la prop

5. **`utils/audioManager.ts`**
   - Marcar como `@deprecated` en el comentario del archivo
   - Verificar si se usa fuera del Flow (si no se usa, puede eliminarse completamente)

---

## VERIFICACIÓN DE USO FUERA DEL FLOW

**Pendiente:** Verificar si `audioManager` se usa en otros contextos fuera del Flow.

**Búsqueda realizada:**
- `grep -r "audioManager"` - Solo se encuentra en NarrationContext y en imports

**Conclusión preliminar:**
- `audioManager` parece usarse solo en contexto de Flow/Narration
- Puede marcarse como deprecated y eliminarse después de verificar que no hay otros usos

---

## ORDEN DE ELIMINACIÓN

**⚠️ IMPORTANTE:** La eliminación real de audio se hace DESPUÉS de que subtítulos funcionen (P0-06, P0-09).

**Orden recomendado:**
1. ✅ P0-05 (Auditoría) - COMPLETADO
2. ⏳ P0-08 (Eventos)
3. ⏳ P0-07 (Schema)
4. ⏳ P0-06 (Fix rendering)
5. ⏳ P0-09 (Mini Player)
6. ⏳ P0-05 (Eliminación real de audio)

---

## ESTADO

- ✅ Auditoría completada
- ✅ Archivos identificados
- ✅ Usos específicos documentados
- ✅ Plan de eliminación definido
- ⏳ Eliminación real pendiente (después de P0-06, P0-09)
