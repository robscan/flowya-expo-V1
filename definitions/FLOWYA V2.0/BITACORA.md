# FLOWYA V2.0 — BITACORA
Estado: Activo

---

## 2026-01-14 — Inicio documental V2.0

- Se inicia la documentación formal de FLOWYA V2.0.
- Se prioriza el canon y la estructura documental antes de cualquier implementación.
- Próximo paso: completar el plan maestro por scopes y registrar decisiones canónicas.

## 2026-01-14 — GO formal a Scope 0

- Se habilita formalmente el Scope 0.
- Se activa trazabilidad documental obligatoria para el scope.
- Se implementa normalizeSpotId() y se integra en pins/flows/caches/shares/AsyncStorage.
- Se elimina WorldSpot/UserSpot del runtime (contexto, helpers y UI).
- Se deshabilita la edición directa de Spots en UI/servicios.
- Se define el flujo canónico SpotContribution → applier → SpotVersion.
- Se documenta la moderación ligera (umbrales y estados).
- Se implementa placeholder FLOWYA para imágenes stock en UI.
- Se formaliza control de fuentes legacy (seed/stock fuera de runtime).
- Se crea el schema base de contributions y moderación en Supabase.
- Se habilita creación de nuevos Spots vía SpotContribution (spot_id nulo).
- Se implementa Panel Admin V1.0 (ruta /admin, acciones básicas).
- Se muestra estado de contributions en Profile.
- Se implementa rollback admin real (SpotVersion).
- Se habilita drill-down por Spot en Admin Panel (detalle, reports, media).
- Se agrega auditoría admin y métricas básicas en Panel Admin.
- Se añade payload visible en drill-down y filtros de auditoría.
- Se agrega lista de contributions recientes en Profile.
- Se agrega detalle de contribution para usuario y filtros de acciones en auditoría admin.
- Se agrega filtro temporal en auditoría y KPIs de tiempos promedio.
- Se agrega diff detallado por campo en rollback, filtros de detalle por entidad y motivo de rechazo en Android/Web.
- Se elimina fallback a seeds/mock en runtime: SpotContext inicia vacío sin storage.
- Se deshabilita eliminación directa desde Spot Detail y se conecta Reporte a SpotReport.
- Se deshabilita generateSpotContent en SpotContext para evitar updates directos.
- Se elimina updateSpot del contexto público.
- Se elimina deleteSpot del contexto público.
- Se normalizan textos legacy en Spot Detail a español.
- Se normalizan textos legacy en Home, Search, Create Spot, Flow Detail y tabs.
- Se normalizan textos legacy en Login, Signup y Verify Email.
- Se normalizan textos de design-system (demo) a español.
- Se normalizan textos en componentes compartidos (SaveFlowModal, SearchBar, MapControls, PinStateModal, LocationSelector, AIFieldSelector).
- Se normalizan textos en Profile, Create Spot (auth modal) y mensajes de Signup.
- Se normalizan textos residuales en FlowFullPlayer, FlowMiniBar, FlowMiniPlayer, FlowPlayerControls, FlowSpotCard, SpotInlineCard y SpotMediaCard.
- Se normalizan textos residuales en design-system (vista previa de color).
- Se elimina generateSpotContent del contexto público para reforzar el flujo por contributions.
- Se verifica wiring de contributions: sin referencias activas a updateSpot/deleteSpot/generateSpotContent en UI.
- Se audita uso legacy de seedSpots/mockSpots: solo en scripts/docs, sin uso runtime.

## 2026-01-14 — Cierre Scope 0

- Se completan las actividades pendientes del Scope 0.
- Se actualiza ROADMAP y PLAN_EJECUCION_SCOPES con cierre formal.

## 2026-01-14 — Inicio Scope 1

- Se inicia Scope 1 (UI) con foco en tabs canónicos y separación UI/dominio.

## 2026-01-14 — Cierre Scope 1

- Se habilitan tabs canónicos: Home, Map, Pineados, Flows, Search.
- Se crean pantallas Pinned y Flows con headers canónicos y estados vacíos.
- Se valida que la UI no expone edición directa (edición via SpotContribution).

## 2026-01-14 — Inicio Scope 2

- Se inicia Scope 2 (Flows) con foco en Flow vs FlowRun y FlowScreen como núcleo.

## 2026-01-14 — Cierre Scope 2

- Se formaliza FlowRun en domain/data y se separa la ejecucion del Flow.
- FlowContext migra a flowId y FlowScreen se mantiene como nucleo de navegacion.

## 2026-01-14 — Inicio Scope 3

- Se inicia Scope 3 (Search V2) con foco en intención, tipos, geocoding y CTA IA.

## 2026-01-14 — Cierre Scope 3

- Se incorpora filtro de tipos e intencion en Search.
- Se integra geocoding (Mapbox) con resultados y CTA para crear spot.
- Se agrega CTA IA solo para sugerencias, sin ejecucion automática.

## 2026-01-14 — Inicio Scope 4

- Se inicia Scope 4 (Perfil) con foco en TrustScore interno y permisos progresivos.

## 2026-01-14 — Cierre Scope 4

- Se define TrustScore interno y niveles en MODELO_DATOS/DECISIONES.
- Se refleja nivel de confianza y permisos en Perfil.
- Se condiciona la creación de spots por nivel de confianza.

## 2026-01-14 — Inicio Scope 4.5

- Se inicia Scope 4.5 (Admin Panel) para validar observabilidad y acciones admin.

## 2026-01-14 — Cierre Scope 4.5

- Se confirma Panel Admin V1.0 con observabilidad y acciones admin.
- IA solo sugiere y no ejecuta acciones.
- Se agrega acceso a /admin desde Perfil, visible solo para usuario admin (oscar@agenciaparadigma.com).

## 2026-01-14 — Inicio Scope 5

- Se inicia Scope 5 (IA) con foco en sugerencias y limites de ejecucion.

## 2026-01-14 — Cierre Scope 5

- Se documentan limites de IA y su rol asistente.
- CTA IA en Search y Spot Detail sin ejecucion de acciones.

## 2026-01-14 — Inicio Scope 6

- Se inicia Scope 6 (Hardening) con foco en performance y tipado.

## 2026-01-14 — Cierre Scope 6

- Se limpia UI IA residual en Create Spot y estilos sin uso.
- Se ajusta filtrado en Map para reducir trabajo innecesario.

## 2026-01-14 — Rollback post-tabs

- Se revierte a estado inmediatamente posterior a la edición de tabs.
- Se deshacen cambios posteriores en DECISIONES_CANONICAS.md.
