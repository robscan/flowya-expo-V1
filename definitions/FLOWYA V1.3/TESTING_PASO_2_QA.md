# TESTING PASO 2 - QA DESTRUCTIVA FASE 1 MVP

**Versión:** FLOWYA V1.3 - Fase 1  
**Fecha:** 2026-01-11  
**Estado:** En ejecución  
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
- [ ] PENDIENTE EJECUCIÓN

**Bugs Detectados:**
- [ ] Ninguno
- [ ] Bug 1: [descripción]
- [ ] Bug 2: [descripción]

---

#### Caso 1.2: Guest NO Migra Datos

**Objetivo:** Verificar que pins creados como Guest NO se migran al login

**Pasos:**
1. Logout (asegurar que no hay usuario autenticado)
2. Usar app como Guest
3. Crear 2 pins locales (sin autenticación):
   - Pin Guest1 (spot_id: "spot-guest-1")
   - Pin Guest2 (spot_id: "spot-guest-2")
4. Verificar que pins aparecen en app (solo local)
5. Verificar en Supabase Dashboard que NO existen pins sin `user_id` o con `user_id` NULL
6. Login con Usuario A
7. Verificar que pins Guest NO aparecen en app
8. Verificar que pins persistidos de Usuario A aparecen correctamente
9. Verificar en Supabase Dashboard que NO se crearon pins para Guest

**Resultado Esperado:**
- ✅ Pins Guest NO se migran a Supabase
- ✅ Pins Guest desaparecen al hacer login
- ✅ Pins de Usuario A aparecen correctamente
- ✅ No hay contaminación de datos

**Resultado Observado:**
- [ ] PENDIENTE EJECUCIÓN

**Bugs Detectados:**
- [ ] Ninguno
- [ ] Bug 1: [descripción]

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
- [ ] PENDIENTE EJECUCIÓN

**Bugs Detectados:**
- [ ] Ninguno
- [ ] Bug 1: [descripción]

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
- [ ] PENDIENTE EJECUCIÓN

**Bugs Detectados:**
- [ ] Ninguno
- [ ] Bug 1: [descripción]

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
- [ ] PENDIENTE EJECUCIÓN

**Bugs Detectados:**
- [ ] Ninguno
- [ ] Bug 1: [descripción]

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
- [ ] PENDIENTE EJECUCIÓN

**Bugs Detectados:**
- [ ] Ninguno
- [ ] Bug 1: [descripción]

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
- [ ] PENDIENTE EJECUCIÓN

**Bugs Detectados:**
- [ ] Ninguno
- [ ] Bug 1: [descripción]

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
- [ ] PENDIENTE EJECUCIÓN

**Bugs Detectados:**
- [ ] Ninguno
- [ ] Bug 1: [descripción]

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
- [ ] PENDIENTE EJECUCIÓN

**Bugs Detectados:**
- [ ] Ninguno
- [ ] Bug 1: [descripción]

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
- [ ] PENDIENTE EJECUCIÓN (o fuera de alcance)

**Bugs Detectados:**
- [ ] Ninguno
- [ ] Bug 1: [descripción]

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
- [ ] PENDIENTE EJECUCIÓN

**Bugs Detectados:**
- [ ] Ninguno
- [ ] Bug 1: [descripción]

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
- [ ] PENDIENTE EJECUCIÓN

**Bugs Detectados:**
- [ ] Ninguno
- [ ] Bug 1: [descripción]

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
- [ ] PENDIENTE EJECUCIÓN

**Bugs Detectados:**
- [ ] Ninguno
- [ ] Bug 1: [descripción]

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

### Bug Crítico 1: [Título]

**Severidad:** Crítico  
**Descripción:** [Descripción detallada]  
**Casos Afectados:** [Lista de casos]  
**Pasos para Reproducir:**
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

**Resultado Esperado:** [Qué debería pasar]  
**Resultado Observado:** [Qué pasa realmente]  
**Evidencia:** [Logs, screenshots, datos de Supabase]

**Impacto:**
- [ ] Pérdida de datos
- [ ] Contaminación entre usuarios
- [ ] UX rota
- [ ] Estado fantasma

**Estado:** [Pendiente / Bloqueando / Resuelto]

---

## BUGS MENORES DETECTADOS

### Bug Menor 1: [Título]

**Severidad:** Menor  
**Descripción:** [Descripción]  
**Casos Afectados:** [Lista]  
**Pasos para Reproducir:** [Pasos]  
**Impacto:** [Impacto]  
**Estado:** [Pendiente / Resuelto]

---

## RESUMEN DE EJECUCIÓN

### Casos Ejecutados

- [ ] Caso 1.1: Aislamiento de Datos Entre Usuarios
- [ ] Caso 1.2: Guest NO Migra Datos
- [ ] Caso 2.1: Persistencia Básica Post-Reload
- [ ] Caso 2.2: visitedAt NO Cambia
- [ ] Caso 3.1: Funcionalidad Offline Completa
- [ ] Caso 3.2: Sincronización Post-Offline
- [ ] Caso 4.1: UX NO se Bloquea con Supabase No Disponible
- [ ] Caso 4.2: Recuperación Post-Falla
- [ ] Caso 5.1: Pins Persisten en Mapa
- [ ] Caso 5.2: Compartir Mapa (Read-Only)
- [ ] Caso 6.1: Cards NO se Mueven al Pinnear
- [ ] Caso 6.2: Reclasificación Post-Reload
- [ ] Caso 7.1: Migración de Datos Legacy

### Estadísticas

- **Total de casos:** 13
- **Casos ejecutados:** 0
- **Casos pasados:** 0
- **Casos fallidos:** 0
- **Bugs críticos:** 0
- **Bugs menores:** 0
- **Riesgos detectados:** 0

---

## CONFIRMACIÓN DE CRITERIOS DE SALIDA

### Criterios de Salida del Paso 2

Este paso se considera COMPLETO solo si:

- [ ] No existen bugs críticos abiertos
- [ ] No existe pérdida de datos reproducible
- [ ] No existen estados fantasma persistentes
- [ ] El comportamiento observado coincide con decisiones canónicas

### Confirmación Explícita

- [ ] ✅ No pérdida de datos
- [ ] ✅ No contaminación entre usuarios
- [ ] ✅ UX estable offline-first
- [ ] ✅ Persistencia funciona correctamente
- [ ] ✅ Sincronización funciona correctamente

**Estado:** [PENDIENTE / COMPLETO / BLOQUEADO]

---

**Última actualización:** 2026-01-11  
**Estado:** Documento de testing creado, pendiente ejecución de casos
