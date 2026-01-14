# Plan de Arquitectura y Documentación FLOWYA v1.4

## Contexto y Herencia

### Estado de v1.3 (Cerrada)

- v1.3 está cerrada como versión estable con Fase 1 y Fase 2 completadas
- Documentación canónica en `definitions/FLOWYA V1.3/`
- Arquitectura base estabilizada y lista para producción
- **Referencia:** `definitions/FLOWYA V1.3/CIERRE_VERSION_V1_3.md`

### Herencia de v1.3

V1.4 hereda completamente:
- ✅ Arquitectura de persistencia multi-usuario (Supabase)
- ✅ Sistema de ownership y aislamiento de datos
- ✅ Estrategia offline-first con sincronización
- ✅ Comportamiento del Diario en Spot Detail
- ✅ Todas las decisiones canónicas de V1.3

**NO se modifica:**
- Arquitectura base de persistencia
- Modelo conceptual canónico (heredado de V1.2)
- Sistema de Pins y estados
- Comportamiento del Diario

## Objetivo v1.4

Implementar las fases pendientes de V1.3:
- Sistema de Compartir completo
- Internacionalización (i18n)
- Seguridad y Permisos avanzados

Manteniendo la arquitectura base estable de V1.3.

## Estructura de Documentación

### 1. Carpeta Base
- `definitions/FLOWYA V1.4/` (nueva carpeta)

### 2. Documentos Principales

#### 2.1 BITACORA_V1_4.md
- Referenciar explícitamente cierre de V1.3
- Indicar qué se hereda, qué se extiende y qué es nuevo
- Referencias cruzadas a documentos clave de V1.3
- Formato similar a BITACORA_V1_3.md

#### 2.2 ARQUITECTURA_V1_4.md
- Hereda arquitectura base de V1.3
- Extiende con:
  - Sistema de compartir (tabla `shared_maps`)
  - Arquitectura de i18n
  - Mejoras de seguridad
- Mantiene estrategia offline-first

#### 2.3 MODELO_DATOS_V1_4.md
- Hereda modelo de datos de V1.3
- Extiende con:
  - Tabla `shared_maps`
  - Estructura de traducciones
- Mantiene modelo conceptual canónico

#### 2.4 ROADMAP_TECNICO_V1_4.md
- Incluye SOLO fases pendientes de V1.3:
  - Fase 3: Sistema de Compartir
  - Fase 4: Internacionalización
  - Fase 5: Seguridad y Permisos
- Marca claramente qué viene de V1.3

#### 2.5 DECISIONES_CANONICAS_V1_4.md
- Decisiones heredadas de V1.3 (referencia, no duplicación)
- Nuevas decisiones para V1.4
- Sección "Por definir" para decisiones futuras

#### 2.6 Documentos de Control
- Copiar documentos de V1.3 marcados como "pendientes de revisión"
- Actualizar referencias de V1.3 a V1.4
- Mantener contenido original para referencia

## Qué se Hereda

### Arquitectura Base
- ✅ Esquema Supabase (tablas `pins`, `spots`)
- ✅ Row Level Security (RLS)
- ✅ Estrategia offline-first
- ✅ Sincronización local ↔ servidor
- ✅ Sistema de ownership

### Funcionalidades
- ✅ Autenticación con Supabase
- ✅ Persistencia de Pins
- ✅ Comportamiento del Diario
- ✅ Compartir mapas básico (URLs compartidas)

### Decisiones Canónicas
- ✅ Todas las decisiones de V1.3 están congeladas
- ✅ Referencia a V1.3 para decisiones heredadas

## Qué se Extiende

### Sistema de Compartir
- Tabla `shared_maps` en Supabase
- Modal de selección de usuarios
- Diferenciación visual de pines
- Sistema de permisos y revocación

### Internacionalización
- Arquitectura de traducción (i18n)
- Soporte para Español e Inglés
- Traducción de UI y world content

### Seguridad
- Análisis completo de riesgos
- Mitigaciones avanzadas
- Auditoría de seguridad

## Qué se Mantiene Estable

- ✅ Arquitectura base de persistencia
- ✅ Modelo conceptual canónico (V1.2)
- ✅ Sistema de Pins y estados
- ✅ Comportamiento del Diario
- ✅ Estrategia offline-first
- ✅ Todas las decisiones de V1.3

## Reglas Estrictas

1. NO modificar arquitectura base de V1.3
2. NO modificar documentación de V1.3 (congelada)
3. NO hacer refactors de código base
4. NO mezclar documentación entre versiones
5. Priorizar claridad, trazabilidad y escalabilidad
6. Referenciar explícitamente herencia de V1.3

## Próximos Pasos

1. Usuario revisa y aprueba plan
2. Crear estructura de carpetas V1.4
3. Generar documentos base
4. Implementar Fase 3 (Sistema de Compartir)
5. Implementar Fase 4 (Internacionalización)
6. Implementar Fase 5 (Seguridad y Permisos)
7. Validar referencias cruzadas
8. Revisión final de completitud

---

**Última actualización:** 2026-01-11  
**Estado:** Plan inicial definido, heredando de V1.3
