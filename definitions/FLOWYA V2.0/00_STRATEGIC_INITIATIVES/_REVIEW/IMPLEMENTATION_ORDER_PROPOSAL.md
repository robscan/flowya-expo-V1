 # FLOWYA V2.0 — Implementation Order Proposal (Cascada)
 
 ## Orden recomendado y justificacion
 
 1) **Location System (decisiones pendientes + persistencia canonica)**
    - Justificacion: es la base de filtros, Search, IA y percepcion de cobertura.
    - Desbloquea: coherencia de UX, calidad de datos y reglas de regionId.
 
 2) **Contribution System V1 + pipeline de media (storage)**
    - Justificacion: sin flujo canonico de edicion y media estable, todo lo demas se contamina.
    - Desbloquea: moderacion real, historial, TrustScore y contenido confiable.
 
 3) **Critical Bugs Fix Plan (solo los que bloquean canon)**
    - Justificacion: asegurar persistencia de media y consistencia de edicion antes de escalar.
    - Desbloquea: confiabilidad operativa y disminucion de soporte manual.
 
 4) **Admin System (colas minimas y auditoria)**
    - Justificacion: sin control operativo no hay forma de escalar contributions ni IA.
    - Desbloquea: governance, revision y SLA basico.
 
 5) **Image Loading System (unificacion UX)**
    - Justificacion: mejora experiencia y reduce deuda visual, pero requiere pipeline estable.
    - Desbloquea: consistencia de carga y placeholders globales.
 
 6) **Translation System (MVP acotado ES/EN)**
    - Justificacion: internacionalizacion gradual sin contaminar canon ES.
    - Desbloquea: expansion controlada y soporte bilingue.
 
 7) **AI Coverage System (MVP controlado)**
    - Justificacion: depende de ubicacion confiable, admin y politicas de costos.
    - Desbloquea: cobertura inicial en zonas sin datos reales.
 
 ## Que desbloquea cada etapa (resumen)
 - Location -> coherencia de datos y filtros.
 - Contributions + media -> integridad del canon y moderacion.
 - Critical bugs -> estabilidad base antes de escalar UX.
 - Admin -> control operativo y auditabilidad.
 - Image system -> UX consistente y performance.
 - Translation -> expansion internacional controlada.
 - AI Coverage -> crecimiento de cobertura sin romper calidad.
 
 ## Decisiones pendientes del founder (antes de iniciar cascada)
 - RegionId final y politica de fallback.
 - Prioridad de filtros en Map (regionId vs viewport).
 - Politica de revision de traducciones y SLA.
 - Umbrales y TTL de AI Coverage.
 
 ## NO IMPLEMENTAR AUN
 - Persistencia de CanonicalArea (hasta validar necesidad real).
 - Expansion de idiomas mas alla de EN.
 - Automatizaciones de moderacion mas alla de umbrales canonicos.
