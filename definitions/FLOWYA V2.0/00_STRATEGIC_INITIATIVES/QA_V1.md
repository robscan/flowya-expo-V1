# QA V1 — Validación Integral (FLOWYA V2.0)

## Objetivo
Validar manualmente todos los cambios implementados en V1 con pasos ejecutables y criterios de aceptación claros.

## Estado de ejecución
| # | Bloque | Estado |
|---|--------|--------|
| 0 | Pre-requisitos | Pendiente |
| 1 | Location System V1 | Pendiente |
| 2 | Contribution System V1 | Pendiente |
| 3 | Critical Bugs V1 | En curso (spot-detail sin "Maximum update depth" ✅) |
| 4 | Image Loading System V1 | Pendiente |
| 5 | Admin System V1 | Pendiente |
| 6 | Translation System V1 | Pendiente |
| 7 | AI Coverage System V1 | En curso (diálogo confirmación ✅, errores visibles en web ✅, conteo bbox estricto ✅, Admin "Generar de todos modos" ✅) |

**Siguiente:** Ejecutar bloque 7 (AI Coverage) según pasos y criterios abajo; migraciones 021, 022, 028 aplicadas.

---

## Pre-requisitos
1) Migraciones Supabase aplicadas: `019_admin_roles_v1.sql`, `020_translation_system_v1.sql`, `021_ai_coverage_sessions_v1.sql`, `022_ai_coverage_bbox_key.sql`
2) Variables de entorno configuradas:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET` (opcional)
   - `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`
   - `EXPO_PUBLIC_OPENAI_API_KEY` (solo si se valida enrichment IA)
3) `user_roles` poblada (al menos un `admin`)
4) App en dev con `expo start`
 
## Datos de referencia (para pruebas)
- Usuario A: rol `admin`
- Usuario B: sin rol
- Región activa con bbox de baja cobertura (<3 spots)
- Bbox con cobertura suficiente (>=3 spots) para validar no-activación
 
 ---
 
## 1) Location System V1
**Pasos**
1) Abrir mapa y mover el viewport a una región conocida.
2) Aplicar selección de región (si existe selector de región).
3) Comparar cantidad de spots visibles con/ sin regionId.

**Criterios de aceptación**
- [ ] **regionId** respeta formato `country.type.place` (ej. `mx.city.playa-del-carmen`)
- [ ] El filtro de mapa usa **viewport primero**, luego `regionId`
- [ ] No hay búsqueda avanzada ni ranking complejo fuera de alcance V1
 
## 2) Contribution System V1
**Pasos**
1) Abrir un spot y elegir **Sugerir edición** con usuario permitido.
2) Enviar cambios mínimos válidos.
3) Repetir con cambios inválidos (sin campos) para confirmar bloqueo.
4) Crear reporte desde spot-detail.
5) Entrar a Admin y rechazar una contribución pendiente.

**Criterios de aceptación**
- [ ] Contribución **create** válida con `name`, `type`, `location`
- [ ] Contribución **update** requiere al menos un campo editable
- [ ] Rechazo solo si `status=pending` y `reviewed_by` asignado
- [ ] `spotId` normalizado en contribuciones y reportes
- [ ] TrustScore bloquea **Suggest edit** / **Report** si no aplica
 
## 3) Critical Bugs V1
**Pasos**
1) Crear spot nuevo con imagen local y guardar.
2) Editar spot existente y reemplazar imagen con otra local.
3) Añadir foto en pin personal.
4) Ver cards en Home/Search/Map.
5) En spot-detail, solicitar IA bajo demanda.

**Criterios de aceptación**
- [ ] Imagen local se sube a Storage y persiste URL pública
- [ ] Edición reemplaza URL local por URL pública
- [ ] Pin photo se sube a Storage y guarda URL pública
- [ ] Cards usan fallback `shortDescription || description || whyItMatters`
- [ ] Map muestra `SpotInlineCard` con pin
- [ ] IA en spot-detail funciona solo bajo demanda
 
## 4) Image Loading System V1
**Pasos**
1) Abrir Home y observar cards y hero.
2) Abrir Search y Spot Detail.
3) Revisar skeletons en primera carga.
4) Verificar que no hay lazy delay en carga.

**Criterios de aceptación**
- [ ] `OptimizedImage` sin lazy delay (carga inmediata)
- [ ] Placeholder local consistente (no stock)
- [ ] Skeleton solo en primera carga
- [ ] Preload above-fold en Home / Search / Spot Detail
- [ ] Hero image con prioridad alta
 
## 5) Admin System V1
**Pasos**
1) Ingresar a `/admin` con usuario A (admin).
2) Ingresar a `/admin` con usuario B (sin rol).
3) Asignar rol a un usuario desde la UI.
4) Moderar una contribución (aplicar/rechazar/editar payload).
5) Validar métricas y contadores.

**Criterios de aceptación**
- [ ] Acceso `/admin` solo para rol `admin`
- [ ] Roles se pueden asignar/editar desde Admin
- [ ] Moderación respeta permisos por rol
- [ ] Métricas pending/applied/rejected actualizan
- [ ] Edición de payload y rollback visibles solo con permisos
 
## 6) Translation System V1
**Pasos**
1) Crear/insertar una traducción `published` para un spot/flow.
2) Cambiar idioma del dispositivo a EN.
3) Abrir cards y detail.
4) Cambiar a ES y repetir.

**Criterios de aceptación**
- [ ] ES es canon (no se modifica por traducciones)
- [ ] EN aparece solo si existe traducción `published`
- [ ] Fallback a ES funciona en spots y flows (cards + detail)
- [ ] No hay localización de UI operativa
 
## 7) AI Coverage System V1
**Pasos**
1) Ir a mapa, mover a bbox con baja cobertura (<3 spots **dentro del bbox visible**).
2) Pulsar botón IA (icono gems, controles izquierdos) y confirmar intención en el diálogo.
3) Cancelar durante el loader (botón "Cancelar" en overlay).
4) Reintentar y completar generación.
5) Repetir en mismo bbox dentro de cooldown → debe mostrar mensaje de cooldown (o "Generar de todos modos" si admin).
6) Revisar registro en Admin → sección "IA Coverage" (sesiones con status y `generated_count`).

**Notas de implementación (V1)**
- El conteo para "baja cobertura" es **estricto**: solo spots cuyo centro está dentro del bbox actual (sin relleno).
- Errores y avisos usan `showAlert` (visibles en web).
- Migraciones requeridas: `021_ai_coverage_sessions_v1.sql`, `022_ai_coverage_bbox_key.sql`, `028_ai_coverage_sessions_update_policy.sql`.
- Admin puede usar "Generar de todos modos" cuando el mensaje sea "Cobertura suficiente" para forzar generación en QA.

**Criterios de aceptación**
- [ ] Activación solo por intención confirmada (botón IA)
- [ ] No activa por pan/zoom continuo
- [ ] Umbral baja cobertura (<3 spots dentro del bbox)
- [ ] Cooldown por usuario/bbox aplicado
- [ ] POIs reales de Mapbox/OSM (coordenadas reales)
- [ ] IA solo enriquece texto/tipo (no inventa coordenadas)
- [ ] Loader narrativo + cancelación funcionan
- [ ] Registro Admin incluye bbox y `generated_count`
 
 ---
 
## Resultado esperado
- Todas las pruebas pasan sin errores críticos.
- Fallbacks visibles donde aplica.
- No hay cambios de arquitectura ni refactors fuera de alcance.
