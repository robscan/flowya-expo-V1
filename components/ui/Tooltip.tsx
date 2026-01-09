/**
 * Tooltip Component
 * Discreet tooltip for contextual help
 * Appears on long press or hover (web)
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors } from '@/constants/theme';
import { spacing } from '@/constants/spacing';
import { textStyles, fontSize } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export function Tooltip({ text, children, position = 'bottom', delay = 500 }: TooltipProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isVisible, setIsVisible] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const handleHover = (hovering: boolean) => {
    if (Platform.OS === 'web') {
      if (hovering) {
        const timeout = setTimeout(() => {
          setIsVisible(true);
        }, delay);
        setTimer(timeout);
      } else {
        if (timer) {
          clearTimeout(timer);
          setTimer(null);
        }
        setIsVisible(false);
      }
    }
  };

  const positionStyles = {
    top: { bottom: '100%', marginBottom: spacing.xs },
    bottom: { top: '100%', marginTop: spacing.xs },
    left: { right: '100%', marginRight: spacing.xs },
    right: { left: '100%', marginLeft: spacing.xs },
  };

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        // En web, usar View con onHover para no bloquear clicks del TouchableOpacity hijo
        <View
          onHoverIn={() => handleHover(true)}
          onHoverOut={() => handleHover(false)}
          style={styles.trigger}
          // Permitir que los eventos de click pasen a través
          pointerEvents="box-none">
          {children}
        </View>
      ) : (
        // En móvil, usar View con pointerEvents para no interceptar el press
        <View
          style={styles.trigger}
          pointerEvents="box-none">
          {children}
        </View>
      )}
      {isVisible && (
        <View
          style={[
            styles.tooltip,
            positionStyles[position],
            {
              backgroundColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.85)',
            },
          ]}
          // El tooltip no debe bloquear clicks
          pointerEvents="none">
          <Text style={[textStyles.caption, { color: '#fff', fontSize: fontSize.xs }]}>{text}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  trigger: {
    // Trigger area
  },
  tooltip: {
    position: 'absolute',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    zIndex: 10000, // Increased to appear above other elements
    maxWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10, // Increased for Android
  },
});

