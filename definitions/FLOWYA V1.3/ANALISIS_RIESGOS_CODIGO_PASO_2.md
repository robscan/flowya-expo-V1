# ANÁLISIS DE RIESGOS EN CÓDIGO - PASO 2 QA

**Versión:** FLOWYA V1.3 - Fase 1  
**Fecha:** 2026-01-11  
**Objetivo:** Identificar riesgos potenciales en código antes de ejecutar pruebas manuales

---

## PROPÓSITO

Este documento identifica riesgos potenciales detectados en el análisis estático del código, para ser validados durante las pruebas manuales del Paso 2.

**Referencias:**
- Código analizado: `contexts/SavedContext.tsx`, `utils/pinsService.ts`
- Testing: `definitions/FLOWYA V1.3/TESTING_PASO_2_QA.md`

---

## RIESGOS IDENTIFICADOS

### RIESGO 1: Stale Closure en `loadPinsFromSupabase`

**Ubicación:** `contexts/SavedContext.tsx:280-283`

**Código Problemático:**
```typescript
await saveDataToLocal({
  ...data,  // ⚠️ 'data' puede estar desactualizado (stale closure)
  pins: supabasePins,
});
```

**Problema:**
- `loadPinsFromSupabase` usa `data` del closure, que puede estar desactualizado
- Si `data` cambia mientras se ejecuta `loadPinsFromSupabase`, se guarda estado antiguo
- Puede causar pérdida de datos si hay cambios concurrentes

**Impacto Potencial:**
- Pérdida de datos si hay cambios concurrentes
- Estado inconsistente entre memoria y AsyncStorage

**Validación en Testing:**
- **Caso 2.1:** Verificar que cambios concurrentes no se pierden
- **Caso 3.2:** Verificar que sync post-offline no pierde datos locales

**Severidad:** Media-Alta

---

### RIESGO 2: Dependencia Circular en `useCallback`

**Ubicación:** `contexts/SavedContext.tsx:293`

**Código Problemático:**
```typescript
const loadPinsFromSupabase = useCallback(async () => {
  // ... usa data.pins en línea 256
}, [user?.id, data.pins]);  // ⚠️ Dependencia de data.pins puede causar re-renders
```

**Problema:**
- `data.pins` en dependencias causa que `loadPinsFromSupabase` se recree en cada cambio de pins
- Puede causar loops infinitos si `loadPinsFromSupabase` modifica `data.pins`
- `useEffect` que llama `loadPinsFromSupabase` puede ejecutarse repetidamente

**Impacto Potencial:**
- Loops infinitos de sincronización
- Múltiples llamadas a Supabase innecesarias
- Degradación de performance

**Validación en Testing:**
- **Caso 1.1:** Verificar que no hay llamadas repetidas a Supabase
- **Caso 2.1:** Verificar que reload no causa loops

**Severidad:** Media

---

### RIESGO 3: Race Condition en Migración

**Ubicación:** `contexts/SavedContext.tsx:255-256`

**Código Problemático:**
```typescript
const migrationFlag = await AsyncStorage.getItem('@flowya_migration_v1_3_completed');
const shouldMigrate = !migrationFlag && Object.keys(data.pins).length > 0;
```

**Problema:**
- Verifica `data.pins` que puede estar desactualizado
- Si hay múltiples instancias de la app abiertas, ambas pueden intentar migrar
- No hay lock para prevenir migración concurrente

**Impacto Potencial:**
- Duplicación de pins en Supabase
- Migración múltiple
- Datos inconsistentes

**Validación en Testing:**
- **Caso 7.1:** Verificar que migración no se ejecuta múltiples veces
- **Caso 1.1:** Verificar que no hay duplicados después de migración

**Severidad:** Media

---

### RIESGO 4: Falta de Validación de Red en Sincronización

**Ubicación:** `contexts/SavedContext.tsx:296-307`

