 # Scope V1 — Critical Bugs
 
 ## Objetivo del V1
 Eliminar fallas que rompen el flujo canonico de contribuciones, media y UX basica, antes de cualquier expansion.
 
 ## Incluido en V1 (SI)
 - Persistencia de imagenes al editar Spot (upload a storage y URL publica estable).
 - Persistencia de fotos personales en Pins (upload a storage con soporte de sincronizacion).
 - Conexion de IA en edicion de Spot a flujo de generacion autorizado.
 - Uso de shortDescription en cards con fallbacks canonicos.
 - Accion de pin en card del mapa consistente con Home.
 
 ## Fuera de alcance V1 (NO)
 - Optimizaciones de performance no criticas.
 - Mejoras visuales o de UI no bloqueantes.
 - Nuevas features no ligadas a fallas canonicas.
 - Automatizaciones de moderacion.
 
 ## Decisiones ya tomadas (congeladas)
 - Media de usuarios vive en storage, no en URIs locales.
 - IA solo sugiere, no ejecuta cambios.
 - Cards deben reflejar shortDescription canonico.
- No se permiten cambios de arquitectura ni modelos; solo fixes puntuales.
 
 ## Decisiones pendientes post-V1
 - Politica de offline y reintentos de upload.
 - UX detallada de errores de storage por plataforma.
 
 ## Riesgos aceptados en V1
 - Dependencia operativa de storage y permisos.
 - Friccion temporal en flujos offline si la sincronizacion falla.
