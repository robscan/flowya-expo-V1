# TESTING PASO 2 - QA DESTRUCTIVA FASE 1 MVP

**Versión:** FLOWYA V1.3 - Fase 1  
**Fecha:** 2026-01-11  
**Estado:** ✅ COMPLETO  
**Objetivo:** Validar que los cimientos NO se rompen bajo estrés

---

## PROPÓSITO

Este documento detalla los casos de prueba obligatorios para validar la persistencia de Pins en Fase 1, con enfoque en detectar:
- Pérdida de datos
- Estados fantasma
- Contaminación entre usuarios
- Degradación de UX offline-first
- Fallas silenciosas

**Referencias:**
- Decisiones canónicas: `definitions/FLOWYA V1.3/DECISIONES_CANONICAS_V1_3.md`
- Reporte de implementación: `definitions/FLOWYA V1.3/REPORTE_FASE_1_IMPLEMENTACION.md`
- Bitácora: `definitions/FLOWYA V1.3/BITACORA_V1_3.md`
- Análisis de riesgos: `definitions/FLOWYA V1.3/ANALISIS_RIESGOS_CODIGO_PASO_2.md`

---

## PREPARACIÓN

### Requisitos Previos

1. ✅ Migración SQL ejecutada en Supabase
2. ✅ RLS habilitado y verificado
3. ✅ Triggers funcionando
4. ✅ Variables de entorno configuradas
5. ✅ App funcionando en desarrollo

### Herramientas Necesarias

- Navegador con DevTools
- Acceso a Supabase Dashboard
- Herramienta para simular offline (DevTools Network tab)
- Dos cuentas de usuario de prueba (Usuario A y Usuario B)

### Checklist Pre-Testing

- [ ] Supabase configurado y accesible
- [ ] Tabla `pins` existe y tiene RLS habilitado
- [ ] App carga sin errores en consola
- [ ] Autenticación funciona
- [ ] Dos usuarios de prueba creados

---

## CASOS DE PRUEBA

### 1. AUTENTICACIÓN + OWNERSHIP

#### Caso 1.1: Aislamiento de Datos Entre Usuarios

**Objetivo:** Verificar que usuarios NO ven datos de otros usuarios

**Pasos:**
1. Login con Usuario A
2. Crear 3 pins con estado `to_visit`:
   - Pin A1 (spot_id: "spot-1")
   - Pin A2 (spot_id: "spot-2")
   - Pin A3 (spot_id: "spot-3")
3. Verificar en Supabase Dashboard que pins existen con `user_id` de Usuario A
4. Logout
5. Login con Usuario B
6. Verificar en app que NO aparecen pins de Usuario A
7. Verificar en Supabase Dashboard que query `SELECT * FROM pins WHERE user_id = 'user-b-id'` retorna vacío (o solo pins de B si existen)

**Resultado Esperado:**
- ✅ Usuario B NO ve pins de Usuario A
- ✅ Estado local está limpio (no hay pins en memoria)
- ✅ RLS bloquea acceso a datos de otros usuarios

**Resultado Observado:**
- [x] ✅ **COMPLETADO CON ÉXITO**
- ✅ Usuario B NO ve pins de Usuario A (verificado)
- ✅ Estado local está limpio (verificado)
- ✅ RLS bloquea acceso a datos de otros usuarios (verificado)
- ✅ Datos en Supabase coinciden con aislamiento esperado

**Bugs Detectados:**
- [x] Ninguno

---

#### Caso 1.2: Guest NO Migra Datos

**Objetivo:** Verificar que pins creados como Guest NO se migran al login

**⚠️ NOTA IMPORTANTE:** Este caso **NO PROCEDE** porque la funcionalidad de crear pins **requiere autenticación**. Los usuarios Guest no pueden crear pins según la implementación actual.

**Pasos:**
1. Logout (asegurar que no hay usuario autenticado)
2. Usar app como Guest
3. Intentar crear pins locales (sin autenticación):
   - Pin Guest1 (spot_id: "spot-guest-1")
   - Pin Guest2 (spot_id: "spot-guest-2")
