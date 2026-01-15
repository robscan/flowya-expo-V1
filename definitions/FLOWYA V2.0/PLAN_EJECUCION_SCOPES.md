# PLAN MAESTRO DE EJECUCIÓN — FLOWYA V2.0
Estado: Activo (documental)
Fuente canónica: `DEFINICIONES_CONSOLIDADAS_V2_0.md`

---

## Control de alcance (no negociable)

Este bloque se agrega como enmienda activa al Plan Maestro de Ejecución — FLOWYA V2.0.

**Respeto absoluto al canon**

DEFINICIONES_CONSOLIDADAS_V2_0.md es un contrato cerrado.

No redefinir conceptos, entidades, flujos, tabs ni reglas ya establecidas.

No reinterpretar Spot, Pin, Flow, Contribution, Version, Trust o Admin Panel.

**Gestión de ambigüedad**

Si durante la planificación/documentación surge ambigüedad:

Proponer una sola opción, la más coherente con V2.0.

Registrar la decisión en DECISIONES_CANONICAS.md.

Continuar el plan sin bloquear ni bifurcar.

**Prohibición de expansión de alcance**

No introducir nuevas entidades, pantallas, tabs, sistemas o features
fuera de los scopes definidos: 0, 1, 2, 3, 4, 4.5, 5, 6.

No “mejorar” el producto con ideas no solicitadas.

No adelantar features de versiones posteriores.

**Arquitectura disciplinada**

Mantener separación estricta: domain / data / ui / hooks / services.

Ninguna lógica de negocio debe vivir en UI.

No duplicar modelos ni estados paralelos.

**Prioridad documental**

Ante cualquier duda: documentar primero, implementar después.

Todo avance debe reflejarse en:

BITACORA.md

ROADMAP.md

PLAN_EJECUCION_SCOPES.md (si impacta scopes)

**Criterio de aceptación**

Si una decisión no puede ser defendida citando explícitamente V2.0,
no debe tomarse.

---

## Trazabilidad obligatoria

Cada Scope debe:
- Registrar inicio y cierre en `BITACORA.md`.
- Actualizar `ROADMAP.md`.
- Registrar decisiones nuevas en `DECISIONES_CANONICAS.md`.

---

## Scope 0 — Fundación

**Objetivo**
- Alinear el sistema a V2.0 canónico: contributions, versionado, moderación y IDs.

**Estado**
- Completado (GO formal: 2026-01-14, cierre: 2026-01-14).
- Progreso: normalizeSpotId integrado en entradas legacy.
- Progreso: WorldSpot/UserSpot eliminados del runtime.
- Progreso: edición directa de Spots deshabilitada en UI/servicios.
- Progreso: flujo SpotContribution → applier → SpotVersion definido documentalmente.
- Progreso: modelo de moderación ligera documentado (umbrales y estados).
- Progreso: placeholder FLOWYA aplicado en UI para imágenes stock.
- Progreso: control documental de fuentes legacy (seed/stock fuera de runtime).
- Progreso: schema de contributions/moderación y applier en DB.
- Progreso: UI crea SpotContributions (edición y creación).
- Progreso: Panel Admin V1.0 base (ruta, feed, acciones).
- Progreso: estado de contributions visible en Profile.
- Progreso: rollback admin real (SpotVersion).
- Progreso: drill-down por Spot en Admin Panel.
- Progreso: auditoría admin y métricas básicas.
- Progreso: payload visible y filtros en auditoría admin.
- Progreso: lista de contributions recientes en Profile.
- Progreso: detalle de contribution y filtros por acción en auditoría admin.
- Progreso: filtro temporal en auditoría y KPIs de tiempos promedio.
- Progreso: diff detallado en rollback, filtro de detalle por entidad y motivo de rechazo en Android/Web.
- Progreso: runtime sin fallback a seed/mock (SpotContext inicia vacío sin storage).
- Progreso: eliminación directa deshabilitada en Spot Detail y reporte conectado a SpotReport.
- Progreso: updateSpot removido del contexto público.
- Progreso: deleteSpot removido del contexto público.
- Progreso: textos legacy en Spot Detail normalizados a español.
- Progreso: generateSpotContent removido del contexto público.
- Progreso: textos legacy normalizados en Home, Search, Create Spot, Flow Detail y tabs.
- Progreso: textos legacy normalizados en Login, Signup y Verify Email.
- Progreso: textos de design-system normalizados a español.
- Progreso: textos normalizados en componentes compartidos (modales y selectors).
- Progreso: textos normalizados en Profile y modales auth de Create Spot/Signup.
- Progreso: textos residuales normalizados en FlowFullPlayer/FlowMiniBar/FlowMiniPlayer/FlowPlayerControls.
- Progreso: textos residuales normalizados en FlowSpotCard/SpotInlineCard/SpotMediaCard.
- Progreso: wiring de contributions verificado (sin referencias activas a updateSpot/deleteSpot/generateSpotContent en UI).
- Progreso: auditoría legacy seedSpots/mockSpots sin uso runtime.

