 # Implementation Plan — AI Coverage System (V1)
 
 ## 1. Objetivo tecnico del V1
 Generar cobertura base en zonas con baja densidad de spots, manteniendo estado no canonico y control operativo con cooldown y trazabilidad.
 
 ## 2. Principios tecnicos congelados
 - IA genera pero no canoniza; requiere revision humana.
 - Activacion solo por intencion confirmada (no por pan/zoom continuo).
 - Cooldown por usuario y por bbox es obligatorio.
 - Spots AI visibles pero marcados como no canonicos.
 
 ## 3. Componentes del sistema
 - **Deteccion de baja cobertura**: umbral de spots por bbox.
 - **Generacion controlada**: 8 a 10 spots max.
 - **Estado intermedio**: flag AI y fuente.
 - **Admin log**: source, reason, session, bbox.
 - **Loader narrativo**: cancelable con fallback.
 
 ## 4. Plan de ejecucion por fases
 
 ### Fase 1 — Contratos y estado AI
 - Definir flags de estado no canonico en spots AI.
 - Registrar metadata AI (source, reason, session, bbox).
 
 ### Fase 2 — Activacion y umbral
 - Activar solo por intencion confirmada.
 - Umbral de baja cobertura configurado.
 - Cooldown por usuario y bbox.
 
 ### Fase 3 — Generacion y distribucion
 - Generar 8-10 spots max.
 - Distribucion basica dentro de bbox.
 
 ### Fase 4 — UI y loader
 - Loader narrativo con cancelacion.
 - Fallback de error sin bloqueo.
 
 ### Fase 5 — Registro admin
 - Registrar eventos AI en Admin.
 - No canonizar automaticamente.
 
 ## 5. Checklist de validacion
 - No activacion por pan/zoom continuo.
 - Cooldown por usuario y bbox aplicado.
 - Spots AI marcados no canonicos.
 - Registro completo en Admin.
 - Loader cancelable y fallback estable.
 
 ## 6. Riesgos tecnicos conocidos
 - Sobre-generacion por umbral agresivo.
 - Ruido si la revision humana no escala.
 
 ## 7. Que NO hacer (prohibiciones explicitas)
 - No canonizar automaticamente.
 - No generar fuera de actividad del usuario.
 - No usar imagenes IA como contenido principal.