4. ~~Verificar que pins aparecen en app (solo local)~~ → **NO ES POSIBLE**: pins requieren autenticación
5. ~~Verificar en Supabase Dashboard que NO existen pins sin `user_id` o con `user_id` NULL~~ → **N/A**
6. ~~Login con Usuario A~~ → **N/A**
7. ~~Verificar que pins Guest NO aparecen en app~~ → **N/A**: no se pueden crear pins como Guest
8. ~~Verificar que pins persistidos de Usuario A aparecen correctamente~~ → **N/A**
9. ~~Verificar en Supabase Dashboard que NO se crearon pins para Guest~~ → **N/A**

**Resultado Esperado:**
- ✅ Pins Guest NO se migran a Supabase (N/A: no se pueden crear)
- ✅ Pins Guest desaparecen al hacer login (N/A: no existen)
- ✅ Pins de Usuario A aparecen correctamente (verificado en Caso 1.1)
- ✅ No hay contaminación de datos (garantizado por autenticación requerida)

**Resultado Observado:**
- [x] ⚪ **NO APLICA (N/A)** - Pins requieren autenticación, no pueden ser creados como Guest
- ✅ Funcionalidad de pins correctamente protegida: requiere autenticación
- ✅ No hay riesgo de migración de datos Guest (imposible crear pins sin autenticación)
- ✅ Arquitectura correcta: pins son propiedad del usuario autenticado

**Bugs Detectados:**
- [x] Ninguno - Comportamiento correcto: pins requieren autenticación

**Observaciones:**
- La implementación actual **previene proactivamente** el problema que este caso intentaba validar
- Los pins están correctamente protegidos y requieren usuario autenticado
- No es necesario validar migración de datos Guest porque no existen pins de Guest

---

### 2. PERSISTENCIA ENTRE SESIONES

#### Caso 2.1: Persistencia Básica Post-Reload

**Objetivo:** Verificar que pins persisten después de reload

**Pasos:**
1. Login con Usuario A
2. Crear pin con estado `to_visit` (spot_id: "spot-persist-1")
3. Agregar nota de diario: "Nota de prueba persistencia"
4. Verificar que pin aparece en app
5. **Reload duro del navegador** (Ctrl+Shift+R o Cmd+Shift+R)
6. Verificar que pin persiste
7. Verificar que estado es correcto (`to_visit`)
8. Verificar que nota de diario persiste
9. Verificar en Supabase Dashboard que pin existe con datos correctos

**Resultado Esperado:**
- ✅ Pin persiste después de reload
- ✅ Estado correcto
- ✅ Nota de diario persiste
- ✅ Datos en Supabase coinciden con app

**Resultado Observado:**
- [x] ✅ **COMPLETADO CON ÉXITO**
- ✅ Pin persiste después de reload (verificado)
- ✅ Estado correcto (`to_visit`) (verificado)
- ✅ Nota de diario persiste (verificado)
- ✅ Datos en Supabase coinciden con app (verificado)

**Bugs Detectados:**
- [x] Ninguno

---

#### Caso 2.2: visitedAt NO Cambia en Cambios de Estado

**Objetivo:** Verificar que `visitedAt` se establece solo la primera vez y NO cambia

**Pasos:**
1. Login con Usuario A
2. Crear pin con estado `to_visit` (spot_id: "spot-visited-at-1")
3. Cambiar estado a `visited`
4. **Anotar timestamp de `visitedAt`** (verificar en app o Supabase)
5. Cambiar estado a `to_visit`
6. Cambiar estado a `visited` nuevamente
7. **Verificar que `visitedAt` NO cambió** (debe mantener timestamp original)
8. Reload
9. Verificar que `visitedAt` sigue siendo el mismo

**Resultado Esperado:**
- ✅ `visitedAt` se establece solo la primera vez
- ✅ `visitedAt` NO cambia en cambios posteriores
- ✅ `visitedAt` persiste correctamente después de reload
- ✅ Trigger de Supabase funciona correctamente

