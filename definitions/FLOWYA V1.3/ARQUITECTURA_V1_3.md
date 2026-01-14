# ARQUITECTURA — FLOWYA V1.3

**Versión:** FLOWYA V1.3  
**Fecha:** 2026-01-11  
**Estado:** En progreso

---

## PROPÓSITO

Este documento define la arquitectura general de FLOWYA V1.3, incluyendo:
- Arquitectura de persistencia (Supabase)
- Estrategia offline-first
- Sincronización local ↔ servidor
- Resolución de conflictos

**Referencias:**
- Principios arquitectónicos: `definitions/FLOWYA V1.2/FUENTE_UNICA_VERDAD_V2.0_REFERENCIA.md`
- Decisiones canónicas: `definitions/FLOWYA V1.3/DECISIONES_CANONICAS_V1_3.md`
- Modelo de datos: `definitions/FLOWYA V1.3/MODELO_DATOS_V1_3.md`

---

## ARQUITECTURA GENERAL

### Principios Arquitectónicos (Heredados de V2.0)

1. **Fuente Única de Verdad**: LocationProvider centralizado
2. **Separación Estricta de Capas**: Sistema → Preparación → UI
3. **Componentes Visuales Son "Tontos"**: Solo renderizan datos preparados
4. **Preparación de Datos Fuera de Componentes**: Funciones puras, memoizadas

**Referencia:** `FUENTE_UNICA_VERDAD_V2.0_REFERENCIA.md`

### Arquitectura V1.3 (Extensión)

V1.3 extiende V2.0 con:
- **Persistencia Server-Side**: Supabase como backend
- **Offline-First**: Cache local + sincronización diferida
- **Multi-Usuario**: Aislamiento de datos por usuario
- **Compartir**: Sistema de compartir mapas entre usuarios

---

## ARQUITECTURA DE PERSISTENCIA

### Stack Tecnológico

- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Cache Local:** AsyncStorage (React Native)
- **Sincronización:** Supabase Realtime + Queue local
- **Autenticación:** Supabase Auth (ya integrado)

**Referencia:** `DECISIONES_CANONICAS_V1_3.md` - D-V1.3-01

### Capas de Persistencia

```
┌─────────────────────────────────────┐
│         UI Layer (React)            │
│  (Components, Screens, Hooks)        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Context Layer (React)          │
│  (SavedContext, SpotContext, etc.)  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Cache Layer (AsyncStorage)      │
│  (Local cache for offline-first)    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Sync Layer (Queue + Background)    │
│  (Pending operations, conflict res.)  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    Server Layer (Supabase)          │
│  (PostgreSQL, RLS, Realtime)         │
└─────────────────────────────────────┘
```

### Flujo de Datos

#### Lectura (Read)

1. **UI solicita datos** → Context
2. **Context verifica cache local** → AsyncStorage
3. **Si hay datos en cache:**
   - Retorna inmediatamente (offline-first)
   - Sincroniza en background si hay conexión
4. **Si no hay datos en cache:**
   - Consulta Supabase
   - Guarda en cache local
   - Retorna datos

#### Escritura (Write)

1. **UI solicita escritura** → Context
2. **Context escribe en cache local** → AsyncStorage (inmediato)
3. **Context agrega a queue** → Pending operations
4. **Background sync:**
   - Si hay conexión: Sincroniza con Supabase
   - Si no hay conexión: Mantiene en queue
5. **Resolución de conflictos:**
   - Last-Write-Wins con timestamp
   - Actualiza cache local con resultado

**Referencia:** `DECISIONES_CANONICAS_V1_3.md` - D-V1.3-02

---

## ESTRATEGIA OFFLINE-FIRST

### Principios

1. **Cache Local como Fuente Primaria**: Lectura siempre desde cache local
2. **Escritura Local Inmediata**: No espera confirmación del servidor
3. **Sincronización Diferida**: En background cuando hay conexión
4. **Queue Persistente**: Operaciones pendientes se guardan en AsyncStorage

### Estructura de Cache Local

```typescript
interface LocalCache {
  pins: Record<string, PinData>;
  lastSyncAt: Date;
  pendingOperations: PendingOperation[];
  syncStatus: 'idle' | 'syncing' | 'error';
}

interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'pin' | 'spot' | 'shared_map';
  data: any;
  timestamp: Date;
  retries: number;
}
```

### Flujo de Sincronización

```
┌─────────────────┐
│  User Action    │
│  (Create Pin)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Write to Cache  │
│ (AsyncStorage)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Add to Queue   │
│ (Pending Ops)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│ Background Sync │─────▶│  Supabase    │
│ (If connected)  │      │  (Server)    │
└─────────────────┘      └──────────────┘
         │
         ▼
┌─────────────────┐
│ Update Cache    │
│ (If successful) │
└─────────────────┘
```

### Resolución de Conflictos

**Estrategia: Last-Write-Wins con Timestamp**

1. **Detección de conflicto:**
   - Timestamp local vs timestamp servidor
   - Si local es más reciente: Sobrescribe servidor
   - Si servidor es más reciente: Actualiza cache local

