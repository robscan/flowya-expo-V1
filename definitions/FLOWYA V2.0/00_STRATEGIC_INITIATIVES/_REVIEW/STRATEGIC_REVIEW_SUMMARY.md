 # FLOWYA V2.0 — Strategic Review Summary
 
 ## Evaluacion general del set de iniciativas
 El set es coherente y esta bien anclado a decisiones canonicas (contributions, moderacion ligera, IA asistente, pins privados). Las iniciativas cubren los pilares fundacionales clave: ubicacion, imagenes, contribuciones, admin, IA y traduccion. El principal riesgo no es la falta de piezas, sino el orden y la dependencia operativa entre sistemas que requieren datos consistentes, governance y capacidad de revision humana.
 
 ## Fortalezas que deben protegerse
 - Canon claro: SpotContribution + applier + SpotVersion como unica via de cambio publico.
 - Moderacion ligera con umbrales estables y sin ocultamiento automatico de spots.
 - Separacion estricta entre mundo publico (Spots) y diario privado (Pins).
 - IA como asistente, nunca ejecuta cambios.
 - Idioma canonico ES definido para evitar deriva.
 - Location system con regionId canonico y distincion region vs area.
 
 ## Riesgos estrategicos visibles
 - Dependencia fuerte de calidad de ubicacion y regionId: cualquier inconsistencia rompe Home, Search y IA.
 - Riesgo de sobre-generacion (AI Coverage) y fatiga operativa si el Admin Panel no absorbe el backlog.
 - Riesgo de deuda tecnica si Image/Storage pipeline no se formaliza antes de contribuciones con media.
 - Translation system requiere governance y revision; sin esto se genera ruido de UX y deuda de contenidos.
 - Critical Bugs plan mezcla fixes tacticos con sistemas fundacionales; si se ejecuta tarde, contamina V1.
 
 ## Faltantes o aclaraciones necesarias
 - Definir politicas de data quality para ubicacion (regionId y validacion) como prerrequisito operativo, no como detalle tecnico.
 - Definir limites operativos de IA (costos, frecuencia, TTL, control de calidad) ligados a Admin.
 - Alinear permisos progresivos del perfil con el sistema de contributions (criterios de confianza y efectos en UX).
 - Definir politica explicita de traduccion: revision, SLA y fallback en UX (evitar mezcla de idiomas).
 
 ## Sobre-ingenieria detectada (o riesgo de ella)
 - Translation system completo antes de validar traccion internacional. Debe iniciar con MVP acotado.
 - AI Coverage con 8-10 spots por bbox y estados intermedios si no hay pipeline de revision estable.
 - Persistir CanonicalArea como dato operativo antes de probar el valor analitico.
 
 ## Respuestas a preguntas clave
 - El set de iniciativas es completo: Si, cubre los sistemas fundacionales. Falta explicitar gobernanza operativa (revision, costos IA, calidad de datos) como criterios transversales.
 - Iniciativas mal ordenadas: AI Coverage y Translation no deben ejecutarse antes de tener Location + Contribution + Admin maduros.
 - Iniciativas a dividir o fusionar: el pipeline de media (storage y URL estable) debe estar dentro de Contribution/Image como sub-sistema unico; evitar que quede disperso en bugs.
 - Riesgos de sobre-generacion: AI Coverage sin thresholds y cooldown estrictos.
 - Riesgos de fatiga de admin: backlog de contributions, reportes y AI Coverage sin reglas de priorizacion.
 - Riesgos de deuda tecnica futura: ubicacion canonica no persistida y traduccion sin versionado.
 - Decisiones bien tomadas a proteger: moderacion ligera, IA asistente, pins privados, no edicion directa, idioma canonico ES.
 - NO deberia implementarse todavia: expansion multi-idioma mas alla de EN; persistencia de CanonicalArea; AI Coverage masiva sin panel operativo.
 - Requieren MVP muy acotado: Translation, AI Coverage, Admin (colas minimas).
 - Deben esperar datos reales: ajustes de umbral de "cerca de ti", dinamica de activacion de AI Coverage, politicas de permisos por trust.
 
 ## Veredicto global
 El set es solido y coherente, pero depende de un orden estricto y de governance operativa. Con un MVP acotado para Traduccion y AI Coverage, y con Ubicacion + Contributions + Admin estabilizados primero, el roadmap es ejecutable sin retrabajo.
