# Configuración de API Keys

Este documento describe cómo configurar las API keys necesarias para FLOWYA.

## Mapbox Access Token

FLOWYA usa **Mapbox** como sistema principal de mapas y ubicación.

### Requisitos

Necesitas un solo Access Token de Mapbox que funciona en todas las plataformas:
- `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` - Para iOS, Android y Web

### Cómo obtener el Access Token

1. Ve a [Mapbox Account](https://account.mapbox.com/)
2. Crea una cuenta o inicia sesión
3. Navega a **Access Tokens**
4. Crea un nuevo token o usa el token por defecto
5. Configura las restricciones del token según tu app:
   - Restringe por URL (para web)
   - Restringe por Bundle ID/Package Name (para mobile)

### Configuración Local (Desarrollo)

Crea un archivo `.env` en la raíz del proyecto:

```env
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=tu_mapbox_token_aqui
```

**Importante:** 
- El archivo `.env` está en `.gitignore` y no debe committearse
- Reinicia el servidor de Expo después de agregar las variables

### Configuración en Vercel (Producción Web)

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Navega a Settings > Environment Variables
3. Agrega la siguiente variable:
   - `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` - Valor: tu Mapbox Access Token
4. Selecciona los ambientes donde aplicar (Production, Preview, Development)
5. Haz redeploy del proyecto para que los cambios surtan efecto

### Configuración en EAS Build (Producción Mobile)

Para builds de producción en iOS y Android usando EAS Build:

1. Configura las variables en `eas.json` o en el dashboard de EAS
2. Las variables deben estar disponibles durante el build
3. Consulta la [documentación de EAS](https://docs.expo.dev/build-reference/variables/) para más detalles

### Verificación

El sistema valida automáticamente si el Access Token está configurado:

- En desarrollo: Se muestran advertencias en consola si falta el token
- En producción: El componente `MapboxView` muestra un mensaje de error amigable si falta el token

### Troubleshooting

**Error: "Mapbox Access Token not configured"**
- Verifica que la variable de entorno esté correctamente nombrada (debe empezar con `EXPO_PUBLIC_`)
- En Vercel, asegúrate de haber hecho redeploy después de agregar la variable
- Verifica que el token tenga los permisos correctos en Mapbox

**Los mapas no se cargan**
- Verifica que `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` esté configurado
- Verifica que las restricciones del token permitan tu dominio/Bundle ID

### Seguridad

- **Nunca** commitees el Access Token en el código
- Usa restricciones de tokens en Mapbox Account
- Rota los tokens periódicamente
- Monitorea el uso del token en Mapbox Account

## Get Directions (Navegación Externa)

FLOWYA permite obtener direcciones mediante apps externas (Google Maps, Apple Maps).

**IMPORTANTE:** Esta funcionalidad NO requiere API keys.
- FLOWYA construye URLs externas y abre la app del sistema
- NO hace llamadas internas a Google Maps APIs
- NO consume Google Maps SDK
- Solo delega la navegación a la app externa instalada en el dispositivo

Para más información sobre la implementación, ver `utils/navigationHelpers.ts`.

