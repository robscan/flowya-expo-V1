 # Implementation Plan — Translation System (V1)
 
 ## 1. Objetivo tecnico del V1
 Habilitar bilingue ES/EN manteniendo ES como canon, con tabla de traducciones separada, estados claros y fallback consistente a ES.
 
 ## 2. Principios tecnicos congelados
 - ES es fuente de verdad.
 - Traducciones viven fuera de la entidad principal.
 - IA solo genera traducciones derivadas (no altera ES).
 - Fallback a ES cuando EN no exista o no este publicada.
 
 ## 3. Componentes del sistema
 - **Tabla de traducciones**: entidad, campo, idioma, estado (machine/reviewed/published).
 - **Pipeline de traduccion**: generacion automatica a EN con trazabilidad.
 - **Resolucion de idioma**: preferencia del usuario y fallback a ES.
 - **Cobertura**: Spots y Flows (name, shortDescription, description, title, summary, steps).
 
 ## 4. Plan de ejecucion por fases
 
 ### Fase 1 — Modelo de traducciones
 - Definir tabla canonicamente separada y claves (entity_id, field, lang).
 - Estados: machine, reviewed, published.
 - **Que NO se toca**: indexacion multilingue avanzada.
 
 ### Fase 2 — Pipeline de generacion
 - Generar EN desde ES con trazabilidad (source y status).
 - Mantener ES intacto.
 
 ### Fase 3 — Resolucion y fallback
 - Resolver idioma segun preferencia del usuario.
 - Fallback a ES si no hay EN publicado.
 
 ### Fase 4 — Integracion en UI
 - Spots y Flows consumen traduccion si existe.
 - No localizar textos operativos de UI en V1.
 
 ### Fase 5 — Validacion
 - Verificar mezcla de idiomas en UX.
 - Confirmar fallback consistente a ES.
 
 ## 5. Checklist de validacion
 - ES es canonico y no se modifica por traducciones.
 - EN se muestra solo si existe traduccion publicada.
 - Fallback a ES funciona en todos los campos cubiertos.
 - Traducciones se guardan fuera de entidades principales.
 
 ## 6. Riesgos tecnicos conocidos
 - Mezcla puntual de idiomas si faltan revisiones.
 - Calidad variable en traducciones machine.
 
 ## 7. Que NO hacer (prohibiciones explicitas)
 - No agregar idiomas adicionales a EN.
 - No traducir UI operativa en V1.
 - No indexacion multilingue avanzada.
