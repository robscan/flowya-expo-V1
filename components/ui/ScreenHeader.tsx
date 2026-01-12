/**
 * ScreenHeader Component
 * 
 * Header reutilizable para pantallas de tabs (Home, Saved, Search).
 * Controla su propia animación basado en la prop `visible`.
 * NO escucha scroll, solo recibe prop y anima.
 */

import { Icon, iconTouchableContainer } from '@/components/ui/Icon';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

interface ScreenHeaderProps {
  title: string;
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
  visible?: boolean; // Controla visibilidad (default: true)
  children?: React.ReactNode; // Para contenido adicional (ej: SearchBar)
  style?: ViewStyle;
  absolute?: boolean; // Si es true, se posiciona como overlay absoluto
}

export function ScreenHeader({
  title,
  rightAction,
  visible = true,
  children,
  style,
  absolute = false,
}: ScreenHeaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const translateY = useRef(new Animated.Value(visible ? 0 : -100)).current;
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    if (visible) {
      // Mostrar: translateY 0, opacity 1
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    } else {
      // Ocultar: translateY -100, opacity 0
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]); // Solo dependencia de visible, las refs son estables

  const animatedStyle = {
    transform: [{ translateY }],
    opacity,
  };

  // Determinar pointer-events basado en opacity animada
  const pointerEvents = visible ? 'auto' : 'none';

  return (
    <Animated.View
      style={[
        styles.header,
        absolute && styles.headerAbsolute,
        {
          borderBottomColor:
            colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          backgroundColor: absolute ? colors.background : undefined, // Fondo solo cuando es absoluto
        },
        animatedStyle,
        style,
      ]}
      pointerEvents={pointerEvents}>
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
  headerAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    marginBottom: 0,
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

