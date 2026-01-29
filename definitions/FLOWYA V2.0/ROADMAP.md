# FLOWYA V2.0 — ROADMAP
Estado: Activo (documental)

---

## Scopes oficiales

- Scope 0: Fundación (canon, migraciones, contributions, IDs, placeholders).
- Scope 1: UI.
- Scope 2: Flows.
- Scope 3: Search.
- Scope 4: Perfil.
- Scope 4.5: Admin Panel.
- Scope 5: IA.
- Scope 6: Hardening.

---

## Estado actual

- 2026-01-15: Location System V1 cerrado. Inicia Contribution System V1 (plan creado).
- 2026-01-15: Contribution System V1 Fase 1 en curso (validaciones de payload y normalización de spotId).
- 2026-01-15: Contribution System V1 Fase 2 en curso (rechazo determinístico y registro de revisión).
- 2026-01-15: Contribution System V1 Fase 3 en curso (permisos TrustScore en edición/reporte).
- 2026-01-15: Contribution System V1 Fase 4 en curso (media pública con URL de Storage).
- 2026-01-15: Contribution System V1 Fase 5 en curso (métricas operativas en Admin).
- 2026-01-15: Contribution System V1 cerrado. Inicia Critical Bugs V1 (scope aprobado).
- 2026-01-15: Critical Bugs V1 en curso (storage en imágenes, pin photos, shortDescription en cards, pin en mapa, IA edición).
- 2026-01-15: Critical Bugs V1 cerrado. Inicia Admin System V1 (scope aprobado).
- 2026-01-15: Admin System V1 inicia con Implementation Plan creado.
- 2026-01-15: Admin System V1 en curso (colas de usuarios/IA coverage y edición de payload).
- 2026-01-15: Admin System V1 en curso (roles base y políticas RLS).
- 2026-01-15: Admin System V1 en curso (UI de asignación de roles).
- 2026-01-15: Admin System V1 cerrado. Inicia Image Loading System V1 (plan creado).
- 2026-01-15: Image Loading System V1 en curso (OptimizedImage sin lazy, precarga y prioridad hero).
- 2026-01-15: Image Loading System V1 cerrado. Inicia Translation System V1 (scope aprobado).
- 2026-01-15: Translation System V1 inicia con Implementation Plan creado.
- 2026-01-15: Translation System V1 en curso (modelo y tabla de traducciones).
- 2026-01-15: Translation System V1 en curso (pipeline ES->EN base).
- 2026-01-15: Translation System V1 en curso (resolucion y fallback en UI).
- 2026-01-15: Translation System V1 cerrado. Inicia AI Coverage System V1 (scope aprobado).
- 2026-01-15: AI Coverage System V1 inicia con Implementation Plan creado.
- 2026-01-15: AI Coverage System V1 en curso (contratos y sessions base).
- 2026-01-15: AI Coverage System V1 en curso (umbral y cooldown definidos).
- 2026-01-15: AI Coverage System V1 en curso (generacion POI y accion en Map).
- 2026-01-15: AI Coverage System V1 en curso (loader narrativo y cancelacion).
- 2026-01-15: AI Coverage System V1 cerrado (registro admin completado).
- 2026-01-15: Inicio de implementación de Location System V1 (sin fallback legacy, validación estricta de type, sin locality en modelo canónico, regionId country.type.place, Map bbox primero aplicado, remigración v2 de regiones programada).
- 2026-01-15: Se aprueban los SCOPE_V1 por iniciativa (Location, Image Loading, Critical Bugs, Contribution, Admin, Translation, AI Coverage) con ajustes menores y condiciones explícitas.
- 2026-01-15: Se registran decisiones V1 aprobadas: no activación de IA por pan/zoom continuo, cooldown por usuario y bbox obligatorio, una sola vista principal por sistema en Admin, exclusión de optimización por red en imágenes, y aclaración de riesgos de geocoding externo.
- 2026-01-15: Se crea `STARTUP_CHECKLIST_V1.md` y se confirma la cascada de inicio: Location -> Contributions (media) -> Critical Bugs.
- 2026-01-14: Scope 0 completado (normalizeSpotId integrado, WorldSpot/UserSpot removidos, edición directa deshabilitada, flujo SpotContribution definido, moderación documentada, placeholder UI aplicado, fuentes legacy controladas, schema contributions listo, creación via contributions habilitada, Panel Admin V1.0 base, estado contributions visible, rollback admin real, drill-down spot, auditoría admin y métricas, contributions recientes visibles, filtros temporales y KPIs de tiempos, diff de rollback y filtros por entidad con motivo de rechazo, runtime sin fallback seed/mock, eliminación directa deshabilitada y reporte conectado, generateSpotContent removido del contexto público, updateSpot removido, deleteSpot removido, textos Spot Detail en español, textos clave en Home/Search/Create Spot/Flow Detail/tabs en español, textos Login/Signup/Verify Email en español, textos de design-system en español, textos de componentes compartidos en español, textos Profile/Signup/Create Spot auth en español, textos residuales en FlowFullPlayer/FlowMiniBar/FlowMiniPlayer/FlowPlayerControls y cards de Spot en español, wiring contributions verificado, auditoría seedSpots/mockSpots sin uso runtime).
- 2026-01-14: Scope 1 completado (tabs canónicos Home/Map/Pinned/Flows/Search, pantallas Pinned y Flows alineadas a V2.0, UI sin edición directa).
- 2026-01-14: Scope 2 completado (FlowRun formalizado, FlowContext con flowId, FlowScreen como núcleo).
- 2026-01-14: Scope 3 completado (Search V2 con intencion, tipos, geocoding y CTA IA).
- 2026-01-14: Scope 4 completado (TrustScore interno, permisos progresivos, UI de Perfil actualizada).
- 2026-01-14: Scope 4.5 completado (Admin Panel: observabilidad y acciones admin).
- 2026-01-14: Scope 5 completado (IA asistente con limites, sin ejecucion).
- 2026-01-14: Scope 6 completado (hardening leve: limpieza UI IA residual y ajustes menores de performance).
- 2026-01-14: Rollback post-tabs (reversión de cambios posteriores a tabs).

---

## Dependencias macro

- Scope 0 habilita la validez del resto de scopes.
- Scope 4.5 depende de modelo de moderación y contribuciones.
- Scope 5 depende de datos y arquitectura estables.

---

## Trazabilidad obligatoria

Cada scope debe:
- Registrar inicio y cierre en `BITACORA.md`.
- Actualizar este `ROADMAP.md`.
- Registrar decisiones nuevas en `DECISIONES_CANONICAS.md`.
