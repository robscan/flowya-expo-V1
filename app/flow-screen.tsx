/**
 * Flow Screen - Pantalla completa para Flow activo
 * Scope 7: Flow (Estado Activo) - Core
 * 
 * Principios de diseño:
 * - UI baja protagonismo, controles mínimos, pantalla limpia (audio protagonista)
 * - Pantalla full-screen cuando Flow está activo
 * - Header con controles flotantes: Sonido, Fullscreen, Minimizar, Cerrar
 * - Mapa embebido SIEMPRE visible en la parte superior (altura fija ~280px)
 * - Layout: Mapa arriba + contenido scrollable debajo + player controls fijo abajo
 * - Muestra Spot actual y siguiente (jerarquía clara, mucho aire)
 * - Progreso del Path (visual suave, no agresivo)
 * - Timeline vertical con línea y checkmarks para spots pasados
 * - Cards con estilo glass para spots actuales (sin bordes, profundidad por blur)
 * - Controles: Pausar (icon.pause), Salir (icon.close), Siguiente (icon.next) - mínimos, bien separados, contenedores ≥ 48px x 48px
 * - Modo fullscreen: mapa ocupa 100% del viewport, solo controles superiores visibles
 * - Animación: Transición suave al entrar/salir (funcional, emocional, como respirar)
 * - Accesibilidad: Debe poder usarse caminando (controles grandes, calma, indulgente, sin fricción)
 */

import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { FlowPlayerControls } from '@/components/FlowPlayerControls';
import { FlowyaMapView } from '@/components/MapView';
import { useNarrationTriggers } from '@/components/NarrationController';
import { SaveFlowModal } from '@/components/SaveFlowModal';
import { SpotInlineCard } from '@/components/SpotInlineCard';
import { ContentHeader, ContentHeaderAction } from '@/components/ui/ContentHeader';
import { Icon, iconTouchableContainer } from '@/components/ui/Icon';
import { Toast } from '@/components/ui/Toast';
import { Tooltip } from '@/components/ui/Tooltip';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { fontFamilyMedium, fontSize, lineHeight } from '@/constants/typography';
import { useFlow } from '@/contexts/FlowContext';
import { useNarration } from '@/contexts/NarrationContext';
import { usePath } from '@/contexts/PathContext';
import { useSaved } from '@/contexts/SavedContext';
import { useSpot } from '@/contexts/SpotContext';
import { Flow, getFlowSpots } from '@/data/flows';
import { Spot } from '@/data/spots';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBaseLocation } from '@/hooks/useBaseLocation';
import { getSpotDistance, useSpotDistance } from '@/hooks/useSpotDistance';
import { getFlowState, hasFlowChanges } from '@/utils/flowChanges';
import { geofencingSimulator } from '@/utils/geofencingSimulator';
import { mapMovementModeToNavigationMode, openNavigationApp } from '@/utils/navigationHelpers';
import { updateSuggestionsForCurrentSpot } from '@/utils/spotSuggestion';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Helper function to detect if flow was started from a spot
function isFlowStartedFromSpot(flow: Flow): boolean {
  // Criterio principal: Título contiene "Flow from" (indica origen desde spot)
  if (/^Flow from/i.test(flow.title)) {
    return true;
  }
  // Criterio secundario: Descripción contiene texto característico
  if (flow.description?.includes("We'll build the path as you move")) {
    return true;
  }
  // Criterio terciario: Metadata indica origen desde spot
  if (flow.metadata?.inferredFrom && flow.metadata.inferredFrom.length === 1) {
    return true;
  }
  return false;
}