**Código Problemático:**
```typescript
const syncPinToSupabase = useCallback(async (pin: PinData) => {
  if (!user?.id || !isAuthenticated) {
    return;
  }
  // ⚠️ No verifica si hay conexión a internet
  try {
    await pinsService.upsertPin(pin, user.id);
  } catch (error) {
    console.error('Error syncing pin to Supabase:', error);
  }
}, [user?.id, isAuthenticated]);
```

**Problema:**
- No verifica estado de red antes de sincronizar
- `useNetworkStatus` existe pero no se usa en `syncPinToSupabase`
- Puede hacer llamadas fallidas innecesarias cuando está offline

**Impacto Potencial:**
- Llamadas fallidas innecesarias
- Errores en consola (aunque no crítico)
- Posible degradación de UX si hay muchos errores

**Validación en Testing:**
- **Caso 3.1:** Verificar que no hay errores visibles cuando está offline
- **Caso 4.1:** Verificar que no hay llamadas fallidas repetidas

**Severidad:** Baja

---

### RIESGO 5: `saveDataToLocal` Usa Estado Desactualizado

**Ubicación:** `contexts/SavedContext.tsx:161-165`

**Código Problemático:**
```typescript
useEffect(() => {
  if (!isLoading) {
    saveDataToLocal(data);  // ⚠️ 'data' puede estar desactualizado
  }
}, [data, isLoading]);
```

**Problema:**
- `saveDataToLocal` recibe `data` como parámetro, pero puede haber cambios concurrentes
- Si `data` cambia mientras se ejecuta `saveDataToLocal`, se guarda estado antiguo
- No hay validación de que `data` sea el estado más reciente

**Impacto Potencial:**
- Pérdida de cambios si hay actualizaciones concurrentes
- Estado inconsistente en AsyncStorage

**Validación en Testing:**
- **Caso 2.1:** Verificar que todos los cambios persisten después de reload
- **Caso 3.2:** Verificar que sync post-offline guarda todos los cambios

**Severidad:** Media

---

### RIESGO 6: No Hay Manejo de Conflictos en Upsert

**Ubicación:** `utils/pinsService.ts:118-130`

**Código Problemático:**
```typescript
const { error } = await supabase
  .from('pins')
  .upsert(
    {
      ...pinData,
    },
    {
      onConflict: 'spot_id,user_id',
      ignoreDuplicates: false,
    }
  );
```

**Problema:**
- Upsert usa Last-Write-Wins pero no hay validación de que el timestamp sea correcto
- Si hay dos dispositivos modificando el mismo pin simultáneamente, puede haber pérdida de datos
- No hay notificación al usuario de conflictos

**Impacto Potencial:**
- Pérdida de datos en caso de conflictos simultáneos
- No hay visibilidad de conflictos para el usuario

**Validación en Testing:**
- **Caso 3.2:** Verificar que sync post-offline no pierde datos
- **Caso 4.2:** Verificar que recuperación post-falla no causa conflictos

**Severidad:** Media

---

### RIESGO 7: `visitedAt` Puede Ser Sobrescrito en Upsert

**Ubicación:** `utils/pinsService.ts:42`

**Código Problemático:**
```typescript
visited_at: pin.visitedAt ? pin.visitedAt.toISOString() : null,
```

**Problema:**
- Si `pin.visitedAt` es `undefined` localmente pero existe en Supabase, se puede sobrescribir con `null`
- El trigger de Supabase debería proteger esto, pero si el trigger falla, se puede perder `visitedAt`

**Impacto Potencial:**
- Pérdida de `visitedAt` si trigger falla
- Datos inconsistentes

**Validación en Testing:**
- **Caso 2.2:** Verificar que `visitedAt` NO cambia en cambios de estado
- **Caso 3.2:** Verificar que `visitedAt` persiste después de sync

**Severidad:** Baja (mitigado por trigger de Supabase)

---

### RIESGO 8: Limpieza de Pins al Logout Puede Perder Datos

