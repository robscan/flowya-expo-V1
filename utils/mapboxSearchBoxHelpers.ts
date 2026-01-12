/**
 * Helpers para manejo seguro de Mapbox SearchBox
 * Previene errores 400 cuando se establecen valores programáticamente
 * 
 * SCOPE: Solución estratégica para prevenir errores de API cuando se establecen
 * valores programáticamente en el web component de Mapbox SearchBox
 */

/**
 * Validar si un valor parece ser coordenadas (lat, lng)
 */
export function looksLikeCoordinates(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  
  // Patrones comunes de coordenadas
  const coordPatterns = [
    /^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/, // "20.63531, -87.06559" o "20.63531,-87.06559"
    /^-?\d+\.?\d*\s+-?\d+\.?\d*$/, // "20.63531 -87.06559" (sin coma)
  ];
  
  return coordPatterns.some(pattern => pattern.test(trimmed));
}

/**
 * Validar que un valor sea una query de búsqueda válida (no coordenadas)
 */
export function isValidSearchQuery(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  
  // Rechazar si parece ser coordenadas
  if (looksLikeCoordinates(trimmed)) return false;
  
  // Debe tener al menos algunos caracteres de texto (no solo números)
  const hasText = /[a-zA-Z]/.test(trimmed);
  if (!hasText && /^\d/.test(trimmed)) return false;
  
  return true;
}

/**
 * Sanitizar valor antes de establecerlo en SearchBox
 * Retorna null si el valor no es válido (coordenadas)
 */
export function sanitizeSearchValue(value: string): string | null {
  if (!value || typeof value !== 'string') return null;
  
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  
  // Si es coordenadas, retornar null (no establecer)
  if (looksLikeCoordinates(trimmed)) {
    if (__DEV__) {
      console.warn('[Mapbox SearchBox] Rejected coordinates as search value:', trimmed);
    }
    return null;
  }
  
  return trimmed;
}

/**
 * Establecer valor en Mapbox SearchBox de forma segura
 * Previene errores 400 validando que el valor no sea coordenadas
 * 
 * @param element - El elemento mapbox-search-box
 * @param value - El valor a establecer (debe ser texto, no coordenadas)
 * @param options - Opciones: preventSuggestions para evitar llamadas a la API
 * @returns true si se estableció correctamente, false si se rechazó
 */
export function setMapboxSearchBoxValueSafely(
  element: HTMLElement,
  value: string,
  options: { preventSuggestions?: boolean } = {}
): boolean {
  const { preventSuggestions = true } = options;
  
  // Validar y sanitizar el valor
  const sanitized = sanitizeSearchValue(value);
  if (!sanitized) {
    return false; // No se estableció porque no es válido
  }
  
  try {
    const searchBox = element as any;
    
    // Si preventSuggestions, intentar deshabilitar temporalmente
    if (preventSuggestions) {
      // Opción 1: Usar método setValue si existe (puede prevenir sugerencias)
      if (typeof searchBox.setValue === 'function') {
        searchBox.setValue(sanitized);
        return true;
      }
      
      // Opción 2: Establecer atributo disabled temporalmente para prevenir sugerencias
      const wasDisabled = searchBox.hasAttribute('disabled');
      if (!wasDisabled) {
        searchBox.setAttribute('disabled', 'true');
      }
      
      // Establecer valor
      if (searchBox.value !== undefined) {
        searchBox.value = sanitized;
      }
      searchBox.setAttribute('value', sanitized);
      
      // Restaurar estado disabled después de un breve delay
      if (!wasDisabled) {
        setTimeout(() => {
          searchBox.removeAttribute('disabled');
        }, 100);
      }
      
      return true;
    } else {
      // Establecer normalmente (disparará sugerencias si el usuario está escribiendo)
      if (searchBox.value !== undefined) {
        searchBox.value = sanitized;
      }
      searchBox.setAttribute('value', sanitized);
      return true;
    }
  } catch (error) {
    if (__DEV__) {
      console.error('[Mapbox SearchBox] Error setting value safely:', error);
    }
    return false;
  }
}
