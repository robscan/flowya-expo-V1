/**
 * InfoMeta Component
 * Componente canónico para información secundaria debajo de títulos
 * 
 * Responsabilidad:
 * - Renderizar información secundaria (chip, distancia, duración, rating)
 * - Mantener jerarquía clara y consistente
 * - NO maneja navegación
 * - NO maneja estado global
 * - NO calcula datos de negocio complejos
 * 
 * Reglas por tamaño:
 * - large: Chip (si existe), Distancia (con icono), Duración (con icono), Rating (solo si se pasa)
 * - small: Distancia (con icono), sin Duración, sin Rating, sin Chip (salvo casos explícitos)
 * 
 * Iconografía:
 * - Distancia → siempre con icono "map"
 * - Duración → siempre con icono "clock"
 * - Rating → siempre con icono "star"
 * - Chip → sin icono obligatorio
 */

import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { fontSize, lineHeight, textStyles } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDistance } from '@/utils/distance';

export type InfoMetaSize = 'large' | 'small';

export interface InfoMetaProps {
  chip?: { label: string };
  distance?: number; // En metros
  duration?: number; // En minutos
  rating?: { value: number; count?: number }; // Puntaje con opcional conteo de reviews
  size?: InfoMetaSize;
}

export function InfoMeta({
  chip,
  distance,
  duration,
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
    
    return <Chip text={chip.label} variant="default" />;
  };

  const renderDistance = () => {
    if (distance === undefined || distance === null) return null;
    
    const distanceText = formatDistance(distance, useMiles);
    if (!distanceText) return null;

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

  const renderDuration = () => {
    if (duration === undefined || duration === null) return null;
    
    // En small, no mostrar duración
    if (size === 'small') return null;

    const formatDuration = (minutes: number): string => {
      if (minutes < 60) {
        return `${Math.round(minutes)} min`;
      }
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      if (mins === 0) {
        return `${hours} ${hours === 1 ? 'hr' : 'hrs'}`;
      }
      return `${hours} ${hours === 1 ? 'hr' : 'hrs'} ${mins} min`;
    };

    return (
      <View style={styles.metricItem}>
        <Icon name="clock" size={16} color={colors.icon} />
        <Text style={[styles.metricText, { color: colors.text }]}>
          {formatDuration(duration)}
        </Text>
      </View>
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
    renderDuration(),
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

