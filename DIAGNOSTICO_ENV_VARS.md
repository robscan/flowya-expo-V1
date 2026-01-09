# 🔍 DIAGNÓSTICO: Variables de Entorno en Producción (Vercel)

## 📋 RESUMEN EJECUTIVO

**Problema**: Las variables de entorno `EXPO_PUBLIC_*` no están llegando al bundle en producción en Vercel, causando que Mapbox y Supabase no se inicialicen.

**Causa Raíz Identificada**: `expo export` genera un build estático donde las variables de entorno deben estar disponibles en **BUILD TIME**, no en runtime. Vercel necesita que las variables estén disponibles durante el build, pero el proyecto actual no está configurado para inyectarlas correctamente.

---

## 🏗️ ARQUITECTURA DEL PROYECTO

### 1. Tipo de Proyecto
- ✅ **Expo Router** (carpeta `/app`)
- ✅ **Expo Web** con bundler Metro
- ✅ **Build estático** con `expo export`
- ❌ **NO es Next.js** con Expo adapter

### 2. Scripts de Build
```json
{
  "build": "expo export",  // Genera build estático
  "web": "expo start --web"
}
```

### 3. Configuración de Vercel
```json
{
  "buildCommand": "npm run build",  // Ejecuta "expo export"
  "outputDirectory": "dist",
  "framework": null
}
```

---

## 🔎 ANÁLISIS DE CÓDIGO

### Archivos Clave

#### 1. `utils/mapsConfig.ts` (Líneas 25-38)
```typescript
const getEnvVar = (key: string): string => {
  // Primero intentar process.env (funciona en desarrollo y web)
  if (process.env[key]) {
    return process.env[key] || '';
  }
  // Fallback a Constants.expoConfig.extra (para builds nativos)
  if (Constants.expoConfig?.extra?.[key]) {
    return Constants.expoConfig.extra[key] || '';
  }
  return '';
};

export const MAPBOX_ACCESS_TOKEN = getEnvVar('EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN');
```

**Problema**: `process.env` se evalúa en **build time** para builds estáticos. Si las variables no están disponibles durante `expo export`, se congelan como `undefined`.

#### 2. `utils/supabase.ts` (Líneas 21-35)
Mismo patrón: usa `getEnvVar` que busca en `process.env` primero.

#### 3. `app.json`
```json
{
  "expo": {
    "web": {
      "bundler": "metro"
    }
  }
}
```

**Problema**: No hay `app.config.js` que inyecte variables de entorno en `expoConfig.extra` durante el build.

---

## 🎯 CAUSA RAÍZ

### Problema Principal
**`expo export` genera un bundle estático donde las variables de entorno se evalúan en BUILD TIME, no en runtime.**

Cuando Vercel ejecuta `npm run build`:
1. Ejecuta `expo export`
2. Metro bundler procesa el código
3. `process.env.EXPO_PUBLIC_*` se reemplaza por valores literales en el bundle
4. Si las variables no están disponibles durante el build, se congelan como `undefined`
5. El bundle resultante tiene `undefined` hardcodeado, no referencias a `process.env`

### Por qué no funciona en Vercel
- Las variables están configuradas en Vercel Environment Variables
- Pero `expo export` necesita que estén disponibles como variables de entorno del proceso durante el build
- Vercel las inyecta, pero Metro puede no estar leyéndolas correctamente

---

## ✅ SOLUCIONES (Por Prioridad)

### SOLUCIÓN 1: Crear `app.config.js` para inyectar variables (RECOMENDADA)

**Archivo**: `app.config.js` (crear nuevo)

```javascript
module.exports = {
  expo: {
    name: 'flowya',
    slug: 'flowya',
    version: '1.0.0',
    // ... resto de configuración de app.json
    extra: {
      // Inyectar variables de entorno en expoConfig.extra
      EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN,
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      EXPO_PUBLIC_OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
    },
  },
};
```

**Cambios necesarios**:
1. Crear `app.config.js` con la configuración de `app.json` + `extra`
2. Las variables estarán disponibles en `Constants.expoConfig.extra` en runtime
3. `getEnvVar` ya tiene el fallback a `Constants.expoConfig.extra`

**Ventajas**:
- ✅ Funciona con builds estáticos
- ✅ No requiere cambios en la lógica de lectura de env vars
- ✅ Compatible con Vercel

---

### SOLUCIÓN 2: Usar `expo export:web` con variables en build

