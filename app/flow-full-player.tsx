/**
 * Flow Full Player Screen
 * Full screen page for displaying expanded flow player
 * Based on V5 definition: FLOW FULL PLAYER section
 */

import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { FlowPlayerControls } from '@/components/FlowPlayerControls';
import { FlowSpotCard } from '@/components/FlowSpotCard';
import { SpotInlineCard } from '@/components/SpotInlineCard';
import { Icon, iconTouchableContainer } from '@/components/ui/Icon';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { useFlow } from '@/contexts/FlowContext';
import { useNarration } from '@/contexts/NarrationContext';
import { useOverlay } from '@/contexts/OverlayContext';
import { usePath } from '@/contexts/PathContext';
import { useSaved } from '@/contexts/SavedContext';
import { useSpot } from '@/contexts/SpotContext';
import { getFlowSpots } from '@/data/flows';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function FlowFullPlayerScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { flowState, currentSpotId, progress } = useFlow();
  const { getFlowById } = usePath();
  const { spots, getSpotById } = useSpot();
  const { toggleNotMyVibeSpot, notMyVibeSpots } = useSaved();
  const narration = useNarration();
  const { isTabBarVisible, tabBarHeight } = useOverlay();
  
  // ARQUITECTÓNICO: Calcular paddingBottom dinámicamente basado en visibilidad del tab bar
  // FlowMiniBar height (~56px) + tab bar height (solo si está visible) + spacing
  const flowMiniBarHeight = 56;
  const dynamicPaddingBottom = flowMiniBarHeight + (isTabBarVisible ? tabBarHeight : 0) + spacing.md;

  const flow = flowState.currentPathId ? getFlowById(flowState.currentPathId) : null;
  const flowSpots = flow ? getFlowSpots(flow, spots) : [];
  const currentSpot = currentSpotId ? getSpotById(currentSpotId) : null;

  // If no flow is active, redirect back
  useEffect(() => {
    if (!flow || flowState.status === 'idle') {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/home');
      }
    }
  }, [flow, flowState.status, router]);
  
  if (!flow || flowState.status === 'idle') {
    return null;
  }

  // handleToggleMute ahora está en FlowPlayerControls

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: dynamicPaddingBottom }, // ARQUITECTÓNICO: Padding dinámico basado en visibilidad del tab bar
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={[textStyles.heading3, { color: colors.text }]}>
              {flow.title}
            </Text>
            <TouchableOpacity
              onPress={handleBack}
              style={iconTouchableContainer.base}
              activeOpacity={0.7}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          {flow.description && (
            <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs }]}>
              {flow.description}
            </Text>
          )}
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.icon + '20' }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: colors.tint, width: `${progress}%` },
              ]}
            />
          </View>
          <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs }]}>
            {progress}% completed
          </Text>
        </View>

        {/* Current spot highlighted */}
        {currentSpot && (
          <View style={styles.currentSpotContainer}>
            <View style={styles.currentSpotHeader}>
              <Text style={[textStyles.bodyMedium, { color: colors.icon }]}>
                Current spot
              </Text>
            </View>
            <SpotInlineCard spot={currentSpot} state="active" />
          </View>
        )}

        {/* Path spots list */}
        <View style={styles.spotsListContainer}>
          <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.md }]}>
            Full route
          </Text>
          {flowSpots.map((spot, index) => {
            const isCurrent = spot.id === currentSpotId;

            return (
              <FlowSpotCard
                key={spot.id}
                spot={spot}
                index={index}
                isActive={isCurrent}
                onPress={() => {
                  // Navigation to spot detail can be added if needed
                }}
              />
            );
          })}
        </View>

        {/* Controls */}
        <FlowPlayerControls
          variant="full"
          showPrevious={true}
          showNext={true}
          showAffinity={true}
          currentSpotId={currentSpotId || undefined}
          onNotMyVibe={(spotId) => {
            toggleNotMyVibeSpot(spotId);
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    // ARQUITECTÓNICO: paddingBottom se calcula dinámicamente basado en visibilidad del tab bar
    // Ver dynamicPaddingBottom en el componente
  },
  header: {
    marginBottom: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  currentSpotContainer: {
    marginBottom: spacing.md,
  },
  currentSpotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  likeButton: {
    // Additional styles applied inline
  },
  spotsListContainer: {
    marginBottom: spacing.md,
  },
  // controls, controlButton y controlInfo ahora están en FlowPlayerControls
});

