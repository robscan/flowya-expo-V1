module.exports = function (api) {
  api.cache(true);
  
  // Determinar si estamos compilando para web
  // El plugin de reanimated causa errores de worklets en web
  // CRÍTICO: api.caller() puede causar problemas de cache, usar solo variables de entorno
  const isWeb = 
    process.env.EXPO_PUBLIC_PLATFORM === 'web' ||
    process.env.npm_lifecycle_event === 'web' ||
    (typeof process !== 'undefined' && process.argv && process.argv.includes('--web'));
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Solo incluir el plugin de reanimated en plataformas nativas
      // Web no soporta worklets y causa errores de compatibilidad
      // El plugin debe ser el último en la lista
      ...(isWeb ? [] : ['react-native-reanimated/plugin']),
    ],
  };
};
