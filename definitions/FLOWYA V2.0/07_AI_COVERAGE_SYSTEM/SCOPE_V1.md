 # Scope V1 — AI Coverage System
 
 ## Objetivo del V1
 Generar cobertura base en zonas con baja densidad de spots, sin contaminar el canon y con control operativo.
 
 ## Incluido en V1 (SI)
 - Activacion solo por actividad real del usuario y umbral de baja cobertura.
 - Generacion controlada (8 a 10 spots) con distribucion basica en bbox.
 - Estado intermedio no canonico con etiqueta AI.
 - Registro completo en Admin (source, reason, session, bbox).
 - Loader narrativo con cancelacion y fallback de error.
 - Cooldown por bbox y TTL definido para evitar repeticion.
 
 ## Fuera de alcance V1 (NO)
 - Auto-canonizacion sin revision humana.
 - Generacion masiva fuera de actividad del usuario.
 - Cobertura avanzada con optimizacion por demanda o costos.
 - Imagenes generadas por IA como contenido principal.
 
 ## Decisiones ya tomadas (congeladas)
 - IA genera, pero no canoniza; requiere revision humana.
 - Spots AI visibles pero marcados como no canonicos.
 - Activacion solo en baja cobertura.
 - La IA no se activa por pan/zoom continuo; solo por intencion confirmada.
 - Cooldown por usuario y por bbox es obligatorio en V1.
 
 ## Decisiones pendientes post-V1
 - Ajuste de umbral de activacion y TTL con datos reales.
 - Politica de conversion de AI a canonico (tasa objetivo).
 - Control de costos y limites diarios.
 
 ## Riesgos aceptados en V1
 - Sobre-generacion si el umbral es demasiado agresivo.
 - Ruido de contenido si la revision no escala.
