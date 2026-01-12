/**
 * Flow Player - Componente canónico del Player de FlowScreen
 * Encapsula la lógica de reproducción inicial y los controles del player
 * 
 * Extraído de FlowScreen para mejorar modularidad y reutilización
 * Sin cambios funcionales - solo refactorización estructural
 */

import { FlowPlayerControls } from '@/components/FlowPlayerControls';
import { useSaved } from '@/contexts/SavedContext';
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
  const { toggleNotMyVibeSpot } = useSaved();

  // P0-05: Audio eliminado - los subtítulos se muestran automáticamente mediante useFlowSubtitle en FlowPlayerControls

  return (
    <FlowPlayerControls
      variant="screen"
      showPrevious={true}
      showNext={true}
      showAffinity={true}
      currentSpotId={currentSpotId ?? undefined}
      currentSpot={currentSpot ?? null}
      userLocation={userLocation}
      flowSpots={flowSpots}
      flow={flow}
      nextSpotData={nextSpotData ?? null}
      isVisible={isVisible} // SCOPE 2: Pasar control de visibilidad
      onNotMyVibe={(spotId) => {
        // SCOPE 5: Pasar tipo de spot para actualizar afinidad
        const spot = getSpotById(spotId) ?? null;
        toggleNotMyVibeSpot(spotId, spot?.type);
      }}
    />
  );
}