**Resultado Observado:**
- [x] ✅ **COMPLETADO CON ÉXITO**
- ✅ `visitedAt` se establece solo la primera vez (verificado)
- ✅ `visitedAt` NO cambia en cambios posteriores (verificado)
- ✅ `visitedAt` persiste correctamente después de reload (verificado)
- ✅ Trigger de Supabase funciona correctamente (verificado)

**Bugs Detectados:**
- [x] Ninguno

---

### 3. OFFLINE / ONLINE (CRÍTICO)

#### Caso 3.1: Funcionalidad Offline Completa

**Objetivo:** Verificar que app funciona completamente offline

**Pasos:**
1. Login con Usuario A
2. **Desconectar red** (DevTools Network tab → Offline)
3. Crear pin offline con estado `to_visit` (spot_id: "spot-offline-1")
4. Cambiar estado a `visited`
5. Agregar nota de diario: "Nota offline"
6. Agregar foto personal (si funcionalidad disponible)
7. **Reload (sin red)**
8. Verificar que:
   - Pin aparece en app
   - Estado es correcto (`visited`)
   - Nota persiste
   - Foto persiste (si aplica)
9. Verificar en Supabase Dashboard que pin NO existe aún (offline)

**Resultado Esperado:**
- ✅ App funciona completamente offline
- ✅ Estado local consistente
- ✅ Datos se guardan localmente
- ✅ No hay errores visibles al usuario
- ✅ Pin NO existe en Supabase (aún offline)

**Resultado Observado:**
- [x] ✅ **COMPLETADO CON ÉXITO**
- ✅ App funciona completamente offline (verificado)
- ✅ Estado local consistente (verificado)
- ✅ Datos se guardan localmente (verificado)
- ✅ No hay errores visibles al usuario (verificado)
- ✅ Pin NO existe en Supabase mientras está offline (verificado)

**Bugs Detectados:**
- [x] Ninguno

---

#### Caso 3.2: Sincronización Post-Offline

**Objetivo:** Verificar que datos offline se sincronizan correctamente al reconectar

**Pasos:**
1. Continuar desde Caso 3.1 (pin creado offline)
2. **Reconectar red** (DevTools Network tab → Online)
3. Esperar 5-10 segundos (sincronización en background)
4. Verificar en Supabase Dashboard que pin existe ahora
5. Verificar que datos en Supabase coinciden con app:
   - `state` correcto
   - `notes` correcto
   - `personal_photos` correcto (si aplica)
6. **Reload app**
7. Verificar que pin persiste y datos son correctos
8. Verificar que NO hay duplicados en Supabase

**Resultado Esperado:**
- ✅ Datos se sincronizan correctamente
- ✅ No hay duplicados
- ✅ No hay pérdida de datos
- ✅ Datos finales coherentes

**Resultado Observado:**
- [x] ✅ **COMPLETADO CON ÉXITO**
- ✅ Datos se sincronizan correctamente al reconectar (verificado)
- ✅ No hay duplicados en Supabase (verificado)
- ✅ No hay pérdida de datos (verificado)
- ✅ Datos finales coherentes (verificado)

**Bugs Detectados:**
- [x] Ninguno

---

### 4. FALLA DE SUPABASE

#### Caso 4.1: UX NO se Bloquea con Supabase No Disponible

**Objetivo:** Verificar que app funciona aunque Supabase falle

**Pasos:**
1. Login con Usuario A
2. **Simular Supabase no disponible:**
   - Opción A: Bloquear dominio de Supabase en DevTools Network tab
   - Opción B: Usar URL incorrecta temporalmente
3. Usar app normalmente:
   - Crear pin (spot_id: "spot-fail-1")
   - Cambiar estado
   - Agregar nota
4. Verificar que:
   - UX NO se bloquea
   - No hay errores visibles al usuario
   - Datos se guardan localmente
   - App sigue funcionando

