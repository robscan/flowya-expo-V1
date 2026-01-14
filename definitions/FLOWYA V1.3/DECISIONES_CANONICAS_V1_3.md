# DECISIONES CANÓNICAS — FLOWYA V1.3

**Versión:** FLOWYA V1.3  
**Fecha de inicio:** 2026-01-11  
**Estado:** ✅ Cerrada

---

## PROPÓSITO DE ESTE DOCUMENTO

Este documento es la **ÚNICA FUENTE DE VERDAD** para todas las decisiones de producto y técnicas de FLOWYA V1.3.

**IMPORTANTE:**
- Otros documentos de V1.3 **referencian** este documento, no duplican decisiones
- Todas las decisiones deben tener trazabilidad a V1.2 cuando aplique
- Trade-offs y alternativas evaluadas deben documentarse explícitamente

---

## FORMATO DE DECISIÓN

Cada decisión debe incluir:
- **ID de Decisión** (ej. D-V1.3-01)
- **Fecha**
- **Tipo**: Producto / Técnica / Arquitectura
- **Contexto**: Qué problema resuelve
- **Decisión**: Qué se decide hacer
- **Justificación**: Por qué se toma esta decisión
- **Alternativas evaluadas**: Qué otras opciones se consideraron
- **Trade-offs**: Qué se gana y qué se pierde
- **Trazabilidad V1.2**: Referencia a decisiones de V1.2 si aplica
- **Impacto**: Qué documentos/código afecta

---

## DECISIONES HEREDADAS DE V1.2 (NO MODIFICABLES)

### D-V1.2-01: Modelo Conceptual de Pin
**Tipo:** Producto  
**Estado:** Heredado de V1.2, NO modificable en V1.3

**Decisión:**
- Pin es relación personal User ↔ Spot
- Estados: `to_visit` | `visited`
- Pin reemplaza "Save" y "Like"

**Referencia V1.2:** `DEFINICION_SISTEMA_PINS_VISITED_DIARIO_V1.2.md`

**Impacto V1.3:**
- Modelo de datos debe respetar esta estructura
- API y esquemas de base de datos deben reflejar este modelo

---

### D-V1.2-02: Comportamiento de Nearby Places
**Tipo:** Producto  
**Estado:** Heredado de V1.2, NO modificable en V1.3

**Decisión:**
- Nearby Places SIEMPRE visible cuando hay spots cercanos
- NO filtra por estado de Pin (to_visit / visited)
- Es sección contextual de viaje, no editorial

**Referencia V1.2:** `BITACORA_V1_2.md` - Ajuste 07

**Impacto V1.3:**
- Home rediseñado debe mantener este comportamiento
- Lógica de filtrado debe respetar esta regla

---

### D-V1.2-03: Cambio de Pin NO mueve cards inmediatamente
**Tipo:** UX  
**Estado:** Heredado de V1.2, NO modificable en V1.3

**Decisión:**
- El cambio de Pin NO mueve cards inmediatamente
- Cards mantienen posición durante sesión actual
- Reclasificación ocurre solo tras refresh o al reentrar a la vista

**Referencia V1.2:** `BITACORA_V1_2.md` - Ajuste 06

**Impacto V1.3:**
- UX de Home debe mantener este comportamiento
- Sincronización no debe causar reordenamiento inmediato

---

## DECISIONES NUEVAS DE V1.3

### D-V1.3-01: Persistencia Server-Side con Supabase
**Tipo:** Arquitectura  
**Fecha:** 2026-01-11  
**Estado:** Propuesta

**Contexto:**
- V1.2 usa AsyncStorage local
- V1.3 requiere multi-usuario y compartir
- Necesidad de sincronización entre dispositivos

**Decisión:**
- Usar Supabase como backend para persistencia
- Migrar Pins, Estados y Diario a Supabase
- Mantener cache local para offline-first

**Justificación:**
- Supabase ya está integrado (AuthContext)
- Soporte nativo para autenticación y RLS (Row Level Security)
- Real-time subscriptions para sincronización
- Generous free tier para desarrollo

**Alternativas evaluadas:**
1. **Firebase**: Más complejo, menos flexible para queries
2. **Backend propio**: Requiere infraestructura y mantenimiento
3. **Solo local**: No soporta multi-usuario ni compartir

