/**
 * Flow Player - Componente canónico del Player de FlowScreen
 * Encapsula la lógica de reproducción inicial y los controles del player
 * 
 * Extraído de FlowScreen para mejorar modularidad y reutilización
 * Sin cambios funcionales - solo refactorización estructural
 */

import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { FlowPlayerControls } from '@/components/FlowPlayerControls';
import { useFlow } from '@/contexts/FlowContext';
import { useNarration } from '@/contexts/NarrationContext';
import { useSaved } from '@/contexts/SavedContext';
import { useSpot } from '@/contexts/SpotContext';
import { Flow } from '@/data/flows';
import { Spot } from '@/data/spots';

export interface FlowPlayerProps {
  flowId: string | null;
  flowStatus: 'idle' | 'active' | 'paused' | 'completed';
  currentSpotId: string | null;
  currentSpot: Spot | null | undefined;
  nextSpotId: string | null;
  nextSpotData: Spot | null | undefined;
  flowSpots: Spot[];
  flow: Flow | null;
  userLocation: { latitude: number; longitude: number } | null;
  getSpotById: (id: string) => Spot | null | undefined;
  isVisible?: boolean; // SCOPE 2: Control de visibilidad con scroll
}

export function FlowPlayer({
  flowId,
  flowStatus,
  currentSpotId,
  currentSpot,
  nextSpotId,
  nextSpotData,
  flowSpots,
  flow,
  userLocation,
  getSpotById,
  isVisible = true, // SCOPE 2: Por defecto visible
}: FlowPlayerProps) {
  const narration = useNarration();
  const { toggleLikeSpotFromPlayer, toggleNotMyVibeSpot } = useSaved();

  // SCOPE 1: Reproducir narración inicial solo cuando usuario activa el flow (Start Flow action)
  // Ref para rastrear si ya se reprodujo la narración inicial para este flow
  const initialNarrationPlayedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!flow || flowStatus !== 'active') {
      return;
    }

    // SCOPE 1: Reproducir narración inicial solo una vez cuando el flow se activa
    // Solo si es mobile web o nativo (no desktop web)
    if (initialNarrationPlayedRef.current !== flow.id) {
      initialNarrationPlayedRef.current = flow.id;

      // Verificar que no sea desktop web (TTS deshabilitado)
      const isDesktopWeb = Platform.OS === 'web' && typeof window !== 'undefined' && !window.matchMedia('(pointer: coarse)').matches;

      if (!isDesktopWeb) {
        console.log('[Audio] Start Flow triggered - playing initial narration');
        const initialNarration = {
          id: `narration-initial-${flow.id}`,
          type: 'context' as const,
          text: 'Iniciamos recorrido',
        };

        try {
          narration.playNarration(initialNarration).catch((error) => {
            console.error('Error playing initial narration:', error);
          });
        } catch (error) {
          console.error('Error calling playNarration:', error);
        }
      }
    }

    // Cleanup: detener narrations cuando el flow se cierra
    return () => {
      try {
        narration.stopNarration();
        // Reset ref cuando el flow se cierra
        if (flowStatus === 'idle') {
          initialNarrationPlayedRef.current = null;
        }
      } catch (error) {
        console.error('Error in cleanup stopNarration:', error);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowId, flowStatus]); // Cuando cambia el flow o su estado

  return (
    <FlowPlayerControls
      variant="screen"
      showPrevious={true}
      showNext={true}
      showMute={false}
      showAffinity={true}
      currentSpotId={currentSpotId ?? undefined}
      currentSpot={currentSpot ?? null}
      userLocation={userLocation}
      flowSpots={flowSpots}
      flow={flow}
      nextSpotData={nextSpotData ?? null}
      isVisible={isVisible} // SCOPE 2: Pasar control de visibilidad
      onLike={(spotId) => {
        // SCOPE 5: Pasar tipo de spot para actualizar afinidad
        const spot = getSpotById(spotId) ?? null;
        toggleLikeSpotFromPlayer(spotId, spot?.type);
      }}
      onNotMyVibe={(spotId) => {
        // SCOPE 5: Pasar tipo de spot para actualizar afinidad
        const spot = getSpotById(spotId) ?? null;
        toggleNotMyVibeSpot(spotId, spot?.type);
      }}
    />
  );
}
