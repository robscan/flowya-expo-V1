 # Implementation Plan — Admin System (V1)
 
 ## 1. Objetivo técnico del V1
 Asegurar control operativo minimo sobre contributions, reportes, media e IA coverage con auditoria obligatoria, roles base y una sola vista principal por sistema.
 
 ## 2. Principios técnicos congelados
 - Moderacion ligera sin ocultar spots automaticamente.
 - IA solo sugiere; decisiones siempre humanas.
 - Auditoria obligatoria para toda accion admin.
 - Una sola vista principal por sistema (sin multiples dashboards).
 - Sin automatizaciones ni bulk actions avanzadas.
 
 ## 3. Componentes del sistema
 - **Colas**: Contributions, Reportes, IA Coverage, Usuarios.
 - **Acciones**: aprobar, rechazar, editar antes de canonizar.
 - **Moderacion ligera**: soft_hidden para media, needs_review para spots.
 - **Auditoria**: log de acciones, motivos y entidad impactada.
 - **Roles**: Admin total, Curador, Soporte, Analista.
 - **Metricas**: backlog, tiempos promedio, tasa de aprobacion.
 
 ## 4. Plan de ejecucion por fases
 
 ### Fase 1 — Datos y contratos operativos
 - Verificar contratos de tablas y RPCs para contributions, reports, media y auditoria.
 - Alinear payloads minimos requeridos por la UI.
 - **Que NO se toca**: modelos de dominio fuera de admin.
 
 ### Fase 2 — Colas y vistas principales
 - Consolidar una sola vista principal por sistema (sin dashboards secundarios).
 - Exponer colas primarias con filtros basicos.
 
 ### Fase 3 — Acciones y auditoria
 - Asegurar flujo de aprobar/rechazar con motivo opcional.
 - Garantizar auditoria por accion y entidad.
 - Confirmar que no hay bypass al flujo de contributions.
 
 ### Fase 4 — Roles y permisos base
 - Aplicar permisos por rol para acciones de moderacion y lectura.
 - Mantener Admin como unico rol con acciones completas.
 
 ### Fase 5 — Metricas operativas
 - Backlog, tiempos promedio y tasa de aprobacion visibles.
 - Sin BI ni dashboards avanzados.
 
 ## 5. Checklist de validacion
 - Existe una sola vista principal por sistema.
 - Toda accion admin queda auditada con entidad y motivo.
 - Moderacion ligera respeta soft_hidden/needs_review sin ocultar spots automatico.
 - Roles base definidos y aplicados en permisos.
 - Metricas basicas visibles: backlog, tiempos, tasa.
 
 ## 6. Riesgos tecnicos conocidos
 - Sobrecarga operativa si el volumen crece sin automatizacion.
 - Dependencia de un equipo reducido para revisiones.
 
 ## 7. Que NO hacer (prohibiciones explicitas)
 - No crear dashboards multiples o vistas paralelas.
 - No agregar automatizaciones ni bulk actions.
 - No introducir cambios de arquitectura o modelos fuera de admin.
