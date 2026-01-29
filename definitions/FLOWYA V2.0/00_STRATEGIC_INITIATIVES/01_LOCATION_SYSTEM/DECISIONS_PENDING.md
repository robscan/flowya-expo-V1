 # FLOWYA V2.0 — Location System (Decisiones Pendientes)
 
 ## 1) Formato final de `regionId`
 - Opcion A: `country.normalizedPlace` (actual).
 - Opcion B: `country.type.normalizedPlace` para evitar colisiones ciudad/region con mismo nombre.
 - Impacto: migracion de regionId existentes y compatibilidad con filtros.
 - DECISION TOMADA: `country.type.place` (ej.: `mx.city.playa-del-carmen`).
 
 ## 2) Manejo de spots sin `locationRegion`
 - Opcion A: eliminar (como hoy).
 - Opcion B: enviar a cola de revision (Admin) antes de eliminar.
 - Impacto: consistencia vs perdida de datos.
 
 ## 3) Uso de `CanonicalArea`
 - Opcion A: solo runtime (no persistir).
 - Opcion B: persistir bbox de areas seleccionadas (Search/Map) para IA o analitica.
 - Impacto: almacenamiento y complejidad operativa.
 
 ## 4) Prioridad de filtros en Map
 - Opcion A: primero `regionId`, luego viewport.
 - Opcion B: primero viewport, luego region (solo etiqueta).
 - Impacto: coherencia con Home vs exploracion libre.
 - DECISION TOMADA: primero viewport (bbox), luego regionId.
 
 ## 5) Umbral canonico de "cerca de ti"
 - Opcion A: 5 km fijo (alineado a Home actual).
 - Opcion B: dinamico por densidad de spots/ciudad.
 - Impacto: consistencia y expectativas de usuario.
 
 ## 6) Uso de `location.city/country` legacy
 - Opcion A: solo migracion inicial, luego deprecated.
 - Opcion B: mantener fallback permanente para UI.
 - Impacto: riesgo de divergencia con `locationRegion`.
 
 ## 7) Nivel de region visible en UI
 - Opcion A: solo `city` (fallback `region`).
 - Opcion B: permitir elegir explicitamente `region` aunque exista `city`.
 - Impacto: experiencia de filtro vs precision geografica.
 
 ## 8) Estandar de validacion Mapbox
 - Opcion A: si no hay `place`, aceptar `region`.
 - Opcion B: si no hay `place`, bloquear y pedir input manual.
 - Impacto: cobertura geografica vs calidad de ubicacion.
