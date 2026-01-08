/**
 * Loading Helpers
 * CANONICAL: Funciones reutilizables para manejo de estados de carga
 * 
 * Centraliza patrones comunes de carga para evitar duplicación
 * y mantener consistencia en toda la aplicación.
 */

import { ReactNode } from 'react';

/**
 * Determina si se debe mostrar skeleton basado en estado de carga y datos
 * 
 * @param isLoading - Si los datos están cargando
 * @param hasData - Si hay datos disponibles
 * @returns true si se debe mostrar skeleton
 */
export function shouldShowSkeleton(isLoading: boolean, hasData: boolean): boolean {
  // Mostrar skeleton si está cargando O si no hay datos y aún está cargando (primera carga)
  return isLoading || (!hasData && isLoading);
}

/**
 * Determina si se debe mostrar empty state
 * 
 * @param isLoading - Si los datos están cargando
 * @param hasData - Si hay datos disponibles
 * @returns true si se debe mostrar empty state
 */
export function shouldShowEmpty(isLoading: boolean, hasData: boolean): boolean {
  // Mostrar empty state solo si NO está cargando Y no hay datos
  return !isLoading && !hasData;
}

/**
 * Determina si se debe mostrar contenido
 * 
 * @param isLoading - Si los datos están cargando
 * @param hasData - Si hay datos disponibles
 * @returns true si se debe mostrar contenido
 */
export function shouldShowContent(isLoading: boolean, hasData: boolean): boolean {
  // Mostrar contenido solo si NO está cargando Y hay datos
  return !isLoading && hasData;
}

/**
 * Renderiza contenido o skeleton basado en estado de carga
 * 
 * @param isLoading - Si los datos están cargando
 * @param hasData - Si hay datos disponibles
 * @param renderContent - Función que renderiza el contenido real
 * @param renderSkeleton - Función que renderiza el skeleton
 * @returns ReactNode con contenido o skeleton
 */
export function renderContentOrSkeleton(
  isLoading: boolean,
  hasData: boolean,
  renderContent: () => ReactNode,
  renderSkeleton: () => ReactNode
): ReactNode {
  if (shouldShowSkeleton(isLoading, hasData)) {
    return renderSkeleton();
  }
  return renderContent();
}

/**
 * Renderiza contenido, skeleton o empty state basado en estado de carga
 * 
 * @param isLoading - Si los datos están cargando
 * @param hasData - Si hay datos disponibles
 * @param renderContent - Función que renderiza el contenido real
 * @param renderSkeleton - Función que renderiza el skeleton
 * @param renderEmpty - Función que renderiza el empty state
 * @returns ReactNode con contenido, skeleton o empty state
 */
export function renderContentSkeletonOrEmpty(
  isLoading: boolean,
  hasData: boolean,
  renderContent: () => ReactNode,
  renderSkeleton: () => ReactNode,
  renderEmpty: () => ReactNode
): ReactNode {
  if (shouldShowSkeleton(isLoading, hasData)) {
    return renderSkeleton();
  }
  if (shouldShowEmpty(isLoading, hasData)) {
    return renderEmpty();
  }
  return renderContent();
}

/**
 * Combina múltiples estados de carga en uno solo
 * 
 * @param loadingStates - Array de estados de carga
 * @returns true si alguno está cargando
 */
export function anyLoading(...loadingStates: boolean[]): boolean {
  return loadingStates.some((loading) => loading === true);
}

/**
 * Combina múltiples estados de carga en uno solo (todos deben estar cargados)
 * 
 * @param loadingStates - Array de estados de carga
 * @returns true solo si todos están cargando
 */
export function allLoading(...loadingStates: boolean[]): boolean {
  return loadingStates.every((loading) => loading === true);
}
