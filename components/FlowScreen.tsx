/**
 * Flow Screen Component
 * Scope 7: Flow (Estado Activo) - Core
 * 
 * Principios de diseño:
 * - UI baja protagonismo, controles mínimos, pantalla limpia (audio protagonista)
 * - Pantalla full-screen cuando Flow está activo
 * - Header con efecto glass: "NOW MOVING" con blur background (sutil, casi invisible)
 * - Segmented control: "List" y "Map" (áreas táctiles ≥ 48px)
 * - Layout: Columna única, scroll natural
 * - Muestra Spot actual y siguiente (jerarquía clara, mucho aire)
 * - Progreso del Path (visual suave, no agresivo)
 * - Timeline vertical con línea y checkmarks para spots pasados
 * - Cards con estilo glass para spots actuales (sin bordes, profundidad por blur)
 * - Controles: Pausar (icon.pause), Salir (icon.close), Siguiente (icon.next) - mínimos, bien separados, contenedores ≥ 48px x 48px
 * - Animación: Transición suave al entrar/salir (funcional, emocional, como respirar)
 * - Accesibilidad: Debe poder usarse caminando (controles grandes, calma, indulgente, sin fricción)
 */

import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Animated,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { FlowPlayerControls } from '@/components/FlowPlayerControls';
import { FlowSpotCard } from '@/components/FlowSpotCard';
import { FlowyaMapView } from '@/components/MapView';
import { useNarrationTriggers } from '@/components/NarrationController';
import { SaveFlowModal } from '@/components/SaveFlowModal';
import { GlassView } from '@/components/ui/GlassView';
import { Icon, iconTouchableContainer } from '@/components/ui/Icon';
import { Toast } from '@/components/ui/Toast';
import { Tooltip } from '@/components/ui/Tooltip';
import { borderRadius } from '@/constants/borders';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { fontFamily, fontFamilyMedium, fontSize, lineHeight, textStyles } from '@/constants/typography';
import { useFlow } from '@/contexts/FlowContext';
import { useNarration } from '@/contexts/NarrationContext';
import { usePath } from '@/contexts/PathContext';
import { useSaved } from '@/contexts/SavedContext';
import { useSpot } from '@/contexts/SpotContext';
import { Flow, getFlowSpots, MovementMode } from '@/data/flows';
import { Spot } from '@/data/spots';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { calculateDistance, calculateDistanceToSpot } from '@/utils/distance';
import { geofencingSimulator } from '@/utils/geofencingSimulator';
import { mapMovementModeToNavigationMode, openNavigationApp } from '@/utils/navigationHelpers';
import { updateSuggestionsForCurrentSpot } from '@/utils/spotSuggestion';
import * as Location from 'expo-location';

type FlowViewMode = 'list' | 'map';

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


