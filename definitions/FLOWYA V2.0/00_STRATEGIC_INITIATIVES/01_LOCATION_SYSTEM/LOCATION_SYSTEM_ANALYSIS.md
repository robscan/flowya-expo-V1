 # FLOWYA V2.0 — Sistema de Ubicacion (Analisis)
 
 ## Proposito
 Documentar el manejo actual de ubicacion y region en FLOWYA, detectar duplicaciones, ambiguedades y decisiones implícitas que hoy generan fragilidad.
 
 ## Mapa actual de ubicacion (alto nivel)
 - Ubicacion base del usuario (una sola vez por sesion) en `LocationProvider`.
 - Region seleccionada en Home via `RegionContext`, resuelta desde `baseLocation` con Mapbox (`RegionResolver`).
 - Regions canónicas derivadas de coordenadas con prioridad `place` (ciudad) y fallback `region`.
 - Spots contienen:
   - Coordenadas en `location.lat/lng` (y compat con legacy `latitude/longitude`).
   - Metadatos opcionales `location.city/country`.
   - `locationRegion` canónico (cuando existe) con `regionId`, `label`, `type`, `countryCode`.
 - Home filtra por `regionId` y lista regiones disponibles desde spots existentes.
 - Map filtra por pin state y viewport; no aplica region global seleccionada.
 - Search mezcla:
   - Busqueda textual en Spots/Flows.
   - Geocoding Mapbox para "lugares".
   - Sugerencias cerca de `baseLocation`.
 - Form selectors usan geocoding y mapas para elegir coordenadas.
 
 ## Duplicaciones detectadas
 1) Geocoding duplicado:
    - `utils/mapboxGeocoding.ts` (reverse/forward Mapbox).
    - `utils/geocoding.ts` (predefined cities + geocoding "auxiliar").
 2) Formatos de coordenadas:
    - `lat/lng` vs `latitude/longitude` coexistiendo en Spot y selectores.
 3) Derivacion de region:
    - `RegionResolver` (Mapbox) produce `LocationRegion`.
    - Fallback desde `location.city/country` en `getAvailableRegionsFromSpots` y `getSpotsByRegion`.
 4) Labels de region:
    - `RegionContext` mantiene `currentRegionLabel`.
    - UI tambien deriva label desde `availableRegions`.
 
 ## Ambiguedades actuales
 - Nivel canonico: el sistema prioriza `city` pero el modelo permite `region` y `locality`.
 - Que es "region" vs "area": en UI se usa regionId, en Map se usa viewport (bbox implícito).
 - "Cerca de ti": en Home es distancia (5 km), en Search es ranking, en Map es vista.
 - Filtrar vs mostrar: a veces se filtra por regionId, otras veces por viewport o pins.
 - Manejo de spots sin `locationRegion`: se eliminan en migracion pero a veces se generan regiones desde `city/country` para UI.
 
 ## Decisiones implícitas encontradas
 - **Mapbox como fuente unica** para resolver regiones canónicas.
 - **`regionId` estable** generado por `countryCode + normalizedPlace` para evitar variaciones de Mapbox.
 - **Eliminar spots sin region canónica** (`deleteInvalidSpots`) en lugar de corregirlos.
 - **Current location** se guarda como marker especial en storage, no como regionId real.
 - **Home usa regionId** como filtro y deduplicacion (nunca label).
 - **Map limita cantidad de spots** cuando `pinStateFilter = all` (max 200).
 
 ## Inconsistencias con datos/persistencia
 - Supabase `spots` guarda `location` (lat/lng/city/country) pero no guarda `locationRegion` canónico.
 - `SpotContributionPayload` no incluye `locationRegion`, solo `location` y texto.
 - La region canónica se calcula en runtime (migraciones o resoluciones), no queda persistida.
 
 ## Riesgos visibles
 - Divergencia entre `location.city/country` y `locationRegion` (mismo spot puede caer en region distinta segun fallback).
 - Colisiones potenciales de `regionId` si ciudad y region comparten nombre en un mismo pais.
 - Filtrado inconsistente entre Home (regionId) y Map (viewport), generando percepcion de "faltan spots".
 - Regiones validas sin spots quedan invisibles si la lista se deriva solo de datos existentes.
 
 ## Caso ejemplo: "Quintana Roo no muestra spots"
 Posibles causas actuales:
 - Spots con `locationRegion` a nivel `city`, pero UI intenta filtrar por una `regionId` de nivel `region`.
 - RegionId no coincide por reglas distintas (fallback city/country vs Mapbox).
 - `RegionResolver` devuelve `place` distinto o inexistente y el sistema no guarda `region`.
 - Dataset sin `locationRegion` canónico se elimina o queda fuera del filtro.
 
 ## Conclusiones del analisis
 El sistema ya tiene piezas canónicas (LocationProvider, RegionResolver, regionId), pero se mezclan con fallbacks legacy y criterios de filtrado distintos (regionId vs viewport). La falta de un **modelo canonico unificado** para "region" y "area" en todos los módulos es la fuente principal de inconsistencias.
