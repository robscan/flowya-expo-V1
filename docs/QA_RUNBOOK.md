# QA Runbook — Verificación rápida

Checklist ejecutable para validar el estado actual de la app, incluyendo el fix de **spot-detail** (Maximum update depth).

## Pre-requisitos

- [ ] `npm install` y `npx expo start` (o ya tienes la app corriendo)
- [ ] Variables de entorno: `EXPO_PUBLIC_SUPABASE_*`, `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` si usas mapa

## 1. Spot Detail (fix Maximum update depth)

**Objetivo:** Confirmar que ya no aparece "Maximum update depth exceeded" al abrir el detalle de un spot.

| Paso | Acción | Resultado esperado |
|------|--------|--------------------|
| 1.1 | Abrir la app y navegar a un spot (desde mapa, búsqueda o home) | La pantalla de detalle se abre sin colgarse |
| 1.2 | Abrir detalle de un spot **sin** fotos personales (no visitado o visitado sin fotos) | Sin error en consola, sin freeze |
| 1.3 | Abrir detalle de un spot **con** fotos personales (visitado y con imágenes en el pin) | Fotos se muestran; sin "Maximum update depth exceeded" |
| 1.4 | Volver atrás y entrar de nuevo al mismo u otro spot varias veces | Comportamiento estable, sin bucles |

**Si falla:** Revisar `app/spot-detail.tsx` (dependencia `personalPhotos` / `EMPTY_PHOTOS`).

## 2. Lint y tipos

```bash
npm run lint
npx tsc --noEmit
```

- [ ] Sin errores de lint
- [ ] Sin errores de TypeScript

## 3. Validación integral (FLOWYA V2.0)

Para el QA completo por áreas (Location, Contributions, Critical Bugs, Image Loading, Admin, Translation, AI Coverage), usar:

**`definitions/FLOWYA V2.0/00_STRATEGIC_INITIATIVES/QA_V1.md`**

Ahí están los pasos y criterios de aceptación por cada sistema.

## Resumen

- **Prioridad inmediata:** ejecutar sección 1 (Spot Detail) para validar el fix.
- **Siguiente:** sección 2 (lint/tsc).
- **Completo:** seguir QA_V1.md para validación integral.
