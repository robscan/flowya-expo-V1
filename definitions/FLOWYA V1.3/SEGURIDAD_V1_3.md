# SEGURIDAD — FLOWYA V1.3

**Versión:** FLOWYA V1.3  
**Fecha:** 2026-01-11  
**Estado:** En progreso

---

## PROPÓSITO

Este documento identifica riesgos de seguridad de FLOWYA V1.3 y propone mitigaciones claras.

**Referencias:**
- Decisiones canónicas: `definitions/FLOWYA V1.3/DECISIONES_CANONICAS_V1_3.md`
- Modelo de datos: `definitions/FLOWYA V1.3/MODELO_DATOS_V1_3.md`
- Arquitectura: `definitions/FLOWYA V1.3/ARQUITECTURA_V1_3.md`

---

## ANÁLISIS DE RIESGOS

### Clasificación de Riesgos

- **Crítico:** Compromete seguridad de datos o privacidad
- **Alto:** Puede causar pérdida de datos o acceso no autorizado
- **Medio:** Puede causar problemas de funcionalidad o privacidad
- **Bajo:** Impacto limitado, fácil de mitigar

---

## RIESGOS IDENTIFICADOS

### R-01: Acceso No Autorizado a Pines

**Severidad:** Crítico  
**Descripción:** Usuario puede acceder a pines de otro usuario si RLS no está configurado correctamente.

**Impacto:**
- Exposición de datos personales (pines, notas, fotos)
- Violación de privacidad
- Pérdida de confianza del usuario

**Mitigación:**
1. **RLS en Supabase:**
   ```sql
   CREATE POLICY "Users can view own pins"
     ON pins FOR SELECT
     USING (auth.uid() = user_id);
   ```

2. **Validación en aplicación:**
   - Verificar `user_id` antes de mostrar datos
   - No confiar solo en RLS

3. **Testing:**
   - Intentar acceder a pins de otro usuario
   - Verificar que RLS bloquea acceso

**Referencia:** `MODELO_DATOS_V1_3.md` - Parte 2

---

### R-02: Acceso No Autorizado a Mapas Compartidos

**Severidad:** Alto  
**Descripción:** Usuario puede acceder a mapas compartidos sin permiso si RLS no valida correctamente.

**Impacto:**
- Exposición de pines compartidos a usuarios no autorizados
- Violación de privacidad

**Mitigación:**
1. **RLS en Supabase:**
   ```sql
   CREATE POLICY "Users can view shared maps"
     ON shared_maps FOR SELECT
     USING (
       auth.uid() = owner_id OR
       auth.uid() = ANY(SELECT jsonb_array_elements_text(shared_with)::uuid)
     );
   ```

2. **Validación en aplicación:**
   - Verificar que usuario está en `shared_with` antes de mostrar
   - Validar `revokedAt` es NULL

3. **Testing:**
   - Intentar acceder a mapa compartido sin permiso
   - Verificar revocación funciona correctamente

**Referencia:** `MODELO_DATOS_V1_3.md` - Parte 2, `SISTEMA_COMPARTIR_V1_3.md`

---

### R-03: Modificación No Autorizada de Pines

**Severidad:** Crítico  
**Descripción:** Usuario puede modificar pines de otro usuario si no hay validación.

**Impacto:**
- Pérdida de datos personales
- Corrupción de datos
- Violación de integridad

**Mitigación:**
1. **RLS en Supabase:**
   ```sql
   CREATE POLICY "Users can update own pins"
     ON pins FOR UPDATE
     USING (auth.uid() = user_id);
   ```

2. **Validación en aplicación:**
   - Verificar `user_id` antes de actualizar
   - No permitir actualizar `user_id` o `spot_id`

3. **Testing:**
   - Intentar actualizar pin de otro usuario
   - Verificar que RLS bloquea actualización

**Referencia:** `MODELO_DATOS_V1_3.md` - Parte 2

---

### R-04: Revocación de Compartidos No Funciona

**Severidad:** Alto  
**Descripción:** Usuario revocado puede seguir accediendo a mapa compartido si revocación no se valida correctamente.

**Impacto:**
- Acceso no autorizado persistente
- Violación de privacidad

