/**
 * Shared Map Screen
 * V1.2: Pantalla de mapa compartido con pines
 * 
 * Características:
 * - Pantalla completa (sin tab bar, sin filtros, sin menú)
 * - Muestra solo pines del estado especificado (to_visit o visited)
 * - Título personalizado con nombre de usuario
 * - Permite navegar a spot-detail al hacer tap en cards
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';

import { FlowyaMapView, FlowyaMapViewRef } from '@/components/MapView';
import { SpotInlineCard } from '@/components/SpotInlineCard';
import { borderRadius } from '@/constants/borders';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { useAuth } from '@/contexts/AuthContext';
import { useSaved } from '@/contexts/SavedContext';
import { useSpot } from '@/contexts/SpotContext';
import { Spot } from '@/data/spots';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBaseLocation } from '@/hooks/useBaseLocation';
import { useSpotDistance } from '@/hooks/useSpotDistance';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type PinStateParam = 'to_visit' | 'visited';

export default function SharedMapScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ pinState?: PinStateParam; userId?: string }>();
  const colors = Colors[colorScheme ?? 'light'];
  const mapViewRef = useRef<FlowyaMapViewRef>(null);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  // Ubicación base estable
  const { baseLocation } = useBaseLocation();

  const { spots, isLoading: spotsLoading, getSpotById } = useSpot();
  const { isSpotPinned, getPinState, getPinnedSpots } = useSaved();
  const { user } = useAuth();
  
  // Calcular distancia del spot seleccionado
  const selectedSpotDistance = useSpotDistance(selectedSpot?.id || null, baseLocation);
  
  // Obtener pinState de los parámetros (default: 'visited')
  const pinState: PinStateParam = params.pinState === 'to_visit' ? 'to_visit' : 'visited';
  
  // Filtrar spots según estado de Pin
  const filteredSpots = useMemo(() => {
    if (spotsLoading) return [];
    
    const pinnedSpotIds = getPinnedSpots(pinState);
    
    return spots.filter((spot) => {
      const isPinned = isSpotPinned(spot.id);
      const spotPinState = getPinState(spot.id);
      return isPinned && spotPinState === pinState && pinnedSpotIds.includes(spot.id);
    });
  }, [spots, pinState, spotsLoading, isSpotPinned, getPinState, getPinnedSpots]);

  // Obtener nombre del usuario (usar email o placeholder)
  const userName = useMemo(() => {
    if (params.userId && user?.id === params.userId) {
      // Si es el propio usuario, usar email o metadata
      const emailName = user?.email?.split('@')[0];
      // Capitalizar primera letra
      return emailName ? emailName.charAt(0).toUpperCase() + emailName.slice(1) : 'Usuario';
    }
    // Para otros usuarios, usar userId o placeholder genérico (capitalizar)
    const userIdName = params.userId || 'Usuario';
    return userIdName.charAt(0).toUpperCase() + userIdName.slice(1);
  }, [params.userId, user]);

  // Título según estado (en inglés como ejemplo: "Visited places of Oscar")
  const title = useMemo(() => {
    const stateLabel = pinState === 'visited' ? 'Visited places' : 'Places to visit';
    return `${stateLabel} of ${userName}`;
  }, [pinState, userName]);

  // Enable LayoutAnimation on Android
  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  // Handle Spot selection
  const handleSpotPress = (spot: Spot) => {
    setSelectedSpot(spot);
  };

  // Handle SpotCard press (navegar a SpotDetail)
  const handleSpotCardPress = (spot: Spot) => {
    router.push(`/spot-detail?id=${spot.id}`);
    setSelectedSpot(null);
  };

  // Handle back
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/home');
    }
  };

  if (spotsLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
        <View style={styles.emptyState}>
          <Text style={[textStyles.body, { color: colors.icon }]}>Cargando...</Text>
        </View>
      </View>
    );
  }

  if (filteredSpots.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={[textStyles.bodyMedium, { color: colors.text }]}>← Atrás</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyState}>
          <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.sm }]}>
            No hay lugares {pinState === 'visited' ? 'visitados' : 'por visitar'}
          </Text>
          <Text style={[textStyles.body, { color: colors.icon }]}>
            Este mapa no tiene pines del estado especificado.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header simple con título y botón atrás */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={[textStyles.bodyMedium, { color: colors.text }]}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={[textStyles.heading4, { color: colors.text, flex: 1, textAlign: 'center', marginRight: 60 }]}>
          {title}
        </Text>
      </View>

      {/* Map - Pantalla completa */}
      <View style={styles.mapContainer}>
        <FlowyaMapView
          ref={mapViewRef}
          spots={filteredSpots}
          onSpotPress={handleSpotPress}
          onLongPress={() => {}} // Deshabilitado en vista compartida
          showUserLocation={false} // No mostrar ubicación del usuario en mapa compartido
          userLocation={null}
          highlightedSpotId={undefined}
          disableNativeControls={true}
        />
      </View>

      {/* SpotCard flotante cuando se selecciona un spot */}
      {selectedSpot && (
        <>
          {/* Backdrop para cerrar card al tocar fuera */}
          <TouchableOpacity
            style={[StyleSheet.absoluteFillObject, styles.backdrop]}
            onPress={() => setSelectedSpot(null)}
            activeOpacity={1}
          />
          {/* SpotInlineCard for Map overlay */}
          <View style={styles.selectedSpotCardContainer}>
            <SpotInlineCard
              spot={selectedSpot}
              state="default"
              distance={selectedSpotDistance}
              onPress={() => handleSpotCardPress(selectedSpot)}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    paddingVertical: spacing.xs,
    paddingRight: spacing.md,
  },
  mapContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backdrop: {
    backgroundColor: 'transparent',
    zIndex: 14,
  },
  selectedSpotCardContainer: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.md,
    right: spacing.md,
    zIndex: 15,
    maxWidth: 400,
    alignSelf: 'flex-start',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.lg,
  },
});
