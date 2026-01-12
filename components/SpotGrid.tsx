/**
 * SpotGrid Component
 * CANONICAL: Grid de 2 columnas de spots usando View con flexbox
 * 
 * Soluciona el problema de scroll bloqueado al usar FlatList anidado en ScrollView.
 * Usa únicamente View con flexbox, siguiendo el patrón de SkeletonList.
 * 
 * Used in: Saved, Search
 */

import { StyleSheet, View } from 'react-native';

import { SpotMediaCard } from '@/components/SpotMediaCard';
import { spacing } from '@/constants/spacing';
import { Spot } from '@/data/spots';
import { SpotWithDistance } from '@/utils/dataPreparation';

interface SpotGridProps {
  spots: SpotWithDistance[];
  onSpotPress: (spot: Spot) => void;
}

/**
 * SpotGrid - Grid de 2 columnas de spots
 * 
 * Renderiza una grid de 2 columnas usando View con flexbox,
 * evitando conflictos de gestos táctiles con ScrollView padre.
 */
export function SpotGrid({ spots, onSpotPress }: SpotGridProps) {
  if (spots.length === 0) {
    return null;
  }

  return (
    <View style={styles.gridContainer}>
      {spots.map((item) => (
        <View key={item.spot.id} style={styles.gridItem}>
          <SpotMediaCard
            spot={item.spot}
            size="small"
            distance={item.distance}
            onPress={() => onSpotPress(item.spot)}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  gridItem: {
    flex: 1,
    minWidth: '45%',
    maxWidth: '48%',
  },
});
