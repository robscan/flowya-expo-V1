# Configuración de API Keys

Este documento describe cómo configurar las API keys necesarias para FLOWYA.

## Google Maps API Keys

FLOWYA requiere API keys de Google Maps para funcionar en todas las plataformas (Android, iOS y Web).

### Requisitos

Necesitas crear tres API keys separadas:
- `EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY` - Para Android
- `EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY` - Para iOS
- `EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY` - Para Web

### Cómo obtener las API keys

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - **Maps SDK for Android** (para Android)
   - **Maps SDK for iOS** (para iOS)
   - **Maps JavaScript API** (para Web)
   - **Places API** (opcional, para búsqueda de lugares)
   - **Geocoding API** (opcional, para geocodificación)

4. Crea credenciales (API keys):
   - Ve a "APIs & Services" > "Credentials"
   - Haz clic en "Create Credentials" > "API Key"
   - Repite este proceso para crear 3 keys separadas (una para cada plataforma)

5. Configura restricciones de las API keys:
   - **Android**: Restringe por nombre del paquete de Android (ej: `com.flowya.app`)
   - **iOS**: Restringe por Bundle ID (ej: `com.flowya.app`)
   - **Web**: Restringe por dominio (ej: `flowya.vercel.app`, `*.vercel.app`)

### Configuración Local (Desarrollo)

Crea un archivo `.env` en la raíz del proyecto:

```env
EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY=tu_key_android_aqui
EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY=tu_key_ios_aqui
EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY=tu_key_web_aqui
```

**Importante:** 
- El archivo `.env` está en `.gitignore` y no debe committearse
- Reinicia el servidor de Expo después de agregar las variables

### Configuración en Vercel (Producción Web)

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Navega a Settings > Environment Variables
3. Agrega las siguientes variables:
   - `EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY` - Valor: tu API key de Web
4. Selecciona los ambientes donde aplicar (Production, Preview, Development)
5. Haz redeploy del proyecto para que los cambios surtan efecto

### Configuración en EAS Build (Producción Mobile)

Para builds de producción en iOS y Android usando EAS Build:

1. Configura las variables en `eas.json` o en el dashboard de EAS
2. Las variables deben estar disponibles durante el build
3. Consulta la [documentación de EAS](https://docs.expo.dev/build-reference/variables/) para más detalles

### Verificación

El sistema valida automáticamente si las API keys están configuradas:

- En desarrollo: Se muestran advertencias en consola si faltan keys
- En producción: El componente `MapViewWeb` muestra un mensaje de error amigable si falta la key de Web

### Troubleshooting

**Error: "Google Maps API key not configured"**
- Verifica que la variable de entorno esté correctamente nombrada (debe empezar con `EXPO_PUBLIC_`)
- En Vercel, asegúrate de haber hecho redeploy después de agregar la variable
- Verifica que la key tenga las APIs correctas habilitadas
- Verifica que las restricciones de la key permitan tu dominio/IP

**Los mapas no se cargan en Web**
- Verifica que `EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY` esté configurada en Vercel
- Verifica que la key tenga "Maps JavaScript API" habilitada
- Verifica que las restricciones HTTP permitan tu dominio

**Los mapas no se cargan en Mobile**
- Verifica que las keys estén configuradas en `app.json` o en las variables de entorno de EAS
- Verifica que las restricciones de la key permitan tu Bundle ID/Package Name

### Seguridad

- **Nunca** commitees las API keys en el código
- Usa restricciones de API keys en Google Cloud Console
- Rota las keys periódicamente
- Monitorea el uso de las keys en Google Cloud Console

