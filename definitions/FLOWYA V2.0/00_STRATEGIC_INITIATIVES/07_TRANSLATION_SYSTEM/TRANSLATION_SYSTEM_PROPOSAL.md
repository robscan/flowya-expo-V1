 # FLOWYA V2.0 — Translation System Proposal
 
 ## Idioma canónico
 - **ES (es)** es el idioma fuente de verdad del sistema.
 - Todo contenido canonico se crea primero en ES.
 
 ## Idiomas soportados
 - **ES** (canónico)
 - **EN** (minimo requerido)
 - Escalable a idiomas futuros sin cambiar el modelo.
 
 ## Modelo de datos (tabla de traducciones)
 
 **Entidad Translation**
 - `id`
 - `entity_type` (spot, flow, card, ui, prompt)
 - `entity_id`
 - `field` (name, short_description, description, title, summary, step, etc.)
 - `language` (es, en, ...)
 - `value`
 - `source` (human, ai, system)
 - `status` (draft, machine, reviewed, published)
 - `created_at`, `updated_at`
 - `reviewed_by` (opcional)
 
 **Reglas**
 - ES se considera canónico y se versiona como contenido base.
 - Traducciones EN se almacenan en tabla de traducciones con `source` y `status`.
 - La entidad principal guarda solo el texto canónico ES.
 
 ## Flujo canónico
 
 1) **Creacion (ES)**
    - Usuario o sistema crea el contenido en ES.
 
 2) **Auto-traduccion (EN)**
    - IA genera traduccion con `status = machine`.
 
 3) **Revision**
    - Curador/Moderador o editor valida y cambia a `reviewed`/`published`.
 
 4) **Fallback**
    - Si falta EN, usar ES y marcar con label discreto en UI si corresponde.
 
 ## Reglas de traduccion (que se traduce y que no)
 
 **Se traduce**
 - name, shortDescription, description (Spots).
 - title, summary, steps (Flows).
 - labels de Cards si son texto dinamico.
 - UI copy en superficies globales (menu, ctas).
 - prompts y respuestas de IA mostradas al usuario.
 
 **No se traduce**
 - IDs, coordenadas, tags tecnicos, metadata interna.
 - Nombres propios si no tienen equivalencia.
 - Datos operativos (logs, estados internos).
 
 ## Integracion por superficie
 
 **Spots**
 - Base ES en entidad Spot.
 - Traducciones en tabla por campo.
 
 **Flows**
 - Base ES en Flow.
 - Traducciones por titulo, summary y pasos.
 
 **Cards**
 - Usar traduccion disponible por idioma de usuario.
 - Fallback a ES si no existe.
 
 **Search**
 - Buscar por idioma preferido.
 - Si no hay traduccion, indexar ES y devolver ES con fallback.
 
 **Admin**
 - Vista de estado por idioma (machine/reviewed/published).
 - Acciones: aprobar, editar, bloquear, revertir.
 
 **IA**
 - Prompts con targetLanguage.
 - IA genera en EN si el idioma preferido lo requiere.
 - IA no modifica ES canonico sin accion humana.
 
 ## Fallback y falta de traduccion
 - Si falta traduccion EN:
   - Mostrar ES con indicador discreto.
   - Registrar evento de falta para backlog de traduccion.
 - Si falta ES (no deberia):
   - Bloquear publicacion y marcar inconsistencia.
 
 ## Estados y control de calidad
 - `machine`: traduccion generada por IA.
 - `reviewed`: validada por humano.
 - `published`: aprobada para UX.
 - Regla: EN en UX puede ser `machine`, pero se prioriza `reviewed`.
 
 ## Seguridad y no contaminacion
 - IA solo crea traducciones derivadas, no altera ES canonico.
 - Toda traduccion queda auditada con `source` y `reviewed_by`.
 
 ## Diagrama de flujo (referencia)
 ```mermaid
 flowchart TD
   CreateES[CreateES] --> AutoTranslate[AutoTranslateEN]
   AutoTranslate --> Review[Review]
   Review --> Publish[PublishTranslation]
   Publish --> UX[RenderByLanguage]
   UX -->|\"MissingTranslation\"| FallbackES[FallbackToES]
 ```
