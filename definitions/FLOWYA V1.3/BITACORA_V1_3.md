# BITÁCORA DE CAMBIOS — FLOWYA V1.3

**Fecha de inicio:** 2026-01-11  
**Versión:** FLOWYA V1.3  
**Estado:** En progreso

---

## PROPÓSITO DE ESTE DOCUMENTO

Esta bitácora registra todos los cambios realizados durante la arquitectura y documentación de FLOWYA V1.3, continuando el trabajo estable de V1.2.

**Referencias:**
- Bitácora anterior: `definitions/FLOWYA V1.2/BITACORA_V1_2.md`
- Product Definition: `definitions/FLOWYA V1.2/FLOWYA Product Definition V1.2.md`
- Modelo conceptual canónico: `definitions/FLOWYA V1.2/DEFINICION_SISTEMA_PINS_VISITED_DIARIO_V1.2.md`
- Estado final V1.2: `definitions/FLOWYA V1.2/PLAN_CIERRE_V1_2_QA_FIXES.md`
- Decisiones canónicas V1.3: `definitions/FLOWYA V1.3/DECISIONES_CANONICAS_V1_3.md`

---

## FORMATO DE REGISTRO (OBLIGATORIO)

**Cada entrada debe incluir:**
- **[ID de Tarea]** (ej. V1.3-01, V1.3-02)
- **Fecha**
- **Contexto del cambio** (qué problema resuelve)
- **Descripción del ajuste realizado**
- **Archivos tocados** (lista completa)
- **Archivos NO tocados** (decisiones explícitas de no modificar)
- **Riesgos considerados**
- **Referencias a decisiones canónicas** (enlace a DECISIONES_CANONICAS_V1_3.md)
- **Estado** (propuesto / aplicado / pendiente revisión)

**Objetivo:** Trazabilidad completa decisiones ↔ documentación sin ambigüedad.

---

## CONTEXTO DE V1.3

FLOWYA V1.3 transforma la aplicación de un producto local (v1.2) a un producto:
- **Multi-usuario**: Soporte para múltiples usuarios con datos aislados
- **Persistente**: Datos almacenados en servidor (Supabase)
- **Compartible**: Sistema completo para compartir mapas entre usuarios
- **Offline-ready**: Funcionalidad offline con sincronización diferida

### Herencia de V1.2 (NO MODIFICABLE)

El modelo conceptual de V1.2 es **canónico y NO debe modificarse**:

1. **Spot** (World content, público)
   - Entidad pública, compartida por todos los usuarios
   - Se crea con "Add Spot" (solo desde Mapa o Search)
   - Referencia: `DEFINICION_SISTEMA_PINS_VISITED_DIARIO_V1.2.md`

2. **Pin** (relación User ↔ Spot)
   - Relación personal entre usuario y Spot existente
   - Estados: `to_visit` | `visited`
   - Reemplaza "Save" y "Like"
   - Referencia: `DEFINICION_SISTEMA_PINS_VISITED_DIARIO_V1.2.md`

3. **Estados de Pin**
   - `to_visit`: "Quiero visitar este lugar"
   - `visited`: "Ya visité este lugar"
   - Comportamiento establecido en V1.2

4. **Diario de Viaje**
   - Notas personales opcionales para Pins con estado `visited`
   - Fotos personales opcionales
   - Siempre visible en Spot Detail si Pin tiene estado `visited`
   - Referencia: `DEFINICION_SISTEMA_PINS_VISITED_DIARIO_V1.2.md`

5. **Nearby Places**
   - SIEMPRE visible cuando hay spots cercanos
   - NO filtra por estado de Pin (to_visit / visited)
   - Sección contextual de viaje, no editorial
   - Referencia: `BITACORA_V1_2.md` - Ajuste 07

6. **Comportamiento de cambio de Pin**
   - El cambio de Pin NO mueve cards inmediatamente
   - Cards mantienen posición durante sesión actual
   - Reclasificación ocurre solo tras refresh o al reentrar a la vista
   - Referencia: `BITACORA_V1_2.md` - Ajuste 06

### Extensiones en V1.3 (NUEVO)

1. **Persistencia Server-Side**
   - Migración de AsyncStorage local → Supabase
   - Sincronización local ↔ servidor
   - Estrategia offline-first

2. **Sistema de Compartir**
   - Compartir mapas de pines entre usuarios
   - Vista de pines de otro usuario (modo lectura)
   - Agregar pines compartidos a cuenta propia

3. **Internacionalización (i18n)**
   - Soporte para Español e Inglés
   - Arquitectura preparada para escalar idiomas

4. **Seguridad y Permisos**
   - Control de accesos
   - Revocación de compartidos
   - Aislamiento de datos entre cuentas

5. **UX Home Rediseñado**
   - Home como "estado del viaje"
   - Secciones claras: Nearby, To Visit, Visited, Discover/Gems
   - Comportamiento completo del Diario

---

## ESTADO INICIAL DEL SISTEMA (2026-01-11)

### Arquitectura Actual (V1.2)

- ✅ Sistema de Pins implementado y estable
- ✅ Estados to_visit / visited funcionando
- ✅ Diario de Viaje (notas y fotos) implementado
- ✅ Autenticación con Supabase (AuthContext)
- ✅ Persistencia local con AsyncStorage
- ✅ Modelo conceptual canónico establecido

### Cambios Planificados (V1.3)

1. **Arquitectura de Persistencia**:
   - Diseñar esquema Supabase para Pins, Estados, Diario
   - Definir estrategia de sincronización
   - Arquitectura offline-first

2. **UX y Producto**:
   - Rediseñar Home como "estado del viaje"
   - Completar comportamiento del Diario
   - Ordenamiento: más reciente → más antiguo

3. **Sistema de Compartir**:
   - Diseñar sistema completo de compartir mapas
   - Vista de pines de otro usuario
   - Modo lectura y permisos

4. **Internacionalización**:
   - Arquitectura de traducción
   - Español e Inglés iniciales

5. **Seguridad**:
   - Identificar riesgos
   - Proponer mitigaciones

---

## PRÓXIMAS ENTRADAS

Las entradas de esta bitácora se registrarán conforme se documenten los cambios y decisiones definidos en los documentos de arquitectura de V1.3.

---

## PASO 2: VALIDACIÓN QA DESTRUCTIVA - FASE 1 MVP

**Fecha de inicio:** 2026-01-11  
**Objetivo:** Validar que los cimientos de persistencia NO se rompen bajo estrés  
**Estado:** En progreso

### Contexto del Paso 2

- Fase 1 (persistencia de Pins) implementada
- Migración SQL ejecutada en Supabase
- Objetivo: Detectar fallas silenciosas, inconsistencias de estado y riesgos de pérdida de datos
- **NO autoriza avanzar a Fase 2** - Solo valida cimientos

### Metodología

- Ejecutar pruebas manuales reales (app + reload + red)
- NO modificar código durante testing
- Documentar TODO en esta bitácora
- Si se detecta bug crítico: detener pruebas, documentar, NO "parchar sobre la marcha"

### Casos de Prueba Obligatorios

Ver documento detallado: `definitions/FLOWYA V1.3/TESTING_PASO_2_QA.md`

---

**Última actualización:** 2026-01-11  
**Estado:** Documentación inicial creada, Paso 2 QA iniciado