**Resultado Esperado:**
- ✅ UX NO se bloquea
- ✅ No hay errores visibles
- ✅ Datos se guardan localmente
- ✅ App funciona normalmente

**Resultado Observado:**
- [x] ✅ **COMPLETADO CON ÉXITO**
- ✅ UX NO se bloquea cuando Supabase no está disponible (verificado)
- ✅ No hay errores visibles al usuario (verificado)
- ✅ Datos se guardan localmente (verificado)
- ✅ App funciona normalmente (verificado)

**Bugs Detectados:**
- [x] Ninguno

---

#### Caso 4.2: Recuperación Post-Falla

**Objetivo:** Verificar que sync funciona después de restaurar Supabase

**Pasos:**
1. Continuar desde Caso 4.1 (pin creado con Supabase caído)
2. **Restaurar Supabase** (desbloquear dominio o restaurar URL)
3. Esperar 5-10 segundos
4. Verificar en Supabase Dashboard que pin existe
5. Verificar que datos son correctos
6. **Reload app**
7. Verificar que pin persiste
8. Verificar que NO hay conflictos visibles
9. Verificar que datos finales son coherentes

**Resultado Esperado:**
- ✅ Sync correcto después de restaurar
- ✅ Sin conflictos visibles
- ✅ Datos finales coherentes
- ✅ No hay pérdida de datos

**Resultado Observado:**
- [x] ✅ **COMPLETADO CON ÉXITO**
- ✅ Sync correcto después de restaurar Supabase (verificado)
- ✅ Sin conflictos visibles (verificado)
- ✅ Datos finales coherentes (verificado)
- ✅ No hay pérdida de datos (verificado)

**Bugs Detectados:**
- [x] Ninguno

---

### 5. MAPA + PINS

#### Caso 5.1: Pins Persisten en Mapa

**Objetivo:** Verificar que pins se muestran correctamente en mapa

**Pasos:**
1. Login con Usuario A
2. Crear 3 pins:
   - Pin 1: `to_visit` (spot_id: "spot-map-1")
   - Pin 2: `visited` (spot_id: "spot-map-2")
   - Pin 3: `to_visit` (spot_id: "spot-map-3")
3. Abrir mapa
4. Verificar que todos los pins aparecen
5. Verificar que estados son correctos (markers diferentes)
6. **Reload app**
7. Abrir mapa nuevamente
8. Verificar que todos los pins aparecen
9. Verificar que estados son correctos

**Resultado Esperado:**
- ✅ Todos los pins aparecen en mapa
- ✅ Estados correctos (markers diferentes)
- ✅ Pins persisten después de reload

**Resultado Observado:**
- [x] ✅ **COMPLETADO CON ÉXITO**
- ✅ Todos los pins aparecen en mapa (verificado)
- ✅ Estados correctos (markers diferentes) (verificado)
- ✅ Pins persisten después de reload (verificado)

**Bugs Detectados:**
- [x] Ninguno (bugs previos resueltos: pines no visibles en mapa principal)

---

#### Caso 5.2: Compartir Mapa (Read-Only)

**Objetivo:** Verificar que compartir mapa funciona (si implementado)

**Nota:** Este caso puede estar fuera de alcance de Fase 1 según especificación.

**Pasos:**
1. Login con Usuario A
2. Crear pins
3. Compartir mapa (si funcionalidad disponible)
4. Abrir link en ventana incógnito
5. Verificar que:
   - Vista es read-only
   - No acceso a datos privados (notas, fotos)
   - No crash
   - Pins compartidos aparecen

**Resultado Esperado:**
- ✅ Vista read-only funciona
- ✅ No acceso a datos privados
- ✅ No crash
- ✅ Pins compartidos visibles

**Resultado Observado:**
- [x] ✅ **COMPLETADO CON ÉXITO**
- ✅ Vista read-only funciona correctamente (verificado)
- ✅ No acceso a datos privados (notas, fotos) (verificado)
- ✅ No crash (verificado)
- ✅ Pins compartidos visibles (verificado - bugs previos resueltos)

