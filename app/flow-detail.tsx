/**
 * Flow Detail Screen
 * Scope 13: Flow Detail (Path Detail) - Pantalla completa
 * 
 * Based on Product Definition FLOWYA V1.0
 * Muestra información detallada de un Flow (Path) con opción de iniciar Flow
 */

import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { FlowyaMapView } from '@/components/MapView';
import { SpotMediaCard } from '@/components/SpotMediaCard';
import { Chip } from '@/components/ui/Chip';
import { ContentHeader, ContentHeaderAction } from '@/components/ui/ContentHeader';
import { Icon } from '@/components/ui/Icon';
import { InfoMeta } from '@/components/ui/InfoMeta';
import { borderRadius } from '@/constants/borders';
import { getMovementModeLabel } from '@/constants/movementMode';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { fontFamilyMedium, fontSize, lineHeight, textStyles } from '@/constants/typography';
import { useFlow } from '@/contexts/FlowContext';
import { usePath } from '@/contexts/PathContext';
import { useSaved } from '@/contexts/SavedContext';
import { useSpot } from '@/contexts/SpotContext';
import { calculateEstimatedDuration, getFlowSpots } from '@/data/flows';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { calculateDistanceToSpot, calculatePathDistance } from '@/utils/distance';

export default function FlowDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { getFlowById } = usePath();
  const { spots } = useSpot();
  const { startFlow } = useFlow();
  const { isFlowSaved, toggleSaveFlow } = useSaved();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Get flow from context
  const flow = id ? getFlowById(id) : null;

  // Get user location
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

  // Calcular flowSpots antes de los hooks (puede ser null)
  const flowSpots = flow ? getFlowSpots(flow, spots) : [];

  if (!flow) {
    return null;
  }

  const isSaved = isFlowSaved(flow.id);
  const estimatedDuration = calculateEstimatedDuration(flowSpots.length, flow.movementMode);
  const totalDistance = calculatePathDistance(flow, spots);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const handleLike = () => {
    // TODO: Implement like functionality for flows if needed
    console.log('Like flow:', flow.id);
  };

  const handleSave = () => {
    toggleSaveFlow(flow.id);
  };

  const handleShare = async () => {
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
  };

  const handleStartFlow = () => {
    // Validar ubicación antes de iniciar flow
    if (!userLocation) {
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
  };

  // Render map view
  const renderMapView = () => {
    // Calcular región inicial que incluya todos los spots del flow
    const calculateMapRegion = () => {
      const allPoints: { latitude: number; longitude: number }[] = [];
      
      // Incluir ubicación del usuario si está disponible
      if (userLocation) {
        allPoints.push(userLocation);
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
    const mapKey = `map-${flowSpots.length}-${userLocation ? `${userLocation.latitude.toFixed(4)}-${userLocation.longitude.toFixed(4)}` : 'no-location'}`;

    return (
      <View style={styles.mapContainer}>
        <FlowyaMapView
          key={mapKey}
          spots={flowSpots}
          onSpotPress={(spot) => {
            router.push(`/spot-detail?id=${spot.id}`);
          }}
          showRoute={false}
          flowSpots={flowSpots}
          showUserLocation={!!userLocation}
          userLocation={userLocation}
          initialRegion={calculateMapRegion()}
          currentSpotIndex={-1}
          flowSpotsOrder={flowSpots}
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
          const distance = userLocation
            ? calculateDistanceToSpot(userLocation, spot.location) ?? undefined
            : undefined;
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
      icon: 'like',
      onPress: handleLike,
    },
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
            {flow.description && (
              <Text style={[textStyles.body, { color: colors.text, marginTop: spacing.sm }]}>
                {flow.description}
              </Text>
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
              duration={estimatedDuration}
              distance={totalDistance}
              size="large"
            />
            <Text style={[textStyles.bodyMedium, { color: colors.text, marginTop: spacing.sm }]}>
              {flowSpots.length} {flowSpots.length === 1 ? 'spot' : 'spots'}
            </Text>
          </View>

          {/* Botón Start Flow */}
          <View style={styles.startButtonContainer}>
            <TouchableOpacity
              onPress={handleStartFlow}
              style={[
                styles.startButton, 
                { 
                  backgroundColor: userLocation ? colors.tint : colors.icon + '40',
                  opacity: userLocation ? 1 : 0.6,
                }
              ]}
              activeOpacity={0.8}
              disabled={!userLocation}>
              <Icon name="play" size={24} color="#fff" />
              <Text style={[textStyles.bodyMedium, { color: '#fff', marginLeft: spacing.xs }]}>
                Start Flow
              </Text>
            </TouchableOpacity>
            {!userLocation && (
              <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs, textAlign: 'center' }]}>
                Enable location for better experience
              </Text>
            )}
          </View>

          {/* Lista de spots */}
          {renderSpotsList()}
        </View>
      </ScrollView>
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

