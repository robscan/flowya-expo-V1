/**
 * FlowSpotCard Component
 * Card compacta para spots dentro de un Flow (listado)
 * 
 * Design principles:
 * - Layout horizontal compacto
 * - Icono de drag handle (6 puntos) a la izquierda
 * - Número a la izquierda en círculo/badge (dos estados: activo/inactivo)
 * - Sin imagen
 * - Título y descripción
 * - Distancia al lado derecho con icono
 * - Glass style consistente con otras cards
 * - Border radius igual a FlowCard (borderRadius.lg = 16px)
 */

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { borderRadius } from '@/constants/borders';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { fontFamily, fontFamilyMedium, fontSize, lineHeight } from '@/constants/typography';
import { Spot } from '@/data/spots';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface FlowSpotCardProps {
  spot: Spot;
  index: number; // Número de orden en el flow (0-based)
  onPress?: () => void;
  distance?: number; // En metros (opcional)
  estimatedTime?: number; // En minutos (opcional)
  isActive?: boolean; // Estado activo/inactivo del número
  isSuggested?: boolean; // Indica si es un spot sugerido (no parte del flow aún)
  onAdd?: () => void; // Callback para agregar el spot al flow (solo para suggested spots)
  isEditMode?: boolean; // Modo edición activo
  isFirst?: boolean; // Para deshabilitar "move up"
  isLast?: boolean; // Para deshabilitar "move down"
  onMoveUp?: () => void; // Callback para mover spot arriba
  onMoveDown?: () => void; // Callback para mover spot abajo
  onRemove?: () => void; // Callback para remover spot del flow
}

// Helper para formatear distancia
function formatDistance(distance?: number, useMiles: boolean = false): string | null {
  if (!distance) return null;
  
  if (useMiles) {
    const miles = distance / 1609.34;
    if (miles < 0.1) {
      const feet = (miles * 5280).toFixed(0);
      return `${feet} ft`;
    }
    return `${miles.toFixed(1)} mi`;
  }
  
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  }
  return `${(distance / 1000).toFixed(1)} km`;
}

export function FlowSpotCard({ spot, index, onPress, distance, estimatedTime, isActive = false, isSuggested = false, onAdd, isEditMode = false, isFirst = false, isLast = false, onMoveUp, onMoveDown, onRemove }: FlowSpotCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [useMiles, setUseMiles] = useState(false);

  const distanceText = formatDistance(distance, useMiles);

  const handleDistancePress = (e: any) => {
    e.stopPropagation();
    if (distance) {
      setUseMiles(!useMiles);
    }
  };

  // Prevenir que el Pressable padre ejecute onPress cuando está en modo edición
  const handleCardPress = () => {
    if (!isEditMode && onPress) {
      onPress();
    }
  };

  return (
    <Pressable 
      onPress={handleCardPress}
      style={isSuggested ? [styles.cardContainer, styles.suggestedCardContainer] : [styles.cardContainer]}>
      <GlassView
        style={StyleSheet.flatten(isSuggested ? [styles.card, styles.suggestedCard] : [styles.card])}
        intensity="light"
        opacity="medium"
        shadowLevel="subtle"
        enableGlow={true}
        useGrayBackground={true}
      >
        <View style={styles.content}>
          {/* Number badge o badge "Suggested" */}
          {isSuggested ? (
            <View style={[styles.suggestedBadge, { backgroundColor: colors.tint + '20' }]}>
              <Text style={[styles.suggestedBadgeText, { color: colors.tint }]}>
                Suggested
              </Text>
          </View>
          ) : (
          <View
            style={[
              styles.numberBadge,
              {
                backgroundColor: isActive ? colors.tint : colors.icon + '20',
              },
            ]}>
            <Text
              style={[
                styles.numberText,
                {
                  color: isActive ? '#fff' : colors.text,
                },
              ]}>
              {index + 1}
            </Text>
          </View>
          )}

          {/* Spot info */}
          <View style={styles.spotInfo}>
            <View style={styles.spotInfoHeader}>
            <Text style={[styles.spotTitle, { color: colors.text }]} numberOfLines={1}>
              {spot.name || 'Unnamed spot'}
            </Text>
            </View>
            {spot.description && (
              <Text style={[styles.spotDescription, { color: colors.icon }]} numberOfLines={1}>
                {spot.description}
              </Text>
            )}
          </View>

          {/* Distance and Time (right) o Botón Add o Controles de Edición */}
          {isSuggested ? (
            <View style={styles.suggestedActionsContainer}>
          {distanceText && (
                <View style={styles.distanceTimeContainer}>
                  <Pressable
                    onPress={handleDistancePress}
                    style={({ pressed }) => [
                      styles.distanceContainer,
                      pressed && { opacity: 0.7 }
                    ]}>
                    <Icon name="map" size={14} color={colors.icon} />
                    <Text style={[styles.distanceText, { color: colors.icon }]}>
                      {distanceText}
                    </Text>
                  </Pressable>
                </View>
              )}
              <Pressable
                style={({ pressed }) => [
                  styles.addButton,
                  { backgroundColor: colors.tint },
                  pressed && { opacity: 0.8 }
                ]}
                onPress={(e) => {
                  e.stopPropagation();
                  onAdd?.();
                }}>
                <Icon name="add-circle" size={16} color="#fff" />
              </Pressable>
            </View>
          ) : isEditMode ? (
            <View style={styles.editControls}>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  onMoveUp?.();
                }}
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
                onPress={(e) => {
                  e.stopPropagation();
                  onMoveDown?.();
                }}
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
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  onRemove?.();
                }}
                style={({ pressed }) => [
                  styles.editButton,
                  { backgroundColor: colors.background + '80' },
                  pressed && { opacity: 0.7 }
                ]}>
                <Icon name="close" size={18} color="#FF3B30" />
              </Pressable>
            </View>
          ) : (
            distanceText && (
            <View style={styles.distanceTimeContainer}>
              <Pressable
                onPress={handleDistancePress}
                style={({ pressed }) => [
                  styles.distanceContainer,
                  pressed && { opacity: 0.7 }
                ]}>
                <Icon name="map" size={14} color={colors.icon} />
                <Text style={[styles.distanceText, { color: colors.icon }]}>
                  {distanceText}
                </Text>
              </Pressable>
              {estimatedTime !== undefined && estimatedTime !== null && (
                <>
                  <Text style={[styles.separator, { color: colors.icon }]}>•</Text>
                  <Text style={[styles.timeText, { color: colors.icon }]}>
                    {estimatedTime} min
                  </Text>
                </>
              )}
            </View>
            )
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
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  editControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginLeft: spacing.xs,
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
  numberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  numberText: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontWeight: '600',
  },
  spotInfo: {
    flex: 1,
    gap: spacing.xs / 2,
    minWidth: 0,
  },
  spotInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    flexWrap: 'wrap',
  },
  spotTitle: {
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
  distanceTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    flexShrink: 0,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  distanceText: {
    fontFamily,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    fontWeight: '400',
  },
  separator: {
    fontFamily,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    fontWeight: '400',
  },
  timeText: {
    fontFamily,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    fontWeight: '400',
  },
  suggestedCardContainer: {
    opacity: 0.9,
  },
  suggestedCard: {
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  suggestedBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
    flexShrink: 0,
  },
  suggestedBadgeText: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    fontWeight: '600',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  suggestedActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 0,
  },
});

