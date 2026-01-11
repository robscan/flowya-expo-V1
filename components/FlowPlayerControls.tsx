/**
 * Flow Player Controls Component
 * Componente unificado para controles de reproducción en todas las modalidades
 * 
 * Variantes:
 * - mini: Para FlowMiniBar (compacto horizontal) - NOTA: FlowMiniPlayer fue reemplazado por FlowMiniBar
 * - screen: Para FlowScreen (barra inferior fija)
 * - full: Para FlowFullPlayer (expandido con info)
 * 
 * Funcionalidades:
 * - Sincronización automática Flow/Narration
 * - Mute accesible en todas las modalidades
 * - Feedback visual del estado de narración
 * - Áreas táctiles mínimas de 48px
 */

import { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, iconTouchableContainer } from '@/components/ui/Icon';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { fontSize, lineHeight, textStyles } from '@/constants/typography';
import { useFlow } from '@/contexts/FlowContext';
import { useSaved } from '@/contexts/SavedContext';
import { useFlowSubtitle } from '@/hooks/useFlowSubtitle';
import { Flow } from '@/data/flows';
import { Spot } from '@/data/spots';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface FlowPlayerControlsProps {
  variant: 'mini' | 'full' | 'screen';
  showPrevious?: boolean;
  showNext?: boolean;
  showAffinity?: boolean;
  currentSpotId?: string;
  currentSpot?: Spot | null;
  userLocation?: { latitude: number; longitude: number } | null;
  flowSpots?: Spot[];
  flow?: Flow | null;
  nextSpotData?: Spot | null;
  compact?: boolean;
  onExpand?: () => void;
  onLike?: (spotId: string) => void;
  onNotMyVibe?: (spotId: string) => void;
  isVisible?: boolean; // SCOPE 2: Control de visibilidad con scroll (solo transform/opacity)
}

