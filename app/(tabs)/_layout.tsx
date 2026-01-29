import { useOverlay } from '@/contexts/OverlayContext';
import { BlurView } from 'expo-blur';
import { Tabs, usePathname, useSegments } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { fontFamily, fontSize } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { glassColors } from '@/utils/glassStyles';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { tabBarHeight: contextTabBarHeight, isTabBarLabelsVisible, isTabBarVisible, isTabBarLocked } = useOverlay();
  const pathname = usePathname();
  const segments = useSegments();
  const previousPathRef = useRef<string | null>(null);
  const lastMapFocusAtRef = useRef<number | null>(null);
  const lastPointerDownRef = useRef<{ at: number; y: number; withinTabBar: boolean } | null>(null);

  useEffect(() => {
    const previousPath = previousPathRef.current;
    previousPathRef.current = pathname;
  }, [pathname, segments]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handlePointerDown = (event: PointerEvent) => {
      const windowHeight = window.innerHeight;
      const tabBarHeight = contextTabBarHeight ?? 0;
      const withinTabBar = event.clientY >= windowHeight - tabBarHeight;
      lastPointerDownRef.current = { at: Date.now(), y: event.clientY, withinTabBar };
    };
    window.addEventListener('pointerdown', handlePointerDown, true);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [contextTabBarHeight]);

  // Tab bar background con efecto glass (BlurView en iOS/Android, transparencia en web)
  // Fondo gris sutil con blur
  const colors = glassColors[colorScheme ?? 'light'];
  
  const tabBarBackground = () => {
    if (Platform.OS === 'web') {
      // Web: fondo gris sutil sin blur
      return (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: colors.backgroundGray, // Fondo gris sutil
            },
          ]}
        />
      );
    }
    // iOS/Android: BlurView con fondo gris sutil
    return (
      <BlurView
        intensity={35}
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: colors.backgroundGray, // Fondo gris sutil
          },
        ]}
      />
    );
  };

  // Estilos para el tab bar: diseño plano y estable, consistente con Header
  // ARQUITECTÓNICO: Tab Bar plano sin bordes redondeados, sin sombras, con línea divisoria superior
  // Cuando está oculto, height = 0 para que no reserve espacio en el layout
  // Línea divisoria superior usa el mismo estilo que el Header (borderBottom)
  const tabBarDividerColor = colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  
  // Construir estilo base sin sombras ni bordes redondeados
  const baseTabBarStyle: ViewStyle = {
    backgroundColor: 'transparent',
    borderTopWidth: isTabBarVisible ? 1 : 0, // Línea divisoria superior (mismo estilo que Header)
    borderTopColor: isTabBarVisible ? tabBarDividerColor : 'transparent', // Color gris sutil consistente con Header
    paddingBottom: isTabBarVisible ? (contextTabBarHeight === 88 ? 20 : 10) : 0, // Sin padding cuando está oculto
    paddingTop: isTabBarVisible ? 8 : 0, // Sin padding cuando está oculto
    height: isTabBarVisible ? contextTabBarHeight : 0, // Altura 0 cuando está oculto - NO reserva espacio
    borderTopLeftRadius: 0, // SIN bordes redondeados - Tab Bar plano
    borderTopRightRadius: 0, // SIN bordes redondeados - Tab Bar plano
    elevation: 0, // SIN elevación - Tab Bar plano (Android)
    opacity: isTabBarVisible ? 1 : 0, // Opacity para transición suave
    pointerEvents: isTabBarVisible && !isTabBarLocked ? 'auto' : 'none', // Deshabilitar interacción cuando está oculto o bloqueado
    overflow: 'hidden', // Asegurar que cuando height = 0, el contenido no se vea
  };

  const glassTabBarStyle: ViewStyle = baseTabBarStyle;

  return (
      <View style={styles.container}>
        {/* ARQUITECTÓNICO: Tab Bar simplificado, plano y estable */}
        <Tabs
            screenOptions={{
              tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
              tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].icon,
              headerShown: false,
            tabBarBackground: tabBarBackground,
            tabBarStyle: glassTabBarStyle,
            tabBarShowLabel: isTabBarLabelsVisible, // Mostrar/ocultar labels según contexto
            tabBarLabelStyle: {
              fontFamily,
              fontSize: fontSize.xs, // 12px - tamaño pequeño pero legible
              fontWeight: '400',
              marginTop: spacing.xs / 2, // 4px - Más espacio entre icono y label (valor mínimo necesario)
            },
            tabBarItemStyle: {
              gap: spacing.xs / 2, // 4px - Espacio adicional entre icono y label (valor mínimo necesario)
            },
          }}
          screenListeners={({ route }) => ({
            tabPress: (e) => {
              const now = Date.now();
              const lastMapFocusAt = lastMapFocusAtRef.current;
              const lastPointerDown = lastPointerDownRef.current;
              const hasRecentTabBarPointer =
                Platform.OS !== 'web'
                  ? true
                  : !!lastPointerDown &&
                    lastPointerDown.withinTabBar &&
                    now - lastPointerDown.at < 800;
              const isRapidMapExit =
                pathname === '/map' &&
                route.name === 'home' &&
                lastMapFocusAt !== null &&
                now - lastMapFocusAt < 1000;
              const isLockedExit = isTabBarLocked && pathname === '/map' && route.name !== 'map';
              const isGhostExit = pathname === '/map' && route.name !== 'map' && !hasRecentTabBarPointer;
              if (isRapidMapExit || isLockedExit || isGhostExit) {
                e.preventDefault();
                return;
              }
            },
            focus: () => {
              if (route.name === 'map') {
                lastMapFocusAtRef.current = Date.now();
              }
            },
          })}>
          <Tabs.Screen
            name="index"
            options={{
            href: null,
              headerShown: false,
            }}
          />
          <Tabs.Screen
          name="home"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color }) => <Icon name="home" size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="map"
            options={{
            title: 'Mapa',
            tabBarIcon: ({ color }) => <Icon name="map" size={28} color={color} />,
            }}
          />
        <Tabs.Screen
          name="pinned"
          options={{
            title: 'Pines',
            tabBarIcon: ({ color }) => <Icon name="pin" size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="flows"
          options={{
            title: 'Flows',
            tabBarIcon: ({ color }) => <Icon name="explore" size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Buscar',
            tabBarIcon: ({ color }) => <Icon name="search" size={28} color={color} />,
            }}
          />
        <Tabs.Screen
          name="saved"
          options={{
            href: null,
          }}
        />
          <Tabs.Screen
            name="profile"
            options={{
            href: null, // Ocultar Profile del tab bar
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="login"
            options={{
              href: null, // Ocultar Login del tab bar pero mostrar tab bar
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="signup"
            options={{
              href: null, // Ocultar Signup del tab bar pero mostrar tab bar
              headerShown: false,
            }}
          />
        </Tabs>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
