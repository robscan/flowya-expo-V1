/**
 * SpotMediaCard Component
 * CANONICAL: Spot card with image for media contexts
 * 
 * Used in: Home, Search (grid), Saved, recommendations
 * 
 * Characteristics:
 * - Always shows image (with fallback)
 * - Not editable
 * - Stable and responsive layout
 * - Works in both grid (2 columns) and slider
 * - Container controls width, not the card
 */

import { useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { GestureResponderEvent, Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { GlassView } from '@/components/ui/GlassView';
import { Icon, iconTouchableContainer } from '@/components/ui/Icon';
import { InfoMeta } from '@/components/ui/InfoMeta';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { PinStateModal } from '@/components/ui/PinStateModal';
import { Toast } from '@/components/ui/Toast';
import { borderRadius } from '@/constants/borders';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { fontFamily, fontFamilyMedium, fontSize, lineHeight } from '@/constants/typography';
import { useAuth } from '@/contexts/AuthContext';
import { PinState, useSaved } from '@/contexts/SavedContext';
import { useSpot } from '@/contexts/SpotContext';
import { Spot } from '@/data/spots';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { showAlert } from '@/utils/alertPolyfill';
import { hasSeenPinModal, markPinModalSeen } from '@/utils/pinFirstTime';
import { getSpotTypeLabel } from '@/utils/spotFormHelpers';

interface SpotMediaCardProps {
  spot: Spot;
  onPress?: () => void;
  distance?: number; // En metros (opcional)
  rating?: { value: number; count?: number }; // Rating opcional
  size?: 'large' | 'small'; // Tamaño de la card (default: 'large')
}

export const SpotMediaCard = memo(function SpotMediaCard({ 
  spot, 
  onPress, 
  distance,
  rating,
  size = 'large',
}: SpotMediaCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { markSpotAsSeen } = useSpot();
  const { pinSpot, unpinSpot, changePinState, isSpotPinned, getPinState } = useSaved();
  const { isAuthenticated } = useAuth();
  // FASE 5: Usar image.url en lugar de photos[0] (compatible con ambos formatos)
  const imageUrl = spot.image?.url || (spot.photos && spot.photos.length > 0 ? spot.photos[0] : '');
  const hasImage = imageUrl && imageUrl.trim().length > 0;
  const spotTypeLabel = getSpotTypeLabel(spot.type);
  const isPinned = isSpotPinned(spot.id);
  const pinState = getPinState(spot.id);
  
  // Estados para modal y Toast
  const [showPinModal, setShowPinModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [hasSeenFirstTime, setHasSeenFirstTime] = useState<boolean | null>(null);

  // Verificar si usuario ya vio el modal (cargar al montar)
  useEffect(() => {
    hasSeenPinModal().then((seen) => {
      setHasSeenFirstTime(seen);
    });
  }, []);

  // Marcar Spot como 'seen' al montar (automáticamente)
  useEffect(() => {
    markSpotAsSeen(spot.id);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7807ebbf-84f7-465d-ad24-4eb47c053dcc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SpotMediaCard.tsx:82',message:'Card mounted',data:{spotId:spot.id,hasImage:!!imageSource},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
  }, [spot.id, markSpotAsSeen]);

  // FASE 5: Memoizar source usando image.url (compatible con ambos formatos)
  const imageSource = useMemo(() => {
    if (!hasImage || !imageUrl) {
      return null;
    }
    return { uri: imageUrl };
  }, [hasImage, imageUrl]); // Solo cambiar cuando cambia la URI de la imagen

  // Handler para seleccionar estado en modal
  const handlePinStateSelect = useCallback((state: PinState) => {
    pinSpot(spot.id, state);
    setShowPinModal(false);
    markPinModalSeen();
    setHasSeenFirstTime(true); // Actualizar estado local después de marcar
    setToastMessage(state === 'visited' ? 'Pinned · Visited' : 'Pinned · To visit');
    setShowToast(true);
  }, [spot.id, pinSpot]);

  // Handler para Pin (V1.2: Toggle cíclico)
  const handlePinPress = useCallback(async (e: GestureResponderEvent) => {
    e.stopPropagation(); // Prevenir que el card se abra
    
    // V1.2: Validar autenticación
    if (!isAuthenticated) {
      showAlert(
        'Iniciar sesión requerido',
        'Debes iniciar sesión para guardar pines.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Iniciar sesión',
            onPress: () => router.push('/(tabs)/login'),
          },
        ]
      );
      return;
    }
    
    // Si no está pinned
    if (!isPinned) {
      // Verificar si es primera vez (verificar siempre desde AsyncStorage para consistencia)
      const seen = await hasSeenPinModal();
      if (!seen) {
        // Primera vez: mostrar modal
        setHasSeenFirstTime(false);
        setShowPinModal(true);
        return;
      }
      
      // No es primera vez: pin directamente con to_visit
      if (hasSeenFirstTime === null) {
        setHasSeenFirstTime(true);
      }
      pinSpot(spot.id, 'to_visit');
      setToastMessage('Pinned · To visit');
      setShowToast(true);
      return;
    }
    
    // Ya está pinned: toggle cíclico
    if (pinState === 'to_visit') {
      // Cambiar a visited
      changePinState(spot.id, 'visited');
      setToastMessage('Changed to Visited');
      setShowToast(true);
    } else if (pinState === 'visited') {
      // Eliminar pin
      unpinSpot(spot.id);
      setToastMessage('Pin removido');
      setShowToast(true);
    }
  }, [spot.id, isPinned, pinState, unpinSpot, pinSpot, changePinState, isAuthenticated, router, hasSeenFirstTime]);


  // Handler para navegar a Map
  const handleViewOnMap = useCallback((e: GestureResponderEvent) => {
    e.stopPropagation(); // Prevenir que el card se abra
    router.push(`/(tabs)/map?spotId=${spot.id}`);
  }, [spot.id, router]);

  // Render variant="small" (compacto para grid y sliders)
  if (size === 'small') {
    return (
      <>
        <TouchableOpacity 
          onPress={onPress} 
          style={styles.smallCardContainer} 
          activeOpacity={0.7}
          delayPressIn={Platform.OS === 'web' ? 150 : 0}
        >
        {/* Imagen cuadrada 160px - siempre visible */}
        <View style={styles.smallImageContainer}>
          <OptimizedImage
            source={imageSource}
            width="100%"
            height="100%"
            borderRadius={borderRadius.md}
            showFallback={true}
            fallbackIcon="upload"
            resizeMode="cover"
          />
          {/* Botón "Map" - extremo inferior izquierdo */}
          <View style={styles.mapViewOverlay}>
            <Pressable
              onPress={handleViewOnMap}
              style={({ pressed }) => [
                styles.mapViewButton,
                {
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Chip text="Map" variant="default" icon="visibility" solidBackground={true} />
            </Pressable>
          </View>
          {/* Icono de Pin sobre la imagen - extremo superior derecho */}
          <View style={styles.bookmarkOverlay}>
            <View
              style={[
                styles.bookmarkButton,
                {
                  backgroundColor:
                    colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.9)',
                },
              ]}>
              <Pressable
                onPress={handlePinPress}
                style={({ pressed }) => [
                  iconTouchableContainer.base,
                  pressed && { opacity: 0.7 }
                ]}>
                <Icon
                  name={isPinned && pinState === 'visited' ? 'check-circle' : 'pin'}
                  size={24}
                  color={isPinned ? (pinState === 'visited' ? '#4CAF50' : '#2196F3') : colors.text}
                />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Título debajo de imagen */}
        <Text 
          style={[styles.smallTitle, { color: colors.text }]} 
          numberOfLines={2}
        >
          {spot.name || 'Unnamed spot'}
        </Text>

        {/* InfoMeta debajo del título */}
        {distance !== undefined && distance !== null && (
          <InfoMeta
            distance={distance}
            size={size}
          />
        )}
      </TouchableOpacity>
      <PinStateModal
        visible={showPinModal}
        onSelect={handlePinStateSelect}
        onCancel={() => setShowPinModal(false)}
      />
      <Modal
        visible={showToast}
        transparent
        animationType="none"
        onRequestClose={() => setShowToast(false)}
        statusBarTranslucent>
        <Toast
          message={toastMessage}
          visible={showToast}
          onHide={() => setShowToast(false)}
          type="success"
        />
      </Modal>
      </>
    );
  }

  // Render size="large" (default)
  return (
    <>
      <Pressable onPress={onPress} style={styles.cardContainer}>
      <GlassView
        style={styles.card}
        intensity="light"
        opacity="medium"
        shadowLevel="subtle"
        enableGlow={true}
        useGrayBackground={true}
      >
        {/* Imagen arriba o placeholder - siempre visible */}
        <View style={styles.imageContainer}>
          <OptimizedImage
            source={imageSource}
            width="100%"
            height={200}
            showFallback={true}
            fallbackIcon="upload"
            resizeMode="cover"
          />
          {/* Botón "Map" - extremo inferior izquierdo */}
          <View style={styles.mapViewOverlay}>
            <Pressable
              onPress={handleViewOnMap}
              style={({ pressed }) => [
                styles.mapViewButton,
                {
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Chip text="Map" variant="default" icon="visibility" solidBackground={true} />
            </Pressable>
          </View>
          {/* Icono de Pin sobre la imagen - extremo superior derecho */}
          <View style={styles.bookmarkOverlay}>
            <View
              style={[
                styles.bookmarkButton,
                {
                  backgroundColor:
                    colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.9)',
                },
              ]}>
              <Pressable
                onPress={handlePinPress}
                style={({ pressed }) => [
                  iconTouchableContainer.base,
                  pressed && { opacity: 0.7 }
                ]}>
                <Icon
                  name={isPinned && pinState === 'visited' ? 'check-circle' : 'pin'}
                  size={24}
                  color={isPinned ? (pinState === 'visited' ? '#4CAF50' : '#2196F3') : colors.text}
                />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Contenido principal */}
        <View style={styles.content}>
          <View style={styles.spotInfo}>
            <Text style={[styles.spotName, { color: colors.text }]} numberOfLines={1}>
              {spot.name || 'Unnamed spot'}
            </Text>
            {spot.description && (
              <Text style={[styles.spotDescription, { color: colors.icon }]} numberOfLines={2}>
                {spot.description}
              </Text>
            )}
            {/* InfoMeta debajo de la descripción */}
            <View style={styles.infoMetaContainer}>
              <InfoMeta
                chip={{ label: spotTypeLabel }}
                distance={distance}
                rating={rating}
                size="large"
              />
            </View>
          </View>
        </View>
      </GlassView>
    </Pressable>
    <PinStateModal
      visible={showPinModal}
      onSelect={handlePinStateSelect}
      onCancel={() => setShowPinModal(false)}
    />
    <Modal
      visible={showToast}
      transparent
      animationType="none"
      onRequestClose={() => setShowToast(false)}
      statusBarTranslucent>
      <Toast
        message={toastMessage}
        visible={showToast}
        onHide={() => setShowToast(false)}
        type="success"
      />
    </Modal>
    </>
  );
});

const styles = StyleSheet.create({
  // Variant large
  cardContainer: {
    marginBottom: spacing.xs,
    // iOS Safari: Eliminar touch-action para permitir que el navegador maneje scroll naturalmente
    // El ScrollView padre manejará el scroll correctamente
  },
  card: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  // Variant small
  smallCardContainer: {
    // Container controls width, not the card
    width: '100%',
    // iOS Safari: Eliminar touch-action para permitir que el navegador maneje scroll naturalmente
    // El ScrollView padre manejará el scroll correctamente
  },
  smallImageContainer: {
    width: '100%',
    aspectRatio: 1, // Mantener cuadrado
    marginBottom: spacing.xs,
  },
  smallTitle: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontWeight: '500',
    marginBottom: spacing.xs / 2,
  },
  // Contenido principal
  spotInfo: {
    flex: 1,
    gap: spacing.xs / 2,
    minWidth: 0,
  },
  spotName: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    fontWeight: '500',
  },
  spotDescription: {
    fontFamily,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontWeight: '400',
  },
  infoMetaContainer: {
    marginTop: -(spacing.sm - spacing.xs / 2), // Compensar marginTop de InfoMeta (16px -> 4px)
  },
  // Map View overlay (inferior izquierda)
  mapViewOverlay: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    zIndex: 10,
  },
  mapViewButton: {
    // Chip tiene su propio padding, no necesita contenedor adicional
  },
  // Bookmark overlay (superior derecha)
  bookmarkOverlay: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    zIndex: 10,
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
