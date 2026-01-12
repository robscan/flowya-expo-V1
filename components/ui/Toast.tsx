/**
 * Toast Component
 * Discreet notification for user feedback
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Platform, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/theme';
import { spacing } from '@/constants/spacing';
import { textStyles, fontSize } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Icon } from '@/components/ui/Icon';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  icon?: string;
  visible: boolean;
  duration?: number;
  onHide?: () => void;
  onUndo?: () => void; // Callback para deshacer acción
  undoLabel?: string; // Texto del botón deshacer (default: "Deshacer")
}

export function Toast({ message, type = 'success', icon, visible, duration = 2000, onHide, onUndo, undoLabel = 'Deshacer' }: ToastProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();

      // Auto hide
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible, duration]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(translateY, {
        toValue: 50,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      onHide?.();
    });
  };

  if (!visible) return null;

  const typeColors = {
    success: colors.tint,
    error: '#FF6B6B',
    info: colors.icon,
  };

  const defaultIcons = {
    success: 'like',
    error: 'close',
    info: 'info',
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
      pointerEvents={onUndo ? 'auto' : 'none'}>
      <View
        style={[
          styles.toast,
          {
            backgroundColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)',
            borderLeftColor: typeColors[type],
          },
        ]}>
        {icon && (
          <Icon name={icon as any} size={20} color={typeColors[type]} style={{ marginRight: spacing.xs }} />
        )}
        {!icon && (
          <Icon name={defaultIcons[type] as any} size={20} color={typeColors[type]} style={{ marginRight: spacing.xs }} />
        )}
        <Text style={[textStyles.bodyMedium, { color: colors.text, flex: 1 }]}>{message}</Text>
        {onUndo && (
          <TouchableOpacity
            onPress={() => {
              onUndo();
              hideToast();
            }}
            style={styles.undoButton}
            activeOpacity={0.7}>
            <Text style={[styles.undoText, { color: typeColors[type] }]}>{undoLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100, // Above tab bar
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 48,
    maxWidth: '100%',
  },
  undoButton: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
  },
  undoText: {
    fontFamily: 'System',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});

