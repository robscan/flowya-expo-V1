/**
 * ScreenHeader Component
 * 
 * Header reutilizable para pantallas de tabs (Home, Saved, Search).
 * Controla su propia animación basado en la prop `visible`.
 * NO escucha scroll, solo recibe prop y anima.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { Icon, iconTouchableContainer } from '@/components/ui/Icon';

interface ScreenHeaderProps {
  title: string;
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
  visible?: boolean; // Controla visibilidad (default: true)
  children?: React.ReactNode; // Para contenido adicional (ej: SearchBar)
  style?: ViewStyle;
}

export function ScreenHeader({
  title,
  rightAction,
  visible = true,
  children,
  style,
}: ScreenHeaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Mostrar: translateY 0, opacity 1
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      // Ocultar: translateY -100, opacity 0
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [visible, translateY, opacity]);

  const animatedStyle = {
    transform: [{ translateY }],
    opacity,
  };

  return (
    <Animated.View
      style={[
        styles.header,
        {
          borderBottomColor:
            colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        animatedStyle,
        style,
      ]}>
      <View style={styles.headerContent}>
        <Text style={[textStyles.heading3, { color: colors.text }]}>{title}</Text>
        {rightAction && (
          <TouchableOpacity
            onPress={rightAction.onPress}
            style={iconTouchableContainer.base}
            activeOpacity={0.7}>
            <Icon name={rightAction.icon as any} size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>
      {children && <View style={styles.childrenContainer}>{children}</View>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    marginBottom: spacing.sm,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  childrenContainer: {
    marginTop: spacing.sm,
  },
});

