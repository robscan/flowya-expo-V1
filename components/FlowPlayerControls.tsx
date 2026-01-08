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
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Icon, iconTouchableContainer } from '@/components/ui/Icon';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { fontSize, textStyles } from '@/constants/typography';
import { useFlow } from '@/contexts/FlowContext';
import { useNarration } from '@/contexts/NarrationContext';
import { useSaved } from '@/contexts/SavedContext';
import { Flow } from '@/data/flows';
import { Spot } from '@/data/spots';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface FlowPlayerControlsProps {
  variant: 'mini' | 'full' | 'screen';
  showPrevious?: boolean;
  showNext?: boolean;
  showMute?: boolean;
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
}

export function FlowPlayerControls({
  variant,
  showPrevious = false,
  showNext = true,
  showMute = true,
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
}: FlowPlayerControlsProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { flowState, pauseFlow, resumeFlow, previousSpot, nextSpot, nextSpotId } = useFlow();
  const narration = useNarration();
  
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

  // Sincronizar pausa Flow con pausa Narration
  const handlePause = useCallback(() => {
    if (flowState.status === 'active') {
      pauseFlow();
      narration.pauseNarration(); // Sincronizar: pausar narración también
    } else if (flowState.status === 'paused') {
      resumeFlow();
      narration.resumeNarration(); // Sincronizar: reanudar narración también
    }
  }, [flowState.status, pauseFlow, resumeFlow, narration]);

  const handlePrevious = useCallback(() => {
    previousSpot();
  }, [previousSpot]);

  const handleNext = useCallback(() => {
    nextSpot();
  }, [nextSpot]);

  // Determinar tamaños según variante y tipo de botón
  const primaryIconSize = variant === 'mini' ? 24 : 28;
  const secondaryIconSize = 20;
  const affinityIconSize = 18;
  const primaryButtonSize = variant === 'mini' ? 48 : 56;
  const controlGap = compact ? spacing.xs / 2 : (variant === 'mini' ? spacing.sm : spacing.md);
  const affinityGap = spacing.sm; // Gap más pequeño para botones de afinidad
  const minTouchArea = 48;

  // Estilos según variante
  const containerStyle = [
    styles.container,
    variant === 'mini' && styles.containerMini,
    variant === 'screen' && [styles.containerScreen, { borderTopColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }],
    variant === 'full' && [styles.containerFull, { borderTopColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }],
  ];

  // No se requiere lógica de centrado condicional
  // El layout de 3 columnas simétricas maneja el centrado automáticamente


  // Renderizar sección de información (solo para variant='screen')
  const renderInfoSection = () => {
    if (variant !== 'screen' || !currentSpot) return null;

    return (
      <View style={styles.infoSection}>
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
      </View>
    );
  };

  // Renderizar info de narración para variante full
  const renderNarrationInfo = () => {
    if (variant !== 'full') return null;

    return (
      <View style={styles.narrationInfo}>
        <Text style={[textStyles.caption, { color: colors.icon }]}>
          {narration.isMuted ? 'Muted' : 'Narration active'}
        </Text>
        {narration.currentNarration && (
          <Text style={[textStyles.caption, { color: colors.icon }]} numberOfLines={1}>
            {narration.currentNarration.text}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={containerStyle}>
      {/* Sección de información (solo para variant='screen') */}
      {renderInfoSection()}

      {/* Zona de controles - Layout de 3 columnas simétricas para centrado absoluto */}
      <View style={styles.controlsZone}>
        {/* Espaciador izquierdo - flex: 1 para simetría */}
        <View style={styles.leftSpacer} />
        
        {/* Grupo de controles (centrado naturalmente entre los espaciadores) */}
        <View style={styles.controlsGroup}>
          {/* Dislike */}
          {showAffinity && currentSpotId && (
            <TouchableOpacity
              onPress={() => onNotMyVibe?.(currentSpotId)}
              style={[
                iconTouchableContainer.base, 
                styles.affinityButton, 
                { 
                  minWidth: minTouchArea, 
                  minHeight: minTouchArea,
                  opacity: isNotMyVibe ? 1 : 0.6,
                },
              ]}
              activeOpacity={0.7}>
              <Icon
                name="notMyVibe"
                size={affinityIconSize}
                color={isNotMyVibe ? colors.tint : colors.icon}
              />
            </TouchableOpacity>
          )}

          {/* Gap fijo después de Dislike */}
          {showAffinity && currentSpotId && <View style={{ width: affinityGap, flexShrink: 0 }} />}

          {/* Previous */}
          {showPrevious && (
            <TouchableOpacity
              onPress={handlePrevious}
              style={[iconTouchableContainer.base, styles.controlButton, { minWidth: minTouchArea, minHeight: minTouchArea }]}
              activeOpacity={0.7}>
              <Icon name="previous" size={secondaryIconSize} color={colors.text} />
            </TouchableOpacity>
          )}

          {/* Gap fijo después de Previous */}
          {showPrevious && <View style={{ width: controlGap, flexShrink: 0 }} />}

          {/* Play/Pause - Botón principal grande y prominente */}
          <TouchableOpacity
            onPress={handlePause}
            style={[
              styles.primaryButton,
              {
                width: primaryButtonSize,
                height: primaryButtonSize,
                backgroundColor: colors.tint,
                shadowColor: colors.tint,
              },
            ]}
            activeOpacity={0.8}>
            <Icon
              name={flowState.status === 'paused' ? 'play' : 'pause'}
              size={primaryIconSize}
              color="#fff"
            />
          </TouchableOpacity>

          {/* Gap fijo después de Play/Pause */}
          {showNext && <View style={{ width: controlGap, flexShrink: 0 }} />}

          {/* Next */}
          {showNext && (
            <TouchableOpacity
              onPress={handleNext}
              style={[iconTouchableContainer.base, styles.controlButton, { minWidth: minTouchArea, minHeight: minTouchArea }]}
              activeOpacity={0.7}
              disabled={!nextSpotId}>
              <Icon
                name="next"
                size={secondaryIconSize}
                color={nextSpotId ? colors.text : colors.icon}
              />
            </TouchableOpacity>
          )}

          {/* Gap fijo antes de Like */}
          {showAffinity && currentSpotId && <View style={{ width: affinityGap, flexShrink: 0 }} />}

          {/* Like */}
          {showAffinity && currentSpotId && (
            <TouchableOpacity
              onPress={() => onLike?.(currentSpotId)}
              style={[
                iconTouchableContainer.base, 
                styles.affinityButton, 
                { 
                  minWidth: minTouchArea, 
                  minHeight: minTouchArea,
                  opacity: isLiked ? 1 : 0.6,
                },
              ]}
              activeOpacity={0.7}>
              <Icon
                name="like"
                size={affinityIconSize}
                color={isLiked ? colors.tint : colors.icon}
              />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Espaciador derecho - flex: 1 para simetría */}
        <View style={styles.rightSpacer} />
      </View>

      {/* Info de narración para full */}
      {renderNarrationInfo()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: '100%',
  },
  containerMini: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  containerScreen: {
    flexDirection: 'column',
    paddingVertical: spacing.sm, // Reducido de md a sm para optimizar espacio vertical
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    overflow: 'hidden',
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