export default function FlowScreenPage() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { flowState, currentSpotId, nextSpotId, closeFlow, minimizeFlow, addSpotToFlow, reorderFlowSpots, removeSpotFromFlow } = useFlow();
  const { getFlowById, flows, updateFlow } = usePath();
  const { spots, getSpotById } = useSpot();
  const { 
    saveFlow, // CANONICAL: Create if draft, Update if saved
    getFlowCustomName, 
    isFlowSaved,
    savedSpots, 
    likedSpots, 
    savedFlows,
    toggleLikeSpotFromPlayer,
    toggleNotMyVibeSpot,
    } = useSaved();
  const [showSaveFlowModal, setShowSaveFlowModal] = useState(false);
  const narration = useNarration();
  const narrationTriggers = useNarrationTriggers();
  
  // Ubicación base estable
  const { baseLocation } = useBaseLocation();

  const [suggestedSpots, setSuggestedSpots] = useState<Spot[]>([]);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [toastIcon, setToastIcon] = useState<string | undefined>(undefined);
  const [toastUndoAction, setToastUndoAction] = useState<(() => void) | undefined>(undefined);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);

  const flow = flowState.currentPathId ? getFlowById(flowState.currentPathId) : null;
  
  // CANONICAL: Get saved Flow version for comparison (to detect changes)
  // If flow is saved, get the saved version from PathContext to compare
  const savedFlow: Flow | null = flow && isFlowSaved(flow.id) ? (getFlowById(flow.id) || null) : null;
  
  // CANONICAL: Detect if Flow has unsaved changes
  // If flow exists but no savedFlow, consider it as having changes (draft)
  const flowHasChanges = flow ? (savedFlow ? hasFlowChanges(flow, savedFlow) : true) : false;
  
  // CANONICAL: Determine Flow state (draft/saved/edited)
  const isFlowSavedState = flow ? isFlowSaved(flow.id) : false;
  const flowStateCanonical = flow ? getFlowState(flow, isFlowSavedState, flowHasChanges) : null;
  
  const flowSpots = useMemo(() => {
    if (!flow) return [];
    if (!spots || !Array.isArray(spots)) return [];
    try {
      return getFlowSpots(flow, spots);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return [];
    }
  }, [flow, spots]);
  const currentSpot = currentSpotId ? getSpotById(currentSpotId) : null;
  const nextSpotData = nextSpotId ? getSpotById(nextSpotId) : null;
  
  // Calcular distancias usando hooks canónicos (siempre, no condicionalmente)
  const currentSpotDistance = useSpotDistance(currentSpotId || null, baseLocation);
  
  // Preparar distancias de suggestedSpots (memoizado usando selector puro)
  const suggestedSpotsWithDistance = useMemo(() => {
    return suggestedSpots.map(spot => ({
      spot,
      distance: spot.location ? getSpotDistance(spot, baseLocation) : undefined,
    }));
  }, [suggestedSpots, baseLocation]);

  // SELF GUARD: Immediately redirect if no active flow
  // This prevents zombie FlowScreen from rendering
  useEffect(() => {
    // Check if there's no active flow (no flow object OR status is idle OR no currentPathId)
    const hasNoActiveFlow = !flow || flowState.status === 'idle' || !flowState.currentPathId;
    
    if (hasNoActiveFlow) {
      // Immediately redirect away from FlowScreen
      // Use replace to ensure we don't remain on this screen
      try {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)/home');
        }
      } catch {
        // Fallback: always navigate to home if navigation fails
        router.replace('/(tabs)/home');
      }
    }
  }, [flow, flowState.status, flowState.currentPathId, router]);

  // Detectar si el flow se inició desde un spot
  const isFromSpot = useMemo(() => {
    if (!flow) return false;
    return isFlowStartedFromSpot(flow);
  }, [flow]);


  // Reproducir mensaje inicial solo una vez cuando se inicia el flow
  useEffect(() => {
    if (!flow || flowState.status !== 'active') {
      return;
    }

    // Reproducir mensaje inicial solo una vez al iniciar
    const initialNarration = {
      id: `narration-initial-${flow.id}`,
      type: 'context' as const,
      text: 'Iniciamos recorrido',
    };

    // Reproducir el mensaje inicial directamente
    if (narration.status === 'idle') {
      try {
        narration.playNarration(initialNarration).catch((error) => {
          console.error('Error playing initial narration:', error);
        });
      } catch (error) {
        console.error('Error calling playNarration:', error);
      }
    }

    // Cleanup: detener narrations cuando el flow se cierra
    return () => {
      try {
        narration.stopNarration();
      } catch (error) {
        console.error('Error in cleanup stopNarration:', error);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flow?.id]); // Solo cuando cambia el flow (una vez al iniciar)

  // Calcular sugerencias de spots cuando cambia el flow o el spot actual
  useEffect(() => {
    if (!flow || !currentSpot) {
      setSuggestedSpots([]);
      return;
    }

    const context = {
      savedSpots,
      likedSpots,
      savedFlows,
      allFlows: flows,
    };

    try {
      const suggestions = updateSuggestionsForCurrentSpot(
        currentSpot,
        baseLocation,
        spots,
        context,
        flow,
        5 // Limitar a 5 sugerencias
      );
      setSuggestedSpots(suggestions);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setSuggestedSpots([]);
    }
  }, [flow, currentSpot, baseLocation, spots, savedSpots, likedSpots, savedFlows, flows]);

  // Integrar geofencing con narration triggers - solo cuando usuario está cerca de spot
  useEffect(() => {
    if (!flow || flowSpots.length === 0) {
      try {
        geofencingSimulator.stopMonitoring();
      } catch (error) {
        console.error('Error calling stopMonitoring:', error);
      }
      return;
    }

    // Configurar callbacks de geofencing para disparar narrations solo cuando se llega a un spot
    try {
      const removeCallbacks = geofencingSimulator.addCallbacks({
        onArriving: (spotId: string) => {
          // Solo disparar narration cuando el usuario llega a un spot
          narrationTriggers.triggerArriving(spotId);
        },
        // Desactivar approaching y leaving para evitar narrations en loop
        onApproaching: () => {
          // No hacer nada - solo narrations al llegar
        },
        onLeaving: () => {
          // No hacer nada - solo narrations al llegar
        },
      });

      // Iniciar monitoreo con ubicación del usuario si está disponible
      if (baseLocation) {
        geofencingSimulator.startMonitoring(baseLocation, flowSpots);
      } else if (flowSpots.length > 0) {
        // Fallback: usar primer spot del flow si no hay ubicación del usuario
        const initialLocation = {
          latitude: flowSpots[0].location.latitude,
          longitude: flowSpots[0].location.longitude,
        };
        geofencingSimulator.startMonitoring(initialLocation, flowSpots);
      }

      return () => {
        try {
          removeCallbacks();
          geofencingSimulator.stopMonitoring();
        } catch (error) {
          console.error('Error in cleanup:', error);
        }
      };
    } catch (error) {
      console.error('Error in geofencing useEffect:', error);
    }
  }, [flow, flowSpots, baseLocation, narrationTriggers]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info', icon?: string, undoAction?: () => void) => {
    setToastMessage(message);
    setToastType(type);
    setToastIcon(icon);
    setToastUndoAction(undoAction);
    setToastVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setToastVisible(false);
    setToastUndoAction(undefined);
  }, []);

  // Handler para abrir navegación (reutilizable en List y Map views)
  // Calcula ruta desde ubicación del usuario al primer spot disponible (actual o primero del flow)
  const handleOpenNavigation = useCallback(async () => {
    if (!baseLocation) {
      Alert.alert(
        'Location needed',
        'Enable location to get directions. Go to Settings and allow location access.'
      );
      return;
    }

    // Determinar spot destino: spot actual o primer spot del flow
    const targetSpot = currentSpot || (flowSpots.length > 0 ? flowSpots[0] : null);
    
    if (!targetSpot) {
      Alert.alert(
        'No destination',
        'Add at least one spot to the flow to get directions.'
      );
      return;
    }

    if (!flow) {
      Alert.alert('Error', 'Flow information is missing.');
      return;
    }

    try {
      const navigationMode = mapMovementModeToNavigationMode(flow.movementMode);
      const success = await openNavigationApp(
        baseLocation,
        targetSpot.location,
        navigationMode
      );

      if (!success) {
        Alert.alert(
          'Navigation unavailable',
          'Could not open navigation app. Please try again.'
        );
      }
    } catch (error) {
      console.error('Error opening navigation:', error);
      Alert.alert(
        'Error',
        'An error occurred while opening navigation. Please try again.'
      );
    }
  }, [baseLocation, currentSpot, flowSpots, flow]);

  // SELF GUARD: Render nothing if no active flow
  // This is a secondary guard in case navigation hasn't completed yet
  // Prevents any UI from rendering without an active flow
  const hasNoActiveFlow = !flow || flowState.status === 'idle' || !flowState.currentPathId;
  if (hasNoActiveFlow) {
    return null;
  }

  const handleMinimize = () => {
    minimizeFlow();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };


  const handleClose = () => {
    if (!flow) {
      return;
    }
    
    // CANONICAL: Close Flow based on state and changes
    // Rule: If no changes, close directly. If changes, show confirmation modal.
    if (!flowHasChanges) {
      // No changes: close directly without confirmation
      closeFlow(narration.stopNarration);
    } else {
      // Has changes: show confirmation modal
      setShowSaveFlowModal(true);
    }
  };

  const handleSaveFlowWithName = async (name: string) => {
    if (!flow) return;
    
    // Step 1: Close modal first
    setShowSaveFlowModal(false);
    
    // Step 2: Update Flow in PathContext with the name (CRITICAL: ensures Flow exists with correct title)
    // This updates the Flow entity itself, not just the saved reference
    updateFlow(flow.id, { title: name });
    
    // Step 3: Save flow in SavedContext using canonical saveFlow (create if draft, update if saved)
    // This ensures: no duplicates, no deletion, proper create/update semantics
    // saveFlow marks the Flow as saved and stores the custom name
    saveFlow(flow.id, name);
    
    // Step 4: Show success toast (non-blocking confirmation)
    // Toast duration is 3000ms (3 seconds) - user can see it while navigating
    // Determine if this is an update or create based on previous state
    const wasSavedBefore = isFlowSavedState;
    showToast(wasSavedBefore ? 'Route updated' : 'Route saved', 'success', 'check');
    
    // Step 5: Close flow after a short delay to ensure toast is visible
    // Delay allows user to see the confirmation before navigation
    setTimeout(async () => {
      // closeFlow handles complete sequence including explicit navigation
      await closeFlow(narration.stopNarration);
    }, 2500); // 2.5 seconds - allows toast to be visible before navigation
  };

  const handleCancelSaveFlow = () => {
    // Cancel: return to FlowScreen, no state changes
    setShowSaveFlowModal(false);
  };

  const handleExitWithoutSaving = async () => {
    // CANONICAL: Exit without saving: discard activeFlow, then navigate away
    // Show appropriate toast based on state
    setShowSaveFlowModal(false);
    
    if (flowStateCanonical === 'draft') {
      // Draft: show "Changes discarded" toast
      showToast('Changes discarded', 'info');
    } else {
      // Saved flow without saving: no toast needed (just closing)
      // (If it was saved with no changes, it closes directly without modal)
    }
    
    // Close flow after short delay to show toast
    setTimeout(async () => {
      await closeFlow(narration.stopNarration);
    }, flowStateCanonical === 'draft' ? 1500 : 0);
  };

  const handleDiscardChanges = async () => {
    // CANONICAL: Discard changes for edited flow
    // This discards the changes but keeps the flow saved
    setShowSaveFlowModal(false);
    
    // Show toast for discarded changes
    showToast('Changes discarded', 'info');
    
    // Close flow after short delay to show toast
    setTimeout(async () => {
      await closeFlow(narration.stopNarration);
    }, 1500);
  };

  const handleMoveUp = (spotId: string) => {
    if (!flow) return;
    const spotIndex = flow.spots.indexOf(spotId);
    if (spotIndex <= flowState.currentSpotIndex + 1) return; // No mover si es el primero o antes
    
    const newOrder = [...flow.spots];
    [newOrder[spotIndex - 1], newOrder[spotIndex]] = [newOrder[spotIndex], newOrder[spotIndex - 1]];
    reorderFlowSpots(newOrder);
  };

  const handleMoveDown = (spotId: string) => {
    if (!flow) return;
    const spotIndex = flow.spots.indexOf(spotId);
    if (spotIndex >= flow.spots.length - 1) return; // No mover si es el último
    
    const newOrder = [...flow.spots];
    [newOrder[spotIndex], newOrder[spotIndex + 1]] = [newOrder[spotIndex + 1], newOrder[spotIndex]];
    reorderFlowSpots(newOrder);
  };

  const handleRemoveSpot = (spotId: string) => {
    const spot = getSpotById(spotId);
    
    if (typeof removeSpotFromFlow !== 'function') {
      console.error('removeSpotFromFlow is not a function', typeof removeSpotFromFlow);
      return;
    }
    
    removeSpotFromFlow(spotId);
    
    // Si es un flow desde spot, agregar a sugerencias
    if (isFromSpot && spot && !suggestedSpots.find(s => s.id === spot.id)) {
      setSuggestedSpots(prev => [...prev, spot]);
    }
    
    // Mostrar toast con undo
    showToast(`Spot "${spot?.name || 'Unnamed'}" removed`, 'info', 'close', () => {
      // Undo: agregar de vuelta
      addSpotToFlow(spotId);
      if (isFromSpot && spot) {
        setSuggestedSpots(prev => prev.filter(s => s.id !== spot.id));
      }
    });
  };



  // renderSegmentedControl eliminado - los tabs List/Map ya no existen

  const renderTimeline = () => {
    // El timeline siempre se renderiza cuando no está en fullscreen
    // Spot actual destacado
    const currentSpot = currentSpotId ? getSpotById(currentSpotId) : null;
    const currentIndex = flowState.currentSpotIndex;
    
    // Spots futuros (debajo del actual)
    const futureSpots = flowSpots.slice(currentIndex + 1);

    return (
      <View style={styles.timelineContainer}>
        {/* Spot actual en estado ACTIVO */}
        {currentSpot && (
          <View style={styles.currentSpotContainer}>
            <SpotInlineCard
              spot={currentSpot}
              state="active"
              distance={currentSpotDistance}
              onPress={() => {
                router.push(`/spot-detail?id=${currentSpot.id}`);
              }}
            />
          </View>
        )}
        {/* Listado de spots futuros con drag and drop */}
        {futureSpots.length > 0 && (
          <View style={styles.spotsListContainer}>
            <View style={styles.upNextHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                UP NEXT
              </Text>
              <TouchableOpacity
                onPress={() => setIsEditMode(!isEditMode)}
                style={iconTouchableContainer.base}
                activeOpacity={0.7}>
                <Icon 
                  name={isEditMode ? "check" : "edit"} 
                  size={20} 
                  color={colors.text} 
                />
              </TouchableOpacity>
            </View>
            {/* Spots agregados al flow */}
            {futureSpots.map((spot, relativeIndex) => {
              const absoluteIndex = currentIndex + 1 + relativeIndex;
              const isFirst = relativeIndex === 0;
              const isLast = relativeIndex === futureSpots.length - 1;
              const distance = getSpotDistance(spot, baseLocation);
              
              // Número de orden para el SpotCard (2, 3, 4, etc.)
              const orderNumber = absoluteIndex + 1;

              return (
                <SpotInlineCard
                  key={spot.id}
                  spot={spot}
                  state="next"
                  distance={distance}
                  orderNumber={orderNumber}
                  isEditMode={isEditMode}
                  isFirst={isFirst}
                  isLast={isLast}
                  onRemove={() => handleRemoveSpot(spot.id)}
                  onMoveUp={() => handleMoveUp(spot.id)}
                  onMoveDown={() => handleMoveDown(spot.id)}
                  onPress={() => {
                    if (!isEditMode) {
                      router.push(`/spot-detail?id=${spot.id}`);
                    }
                  }}
                />
              );
            })}
            {/* More Suggestions dentro de UP NEXT (solo si flow viene de spot) */}
            {isFromSpot && suggestedSpots.length > 0 && (
              <View 
                style={[
                  styles.suggestedSection, 
                  { borderTopColor: colors.icon + '30' }
                ]}
              >
                <Text style={[styles.suggestedSectionTitle, { color: colors.text }]}>
                  More Suggestions
                </Text>
                {suggestedSpotsWithDistance.map((item) => {
                  const spot = item.spot;
                  const distance = item.distance;
                  return (
                    <SpotInlineCard
                      key={`suggested-${spot.id}`}
                      spot={{
                        ...spot,
                        location: spot.location,
                        photos: spot.photos ?? [],
                        type: spot.type ?? 'other',
                        createdAt: spot.createdAt ?? '',
                        updatedAt: spot.updatedAt ?? '',
                      }}
                      state="add"
                      distance={distance}
                      onPress={() => {
                        router.push(`/spot-detail?id=${spot.id}`);
                      }}
                      onAdd={() => {
                        addSpotToFlow(spot.id);
                        setSuggestedSpots((prev) => prev.filter((s) => s.id !== spot.id));
                      }}
                    />
                  );
                })}
              </View>
            )}
          </View>
        )}
        {/* Sección Suggestions separada (solo si no hay UP NEXT pero hay sugerencias) */}
        {futureSpots.length === 0 && isFromSpot && suggestedSpots.length > 0 && (
          <View style={styles.spotsListContainer}>
            <View style={styles.upNextHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Suggestions
              </Text>
            </View>
            {suggestedSpotsWithDistance.map((item) => {
              const spot = item.spot;
              const distance = item.distance;
              return (
                <SpotInlineCard
                  key={`suggested-${spot.id}`}
                  spot={{
                    ...spot,
                    location: spot.location,
                    photos: spot.photos ?? [],
                    type: spot.type ?? 'other',
                    createdAt: spot.createdAt ?? '',
                    updatedAt: spot.updatedAt ?? '',
                  }}
                  state="add"
                  distance={distance}
                  onPress={() => {
                    router.push(`/spot-detail?id=${spot.id}`);
                  }}
                  onAdd={() => {
                    addSpotToFlow(spot.id);
                    setSuggestedSpots((prev) => prev.filter((s) => s.id !== spot.id));
                  }}
                />
              );
            })}
          </View>
        )}
      </View>
    );
  };

  const renderMapView = () => {
    // El mapa siempre se renderiza en la parte superior
    // Calcular ruta punto a punto: desde ubicación del usuario hasta el primer spot disponible
    // Si hay un spot actual, usar ese; si no, usar el primer spot del flow
    const targetSpot = currentSpot || (flowSpots.length > 0 ? flowSpots[0] : null);
    const routeFrom = baseLocation;
    const routeTo = targetSpot ? targetSpot.location : null;

    // Calcular región inicial que incluya tanto spots como ubicación del usuario
    const calculateMapRegion = () => {
      const allPoints: { latitude: number; longitude: number }[] = [];
      
      // Incluir ubicación base si está disponible
      if (baseLocation) {
        allPoints.push(baseLocation);
      }
      
      // Incluir todos los spots del flow
      flowSpots.forEach(spot => {
        allPoints.push(spot.location);
      });
      
      if (allPoints.length === 0) {
        return undefined; // Dejar que MapView calcule por defecto
      }
      
      const latitudes = allPoints.map(p => p.latitude);
      const longitudes = allPoints.map(p => p.longitude);
      
      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLon = Math.min(...longitudes);
      const maxLon = Math.max(...longitudes);
      
      const centerLat = (minLat + maxLat) / 2;
      const centerLon = (minLon + maxLon) / 2;
      const latDelta = Math.max(maxLat - minLat, 0.01) * 1.5;
      const lonDelta = Math.max(maxLon - minLon, 0.01) * 1.5;
      
      return {
        latitude: centerLat,
        longitude: centerLon,
        latitudeDelta: latDelta,
        longitudeDelta: lonDelta,
      };
    };

    // Key para forzar reencuadre cuando cambien los spots o la ubicación
    const mapKey = `map-${flowSpots.length}-${baseLocation ? `${baseLocation.latitude.toFixed(4)}-${baseLocation.longitude.toFixed(4)}` : 'no-location'}`;

    return (
      <View style={styles.mapContainer}>
        <FlowyaMapView
          key={mapKey}
          spots={flowSpots}
          onSpotPress={(spot) => {
            // Navegar al spot seleccionado
            router.push(`/spot-detail?id=${spot.id}`);
          }}
          showRoute={true}
          flowSpots={flowSpots}
          showUserLocation={!!baseLocation}
          userLocation={baseLocation}
          routeFrom={routeFrom}
          routeTo={routeTo}
          initialRegion={calculateMapRegion()}
          currentSpotIndex={flowState.currentSpotIndex}
          flowSpotsOrder={flowSpots}
        />
        {/* Map Controls Cluster - esquina inferior izquierda */}
        {baseLocation && flowSpots.length > 0 && (
          <View style={styles.mapControlsCluster}>
            {/* Get directions - Acción principal */}
            <Tooltip text="Get directions">
              <TouchableOpacity
                style={[styles.mapControlButton, styles.mapControlPrimary, { backgroundColor: colors.tint }]}
                onPress={handleOpenNavigation}
                activeOpacity={0.8}>
                <Icon name="directions" size={20} color="#fff" />
              </TouchableOpacity>
            </Tooltip>
            {/* Fullscreen toggle - Acción del mapa */}
            <Tooltip text={isMapFullscreen ? 'Salir de pantalla completa' : 'Ver mapa en pantalla completa'}>
              <TouchableOpacity
                style={[styles.mapControlButton, { backgroundColor: colors.background + 'E6' }]}
                onPress={() => setIsMapFullscreen(!isMapFullscreen)}
                activeOpacity={0.7}>
                <Icon 
                  name={isMapFullscreen ? 'fullscreen-exit' : 'fullscreen'} 
                  size={18} 
                  color={colors.text} 
                />
              </TouchableOpacity>
            </Tooltip>
          </View>
        )}
      </View>
    );
  };

  // Preparar acciones del header
  const leftActions: ContentHeaderAction[] = isMapFullscreen
    ? []
    : [
        {
          icon: 'minimize',
          onPress: handleMinimize,
          tooltip: 'Minimize',
        },
        {
          icon: narration.isMuted ? 'mute' : 'audio',
          onPress: narration.toggleMute,
          tooltip: narration.isMuted ? 'Unmute narration' : 'Mute narration',
        },
        {
          icon: 'close',
          onPress: handleClose,
          tooltip: 'Close',
        },
      ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {isMapFullscreen ? (
        // Modo fullscreen: solo mostrar el mapa ocupando 100% del viewport
        <View style={styles.fullscreenMapContainer}>
          {renderMapView()}
        </View>
      ) : (
        // Modo normal: mapa embebido dentro del scroll + contenido debajo
        <>
          {/* Contenido scrollable con mapa y timeline */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {/* ContentHeader con mapa hero */}
            <ContentHeader
              heroType="map"
              heroMap={
                <View style={styles.embeddedMapContainer}>
                  {renderMapView()}
                </View>
              }
              leftActions={leftActions}
              rightActions={[]}
              showOverlay={false}
              sticky={true}
            />
            
            {/* Timeline debajo del mapa */}
            {renderTimeline()}
          </ScrollView>
          
          {/* Player controls fijo en la parte inferior */}
          <FlowPlayerControls
            variant="screen"
            showPrevious={true}
            showNext={true}
            showMute={false}
            showAffinity={true}
            currentSpotId={currentSpotId ?? undefined}
            currentSpot={currentSpot}
            userLocation={baseLocation}
            flowSpots={flowSpots}
            flow={flow}
            nextSpotData={nextSpotData}
            onLike={(spotId) => {
              toggleLikeSpotFromPlayer(spotId);
            }}
            onNotMyVibe={(spotId) => {
              toggleNotMyVibeSpot(spotId);
            }}
          />
        </>
      )}
      
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        icon={toastIcon}
        duration={3000}
        onHide={hideToast}
        onUndo={toastUndoAction}
      />

      {/* CANONICAL: Modal for flow confirmation (single authority for closing a flow) */}
      <SaveFlowModal
        visible={showSaveFlowModal}
        flow={flow}
        spots={spots}
        isSaved={isFlowSavedState}
        hasChanges={flowHasChanges}
        flowState={flowStateCanonical || 'draft'}
        currentName={flow ? (getFlowCustomName(flow.id) || flow.title) : undefined}
        onSave={handleSaveFlowWithName}
        onExitWithoutSaving={handleExitWithoutSaving}
        onDiscardChanges={handleDiscardChanges}
        onCancel={handleCancelSaveFlow}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Estilos para mapa embebido (estado normal) - hero visual pegado al top, full width
  embeddedMapContainer: {
    height: 280, // Altura fija razonable (~35vh en pantallas móviles típicas)
    width: SCREEN_WIDTH, // Full width real, rompe el padding del ScrollView
    marginLeft: -spacing.md, // Compensa el padding horizontal del ScrollView
    marginRight: -spacing.md, // Compensa el padding horizontal del ScrollView
    position: 'relative',
    marginTop: 0, // Pegado al top como hero visual
    marginBottom: spacing.xl, // Separación visual del contenido siguiente
  },
  // Estilos para mapa fullscreen
  fullscreenMapContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: 0, // El mapa está pegado al top, sin padding superior
  },
  timelineContainer: {
    gap: spacing.sm, // Gap de grupo entre secciones
    marginTop: spacing.sm, // Separación adicional para transición suave desde el mapa
  },
  currentSpotContainer: {
    marginBottom: spacing.sm, // Gap de grupo
  },
  spotsListContainer: {
    gap: spacing.xs, // Gap de card entre cards dentro del mismo grupo
    marginTop: spacing.sm, // Gap de grupo
  },
  upNextHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs, // Reducido de sm a xs
  },
  sectionTitle: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.sm, // Reducido de heading3 (2xl) a sm
    lineHeight: lineHeight.sm,
    fontWeight: '600',
  },
  suggestedSection: {
    marginTop: spacing.md, // Reducido de xl a md
    paddingTop: spacing.md, // Reducido de lg a md
    borderTopWidth: 1,
  },
  suggestedSectionTitle: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.sm, // Reducido de base a sm
    lineHeight: lineHeight.sm,
    fontWeight: '600',
    marginBottom: spacing.sm, // Reducido de md a sm
  },
  mapContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  // Cluster de controles del mapa - esquina inferior derecha
  mapControlsCluster: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    zIndex: 1001, // Por encima del mapa (zIndex del mapa es 0 por defecto)
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mapControlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  mapControlPrimary: {
    // Botón principal (Get directions) ligeramente más destacado
    width: 52,
    height: 52,
    borderRadius: 26,
    shadowOpacity: 0.3,
  },
});