**Mitigación:**
1. **Validación de `revokedAt`:**
   ```sql
   -- En RLS policy
   AND revoked_at IS NULL
   ```

2. **Invalidación de cache:**
   - Limpiar cache local cuando se revoca acceso
   - Forzar re-validación desde servidor

3. **Testing:**
   - Revocar acceso y verificar que usuario pierde acceso inmediatamente
   - Verificar que cache se limpia correctamente

**Referencia:** `SISTEMA_COMPARTIR_V1_3.md`

---

### R-05: Aislamiento de Datos Entre Cuentas

**Severidad:** Crítico  
**Descripción:** Datos de un usuario pueden filtrarse a otro usuario si no hay aislamiento correcto.

**Impacto:**
- Exposición masiva de datos
- Violación grave de privacidad
- Problemas legales (GDPR, etc.)

**Mitigación:**
1. **RLS en todas las tablas:**
   - Validar `user_id` en todas las queries
   - No permitir queries sin filtro de usuario

2. **Validación en aplicación:**
   - Siempre filtrar por `user_id` en queries
   - No confiar solo en RLS

3. **Testing exhaustivo:**
   - Crear múltiples usuarios
   - Verificar que cada usuario solo ve sus datos
   - Intentar acceder a datos de otros usuarios

**Referencia:** `ARQUITECTURA_V1_3.md`

---

### R-06: Sincronización Offline Expone Datos

**Severidad:** Medio  
**Descripción:** Cache local puede contener datos sensibles sin encriptación.

**Impacto:**
- Exposición de datos si dispositivo es comprometido
- Violación de privacidad

**Mitigación:**
1. **Encriptación de cache:**
   - Usar `expo-secure-store` para datos sensibles
   - Encriptar notas y fotos personales en cache

2. **Limpieza de cache:**
   - Limpiar cache al cerrar sesión
   - Limpiar cache después de período de inactividad

3. **Testing:**
   - Verificar que cache se limpia al cerrar sesión
   - Verificar que datos sensibles están encriptados

**Referencia:** `ARQUITECTURA_V1_3.md`

---

### R-07: Conflictos de Sincronización

**Severidad:** Medio  
**Descripción:** Resolución de conflictos puede causar pérdida de datos si no se maneja correctamente.

**Impacto:**
- Pérdida de datos del usuario
- Corrupción de datos
- Mala experiencia de usuario

**Mitigación:**
1. **Estrategia Last-Write-Wins:**
   - Usar timestamps precisos
   - Preferir servidor como fuente de verdad en caso de empate

2. **Notificación de conflictos:**
   - Notificar usuario cuando hay conflicto
   - Permitir resolución manual (futuro)

3. **Testing:**
   - Simular conflictos de sincronización
   - Verificar que resolución funciona correctamente

**Referencia:** `ARQUITECTURA_V1_3.md`, `DECISIONES_CANONICAS_V1_3.md` - D-V1.3-02

---

### R-08: Autenticación Débil

**Severidad:** Alto  
**Descripción:** Si autenticación no es segura, usuarios pueden acceder a cuentas de otros.

**Impacto:**
- Acceso no autorizado a cuentas
- Exposición de datos personales
- Pérdida de confianza

**Mitigación:**
1. **Usar Supabase Auth:**
   - Ya implementado en V1.2
   - Validar que configuración es segura

2. **Validación de sesión:**
   - Verificar sesión válida antes de operaciones sensibles
   - Invalidar sesión después de período de inactividad

3. **Testing:**
   - Intentar acceder sin autenticación
   - Verificar que sesiones expiran correctamente

**Referencia:** `contexts/AuthContext.tsx`

---

## CONTROL DE ACCESOS

### Principios

1. **Principio de Menor Privilegio:** Usuarios solo tienen acceso a lo necesario
2. **Defensa en Profundidad:** Múltiples capas de validación (RLS + App)
3. **Validación en Servidor:** No confiar solo en validación del cliente

### Implementación

#### Capa 1: Row Level Security (RLS)

- **Ubicación:** Supabase (PostgreSQL)
- **Responsabilidad:** Validar acceso a nivel de base de datos
- **Cobertura:** Todas las tablas con datos de usuario

