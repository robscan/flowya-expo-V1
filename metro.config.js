// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Deshabilitar Hermes para web (no es compatible)
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// CRÍTICO: Expo Router en Expo SDK 54 puede usar Hermes por defecto incluso para web
// cuando newArchEnabled=true, causando error 500. 
// Solución: Configurar getTransformOptions para detectar web y forzar JSC
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
  getTransformOptions: async (caller) => {
    // Detectar web desde múltiples fuentes
    const isWeb = 
      caller?.platform === 'web' ||
      process.env.EXPO_PUBLIC_PLATFORM === 'web' ||
      process.argv.some(arg => arg === '--web') ||
      process.env.npm_lifecycle_event === 'web';
    
    const transformOptions = {
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    };
    
    // CRÍTICO: Para web, forzar JSC (NO Hermes) para evitar error 500
    if (isWeb) {
      transformOptions.engine = 'jsc';
      transformOptions.unstable_transformProfile = 'default';
    }
    
    return transformOptions;
  },
};

module.exports = config;
