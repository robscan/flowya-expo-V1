 # Scope V1 — Translation System
 
 ## Objetivo del V1
 Habilitar bilingue ES/EN de forma controlada, manteniendo ES como canon y evitando mezcla de idiomas en UX.
 
 ## Incluido en V1 (SI)
 - ES como idioma canonico en entidades principales.
 - Tabla de traducciones con estados (machine, reviewed, published).
 - Auto-traduccion a EN con trazabilidad (source y status).
 - Fallback a ES cuando no exista EN.
 - Alcance de contenido: Spots y Flows (name, shortDescription, description, title, summary, steps).
 - Politica de no contaminacion: IA no modifica ES canonico.
 
 ## Fuera de alcance V1 (NO)
 - Idiomas adicionales a EN.
 - Localizacion completa de UI y textos operativos.
 - Traduccion automatica masiva del backlog legacy.
 - Indexacion multilingue avanzada en Search.
 
 ## Decisiones ya tomadas (congeladas)
 - ES es fuente de verdad.
 - Traducciones se almacenan fuera de la entidad principal.
 - La IA solo genera traducciones derivadas.
 
 ## Decisiones pendientes post-V1
 - SLA y responsables de revision de traducciones.
 - Politica de indexacion en Search (machine vs reviewed).
 - Estrategia de versionado cuando cambia el canon ES.
 
 ## Riesgos aceptados en V1
 - Mezcla puntual de idiomas si faltan revisiones humanas.
 - Calidad variable de traducciones machine en contenido sensible.
