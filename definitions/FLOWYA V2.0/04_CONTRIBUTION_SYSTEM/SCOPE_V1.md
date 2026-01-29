 # Scope V1 — Contribution System
 
 ## Objetivo del V1
 Establecer el flujo canonico de contribuciones con permisos progresivos y criterios claros de validez, garantizando calidad y trazabilidad.
 
 ## Incluido en V1 (SI)
 - Flujo canonico: SpotContribution -> applier -> SpotVersion -> Spot.
 - Tipos de contribucion V1: edicion de texto, fotos publicas, mover ubicacion, reportes, crear spot.
 - Reglas minimas de validacion y evidencia (URL publica en storage para media).
 - TrustScore interno con niveles: nuevo, creciente, confiable.
 - Permisos progresivos alineados a TrustScore.
 - Metricas base: contribuciones aplicadas, tasa de aceptacion, backlog.
 
 ## Fuera de alcance V1 (NO)
 - Auto-aprobacion o moderacion automatica compleja.
 - Sistemas de reputacion avanzados o gamificacion.
 - Tipos de contribucion nuevos no definidos (ej: bulk edits).
 - Integraciones externas de contenido o fuentes legacy.
 
 ## Decisiones ya tomadas (congeladas)
 - No hay edicion directa de Spot desde UI.
 - Pins son privados y no modifican Spot.
 - IA solo sugiere, nunca ejecuta acciones.
 - Media publica requiere storage y evidencia valida.
 
 ## Decisiones pendientes post-V1
 - Ajuste fino de permisos por TrustScore con datos reales.
 - Politica de rechazo y reintento para contribuciones fallidas.
 - Expansion de tipos de contribucion.
 - Evaluar peso diferencial de contribuciones IA vs humanas.
 
 ## Riesgos aceptados en V1
 - Backlog de contribuciones si la revision humana no escala.
 - Friccion inicial para usuarios nuevos por reglas estrictas.
