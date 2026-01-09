/**
 * useScrollVisibility Hook
 * 
 * Centraliza la lógica de detección de scroll para controlar visibilidad de ScreenHeader y bottomNav.
 * Basado en dirección de scroll, NO en posición absoluta.
 * NO anima, solo setea booleanos basados en la dirección del scroll.
 * 
 * Reglas:
 * - Scroll ↓ (down) → oculta headers
 * - Scroll ↑ (up) → muestra headers
 * - Ignora valores negativos (bounce)
 * - No dispara si el cambio es mínimo (threshold)
 * - No usa timers ni onScrollEndDrag
 * 
 * ARQUITECTÓNICO: Este hook SOLO modifica visibilidad visual (opacity/transform).
 * NUNCA dispara recarga de datos, refresh, o reset de estados.
 * El scroll NO debe tener efectos colaterales sobre carga de datos o imágenes.
 * 
 * NOTA: SectionHeader NO depende de este hook. SectionHeader es siempre visible y NO tiene scroll behavior.
 */

import { useRef, useState, useCallback, useEffect } from 'react';

interface UseScrollVisibilityOptions {
  threshold?: number; // Umbral mínimo de scroll en píxeles (default: 24px)
}

interface UseScrollVisibilityReturn {
  isHeaderVisible: boolean;
  isBottomNavVisible: boolean;
  handleScroll: (event: any) => void;
}

export function useScrollVisibility(
  options: UseScrollVisibilityOptions = {}
): UseScrollVisibilityReturn {
  const { threshold = 24 } = options;
  
  // Trackear scroll anterior (en la screen, NO en el header)
  const lastScrollY = useRef(0);
  
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);

  // ARQUITECTÓNICO: Usar refs para leer valores actuales sin incluirlos en dependencias
  // Esto previene loops infinitos: handleScroll no se recrea cuando cambian los estados
  const isHeaderVisibleRef = useRef(isHeaderVisible);
  const isBottomNavVisibleRef = useRef(isBottomNavVisible);

  // Sincronizar refs cuando cambian los estados
  useEffect(() => {
    isHeaderVisibleRef.current = isHeaderVisible;
  }, [isHeaderVisible]);

  useEffect(() => {
    isBottomNavVisibleRef.current = isBottomNavVisible;
  }, [isBottomNavVisible]);

  const handleScroll = useCallback((event: any) => {
    const currentY = event.nativeEvent.contentOffset.y;
    
    // Ignorar valores negativos (bounce effect)
    if (currentY < 0) {
      return;
    }

    // Comparar valores: scroll down vs scroll up
    // Lógica conceptual obligatoria:
    // if (currentY > lastScrollY.current + THRESHOLD) → hideHeader()
    // if (currentY < lastScrollY.current - THRESHOLD) → showHeader()
    
    // ARQUITECTÓNICO: Leer valores desde refs para evitar dependencias que causan loops
    const currentHeaderVisible = isHeaderVisibleRef.current;
    const currentBottomNavVisible = isBottomNavVisibleRef.current;
    
    // Scroll ↓ (down): currentY > lastScrollY + threshold
    if (currentY > lastScrollY.current + threshold) {
      // Scroll down - ocultar main header y bottomNav
      if (currentHeaderVisible) {
        setIsHeaderVisible(false);
      }
      if (currentBottomNavVisible) {
        setIsBottomNavVisible(false);
      }
    }
    // Scroll ↑ (up): currentY < lastScrollY - threshold
    else if (currentY < lastScrollY.current - threshold) {
      // Scroll up - mostrar main header y bottomNav
      if (!currentHeaderVisible) {
        setIsHeaderVisible(true);
      }
      if (!currentBottomNavVisible) {
        setIsBottomNavVisible(true);
      }
    }

    // No disparar si el cambio es mínimo (ya manejado arriba con threshold)
    // Actualizar lastScrollY siempre para trackear posición actual
    lastScrollY.current = currentY;
  }, [threshold]); // ARQUITECTÓNICO: Solo threshold en dependencias, estados leídos desde refs

  return {
    isHeaderVisible,
    isBottomNavVisible,
    handleScroll,
  };
}

