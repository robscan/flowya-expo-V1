 # Scope V1 — Location System
 
 ## Objetivo del V1
 Alinear toda la experiencia de ubicacion con una fuente canonica y reglas unificadas para filtro, display y distancia, evitando inconsistencias entre Home, Map, Search, Flows y Admin.
 
 ## Incluido en V1 (SI)
 - BaseLocation unica por sesion y regla de refresco manual.
 - CanonicalRegion con regionId estable, label y type (city como primario, region como fallback).
 - CanonicalArea solo operativo para Map/Search (viewport/bbox), sin persistencia.
 - Reglas unificadas:
   - Filtrar por regionId o bbox, nunca por labels.
   - Mostrar siempre por label.
   - "Cerca de ti" por distancia desde BaseLocation con umbral fijo.
 - Validacion de ubicacion al aplicar contribuciones (spot con region canonica).
 - Resolucion de regionId en creacion/aplicacion, no en runtime tardio.
 
 ## Fuera de alcance V1 (NO)
 - Persistir CanonicalArea para analitica o IA.
 - Umbral dinamico de "cerca de ti" por densidad.
 - UI que permita elegir niveles adicionales (locality/country).
 - Fallback permanente desde city/country legacy en UX.
 - Optimizaciones avanzadas de geocoding o multi-proveedor.
 
 ## Decisiones ya tomadas (congeladas)
 - City es nivel canonico; region solo como fallback.
 - Filtrar por regionId o bbox; mostrar por label.
 - Mapbox es fuente para resolver region canonica.
 - "Cerca de ti" se define por distancia a BaseLocation.
 - Formato de regionId: `country.type.place` (ej.: `mx.city.playa-del-carmen`).
 - En Map: primero viewport (bbox), luego regionId.
 
 ## Decisiones pendientes post-V1
 - Persistencia futura de CanonicalArea.
 - Ajuste de umbral de "cerca de ti" con datos reales.
 
 ## Riesgos aceptados en V1
 - Dependencia fuerte de calidad de geocoding de Mapbox.
 - Dependencia de calidad de geocoding externo (Mapbox/OSM) aceptada en V1.
 - Spots legacy sin region canonica pueden quedar fuera de filtros hasta migracion completa.
 - Posibles colisiones de regionId si el formato final se decide tarde.
