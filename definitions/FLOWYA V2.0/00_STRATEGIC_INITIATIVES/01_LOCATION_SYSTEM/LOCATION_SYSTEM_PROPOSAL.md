 # FLOWYA V2.0 ? Sistema de Ubicacion (Propuesta Canonica)
 
 ## Principios rectores
 1) Una sola fuente de verdad para ubicacion del usuario (`BaseLocation`).
 2) Una sola estructura can?nica para region (`CanonicalRegion`) y un solo criterio de comparacion (`regionId`).
 3) "Region" (contexto humano) y "Area" (viewport/bbox operativo) son conceptos distintos.
 4) Filtrar siempre por `regionId` o por `bbox`, nunca por labels.
 5) Mostrar siempre por `label`, nunca por `regionId`.
 
 ## Modelo can?nico propuesto
 
 ### BaseLocation
 - `latitude`, `longitude`
 - Fuente: `LocationProvider` (sesion congelada con refresh manual)
 
 ### CanonicalRegion (contexto humano)
 - `regionId` (string estable)
 - `label` (texto humano)
 - `type` = `city` | `region` (no usar `locality` ni `country` como nivel UI)
 - `countryCode` (ISO 3166-1 alpha-2)
- Formato can?nico de `regionId`: `country.type.place` (ej.: `mx.city.playa-del-carmen`).
 
 **Regla de nivel can?nico (respuesta directa):**
 - Nivel primario: **ciudad (place)**.
 - Fallback: **region administrativa (region)** solo cuando no exista place.
 - `bbox` NO es nivel can?nico; es un "area operativa".
 
 ### CanonicalArea (operativo, no humano)
 - `bbox` { north, south, east, west }
 - `center` { latitude, longitude }
 - `zoom` (opcional)
 - Origen: viewport de Map o resultado de geocoding en Search.
 
 **Uso:** Map y Search. No se persiste en Spot; se calcula en runtime.
 
 ## Reglas por modulo
 
 ### Home
 - **Filtro:** por `regionId` can?nico (o null = all regions).
 - **Display:** `label` de la region seleccionada.
 - **Current location:** region dinamica resuelta desde `BaseLocation` via `RegionResolver`.
 - **Nearby:** estrictamente distancia a `BaseLocation` (no por region).
 
 ### Map
 - **Fuente operativa:** `CanonicalArea` (viewport/bbox).
- **Filtro secundario:** si hay region seleccionada, aplicar filtro por `regionId` despu?s de viewport.
 - **Explore:** viewport + clustering.
 - **My Map (Pins):** solo spots pinneados (region opcional como filtro, no como limitante).
 
 ### Pins
 - No modifican ubicacion de Spot.
 - Filtran o muestran solo por Spot existente y su `locationRegion`.
 
 ### Flows
 - Flows solo referencian Spots can?nicos.
 - **Nearby flows:** distancia al primer spot usando `BaseLocation`, pero solo dentro de region seleccionada si aplica.
 - **Display:** usa `label` del spot/region; no deriva nuevas regiones.
 
 ### Search
 - **Intento 1:** Spots/Flows (texto).
 - **Intento 2:** Lugares (geocoding) => produce `CanonicalArea` para centrar Map.
 - Si el usuario selecciona un lugar, no se crea region; se crea area (bbox) y se centra el mapa.
 - Distancia en resultados usa `BaseLocation`, nunca region.
 
 ### IA
 - Entradas de ubicacion:
   - `BaseLocation` (si existe).
   - `selectedRegionId` (si el usuario eligio region manual).
   - `CanonicalArea` (si viene de Search/geocoding).
 - La IA genera propuestas de Flow basadas en Spots dentro del area o region, con fallback a distancia.
 
 ### Admin
 - Validar que todo Spot nuevo tenga `locationRegion` can?nico al momento de aplicar contribuciones.
 - Registrar en auditoria la region can?nica usada.
 - Rechazar contribuciones con ubicacion insuficiente (sin coordenadas validas).
 
 ## Reglas de filtrado vs visualizacion (respuesta directa)
 - **Filtrar:** por `regionId` can?nico (Home, Flows, Pins) o por `bbox` (Map/Search).
 - **Mostrar:** por `label` (nunca por `regionId`).
 - **Ordenar:** por distancia usando `BaseLocation` cuando aplique.
 
 ## "Cerca de ti" (respuesta directa)
 - Definicion can?nica: **distancia** desde `BaseLocation`.
 - Umbral recomendado: 5 km (alineado a Home actual).
 - Si no hay `BaseLocation`, no se calcula "cerca de ti".
 
 ## Prevencion de errores tipo "Quintana Roo no muestra spots"
 1) No mezclar niveles: si region seleccionada es `region`, solo mostrar spots con `locationRegion.type = region`.
 2) `regionId` debe ser estable y unico (no comparar labels).
 3) Evitar fallback ad-hoc desde `city/country` para filtros; solo usarlo para migracion/ingesta.
 4) Resolver region can?nica al momento de crear/aplicar Spot, no solo en runtime.
 5) Si Mapbox no devuelve `place`, usar `region` y persistirlo (no dejar nulo).
 
 ## Diagrama de flujo (mermaid)
 ```mermaid
 flowchart TD
   baseLocation[BaseLocation] --> regionResolver[RegionResolver]
   regionResolver --> canonicalRegion[CanonicalRegion]
   searchInput[SearchQuery] --> geocoding[Geocoding]
   geocoding --> canonicalArea[CanonicalArea]
   canonicalRegion --> homeFilter[HomeFilterByRegionId]
   canonicalRegion --> flowsFilter[FlowFilterByRegionId]
   canonicalArea --> mapViewport[MapViewport]
   baseLocation --> nearbyCalc[NearbyDistance]
   nearbyCalc --> homeSections[HomeSections]
   mapViewport --> mapPins[MapPins]
 ```
 
 ## Respuestas directas a preguntas clave
 - **Nivel canonico:** ciudad (`place`) como primario, region administrativa como fallback. `bbox` no es canonico.
 - **Filtrar vs mostrar:** filtrar por `regionId` o `bbox`; mostrar por `label`.
 - **Cerca de ti:** distancia a `BaseLocation` con umbral fijo.
 - **Evitar "Quintana Roo no muestra spots":** no mezclar niveles, persistir region can?nica, comparar por `regionId` y usar fallback `region` cuando no exista `place`.
 - **Relacion con IA:** IA usa `BaseLocation`, `selectedRegionId` y/o `CanonicalArea` para proponer Flows; nunca infiere region desde labels UI.
