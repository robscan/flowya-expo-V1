# FLOWYA — BACKLOG V1.1

Referencia Oficial para Iteración V1.1 (Web)

## CONTEXTO GENERAL

FLOWYA V1.1 se enfoca en estabilizar y pulir la experiencia core, sin introducir cambios fuera de alcance ni romper la experiencia actual.

**Decisiones clave para esta versión:**

- Se elimina completamente el audio del Flow.
- La experiencia narrativa se sostiene exclusivamente con texto (subtítulos).
- Se mantienen los tres momentos del Flow, refinados a nivel de eventos.
- La experiencia debe sentirse confiable, clara y continua, incluso en navegador web.
- Cualquier ajuste debe respetar lo ya definido y ejecutarse de forma incremental.

## PRINCIPIOS NO NEGOCIABLES

- No romper la experiencia actual.
- No cambiar flujos ya definidos.
- No introducir funcionalidades fuera de scope.
- Implementar por prioridad (P0 → P1 → P2).
- Después de cada bloque P, hacer pausa para revisión.
- La narrativa del Flow se basa en eventos del sistema, no en pantallas.

## PRIORIDADES

- **P0**: Bloqueante / crítico para experiencia y confianza.
- **P1**: Mejora fuerte de UX, coherencia y percepción de calidad.
- **P2**: Optimización, escalabilidad o exploración futura.

---

## 🔴 P0 — CRÍTICO

### P0-01 · Reemplazar componente Location por Mapbox Search oficial

**Problema**

- Campo de texto difícil de borrar.
- Resultados pobres por nombre comercial.
- Reverse geocoding incompleto (solo municipio).
- Dirección no usable al seleccionar en mapa.

**Acción**

- Usar Mapbox Search / Geocoding oficial.
- Campo completamente editable y reseteable.
- Retornar dirección completa (calle + referencia si existe).
- Mantener fallback solo cuando no haya address preciso.

---

### P0-02 · Corregir caché de imágenes al crear o editar Spot

**Problema**

- Imagen no aparece inmediatamente en Spot ni en Card.

**Acción**

- Invalidar caché correctamente.
- Forzar actualización visual tras guardar.

---

### P0-03 · Evitar duplicación visual de Spots

**Problema**

- Spot duplicado detectado correctamente.
- Se reutiliza la información.
- Se duplica la card visualmente.

**Acción**

- Reutilizar Spot existente.
- Asociar usuario sin crear nueva entidad visual.

---

### P0-04 · Normalizar naming: usar exclusivamente "Flow"

**Problema**

- Uso inconsistente de path / route / flow.
- Chips con clasificaciones distintas.

**Acción**

- Regla estricta: el usuario solo ve "Flow".
- Homologar chips y etiquetas visibles.

---

### P0-05 · Eliminar Audio del Flow y limpiar dependencias

**Problema**

- Audio genera errores, inconsistencias y ruido.
- Se filtran audios de prueba.

**Acción**

- Eliminar reproducción de audio.
- Limpiar hooks, estados y flags asociados.
- Mantener solo narrativa por texto.

---

### P0-06 · BUG: Subtítulos del Flow no aparecen

**Problema**

- El player no muestra los textos de narración acordados.
- Tampoco aparecen en mini player.

**Acción**

- Auditar fuente de textos, estados y timing.
- Garantizar que siempre exista texto visible durante el Flow.

---

### P0-07 · Definir contrato de datos de Subtítulos (Schema)

**Problema**

- No existe contrato claro que declare qué texto se muestra ni cuándo.
- Player y Mini Player no saben qué renderizar.

**Acción**

Diseñar un schema único y obligatorio para subtítulos del Flow.

#### Momentos del Flow

- `start`
- `in_flow`
- `near_spot`
- `transition`
- `end`

#### Eventos del sistema

- `FLOW_STARTED`
- `FLOW_ACTIVE`
- `SPOT_PROXIMITY_ENTER`
- `SPOT_COMPLETED`
- `FLOW_COMPLETED`

