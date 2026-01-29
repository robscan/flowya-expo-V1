 # FLOWYA V2.0 — Admin System Proposal
 
 ## Objetivo
 Diseñar el Admin Panel como un sistema operativo: define flujo, decisiones, auditoria, permisos y prioridad de trabajo. No es un conjunto de pantallas aisladas.
 
 ## Principios
 - Moderacion ligera, auditable y deterministica.
 - Toda edicion publica pasa por SpotContribution + applier.
 - IA solo sugiere; nunca ejecuta cambios automaticos.
 - Separacion clara de colas operativas.
 - Desktop-first con uso movil aceptable.
 
 ## Roles y permisos (base)
 
 **Admin total**
 - Acceso completo a todas las colas, configuraciones y auditoria.
 - Puede aprobar/rechazar, editar contenido, ejecutar rollback.
 
 **Curador/Moderador**
 - Gestion de spots, media publica y contributions IA.
 - Puede aprobar/rechazar y editar antes de canonizar.
 - Sin acceso a configuraciones globales ni permisos de usuarios.
 
 **Soporte**
 - Gestion de usuarios y permisos.
 - Acceso a historial de usuario y acciones de soporte.
 - Sin acceso a moderacion de contenido.
 
 **Analista**
 - Solo lectura de metricas, auditoria y dashboards.
 - Sin acciones de moderacion ni cambios de usuario.
 
 ## Modelo operativo (sistema)
 
 **Colas primarias**
 1) **Contributions**: pendientes, aplicadas, rechazadas.
 2) **Reportes**: spots y media publicas con umbrales.
 3) **IA Coverage**: spots generados por IA (estado intermedio).
 4) **Usuarios**: estado, confianza, sanciones, historial.
 
 **Flujos criticos**
 - Contribution: revisar → editar → aprobar/rechazar → version.
 - Reportes: validar → aplicar reglas (soft_hidden / needs_review).
 - IA Coverage: revisar → aprobar para canonizar o rechazar.
 - Usuario: diagnostico → accion soporte → auditoria.
 
 ## Moderacion de spots y media
 - Basado en umbrales canónicos:
   - SpotMediaPublic: soft_hidden con 3 reportes unicos.
   - Spot: needs_review con 5 reportes unicos (no oculta).
 - Toda accion genera evento de auditoria.
 - No se elimina contenido automaticamente.
 
 ## Panel de usuarios
 - Estado de TrustScore (nuevo/creciente/confiable).
 - Historial de contributions y reportes.
 - Acciones de soporte: bloqueo temporal, notas internas, reset de sesiones.
 - Permisos asignados por rol y nivel.
 
 ## Permisos (matriz resumida)
 
 | Accion | Admin | Curador | Soporte | Analista |
 |---|---|---|---|---|
 | Aprobar/rechazar contributions | si | si | no | no |
 | Editar antes de canonizar | si | si | no | no |
 | Moderar media publica | si | si | no | no |
 | Ver auditoria completa | si | si | si | si |
 | Gestionar usuarios | si | no | si | no |
 | Configuracion global | si | no | no | no |
 | Ver metricas | si | si | si | si |
 
 ## IA Coverage (operacion)
 - Visible en cola dedicada con etiqueta `ai_coverage`.
 - Estado intermedio no canonico:
   - `visibility = visible`
   - `review_state = pending`
 - Acciones: aprobar (canoniza), editar, rechazar.
 - Registro obligatorio de razon y operador.
 
 ## UX (desktop-first)
 - Navegacion por colas con filtros y busqueda rapida.
 - Vista detallada lateral para acciones rapidas.
 - Modo movil: lectura y aprobaciones simples, sin configuraciones.
 
 ## Metricas y auditoria
 
 **Metricas operativas**
 - Tiempo promedio de revision.
 - Backlog por cola.
 - Tasa de aprobacion/rechazo.
 
 **Metricas de calidad**
 - % de media soft_hidden.
 - % de spots en needs_review.
 - Conversion de IA Coverage a canonico.
 
 **Auditoria**
 - Cada accion registra: usuario, timestamp, entidad, cambio, razon.
 - Exportable para analisis.
 
 ## Integracion con sistemas V2.0
 - Contributions y applier como fuente unica de cambios.
 - Moderacion ligera sin ocultar spots automaticamente.
 - IA como sugerencia; acciones siempre humanas.