**Bugs Detectados:**
- [x] Ninguno (bugs previos resueltos: mapa compartido no mostraba pines, ID matching corregido)

---

### 6. UX DE HOME (REGRESIONES)

#### Caso 6.1: Cards NO se Mueven al Pinnear

**Objetivo:** Verificar regla UX heredada de V1.2

**Pasos:**
1. Login con Usuario A
2. Ir a Home
3. **Anotar posición de una card** (ej. "Spot X en posición Y")
4. Pinnear spot desde cualquier sección (Nearby, Discover, etc.)
5. Verificar que:
   - Card NO se mueve
   - Card NO desaparece
   - Card NO se duplica
   - Card muestra estado de pin correctamente
6. Cambiar estado de pin
7. Verificar que card NO se mueve

**Resultado Esperado:**
- ✅ Card NO se mueve al pinnear
- ✅ Card NO desaparece
- ✅ Card NO se duplica
- ✅ Estado se refleja visualmente en card

**Resultado Observado:**
- [x] ✅ **COMPLETADO CON ÉXITO**
- ✅ Card NO se mueve al pinnear (verificado - Bug Crítico 2 resuelto)
- ✅ Card NO desaparece (verificado)
- ✅ Card NO se duplica (verificado)
- ✅ Estado se refleja visualmente en card (verificado)

**Bugs Detectados:**
- [x] Ninguno (Bug Crítico 2 resuelto previamente)

---

#### Caso 6.2: Reclasificación Post-Reload

**Objetivo:** Verificar que reclasificación ocurre solo tras refresh

**Pasos:**
1. Login con Usuario A
2. Ir a Home
3. Pinnear spot desde Nearby (cambiar a `to_visit`)
4. Verificar que card NO se mueve a sección "To Visit"
5. **Reload Home** (navegar a otra pantalla y volver, o reload completo)
6. Verificar que:
   - Card aparece en sección "To Visit" (si existe)
   - Nearby sigue visible
   - To Visit / Visited correctos

**Resultado Esperado:**
- ✅ Reclasificación ocurre solo tras refresh
- ✅ Nearby sigue visible
- ✅ To Visit / Visited correctos

**Resultado Observado:**
- [x] ✅ **COMPLETADO CON ÉXITO**
- ✅ Reclasificación ocurre solo tras refresh (verificado)
- ✅ Nearby sigue visible (verificado)
- ✅ To Visit / Visited correctos (verificado)

**Bugs Detectados:**
- [x] Ninguno

---

### 7. DATOS "SUCIOS" V1.2 (MIGRACIÓN)

#### Caso 7.1: Migración de Datos Legacy

**Objetivo:** Verificar que migración maneja datos inconsistentes

**Pasos:**
1. **Preparar datos legacy** (si es posible):
   - Crear pins incompletos en AsyncStorage
   - Crear pins con estados inconsistentes
   - Crear pins sin `visitedAt` cuando `state === 'visited'`
2. Login con Usuario A (que tiene datos legacy)
3. Verificar que:
   - Migración se ejecuta silenciosamente
   - No hay crash
   - Datos se migran razonablemente (aunque no perfectos)
   - Pins aparecen en app
4. Verificar en Supabase Dashboard que pins existen

**Resultado Esperado:**
- ✅ Migración silenciosa
- ✅ No crash
- ✅ Datos razonables (aunque no perfectos)
- ✅ Pins aparecen en app

**Resultado Observado:**
- [x] ✅ **COMPLETADO CON ÉXITO**
- ✅ Migración silenciosa desde AsyncStorage a Supabase (verificado)
- ✅ No crash durante migración (verificado)
- ✅ Datos razonables (aunque no perfectos) (verificado)
- ✅ Pins aparecen en app después de migración (verificado)

**Bugs Detectados:**
- [x] Ninguno

---

## RIESGOS DETECTADOS DURANTE TESTING

### Riesgo 1: [Título]

**Severidad:** [Crítico / Alto / Medio / Bajo]  
**Descripción:** [Descripción detallada]  
**Casos Afectados:** [Lista de casos]  
**Evidencia:** [Logs, screenshots, pasos para reproducir]