#### Schema conceptual

```typescript
FlowSubtitle {
  id
  moment: "start" | "in_flow" | "near_spot" | "transition" | "end"
  text: string
  shortText?: string
  priority: "primary" | "secondary"
  trigger: {
    event:
      | "FLOW_STARTED"
      | "FLOW_ACTIVE"
      | "SPOT_PROXIMITY_ENTER"
      | "SPOT_COMPLETED"
      | "FLOW_COMPLETED"
    condition?: string
  }
}
```

---

### P0-08 · Alinear triggers del Flow a la estructura de narración

**Problema**

- El sistema no sabe cuándo mostrar textos.
- Los momentos no están declarados explícitamente.

**Acción**

- Mapear eventos existentes a momentos del Flow.
- Crear solo los eventos mínimos necesarios.
- No modificar flujos actuales.

---

### P0-09 · Renderizar subtítulos correctamente en Player y Mini Player

**Problema**

- Aunque exista texto, no se refleja visualmente.

**Acción**

- Player: mostrar texto principal con jerarquía clara.
- Mini Player: usar shortText.
- Mantener sincronía entre estados.

---

## 🟠 P1 — ALTA

### P1-01 · Integración Mapbox Search Box Oficial (Web-first) — ⏳ EN PROGRESO (APROBADO)

**Objetivo**

Mejorar la UX de búsqueda de ubicación en web, usando el componente oficial de Mapbox, sin afectar mobile.

**Acción**

- Usar `@mapbox/search-box-web` (custom element oficial)
- Integrarlo SOLO en web (Platform.OS === 'web')
- Mantener FormLocationSelector como wrapper
- Feature flag implícito:
  - Web → Mapbox Search Box oficial
  - Native → implementación actual (ya estable)
- Mantener interfaz pública intacta
- Fallback a implementación actual si Search Box falla

**Reglas**

- NO romper la interfaz pública del componente
- NO reintroducir coordenadas en el input
- NO mezclar lógica RN con DOM real
- NO modificar MapboxViewWeb
- NO romper native

**Estado:** ⏳ EN PROGRESO (APROBADO)

**Referencias:**
- Plan detallado: `BITACORA_V1_1.md` (2026-01-10)
- Implementación en curso

---

### P1-01b · Implementar steppers en creación de Spot (PENDIENTE)

**Acción**

1. Ubicación
2. Imagen
3. Información básica

Reduce carga cognitiva y errores.

---

### P1-02 · Confirmación visual al "Add to flow"

**Acción**

- Mostrar feedback inmediato.
- Cambiar estado a "On your flow".
- Revisar microcopy y ortografía.

---

### P1-03 · Ajustar layout de Spot (gaps y jerarquía)

**Acción**

- Reducir espacios excesivos.
- Mejorar continuidad entre descripción e InfoSpot.

---

### P1-04 · Alinear sección Flow Detail con definición acordada

**Acción**

- Revisar composición.
- Eliminar elementos redundantes o fuera de definición.

---

### P1-05 · Mejorar experiencia del Mini Player

**Acción**

- Revisar posición, contenido y jerarquía.
- Asegurar continuidad con Player principal.

---

### P1-06 · Mejorar configuración de Plan Info

**Acción**

- Simplificar inputs de horario y costo.
- Asegurar actualización inmediata del estado.

---

### P1-07 · Aumentar intervalo de actualización de ubicación en Flow

**Acción**

- Intervalo más frecuente solo durante Flow.
- Separar lógica de cards vs Flow.

---

### P1-08 · Botón "Current location / Update location"

**Acción**

- Permitir actualización manual.
- Mostrar feedback visual al actualizar.

---

### P1-09 · Microcopy base por evento del Flow

**Acción**

Definir microcopy canónico alineado a eventos:

- `FLOW_STARTED`: saludo + introducción
- `FLOW_ACTIVE`: progreso
- `SPOT_PROXIMITY_ENTER`: cercanía
- `SPOT_COMPLETED`: transición
- `FLOW_COMPLETED`: cierre

---

### P1-10 · Microcopy contextual por clima (solo en inicio)

**Acción**

- Mostrar solo si aporta valor.
- Ejemplos:
  - "It's warm — consider a shaded stop next."
  - "Rain is expected — bring an umbrella."

---

### P1-11 · Mini Player consume shortText

**Acción**

- Mini Player no genera textos propios.
- Usa shortText del evento activo.

---

## 🟡 P2 — MEDIA

### P2-01 · Auditoría de imágenes faltantes en Spots

**Acción**

- Detectar spots sin imagen.
- Completar o definir fallback.

---

### P2-02 · Evaluar valor real de "How to visit"

**Acción**

- Mantener solo si aporta insight real.
- Eliminar contenido obvio o redundante.

---

### P2-03 · Evaluar trazado de ruta y "Get directions"

**Acción**

- Analizar costo / beneficio en web.
- Decidir alcance real para V1.x.

---

### P2-04 · Adaptar experiencia Flow a límites del navegador web

**Acción**

- Diseñar experiencia equivalente, no idéntica a app nativa.
- No depender de tracking en background.

---

### P2-05 · Usar schema de subtítulos para Push Notifications (exploratorio)

**Acción**

- Reutilizar shortText.
- Escuchar solo eventos clave.
- No introducir nueva lógica.

---

## 🔧 ITEMS TÉCNICOS (Fuera de alcance V1.1)

Items técnicos identificados que requieren refactor arquitectónico. No bloqueantes para V1.1, pero documentados para planificación futura.

---

### TECH-01 · Refactor integración Mapbox con React Native Web

**Problema**

Error intermitente en web: `Unexpected text node: . A text node cannot be a child of a <View>` en FlowScreen y SpotDetail.

Causa raíz identificada: Incompatibilidad arquitectónica entre React Native Web (árbol de `<View>`) y DOM web real inyectado por Mapbox GL JS (canvas, div, text nodes). React Native Web no puede reconciliar cambios DOM hechos fuera del control de React.

**Evidencia**

- Error intermitente (depende de timing de inicialización de Mapbox)
- Ocurre en ambas pantallas que usan Mapbox (FlowScreen, SpotDetail)
- Advertencias de `aria-hidden` bloqueado confirman conflictos con elementos que retienen focus
- Fixes locales previos (whitespace JSX, strings vacíos, `<style>` tag) no resuelven el problema estructural

**Solución requerida**

Refactor arquitectónico para separar claramente:
1. Árbol React Native (layout, UI)
2. DOM web real (Mapbox) - aislado completamente usando `react-dom` portals
3. Overlays que necesitan DOM real - usar portals en web

**Alcance**

- Refactor de `MapboxViewWeb` para montar Mapbox en contenedor web nativo (`<div>`) fuera del árbol React
- Ajuste de overlays (ContentHeader sticky, FlowPlayer) para usar portals en web
- Separar lógica de `pointerEvents` para web vs native
- Testing exhaustivo en todas las pantallas

**Impacto**

- Múltiples componentes afectados (MapboxViewWeb, ContentHeader, overlays)
- Requiere cambios arquitectónicos significativos
- Alto riesgo de regresiones si se hace apresuradamente

**Prioridad**

Técnico (no bloqueante para V1.1). Error es intermitente, no crashea la aplicación. Puede abordarse en V1.2 o V2.0.

**Referencias**

- Análisis completo documentado en BITACORA_V1_1.md (2026-01-10)
- Fixes locales previos se mantienen (status quo)

---

## ESTADO DEL DOCUMENTO

Este backlog:

- Define eventos explícitos.
- Elimina ambigüedades narrativas.
- Respeta el scope de V1.1.
- Está listo para análisis e implementación en Cursor
