 # FLOWYA V2.0 — Risks and Mitigations
 
 ## Riesgos clave y mitigaciones
 
 | Riesgo | Impacto | Probabilidad | Mitigacion recomendada |
 |---|---|---|---|
 | Inconsistencia de ubicacion canonica (regionId vs legacy) | Alto (Home/Search/IA se vuelven incoherentes) | Alta | Persistir regionId canonico al aplicar contribuciones; bloquear fallbacks permanentes. |
 | Sobre-generacion de AI Coverage | Alto (ruido, costos, perdida de confianza) | Media | Thresholds estrictos, cooldown por bbox, y control en Admin antes de canonizar. |
 | Fatiga de admin por backlog | Alto (operacion lenta, UX degradada) | Alta | Priorizacion de colas, limites de volumen, SLA y roles claros. |
 | Pipeline de media incompleto | Alto (imagenes no persistentes, UX rota) | Alta | Definir storage y URLs estables como prerequisito de contributions con media. |
 | Traduccion sin governance | Medio/Alto (UX inconsistente, deuda) | Alta | MVP de traduccion con revision minima y politica de fallback. |
 | Deuda tecnica por mezclar fixes tacticos con sistemas | Medio | Media | Orden estricto: primero sistemas fundacionales, luego fixes. |
 | TrustScore y permisos no alineados a comportamiento real | Medio | Media | Ajuste basado en datos reales y reglas simples al inicio. |
 | IA contamina contenido humano | Alto (perdida de credibilidad) | Media | Etiquetado claro, separacion de estados y aprobacion humana. |
 | Dificultad de internacionalizacion temprana | Medio | Media | Limitar idiomas a ES/EN con reglas de versionado y fallback. |
 | Ambiguedad en “cerca de ti” y filtros | Medio | Media | Definir umbral canonico fijo para V1 y medir antes de optimizar. |
 
 ## Decisiones pendientes del founder con riesgo asociado
 - RegionId final y politica de fallback: riesgo de migracion y colisiones.
 - Prioridad Map (regionId vs viewport): riesgo de percepcion de falta de spots.
 - Politica de revision de traducciones: riesgo de mezcla de idiomas.
 - Politica de indexacion de Search por idioma: riesgo de resultados inconsistentes.
 - Umbral y TTL de AI Coverage: riesgo de costos y saturacion de admin.
 
 ## Oportunidades futuras (NO IMPLEMENTAR AUN)
 - Persistencia de CanonicalArea para analitica avanzada.
 - Expansion de idiomas mas alla de EN.
 - Automatizacion parcial de moderation (solo con datos reales y validacion).
