/**
 * LocationSelectorWeb - Selector de ubicación Web-First
 * RECONSTRUCCIÓN TOTAL - Flujo secuencial con control total
 * 
 * Nuevo modelo:
 * - Paso 1: Buscar dirección (Mapbox Search Box - rollback) → NO se muestra mapa
 * - Paso 2: Confirmar ubicación en mapa → Mapa aparece después de seleccionar
 * - Paso 3: Botón "Use my current location" → Siempre disponible
 * 
 * Principios:
 * - Estado único: { coordinates, address }
 * - NO sincronización bidireccional Search ↔ Map
 * - NO seguir al usuario automáticamente
 * - NO mapa visible sin coordenadas
 * - Mapbox Search Box web component (rollback: mejor calidad de sugerencias)
 * - Todo evento explícito y trazable
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FlowyaMapView, FlowyaMapViewRef } from '@/components/MapView';
import { borderRadius } from '@/constants/borders';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMapboxSearchBoxScript } from '@/hooks/useMapboxSearchBoxScript';
import { MAPBOX_ACCESS_TOKEN } from '@/utils/mapsConfig';
import { reverseGeocodeMapbox } from '@/utils/mapboxGeocoding';
import { sanitizeSearchValue, isValidSearchQuery } from '@/utils/mapboxSearchBoxHelpers';
import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { MapControls } from '@/components/ui/MapControls';

/**
 * FASE 4-5: LocationSelectorWeb actualizado para aceptar ambos formatos (lat/lng y latitude/longitude)
 */
export interface LocationSelectorWebProps {
  /** Ubicación actual (compatible con ambos formatos) */
  location: { lat: number; lng: number } | { latitude: number; longitude: number } | null;
  /** Callback cuando cambia la ubicación (compatible con ambos formatos) */
  onLocationChange: (location: { lat: number; lng: number } | { latitude: number; longitude: number }) => void;
  /** Callback cuando hay un nombre comercial disponible (solo POI, NO direcciones) */
  onCommercialNameChange?: (commercialName: string | null) => void;
  /** Ubicación del usuario (opcional, compatible con ambos formatos) */
  userLocation?: { lat: number; lng: number } | { latitude: number; longitude: number } | null;
  /** Si está deshabilitado */
  disabled?: boolean;
  /** Altura del mapa (default: 200) */
  mapHeight?: number;
  /** Estilo adicional */
  style?: any;
}

/**
 * FASE 4-5: LocationState actualizado para usar formato interno (latitude/longitude)
 * pero aceptar ambos formatos en props
 */
interface LocationState {
  coordinates: { latitude: number; longitude: number } | null;
  address: string | null;
}

/**
 * FASE 4-5: Helper para normalizar location a formato interno
 */
function normalizeLocationToInternal(
  location: { lat: number; lng: number } | { latitude: number; longitude: number } | null
): { latitude: number; longitude: number } | null {
  if (!location) return null;
  
  if ('lat' in location && 'lng' in location) {
    return { latitude: location.lat, longitude: location.lng };
  } else if ('latitude' in location && 'longitude' in location) {
    return location;
  }
  return null;
}

/**
 * FASE 4-5: Helper para normalizar location a formato de salida (mantener formato de entrada)
 */
function normalizeLocationToOutput(
  location: { latitude: number; longitude: number },
  inputFormat: { lat: number; lng: number } | { latitude: number; longitude: number } | null
): { lat: number; lng: number } | { latitude: number; longitude: number } {
  // Si el input era lat/lng, devolver lat/lng; sino devolver latitude/longitude
  if (inputFormat && 'lat' in inputFormat) {
    return { lat: location.latitude, lng: location.longitude };
  }
  return location;
}

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

/**
 * LocationSelectorWeb - Selector de ubicación Web-First
 * Flujo secuencial: Search (Mapbox Search Box) → Confirmación en mapa → Current location
 */
