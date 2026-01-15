/**
 * SpotInlineCard Component
 * CANONICAL: Spot card without image for inline contexts
 * 
 * Used in: FlowScreen, Map overlays, editing contexts
 * 
 * Characteristics:
 * - Never shows image
 * - More compact
 * - Supports actions (remove, move up/down)
 * - Minimum stable height
 * - States: active (indicator), next (number), default
 */

import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { InfoMeta } from '@/components/ui/InfoMeta';
import { borderRadius } from '@/constants/borders';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { fontFamily, fontFamilyMedium, fontSize, lineHeight } from '@/constants/typography';
import { useSpot } from '@/contexts/SpotContext';
import { Spot } from '@/data/spots';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getSpotTypeLabel } from '@/utils/spotFormHelpers';

interface SpotInlineCardProps {
  spot: Spot;
  onPress?: () => void;
  distance?: number; // En metros (opcional)
  state?: 'active' | 'next' | 'add' | 'default'; // Estado de la card
  orderNumber?: number; // Número de orden (solo si state="next")
  onRemove?: () => void; // Callback para remover (solo para edición)
  onMoveUp?: () => void; // Callback para mover arriba (solo para edición)
  onMoveDown?: () => void; // Callback para mover abajo (solo para edición)
  onAdd?: () => void; // Callback para agregar (solo si state="add")
  isEditMode?: boolean; // Modo edición
  isFirst?: boolean; // Para desactivar flecha arriba
  isLast?: boolean; // Para desactivar flecha abajo
}

export function SpotInlineCard({ 
  spot, 
  onPress,
  distance,
  state = 'default',
  orderNumber,
  onRemove,
  onMoveUp,
  onMoveDown,
  onAdd,
  isEditMode = false,
  isFirst = false,
  isLast = false,
}: SpotInlineCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { markSpotAsSeen } = useSpot();
  const spotTypeLabel = getSpotTypeLabel(spot.type);

  // Marcar Spot como 'seen' al montar (automáticamente)
  useEffect(() => {
    markSpotAsSeen(spot.id);
  }, [spot.id, markSpotAsSeen]);

  const handleRemovePress = (e: any) => {
    e.stopPropagation();
    onRemove?.();
  };

  const handleAddPress = (e: any) => {
    e.stopPropagation();
    onAdd?.();
  };

  const handleMoveUpPress = (e: any) => {
    e.stopPropagation();
    if (!isFirst) {
      onMoveUp?.();
    }
  };

  const handleMoveDownPress = (e: any) => {
    e.stopPropagation();
    if (!isLast) {
      onMoveDown?.();
    }
  };

  // Renderizar contenido del slot izquierdo según el estado
  const renderLeftSlot = () => {
    switch (state) {
      case 'active':
        // Estado ACTIVO: Indicador visual sin número ni icono
        return (
          <View style={[styles.leftSlot, styles.activeIndicator, { backgroundColor: colors.tint }]} />
        );
      
      case 'next':
        // Estado SIGUIENTE: Número de orden o icono de eliminar en modo edición
        if (isEditMode) {
          return (
            <Pressable
              style={({ pressed }) => [
                styles.leftSlot,
                styles.removeButton,
                { backgroundColor: colors.background + '80' },
                pressed && { opacity: 0.7 }
              ]}
              onPress={handleRemovePress}>
              <Icon name="close" size={18} color={colors.error || '#FF3B30'} />
            </Pressable>
          );
        }
        return (
          <View style={[styles.leftSlot, styles.numberBadge, { backgroundColor: colors.icon + '20' }]}>
            <Text style={[styles.numberText, { color: colors.text }]}>
              {orderNumber ?? 0}
            </Text>
          </View>
        );
      
      case 'add':
        // Estado PARA AGREGAR: Icono "add"
        return (
          <Pressable
            style={({ pressed }) => [
              styles.leftSlot,
              styles.addButton,
              { backgroundColor: colors.tint },
              pressed && { opacity: 0.8 }
            ]}
            onPress={handleAddPress}>
            <Icon name="add" size={20} color="#fff" />
          </Pressable>
        );
      
      case 'default':
        // Estado DEFAULT: Sin slot izquierdo
        return null;
      
      default:
        return null;
    }
  };

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
          {/* Slot izquierdo (contenedor circular) - solo si no es default */}
          {state !== 'default' && renderLeftSlot()}

          {/* Contenido principal */}
          <View style={styles.spotInfo}>
            <Text style={[styles.spotName, { color: colors.text }]} numberOfLines={1}>
              {spot.name || 'Spot sin nombre'}
            </Text>
            {spot.description && spot.description.trim().length > 0 && (
              <Text style={[styles.spotDescription, { color: colors.icon }]} numberOfLines={2}>
                {spot.description}
              </Text>
            )}
            {/* InfoMeta debajo del título (chip, distancia, rating) */}
            {!isEditMode && (
              <InfoMeta
                chip={{ label: spotTypeLabel }}
                distance={distance}
                size="large"
              />
            )}
          </View>

          {/* Metadata: Controles de edición (solo para estado 'next' en modo edición) */}
          {isEditMode && state === 'next' && (
            <View style={styles.editControls}>
              <Pressable
                onPress={handleMoveUpPress}
                disabled={isFirst}
                style={({ pressed }) => [
                  styles.editButton,
                  { backgroundColor: colors.background + '80' },
                  isFirst && styles.editButtonDisabled,
                  pressed && !isFirst && { opacity: 0.7 }
                ]}>
                <Icon 
                  name="arrow-up" 
                  size={18} 
                  color={isFirst ? colors.icon + '40' : colors.text} 
                />
              </Pressable>
              <Pressable
                onPress={handleMoveDownPress}
                disabled={isLast}
                style={({ pressed }) => [
                  styles.editButton,
                  { backgroundColor: colors.background + '80' },
                  isLast && styles.editButtonDisabled,
                  pressed && !isLast && { opacity: 0.7 }
                ]}>
                <Icon 
                  name="arrow-down" 
                  size={18} 
                  color={isLast ? colors.icon + '40' : colors.text} 
                />
              </Pressable>
            </View>
          )}
        </View>
      </GlassView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: spacing.xs,
  },
  card: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    minHeight: 80, // Altura mínima estable
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  // Slot izquierdo (contenedor circular base)
  leftSlot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  // Estado ACTIVO: Indicador visual
  activeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  // Estado SIGUIENTE: Badge con número
  numberBadge: {
    // Hereda estilos de leftSlot
  },
  numberText: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontWeight: '600',
  },
  // Modo edición: Botón de eliminar
  removeButton: {
    // Hereda estilos de leftSlot
  },
  // Estado PARA AGREGAR: Botón con icono
  addButton: {
    // Hereda estilos de leftSlot
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
  // Modo edición: Controles de reordenamiento
  editControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 0,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonDisabled: {
    opacity: 0.4,
  },
});
