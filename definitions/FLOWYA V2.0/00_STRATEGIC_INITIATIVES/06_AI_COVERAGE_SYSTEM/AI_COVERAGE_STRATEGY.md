 # FLOWYA V2.0 — AI Coverage Strategy
 
 ## Objetivo
 Crear cobertura base solo cuando un usuario entra a una zona sin cobertura suficiente. La IA genera spots estrategicos (8 a 10) con un loader narrativo, visibles de inmediato pero en estado intermedio no canonico, auditables desde Admin y sin contaminar contenido humano.
 
 ## Principios
 - Activacion solo por actividad real del usuario.
 - La IA no modifica contenido humano existente.
 - Los spots IA son visibles, pero no canonicos hasta validacion.
 - Toda accion queda auditada en Admin.
 
 ## Criterio de activacion (threshold)
 - Zona: viewport/bbox actual.
 - Condicion: activar si hay menos de 3 spots visibles en el bbox.
 - Actividad real: el usuario entra a la vista (Home/Map/Search) y el mapa queda estable (idle) por al menos X segundos.
 - Cooldown recomendado: 1 ejecucion por bbox por sesion, con TTL de 24h por bbox.
 
 ## Tipo de spots generados (base)
 - Cantidad: 8 a 10 spots.
 - Objetivo: cobertura inicial, diversidad y orientacion (no exhaustivo).
 - Contenido:
   - name: claro y util.
   - type: categoria valida.
   - location: punto aproximado dentro del bbox.
   - shortDescription: 1-2 frases.
   - image: opcional; si no hay, usar placeholder.
 - Distribucion: balance geografico dentro del bbox, no clusters.
 - Restricciones: evitar duplicados con spots existentes y con otros AI.
 
 ## Estado intermedio (no canonico)
 - `source = ai_coverage`
 - `canonical = false`
 - `visibility = visible`
 - `review_state = pending`
 - Estos spots no cuentan para TrustScore ni estadisticas humanas.
 
 ## Etiquetado AI-generated
 - Etiqueta visible: "Generado por IA" o badge discreto.
 - Metadatos obligatorios:
   - `ai_generated = true`
   - `ai_model`
   - `generation_reason = low_coverage`
   - `generation_context = bbox_id`
   - `generation_session_id`
 
 ## UX del loader narrativo
 - Mensaje base: "Explorando la zona y creando tu experiencia..."
 - Estados:
   1) Inicio: "Detectamos poca cobertura"
   2) Proceso: "Explorando y creando lugares base"
   3) Listo: "Listo. Ya tienes una base inicial"
 - Duracion: mostrar mientras se genera; timeout con fallback.
 - Cancelacion: el usuario puede cancelar sin bloquear navegacion.
 - Error: mensaje breve y reintento manual.
 
 ## Registro y auditoria (Admin)
 - Evento por ejecucion:
   - bbox, timestamp, user_id (si aplica), cantidad creada.
   - ids de spots generados.
 - Panel Admin:
   - filtro por `source = ai_coverage`
   - estado `pending` vs `approved/rejected`
   - acciones: aprobar, rechazar, editar antes de canonizar.
 
 ## Metricas clave
 - Cobertura: % de bboxes con >=3 spots visibles.
 - Activaciones: ejecuciones por dia y por zona.
 - Calidad: ratio de aprobacion de spots IA.
 - Conversion: % de spots IA que pasan a canonicos.
 - Impacto UX: tiempo hasta primera accion del usuario post-cobertura.
 
 ## Salvaguardas
 - No ejecutar si el usuario esta inactivo o en background.
 - No ejecutar en zonas con cobertura suficiente.
 - No ejecutar en sucesion (cooldown por bbox).
 - No mezclar en feeds humanos sin etiqueta.
 
 ## Flujo resumido
 1) Usuario entra a zona (bbox).
 2) Se evalua conteo de spots visibles.
 3) Si < 3, se activa loader narrativo.
 4) Se generan 8-10 spots base (AI coverage).
 5) Spots visibles con estado intermedio.
 6) Se registra todo en Admin.
