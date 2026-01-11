/**
 * InfoMeta Component
 * Componente canónico para información secundaria debajo de títulos
 * 
 * Responsabilidad:
 * - Renderizar información secundaria (chip, distancia, rating)
 * - Mantener jerarquía clara y consistente
 * - NO maneja navegación
 * - NO maneja estado global
 * - NO calcula datos de negocio complejos
 * 
 * Reglas por tamaño:
 * - large: Chip (si existe), Distancia (con icono), Rating (solo si se pasa)
 * - small: Distancia (con icono), sin Rating, sin Chip (salvo casos explícitos)
 * 
 * Iconografía:
 * - Distancia → siempre con icono "map"
 * - Rating → siempre con icono "star"
 * - Chip → sin icono obligatorio
 */

import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { fontSize, lineHeight } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDistance } from '@/utils/distance';

export type InfoMetaSize = 'large' | 'small';

export interface InfoMetaProps {
  chip?: { label: string };
  distance?: number; // En metros
  rating?: { value: number; count?: number }; // Puntaje con opcional conteo de reviews
  size?: InfoMetaSize;
}

export function InfoMeta({
  chip,
  distance,
  rating,
  size = 'large',
}: InfoMetaProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [useMiles, setUseMiles] = useState(false);

  const handleDistanceToggle = () => {
    setUseMiles((prev) => !prev);
  };

  const renderChip = () => {
    if (!chip) return null;
    
    // En small, solo mostrar chip si se pasa explícitamente
    if (size === 'small') return null;
    
    // Validar que chip.label no esté vacío
    if (!chip.label || chip.label.trim().length === 0) return null;
    
    return <Chip text={chip.label} variant="default" />;
  };

  const renderDistance = () => {
    if (distance === undefined || distance === null) return null;
    
    const distanceText = formatDistance(distance, useMiles);
    if (!distanceText || distanceText.trim().length === 0) return null;

    return (
      <Pressable
        onPress={handleDistanceToggle}
        style={styles.metricItem}
        activeOpacity={0.7}>
        <Icon name="map" size={16} color={colors.icon} />
        <Text style={[styles.metricText, { color: colors.icon }]}>
          {distanceText}
        </Text>
      </Pressable>
    );
  };

  const renderRating = () => {
    if (rating === undefined || rating === null) return null;
    
    // Rating solo se muestra si se pasa explícitamente (no por default)
    const ratingText = rating.count
      ? `${rating.value.toFixed(1)} (${rating.count})`
      : rating.value.toFixed(1);
    
    return (
      <View style={styles.metricItem}>
        <Icon name="star" size={14} color="#FFD700" />
        <Text style={[styles.metricText, { color: colors.text }]}>
          {ratingText}
        </Text>
      </View>
    );
  };

  const items = [
    renderChip(),
    renderDistance(),
    renderRating(),
  ].filter(Boolean);

  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <View style={styles.itemWrapper}>{item}</View>
            {!isLast && (
              <View
                style={[
                  styles.divider,
                  {
                    backgroundColor:
                      colorScheme === 'dark'
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.1)',
                  },
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  itemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  divider: {
    width: 1,
    height: 16,
    marginRight: spacing.sm,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  metricText: {
    fontFamily: 'Inter-Regular',
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontWeight: '400',
  },
});

