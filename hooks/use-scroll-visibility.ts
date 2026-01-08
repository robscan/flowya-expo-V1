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
 * NOTA: SectionHeader NO depende de este hook. SectionHeader es siempre visible y NO tiene scroll behavior.
 */

import { useRef, useState, useCallback } from 'react';

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
    
    // Scroll ↓ (down): currentY > lastScrollY + threshold
    if (currentY > lastScrollY.current + threshold) {
      // Scroll down - ocultar main header y bottomNav
      if (isHeaderVisible) {
        setIsHeaderVisible(false);
      }
      if (isBottomNavVisible) {
        setIsBottomNavVisible(false);
      }
    }
    // Scroll ↑ (up): currentY < lastScrollY - threshold
    else if (currentY < lastScrollY.current - threshold) {
      // Scroll up - mostrar main header y bottomNav
      if (!isHeaderVisible) {
        setIsHeaderVisible(true);
      }
      if (!isBottomNavVisible) {
        setIsBottomNavVisible(true);
      }
    }

    // No disparar si el cambio es mínimo (ya manejado arriba con threshold)
    // Actualizar lastScrollY siempre para trackear posición actual
    lastScrollY.current = currentY;
  }, [threshold, isHeaderVisible, isBottomNavVisible]);

  return {
    isHeaderVisible,
    isBottomNavVisible,
    handleScroll,
  };
}

