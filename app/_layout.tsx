import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// react-native-reanimated se importa solo en nativas (configurado en babel.config.js)
// En web, el plugin de reanimated está deshabilitado para evitar errores de worklets

import { FlowMiniBar } from '@/components/FlowMiniBar';
import { NarrationController } from '@/components/NarrationController';
import { AuthProvider } from '@/contexts/AuthContext';
import { FlowProvider } from '@/contexts/FlowContext';
import { LocationProvider } from '@/contexts/LocationContext';
import { NarrationProvider } from '@/contexts/NarrationContext';
import { OverlayProvider } from '@/contexts/OverlayContext';
import { PathProvider } from '@/contexts/PathContext';
import { RegionProvider } from '@/contexts/RegionContext';
import { SavedProvider } from '@/contexts/SavedContext';
import { SpotProvider } from '@/contexts/SpotContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Mantener la splash screen visible mientras cargan las fuentes
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isOnline = useNetworkStatus();
  const router = useRouter();

  // Cargar fuentes Inter
  // CRÍTICO: Inter como ÚNICA tipografía del proyecto
  // Descargar desde: https://github.com/rsms/inter/releases
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter_18pt-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter_18pt-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter_18pt-SemiBold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Ocultar la splash screen cuando las fuentes estén cargadas
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Mostrar nada mientras cargan las fuentes (splash screen se encarga)
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <AuthProvider>
        <LocationProvider>
          <RegionProvider>
            <SpotProvider>
              <PathProvider>
                <FlowProvider>
                  <NarrationProvider>
                    <SavedProvider>
                      <OverlayProvider>
                      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                        <View style={styles.container}>
                          <Stack>
                            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                            <Stack.Screen name="liked-spots" options={{ presentation: 'card', title: 'Liked Spots', headerShown: false }} />
                            <Stack.Screen name="spot-detail" options={{ presentation: 'card', headerShown: false }} />
                              <Stack.Screen name="create-spot" options={{ presentation: 'card', headerShown: false }} />
                              <Stack.Screen name="flow-detail" options={{ presentation: 'card', headerShown: false }} />
                            <Stack.Screen name="flow-full-player" options={{ presentation: 'card', headerShown: false }} />
                            <Stack.Screen name="flow-screen" options={{ presentation: 'card', headerShown: false }} />
                            <Stack.Screen name="verify-email" options={{ presentation: 'card', headerShown: false }} />
                          </Stack>
                          <StatusBar style="auto" />
                          <NarrationController />
                          <FlowMiniBar onExpand={() => router.push('/flow-screen')} />
                          {/* Offline indicator */}
                          {!isOnline && (
                            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: '#FF6B6B', padding: 8, zIndex: 9999 }}>
                              <Text style={{ color: '#fff', textAlign: 'center', fontSize: 12 }}>
                                Offline
                              </Text>
                            </View>
                          )}
                        </View>
                      </ThemeProvider>
                    </OverlayProvider>
                  </SavedProvider>
                </NarrationProvider>
              </FlowProvider>
            </PathProvider>
          </SpotProvider>
        </RegionProvider>
      </LocationProvider>
    </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