**Cambio en `package.json`**:
```json
{
  "build": "expo export:web"
}
```

**Y en `vercel.json`**:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".output"
}
```

**Nota**: Requiere verificar que Vercel inyecte las variables durante el build.

---

### SOLUCIÓN 3: Cambiar a runtime injection (NO RECOMENDADA)

Inyectar variables en runtime desde un endpoint o script. Esto rompe la arquitectura actual y requiere cambios significativos.

---

## 🔧 IMPLEMENTACIÓN RECOMENDADA

### Paso 1: Crear `app.config.js`

Migrar la configuración de `app.json` a `app.config.js` y agregar `extra`:

```javascript
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
    // CRÍTICO: Inyectar variables de entorno en extra
    extra: {
      EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '',
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
      EXPO_PUBLIC_OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
    },
  },
};
```

### Paso 2: Verificar que `getEnvVar` priorice `Constants.expoConfig.extra`

**Archivo**: `utils/mapsConfig.ts` y `utils/supabase.ts`

**Cambio necesario**: Invertir el orden de búsqueda para priorizar `Constants.expoConfig.extra`:

```typescript
const getEnvVar = (key: string): string => {
  // PRIORIDAD 1: Constants.expoConfig.extra (build time injection)
  if (Constants.expoConfig?.extra?.[key]) {
    return Constants.expoConfig.extra[key] || '';
  }
  // PRIORIDAD 2: process.env (runtime, funciona en desarrollo)
  if (process.env[key]) {
    return process.env[key] || '';
  }
  return '';
};
```

### Paso 3: Verificar en Vercel

1. Variables configuradas en Vercel Environment Variables (Settings > Environment Variables)
2. Variables disponibles para **Production, Preview, Development**
3. Hacer redeploy después de crear `app.config.js`

---

## 🧪 VALIDACIÓN

### Componente de Debug

Ya creado: `components/EnvDebug.tsx`

**Uso temporal**:
1. En `app/(tabs)/map.tsx`, presionar el botón de búsqueda (icono search) en el header
2. Ver las variables en las tres fuentes:
   - `process.env` (runtime)
   - `Constants.expoConfig.extra` (build time)
   - `Constants.manifest.extra` (legacy)

### Qué esperar después del fix

- `Constants.expoConfig.extra` debe mostrar las variables con valores
- `process.env` puede estar vacío en producción (normal para builds estáticos)
- Las variables deben funcionar correctamente

---

## 📝 CHECKLIST DE IMPLEMENTACIÓN

- [ ] Crear `app.config.js` con `extra` que inyecte variables
- [ ] Actualizar `getEnvVar` en `utils/mapsConfig.ts` para priorizar `Constants.expoConfig.extra`
- [ ] Actualizar `getEnvVar` en `utils/supabase.ts` para priorizar `Constants.expoConfig.extra`
- [ ] Verificar que las variables estén en Vercel Environment Variables
- [ ] Hacer redeploy en Vercel
- [ ] Validar con componente de debug
- [ ] Eliminar componente de debug después de validar

---

## 🚨 PROBLEMAS ADICIONALES DETECTADOS

### 1. `vercel.json` usa `outputDirectory: "dist"`

**Problema**: `expo export` genera en `.output` por defecto, no en `dist`.

**Solución**: Cambiar a:
```json
{
  "outputDirectory": ".output"
}
```

O cambiar el script de build:
```json
{
  "build": "expo export --output-dir dist"
}
```

### 2. No hay validación de variables en build time

**Recomendación**: Agregar validación en `app.config.js`:

```javascript
const requiredVars = [
  'EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN',
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
];

const missing = requiredVars.filter(v => !process.env[v]);
if (missing.length > 0 && process.env.NODE_ENV === 'production') {
  console.warn(`⚠️ Missing required env vars: ${missing.join(', ')}`);
}
```

---

## 📚 REFERENCIAS

- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [Expo Config Plugins](https://docs.expo.dev/config-plugins/introduction/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## ✅ RESULTADO ESPERADO

Después de implementar la Solución 1:

1. ✅ Las variables estarán disponibles en `Constants.expoConfig.extra`
2. ✅ `getEnvVar` las leerá correctamente
3. ✅ Mapbox y Supabase se inicializarán en producción
4. ✅ El componente de debug mostrará valores en `Constants.expoConfig.extra`
5. ✅ No habrá errores de "not configured" en producción