#### Capa 2: Validación en Aplicación

- **Ubicación:** Contextos y hooks
- **Responsabilidad:** Validar permisos antes de operaciones
- **Cobertura:** Todas las operaciones de escritura

#### Capa 3: Validación en UI

- **Ubicación:** Componentes
- **Responsabilidad:** Ocultar/mostrar elementos según permisos
- **Cobertura:** Todas las acciones de usuario

---

## REVOCACIÓN DE COMPARTIDOS

### Flujo de Revocación

1. **Owner revoca acceso:**
   - Actualiza `revokedAt` en Supabase
   - RLS bloquea acceso inmediatamente

2. **Invalidación de cache:**
   - Limpiar cache local de usuarios revocados
   - Forzar re-validación desde servidor

3. **Notificación (futuro):**
   - Notificar usuarios revocados
   - Mostrar mensaje en UI

### Validación

```typescript
// Pseudocódigo
function canAccessSharedMap(sharedMap: SharedMap, userId: string): boolean {
  // 1. Verificar que no está revocado
  if (sharedMap.revokedAt) {
    return false;
  }
  
  // 2. Verificar que usuario está en shared_with
  if (sharedMap.ownerId === userId) {
    return true; // Owner siempre tiene acceso
  }
  
  return sharedMap.sharedWith.includes(userId);
}
```

**Referencia:** `SISTEMA_COMPARTIR_V1_3.md`

---

## PROTECCIÓN DE DATOS DE USUARIO

### Datos Sensibles

1. **Notas personales (Diario):**
   - Encriptar en cache local
   - No exponer en logs
   - Validar permisos antes de mostrar

2. **Fotos personales:**
   - Almacenar en storage seguro
   - Validar permisos antes de mostrar
   - No exponer URLs en logs

3. **Datos de ubicación:**
   - No compartir sin permiso explícito
   - Validar permisos antes de compartir

### Limpieza de Datos

1. **Al cerrar sesión:**
   - Limpiar cache local
   - Invalidar sesión
   - Limpiar datos sensibles

2. **Al eliminar cuenta (futuro):**
   - Eliminar todos los datos del usuario
   - Eliminar pines, notas, fotos
   - Cumplir con GDPR
   - Proceso documentado en `PRIVACIDAD_TERMINOS_V1_3.md`

---

## AISLAMIENTO ENTRE CUENTAS

### Validación

1. **En todas las queries:**
   ```typescript
   // Siempre filtrar por user_id
   const userPins = await supabase
     .from('pins')
     .select('*')
     .eq('user_id', currentUser.id); // SIEMPRE incluir este filtro
   ```

2. **En RLS:**
   ```sql
   -- RLS debe validar user_id en todas las operaciones
   USING (auth.uid() = user_id);
   ```

3. **Testing:**
   - Crear múltiples usuarios
   - Verificar que cada usuario solo ve sus datos
   - Intentar acceder a datos de otros usuarios

---

## PLAN DE ACCIÓN

### Prioridad 1 (Crítico - Implementar Inmediatamente)

1. ✅ RLS en todas las tablas
2. ✅ Validación en aplicación
3. ✅ Testing de aislamiento entre cuentas

### Prioridad 2 (Alto - Implementar en Fase 1)

1. ✅ Validación de compartidos
2. ✅ Revocación funcionando correctamente
3. ✅ Encriptación de cache local

### Prioridad 3 (Medio - Implementar en Fase 5)

1. ✅ Resolución de conflictos
2. ✅ Notificaciones de seguridad
3. ✅ Limpieza de datos

---

## TESTING DE SEGURIDAD

### Checklist

- [ ] Usuario no puede acceder a pines de otro usuario
- [ ] Usuario no puede modificar pines de otro usuario
- [ ] Usuario no puede acceder a mapas compartidos sin permiso
- [ ] Revocación funciona correctamente
- [ ] Cache se limpia al cerrar sesión
- [ ] Datos sensibles están encriptados
- [ ] RLS bloquea acceso no autorizado
- [ ] Validación en aplicación funciona correctamente

---

**Última actualización:** 2026-01-11  
**Estado:** Análisis de riesgos completado
