 # FLOWYA V2.0 — Initiatives Dependency Map
 
 ## Mapa de dependencias (fuerte vs debil)
 
 | Iniciativa | Dependencias fuertes | Dependencias debiles | Si se cambia el orden, que se rompe |
 |---|---|---|---|
 | Location System | MODELO_DATOS, decisiones canonicas de regionId | Search, IA | Inconsistencias de filtro, IA y UX de "cerca de ti". |
 | Image Loading System | Storage canonico, Contribution System | Admin (moderacion de media) | UX inconsistente y media no persistente. |
 | Critical Bugs Fix Plan | Contribution + Storage + IA asistente | Image System | Bloquea confiabilidad de edicion, IA y media. |
 | Contribution System V1 | MODELO_DATOS, Applier, Moderacion | Trust/Perfil, Admin | No hay flujo canonico ni calidad de datos. |
 | Admin System | Contribution System, Moderacion | AI Coverage, Translation | Backlog sin control y sin auditoria. |
 | AI Coverage System | Location System, Admin System | Contribution System | Generacion sin control y sin revision. |
 | Translation System | MODELO_DATOS, Admin System | Search, IA | UX bilingue inconsistente y deuda de contenido. |
 
 ## Dependencias transversales
 - Ubicacion canonica es prerequisito para Search, Home, AI Coverage y ordenamiento por distancia.
 - Contributions es prerequisito para moderacion, Admin, versionado y TrustScore.
 - Admin habilita escalabilidad operativa y controla IA Coverage y Traduccion.
 - Image/Storage es prerequisito para contributions con media y para calidad de UX.
 
 ## Fricciones futuras previsibles
 - Ubicacion: divergencia entre regionId y datos legacy si se retrasa su persistencia.
 - Media: pipeline incompleto provoca experiencias rotas y soporte manual.
 - Admin: crecimiento de colas sin reglas de priorizacion y SLA.
 - Translation: backlog sin responsables ni politica de fallback.
 
 ## Decisiones pendientes del founder (dependencias criticas)
 - RegionId final y politicas de fallback (Location System).
 - Filtro Map: regionId vs viewport como prioridad.
 - Politica de revision de traducciones (SLA y responsables).
 - Umbrales y cooldown de AI Coverage.
