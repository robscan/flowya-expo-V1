/**
 * Liked Spots Screen
 * Section within Profile to show spots liked from player
 */

import { SpotMediaCard } from '@/components/SpotMediaCard';
import { Icon, iconTouchableContainer } from '@/components/ui/Icon';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { fontFamilyMedium, fontSize, lineHeight, textStyles } from '@/constants/typography';
import { useSaved } from '@/contexts/SavedContext';
import { useSpot } from '@/contexts/SpotContext';
import { Spot } from '@/data/spots';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBaseLocation } from '@/hooks/useBaseLocation';
import { useSpotsWithDistance } from '@/hooks/useSpotsWithDistance';
import { useRouter } from 'expo-router';
import { Dimensions, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.75, 400); // 75% of screen width, max 400px for desktop

export default function LikedSpotsScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const colors = Colors[colorScheme ?? 'light'];
  const { spots } = useSpot();
  const { likedSpotsFromPlayer } = useSaved();
  
  // Ubicación base estable
  const { baseLocation } = useBaseLocation();

  // Get liked spots from player
  const likedSpotsFromPlayerData = spots.filter((spot) => (likedSpotsFromPlayer || []).includes(spot.id));
  
  // Preparar datos con distancia (memoizado)
  const likedSpotsWithDistance = useSpotsWithDistance(likedSpotsFromPlayerData, baseLocation);

  // Handle Spot selection
  const handleSpotPress = (spot: Spot) => {
    router.push(`/spot-detail?id=${spot.id}`);
  };

  // Handle back navigation
  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/profile');
    }
  };

  // Render horizontal slider of liked spots
  const renderLikedSpotsSlider = () => {
    if (likedSpotsFromPlayerData.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="like" size={48} color={colors.icon} />
          <Text style={[textStyles.heading4, { color: colors.text, marginTop: spacing.md, marginBottom: spacing.xs }]}>
            No liked spots yet
          </Text>
          <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.lg, textAlign: 'center' }]}>
            Start a flow and like spots while navigating to see them here
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/home')}
            style={[styles.emptyStateButton, { backgroundColor: colors.tint }]}
            activeOpacity={0.8}>
            <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>Explore Home</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Liked - Spots</Text>
        <Text style={[textStyles.caption, { color: colors.icon, marginBottom: spacing.md }]}>
          Spots you liked while navigating
        </Text>
        <FlatList
          data={likedSpotsWithDistance}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sliderContent}
          keyExtractor={(item) => item.spot.id}
          renderItem={({ item: itemWithDistance }) => {
            return (
              <View style={[styles.sliderCard, { width: CARD_WIDTH }]}>
                <SpotMediaCard
                  spot={itemWithDistance.spot}
                  size="large"
                  distance={itemWithDistance.distance}
                  onPress={() => handleSpotPress(itemWithDistance.spot)}
                />
              </View>
            );
          }}
          snapToInterval={CARD_WIDTH + spacing.sm}
          decelerationRate="fast"
          pagingEnabled={false}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Header inside ScrollView (scrolls) */}
        <View
          style={[
            styles.header,
            {
              borderBottomColor:
                colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            },
          ]}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={handleBackPress}
              style={iconTouchableContainer.base}
              activeOpacity={0.7}>
              <Icon name="back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[textStyles.heading3, { color: colors.text }]}>Liked Spots</Text>
            <View style={iconTouchableContainer.base} />
          </View>
        </View>

        {/* Content */}
        {renderLikedSpotsSlider()}
      </ScrollView>

      {/* Spot Detail Sheet */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    marginBottom: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  sliderContent: {
    paddingHorizontal: spacing.md,
    paddingRight: spacing.lg,
  },
  sliderCard: {
    marginRight: spacing.sm, // 16px
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  emptyStateButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