2. **Manejo de conflictos:**
   ```typescript
   if (localTimestamp > serverTimestamp) {
     // Local gana: sobrescribir servidor
     await supabase.update(localData);
   } else {
     // Servidor gana: actualizar cache local
     await updateLocalCache(serverData);
   }
   ```

3. **Casos especiales:**
   - Si ambos tienen mismo timestamp: Preferir servidor (fuente de verdad)
   - Si hay cambios simultáneos: Notificar usuario (futuro)

**Referencia:** `DECISIONES_CANONICAS_V1_3.md` - D-V1.3-02

---

## SINCRONIZACIÓN LOCAL ↔ SERVIDOR

### Mecanismos de Sincronización

#### 1. Sincronización Proactiva

- **Trigger:** Al abrir app o cambiar de pantalla
- **Frecuencia:** Máximo una vez por minuto
- **Alcance:** Solo datos del usuario actual

#### 2. Sincronización Reactiva

- **Trigger:** Al realizar operación de escritura
- **Frecuencia:** Inmediata si hay conexión
- **Alcance:** Solo la operación realizada

#### 3. Sincronización en Background

- **Trigger:** Cuando hay conexión y queue tiene operaciones pendientes
- **Frecuencia:** Cada 30 segundos si hay operaciones pendientes
- **Alcance:** Todas las operaciones en queue

### Supabase Realtime

**Uso:** Notificaciones de cambios de otros dispositivos del mismo usuario

```typescript
// Suscripción a cambios de pins del usuario actual
supabase
  .channel('pins')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'pins',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    // Actualizar cache local con cambios del servidor
    updateLocalCache(payload.new);
  })
  .subscribe();
```

**Nota:** Realtime solo para cambios del mismo usuario (no para compartidos)

---

## ARQUITECTURA DE SEGURIDAD

### Row Level Security (RLS)

**Principio:** Usuarios solo pueden acceder a sus propios datos

#### Políticas RLS

1. **Pins:**
   - SELECT: Solo pins del usuario actual
   - INSERT: Solo crear pins propios
   - UPDATE: Solo actualizar pins propios
   - DELETE: Solo eliminar pins propios

2. **Shared Maps:**
   - SELECT: Solo mapas compartidos con el usuario o propios
   - INSERT/UPDATE/DELETE: Solo el owner

**Referencia:** `MODELO_DATOS_V1_3.md` - Parte 2

### Aislamiento de Datos

- **Por Usuario:** Cada usuario solo ve sus propios pins
- **Por Compartido:** Solo ve mapas compartidos explícitamente con él
- **Validación en App:** Además de RLS, validar en aplicación

---

## ARQUITECTURA DE COMPARTIR

### Flujo de Compartir

```
┌──────────────┐
│ User A       │
│ (Owner)      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Create Share │
│ (shared_maps)│
└──────┬───────┘
       │
       ▼
┌──────────────┐      ┌──────────────┐
│ User B       │─────▶│ View Shared  │
│ (Shared With)│      │ Map (Read)   │
└──────────────┘      └──────────────┘
```

### Permisos de Compartir

- **Owner:** Puede compartir, revocar, ver quién tiene acceso
- **Shared With:** Solo lectura, puede agregar pins a su cuenta
- **Revocación:** Inmediata, usuarios pierden acceso al instante

**Referencia:** `SISTEMA_COMPARTIR_V1_3.md`

---

## PERFORMANCE Y OPTIMIZACIÓN

### Estrategias

1. **Cache Local:** Reducir llamadas a Supabase
2. **Índices:** Optimizar queries frecuentes
3. **Paginación:** Para listas grandes (futuro)
4. **Lazy Loading:** Cargar datos bajo demanda

### Métricas Objetivo

- **Tiempo de lectura:** < 100ms (desde cache)
- **Tiempo de escritura:** < 50ms (escritura local)
- **Sincronización:** < 2s (si hay conexión)
- **Offline:** 100% funcionalidad disponible

---

## DIAGRAMA DE ARQUITECTURA COMPLETA

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer (React)                      │
│  Components, Screens, Hooks, Navigation                 │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Context Layer (React)                       │
│  SavedContext, SpotContext, AuthContext, etc.            │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐      ┌────────▼──────────┐
│  Cache Layer   │      │  Sync Layer       │
│ (AsyncStorage) │      │ (Queue + BG)      │
└───────┬────────┘      └────────┬───────────┘
        │                        │
        └────────────┬───────────┘
                     │
        ┌────────────▼───────────┐
        │   Server Layer        │
        │  (Supabase)           │
        │  - PostgreSQL          │
        │  - RLS                 │
        │  - Realtime            │
        │  - Auth                │
        └────────────────────────┘
```

---

## PRÓXIMOS PASOS

1. Validar arquitectura con equipo
2. Implementar Fase 1 (Arquitectura de Persistencia)
3. Testing de sincronización
4. Optimización de performance

---

**Última actualización:** 2026-01-11  
**Estado:** Arquitectura inicial definida
