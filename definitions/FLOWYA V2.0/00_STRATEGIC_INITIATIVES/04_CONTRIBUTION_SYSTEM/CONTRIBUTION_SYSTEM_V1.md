 # FLOWYA V2.0 — Contribution System V1
 
 ## Objetivo
 Definir como progresa un usuario en FLOWYA y que puede hacer en cada etapa, alineado al TrustScore canónico y al sistema de contributions/moderacion existente.
 
 ## Principios no negociables
 - Toda edicion publica pasa por SpotContribution + applier.
 - Pins son privados y no modifican Spots.
 - IA solo sugiere, nunca ejecuta acciones.
 - Imagenes de usuarios se almacenan en Supabase Storage (no blobs locales).
 
 ## Que es una contribucion valida
 Una contribucion valida cumple:
 - **Identidad**: usuario autenticado.
 - **Contexto**: referencia a Spot existente o creacion con datos minimos.
 - **Contenido**: payload consistente con el tipo de contribucion.
 - **Evidencia**: cuando aplica (fotos), URL publica valida en Storage.
 
 ### Tipos y criterios
 
 **1) Editar texto (nombre/descripcion corta)**
 - Minimos: `name` o `short_description` no vacios.
 - Reglas: sin spam, sin links, sin contenido ofensivo.
 - Resultado: SpotContribution update.
 
 **2) Fotos publicas (spot_media_public)**
 - Minimos: URL publica en Storage + metadata basica (source/licencia).
 - Reglas: imagen real del lugar, sin watermark publicitario.
 - Resultado: SpotMediaPublic active (moderable).
 
 **3) Mover ubicacion**
 - Minimos: nuevas coordenadas + razon breve (opcional).
 - Reglas: debe seguir dentro del lugar real; requiere verificacion por applier.
 - Resultado: SpotContribution update con `location`.
 
 **4) Reportes**
 - Minimos: motivo valido (incorrecta, no es del lugar, ofensiva, spam).
 - Reglas: reportes unicos por usuario.
 - Resultado: SpotReport; aplica umbrales de moderacion.
 
 **5) Crear spot**
 - Minimos: `name`, `location`, `type`, `image` opcional.
 - Reglas: evitar duplicados (deteccion previa en UI).
 - Resultado: SpotContribution create (spot_id null).
 
 **6) Flows con IA**
 - Minimos: contexto de ubicacion o seleccion de spots.
 - Reglas: IA solo sugiere; usuario confirma.
 - Resultado: Flow propuesto editable (no auto publicado).
 
 ## Niveles de usuario (TrustScore)
 Basado en contribuciones aplicadas:
 - **nuevo**: 0 aplicadas
 - **creciente**: 1–2 aplicadas
 - **confiable**: 3+ aplicadas
 
 ## Permisos por nivel
 
 | Accion | nuevo | creciente | confiable |
 |---|---|---|---|
 | Reportar | si | si | si |
 | Sugerir ediciones de texto | si | si | si |
 | Agregar fotos publicas | no | no | si |
 | Mover ubicacion | no | si (con revision) | si |
 | Crear spots nuevos | no | si | si |
 | Crear flow con IA | si (solo sugerencias) | si | si |
 
 **Notas**
 - Los permisos son UX-level; el applier valida siempre.
 - Adjuntar media publica requiere confiable (informativo, no auto-aplica).
 
 ## Comunicacion UX (por etapa)
 
 **nuevo**
 - Mensajes: “Tus primeras contribuciones se revisan.”
 - CTA: “Sugerir edicion” y “Reportar”.
 - Feedback: badge “Pendiente”.
 
 **creciente**
 - Mensajes: “Ya puedes crear spots nuevos.”
 - CTA: “Crear spot” habilitado.
 - Feedback: progreso “1/3 para confiable”.
 
 **confiable**
 - Mensajes: “Puedes aportar fotos publicas.”
 - CTA: “Agregar foto publica”.
 - Feedback: historial y tasa de aplicacion.
 
 ## Metricas del sistema
 
 **Progreso de usuario**
 - Contribuciones aplicadas (conteo).
 - Tasa de aceptacion (applied / total).
 
 **Calidad**
 - Reportes por spot / por media.
 - % de contributions rechazadas.
 
 **Salud operativa**
 - Tiempo promedio de aplicacion.
 - Backlog de contributions pendientes.
 
 **Impacto**
 - Spots creados por usuarios confiables.
 - Fotos publicas activas vs soft_hidden.
 
 ## Compatibilidad con sistemas definidos
 - Contributions: sigue el flujo UI → SpotContribution → applier → SpotVersion → Spot.
 - Moderacion: respeta umbrales canónicos (3/5).
 - IA: solo sugerencias, sin ejecucion automatica.
