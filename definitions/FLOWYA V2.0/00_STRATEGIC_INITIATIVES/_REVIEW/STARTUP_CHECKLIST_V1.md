 # FLOWYA V2.0 — Startup Checklist V1 (Location + Contributions)
 
 ## 1) Decisiones bloqueantes (cerrar antes de implementación)
- Formato final de `regionId`: `country.type.place`.
- Prioridad de filtros en Map: viewport primero, regionId después.
 - Umbral fijo de "cerca de ti" para V1.
 - Regla de spots sin `locationRegion` (eliminar vs revision).
 
 ## 2) Validaciones de coherencia (documental)
 - Location System alineado con `MODELO_DATOS.md`.
 - Contributions alineadas con `DECISIONES_CANONICAS.md`.
 - Admin validado como prerequisito operativo de Contributions + IA.
 
 ## 3) Riesgos aceptados (ratificar explicitamente)
 - Dependencia de geocoding externo (Mapbox/OSM) en V1.
 - Backlog de contributions si la revision humana no escala.
 
 ## 4) Criterios de listo para implementación
 - Decisiones bloqueantes cerradas por founder.
 - Alcance V1 firmado para Location + Contributions.
 - Prioridad confirmada: Location -> Contributions (media) -> Critical Bugs.
 
 ## 5) Métricas mínimas desde el día 1
 - % de spots con `locationRegion` valido.
 - Tiempo promedio de revision de contributions.
 - Ratio de contributions aplicadas vs rechazadas.
