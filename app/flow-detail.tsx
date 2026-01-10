/**
 * Flow Detail Screen
 * Scope 13: Flow Detail (Path Detail) - Pantalla completa
 * 
 * Based on Product Definition FLOWYA V1.0
 * Muestra información detallada de un Flow (Path) con opción de iniciar Flow
 * 
 * SCOPE 5: Pantalla FlowDetail completa
 * - Header con Atrás, Compartir, Guardar
 * - Mapa con controles (agregar spot, ubicación, get directions, fullscreen)
 * - Campo de texto descriptivo editable
 * - Listado de spots (SpotMediaCard large)
 * - Opción de editar
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { FlowyaMapView, FlowyaMapViewRef } from '@/components/MapView';
import { SaveFlowModal } from '@/components/SaveFlowModal';
import { SpotMediaCard } from '@/components/SpotMediaCard';
import { Chip } from '@/components/ui/Chip';
import { ContentHeader, ContentHeaderAction } from '@/components/ui/ContentHeader';
import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { InfoMeta } from '@/components/ui/InfoMeta';
import { MapControls } from '@/components/ui/MapControls';
import { Tooltip } from '@/components/ui/Tooltip';
import { borderRadius } from '@/constants/borders';
import { getMovementModeLabel } from '@/constants/movementMode';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { fontFamilyMedium, fontSize, lineHeight, textStyles } from '@/constants/typography';
import { useFlow } from '@/contexts/FlowContext';
import { usePath } from '@/contexts/PathContext';
import { useSaved } from '@/contexts/SavedContext';
import { useSpot } from '@/contexts/SpotContext';
import { getFlowSpots } from '@/data/flows';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBaseLocation } from '@/hooks/useBaseLocation';
import { getSpotDistance } from '@/hooks/useSpotDistance';
import { calculatePathDistance } from '@/utils/distance';
import { mapMovementModeToNavigationMode, openNavigationApp } from '@/utils/navigationHelpers';

export default function FlowDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { getFlowById, updateFlow, createFlow } = usePath();
  const { spots } = useSpot();
  const { startFlow } = useFlow();
  const { isFlowSaved, toggleSaveFlow, saveFlow: saveFlowInSaved } = useSaved();
  
  // Ubicación base estable
  const { baseLocation } = useBaseLocation();
  
  // Estados para edición y controles del mapa
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [showSaveCopyModal, setShowSaveCopyModal] = useState(false);
  const mapViewRef = useRef<FlowyaMapViewRef>(null);

  // Get flow from context
  const flow = id ? getFlowById(id) : null;

  // Calcular flowSpots usando useMemo para evitar recálculos
  const flowSpots = useMemo(() => {
    return flow ? getFlowSpots(flow, spots) : [];
  }, [flow, spots]);

  // Inicializar descripción editada
  useEffect(() => {
    if (flow) {
      setEditedDescription(flow.description || '');
    }
  }, [flow]);

  // If no flow, redirect back
  useEffect(() => {
    if (!flow) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/home');
      }
    }
  }, [flow, router]);

  // Handlers para controles del mapa (siempre definidos, antes del return condicional)
  const handleZoomIn = useCallback(() => {
    if (mapViewRef.current) {
      mapViewRef.current.zoomIn();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapViewRef.current) {
      mapViewRef.current.zoomOut();
    }
  }, []);

  const handleCenterOnUserLocation = useCallback(() => {
    if (mapViewRef.current && baseLocation) {
      mapViewRef.current.centerOnUserLocation();
    }
  }, [baseLocation]);

  const handleGetDirections = useCallback(async () => {
    if (!baseLocation || flowSpots.length === 0 || !flow) return;
    
    const lastSpot = flowSpots[flowSpots.length - 1];
    
    const origin = baseLocation;
    const destination = lastSpot.location;
    
    const mode = mapMovementModeToNavigationMode(flow.movementMode);
    
    await openNavigationApp(origin, destination, mode);
  }, [baseLocation, flowSpots, flow]);

  const handleAddSpot = useCallback(() => {
    // Navegar a crear spot (podría agregarse un callback para agregar al flow)
    router.push('/create-spot');
  }, [router]);
  
  // Handler para guardar edición
  // SCOPE 6: Reglas de edición
  // - Si el flow es del usuario (guardado): edita directamente
  // - Si no es del usuario: pide nombre y guarda copia
  const handleSaveEdit = useCallback(() => {
    if (!flow) return;
    
    const isOwnFlow = isFlowSaved(flow.id);
    
    if (isOwnFlow) {
      // Flow del usuario: editar directamente
      updateFlow(flow.id, {
        description: editedDescription,
      });
      
      setIsEditMode(false);
      Alert.alert('Success', 'Flow updated');
    } else {
      // Flow de otro usuario: pedir nombre y guardar copia
      setShowSaveCopyModal(true);
    }
  }, [flow, editedDescription, updateFlow, isFlowSaved]);
  
  // Handler para guardar copia del flow con nombre personalizado
  const handleSaveCopy = useCallback((name: string) => {
    if (!flow) return;
    
    // Crear copia del flow con nombre personalizado
    const copiedFlow = createFlow(
      flow.spots,
      flow.movementMode,
      name,
      editedDescription || flow.description
    );
    
    // Guardar en Saved con nombre personalizado
    saveFlowInSaved(copiedFlow.id, name);
    
    setIsEditMode(false);
    setShowSaveCopyModal(false);
    Alert.alert('Success', 'Flow copied and saved');
    
    // Navegar al nuevo flow
    router.replace(`/flow-detail?id=${copiedFlow.id}`);
  }, [flow, editedDescription, createFlow, saveFlowInSaved, router]);
  
  // Handler para cancelar guardado de copia
  const handleCancelSaveCopy = useCallback(() => {
    setShowSaveCopyModal(false);
    setIsEditMode(false);
    // Restaurar descripción original
    if (flow) {
      setEditedDescription(flow.description || '');
    }
  }, [flow]);
  
  // Handler para cancelar edición
  const handleCancelEdit = useCallback(() => {
    if (flow) {
      setEditedDescription(flow.description || '');
    }
    setIsEditMode(false);
  }, [flow]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  }, [router]);

  const handleSave = useCallback(() => {
    if (!flow) return;
    toggleSaveFlow(flow.id);
  }, [flow, toggleSaveFlow]);

  const handleShare = useCallback(async () => {
    if (!flow) return;
    try {
      const shareUrl = `flowya.app/flow-detail?id=${flow.id}`;
      const shareMessage = `Check out "${flow.title}" on FLOWYA! ${shareUrl}`;
      
      await Share.share({
        message: shareMessage,
        title: flow.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Couldn\'t share. Try again.');
    }
  }, [flow]);

  const handleStartFlow = useCallback(() => {
    if (!flow) return;
    // Validar ubicación antes de iniciar flow
    if (!baseLocation) {
      Alert.alert(
        'Location needed',
        'Enable location for guided navigation. Flow works without it.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Continue without location', 
            onPress: () => {
              startFlow(flow.id);
              router.back();
            }
          },
        ]
      );
      return;
    }
    
    startFlow(flow.id);
    router.back();
  }, [flow, baseLocation, startFlow, router]);

  // Early return después de todos los hooks
  if (!flow) {
    return null;
  }

  const isSaved = isFlowSaved(flow.id);
  const totalDistance = calculatePathDistance(flow, spots);

  // Render map view con controles
  const renderMapView = () => {
    // Calcular región inicial que incluya todos los spots del flow
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
          ref={mapViewRef}
          key={mapKey}
          spots={flowSpots}
          onSpotPress={(spot) => {
            router.push(`/spot-detail?id=${spot.id}`);
          }}
          showRoute={false}
          flowSpots={flowSpots}
          showUserLocation={!!baseLocation}
          userLocation={baseLocation}
          initialRegion={calculateMapRegion()}
          currentSpotIndex={-1}
          flowSpotsOrder={flowSpots}
          disableNativeControls={true}
        />
        
        {/* Controles lado izquierdo (stack vertical) */}
        <View style={styles.leftControls}>
          {/* Botón + Add Spot (arriba) */}
          <Tooltip text="Add spot">
            <Pressable
              style={({ pressed }) => [
                styles.controlButton,
                {
                  backgroundColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={handleAddSpot}>
              <GlassView
                style={styles.buttonContent}
                intensity="light"
                opacity="medium"
                shadowLevel="subtle"
                enableGlow={false}>
                <Icon name="add-location" size={20} color={colors.text} />
              </GlassView>
            </Pressable>
          </Tooltip>

          {/* Botón Current Location (abajo, solo si baseLocation existe) */}
          {baseLocation && (
            <Tooltip text="Center on location">
              <Pressable
                style={({ pressed }) => [
                  styles.controlButton,
                  {
                    backgroundColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                onPress={handleCenterOnUserLocation}>
                <GlassView
                  style={styles.buttonContent}
                  intensity="light"
                  opacity="medium"
                  shadowLevel="subtle"
                  enableGlow={false}>
                  <Icon name="navigation" size={20} color={colors.tint} />
                </GlassView>
              </Pressable>
            </Tooltip>
          )}
          
          {/* Get directions (si hay baseLocation y spots) */}
          {baseLocation && flowSpots.length > 0 && (
            <Tooltip text="Get directions">
              <Pressable
                style={({ pressed }) => [
                  styles.controlButton,
                  {
                    backgroundColor: colors.tint,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                onPress={handleGetDirections}>
                <GlassView
                  style={styles.buttonContent}
                  intensity="light"
                  opacity="medium"
                  shadowLevel="subtle"
                  enableGlow={false}>
                  <Icon name="directions" size={20} color="#fff" />
                </GlassView>
              </Pressable>
            </Tooltip>
          )}
        </View>

        {/* Map Controls - Lado derecho (zoom y fullscreen) */}
        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFullscreenToggle={() => setIsMapFullscreen(!isMapFullscreen)}
          isFullscreen={isMapFullscreen}
          showFullscreen={true}
        />
      </View>
    );
  };

  // Render spots list
  const renderSpotsList = () => {
    if (flowSpots.length === 0) return null;

    return (
      <View style={styles.spotsListContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            PLACES IN THIS FLOW
          </Text>
        </View>
        {flowSpots.map((spot, index) => {
          const distance = getSpotDistance(spot, baseLocation);
          return (
            <SpotMediaCard
              key={spot.id}
              spot={spot}
              size="large"
              distance={distance}
              onPress={() => {
                router.push(`/spot-detail?id=${spot.id}`);
              }}
            />
          );
        })}
      </View>
    );
  };

  // Preparar acciones del header
  const leftActions: ContentHeaderAction[] = [
    {
      icon: 'back',
      onPress: handleBack,
    },
  ];
  
  const rightActions: ContentHeaderAction[] = [
    {
      icon: 'share',
      onPress: handleShare,
    },
    {
      icon: 'bookmark',
      onPress: handleSave,
      isActive: isSaved,
      activeColor: isSaved ? colors.tint : undefined,
    },
    {
      icon: isEditMode ? 'check' : 'edit',
      onPress: () => {
        if (isEditMode) {
          handleSaveEdit();
        } else {
          setIsEditMode(true);
        }
      },
      tooltip: isEditMode ? 'Save changes' : 'Edit flow',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

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
          rightActions={rightActions}
          showOverlay={false}
          sticky={true}
        />

        {/* Información del flow */}
        <View style={styles.timelineContainer}>
          {/* Título y descripción */}
          <View style={styles.flowInfoContainer}>
            <View style={styles.flowHeader}>
              <Text style={[textStyles.heading, { color: colors.text }]}>
                {flow.title}
              </Text>
            </View>
            {/* Campo de descripción: editable en modo edición */}
            {isEditMode ? (
              <TextInput
                style={[
                  styles.descriptionInput,
                  {
                    color: colors.text,
                    borderColor: colors.icon + '30',
                    backgroundColor: colors.background,
                  },
                ]}
                value={editedDescription}
                onChangeText={setEditedDescription}
                placeholder="Add a description..."
                placeholderTextColor={colors.icon}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            ) : (
              flow.description && (
                <Text style={[textStyles.body, { color: colors.text, marginTop: spacing.sm }]}>
                  {flow.description}
                </Text>
              )
            )}
            
            {/* Acciones de edición */}
            {isEditMode && (
              <View style={styles.editActions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.editActionButton,
                    styles.cancelButton,
                    {
                      backgroundColor: colors.icon + '20',
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                  onPress={handleCancelEdit}>
                  <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.editActionButton,
                    styles.saveButton,
                    {
                      backgroundColor: colors.tint,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                  onPress={handleSaveEdit}>
                  <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>Save</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Chip de movement mode */}
          <View style={styles.chipContainer}>
            <Chip
              text={getMovementModeLabel(flow.movementMode).toUpperCase()}
              variant="highlighted"
            />
          </View>

          {/* Métricas con InfoMeta */}
          <View style={styles.metricsContainer}>
            <InfoMeta
              distance={totalDistance}
              size="large"
            />
            <Text style={[textStyles.bodyMedium, { color: colors.text, marginTop: spacing.sm }]}>
              {flowSpots.length} {flowSpots.length === 1 ? 'spot' : 'spots'}
            </Text>
          </View>

          {/* Botón Start Flow */}
          <View style={styles.startButtonContainer}>
            <Pressable
              onPress={handleStartFlow}
              style={({ pressed }) => [
                styles.startButton, 
                { 
                  backgroundColor: baseLocation ? colors.tint : colors.icon + '40',
                  opacity: baseLocation ? (pressed ? 0.8 : 1) : 0.6,
                }
              ]}
              disabled={!baseLocation}>
              <Icon name="play" size={24} color="#fff" />
              <Text style={[textStyles.bodyMedium, { color: '#fff', marginLeft: spacing.xs }]}>
                Start Flow
              </Text>
            </Pressable>
            {!baseLocation && (
              <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs, textAlign: 'center' }]}>
                Enable location for better experience
              </Text>
            )}
          </View>

          {/* Lista de spots */}
          {renderSpotsList()}
        </View>
      </ScrollView>
      
      {/* Modal para guardar copia (si no es flow del usuario) */}
      <SaveFlowModal
        visible={showSaveCopyModal}
        flow={flow}
        spots={spots}
        isSaved={false}
        hasChanges={true}
        flowState="draft"
        onSave={handleSaveCopy}
        onExitWithoutSaving={handleCancelSaveCopy}
        onCancel={handleCancelSaveCopy}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: 0,
  },
  // Estilos para mapa embebido - hero visual pegado al top, full width
  embeddedMapContainer: {
    height: 280,
    width: '100%',
    marginLeft: -spacing.md,
    marginRight: -spacing.md,
    position: 'relative',
    marginTop: 0,
    marginBottom: spacing.xl,
  },
  mapContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  leftControls: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.md,
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 20,
    gap: spacing.sm,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
  timelineContainer: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  flowInfoContainer: {
    marginBottom: spacing.sm,
  },
  flowHeader: {
    marginBottom: spacing.xs,
  },
  descriptionInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    fontFamily: fontFamilyMedium,
    minHeight: 100,
  },
  editActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  editActionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
    // backgroundColor se aplica dinámicamente
  },
  saveButton: {
    // backgroundColor se aplica dinámicamente
  },
  chipContainer: {
    marginBottom: spacing.sm,
  },
  metricsContainer: {
    marginBottom: spacing.sm,
  },
  startButtonContainer: {
    marginBottom: spacing.sm,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  spotsListContainer: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  sectionHeader: {
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontWeight: '600',
  },
});