**Trade-offs:**
- ✅ Multi-usuario y compartir habilitados
- ✅ Sincronización automática
- ⚠️ Requiere conexión a internet (mitigado con offline-first)
- ⚠️ Dependencia de servicio externo

**Trazabilidad V1.2:**
- Extiende persistencia local de V1.2
- No modifica modelo conceptual

**Impacto:**
- `MODELO_DATOS_V1_3.md`: Esquemas Supabase
- `ARQUITECTURA_V1_3.md`: Estrategia de sincronización
- `ROADMAP_TECNICO_V1_3.md`: Fase 1 bloqueante

---

### D-V1.3-02: Estrategia Offline-First
**Tipo:** Arquitectura  
**Fecha:** 2026-01-11  
**Estado:** Propuesta

**Contexto:**
- Usuarios pueden estar sin conexión
- Necesidad de funcionalidad offline
- Sincronización diferida cuando hay conexión

**Decisión:**
- Cache local como fuente primaria de lectura
- Escritura local inmediata, sincronización diferida
- Queue de operaciones pendientes para sync
- Resolución de conflictos: Last-Write-Wins con timestamp

**Aclaración sobre Timestamps:**
- **Con conexión:** Timestamp usado para resolución de conflictos es server-generated (Supabase)
- **Modo offline:** Se utiliza timestamp generado por el cliente, que será reconciliado al sincronizar
- **Estrategia:** Last-Write-Wins se mantiene, usando el timestamp apropiado según el contexto
- **Objetivo:** Evitar ambigüedad futura por desalineación de relojes entre dispositivos

**Justificación:**
- Mejor UX: respuestas inmediatas
- Funcionalidad offline completa
- Sincronización automática cuando hay conexión

**Alternativas evaluadas:**
1. **Online-only**: Requiere conexión constante (mala UX)
2. **Sync inmediato**: Latencia alta, requiere conexión
3. **Optimistic updates**: Similar pero más complejo

**Trade-offs:**
- ✅ Funcionalidad offline completa
- ✅ UX fluida sin esperas
- ⚠️ Complejidad de resolución de conflictos
- ⚠️ Posible pérdida de datos si no hay sync (mitigado con queue persistente)

**Trazabilidad V1.2:**
- Extiende persistencia local de V1.2
- Mantiene comportamiento local como base

**Impacto:**
- `ARQUITECTURA_V1_3.md`: Estrategia offline-first
- `MODELO_DATOS_V1_3.md`: Cache local y queue
- `ROADMAP_TECNICO_V1_3.md`: Fase 1 bloqueante

---

### D-V1.3-03: Home como "Estado del Viaje"
**Tipo:** Producto  
**Fecha:** 2026-01-11  
**Estado:** Fuera de alcance Fase 2

**Contexto:**
- Home actual muestra secciones editoriales (New, For You, etc.)
- Necesidad de mostrar estado personal del viaje
- Claridad entre contenido editorial vs personal

**Decisión:**
- Rediseñar Home como "estado del viaje" con secciones:
  1. **Nearby** (contextual, no filtrado por estado)
  2. **To Visit** (slider, orden: más reciente → más antiguo)
  3. **Visited** (slider, orden: más reciente → más antiguo)
  4. **Discover / Gems** (solo spots no pineados)

**Justificación:**
- Claridad: usuario ve su estado personal primero
- Ordenamiento temporal: más reciente primero
- Separación clara: editorial vs personal

**Alternativas evaluadas:**
1. **Mantener Home actual**: No refleja estado personal
2. **Home solo personal**: Pierde descubrimiento editorial
3. **Tabs separados**: Más navegación, menos contexto

**Trade-offs:**
- ✅ Claridad de estado personal
- ✅ Ordenamiento temporal intuitivo
- ⚠️ Menos espacio para contenido editorial (mitigado con Discover/Gems)

**Trazabilidad V1.2:**
- Respeta D-V1.2-02 (Nearby siempre visible)
- Respeta D-V1.2-03 (cambio de Pin no mueve cards)

**Nota sobre Alcance:**
- **Esta decisión está fuera del alcance de Fase 2.**
- Home permanece con su estructura actual (secciones editoriales).
- Esta decisión puede implementarse en una fase posterior.

**Impacto:**
- `UX_HOME_V1_3.md`: Rediseño completo (referencia futura)
- `ROADMAP_TECNICO_V1_3.md`: No incluido en Fase 2

---