**Mitigación Propuesta:**
- [ ] [Acción 1]
- [ ] [Acción 2]

**Estado:** [Pendiente / En progreso / Mitigado]

---

## BUGS CRÍTICOS DETECTADOS

### Bug Crítico 1: Tabla `pins` no existe en Supabase

**Severidad:** Crítico  
**Descripción:** La tabla `pins` no existía en la base de datos de Supabase, causando errores 404 cuando se intentaba hacer upsert de pins. La migración SQL existe (`supabase/migrations/001_create_pins_table.sql`) y fue ejecutada en Supabase.  
**Casos Afectados:** Todos los casos que requieren persistencia de pins (2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 5.1, 7.1)  
**Pasos para Reproducir:**
1. Login con Usuario A
2. Intentar agregar un pin a cualquier spot
3. Ver consola del navegador

**Resultado Esperado:** Pin se crea y persiste en Supabase sin errores  
**Resultado Observado:** ✅ **RESUELTO** - Migración SQL ejecutada, tabla `pins` creada con RLS y triggers. Pins ahora se persisten correctamente en Supabase.  
**Evidencia:** 
- Error inicial: `Error upserting pin to Supabase: {code: 'PGRST205', details: null, hint: null, message: "Could not find the table 'public.pins' in the schema cache"}`
- Migración ejecutada: `supabase/migrations/001_create_pins_table.sql`
- Tabla `pins` ahora existe con RLS habilitado y triggers funcionando

**Impacto:**
- [x] Pérdida de datos (pins no se persisten en servidor) - **RESUELTO**
- [ ] Contaminación entre usuarios
- [x] UX rota (errores visibles en consola) - **RESUELTO**
- [x] Estado fantasma (pins solo en local, no sincronizan) - **RESUELTO**

**Acción Requerida:** ✅ Migración SQL ejecutada en Supabase Dashboard

**Estado:** ✅ **RESUELTO** (2026-01-11)

---

### Bug Crítico 2: Cards se mueven de ubicación al agregar Pin

**Severidad:** Crítico  
**Descripción:** Las cards en Home se mueven/reordenan cuando se agrega un pin a un spot, violando la regla UX canónica de v1.2/v1.3 que establece que las cards NO deben moverse, desaparecer o duplicarse cuando se agrega un pin.  
**Casos Afectados:** Caso 6.1 (Cards NO se Mueven al Pinnear), Caso 6.2 (Reclasificación Post-Reload)  
**Pasos para Reproducir:**
1. Login con Usuario A
2. Ir a Home
3. Anotar posición de una card específica (ej. "Spot X en posición Y de Nearby")
4. Pinnear el spot desde cualquier sección (Nearby, Discover, etc.)
5. Observar que la card se mueve o cambia de posición

**Resultado Esperado:** Card permanece en su posición original, NO se mueve, NO desaparece, NO se duplica  
**Resultado Observado:** ✅ **RESUELTO** - Card permanece en su posición original tras corrección  
**Evidencia:** 
- Comportamiento inicial observado en http://localhost/
- Corrección aplicada: snapshot estable de pins, orden estable en `combineSpots`, `updatePinnedSnapshot` usando `getPinnedSpots` directamente

**Impacto:**
- [ ] Pérdida de datos
- [ ] Contaminación entre usuarios
- [x] UX rota (violación de reglas canónicas v1.2/v1.3) - **RESUELTO**
- [ ] Estado fantasma

**Estado:** ✅ **RESUELTO** (2026-01-11)

**Corrección Aplicada:**
- `updatePinnedSnapshot` ahora usa `getPinnedSpots()` directamente desde `SavedContext` para leer estado actual de pins
- Snapshot incluye tanto IDs de UserSpots como `originWorldSpotIds` para manejar conversiones WorldSpot → UserSpot
- `combineSpots` mantiene orden estable reemplazando WorldSpot con UserSpot en la misma posición
- `allSpots` memoizado de manera estable basado en keys de IDs, no referencias

