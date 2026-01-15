# FLOWYA V2.0 — ARQUITECTURA
Fuente canónica: `DEFINICIONES_CONSOLIDADAS_V2_0.md`
Estado: Borrador controlado (sin implementación)

---

## Principios

- Separación estricta: domain / data / ui / hooks / services.
- Ninguna lógica de negocio vive en UI.
- Componentes pequeños y reutilizables.
- Performance: viewport, clustering y debounce.
- TypeScript estricto.

---

## Capas (responsabilidades)

### domain
- Entidades y reglas canónicas (Spot, Flow, Contribution, Version, etc.).
- Validaciones y normalizaciones (incluye normalizeSpotId()).

### data
- Persistencia y sincronización.
- Acceso a Supabase y cachés locales.

### services
- Orquestación de flujos (contributions, applier, moderación).
- Integración con IA (solo sugerencias).

### hooks
- Composición de estados y casos de uso.
- Sin lógica de negocio crítica.

### ui
- Render y estados de presentación.
- Sin reglas de negocio ni decisiones de dominio.

---

## Flujos canónicos (alto nivel)

- Edición pública: UI → SpotContribution → applier → SpotVersion → Spot.
- Moderación: reportes → thresholds → soft_hidden (media) + needs_review (spot).
- Pins: acciones privadas → diario personal → nunca tocan Spot.

---

## Moderación ligera (operativa)

- SpotReport genera eventos auditables.
- SpotMediaPublic cambia a soft_hidden por umbral canónico.
- Spot se marca needs_review por umbral canónico.
- La visibilidad del Spot no se bloquea automáticamente.

---

## Applier (detalle operativo)

- Implementación preferente: DB function determinística.
- Edge Function opcional para fases posteriores.
- Valida payload, aplica cambios, genera SpotVersion y actualiza Spot.
- Registra auditoría completa (contribution + versión).
 - Si la contribución no tiene spot_id, crea el Spot canónico y luego versiona.

---

## Observabilidad (Scope 4.5)

- Feed de actividad.
- Métricas simples.
- Drill-down por Spot.
- IA solo sugiere, nunca ejecuta acciones.
 - Ruta `/admin` protegida (fuera del Tab Bar).

---

## Auditoría de gaps vs V2.0 (estado actual)

### Resueltos en Scope 0 (progreso)

1) **WorldSpot/UserSpot eliminados del runtime**:
   - Eliminados `contexts/WorldSpotContext.tsx` y `utils/worldSpotHelpers.ts`.
   - Ajustes en UI para usar solo `Spot`.

2) **normalizeSpotId() implementado y aplicado**:
   - Integrado en pins/flows/caches/shares/AsyncStorage.

3) **Edición directa de Spot deshabilitada en UI/servicios**:
   - `app/spot-detail.tsx` y `app/create-spot.tsx` bloquean acciones directas.
   - `contexts/SpotContext.tsx` deshabilita `createSpot` y `updateSpot`.

4) **Schema base de contributions/moderación implementado**:
   - Migración con `spot_contributions`, `spot_versions`, `spot_media_public`, `spot_reports`.
   - Función applier en DB (`apply_spot_contribution`).

### Gaps abiertos

1) **Seed/stock como base de spots e imágenes** (prohibido en V2.0):
   - `data/seedSpots.v1.2.json` aún existe como fuente legacy.
   - UI ya muestra placeholder FLOWYA cuando la imagen es stock.
   - Uso en runtime desactivado; ingestión futura solo por contributions.

2) **Sistema de contributions no integrado en UI/servicios**:
   - Falta wiring de UI para enviar contributions.
   - Falta flujo admin para aplicar/rechazar (Panel Admin).

Estos gaps se resuelven en Scope 0 y deben registrarse con trazabilidad.