### D-V1.3-04: Diario siempre visible en Spot Detail
**Tipo:** Producto  
**Fecha:** 2026-01-11  
**Estado:** ✅ Implementada

**Contexto:**
- Diario actual solo visible si Pin tiene estado `visited`
- Necesidad de claridad sobre funcionalidad del Diario

**Decisión:**
- Diario siempre visible en Spot Detail
- Al escribir, activa automáticamente el estado `visited`
- `visitedAt` visible como metadata temporal

**Justificación:**
- Claridad: usuario entiende que puede escribir diario
- Flujo natural: escribir → marcar como visited
- Metadata temporal útil para contexto

**Alternativas evaluadas:**
1. **Mantener actual**: Solo visible si visited (menos claro)
2. **Siempre editable**: Confusión si no está visited

**Trade-offs:**
- ✅ Claridad de funcionalidad
- ✅ Flujo natural de escritura
- ⚠️ Puede confundir si no está visited (mitigado con indicador visual)

**Aclaración sobre visitedAt:**
- **Editar entrada de Diario NO modifica `visitedAt`**
- `visitedAt` representa únicamente la primera vez que el usuario marca un spot como `visited`
- Este comportamiento está congelado y no debe reinterpretarse en el futuro

**Trazabilidad V1.2:**
- Extiende funcionalidad de Diario de V1.2
- No modifica modelo conceptual
- Respeta comportamiento de `visitedAt` documentado en `BITACORA_V1_2.md` - Cierre 02

**Impacto:**
- `UX_HOME_V1_3.md`: Comportamiento del Diario (Sección "Comportamiento del Diario")
- `ROADMAP_TECNICO_V1_3.md`: Fase 2 (solo comportamiento del Diario)
- `app/spot-detail.tsx`: Implementación del Diario siempre visible

---

### D-V1.3-05: Sistema de Compartir Mapas
**Tipo:** Producto  
**Fecha:** 2026-01-11  
**Estado:** Propuesta

**Contexto:**
- V1.2 tiene compartir básico (solo mensaje)
- V1.3 requiere compartir real entre usuarios
- Necesidad de ver mapas de otros usuarios

**Decisión:**
- Sistema completo para compartir mapas entre usuarios
- Vista de pines de otro usuario (to_visit / visited)
- Modo lectura (no editable)
- Diferenciación clara entre pines propios y compartidos
- Opción de agregar pines compartidos a cuenta propia

**Justificación:**
- Feature real de compartir (no solo mensaje)
- Permite colaboración entre usuarios
- Base para features sociales futuras

**Alternativas evaluadas:**
1. **Solo mensaje**: No permite ver mapas compartidos
2. **Editable**: Riesgo de modificación no deseada
3. **Solo lectura con copia**: Balance entre seguridad y utilidad

**Trade-offs:**
- ✅ Feature real de compartir
- ✅ Colaboración entre usuarios
- ⚠️ Complejidad de permisos y seguridad
- ⚠️ Requiere backend (Supabase)

**Trazabilidad V1.2:**
- Extiende funcionalidad de compartir de V1.2
- No modifica modelo conceptual

**Impacto:**
- `SISTEMA_COMPARTIR_V1_3.md`: Diseño completo
- `SEGURIDAD_V1_3.md`: Permisos y revocación
- `ROADMAP_TECNICO_V1_3.md`: Fase 3

---

### D-V1.3-06: Internacionalización (i18n)
**Tipo:** Arquitectura  
**Fecha:** 2026-01-11  
**Estado:** Propuesta

**Contexto:**
- V1.2 solo en Español
- Necesidad de soportar múltiples idiomas
- Preparación para escalar

**Decisión:**
- Arquitectura de traducción para Español e Inglés inicialmente
- Preparar sistema para escalar a más idiomas
- Traducir: UI, world content (Spots, Flows)
- NO traducir: Diario del usuario (contenido personal)

**Justificación:**
- Alcance internacional
- Escalabilidad para futuros idiomas
- Separación clara: contenido público vs personal

**Alternativas evaluadas:**
1. **Solo Español**: Limita alcance
2. **Todo traducido**: Diario personal no debe traducirse
3. **Solo UI**: World content también debe traducirse

**Trade-offs:**
- ✅ Alcance internacional
- ✅ Escalabilidad
- ⚠️ Complejidad de gestión de traducciones
- ⚠️ Requiere estructura de archivos y procesos

