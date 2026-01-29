 # Implementation Plan — Contribution System (V1)
 
 ## 1. Objetivo técnico del V1
 Implementar el flujo canónico de contribuciones (SpotContribution → applier → SpotVersion → Spot) con permisos progresivos por TrustScore, validaciones mínimas por tipo y trazabilidad operativa, sin bypass del canon.
 
 ## 2. Principios técnicos congelados
 - Toda edición pública entra por SpotContribution.
 - Applier determinístico aplica cambios y genera SpotVersion.
 - Pins son privados y nunca modifican Spots.
 - IA solo sugiere; no ejecuta cambios.
 - Media pública requiere URL en Storage (no blobs locales).
 - Moderación ligera con umbrales 3/5.
 
 ## 3. Componentes del sistema
 - **Modelo de datos**: SpotContribution, SpotVersion, SpotMediaPublic, SpotReport, UserStats/TrustScore.
 - **Validaciones**: identidad, contexto, payload mínimo, evidencia de media.
 - **Applier**: validación, aplicación, versionado y auditoría.
 - **Permisos**: nuevo/creciente/confiable según contribuciones aplicadas.
 - **UI impactada**: Create/Edit Spot, Spot Detail (acciones), Profile (estado/feedback).
 
 ## 4. Plan de ejecución por fases
 
 ### Fase 1 — Datos y contratos
 - Confirmar campos canónicos y estados mínimos de SpotContribution.
 - Alinear payloads de contribución con tipos permitidos V1.
 - **Qué NO se toca**: creación directa de Spot, rollback comunitario.
 - Validaciones: status permitidos, payload consistente, spotId opcional en creación.
 
 ### Fase 2 — Applier y versionado
 - Garantizar que toda contribución aplicada genera SpotVersion.
 - Reglas de rechazo/aplicación determinísticas.
 - Auditar cada aplicación (contribution + versión).
 
 ### Fase 3 — Permisos y UX mínima
 - Aplicar TrustScore interno a permisos por tipo.
 - Mensajería UX por etapa (nuevo/creciente/confiable).
 - Asegurar feedback “pendiente/aplicada/rechazada”.
 
 ### Fase 4 — Media pública
 - Validar URL pública en Storage antes de aceptar media.
 - Conectar flujo de SpotMediaPublic y reportes.
 - Respetar umbrales de moderación (3/5).
 
 ### Fase 5 — Métricas operativas
 - Registrar: aplicadas, rechazadas, backlog, tiempo de aplicación.
 - Exponer métricas base para Admin.
 
 ## 5. Checklist de validación
 - Toda edición crea SpotContribution; nunca actualiza Spot directo.
 - Applier genera SpotVersion en todas las aplicaciones.
 - Media pública requiere URL en Storage.
 - Permisos respetan TrustScore (nuevo/creciente/confiable).
 - Reportes crean SpotReport y aplican umbrales canónicos.
 
 ## 6. Riesgos técnicos conocidos
 - Backlog operativo si el applier no escala.
 - Rechazos excesivos si validaciones son demasiado estrictas.
 - Dependencia de Storage para media pública.
 
 ## 7. Qué NO hacer (prohibiciones explícitas)
 - Bypass temporal al sistema de contributions.
 - Auto-aprobaciones complejas fuera del applier canónico.
 - Refactors de modelo fuera del scope V1.