**Ubicación:** `contexts/SavedContext.tsx:167-179`

**Código Problemático:**
```typescript
useEffect(() => {
  if (!isAuthenticated && !isLoading) {
    setData((prev) => ({
      ...prev,
      pins: {},  // ⚠️ Limpia pins pero no verifica si hay sync pendiente
    }));
  }
}, [isAuthenticated, isLoading]);
```

**Problema:**
- Si hay sincronizaciones pendientes al hacer logout, se pierden
- No hay verificación de que todas las sincronizaciones se completaron antes de limpiar

**Impacto Potencial:**
- Pérdida de datos si hay sync pendiente al logout
- Datos no sincronizados se pierden

**Validación en Testing:**
- **Caso 1.1:** Verificar que pins persisten después de logout/login
- **Caso 3.2:** Verificar que sync se completa antes de logout

**Severidad:** Media

---

## RESUMEN DE RIESGOS

| Riesgo | Severidad | Impacto | Casos de Validación |
|--------|-----------|---------|-------------------|
| R1: Stale Closure | Media-Alta | Pérdida de datos | 2.1, 3.2 |
| R2: Dependencia Circular | Media | Loops infinitos | 1.1, 2.1 |
| R3: Race Condition Migración | Media | Duplicación | 7.1, 1.1 |
| R4: Sin Validación de Red | Baja | Errores innecesarios | 3.1, 4.1 |
| R5: Estado Desactualizado | Media | Pérdida de cambios | 2.1, 3.2 |
| R6: Sin Manejo de Conflictos | Media | Pérdida de datos | 3.2, 4.2 |
| R7: visitedAt Sobrescrito | Baja | Pérdida de fecha | 2.2, 3.2 |
| R8: Limpieza al Logout | Media | Pérdida de sync | 1.1, 3.2 |

---

## PRIORIZACIÓN PARA TESTING

### Alta Prioridad (Validar Primero)

1. **R1: Stale Closure** - Puede causar pérdida de datos
2. **R8: Limpieza al Logout** - Puede perder datos no sincronizados
3. **R3: Race Condition Migración** - Puede causar duplicación

### Media Prioridad

4. **R2: Dependencia Circular** - Puede causar loops
5. **R5: Estado Desactualizado** - Puede perder cambios
6. **R6: Sin Manejo de Conflictos** - Puede perder datos en conflictos

### Baja Prioridad

7. **R4: Sin Validación de Red** - Solo errores en consola
8. **R7: visitedAt Sobrescrito** - Mitigado por trigger

---

## CASOS DE PRUEBA ADICIONALES SUGERIDOS

### Caso Adicional 1: Cambios Concurrentes

**Objetivo:** Validar R1 y R5

**Pasos:**
1. Login con Usuario A
2. Crear pin rápidamente (spot_id: "spot-concurrent-1")
3. Inmediatamente cambiar estado a `visited`
4. Inmediatamente agregar nota
5. Reload
6. Verificar que todos los cambios persisten

### Caso Adicional 2: Logout Durante Sync

**Objetivo:** Validar R8

**Pasos:**
1. Login con Usuario A
2. Desconectar red
3. Crear pin offline
4. Reconectar red
5. Inmediatamente hacer logout (antes de que sync complete)
6. Login nuevamente
7. Verificar que pin existe en Supabase

### Caso Adicional 3: Múltiples Dispositivos

**Objetivo:** Validar R6

**Pasos:**
1. Login con Usuario A en Dispositivo 1
2. Crear pin (spot_id: "spot-multi-1")
3. Login con Usuario A en Dispositivo 2
4. Modificar mismo pin simultáneamente en ambos dispositivos
5. Verificar que no hay pérdida de datos
6. Verificar que Last-Write-Wins funciona correctamente

---

**Última actualización:** 2026-01-11  
**Estado:** Análisis de riesgos completado, pendiente validación en testing
