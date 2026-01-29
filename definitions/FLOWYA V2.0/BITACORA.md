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

## 2026-01-15 — Aprobacion de Scopes V1 y trazabilidad

- Se aprueban los SCOPE_V1 de las 7 iniciativas estrategicas.
- Se incorporan ajustes menores aprobados por iniciativa (Location, Image Loading, Critical Bugs, Contribution, Admin, AI Coverage).
- Se registra condición de Admin V1: una sola vista principal por sistema y sin automatizaciones/bulk actions avanzadas.
- Se registra condición de AI Coverage V1: no activación por pan/zoom continuo y cooldown obligatorio por usuario y bbox.
- Se crea `STARTUP_CHECKLIST_V1.md` en `_REVIEW` para iniciar Location + Contributions.
- Se actualiza `ROADMAP.md` con decisiones V1 aprobadas y orden de inicio.

## 2026-01-15 — Inicio de implementación (Location System V1)

- Se inicia la implementación del Sistema de Ubicación V1 bajo el scope aprobado.
- Se elimina el fallback legacy de city/country en filtros de regiones.
- Se endurece la validación de `locationRegion.type` a solo city/region.
- Se elimina el uso de locality en el modelo canónico y en formularios/migración.
- Se fija el formato de `regionId` como `country.type.place`.
- Se fija la prioridad de filtros en Map: viewport primero, regionId después.
- Se actualiza `PROJECT_COMPASS.md` con iniciativa activa y estado.
- Se aplica en Map la regla de filtrado: bbox primero y regionId como refinamiento.
- Se fuerza nueva remigración de regiones (key v2) para aplicar `country.type.place`.
- Se habilita migración de regiones para spots con location en formato lat/lng.
- Se registran decisiones de ubicación en `DECISIONES_CANONICAS.md`.
- Se valida regionId almacenado en RegionContext y se resetea si no es canónico.
- Se valida `regionId` canónico en cleanup de spots (formato country.type.place).
- Se valida `regionId` canónico en listados y filtros de regiones (Home/Map).
- Se alinea `LOCATION_SYSTEM_PROPOSAL.md` con formato regionId y orden de filtros en Map.
- Home "Cerca de ti" se calcula por distancia a BaseLocation sin filtrar por regionId.
- getSpotsByRegion ignora regionId no canónico (retorna vacío).
- Se completa Fase 2 (queries/filtros) sin validación manual.
- Se asegura limpieza de selectedRegionId cuando resolveRegion falla.
- Se limpia selectedRegionId cuando no hay BaseLocation en inicialización.
- Se completa Fase 3 (lógica de negocio): zona activa y "cerca de ti" por distancia.
- Se completa Fase 4 (UI) sin rediseño: Home, Map y Search ya soportan estados requeridos.
- Se cierra Fase 5 (integración futura) sin implementación: hooks previstos para IA Coverage y Search avanzada quedan documentados, no activos.

## 2026-01-15 — Cierre Location System V1 y arranque Contribution System V1

- Location System V1 validado y cerrado.
- Se crea `IMPLEMENTATION_PLAN.md` para Contribution System V1.
- Se actualiza `PROJECT_COMPASS.md` con nueva iniciativa activa.

## 2026-01-15 — Contribution System V1 (Fase 1: datos y contratos)

- Se normaliza `spotId` en contribuciones y reportes antes de persistir.
- Se sanitiza payload de contribuciones (campos permitidos y trimming).
- Se agrega validación mínima del payload por tipo (create/update).
- Se valida presencia de author/reporter en flujos de contribución y reporte.
- Se valida `spotId` inválido en creación de contributions y se marca `is_new_spot` en creación.

## 2026-01-15 — Contribution System V1 (Fase 2: applier y versionado)

- Se fuerza rechazo determinístico solo para contributions pendientes.
- Se registra `reviewed_by` al rechazar contribuciones desde Admin.

## 2026-01-15 — Contribution System V1 (Fase 3: permisos y UX mínima)

- Se aplica TrustScore a acciones de edición y reporte en Spot Detail.
- Se agrega feedback de bloqueo por nivel de confianza al sugerir ediciones/reportes.

## 2026-01-15 — Contribution System V1 (Fase 4: media pública)

- Se valida URL de media pública contra formato de Storage antes de crear.
- Se habilita captura de URL pública desde Spot Detail para adjuntar media.

## 2026-01-15 — Contribution System V1 (Fase 5: métricas operativas)