**Tareas (ordenadas)**
1) Registrar decisiones no negociables en `DECISIONES_CANONICAS.md`.
2) Eliminar referencias activas a WorldSpot/UserSpot en dominio y UI.
3) Definir e implementar el flujo SpotContribution → applier → SpotVersion.
4) Prohibir edición directa de Spot desde UI y servicios.
5) Implementar normalizeSpotId() y aplicarla en pins, flows, caches y AsyncStorage.
6) Sustituir imágenes seed/stock por placeholder FLOWYA.
7) Documentar migraciones y rollback reversible.

**Dependencias**
- Ninguna.

**Riesgos + mitigación**
- Riesgo: ruptura de compatibilidad por migraciones de IDs.
  Mitigación: migración reversible + logs + pruebas de consistencia.
- Riesgo: pérdida de contenido en migración de spots.
  Mitigación: snapshots (SpotVersion) + rollback admin.

**Definition of Done (estricta)**
- No existe referencia activa a WorldSpot/UserSpot.
- No existe edición pública directa a Spot desde UI.
- Todas las ediciones públicas pasan por contributions.
- normalizeSpotId() aplicada y validada en pins, flows, caches y AsyncStorage.
- Migración de IDs documentada y reversible.
- Placeholder sustituye cualquier imagen seed/stock.
- Todas las decisiones registradas en DECISIONES_CANONICAS.md.

---

## Scope 1 — UI

**Objetivo**
- UI alineada a V2.0, sin lógica de negocio.

**Estado**
- Completado (inicio: 2026-01-14, cierre: 2026-01-14).
- Progreso: tabs canónicos Home · Map · Pinned · Flows · Search.
- Progreso: nuevas pantallas Pinned/Flows con headers canónicos.
- Progreso: edición directa validada como deshabilitada (UI usa contributions).

**Tareas (ordenadas)**
1) Mapear pantallas a tabs canónicos: Home · Map · Pinned · Flows · Search.
2) Eliminar acciones de edición directa de Spot.
3) Ajustar componentes a placeholders y estados de moderación.

**Dependencias**
- Scope 0.

**Riesgos + mitigación**
- Riesgo: UI dependa de flujos legacy.
  Mitigación: wrappers temporales en data/services y limpieza en Scope 0.

**Definition of Done**
- UI no contiene lógica de negocio.
- UI consume APIs canónicas de domain/services.

---

## Scope 2 — Flows

**Objetivo**
- Consolidar Flow (definición) y FlowRun (ejecución viva).

**Estado**
- Completado (inicio: 2026-01-14, cierre: 2026-01-14).
- Progreso: FlowRun formalizado en domain/data.
- Progreso: FlowContext usa flowId (Flow) y separa ejecucion.
- Progreso: FlowScreen consolidado como nucleo de ejecucion.

**Tareas (ordenadas)**
1) Formalizar modelo de Flow y FlowRun en domain/data.
2) Asegurar FlowScreen como núcleo de navegación.
3) Conectar a pins y spots sin alterar Spot canónico.

**Dependencias**
- Scope 0.

**Riesgos + mitigación**
- Riesgo: inconsistencias entre Flow y FlowRun.
  Mitigación: contratos claros en MODELO_DATOS y pruebas de navegación.

**Definition of Done**
- Flow y FlowRun diferenciados y funcionando bajo contratos canónicos.

---

## Scope 3 — Search

**Objetivo**
- Search V2: intención, tipos, geocoding y CTA IA.

**Estado**
- Completado (inicio: 2026-01-14, cierre: 2026-01-14).
- Progreso: tipos de busqueda y manejo de intencion en UI.
- Progreso: geocoding integrado via Mapbox (si esta configurado).
- Progreso: CTA IA visible sin ejecucion de acciones.