export function FlowScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { flowState, currentSpotId, nextSpotId, progress, endFlow, minimizeFlow, addSpotToFlow, reorderFlowSpots, removeSpotFromFlow } = useFlow();
  const { getFlowById, flows } = usePath();
  const { spots, getSpotById } = useSpot();
  const { toggleSaveFlow, getFlowCustomName, savedSpots, likedSpots, savedFlows } = useSaved();
  const [showSaveFlowModal, setShowSaveFlowModal] = useState(false);
  const narration = useNarration();
  const narrationTriggers = useNarrationTriggers();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [suggestedSpots, setSuggestedSpots] = useState<Spot[]>([]);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [toastIcon, setToastIcon] = useState<string | undefined>(undefined);
  const [toastUndoAction, setToastUndoAction] = useState<(() => void) | undefined>(undefined);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showNarrationText, setShowNarrationText] = useState(false);
  
  const [viewMode, setViewMode] = useState<FlowViewMode>('list');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);

  const isVisible = (flowState.status === 'active' || flowState.status === 'paused') && !flowState.isMinimized;
  const flow = flowState.currentPathId ? getFlowById(flowState.currentPathId) : null;
  const flowSpots = useMemo(() => flow ? getFlowSpots(flow, spots) : [], [flow, spots]);
  const currentSpot = currentSpotId ? getSpotById(currentSpotId) : null;
  const nextSpotData = nextSpotId ? getSpotById(nextSpotId) : null;

  // Detectar si el flow se inició desde un spot
  const isFromSpot = useMemo(() => {
    if (!flow) return false;
    return isFlowStartedFromSpot(flow);
  }, [flow]);

  // Animación de entrada/salida
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible, fadeAnim]);

  // Obtener ubicación del usuario
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error('Error getting location:', error);
      }
    })();
  }, []);

  // Reproducir mensaje inicial solo una vez cuando se inicia el flow
  useEffect(() => {
    if (!isVisible || !flow || flowState.status !== 'active') {
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
      narration.playNarration(initialNarration).catch((error) => {
        console.error('Error playing initial narration:', error);
      });
    }

    // Cleanup: detener narrations cuando el flow se cierra
    return () => {
      narration.stopNarration();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flow?.id]); // Solo cuando cambia el flow (una vez al iniciar)

  // Calcular sugerencias de spots cuando cambia el flow o el spot actual
  useEffect(() => {
    if (!isVisible || !flow || !currentSpot) {
      setSuggestedSpots([]);
      return;
    }

    const context = {
      savedSpots,
      likedSpots,
      savedFlows,
      allFlows: flows,
    };

    // TypeScript narrowing: currentSpot is guaranteed to be non-null after the guard clause
    const suggestions = updateSuggestionsForCurrentSpot(
      currentSpot,
      userLocation,
      spots,
      context,
      flow,
      5 // Limitar a 5 sugerencias
    );

    setSuggestedSpots(suggestions);
  }, [isVisible, flow, currentSpot, userLocation, spots, savedSpots, likedSpots, savedFlows, flows]);

  // Integrar geofencing con narration triggers - solo cuando usuario está cerca de spot
  useEffect(() => {
    if (!isVisible || !flow || flowSpots.length === 0) {
      geofencingSimulator.stopMonitoring();
      return;
    }

    // Configurar callbacks de geofencing para disparar narrations solo cuando se llega a un spot
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
    if (userLocation) {
      geofencingSimulator.startMonitoring(userLocation, flowSpots);
    } else if (flowSpots.length > 0) {
      // Fallback: usar primer spot del flow si no hay ubicación del usuario
      const initialLocation = {
        latitude: flowSpots[0].location.latitude,
        longitude: flowSpots[0].location.longitude,
      };
      geofencingSimulator.startMonitoring(initialLocation, flowSpots);
    }

    return () => {
      removeCallbacks();
      geofencingSimulator.stopMonitoring();
    };
  }, [isVisible, flow, flowSpots, userLocation, narrationTriggers]);

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
  // Debe estar antes del early return para cumplir con reglas de hooks
  const handleOpenNavigation = useCallback(async () => {
    if (!userLocation || !nextSpotData) {
      Alert.alert(
        'Navigation unavailable',
        'Location and next spot are required to open navigation.'
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
        userLocation,
        nextSpotData.location,
        navigationMode
      );

      if (!success) {
        Alert.alert(
          'Navigation unavailable',
          'Could not open navigation app. Please try again or use Google Maps in your browser.'
        );
      }
    } catch (error) {
      console.error('Error opening navigation:', error);
      Alert.alert(
        'Error',
        'An error occurred while opening navigation. Please try again.'
      );
    }
  }, [userLocation, nextSpotData, flow]);

  if (!isVisible || !flow) {
    return null;
  }

  // handlePause ahora está manejado por FlowPlayerControls con sincronización automática

  const handleMinimize = () => {
    minimizeFlow();
  };

  const handleClose = () => {
    if (!flow) return;
    
    // Detener narrations antes de cerrar
    narration.stopNarration();
    
    // En web/iOS Safari, usar modal personalizado; en móvil nativo, usar Alert.alert
    if (Platform.OS === 'web') {
      setShowCloseConfirmModal(true);
    } else {
      Alert.alert(
        'Close flow',
        'Do you want to save this flow before closing?',
        [
          {
            text: 'Close without saving',
            style: 'cancel',
            onPress: () => {
              endFlow();
              router.back();
            },
          },
          {
            text: 'Save flow',
            onPress: () => {
              toggleSaveFlow(flow.id);
              endFlow();
              router.back();
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  const handleCloseWithoutSaving = () => {
    setShowCloseConfirmModal(false);
    endFlow();
    router.back();
  };

  const handleCloseAndSave = () => {
    if (!flow) return;
    setShowCloseConfirmModal(false);
    // Mostrar modal para nombrar el flow
    setShowSaveFlowModal(true);
  };

  const handleSaveFlowWithName = (name: string) => {
    if (!flow) return;
    toggleSaveFlow(flow.id, name);
    setShowSaveFlowModal(false);
    endFlow();
    router.back();
  };

  const handleCancelSaveFlow = () => {
    setShowSaveFlowModal(false);
    // Si cancelan, volver al modal de confirmación
    setShowCloseConfirmModal(true);
  };

  // handleNext ahora está manejado por FlowPlayerControls

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

  const renderHeader = () => (
    <GlassView style={styles.header} intensity="light" opacity="medium">
      <View style={styles.headerContent}>
        <Text style={[textStyles.caption, { color: colors.text }]}>NOW MOVING</Text>
        <View style={styles.headerControls}>
          <Tooltip text="Minimize">
            <TouchableOpacity
              onPress={handleMinimize}
              style={iconTouchableContainer.base}
              activeOpacity={0.7}>
              <Icon name="minimize" size={24} color={colors.text} />
            </TouchableOpacity>
          </Tooltip>
          <Tooltip text="Close">
            <TouchableOpacity
              onPress={handleClose}
              style={iconTouchableContainer.base}
              activeOpacity={0.7}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </Tooltip>
        </View>
      </View>
    </GlassView>
  );

  const renderSegmentedControl = () => (
    <View style={styles.segmentedControl}>
      <TouchableOpacity
        style={[
          styles.segment,
          viewMode === 'list' && { backgroundColor: colors.tint + '20' },
        ]}
        onPress={() => setViewMode('list')}
        activeOpacity={0.7}>
        <Text
          style={[
            textStyles.bodyMedium,
            { color: viewMode === 'list' ? colors.tint : colors.icon },
          ]}>
          List
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.segment,
          viewMode === 'map' && { backgroundColor: colors.tint + '20' },
        ]}
        onPress={() => setViewMode('map')}
        activeOpacity={0.7}>
        <Text
          style={[
            textStyles.bodyMedium,
            { color: viewMode === 'map' ? colors.tint : colors.icon },
          ]}>
          Map
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Helper para calcular tiempo estimado al siguiente spot
  const calculateTimeToNextSpot = (
    fromLocation: { latitude: number; longitude: number },
    toLocation: { latitude: number; longitude: number },
    mode: MovementMode
  ): number => {
    const distance = calculateDistance(
      fromLocation.latitude,
      fromLocation.longitude,
      toLocation.latitude,
      toLocation.longitude
    );
    // Velocidades promedio en m/min
    const speedPerMinute = {
      walking: 83.33, // 5 km/h = 83.33 m/min
      bike: 250, // 15 km/h = 250 m/min
      car: 833.33, // 50 km/h = 833.33 m/min
    };
    return Math.round(distance / speedPerMinute[mode]);
  };

  const renderProgress = () => {
    const timeToNextSpot = nextSpotData && currentSpot && flow
      ? calculateTimeToNextSpot(currentSpot.location, nextSpotData.location, flow.movementMode)
      : null;

    return (
    <View style={styles.progressContainer}>
        <View style={styles.progressRow}>
          <Text style={[textStyles.caption, { color: colors.icon }]}>
            {progress}%
          </Text>
          {timeToNextSpot !== null && (
            <Text style={[textStyles.caption, { color: colors.icon }]}>
              Next spot in {timeToNextSpot} min
            </Text>
          )}
        </View>
      <View style={[styles.progressBar, { backgroundColor: colors.icon + '20' }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: colors.tint, width: `${progress}%` },
          ]}
        />
      </View>
    </View>
  );
  };

  const renderTimeline = () => {
    if (viewMode !== 'list') return null;

    // Spot actual destacado
    const currentSpot = currentSpotId ? getSpotById(currentSpotId) : null;
    const currentIndex = flowState.currentSpotIndex;
    
    // Spots futuros (debajo del actual)
    const futureSpots = flowSpots.slice(currentIndex + 1);

    return (
      <View style={styles.timelineContainer}>
        {/* Spot actual destacado */}
        {currentSpot && (
          <View style={styles.currentSpotContainer}>
            <View style={styles.currentSpotHeader}>
              <Text style={[textStyles.heading3, { color: colors.text }]}>
                CURRENT
              </Text>
              <View style={[styles.liveTag, { backgroundColor: colors.tint }]}>
                <Text style={[textStyles.caption, { color: '#fff' }]}>Live</Text>
              </View>
            </View>
            <GlassView style={styles.currentSpotCard} intensity="light" opacity="medium">
              <View style={styles.currentSpotCardContent}>
                {/* Title and description */}
                <View style={styles.currentSpotCardLeft}>
                  <Text style={[styles.currentSpotTitle, { color: colors.text }]} numberOfLines={1}>
                    {currentSpot.name || 'Unnamed spot'}
                  </Text>
                  {currentSpot.description && (
                    <Text style={[styles.currentSpotDescription, { color: colors.text }]} numberOfLines={3}>
                      {currentSpot.description}
                    </Text>
                  )}
                </View>
                
                {/* Footer: Metadata (distancia + tiempo estimado) y acciones */}
                <View style={styles.currentSpotMetadataFooter}>
                  {/* Distancia */}
                  {userLocation && (() => {
                    const dist = calculateDistanceToSpot(userLocation, currentSpot.location);
                    if (!dist) return null;
                    return (
                      <View style={styles.metadataItem}>
                        <Icon name="map" size={14} color={colors.icon} />
                        <Text style={[styles.metadataText, { color: colors.icon }]}>
                          {dist < 1000 ? `${Math.round(dist)}m` : `${(dist / 1000).toFixed(1)} km`}
                        </Text>
                      </View>
                    );
                  })()}
                  
                  {/* Tiempo estimado al siguiente spot */}
                  {nextSpotData && currentSpot && flow && (() => {
                    const timeToNext = calculateTimeToNextSpot(
                      currentSpot.location,
                      nextSpotData.location,
                      flow.movementMode
                    );
                    return (
                      <View style={styles.metadataItem}>
                        <Icon name="clock" size={14} color={colors.icon} />
                        <Text style={[styles.metadataText, { color: colors.icon }]}>
                          {timeToNext} min
                        </Text>
                      </View>
                    );
                  })()}
                  
                  {/* Get Directions */}
                  {userLocation && nextSpotData && (
                    <TouchableOpacity
                      onPress={handleOpenNavigation}
                      style={styles.getDirectionsButton}
                      activeOpacity={0.7}>
                      <Icon name="directions" size={16} color={colors.tint} />
                      <Text style={[styles.getDirectionsText, { color: colors.tint }]}>
                        Get directions
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </GlassView>
            
            {/* Narration Text Section (colapsable) */}
            {narration.status === 'playing' && narration.currentNarration && (
              <View style={styles.narrationSection}>
                <TouchableOpacity
                  onPress={() => setShowNarrationText(!showNarrationText)}
                  style={styles.narrationToggle}
                  activeOpacity={0.7}>
                  <Icon 
                    name="audio" 
                    size={16} 
                    color={narration.isMuted ? colors.icon : colors.tint} 
                  />
                  <Text style={[textStyles.caption, { color: colors.icon }]}>
                    {showNarrationText ? 'Hide' : 'Show'} narration
                  </Text>
                </TouchableOpacity>
                
                {showNarrationText && (
                  <Text 
                    style={[styles.narrationText, { color: colors.tint }]}
                    numberOfLines={4}>
                    {narration.currentNarration.text}
                  </Text>
                )}
              </View>
            )}
            </View>
        )}

        {/* Listado de spots futuros con drag and drop */}
        {(futureSpots.length > 0 || (isFromSpot && suggestedSpots.length > 0)) && (
          <View style={styles.spotsListContainer}>
            <View style={styles.upNextHeader}>
              <Text style={[textStyles.heading3, { color: colors.text }]}>
                UP NEXT
              </Text>
              {futureSpots.length > 0 && (
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
              )}
            </View>
            {/* Sección 1: Spots agregados al flow */}
            {futureSpots.length > 0 && (
              <>
                {futureSpots.map((spot, relativeIndex) => {
                  const absoluteIndex = currentIndex + 1 + relativeIndex;
                  const isFirst = relativeIndex === 0;
                  const isLast = relativeIndex === futureSpots.length - 1;
                  const distance = userLocation
                    ? calculateDistanceToSpot(userLocation, spot.location) ?? undefined
                    : undefined;
                  
                  // Calcular tiempo estimado desde el spot anterior (o current spot para el primero)
                  const previousSpot = relativeIndex === 0 ? currentSpot : futureSpots[relativeIndex - 1];
                  const estimatedTime = previousSpot && flow
                    ? calculateTimeToNextSpot(previousSpot.location, spot.location, flow.movementMode)
                    : undefined;

                  return (
                    <FlowSpotCard
                      key={spot.id}
                      spot={spot}
                      index={absoluteIndex}
                      distance={distance}
                      estimatedTime={estimatedTime}
                      isActive={absoluteIndex === currentIndex}
                      isEditMode={isEditMode}
                      isFirst={isFirst}
                      isLast={isLast}
                      onMoveUp={() => handleMoveUp(spot.id)}
                      onMoveDown={() => handleMoveDown(spot.id)}
                      onRemove={() => handleRemoveSpot(spot.id)}
                      onPress={() => {
                        router.push(`/spot-detail?id=${spot.id}`);
                      }}
                    />
                  );
                })}
              </>
            )}
            {/* Sección 2: More Suggestions (solo si flow viene de spot) */}
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
                {suggestedSpots.map((spot) => {
                  const distance = userLocation
                    ? calculateDistanceToSpot(userLocation, spot.location) ?? undefined
                    : undefined;
                  return (
                    <FlowSpotCard
                      key={`suggested-${spot.id}`}
                      spot={spot}
                      index={flowSpots.length + suggestedSpots.indexOf(spot)}
                      distance={distance}
                      isSuggested={true}
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
      </View>
    );
  };

  const renderMapView = () => {
    if (viewMode !== 'map') return null;

    // Calcular ruta punto a punto: desde ubicación actual hasta siguiente spot
    const routeFrom = userLocation;
    const routeTo = nextSpotData ? nextSpotData.location : null;

    return (
      <View style={styles.mapContainer}>
        <FlowyaMapView
          spots={flowSpots}
          onSpotPress={(spot) => {
            // Navegar al spot seleccionado
            router.push(`/spot-detail?id=${spot.id}`);
          }}
          showRoute={true}
          flowSpots={flowSpots}
          showUserLocation={!!userLocation}
          userLocation={userLocation}
          routeFrom={routeFrom}
          routeTo={routeTo}
        />
        {/* Letrero siempre visible */}
        {userLocation && nextSpotData && (
          <View style={styles.navigationLabelContainer}>
            <GlassView style={styles.navigationLabel} intensity="light" opacity="medium">
              <Text style={[styles.navigationLabelText, { color: colors.text }]}>
                How to get there
              </Text>
            </GlassView>
          </View>
        )}
        {/* Botón flotante de navegación */}
        {userLocation && nextSpotData && (
          <View style={styles.navigationButtonContainer}>
            <Tooltip text="Get directions">
              <TouchableOpacity
                style={[styles.navigationButton, { backgroundColor: colors.tint }]}
                onPress={handleOpenNavigation}
                activeOpacity={0.7}>
                <Icon name="directions" size={24} color="#fff" />
              </TouchableOpacity>
            </Tooltip>
          </View>
        )}
      </View>
    );
  };

  const renderControls = () => (
    <FlowPlayerControls
      variant="screen"
      showPrevious={true}
      showNext={true}
      showMute={true}
    />
  );

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={handleClose}>
      <Animated.View
        style={[
          styles.container,
          { backgroundColor: colors.background, opacity: fadeAnim },
        ]}>
        {renderHeader()}
        {renderSegmentedControl()}
        {viewMode === 'list' ? (
        <ScrollView
          style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {renderProgress()}
            {renderTimeline()}
        </ScrollView>
        ) : (
          <>
            {renderProgress()}
            {renderMapView()}
          </>
        )}
        {renderControls()}
        
        <Toast
          visible={toastVisible}
          message={toastMessage}
          type={toastType}
          icon={toastIcon}
          duration={3000}
          onHide={hideToast}
          onUndo={toastUndoAction}
        />
      </Animated.View>
      
      {/* Modal de confirmación para web/iOS Safari */}
      <Modal
        visible={showCloseConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCloseConfirmModal(false)}>
        <View style={styles.modalOverlay}>
          <GlassView style={styles.modalContent} intensity="medium" opacity="strong">
            <Text style={[textStyles.heading3, { color: colors.text, marginBottom: spacing.md }]}>
              Close flow
            </Text>
            <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.lg }]}>
              Do you want to save this flow before closing?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel, { borderColor: colors.icon }]}
                onPress={() => setShowCloseConfirmModal(false)}
                activeOpacity={0.7}>
                <Text style={[textStyles.bodyMedium, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={handleCloseWithoutSaving}
                activeOpacity={0.7}>
                <Text style={[textStyles.bodyMedium, { color: colors.text }]}>
                  Close without saving
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.tint }]}
                onPress={handleCloseAndSave}
                activeOpacity={0.7}>
                <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>
                  Save flow
                </Text>
              </TouchableOpacity>
            </View>
          </GlassView>
        </View>
      </Modal>

      {/* Modal para nombrar flow */}
      <SaveFlowModal
        visible={showSaveFlowModal}
        flow={flow}
        spots={spots}
        currentName={flow ? getFlowCustomName(flow.id) : undefined}
        onSave={handleSaveFlowWithName}
        onCancel={handleCancelSaveFlow}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerControls: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  segmentedControl: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  progressContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  timelineContainer: {
    gap: spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timelineLineContainer: {
    alignItems: 'center',
    width: 24,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginBottom: spacing.xs,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  timelineSpot: {
    flex: 1,
  },
  currentSpotContainer: {
    marginBottom: spacing.md,
  },
  currentSpotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  liveTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 4,
  },
  currentSpotCard: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  currentSpotCardContent: {
    flexDirection: 'column',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  currentSpotCardLeft: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  currentSpotTitle: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    fontWeight: '500',
  },
  currentSpotDescription: {
    fontFamily,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontWeight: '400',
  },
  currentSpotMetadataFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
    minHeight: 24, // Altura mínima para que siempre sea visible
    paddingVertical: spacing.xs / 2, // Padding vertical para que sea más visible
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  metadataText: {
    fontFamily,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontWeight: '400',
  },
  getDirectionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    minHeight: 48,
    minWidth: 48,
  },
  getDirectionsText: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontWeight: '500',
  },
  narrationSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  narrationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    paddingVertical: spacing.xs,
    minHeight: 48,
  },
  narrationText: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    fontWeight: '400',
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  spotsListContainer: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  upNextHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  suggestedSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
  },
  suggestedSectionTitle: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  mapContainer: {
    flex: 1,
    minHeight: 400,
    position: 'relative',
  },
  navigationLabelContainer: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    zIndex: 999,
    alignItems: 'center',
  },
  navigationLabel: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  navigationLabelText: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontWeight: '500',
    textAlign: 'center',
  },
  navigationButtonContainer: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.md,
    zIndex: 1000,
  },
  navigationButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  // controls y controlButton ahora están en FlowPlayerControls
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  modalButtons: {
    gap: spacing.sm,
  },
  modalButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  modalButtonCancel: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  modalButtonSecondary: {
    backgroundColor: 'transparent',
  },
});

