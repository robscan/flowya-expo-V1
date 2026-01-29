 # FLOWYA V2.0 — Critical Bugs Fix Plan
 
 ## Contexto
 Este documento propone fixes para bugs criticos sin romper los sistemas definidos (contributions, pins, cards). No incluye cambios de codigo; solo propuesta y plan.
 
 ## Bugs y propuesta de fix
 
 ### 1) Imagenes no se guardan al editar spot
 **Sintoma**
 - Al editar un spot y cambiar imagen, la imagen no persiste.
 
 **Causa probable**
 - `useImageUpload` genera URI local optimizada.
 - `createSpotContribution` guarda payload con `image.url` local.
 - El applier en DB solo persiste JSON `image` sin subir archivo a storage.
 
 **Fix propuesto**
 - Añadir pipeline de upload a storage antes de crear contribution.
 - Guardar en contribution una URL publica estable, no una URI local.
 - Mantener compatibilidad con `image.url` actual (string).
 
 **Riesgo**
 - Requiere storage bucket y permisos; sin eso, la imagen nunca sera accesible desde otros dispositivos.
 
 **Pruebas**
 - Editar spot en web/iOS/Android, subir imagen, cerrar app, reabrir: imagen visible.
 
 ---
 
 ### 2) Imagenes no se guardan como notas (fotos personales)
 **Sintoma**
 - Fotos personales agregadas en diario no persisten.
 
 **Causa probable**
 - `addPinPhoto` guarda URI local en `personalPhotos`.
 - `pinsService` sincroniza strings a Supabase; el backend no almacena archivos.
 
 **Fix propuesto**
 - Subir fotos personales a storage y guardar URL publica en `personalPhotos`.
 - Mantener soporte de offline: cache local con URI hasta sincronizar.
 
 **Riesgo**
 - Sin manejo de subida diferida, offline pierde persistencia server-side.
 
 **Pruebas**
 - Agregar foto personal, refrescar, reabrir y cambiar dispositivo: foto visible.
 
 ---
 
 ### 3) IA no funciona en editar spot
 **Sintoma**
 - Boton IA en editar spot no genera contenido.
 
 **Causa probable**
 - UI en `spot-detail` usa `handleAskAi` (Alert) y no llama `useSpotForm.generateContent`.
 - `generateContent` esta protegido por `existingSpot` y configuracion AI, pero no se invoca.
 
 **Fix propuesto**
 - Conectar boton IA en modo edicion a `form.generateContent`.
 - Mostrar estado `loading` y error usando `aiState/aiError`.
 - Mantener regla: IA solo bajo demanda, no automatico.
 
 **Riesgo**
 - Si `EXPO_PUBLIC_OPENAI_API_KEY` no esta configurada, el error debe mostrarse claramente.
 
 **Pruebas**
 - En modo edicion, presionar IA: contenido aparece en `shortDescription` y se marca `hasGeneratedContent`.
 
 ---
 
 ### 4) Texto corto no aparece en cards
 **Sintoma**
 - Cards muestran texto vacio o legacy, no el shortDescription.
 
 **Causa probable**
 - `SpotMediaCard` usa `spot.description` en lugar de `spot.shortDescription`.
 
 **Fix propuesto**
 - Priorizar `shortDescription` en cards con fallback a `whyItMatters` y `description`.
 - Mantener compatibilidad temporal con campos legacy.
 
 **Pruebas**
 - Spot con `shortDescription` se muestra en cards (Home/Search/Saved).
 
 ---
 
 ### 5) Falta accion de pin en card del mapa
 **Sintoma**
 - En Map, el card inline no permite pinnear.
 
 **Causa probable**
 - `SpotInlineCard` no incluye accion de pin ni overlay; Map no agrega control adicional.
 
 **Fix propuesto**
 - Agregar accion de pin en el card del mapa (boton o chip).
 - Conectar a `useSaved` (`pinSpot`, `changePinState`, `unpinSpot`).
 - Mantener consistencia con comportamiento de cards de Home (to_visit/visited).
 
 **Pruebas**
 - Desde Map, pinnear y cambiar estado; reflejar en Saved/Pinned.
 
 ## Consideraciones de no-ruptura
 - Contributions siguen siendo el unico mecanismo de edicion publica.
 - Pins siguen siendo privados; solo se agrega persistencia real de media.
 - Cards no recalculan distancia ni cambian flujos de datos.
 
 ## Plan de ejecucion sugerido (sin codigo)
 1) Implementar upload a storage para imagen de spot (edicion).
 2) Implementar upload a storage para fotos personales (pins).
 3) Conectar UI de IA en edit con `generateContent`.
 4) Actualizar cards para usar `shortDescription`.
 5) Agregar accion de pin en card del mapa.
 
 ## Diagrama (flujo de imagen)
 ```mermaid
 flowchart TD
   selectImage[UserSelectImage] --> optimizeImage[OptimizeImage]
   optimizeImage --> uploadStorage[UploadToStorage]
   uploadStorage --> publicUrl[PublicURL]
   publicUrl --> contribution[SpotContributionPayload]
   publicUrl --> pinPhotos[PinPersonalPhotos]
 ```
