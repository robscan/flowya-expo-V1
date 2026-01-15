# FLOWYA V2.0 — MODELO DE DATOS
Fuente canónica: `DEFINICIONES_CONSOLIDADAS_V2_0.md`
Estado: Borrador controlado (sin implementación)

---

## Principios del modelo

- Solo entidades canónicas.
- No existe WorldSpot/UserSpot.
- Pins son privados y nunca modifican Spot.
- Spots se versionan vía SpotContribution + applier.
- normalizeSpotId() aplicada a cualquier ID legacy.

---

## Entidades canónicas

### Spot
- Identidad pública canónica.
- Campos base: id, name, type, location, image, shortDescription, createdAt, updatedAt.
- Estados: needs_review (por reportes), no auto-ocultamiento.

### SpotVersion
- Snapshot inmutable del Spot aplicado por applier.
- Referencia a Spot y a SpotContribution aplicada.
 - Fuente exclusiva para actualizar el estado canónico del Spot.

### SpotContribution
- Propuesta de edición pública.
- Campos base: id, spotId, authorId, payload, status (pending/applied/rejected), createdAt.
 - No modifica Spot de forma directa.
 - Para creación: spotId puede ser nulo y el applier crea el Spot.

### SpotMediaPublic
- Media pública asociada a Spot.
- Estados: active, soft_hidden.
- Motivos de reporte válidos: incorrecta, no es del lugar, ofensiva, spam.

### SpotReport
- Reportes de comunidad.
- Afecta: SpotMediaPublic (soft_hidden por umbral) y Spot (needs_review).
- Campos base: id, spotId, mediaId (opcional), reporterId, reason, createdAt.
- Umbrales canónicos:
  - SpotMediaPublic: soft_hidden a partir de 3 reportes únicos.
  - Spot: needs_review a partir de 5 reportes únicos.

### Pin
- Privado por usuario (diario personal).
- Nunca modifica Spot.

### Flow
- Definición reusable de recorrido.

### FlowRun
- Ejecución viva del Flow.

### UserProfile
- Perfil público/privado del usuario.

### UserStats
- Métricas y confianza (TrustScore interno).

#### TrustScore (interno)
- No se expone valor numerico.
- Se representa en niveles: `nuevo`, `creciente`, `confiable`.
- Derivado de contribuciones aplicadas.
- Reglas iniciales:
  - `nuevo`: 0 contribuciones aplicadas.
  - `creciente`: 1-2 contribuciones aplicadas.
  - `confiable`: 3+ contribuciones aplicadas.
- Permisos progresivos se derivan del nivel (ver DECISIONES_CANONICAS).

---

## Relaciones clave

- Spot 1..N SpotVersion.
- Spot 1..N SpotContribution.
- SpotContribution 1..1 SpotVersion (al ser aplicada).
- Spot 1..N SpotMediaPublic.
- SpotMediaPublic 0..N SpotReport.
- Spot 0..N SpotReport.
- UserProfile 1..N Pin.
- Flow 1..N FlowRun.

---

## Flujo canónico de edición pública

1) Usuario crea SpotContribution.
2) Applier valida y aplica.
3) Se crea SpotVersion (snapshot).
4) Spot se actualiza a partir de la versión aplicada.

---

## Applier (regla canónica)

- Implementación preferente: DB function.
- Edge Function es opcional y posterior si se justifica.
- Debe ser determinístico y auditable.

---

## Moderación (resumen)

- Reportes siempre disponibles.
- SpotMediaPublic pasa a soft_hidden por umbral canónico.
- Spot se marca needs_review por reportes.
- Spot nunca se oculta automáticamente en V2.0.
- Registro obligatorio para Admin Panel (feed de actividad).
