 # Scope V1 — Admin System
 
 ## Objetivo del V1
 Garantizar control operativo minimo para contributions, reportes y contenido IA con auditoria clara y roles definidos.
 
 ## Incluido en V1 (SI)
 - Colas primarias: Contributions, Reportes, IA Coverage y Usuarios.
 - Acciones basicas: aprobar, rechazar, editar antes de canonizar.
 - Moderacion ligera: soft_hidden para media y needs_review para spots.
 - Auditoria obligatoria de acciones y razones.
 - Roles base: Admin total, Curador, Soporte, Analista.
 - Metricas operativas simples: backlog, tiempos promedio, tasa de aprobacion.
 - Una sola vista principal por sistema (sin multiples dashboards).
 
 ## Fuera de alcance V1 (NO)
 - Automatizaciones de moderacion o aprobacion.
 - Automatizaciones y bulk actions avanzadas.
 - Herramientas avanzadas de analitica o BI.
 - Workflows complejos de escalamiento multi-equipo.
 - Acciones masivas y scripting interno.
 
 ## Decisiones ya tomadas (congeladas)
 - Moderacion ligera sin ocultar spots automaticamente.
 - IA solo sugiere; acciones siempre humanas.
 - Auditoria obligatoria para toda accion admin.
 
 ## Decisiones pendientes post-V1
 - SLA por tipo de cola y volumen esperado.
 - Politica de sanciones y escalamiento de usuarios.
 - Expansion de roles o permisos finos.
 
 ## Riesgos aceptados en V1
 - Carga operativa alta si crece el volumen de contributions.
 - Dependencia de equipo pequeño para revision inicial.