export function FlowPlayerControls({
  variant,
  showPrevious = false,
  showNext = true,
  showAffinity = false,
  currentSpotId,
  currentSpot,
  userLocation,
  flowSpots = [],
  flow,
  nextSpotData,
  compact = false,
  onExpand,
  onLike,
  onNotMyVibe,
  isVisible = true, // SCOPE 2: Por defecto visible
}: FlowPlayerControlsProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { flowState, pauseFlow, resumeFlow, previousNarrationBlock, nextNarrationBlock, nextSpotId } = useFlow(); // SCOPE 3: Usar navegación por bloques
  const subtitle = useFlowSubtitle(); // P0-06: Obtener subtítulo actual basado en eventos
  
  // Obtener estado de afinidad
  const { isSpotLikedFromPlayer, notMyVibeSpots } = useSaved();
  const isLiked = currentSpotId ? isSpotLikedFromPlayer(currentSpotId) : false;
  const isNotMyVibe = currentSpotId ? notMyVibeSpots.includes(currentSpotId) : false;

  // Calcular progreso (solo para variant='screen')
  const progressPercent = useMemo(() => {
    if (variant !== 'screen' || !flowSpots.length) return 0;
    const currentIndex = flowState.currentSpotIndex;
    return ((currentIndex + 1) / flowSpots.length) * 100;
  }, [variant, flowSpots.length, flowState.currentSpotIndex]);

  const totalSpots = flowSpots.length;

  // P0-05: Audio eliminado - pausa/resume solo afecta al Flow, no a audio
  const handlePause = useCallback(() => {
    if (flowState.status === 'active') {
      pauseFlow();
    } else if (flowState.status === 'paused') {
      resumeFlow();
    }
  }, [flowState.status, pauseFlow, resumeFlow]);

  // SCOPE 3: Navegación por bloques narrativos (un click = un bloque)
  const handlePrevious = useCallback(() => {
    previousNarrationBlock(); // Retroceder un bloque narrativo (o bloque final del spot anterior)
  }, [previousNarrationBlock]);

  const handleNext = useCallback(() => {
    nextNarrationBlock(); // Avanzar un bloque narrativo (o siguiente spot si completó todos los bloques)
  }, [nextNarrationBlock]);

  // Determinar tamaños según variante y tipo de botón
  const primaryIconSize = variant === 'mini' ? 24 : 28;
  const secondaryIconSize = 20;
  const affinityIconSize = 18;
  const primaryButtonSize = variant === 'mini' ? 48 : 56;
  const controlGap = compact ? spacing.xs / 2 : (variant === 'mini' ? spacing.sm : spacing.md);
  const affinityGap = spacing.sm; // Gap más pequeño para botones de afinidad
  const minTouchArea = 48;

  // FIX: Estilos completos de visibilidad (no solo opacity/transform)
  const visibilityStyle = variant === 'screen' ? {
    opacity: isVisible ? 1 : 0,
    transform: [{ translateY: isVisible ? 0 : 100 }],
    pointerEvents: (isVisible ? 'auto' : 'none') as 'auto' | 'none', // FIX: No interceptar toques cuando oculto
    zIndex: isVisible ? 1000 : -1, // FIX: z-index negativo cuando oculto (no intercepta nada)
  } : {};

  // Estilos según variante
  const containerStyle = [
    styles.container,
    variant === 'mini' && styles.containerMini,
    variant === 'screen' && [
      styles.containerScreen, 
      { 
        borderTopColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        backgroundColor: colors.background, // FIX: Fondo del tema para evitar transparencias
      }
    ],
    variant === 'full' && [styles.containerFull, { borderTopColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }],
    visibilityStyle, // FIX: Aplicar visibilidad completa (opacity, transform, pointerEvents, zIndex)
  ];

  // No se requiere lógica de centrado condicional
  // El layout de 3 columnas simétricas maneja el centrado automáticamente

  // P0-06: Determinar texto del subtítulo (de forma declarativa, para reactividad correcta)
  const subtitleText = subtitle?.text;
  const hasSubtitleText = Boolean(subtitleText && subtitleText.trim().length > 0);

  // P0-05: renderNarrationInfo eliminado - audio ya no se usa, subtítulos se muestran en infoSection

  // SCOPE 2: Transiciones suaves manejadas por React Native automáticamente con estilos
  return (
    <View 
      style={containerStyle}
      // FIX: Prevenir problema de aria-hidden cuando está oculto
      accessibilityElementsHidden={variant === 'screen' && !isVisible}
      importantForAccessibility={variant === 'screen' && !isVisible ? 'no-hide-descendants' : 'auto'}>
      {/* Sección de información (solo para variant='screen') - P0-06: Renderizado declarativo para reactividad correcta */}
      {variant === 'screen' && currentSpot && (
        <View style={styles.infoSection}>
          {/* P0-06: Mostrar subtítulo si existe, sino UI base */}
          {hasSubtitleText ? (
            <>
              {/* Subtítulos de narración - máximo 2 líneas, corte por palabras completas */}
              <Text 
                style={[textStyles.body, styles.subtitleText, { color: colors.text }]}
                numberOfLines={2}
                ellipsizeMode="tail">
                {subtitleText || ''}
              </Text>

              {/* Stepper siempre visible */}
              <View style={[styles.progressBar, { backgroundColor: colors.icon + '15' }]}>
                <View
                  style={[
                    styles.progressFill,
                    { backgroundColor: colors.tint, width: `${progressPercent}%` },
                  ]}
                />
              </View>
            </>
          ) : (
            <>
              {/* Sin subtítulo: mostrar labels originales (fallback UX) */}
              {/* Fila de estado: Punto rojo + NOW MOVING + espacio + X spots added */}
              <View style={styles.statusRow}>
                <View style={styles.statusLeft}>
                  <View style={[styles.greenDot, { backgroundColor: '#FF3B30' }]} />
                  <Text style={[textStyles.caption, styles.statusText, { color: colors.icon }]}>NOW MOVING</Text>
                </View>
                {totalSpots > 0 && (
                  <Text style={[textStyles.caption, styles.statusText, { color: colors.text }]}>
                    {totalSpots} {totalSpots === 1 ? 'spot' : 'spots'} added
                  </Text>
                )}
              </View>

              {/* Stepper */}
              <View style={[styles.progressBar, { backgroundColor: colors.icon + '15' }]}>
                <View
                  style={[
                    styles.progressFill,
                    { backgroundColor: colors.tint, width: `${progressPercent}%` },
                  ]}
                />
              </View>
            </>
          )}
        </View>
      )}

      {/* Zona de controles - Layout de 3 columnas simétricas para centrado absoluto */}
      <View style={styles.controlsZone}>
        {/* Espaciador izquierdo - flex: 1 para simetría */}
        <View style={styles.leftSpacer} />
        {/* Grupo de controles (centrado naturalmente entre los espaciadores) */}
        <View style={styles.controlsGroup}>
          {/* Dislike */}
          {/* SCOPE 4: Feedback visual claro y mutuamente excluyente con Like */}
          {showAffinity && currentSpotId && (
            <Pressable
              onPress={() => onNotMyVibe?.(currentSpotId)}
              style={({ pressed }) => [
                iconTouchableContainer.base, 
                styles.affinityButton, 
                { 
                  minWidth: minTouchArea, 
                  minHeight: minTouchArea,
                  opacity: isNotMyVibe ? 1 : (pressed ? 0.6 : 0.6), // SCOPE 4: Feedback más visible
                  transform: [{ scale: pressed ? 0.9 : (isNotMyVibe ? 1.1 : 1) }], // SCOPE 4: Animación cuando está activo
                },
              ]}>
              <Icon
                name="notMyVibe"
                size={affinityIconSize}
                color={isNotMyVibe ? colors.tint : colors.icon} // SCOPE 4: Cambio de color inmediato cuando está activo
              />
            </Pressable>
          )}

          {/* Gap fijo después de Dislike */}
          {showAffinity && currentSpotId && <View style={{ width: affinityGap, flexShrink: 0 }} />}

          {/* Previous */}
          {/* SCOPE 4: Feedback visual claro para navegación */}
          {showPrevious && (
            <Pressable
              onPress={handlePrevious}
              style={({ pressed }) => [
                iconTouchableContainer.base, 
                styles.controlButton, 
                { 
                  minWidth: minTouchArea, 
                  minHeight: minTouchArea,
                  opacity: pressed ? 0.6 : 1, // SCOPE 4: Feedback más visible
                  transform: [{ scale: pressed ? 0.9 : 1 }], // SCOPE 4: Animación de escala
                },
              ]}>
              <Icon name="previous" size={secondaryIconSize} color={colors.text} />
            </Pressable>
          )}

          {/* Gap fijo después de Previous */}
          {showPrevious && <View style={{ width: controlGap, flexShrink: 0 }} />}

          {/* Play/Pause - Botón principal grande y prominente */}
          {/* SCOPE 4: Feedback visual inmediato con cambio de ícono persistente */}
          <Pressable
            onPress={handlePause}
            style={({ pressed }) => [
              styles.primaryButton,
              {
                width: primaryButtonSize,
                height: primaryButtonSize,
                backgroundColor: colors.tint,
                shadowColor: colors.tint,
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }], // SCOPE 4: Animación de escala para feedback táctil
              },
            ]}>
            <Icon
              name={flowState.status === 'paused' ? 'play' : 'pause'}
              size={primaryIconSize}
              color="#fff"
            />
          </Pressable>

          {/* Gap fijo después de Play/Pause */}
          {showNext && <View style={{ width: controlGap, flexShrink: 0 }} />}

          {/* Next */}
          {/* SCOPE 4: Feedback visual claro para navegación */}
          {showNext && (
            <Pressable
              onPress={handleNext}
              style={({ pressed }) => [
                iconTouchableContainer.base, 
                styles.controlButton, 
                { 
                  minWidth: minTouchArea, 
                  minHeight: minTouchArea,
                  opacity: pressed ? 0.6 : (nextSpotId ? 1 : 0.5), // SCOPE 4: Feedback más visible
                  transform: [{ scale: pressed ? 0.9 : 1 }], // SCOPE 4: Animación de escala
                },
              ]}
              disabled={!nextSpotId}>
              <Icon
                name="next"
                size={secondaryIconSize}
                color={nextSpotId ? colors.text : colors.icon}
              />
            </Pressable>
          )}

          {/* Gap fijo antes de Like */}
          {showAffinity && currentSpotId && <View style={{ width: affinityGap, flexShrink: 0 }} />}

          {/* Like */}
          {/* SCOPE 4: Feedback visual claro y mutuamente excluyente con Dislike */}
          {showAffinity && currentSpotId && (
            <Pressable
              onPress={() => onLike?.(currentSpotId)}
              style={({ pressed }) => [
                iconTouchableContainer.base, 
                styles.affinityButton, 
                { 
                  minWidth: minTouchArea, 
                  minHeight: minTouchArea,
                  opacity: isLiked ? (pressed ? 0.8 : 1) : (pressed ? 0.6 : 0.6), // SCOPE 4: Feedback más visible
                  transform: [{ scale: pressed ? 0.9 : (isLiked ? 1.1 : 1) }], // SCOPE 4: Animación cuando está activo
                },
              ]}>
              <Icon
                name="like"
                size={affinityIconSize}
                color={isLiked ? colors.tint : colors.icon} // SCOPE 4: Cambio de color inmediato cuando está activo
              />
            </Pressable>
          )}
        </View>
        {/* Espaciador derecho - flex: 1 para simetría */}
        <View style={styles.rightSpacer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: '100%',
  },
  // SCOPE 2: Transición suave para visibilidad (añadido como estilo dinámico)
  containerMini: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  containerScreen: {
    position: 'absolute', // FIX: Overlay flotante - no afecta el layout
    bottom: 0, // Anclado a la parte inferior
    left: 0,
    right: 0,
    flexDirection: 'column',
    paddingVertical: spacing.sm, // Reducido de md a sm para optimizar espacio vertical
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    overflow: 'hidden',
    // backgroundColor se aplica dinámicamente en containerStyle
  },
  containerFull: {
    flexDirection: 'column',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    marginTop: spacing.md,
  },
  infoSection: {
    marginBottom: spacing.md,
    gap: spacing.xs,
    alignItems: 'center',
    width: '100%',
    alignSelf: 'stretch',
  },
  spotTitle: {
    fontWeight: '600',
    textAlign: 'center',
  },
  spotSubtitle: {
    marginTop: spacing.xs / 2,
    textAlign: 'center',
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs / 2,
    flexWrap: 'wrap',
  },
  subtitleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    width: '100%',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: fontSize.xs,
  },
  subtitleText: {
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  progressBar: {
    height: 2,
    borderRadius: 1,
    overflow: 'hidden',
    marginTop: spacing.xs,
    width: '100%',
    alignSelf: 'stretch',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1,
  },
  // Layout de 3 columnas simétricas para centrado absoluto
  controlsZone: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  leftSpacer: {
    flex: 1,
    // Espaciador simétrico izquierdo - mismo peso que rightSpacer
  },
  controlsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // El grupo se centra naturalmente entre los espaciadores simétricos
    // No usar width: '100%' aquí
  },
  rightSpacer: {
    flex: 1,
    // Espaciador simétrico derecho - mismo peso que leftSpacer
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    // Gaps fijos entre controles, no flexibles
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    flexShrink: 0,
  },
  affinityButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  narrationInfo: {
    flex: 1,
    marginTop: spacing.sm,
  },
});

