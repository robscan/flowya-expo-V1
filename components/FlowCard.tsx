/**
 * FlowCard Component
 * CANONICAL: Flow card variants for different contexts
 * 
 * Variants:
 * - Display: For listings, search, saved (not editable, responsive)
 * - Editable: For FlowScreen or editing contexts (supports delete, doesn't break on small screens)
 */

import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { InfoMeta } from '@/components/ui/InfoMeta';
import { borderRadius } from '@/constants/borders';
import { getMovementModeLabel } from '@/constants/movementMode';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { fontFamily, fontFamilyMedium, fontSize, lineHeight } from '@/constants/typography';
import { Flow, getFlowSpots } from '@/data/flows';
import { Spot } from '@/data/spots';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { calculatePathDistance } from '@/utils/distance';
import { isFlowComplete } from '@/utils/flowValidation';

interface FlowCardDisplayProps {
  flow: Flow;
  spots: Spot[]; // Array completo de spots para calcular distancia
  onPress?: () => void;
  distance?: number; // Distancia opcional (si ya está calculada)
  customName?: string; // Nombre personalizado para el flow (opcional)
}

const FlowCardDisplay = memo(function FlowCardDisplay({ flow, spots, onPress, distance, customName }: FlowCardDisplayProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Calcular distancia si no se proporciona
  const flowSpots = getFlowSpots(flow, spots);
  const calculatedDistance = distance !== undefined ? distance : (flowSpots.length > 0 ? calculatePathDistance(flow, spots) : undefined);

  const movementModeLabel = getMovementModeLabel(flow.movementMode);

  // Usar nombre personalizado si está disponible, sino el título del flow
  const displayName = customName || flow.title;

  // Verificar si el flow está completo
  const flowIsComplete = isFlowComplete(flow, spots);

  // Formatear spots count
  const spotsCountText = `${flow.spots.length} ${flow.spots.length === 1 ? 'spot' : 'spots'} added`;

  return (
    <Pressable onPress={onPress} style={styles.cardContainer}>
      <GlassView
        style={styles.card}
        intensity="light"
        opacity="medium"
        shadowLevel="subtle"
        enableGlow={true}
        useGrayBackground={true}
      >
        <View style={styles.content}>
          {/* Left: Title and InfoMeta */}
          <View style={styles.leftContent}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                {displayName}
              </Text>
              {flowIsComplete && (
                <View style={[styles.completeBadge, { backgroundColor: colors.tint + '20' }]}>
                  <Icon name="check" size={12} color={colors.tint} />
                </View>
              )}
            </View>
            <InfoMeta
              chip={{ label: movementModeLabel }}
              distance={calculatedDistance}
              size="large"
            />
          </View>

          {/* Right: Spots count */}
          <View style={styles.rightContent}>
            <Text style={[styles.spotsCountText, { color: colors.icon }]}>
              {spotsCountText}
            </Text>
          </View>
        </View>
      </GlassView>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: spacing.sm,
  },
  card: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.sm,
    gap: spacing.md,
  },
  leftContent: {
    flex: 1,
    gap: spacing.xs / 2,
    minWidth: 0, // Permite que el texto se trunque correctamente
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    flexShrink: 1,
  },
  title: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    fontWeight: '500',
    flexShrink: 1, // Permite que el texto se trunque cuando sea necesario
  },
  completeBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  rightContent: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    flexShrink: 0,
    paddingTop: 2, // Alinear con título
  },
  spotsCountText: {
    fontFamily,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    fontWeight: '400',
    textAlign: 'right',
  },
});

// CANONICAL: Export FlowCard as namespace with Display variant
export const FlowCard = {
  Display: FlowCardDisplay,
};

// Legacy export for backward compatibility during migration
export { FlowCardDisplay as FlowCardLegacy };
