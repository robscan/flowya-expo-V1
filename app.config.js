/**
 * Expo App Configuration
 * 
 * IMPORTANTE: Este archivo inyecta variables de entorno en expoConfig.extra
 * para que estén disponibles en builds estáticos (expo export).
 * 
 * Las variables deben estar disponibles como process.env durante el build.
 * En Vercel, configúralas en Settings > Environment Variables.
 */

module.exports = {
  expo: {
    name: 'flowya',
    slug: 'flowya',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'flowya',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: './assets/images/favicon.png',
      bundler: 'metro',
      jsEngine: 'jsc', // CRÍTICO: Web debe usar JSC, no Hermes (Hermes no es compatible con web)
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    // CRÍTICO: Inyectar variables de entorno en extra para builds estáticos
    // Estas variables estarán disponibles en Constants.expoConfig.extra en runtime
    extra: {
      EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '',
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
      EXPO_PUBLIC_OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
    },
  },
};