**Tareas (ordenadas)**
1) Implementar tipos de búsqueda y manejo de intención.
2) Integrar geocoding.
3) Añadir CTA IA sin ejecución automática.

**Dependencias**
- Scope 0.

**Riesgos + mitigación**
- Riesgo: resultados inconsistentes por datos legacy.
  Mitigación: normalización de IDs y filtros canónicos.

**Definition of Done**
- Search funciona con intención y tipos, con CTA IA sin ejecutar acciones.

---

## Scope 4 — Perfil

**Objetivo**
- Perfil con permisos progresivos y TrustScore interno.

**Estado**
- Completado (inicio: 2026-01-14, cierre: 2026-01-14).
- Progreso: TrustScore definido con niveles internos y reglas documentadas.
- Progreso: permisos progresivos reflejados en UI de Perfil.
- Progreso: creacion de spots condicionada por nivel de confianza.

**Tareas (ordenadas)**
1) Definir TrustScore y reglas de permisos.
2) Reflejar confianza en UI sin revelar score interno.

**Dependencias**
- Scope 0.

**Riesgos + mitigación**
- Riesgo: confusión entre permisos y visibilidad.
  Mitigación: documentación explícita en MODELO_DATOS.

**Definition of Done**
- Permisos progresivos operativos y documentados.

---

## Scope 4.5 — Admin Panel

**Objetivo**
- Panel Admin V1.0 para observabilidad y control.

**Estado**
- Completado (inicio: 2026-01-14, cierre: 2026-01-14).
- Progreso: ruta `/admin` protegida y fuera del Tab Bar.
- Progreso: feed, métricas y drill-down por Spot operativos.
- Progreso: acciones admin (rollback, soft_hidden, needs_review) activas.

**Tareas (ordenadas)**
1) Ruta `/admin` protegida (fuera del Tab Bar).
2) Observabilidad: feed de actividad, métricas simples, drill-down por Spot.
3) Acciones admin: rollback, soft_hidden, needs_review.
4) IA solo para resúmenes, detección de patrones y sugerencias.

**Dependencias**
- Scope 0 (moderación y contributions).

**Riesgos + mitigación**
- Riesgo: abuso de acciones por falta de control.
  Mitigación: permisos estrictos + auditoría en BITACORA.

**Definition of Done**
- Admin Panel operativo con acciones y observabilidad.
- IA no ejecuta acciones.

---

## Scope 5 — IA

**Objetivo**
- IA como asistente: resúmenes, sugerencias y diseño de experiencia.

**Estado**
- Completado (inicio: 2026-01-14, cierre: 2026-01-14).
- Progreso: limites de IA definidos y documentados (DECISIONES_CANONICAS).
- Progreso: CTA de IA solo sugerencias en Search y Spot Detail.
- Progreso: IA no ejecuta acciones en UI.

**Tareas (ordenadas)**
1) Definir límites de IA (no inventa spots, no ejecuta acciones).
2) Integrar IA en flujos definidos (CTA y resúmenes).

**Dependencias**
- Scopes 0, 3, 4.5.

**Riesgos + mitigación**
- Riesgo: IA se convierta en fuente de verdad.
  Mitigación: validaciones de dominio y control de permisos.

**Definition of Done**
- IA actúa solo como asistente y nunca ejecuta acciones.

---

## Scope 6 — Hardening

**Objetivo**
- Robustez, performance y calidad.

**Estado**
- Completado (inicio: 2026-01-14, cierre: 2026-01-14).
- Progreso: limpieza de UI IA residual en Create Spot.
- Progreso: optimizacion menor en Map (memoizacion y filtrado).
- Progreso: deuda tecnica documentada y controlada.
- Rollback: cambios posteriores a tabs revertidos en DECISIONES_CANONICAS.

**Tareas (ordenadas)**
1) Validar performance: viewport, clustering, debounce.
2) Refactorizar componentes grandes a piezas pequeñas.
3) Endurecer typing y tests críticos.

**Dependencias**
- Scopes 0-5.

**Riesgos + mitigación**
- Riesgo: deuda técnica acumulada.
  Mitigación: backlog explícito y cierre documental por scope.

**Definition of Done**
- Performance estable, tipado estricto y deuda técnica controlada.
