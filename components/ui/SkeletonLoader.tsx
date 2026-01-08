/**
 * SkeletonLoader Component
 * Simple skeleton loader for loading states
 */

import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function SkeletonLoader({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonLoaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  const shimmerTranslateX = React.useRef(new Animated.Value(-200)).current;

  React.useEffect(() => {
    // Animación de shimmer (gradiente que se mueve)
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerTranslateX, {
          toValue: 400,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerTranslateX, {
          toValue: -200,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animación de pulso (opacidad base)
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue, shimmerTranslateX]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.7], // Aumentado de 0.3-0.6 a 0.4-0.7
  });

  const baseColor = colors.icon + '40'; // Aumentado de '20' a '40' para mayor contraste
  const shimmerColor = colorScheme === 'dark' 
    ? 'rgba(255, 255, 255, 0.15)' 
    : 'rgba(255, 255, 255, 0.3)';

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: baseColor,
          opacity,
          overflow: 'hidden',
        },
        style,
      ]}>
      {/* Shimmer effect */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: [{ translateX: shimmerTranslateX }],
        }}>
        <LinearGradient
          colors={['transparent', shimmerColor, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </Animated.View>
    </Animated.View>
  );
}

// Skeleton for Spot Card
export function SpotCardSkeleton() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.cardContainer, { backgroundColor: colors.background }]}>
      <SkeletonLoader width="100%" height={200} borderRadius={16} />
      <View style={styles.cardContent}>
        <SkeletonLoader width="60%" height={20} style={{ marginTop: spacing.md }} />
        <SkeletonLoader width="40%" height={16} style={{ marginTop: spacing.xs }} />
        <SkeletonLoader width="30%" height={16} style={{ marginTop: spacing.xs }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  cardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  cardContent: {
    padding: spacing.md,
  },
});

