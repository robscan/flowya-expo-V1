 # Implementation Plan — Image Loading System (V1)
 
 ## 1. Objetivo tecnico del V1
 Unificar la carga de imagenes con reglas consistentes de placeholder, skeletons y prioridad, asegurando UX estable en Home, Search y Spot Detail.
 
 ## 2. Principios tecnicos congelados
 - OptimizedImage es obligatorio para imagen remota en UI.
 - Placeholder local unico para imagen invalida o faltante.
 - Skeleton solo en primera carga o cuando no hay datos.
 - Reglas de prioridad basicas: hero sobre cards visibles.
 - Sin lazy loading por visibilidad en V1.
 
 ## 3. Componentes del sistema
 - **OptimizedImage**: wrapper canonico con fallback local.
 - **Placeholders**: assets locales unificados.
 - **Skeletons**: variantes para lista, card e imagen.
 - **Preload**: precarga above-fold en Home/Search/Detail.
 - **Reglas de prioridad**: hero vs cards visibles.
 
 ## 4. Plan de ejecucion por fases
 
 ### Fase 1 — Contratos y reglas base
 - Validar uso obligatorio de OptimizedImage en superficies principales.
 - Establecer placeholder local unico en cards y hero.
 - **Que NO se toca**: lazy loading por visibilidad.
 
 ### Fase 2 — Skeletons consistentes
 - Normalizar skeletons en lista, card e imagen.
 - Mostrar skeleton solo en primera carga o sin datos.
 
 ### Fase 3 — Preload above-fold
 - Preload de imagenes en Home/Search/Detail.
 - Evitar preloads en superficies secundarias.
 
 ### Fase 4 — Prioridad basica
 - Aplicar prioridad hero sobre cards visibles.
 - Mantener regla simple sin heuristicas complejas.
 
 ### Fase 5 — Verificacion UX
 - Validar consistencia de placeholder y skeletons.
 - Verificar que no haya flashes persistentes en estados normales.
 
 ## 5. Checklist de validacion
 - OptimizedImage usado en cards y hero principales.
 - Placeholder local unico en todas las superficies.
 - Skeletons consistentes y solo en primera carga.
 - Preload above-fold en Home/Search/Detail.
 - Prioridad hero aplicada sin efectos secundarios.
 
 ## 6. Riesgos tecnicos conocidos
 - Flash de placeholder en edge cases de cache.
 - Performance suboptima en listas largas (sin lazy por visibilidad).
 
 ## 7. Que NO hacer (prohibiciones explicitas)
 - No implementar lazy loading por visibilidad.
 - No introducir optimizacion por red (slow-3G / save-data).
 - No agregar nuevos formatos de placeholder.
