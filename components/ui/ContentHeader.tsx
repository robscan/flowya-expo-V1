/**
 * ContentHeader Component
 * Componente canónico para headers de pantallas de contenido
 * 
 * Responsabilidad:
 * - Renderizar header visual con hero (imagen o mapa) y acciones flotantes
 * - NO maneja navegación
 * - NO decide lógica de pantalla
 * - NO gestiona estado global
 * 
 * Hero Types:
 * - image: Imagen hero que hace scroll con el contenido
 * - map: Mapa hero embebido
 * 
 * Acciones:
 * - Lista declarativa de acciones (back, close, share, bookmark, etc.)
 * - Cada acción usa IconButton
 * - onPress viene de la pantalla
 */

import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton, IconButtonVariant } from '@/components/ui/IconButton';
import { Icon, IconName, iconTouchableContainer } from '@/components/ui/Icon';
import { Tooltip } from '@/components/ui/Tooltip';
import { TouchableOpacity } from 'react-native';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type HeroType = 'image' | 'map';

export interface ContentHeaderAction {
  icon: IconName;
  onPress: () => void;
  variant?: IconButtonVariant;
  disabled?: boolean;
  tooltip?: string;
  testID?: string;
  activeColor?: string; // Color personalizado cuando está activo/seleccionado
  isActive?: boolean; // Si está activo/seleccionado
}

interface ContentHeaderProps {
  heroType: HeroType;
  heroImage?: ImageSourcePropType | { uri: string } | null;
  heroMap?: React.ReactNode;
  heroHeight?: number; // Altura del hero (para imagen)
  leftActions?: ContentHeaderAction[];
  rightActions?: ContentHeaderAction[];
  showOverlay?: boolean;
  sticky?: boolean; // Si es true, el header es sticky; si es false, hace scroll con el contenido
}

export function ContentHeader({
  heroType,
  heroImage,
  heroMap,
  heroHeight,
  leftActions = [],
  rightActions = [],
  showOverlay = true,
  sticky = false,
}: ContentHeaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const renderHero = () => {
    if (heroType === 'map' && heroMap) {
      return heroMap;
    }

    if (heroType === 'image' && heroImage) {
      return (
        <View style={[styles.heroImageContainer, heroHeight && { height: heroHeight }]}>
          <Image source={heroImage} style={styles.heroImage} resizeMode="cover" />
          {showOverlay && <View style={styles.heroOverlay} />}
        </View>
      );
    }

    // Placeholder cuando no hay hero
    return (
      <View style={[styles.heroPlaceholder, heroHeight && { height: heroHeight }, { backgroundColor: colors.icon + '10' }]}>
        {showOverlay && <View style={styles.heroOverlay} />}
      </View>
    );
  };

  const renderActions = (actions: ContentHeaderAction[], position: 'left' | 'right') => {
    if (actions.length === 0) return null;

    return (
      <View style={[styles.actionsContainer, position === 'right' && styles.actionsRight]}>
        {actions.map((action, index) => {
          // Si tiene activeColor y está activo, usar color personalizado
          const iconColor = action.isActive && action.activeColor ? action.activeColor : undefined;
          
          const button = (
            <View
              key={index}
              style={[
                styles.actionButton,
                {
                  backgroundColor:
                    colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.9)',
                },
              ]}>
              {iconColor ? (
                <TouchableOpacity
                  onPress={action.onPress}
                  disabled={action.disabled}
                  style={iconTouchableContainer.base}
                  activeOpacity={0.7}
                  testID={action.testID}>
                  <Icon name={action.icon} size={24} color={iconColor} />
                </TouchableOpacity>
              ) : (
                <IconButton
                  icon={action.icon}
                  onPress={action.onPress}
                  variant={action.variant || 'primary'}
                  disabled={action.disabled}
                  testID={action.testID}
                />
              )}
            </View>
          );

          if (action.tooltip) {
            return (
              <Tooltip key={index} text={action.tooltip}>
                {button}
              </Tooltip>
            );
          }

          return button;
        })}
      </View>
    );
  };

  if (sticky) {
    // Cuando es sticky, el header es absoluto sobre el hero que hace scroll
    return (
      <>
        {/* Hero (image or map) - hace scroll */}
        {renderHero()}

        {/* Floating actions overlay - sticky */}
        <View
          style={[
            styles.actionsOverlaySticky,
            {
              paddingTop: insets.top + spacing.sm,
              paddingBottom: spacing.sm,
            },
          ]}
          pointerEvents="box-none">
          {/* Left actions */}
          {renderActions(leftActions, 'left')}

          {/* Right actions */}
          {renderActions(rightActions, 'right')}
        </View>
      </>
    );
  }

  // Cuando no es sticky, todo hace scroll junto
  return (
    <View style={styles.container}>
      {/* Hero (image or map) */}
      {renderHero()}

      {/* Floating actions overlay */}
      <View
        style={[
          styles.actionsOverlay,
          {
            paddingTop: spacing.sm,
            paddingBottom: spacing.sm,
          },
        ]}
        pointerEvents="box-none">
        {/* Left actions */}
        {renderActions(leftActions, 'left')}

        {/* Right actions */}
        {renderActions(rightActions, 'right')}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
  },
  heroImageContainer: {
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    width: '100%',
    minHeight: 200,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  actionsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    zIndex: 10,
  },
  actionsOverlaySticky: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    zIndex: 10,
    pointerEvents: 'box-none',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionsRight: {
    marginLeft: 'auto',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});