---

## BUGS MENORES DETECTADOS

### Bug Menor 1: Links de compartir usaban localhost en producción

**Severidad:** Menor  
**Descripción:** Los links generados para compartir mapas usaban `http://localhost:8081/` incluso en producción, en lugar de `https://flowya.app`.  
**Casos Afectados:** Caso 5.2 (Compartir Mapa)  
**Pasos para Reproducir:**
1. Login con Usuario A
2. Crear pins
3. Compartir mapa (To Visit o Visited)
4. Verificar URL generada

**Resultado Esperado:** URL debe usar `https://flowya.app` en producción  
**Resultado Observado:** ✅ **RESUELTO** - URLs ahora detectan correctamente el entorno (localhost en desarrollo, flowya.app en producción)  
**Evidencia:** 
- Lógica implementada en `app/(tabs)/map.tsx` para detectar entorno
- Desarrollo: usa `window.location.origin` si es localhost
- Producción: siempre usa `https://flowya.app`

**Impacto:**
- [ ] Pérdida de datos
- [ ] Contaminación entre usuarios
- [x] UX degradada (links no funcionaban en producción) - **RESUELTO**
- [ ] Estado fantasma

**Estado:** ✅ **RESUELTO** (2026-01-11)

---

### Bug Menor 2: TabNavBar no visible con poco contenido

**Severidad:** Menor  
**Descripción:** Cuando el contenido de Home no genera scroll (poco contenido), el TabNavBar no se mostraba en ocasiones, afectando la navegación.  
**Casos Afectados:** UX general de Home  
**Pasos para Reproducir:**
1. Login con Usuario A
2. Ir a Home con poco contenido (no genera scroll)
3. Verificar que TabNavBar no aparece

**Resultado Esperado:** TabNavBar siempre visible, incluso cuando no hay scroll necesario  
**Resultado Observado:** ✅ **RESUELTO** - TabNavBar ahora se fuerza a visible cuando `!isContentScrollable`  
**Evidencia:** 
- Implementado `isContentScrollable` state en `app/(tabs)/home.tsx`
- Callbacks `handleContentSizeChange` y `handleScrollViewLayout` para detectar scrollabilidad
- `useEffect` actualizado para forzar visibilidad cuando no hay scroll

**Impacto:**
- [ ] Pérdida de datos
- [ ] Contaminación entre usuarios
- [x] UX degradada (navegación bloqueada) - **RESUELTO**
- [ ] Estado fantasma

**Estado:** ✅ **RESUELTO** (2026-01-11)

---

### Bug Crítico 3: Mapa compartido no mostraba pines

**Severidad:** Crítico  
**Descripción:** Al compartir un mapa y abrir el link, la pantalla `shared-map.tsx` no mostraba los pines del usuario compartido, mostrando mensaje "No hay lugares visitados - Este mapa no tiene pines del estado especificado".  
**Casos Afectados:** Caso 5.2 (Compartir Mapa)  
**Pasos para Reproducir:**
1. Login con Usuario A
2. Crear pins con estado `to_visit` o `visited`
3. Compartir mapa
4. Abrir link en ventana incógnito
5. Verificar que no aparecen pines

**Resultado Esperado:** Pines del usuario compartido deben aparecer en el mapa  
**Resultado Observado:** ✅ **RESUELTO** - Pines ahora se cargan correctamente usando `pinsService.fetchUserPins`  
**Evidencia:** 
- `shared-map.tsx` ahora carga pins del `userId` de la URL
- Lógica de matching de IDs corregida para manejar formato `user-{userId}-{originalSpotId}`
- Extracción correcta de `originalSpotId` usando `slice(6).join('-')` para UUIDs

**Impacto:**
- [ ] Pérdida de datos
- [ ] Contaminación entre usuarios
- [x] UX rota (funcionalidad de compartir no funcionaba) - **RESUELTO**
- [ ] Estado fantasma

**Estado:** ✅ **RESUELTO** (2026-01-11)