- Se agrega conteo canónico de backlog (pending) vía query de estado.
- Se alinean métricas de Admin con conteos de estado en base.

## 2026-01-15 — Cierre Contribution System V1 e inicio Critical Bugs V1

- Contribution System V1 validado y cerrado.
- Se activa Critical Bugs V1 con scope aprobado.

## 2026-01-15 — Critical Bugs V1 (fixes puntuales)

- Se suben imágenes de creación/edición de spots a Storage y se guarda URL pública.
- Se suben fotos personales de pins a Storage antes de sincronizar.
- Cards usan shortDescription con fallback canónico.
- Pin action en card de mapa alineada con Home (modal y toggle).
- IA en edición de Spot conectada a generación autorizada.

## 2026-01-15 — Cierre Critical Bugs V1 e inicio Admin System V1

- Critical Bugs V1 validado y cerrado.
- Se activa Admin System V1 con scope aprobado.

## 2026-01-15 — Admin System V1 (planificacion)

- Se crea `IMPLEMENTATION_PLAN.md` para Admin System V1.

## 2026-01-15 — Admin System V1 (implementacion inicial)

- Se agrega cola de usuarios derivada de contributions recientes.
- Se habilita seccion de IA Coverage con estado vacio V1.
- Se permite editar payload de contribution antes de aplicar.
- Se crea tabla `user_roles` y politicas RLS por rol (admin/curator/support/analyst).
- Se actualizan funciones/admin RPCs para roles (aplicar/rechazar/rollback).
- Se agrega gestion basica de roles en Admin (asignacion y listado).

## 2026-01-15 — Cierre Admin System V1 e inicio Image Loading System V1

- Admin System V1 validado y cerrado.
- Se crea `IMPLEMENTATION_PLAN.md` para Image Loading System V1.

## 2026-01-15 — Image Loading System V1 (fase inicial)

- Se elimina lazy loading diferido en OptimizedImage (carga inmediata V1).
- Se remueven logs de debug y llamadas locales en carga de imagen.
- Se activa precarga above-fold en Search y Spot Detail.
- Se agrega prioridad alta para hero images (ContentHeader/ImageSlider).

## 2026-01-15 — Cierre Image Loading System V1 e inicio Translation System V1

- Image Loading System V1 validado y cerrado.
- Se activa Translation System V1 con scope aprobado.

## 2026-01-15 — Translation System V1 (planificacion)

- Se crea `IMPLEMENTATION_PLAN.md` para Translation System V1.

## 2026-01-15 — Translation System V1 (fase 1)

- Se crea tabla `translations` con estados y RLS basicos.
- Se agrega servicio base para obtener traducciones publicadas.

## 2026-01-15 — Translation System V1 (fase 2)

- Se agrega generador de traducciones machine ES->EN via OpenAI.
- Se agrega upsert de traducciones con status y source.

## 2026-01-15 — Translation System V1 (fases 3-4)

- Se agrega resolucion de traducciones EN con fallback a ES en spots y flows.
- Se integra traduccion en cards y detalles (Spot/Flow).

## 2026-01-15 — Cierre Translation System V1 e inicio AI Coverage System V1

- Translation System V1 validado y cerrado.
- Se activa AI Coverage System V1 con scope aprobado.

## 2026-01-15 — AI Coverage System V1 (planificacion)

- Se crea `IMPLEMENTATION_PLAN.md` para AI Coverage System V1.

## 2026-01-15 — AI Coverage System V1 (fase 1)

- Se crea tabla `ai_coverage_sessions` con estados y bbox.
- Se agrega servicio base y listado en Admin.

## 2026-01-15 — AI Coverage System V1 (fase 2)

- Se agrega clave de bbox para cooldown por usuario/bbox.
- Se definen helpers de umbral y cooldown para activacion.

## 2026-01-15 — AI Coverage System V1 (fase 3)

- Se integra generacion de spots AI con POIs reales de Mapbox/OSM.
- La IA solo enriquece titulo/descripcion y tipo; no inventa coordenadas.
- Se agrega accion explicita en Map para activar cobertura IA.

## 2026-01-15 — AI Coverage System V1 (fase 4)

- Se agrega loader narrativo con cancelacion durante generacion.
- Se agrega fallback de error/cancelacion en UI.

## 2026-01-15 — AI Coverage System V1 (fase 5)

- Se registra bbox y conteo generado en el panel Admin.

## 2026-01-15 — Cierre AI Coverage System V1

- AI Coverage System V1 validado y cerrado.
