 # Scope V1 — Image Loading System
 
 ## Objetivo del V1
 Unificar la carga de imagenes con reglas consistentes de placeholder, skeleton, prioridad y estados, garantizando UX estable en las superficies principales.
 
 ## Incluido en V1 (SI)
 - OptimizedImage como wrapper canonico para imagen remota.
 - Placeholder local unico para imagen invalida o stock.
 - Skeletons consistentes (lista, card e imagen) solo en primera carga.
 - Preload de imagenes above-fold en Home/Search/Detail.
 - Reglas de prioridad basicas (hero vs cards visibles).
 - Consistencia de placeholders en cards y hero.
 
 ## Fuera de alcance V1 (NO)
 - Lazy loading por visibilidad/viewport.
 - Optimizacion por red (slow-3G / save-data).
 - Thumbnails en Map overlays o superficies secundarias.
 - Optimizaciones avanzadas de cache persistente.
 - Nuevos formatos de placeholder o assets dinamicos.
 - Ajustes de performance finos por plataforma.
 
 ## Decisiones ya tomadas (congeladas)
 - OptimizedImage es obligatorio para imagen remota en UI.
 - Placeholder local, nunca stock ni externo.
 - Skeleton solo cuando no hay datos o primera carga.
 
 ## Decisiones pendientes post-V1
 - Lazy por visibilidad para web y listas largas.
 - Ajuste de concurrencia de cargas por plataforma.
 - Politica de precarga para pantallas secundarias.
 
 ## Riesgos aceptados en V1
 - Flash de placeholder en edge cases de cache.
 - Performance suboptima en listas muy largas hasta implementar lazy por visibilidad.