---

### Bug Crítico 4: Pines no visibles en mapa principal

**Severidad:** Crítico  
**Descripción:** Los pines con estado `to_visit` o `visited` no se visualizaban en el mapa principal (`app/(tabs)/map.tsx`), aunque existían en Supabase y se mostraban correctamente en otras pantallas.  
**Casos Afectados:** Caso 5.1 (Pins Persisten en Mapa)  
**Pasos para Reproducir:**
1. Login con Usuario A
2. Crear pins con estado `to_visit` o `visited`
3. Abrir mapa principal
4. Verificar que no aparecen pines

**Resultado Esperado:** Todos los pines deben aparecer en el mapa principal  
**Resultado Observado:** ✅ **RESUELTO** - Pines ahora se filtran correctamente sobre `allSpots` (combinación de UserSpots y WorldSpots)  
**Evidencia:** 
- `preFilteredSpots` en `app/(tabs)/map.tsx` ahora filtra sobre `allSpots` en lugar de solo `spots`
- `isSpotPinned` y `getPinState` manejan correctamente IDs con formato `user-{userId}-{originalSpotId}`

**Impacto:**
- [ ] Pérdida de datos
- [ ] Contaminación entre usuarios
- [x] UX rota (pines no visibles en mapa) - **RESUELTO**
- [ ] Estado fantasma

**Estado:** ✅ **RESUELTO** (2026-01-11)

---

## RESUMEN DE EJECUCIÓN

### Casos Ejecutados

- [x] Caso 1.1: Aislamiento de Datos Entre Usuarios ✅
- [x] Caso 1.2: Guest NO Migra Datos ⚪ N/A (pins requieren autenticación)
- [x] Caso 2.1: Persistencia Básica Post-Reload ✅
- [x] Caso 2.2: visitedAt NO Cambia ✅
- [x] Caso 3.1: Funcionalidad Offline Completa ✅
- [x] Caso 3.2: Sincronización Post-Offline ✅
- [x] Caso 4.1: UX NO se Bloquea con Supabase No Disponible ✅
- [x] Caso 4.2: Recuperación Post-Falla ✅
- [x] Caso 5.1: Pins Persisten en Mapa ✅
- [x] Caso 5.2: Compartir Mapa (Read-Only) ✅
- [x] Caso 6.1: Cards NO se Mueven al Pinnear ✅
- [x] Caso 6.2: Reclasificación Post-Reload ✅
- [x] Caso 7.1: Migración de Datos Legacy ✅

### Estadísticas

- **Total de casos:** 13
- **Casos ejecutados:** 13 (todos)
- **Casos pasados:** 12 (1.1, 2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 5.1, 5.2, 6.1, 6.2, 7.1)
- **Casos no aplicables:** 1 (1.2 - pins requieren autenticación)
- **Casos fallidos:** 0
- **Bugs críticos:** 0 (todos resueltos: Bug Crítico 2, 3, 4)
- **Bugs menores:** 0 (todos resueltos: Bug Menor 1, 2)
- **Riesgos detectados:** 0

---

## CONFIRMACIÓN DE CRITERIOS DE SALIDA

### Criterios de Salida del Paso 2

Este paso se considera COMPLETO solo si:

- [x] ✅ No existen bugs críticos abiertos
- [x] ✅ No existe pérdida de datos reproducible
- [x] ✅ No existen estados fantasma persistentes
- [x] ✅ El comportamiento observado coincide con decisiones canónicas

### Confirmación Explícita

- [x] ✅ No pérdida de datos
- [x] ✅ No contaminación entre usuarios
- [x] ✅ UX estable offline-first
- [x] ✅ Persistencia funciona correctamente
- [x] ✅ Sincronización funciona correctamente

**Estado:** ✅ **COMPLETO**

---

**Última actualización:** 2026-01-11  
**Estado:** ✅ COMPLETO - Todos los casos ejecutados y validados. Todos los bugs críticos y menores resueltos. Sistema cumple con todos los criterios de salida del Paso 2.
