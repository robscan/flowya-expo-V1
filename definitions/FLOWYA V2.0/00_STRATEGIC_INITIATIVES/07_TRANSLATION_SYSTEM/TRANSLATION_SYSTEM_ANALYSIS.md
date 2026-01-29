 # FLOWYA V2.0 — Translation System Analysis
 
 ## Contexto
 FLOWYA escala con IA y contribuciones, pero hoy no existe un sistema formal de traduccion/localizacion. Esto genera riesgo de incoherencias, duplicacion de campos y UX inconsistente en superficies clave (Spots, Flows, Cards, Search, Admin).
 
 ## Estado actual (observaciones)
 - Idioma canónico no definido de forma operativa.
 - No hay modelo de datos de traducciones por entidad.
 - No existe flujo formal de auto-traduccion, revision y fallback.
 - IA genera contenido sin reglas explicitas de idioma y destino.
 - Search y Cards no tienen reglas claras de idioma preferido.
 
 ## Riesgos actuales
 - Duplicacion de textos en campos locales y mezcla de idiomas.
 - UX inconsistente (texto en ES/EN mezclado).
 - No hay trazabilidad de quien tradujo o aprobo.
 - IA puede contaminar contenido humano sin control de idioma.
 
 ## Superficies afectadas
 - **Spots**: name, shortDescription, description.
 - **Flows**: title, summary, steps.
 - **Cards**: textos resumidos y labels.
 - **Search**: resultados y sugerencias.
 - **Admin**: revision, auditoria y herramientas de edicion.
 - **IA**: prompts, generacion y postprocesado.
 
 ## Conclusiones
 Se requiere un sistema con idioma canónico ES, tabla de traducciones por entidad, flujo de auto-traduccion + revision, y reglas de fallback claras para UX y search.
