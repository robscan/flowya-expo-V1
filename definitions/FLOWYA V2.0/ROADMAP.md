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