**Trazabilidad V1.2:**
- Nueva funcionalidad (V1.2 solo Español)

**Impacto:**
- `INTERNACIONALIZACION_V1_3.md`: Arquitectura completa
- `ROADMAP_TECNICO_V1_3.md`: Fase 4

---

## PRÓXIMAS DECISIONES

Las decisiones se agregarán conforme se documenten y validen durante el desarrollo de V1.3.

---

## DECISIONES FUTURAS FUERA DEL ALCANCE DE V1.3

Esta sección documenta decisiones conocidas pero **NO resueltas** en V1.3. Se incluyen únicamente para trazabilidad futura y anticipar debates sin abrir alcance en esta versión.

**IMPORTANTE:**
- Estas decisiones **NO forman parte del alcance de V1.3**
- Se documentan solo para referencia futura
- No deben implementarse ni considerarse como requisitos de V1.3

### Decisiones Pendientes Identificadas

1. **Eliminación definitiva de estado local legacy**
   - V1.3 mantiene compatibilidad temporal con campos legacy (`savedSpots`, `likedSpots`)
   - Decisión pendiente: Cuándo y cómo eliminar completamente estos campos
   - Impacto: Limpieza de código y simplificación de modelo

2. **Borrado de cuenta y efectos sobre datos persistidos**
   - Decisión pendiente: Qué sucede con datos del usuario al eliminar cuenta
   - Consideraciones: Pines, notas, fotos, mapas compartidos
   - Impacto: Cumplimiento GDPR, experiencia de usuario

3. **Versionado y actualización de Spots del mundo**
   - Decisión pendiente: Cómo manejar actualizaciones de Spots públicos
   - Consideraciones: Conflictos con contenido generado por usuarios, historial de cambios
   - Impacto: Gestión de contenido world, integridad de datos

4. **Estrategia de backup y recuperación de datos**
   - Decisión pendiente: Cómo permitir a usuarios hacer backup de sus datos
   - Consideraciones: Formato de exportación, frecuencia, restauración
   - Impacto: Experiencia de usuario, cumplimiento de privacidad

5. **Límites y cuotas de uso**
   - Decisión pendiente: Límites de pins, fotos, notas por usuario
   - Consideraciones: Escalabilidad, costos de almacenamiento, experiencia premium
   - Impacto: Modelo de negocio, arquitectura de almacenamiento

**Nota:** Estas decisiones se resolverán en versiones futuras (V1.4, V2.0, etc.) según prioridades de producto y necesidades del negocio.

---

**Última actualización:** 2026-01-11  
**Estado:** ✅ Cerrada - Decisiones congeladas al cierre de V1.3

---

## Decisiones Congeladas al Cierre de V1.3

**Fecha de cierre:** 2026-01-11  
**Versión:** FLOWYA V1.3

### Confirmación de Congelamiento

- ✅ **No se aceptan nuevas decisiones en esta versión:** Todas las decisiones documentadas están congeladas
- ✅ **Decisiones documentadas:** Todas las decisiones de V1.3 (D-V1.3-01 a D-V1.3-04) están finalizadas
- ✅ **Trazabilidad mantenida:** Todas las decisiones tienen referencias a V1.2 cuando aplica
- ✅ **Referencia a V1.4:** Nuevas decisiones se documentarán en `definitions/FLOWYA V1.4/DECISIONES_CANONICAS_V1_4.md`

### Decisiones Finales de V1.3

**Decisiones implementadas:**
- D-V1.3-01: Estrategia de Persistencia (offline-first con Supabase)
- D-V1.3-02: Estrategia de Sincronización (Last-Write-Wins)
- D-V1.3-03: Home como "Estado del Viaje" (fuera de alcance Fase 2, diferida a V1.4)
- D-V1.3-04: Diario siempre visible en Spot Detail (implementada en Fase 2)

**Decisiones diferidas a V1.4:**
- D-V1.3-05: Sistema de Compartir (trasladada a V1.4)
- D-V1.3-06: Internacionalización (trasladada a V1.4)

### Notas Finales

- Todas las decisiones de V1.3 están documentadas y congeladas
- No se aceptarán modificaciones a decisiones existentes
- Nuevas decisiones se registrarán en V1.4
- Referencia a V1.4: `definitions/FLOWYA V1.4/DECISIONES_CANONICAS_V1_4.md`