export function LocationSelectorWeb({
  location: locationProp,
  onLocationChange,
  onCommercialNameChange,
  userLocation,
  disabled = false,
  mapHeight = 200,
  style,
}: LocationSelectorWebProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // ============================================================================
  // ESTADO ÚNICO
  // ============================================================================

  // FASE 4-5: Normalizar locationProp a formato interno
  const normalizedLocationProp = normalizeLocationToInternal(locationProp);
  
  const [locationState, setLocationState] = useState<LocationState>({
    coordinates: normalizedLocationProp,
    address: null,
  });
  
  // Guardar formato original para mantenerlo en onLocationChange
  const originalLocationFormatRef = useRef(locationProp);

  // ============================================================================
  // MAPBOX SEARCH BOX (WEB ONLY) - Rollback a componente anterior
  // ============================================================================

  const { isLoaded: isSearchBoxLoaded, error: searchBoxError } = useMapboxSearchBoxScript();
  const searchBoxContainerIdRef = useRef(`mapbox-search-box-container-${Math.random().toString(36).substr(2, 9)}`);
  const searchBoxElementRef = useRef<HTMLElement | null>(null);

  // ============================================================================
  // REFS
  // ============================================================================

  const mapViewRef = useRef<FlowyaMapViewRef>(null);

  // ============================================================================
  // SINCRONIZACIÓN CON PROPS EXTERNOS
  // ============================================================================

  // FASE 4-5: Actualizar cuando cambia locationProp (compatible con ambos formatos)
  useEffect(() => {
    const normalized = normalizeLocationToInternal(locationProp);
    originalLocationFormatRef.current = locationProp;
    
    if (normalized) {
      setLocationState((prev) => {
        if (
          prev.coordinates?.latitude !== normalized.latitude ||
          prev.coordinates?.longitude !== normalized.longitude
        ) {
          return {
            coordinates: normalized,
            address: prev.address, // Mantener address si existe
          };
        }
        return prev;
      });
    } else {
      setLocationState({
        coordinates: null,
        address: null,
      });
    }
  }, [locationProp]);

  // ============================================================================
  // EFECTO PARA CENTRAR MAPA CUANDO HAY COORDENADAS
  // ============================================================================

  // Cuando las coordenadas cambian, centrar el mapa (después de que se monte)
  useEffect(() => {
    if (!locationState.coordinates) return;

    // Usar un pequeño delay para asegurar que el mapa se haya montado
    const timeoutId = setTimeout(() => {
      if (mapViewRef.current && locationState.coordinates) {
        mapViewRef.current.flyToCoordinates(locationState.coordinates, 15);
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [locationState.coordinates]);

  // ============================================================================
  // HELPER: Actualizar valor en Mapbox Search Box
  // ============================================================================

  /**
   * Establece el valor en el Mapbox Search Box y cierra el dropdown
   * Previene errores 400 validando que el valor no sea coordenadas
   */
  const setSearchBoxValue = useCallback((value: string, closeDropdown = true) => {
    if (!searchBoxElementRef.current || !value) {
      return;
    }

    // Validar que el valor no sea coordenadas antes de establecerlo
    const sanitized = sanitizeSearchValue(value);
    if (!sanitized) {
      // Si el valor es coordenadas, no establecerlo (previene error 400)
      if (__DEV__) {
        console.warn('[LocationSelectorWeb] Skipped setting coordinates as search value:', value);
      }
      return;
    }

    // Guardar el valor sanitizado para usarlo en todos los setTimeout
    const valueToSet = sanitized;

    setTimeout(() => {
      if (!searchBoxElementRef.current) {
        return;
      }

      try {
        const searchBox = searchBoxElementRef.current as any;
        
        // Establecer atributo value en el componente web (algunos web components lo requieren)
        if (searchBox.hasAttribute) {
          searchBox.setAttribute('value', valueToSet);
        }
        // También establecer como propiedad
        if (searchBox.value !== undefined) {
          searchBox.value = valueToSet;
        }
        
        // Intentar método público si existe
        if (typeof searchBox.setValue === 'function') {
          searchBox.setValue(valueToSet);
          if (closeDropdown && typeof searchBox.blur === 'function') {
            searchBox.blur();
          }
        }
        // Intentar acceder al input interno a través del shadow DOM
        else if (searchBox.shadowRoot) {
          const input = searchBox.shadowRoot.querySelector('input[type="text"], input[type="search"]');
          if (input) {
            // Primero establecer el atributo value en el componente web (algunos web components lo requieren)
            searchBox.setAttribute('value', valueToSet);
            if (searchBox.value !== undefined) {
              searchBox.value = valueToSet;
            }
            
            (input as HTMLInputElement).value = valueToSet;
            // Remover placeholder temporalmente para forzar que se muestre el valor
            const originalPlaceholder = (input as HTMLInputElement).placeholder;
            (input as HTMLInputElement).placeholder = '';
            // Buscar y ocultar elementos de placeholder separados (el componente puede usar pseudo-elementos o elementos separados)
            const placeholderElements = searchBox.shadowRoot.querySelectorAll('[class*="Placeholder"], [class*="placeholder"], label[for]');
            placeholderElements.forEach((el: any) => {
              (el as HTMLElement).style.display = 'none';
              (el as HTMLElement).style.visibility = 'hidden';
            });
            // Aplicar estilo CSS para ocultar placeholder cuando hay valor
            const inputElement = input as HTMLInputElement;
            inputElement.style.setProperty('--placeholder-opacity', '0');
            inputElement.classList.add('has-value');
            // Disparar evento input para que el Mapbox Search Box reconozca el cambio
            input.dispatchEvent(new Event('input', { bubbles: true }));
            // También disparar evento change para mayor compatibilidad
            input.dispatchEvent(new Event('change', { bubbles: true }));
            // Disparar evento en el componente web también
            searchBox.dispatchEvent(new CustomEvent('input', { detail: { value: valueToSet }, bubbles: true }));
            // Forzar focus y blur para actualizar estado visual
            (input as HTMLInputElement).focus();
            setTimeout(() => {
              (input as HTMLInputElement).blur();
              // Re-verificar y re-establecer después del blur (el componente podría limpiarlo)
              setTimeout(() => {
                if ((input as HTMLInputElement).value !== valueToSet && valueToSet) {
                  (input as HTMLInputElement).value = valueToSet;
                  searchBox.setAttribute('value', valueToSet);
                  input.dispatchEvent(new Event('input', { bubbles: true }));
                }
              }, 50);
            }, 10);
            // Restaurar placeholder después de un momento (si aún no tiene valor, se mostrará)
            setTimeout(() => {
              if ((input as HTMLInputElement).value === '') {
                (input as HTMLInputElement).placeholder = originalPlaceholder;
                inputElement.classList.remove('has-value');
                placeholderElements.forEach((el: any) => {
                  (el as HTMLElement).style.display = '';
                  (el as HTMLElement).style.visibility = '';
                });
              }
            }, 50);
            
            // Cerrar el dropdown si se solicita
            if (closeDropdown) {
              // Buscar y ocultar el contenedor de resultados ANTES del blur
              const resultsContainer = searchBox.shadowRoot.querySelector('[class*="Results"], [class*="results"], [class*="Listbox"], [class*="listbox"]');
              if (resultsContainer) {
                (resultsContainer as HTMLElement).style.display = 'none';
                (resultsContainer as HTMLElement).style.visibility = 'hidden';
                (resultsContainer as HTMLElement).setAttribute('aria-hidden', 'true');
              }
              
              // Remover focus de cualquier elemento activo dentro del shadow DOM
              const activeElement = searchBox.shadowRoot.activeElement;
              if (activeElement && typeof (activeElement as any).blur === 'function') {
                (activeElement as any).blur();
              }
              
              // Finalmente hacer blur en el input
              setTimeout(() => {
                if (input && searchBox.shadowRoot) {
                  (input as HTMLInputElement).blur();
                  
                  // Forzar el foco fuera del componente
                  if (document.activeElement === searchBox) {
                    (document.body as HTMLElement).focus();
                  }
                }
              }, 50);
            }
          }
        }
        // Intentar acceder al input directamente (si no hay shadow DOM)
        else {
          const input = searchBox.querySelector('input[type="text"], input[type="search"]');
          if (input) {
            // Primero establecer el atributo value en el componente web (algunos web components lo requieren)
            searchBox.setAttribute('value', valueToSet);
            if (searchBox.value !== undefined) {
              searchBox.value = valueToSet;
            }
            
            (input as HTMLInputElement).value = valueToSet;
            // Remover placeholder temporalmente para forzar que se muestre el valor
            const originalPlaceholder = (input as HTMLInputElement).placeholder;
            (input as HTMLInputElement).placeholder = '';
            // Buscar y ocultar elementos de placeholder separados (el componente puede usar pseudo-elementos o elementos separados)
            const placeholderElements = searchBox.querySelectorAll('[class*="Placeholder"], [class*="placeholder"], label[for]');
            placeholderElements.forEach((el: any) => {
              (el as HTMLElement).style.display = 'none';
              (el as HTMLElement).style.visibility = 'hidden';
            });
            // También buscar en el document completo por si el placeholder está fuera del searchBox
            const allPlaceholderElements = document.querySelectorAll('[class*="Placeholder"], [class*="placeholder"]');
            allPlaceholderElements.forEach((el: any) => {
              const rect = (el as HTMLElement).getBoundingClientRect();
              const searchBoxRect = searchBox.getBoundingClientRect();
              // Solo ocultar si está cerca del searchBox
              if (rect.top >= searchBoxRect.top && rect.bottom <= searchBoxRect.bottom &&
                  rect.left >= searchBoxRect.left && rect.right <= searchBoxRect.right) {
                (el as HTMLElement).style.display = 'none';
                (el as HTMLElement).style.visibility = 'hidden';
              }
            });
            // Aplicar estilo CSS para ocultar placeholder cuando hay valor
            const inputElement = input as HTMLInputElement;
            inputElement.style.setProperty('--placeholder-opacity', '0');
            inputElement.classList.add('has-value');
            // Agregar estilo inline para forzar que el placeholder no se muestre
            const style = document.createElement('style');
            style.textContent = `
              input.has-value::placeholder {
                opacity: 0 !important;
                color: transparent !important;
              }
              input.has-value::-webkit-input-placeholder {
                opacity: 0 !important;
                color: transparent !important;
              }
              input.has-value::-moz-placeholder {
                opacity: 0 !important;
                color: transparent !important;
              }
              input.has-value:-ms-input-placeholder {
                opacity: 0 !important;
                color: transparent !important;
              }
            `;
            if (!document.getElementById('mapbox-search-box-placeholder-hide')) {
              style.id = 'mapbox-search-box-placeholder-hide';
              document.head.appendChild(style);
            }
            // Disparar evento input para que el Mapbox Search Box reconozca el cambio
            input.dispatchEvent(new Event('input', { bubbles: true }));
            // También disparar evento change para mayor compatibilidad
            input.dispatchEvent(new Event('change', { bubbles: true }));
            // Disparar evento en el componente web también
            searchBox.dispatchEvent(new CustomEvent('input', { detail: { value: valueToSet }, bubbles: true }));
            // Forzar focus y blur para actualizar estado visual
            (input as HTMLInputElement).focus();
            setTimeout(() => {
              (input as HTMLInputElement).blur();
              // Re-verificar y re-establecer después del blur (el componente podría limpiarlo)
              setTimeout(() => {
                if ((input as HTMLInputElement).value !== valueToSet && valueToSet) {
                  (input as HTMLInputElement).value = valueToSet;
                  searchBox.setAttribute('value', valueToSet);
                  input.dispatchEvent(new Event('input', { bubbles: true }));
                }
              }, 50);
            }, 10);
            // Restaurar placeholder después de un momento (si aún no tiene valor, se mostrará)
            setTimeout(() => {
              if ((input as HTMLInputElement).value === '') {
                (input as HTMLInputElement).placeholder = originalPlaceholder;
                inputElement.classList.remove('has-value');
                placeholderElements.forEach((el: any) => {
                  (el as HTMLElement).style.display = '';
                  (el as HTMLElement).style.visibility = '';
                });
              }
            }, 50);
            
            // Cerrar el dropdown si se solicita
            if (closeDropdown) {
              // El contenedor de resultados puede estar en el document, no necesariamente dentro del searchBox
              // Buscar por múltiples selectores en todo el document
              const selectors = [
                '[class*="Results"]',
                '[class*="results"]',
                '[class*="Listbox"]',
                '[class*="listbox"]',
                '[class*="Suggestions"]',
                '[class*="suggestions"]',
                '[role="listbox"]',
                '[aria-label*="result"]',
                '[aria-label*="suggestion"]',
              ];
              
              let resultsContainer: HTMLElement | null = null;
              
              // Primero intentar dentro del searchBox
              for (const selector of selectors) {
                resultsContainer = searchBox.querySelector(selector);
                if (resultsContainer) break;
              }
              
              // Si no se encuentra, buscar en el document completo
              // El dropdown puede estar posicionado absolutamente fuera del searchBox
              if (!resultsContainer) {
                for (const selector of selectors) {
                  const allMatches = document.querySelectorAll(selector);
                  for (const match of Array.from(allMatches)) {
                    const element = match as HTMLElement;
                    // Verificar que esté visible y relacionado con el searchBox (mismo prefijo de clase)
                    const searchBoxClassPrefix = searchBox.className?.split('--')[0] || '';
                    const matchClassPrefix = element.className?.split('--')[0] || '';
                    if (searchBoxClassPrefix && matchClassPrefix === searchBoxClassPrefix) {
                      resultsContainer = element;
                      break;
                    }
                  }
                  if (resultsContainer) break;
                }
              }
              
              // Si aún no se encuentra, buscar por posición relativa al searchBox
              if (!resultsContainer && searchBox.parentElement) {
                const searchBoxRect = searchBox.getBoundingClientRect();
                for (const selector of selectors) {
                  const allMatches = document.querySelectorAll(selector);
                  for (const match of Array.from(allMatches)) {
                    const element = match as HTMLElement;
                    const elementRect = element.getBoundingClientRect();
                    // Verificar que esté cerca del searchBox (verticalmente abajo)
                    if (elementRect.top >= searchBoxRect.bottom && 
                        elementRect.left <= searchBoxRect.right && 
                        elementRect.right >= searchBoxRect.left &&
                        element.style.display !== 'none') {
                      resultsContainer = element;
                      break;
                    }
                  }
                  if (resultsContainer) break;
                }
              }
              
              if (resultsContainer) {
                (resultsContainer as HTMLElement).style.display = 'none';
                (resultsContainer as HTMLElement).style.visibility = 'hidden';
                (resultsContainer as HTMLElement).setAttribute('aria-hidden', 'true');
                (resultsContainer as HTMLElement).style.opacity = '0';
                (resultsContainer as HTMLElement).style.pointerEvents = 'none';
              }
              
              // Finalmente hacer blur en el input
              setTimeout(() => {
                if (input) {
                  (input as HTMLInputElement).blur();
                  
                  // Forzar el foco fuera del componente
                  if (document.activeElement === searchBox || (input as HTMLElement).contains(document.activeElement)) {
                    (document.body as HTMLElement).focus();
                  }
                }
              }, 100);
            }
          }
        }
      } catch (error) {
        if (__DEV__) {
          console.warn('Could not set value on Mapbox Search Box:', error);
        }
      }
      
      // Verificar que el valor persiste después de un tiempo (para detectar si el componente lo limpia)
      setTimeout(() => {
        if (searchBoxElementRef.current) {
          const searchBox = searchBoxElementRef.current as any;
          let currentValue: string | null = null;
          
          if (searchBox.shadowRoot) {
            const input = searchBox.shadowRoot.querySelector('input[type="text"], input[type="search"]');
            if (input) {
              currentValue = (input as HTMLInputElement).value;
            }
          } else {
            const input = searchBox.querySelector('input[type="text"], input[type="search"]');
            if (input) {
              currentValue = (input as HTMLInputElement).value;
            }
          }
          
          // Si el valor fue limpiado, intentar establecerlo nuevamente
          if (currentValue !== valueToSet && valueToSet) {
            // Re-establecer el valor y disparar eventos nuevamente
            if (searchBox.shadowRoot) {
              const input = searchBox.shadowRoot.querySelector('input[type="text"], input[type="search"]');
              if (input) {
                (input as HTMLInputElement).value = valueToSet;
                (input as HTMLInputElement).placeholder = '';
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                (input as HTMLInputElement).focus();
                setTimeout(() => {
                  (input as HTMLInputElement).blur();
                }, 10);
              }
            } else {
              const input = searchBox.querySelector('input[type="text"], input[type="search"]');
              if (input) {
                (input as HTMLInputElement).value = valueToSet;
                (input as HTMLInputElement).placeholder = '';
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                (input as HTMLInputElement).focus();
                setTimeout(() => {
                  (input as HTMLInputElement).blur();
                }, 10);
              }
            }
          }
        }
      }, 300);
    }, closeDropdown ? 350 : 100);
  }, []);

  // ============================================================================
  // PASO 1: SEARCH (Mapbox Search Box - Rollback a componente anterior)
  // ============================================================================

  /**
   * Handler cuando Mapbox Search Box selecciona un resultado
   * PASO 1: Buscar dirección → Obtener { coordinates, address }
   */
  const handleSearchBoxRetrieve = useCallback(
    (event: Event) => {
      // Prevenir que el evento continúe propagándose (puede causar recarga de sugerencias)
      event.stopPropagation();
      
      const customEvent = event as CustomEvent;
      const detail = customEvent.detail;

      // El detail puede ser un FeatureCollection o un Feature individual
      // Si es FeatureCollection, tomar el primer feature
      let feature: any = null;
      if (detail?.type === 'FeatureCollection' && detail?.features && Array.isArray(detail.features) && detail.features.length > 0) {
        feature = detail.features[0];
      } else if (detail?.type === 'Feature') {
        feature = detail;
      } else {
        // Intentar usar detail directamente como fallback
        feature = detail;
      }

      // Intentar múltiples formas de acceder a las coordenadas
      let coordinates: [number, number] | null = null;
      let placeName = '';
      let commercialName: string | null = null;

      // Función helper para extraer SOLO nombre comercial (POI), NO direcciones
      // CANONICAL: Solo retornar nombre comercial si existe, NO inferir ni usar direcciones
      const extractCommercialName = (feat: any): string | null => {
        // Prioridad 1: Nombre comercial/POI (properties.name) - para restaurantes, hoteles, etc.
        if (feat.properties?.['name']) {
          return feat.properties.name;
        }
        // Prioridad 2: text puede ser nombre comercial si es POI
        // Solo usar text si parece ser un POI (no una dirección completa)
        if (feat.text && feat.place_type?.includes('poi')) {
          return feat.text;
        }
        // NO usar place_name ni full_address (son direcciones, no nombres comerciales)
        return null;
      };

      // Función helper para extraer el nombre con prioridad: nombre comercial (POI) > dirección
      // (usada para mostrar en el input)
      const extractPlaceName = (feat: any): string => {
        // Prioridad 1: Nombre comercial/POI (name o text) - para restaurantes, hoteles, etc.
        if (feat.properties?.['name']) {
          return feat.properties.name;
        }
        if (feat.text) {
          return feat.text;
        }
        // Prioridad 2: place_name completo (dirección completa)
        if (feat.properties?.['place_name']) {
          return feat.properties.place_name;
        }
        // Prioridad 3: full_address
        if (feat.properties?.['full_address']) {
          return feat.properties.full_address;
        }
        // Fallback
        return '';
      };

      // Forma 1: feature.geometry.coordinates (estructura estándar GeoJSON)
      if (feature?.geometry?.coordinates && Array.isArray(feature.geometry.coordinates) && feature.geometry.coordinates.length >= 2) {
        coordinates = [feature.geometry.coordinates[0], feature.geometry.coordinates[1]];
        placeName = extractPlaceName(feature);
        commercialName = extractCommercialName(feature);
      }
      // Forma 2: coordenadas directamente en el feature
      else if (feature?.coordinates && Array.isArray(feature.coordinates) && feature.coordinates.length >= 2) {
        coordinates = [feature.coordinates[0], feature.coordinates[1]];
        placeName = extractPlaceName(feature);
        commercialName = extractCommercialName(feature);
      }
      // Forma 3: feature.center (algunas versiones de Mapbox usan center)
      else if (feature?.center && Array.isArray(feature.center) && feature.center.length >= 2) {
        coordinates = [feature.center[0], feature.center[1]];
        placeName = extractPlaceName(feature);
        commercialName = extractCommercialName(feature);
      }

      if (coordinates) {
        const [longitude, latitude] = coordinates;
        const newCoordinates = { latitude, longitude };

        // Actualizar estado único
        // El useEffect se encargará de centrar el mapa cuando las coordenadas cambien
        setLocationState({
          coordinates: newCoordinates,
          address: placeName,
        });

        // Establecer el valor en el Mapbox Search Box y cerrar el dropdown
        // El web component limpia el input después de la selección, así que lo restauramos
        setSearchBoxValue(placeName, true);

        // CANONICAL: Notificar nombre comercial solo si existe (NO direcciones)
        onCommercialNameChange?.(commercialName);

        // Notificar cambio externo
        // FASE 4-5: Normalizar a formato de salida (mantener formato de entrada)
        const outputLocation = normalizeLocationToOutput(newCoordinates, originalLocationFormatRef.current);
        onLocationChange(outputLocation);
      }
    },
    [onLocationChange, onCommercialNameChange, setSearchBoxValue]
  );

  // ============================================================================
  // PASO 2: HANDLER Map Click → Location
  // ============================================================================

  /**
   * Handler cuando el usuario hace click en el mapa
   * PASO 2: Confirmar ubicación en el mapa → Ajustar pin
   * 
   * Actualiza el input con el resultado del reverse geocode si está disponible
   */
  const handleMapClick = useCallback(
    async (newLocation: { latitude: number; longitude: number }) => {
      if (disabled) return;

      // Actualizar coordenadas (el pin se moverá)
      setLocationState((prev) => ({
        coordinates: newLocation,
        address: prev.address, // Mantener address (NO actualizar input)
      }));

      // CANONICAL: Click en mapa NO tiene nombre comercial, solo dirección
      // Limpiar nombre comercial cuando se selecciona desde el mapa
      onCommercialNameChange?.(null);

      // Centrar mapa en la nueva ubicación
      if (mapViewRef.current) {
        mapViewRef.current.flyToCoordinates(newLocation, 15);
      }

      // Reverse geocode para obtener dirección y mostrarla en el input
      // Redondear coordenadas a 5 decimales ANTES de llamar a la API para evitar error 422
      try {
        const latRounded = parseFloat(newLocation.latitude.toFixed(5));
        const lngRounded = parseFloat(newLocation.longitude.toFixed(5));
        const result = await reverseGeocodeMapbox(latRounded, lngRounded);
        const address = result?.formattedAddress || result?.city || null;

        // Actualizar address internamente
        setLocationState((prev) => ({
          coordinates: prev.coordinates,
          address,
        }));

        // Actualizar el valor en el Mapbox Search Box si hay dirección
        // No cerrar el dropdown ya que el usuario puede estar interactuando con el mapa
        if (address) {
          setSearchBoxValue(address, false);
        }
      } catch (error) {
        if (__DEV__) {
          console.error('Error reverse geocoding:', error);
        }
        // Si falla, mantener coordenadas sin address (NO es crítico, el mapa funciona igual)
      }

      // Notificar cambio externo
      // FASE 4-5: Normalizar a formato de salida (mantener formato de entrada)
      const outputLocation = normalizeLocationToOutput(newLocation, originalLocationFormatRef.current);
      onLocationChange(outputLocation);
    },
    [disabled, onLocationChange, onCommercialNameChange, setSearchBoxValue]
  );

  // ============================================================================
  // PASO 3: HANDLER Current Location
  // ============================================================================

  /**
   * Handler para el botón "Use my current location"
   * PASO 3: Botón siempre visible e independiente del Search
   */
  const handleCurrentLocation = useCallback(async () => {
    if (!userLocation) return;

    // CANONICAL: Current location NO tiene nombre comercial, solo dirección
    // Limpiar nombre comercial cuando se usa ubicación actual
    onCommercialNameChange?.(null);

    // Resolver address vía reverse geocode
    // Redondear coordenadas a 6 decimales ANTES de llamar a la API para evitar error 422
    try {
      // FASE 4-5: Normalizar userLocation a formato interno
      const normalizedUserLocation = normalizeLocationToInternal(userLocation);
      if (!normalizedUserLocation) return;
      
      const latRounded = parseFloat(normalizedUserLocation.latitude.toFixed(6));
      const lngRounded = parseFloat(normalizedUserLocation.longitude.toFixed(6));
      const result = await reverseGeocodeMapbox(latRounded, lngRounded);
      const address = result?.formattedAddress || result?.city || 'Current location';

      // Actualizar estado único
      setLocationState({
        coordinates: userLocation,
        address,
      });

      // Centrar mapa en ubicación del usuario (el mapa aparecerá si no estaba visible)
      if (mapViewRef.current) {
        mapViewRef.current.flyToCoordinates(userLocation, 15);
      }

      // Notificar cambio externo
      // FASE 4-5: Normalizar userLocation a formato de salida
      if (userLocation) {
        const normalizedUserLocation = normalizeLocationToInternal(userLocation);
        if (normalizedUserLocation) {
          const outputLocation = normalizeLocationToOutput(normalizedUserLocation, originalLocationFormatRef.current);
          onLocationChange(outputLocation);
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error reverse geocoding current location:', error);
      }
      // Si falla, usar fallback
      setLocationState({
        coordinates: userLocation,
        address: 'Current location',
      });

      if (mapViewRef.current) {
        mapViewRef.current.flyToCoordinates(userLocation, 15);
      }

      // FASE 4-5: Normalizar userLocation a formato de salida
      if (userLocation) {
        const normalizedUserLocation = normalizeLocationToInternal(userLocation);
        if (normalizedUserLocation) {
          const outputLocation = normalizeLocationToOutput(normalizedUserLocation, originalLocationFormatRef.current);
          onLocationChange(outputLocation);
        }
      }
    }
  }, [userLocation, onLocationChange, onCommercialNameChange]);

  // ============================================================================
  // HANDLERS ZOOM
  // ============================================================================

  /**
   * Handler para zoom in
   */
  const handleZoomIn = useCallback(() => {
    if (mapViewRef.current) {
      mapViewRef.current.zoomIn();
    }
  }, []);

  /**
   * Handler para zoom out
   */
  const handleZoomOut = useCallback(() => {
    if (mapViewRef.current) {
      mapViewRef.current.zoomOut();
    }
  }, []);

  // ============================================================================
  // SETUP MAPBOX SEARCH BOX (WEB ONLY) - Rollback a componente anterior
  // ============================================================================

  // Montar y configurar el custom element de Mapbox Search Box en web
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (!isSearchBoxLoaded || searchBoxError) return;

    // Si ya existe el elemento, no recrearlo
    if (searchBoxElementRef.current) return;

    // Capturar el ID del contenedor para usar en cleanup
    const containerId = searchBoxContainerIdRef.current;

    // Buscar el contenedor en el DOM usando el ID único
    const containerElement = document.getElementById(containerId);
    if (!containerElement) {
      // Si no existe aún, esperar un poco y reintentar
      const timeoutId = setTimeout(() => {
        const retryElement = document.getElementById(containerId);
        if (retryElement && !searchBoxElementRef.current) {
          mountSearchBox(retryElement);
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }

    mountSearchBox(containerElement);

    function mountSearchBox(container: HTMLElement) {
      // Crear el custom element
      const searchBoxElement = document.createElement('mapbox-search-box');
      searchBoxElement.setAttribute('access-token', MAPBOX_ACCESS_TOKEN || '');

      // Configurar opciones si hay userLocation para proximity
      if (userLocation) {
        const options = {
          // FASE 4-5: Normalizar userLocation para proximity
          proximity: (() => {
            const normalized = normalizeLocationToInternal(userLocation);
            return normalized ? [normalized.longitude, normalized.latitude] as [number, number] : undefined;
          })(),
        };
        searchBoxElement.setAttribute('options', JSON.stringify(options));
      }

      // Escuchar evento 'retrieve' para obtener coordenadas cuando se selecciona un resultado
      // Usar { capture: true } para interceptar el evento antes de que se propague
      searchBoxElement.addEventListener('retrieve', handleSearchBoxRetrieve, { capture: true });

      // Agregar al DOM
      container.appendChild(searchBoxElement);
      searchBoxElementRef.current = searchBoxElement;
    }

    // Cleanup
    return () => {
      if (searchBoxElementRef.current) {
        const container = document.getElementById(containerId);
        if (container && container.contains(searchBoxElementRef.current)) {
          // El event listener se remueve automáticamente cuando se remueve el elemento
          searchBoxElementRef.current.remove();
        }
        searchBoxElementRef.current = null;
      }
    };
  }, [isSearchBoxLoaded, searchBoxError, userLocation, handleSearchBoxRetrieve]);

  // ============================================================================
  // RENDER
  // ============================================================================

  // Calcular región para el mapa (solo si hay coordenadas)
  const mapRegion: Region = locationState.coordinates
    ? {
        latitude: locationState.coordinates.latitude,
        longitude: locationState.coordinates.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : {
        // Fallback: Riviera Maya, México (no se usará si no hay coordinates)
        latitude: 20.6170,
        longitude: -87.0798,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

  // Spots para mostrar en el mapa (solo si hay ubicación seleccionada)
  const mapSpots = locationState.coordinates
    ? [
        {
          id: 'temp-location-selector',
          name: 'Selected Location',
          location: locationState.coordinates,
          photos: [],
          type: 'other' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]
    : [];

  // Verificar si se debe usar Mapbox Search Box oficial (solo en web, si está disponible)
  const useMapboxSearchBox = Platform.OS === 'web' && isSearchBoxLoaded && !searchBoxError && MAPBOX_ACCESS_TOKEN;

  return (
    <View style={[styles.container, style]}>
      {/* PASO 1: Search (Mapbox Search Box - Rollback a componente anterior) */}
      <View style={styles.searchContainer}>
        {useMapboxSearchBox ? (
          // Mapbox Search Box oficial (componente anterior con mejor calidad de sugerencias)
          <View
            style={styles.searchInputWrapper}
            nativeID={searchBoxContainerIdRef.current}
            // @ts-ignore - nativeID es válido en React Native Web
          >
            {/* El custom element se monta vía useEffect usando el nativeID */}
          </View>
        ) : (
          // Fallback: Mensaje si Search Box no está disponible (no debería pasar en web normal)
          <View style={[styles.searchInputWrapper, { backgroundColor: colors.background, borderColor: colors.icon + '30', padding: spacing.md }]}>
            <Text style={[textStyles.body, { color: colors.icon }]}>
              Loading search...
            </Text>
          </View>
        )}
      </View>

      {/* PASO 2: Mapa (SOLO aparece después de tener coordinates) */}
      {locationState.coordinates && (
        <View style={styles.mapFullBleedWrapper}>
          <View style={[styles.mapContainer, { height: mapHeight }]}>
          <FlowyaMapView
            ref={mapViewRef}
            spots={mapSpots}
            onSpotPress={() => {}}
            onClick={handleMapClick}
            initialRegion={mapRegion}
            userLocation={null}
            showUserLocation={false}
            disableNativeControls={true}
          />

          {/* Botón "Use my current location" - Inferior izquierda */}
          {!disabled && userLocation && (
            <Pressable
              onPress={handleCurrentLocation}
              style={({ pressed }) => [
                styles.currentLocationButton,
                {
                  backgroundColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                  opacity: pressed ? 0.7 : 1,
                },
              ]}>
              <GlassView
                style={styles.buttonContent}
                intensity="light"
                opacity="medium"
                shadowLevel="subtle"
                enableGlow={false}>
                <Icon name="navigation" size={20} color={colors.tint} />
              </GlassView>
            </Pressable>
          )}

          {/* MapControls - Inferior derecha (zoom in/out) */}
          <MapControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            showFullscreen={false}
          />
          </View>
        </View>
      )}

      {/* Instrucciones */}
      {!disabled && !locationState.coordinates && (
        <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs }]}>
          Search for an address or use your current location
        </Text>
      )}
      {!disabled && locationState.coordinates && (
        <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs }]}>
          Click on the map to adjust the location
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  searchContainer: {
    marginBottom: spacing.md,
    zIndex: 1000,
    position: 'relative',
  },
  searchInputWrapper: {
    minHeight: 44,
    width: '100%',
  },
  mapFullBleedWrapper: {
    marginHorizontal: -24, // Compensar padding de section (spacing.md = 24px)
  },
  mapContainer: {
    width: '100%',
    borderRadius: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.md,
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  buttonContent: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
