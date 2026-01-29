# FLOWYA V2.0 — DECISIONES CANONICAS
Estado: Activo
Fecha: 2026-01-14

---

## 1. Reglas no negociables (pre Scope 0)

1) Spots NO se actualizan directo desde la app.
   - Toda edición pública entra por SpotContribution.
   - Un applier (DB function o Edge Function) valida, aplica y genera SpotVersion.

2) Moderación ligera:
   - SpotMediaPublic pasa a soft_hidden automáticamente por umbral de reportes.
   - Spot solo se marca needs_review por reportes.
   - Un Spot NUNCA se oculta automáticamente en V2.0.

3) Rollback:
   - En V2.0 el rollback solo lo ejecuta admin/proyecto.
   - La comunidad solo reporta, nunca revierte.

4) IDs canónicos:
   - Implementar normalizeSpotId().
   - Usarla en TODA entrada de IDs legacy: pins, flows, caches, shares y AsyncStorage.

---

## 2. Prohibiciones explícitas

- Prohibido actualizar Spots vía UPDATE directo.
- Prohibido bypass temporal al sistema de contributions.
- Prohibido rollback comunitario.
- Prohibido usar IDs legacy sin normalizar.
- Prohibido usar imágenes seed/stock como representación real.

---

## 3. Gestión de conflictos con el código existente

Si alguna prohibición entra en conflicto con código actual:

- Documentar el conflicto.
- Resolverlo en Scope 0 con trazabilidad en BITACORA y PLAN_EJECUCION_SCOPES.

---

## 4. Criterio de aceptación de decisiones

Si una decisión no puede ser defendida citando explícitamente V2.0,
no debe tomarse.

---

## Moderación ligera — Umbrales canónicos (V2.0)

### SpotMediaPublic
- soft_hidden automático a partir de **3 reportes únicos**
- Reportes deben provenir de usuarios distintos
- Motivos válidos: incorrecta, no es del lugar, ofensiva, spam
- El Spot permanece visible; solo la media se oculta

### Spot (contenido)
- El Spot **NO se oculta automáticamente**
- A partir de **5 reportes únicos**, el Spot se marca como `needs_review`
- `needs_review` no bloquea visibilidad ni ejecución de Flows
- La revisión es informativa, no punitiva

### Rollback
- Nunca automático
- Solo ejecutable por admin/proyecto
- El rollback genera una nueva SpotVersion

### Alcance de la moderación automática (aclaración)

- Ningún Spot se elimina automáticamente.
- Ningún texto se edita automáticamente.
- La moderación automática solo afecta visibilidad de SpotMediaPublic.
- Toda acción correctiva estructural requiere intervención del proyecto (admin).

## Almacenamiento de imágenes (V2.0)

- Todas las imágenes de usuarios se almacenan en Supabase Storage.
- Vercel no se utiliza para almacenamiento persistente de media.
- Las tablas solo referencian rutas de Storage, nunca blobs.
- La moderación no elimina archivos; solo cambia visibilidad.

✅ Decisión arquitectónica

Este esquema:

Es compatible con Google Maps–like governance

Minimiza abuso

Escala sin moderadores humanos

Encaja perfecto con el Admin Panel V1.0

No introduce lógica compleja en V2.0

🔜 Siguiente paso

Una vez registrado este bloque en DECISIONES_CANONICAS.md:

👉 GO formal a Scope 0.

---

## SpotContribution → applier → SpotVersion (V2.0)

### Decisión canónica
- Toda edición pública crea un SpotContribution.
- Un applier valida y aplica la contribución.
- La aplicación genera una SpotVersion (snapshot inmutable).
- Spot se actualiza exclusivamente a partir de SpotVersion aplicada.

### Forma del applier
- Implementación preferente: DB function (determinística).
- Edge Function se reserva para etapas posteriores si se requiere.

### Estados mínimos de SpotContribution
- `pending`, `applied`, `rejected`.

### Reglas de seguridad
- La UI nunca ejecuta cambios directos al Spot.
- Toda aplicación queda auditada (contribution + versión).

### Creación de nuevos Spots
- Si no existe spot_id, la contribución se marca como creación.
- El applier crea el Spot canónico y genera SpotVersion.

---

## Fuentes legacy (seed/stock) — control (V2.0)

- `data/seedSpots.v1.2.json` se considera legacy y no se usa en runtime.
- Scripts de world spots quedan fuera de ejecución en V2.0.
- Cualquier ingreso de contenido público pasa por SpotContribution.

---

## TrustScore interno y permisos progresivos (V2.0)

### Decisión canónica
- TrustScore es interno y no expone valor numérico.
- Se representa en niveles: `nuevo`, `creciente`, `confiable`.
- Se calcula a partir de contribuciones aplicadas.

### Reglas iniciales
- `nuevo`: 0 contribuciones aplicadas.
- `creciente`: 1-2 contribuciones aplicadas.
- `confiable`: 3+ contribuciones aplicadas.

### Permisos progresivos (UI)
- Crear spots nuevos: habilitado a partir de `creciente`.
- Sugerir ediciones y reportar: habilitado para usuarios autenticados.
- Adjuntar media pública: reservado para `confiable` (informativo, sin auto-ejecución).

---

## IA asistente (V2.0)

### Decisión canónica
- La IA solo sugiere y resume. Nunca ejecuta acciones.
- La IA no crea ni modifica Spots/Flows/Pins de forma automática.
- Toda acción debe ser explícita por el usuario/admin.

### Alcance UI
- CTA de IA solo informativo (sugerencias, resumen, patrones).
- Ninguna UI dispara cambios persistentes en Spot/Flow desde IA.

---

## Sistema de Ubicación — Decisiones canónicas (V1)

### RegionId canónico
- Formato oficial: `country.type.place` (ej.: `mx.city.playa-del-carmen`).
- Se usa en comparaciones y filtros; nunca se compara por label.

### Prioridad de filtros en Map
- Primero **viewport/bbox** (define el universo visible).
- Luego **regionId** como refinamiento dentro de lo visible.

### Niveles válidos
- Solo `city` y `region` (no usar `locality`).

### Fallback legacy
- No existe fallback permanente desde `city/country` legacy en UX.
