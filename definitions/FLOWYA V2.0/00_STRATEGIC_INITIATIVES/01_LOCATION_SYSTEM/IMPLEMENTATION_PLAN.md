 # Implementation Plan — Sistema de Ubicación (V1)
 
 ## 1. Objetivo técnico del V1
 Dejar operativa una única fuente canónica de ubicación y reglas de filtrado/visualización coherentes en Home, Map y Search, con BaseLocation, CanonicalRegion y CanonicalArea aplicados de forma consistente y validación de ubicación al aplicar contribuciones.
 
 ## 2. Principios técnicos congelados
 - Una sola fuente de verdad para ubicación del usuario (BaseLocation).
 - CanonicalRegion con regionId estable; city como nivel primario y region como fallback.
 - CanonicalArea solo operativo para Map/Search; no se persiste.
 - Filtrar por regionId o bbox; mostrar siempre por label.
- Formato de regionId: `country.type.place`.
 - "Cerca de ti" se calcula por distancia desde BaseLocation con umbral fijo.
 - Resolver region canónica en creación/aplicación, no en runtime tardío.
 - Sin fallback permanente desde city/country legacy en UX.
 
 ## 3. Componentes del sistema
 - **Modelo de datos**: Spot con `location` y `locationRegion` canónico; validación al aplicar contribuciones.
 - **Queries / filtros**: Home por regionId; Map por bbox con filtro secundario por regionId; Search por texto + geocoding que produce CanonicalArea.
 - **Lógica de negocio**: resolución de regionId, cálculo de distancia y reglas de filtrado.
 - **UI impactada**: Home, Map, Search (sin rediseño).
 - **Integración con IA**: exposición de BaseLocation, selectedRegionId y CanonicalArea vía hooks; sin ejecución de IA.
 
 ## 4. Plan de ejecución por fases
 
 ### Fase 1 — Datos
 - Confirmar campos canónicos usados: `location` y `locationRegion`.
 - Validar que SpotContribution aplique `locationRegion` canónico al crear/aplicar.
 - **Qué NO se toca**: CanonicalArea persistente, estructura de entidades no canónicas.
 - Validaciones necesarias: regionId estable, label presente, type válido (city/region), countryCode válido.
 
 ### Fase 2 — Queries y filtros
 - Unificar filtros por regionId en Home y Flows.
- Map usa bbox como fuente operativa y aplica regionId como filtro secundario (bbox primero).
 - Search: texto primero, luego geocoding que produce CanonicalArea para centrar mapa.
 - Casos borde:
   - 0 spots en región seleccionada: mostrar estado vacío sin fallback de labels.
   - <3 spots en bbox: no activar IA (solo preparar hook; ver Fase 5).
 
 ### Fase 3 — Lógica de negocio
 - Determinar “zona activa” como:
   - regionId seleccionado (Home/Flows) y/o
   - CanonicalArea (Map/Search).
 - “Cerca de ti” se calcula por distancia desde BaseLocation con umbral fijo.
 - Exposición a UI: valores derivados listos para render, sin lógica de negocio en UI.
 
 ### Fase 4 — UI (sin diseño)
 - Pantallas: Home, Map, Search.
 - Estados soportados: sin BaseLocation, sin regionId, sin spots, sin geocoding.
 - **Qué NO se rediseña**: layout, jerarquía visual, componentes existentes.
 
 ### Fase 5 — Integración futura (NO implementar)
 - Hooks previstos para:
   - AI Coverage (disponibilidad de bbox y conteo de spots).
   - Search avanzada (reuso de CanonicalArea y BaseLocation).
 - Se deja preparado el contrato de datos, sin activación ni lógica adicional.
 
 ## 5. Checklist de validación
 - Home filtra por regionId y muestra label correcto.
 - Map muestra spots por bbox y respeta filtro secundario por regionId.
 - Search geocoding produce CanonicalArea y no crea region canónica.
 - “Cerca de ti” funciona solo con BaseLocation y umbral fijo.
 - Contribuciones aplicadas generan `locationRegion` canónico válido.
 - Casos borde:
   - Sin BaseLocation: no se calcula “cerca de ti”.
   - Sin regionId: Home muestra estado vacío coherente.
   - 0 spots: estados vacíos sin fallback a labels.
 
 ## 6. Riesgos técnicos conocidos
 - Dependencia de calidad de geocoding externo (Mapbox/OSM).
 - Spots legacy sin region canónica pueden quedar fuera de filtros hasta migración completa.
 - Colisiones de regionId si el formato final se decide tarde.
 
 ## 7. Qué NO hacer (prohibiciones explícitas)
 - Refactors de arquitectura o modelos.
 - Persistir CanonicalArea o introducir nuevas entidades.
 - Introducir fallback permanente desde city/country legacy.
 - Optimizaciones avanzadas de geocoding o multi-proveedor.
