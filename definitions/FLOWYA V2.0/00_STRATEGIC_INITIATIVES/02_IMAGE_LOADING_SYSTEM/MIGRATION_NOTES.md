 # FLOWYA V2.0 — Image & Loader System (Migration Notes)
 
 ## Objetivo
 Adoptar el sistema canonico sin romper UX ni performance, empezando por superficies de mayor impacto.
 
 ## Orden recomendado
 1) Cards y grids (Home/Search/Saved).
 2) Hero/Detail (Spot/Flow).
 3) Map overlays y admin (si aplica).
 
 ## Cambios por superficie
 
 ### Spot Cards (Home/Search/Saved)
 - Asegurar que todas las imagenes pasen por `OptimizedImage`.
 - Mantener placeholder local via `getPlaceholderImageSource`.
 - Preload de primeras N imagenes visibles (ya existe en Home).
 
 ### Flow Cards
 - Sin cambios de imagen (no usan imagen).
 - Verificar uso consistente de `SkeletonCard` sin imagen.
 
 ### Spot Detail (hero y grids)
 - Reemplazar uso directo de `Image` para thumbnails remotos por `OptimizedImage`.
 - `ContentHeader` ya usa `OptimizedImage`/`ImageSlider`; unificar fallback a placeholder local en hero.
 - Aplicar `useImagePreloader` al hero cuando entra al detail.
 
 ### Personal Photos (diario)
 - Mantener `Image` solo para fotos locales si no hay URL remota.
 - Si hay URL remota, usar `OptimizedImage` para estados y fallback.
 
 ### Map overlays / Admin
 - Si se agregan thumbnails o media, usar `OptimizedImage` con prioridad baja.
 - Evitar precarga masiva en listas admin.
 
 ## Riesgos y mitigaciones
 - **Flash de placeholder**: usar `imageCache` y `useImageLoadState` para evitar skeleton falso.
 - **Carga lenta en web**: mantener delay escalonado y evaluar lazy por visibilidad.
 - **Inconsistencia de placeholders**: bloquear placeholders externos (stock) y usar asset local.
 
 ## Validaciones post-migracion
 - No hay imagenes remotas renderizadas con `Image` directo.
 - Skeletons solo en primera carga; refresh mantiene contenido.
 - Hero y cards usan el mismo placeholder local.
 - Preload aplicado solo a above-fold (no masivo).
