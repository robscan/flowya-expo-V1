 # FLOWYA V2.0 — Image & Loader System
 
 ## Objetivo
 Definir un sistema unico de carga de imagenes y loaders, reusable en toda la plataforma, con reglas claras de placeholder, skeleton, lazy, prioridad y estados intermedios.
 
 ## Auditoria (estado actual)
 
 ### Componentes y helpers existentes
 - `OptimizedImage` centraliza carga con estados, skeleton, fallback y cola de concurrencia.
 - `SkeletonImage`, `SkeletonCard`, `SkeletonList` ya son componentes canonicos.
 - `useImagePreloader` precarga imagenes criticas via `expo-image`.
 - `imageCache` + `useImageLoadState` cachea estados en memoria.
 - `imageHelpers` define placeholder local, detecta stock y optimiza URLs de Unsplash.
 
 ### Superficies
 - **Spot cards**: usan `OptimizedImage` con fallback y skeleton.
 - **Flow cards**: no usan imagen; usan skeleton a nivel de card (sin imagen).
 - **Hero/Detail**: `ContentHeader` usa `ImageSlider` (OptimizedImage) o `OptimizedImage` directo; fallback a bloque vacio.
 - **Spot detail edit/personal photos**: uso directo de `Image` sin `OptimizedImage`.
 - **Map**: no hay reglas explicitas para imagenes (markers son iconos).
 - **Admin**: sin patrones especificos (texto/links).
 
 ### Inconsistencias detectadas
 - Placeholder no unificado: `OptimizedImage` fallback icono, `ContentHeader` usa bloque vacio, `ImageSlider` usa placeholder local.
 - Lazy loading solo en web (delay por indice), no por visibilidad/viewport.
 - Preload solo aplicado en Home (imagenes criticas), no en Search/Detail.
 - Uso mixto de `Image` y `OptimizedImage` en detail y fotos personales.
 - `expo-image` se usa solo para prefetch; render usa `Image` nativo.
 
 ## Sistema canonico propuesto
 
 ### 1) Placeholder (local, instantaneo)
 - **Fuente unica**: `getPlaceholderImageSource()` (asset local).
 - **Uso**: cuando no hay imagen valida o imagen es stock.
 - **Regla**: siempre renderizar algo (placeholder local o skeleton), nunca dejar vacio.
 
 ### 2) Skeletons
 - **Nivel de lista**: `SkeletonList` para grids/feeds.
 - **Nivel de card**: `SkeletonCard` para cards sin imagen o de carga inicial.
 - **Nivel de imagen**: `OptimizedImage` muestra `SkeletonImage` solo cuando hay carga real pendiente.
 - **Regla**: Skeleton solo en primera carga o cuando no hay datos; en refresh con datos, mantener contenido visible.
 
 ### 3) Lazy loading
 - **Base**: `OptimizedImage` con cola de concurrencia y delay escalonado en web.
 - **Mejora futura**: lazy por visibilidad (viewport) para web y listas largas.
 - **Regla**: no bloquear render; imagen se monta cuando `shouldLoad` es true.
 
 ### 4) Priority images
 - **Priority 1 (hero/above fold)**: precargar y permitir carga inmediata.
 - **Priority 2 (cards visibles)**: carga normal con cola.
 - **Priority 3 (offscreen)**: lazy con delay/viewport.
 
 Implementacion recomendada:
 - `useImagePreloader` en Home/Search/Detail para las primeras N imagenes visibles.
 - `OptimizedImage` siempre para render.
 
 ### 5) Estados intermedios UX
 - `not_requested`: no se muestra imagen, solo skeleton o placeholder.
 - `loading`: skeleton visible, fondo solido.
 - `available`: fade in (200ms).
 - `error`: fallback icono/placeholder.
 
 **Regla UX**: transicion suave skeleton -> imagen; evitar flash de placeholder.
 
 ## Reglas DO / DON'T
 
 ### DO
 - Usar `OptimizedImage` para cualquier imagen remota en UI.
 - Usar `getPlaceholderImageSource()` cuando no hay imagen valida.
 - Precargar imagenes criticas (hero y primeras cards).
 - Mantener tamaños explicitos en imagenes para evitar layout shift.
 - Usar skeletons a nivel de lista y card en carga inicial.
 
 ### DON'T
 - No usar `Image` directo para imagenes remotas en cards o hero.
 - No mostrar espacios vacios sin placeholder/skeleton.
 - No disparar precarga masiva (solo above fold).
 - No usar placeholders externos (stock) como fallback.
 - No usar labels o datos de red como placeholder.
 
 ## Reglas por superficie
 
 ### Spot Cards
 - `OptimizedImage` + skeleton interno.
 - Placeholder local si no hay imagen valida o es stock.
 - Priority: primeras 6 en Home/Search.
 
 ### Flow Cards
 - Sin imagen (por definicion).
 - SkeletonCard sin imagen en carga inicial.
 
 ### Map / Markers
 - No usar imagenes remotas en markers.
 - Si se agregan thumbnails en map overlays, usar `OptimizedImage` con prioridad baja.
 
 ### Detail (Spot/Flow)
 - Hero: `OptimizedImage` o `ImageSlider` con placeholder local.
 - Thumb grids (edit/personal): usar `OptimizedImage` si son remotas.
 - Preload del hero en entrada.
 
 ### Admin
 - Miniaturas (si existen) deben usar `OptimizedImage` con prioridad baja.
 - Evitar carga pesada en listas largas.
 
 ## Contratos tecnicos (minimos)
 - `OptimizedImage` es el wrapper canónico para render de imagen.
 - `useImageLoadState` + `imageCache` mantienen estados compartidos por URI.
 - `useImagePreloader` se usa solo para above-fold.
 
 ## Notas de performance
 - Mantener `MAX_CONCURRENT_LOADS` para evitar saturacion.
 - Evitar setState redundante en carga de imagen.
 - En web, preferir delay escalonado + futura deteccion de visibilidad.
