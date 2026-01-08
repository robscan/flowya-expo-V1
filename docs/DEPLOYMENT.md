# Guía de Deployment - FLOWYA

Esta guía describe el proceso de deployment de FLOWYA en diferentes plataformas.

## Deployment en Vercel (Web)

FLOWYA está configurado para desplegarse en Vercel usando Expo Web.

### Prerrequisitos

1. Cuenta en [Vercel](https://vercel.com)
2. Proyecto conectado a un repositorio Git (GitHub, GitLab, Bitbucket)
3. API keys de Google Maps configuradas (ver [API_KEYS.md](./API_KEYS.md))

### Pasos de Deployment

1. **Conectar repositorio a Vercel:**
   - Ve a [Vercel Dashboard](https://vercel.com/dashboard)
   - Haz clic en "Add New Project"
   - Selecciona tu repositorio
   - Vercel detectará automáticamente que es un proyecto Expo

2. **Configurar variables de entorno:**
   - En la configuración del proyecto, ve a Settings > Environment Variables
   - Agrega las siguientes variables:
     - `EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY` - Tu API key de Google Maps para Web
     - Cualquier otra variable de entorno que necesite tu app (ej: Supabase keys)
   - Selecciona los ambientes donde aplicar (Production, Preview, Development)

3. **Configurar build settings:**
   - Framework Preset: "Other" o "Expo"
   - Build Command: `npm run build` o `expo export`
   - Output Directory: `dist` (o el directorio que genere Expo)
   - Install Command: `npm install`

4. **Deploy:**
   - Haz clic en "Deploy"
   - Vercel construirá y desplegará tu aplicación
   - El primer deploy puede tardar varios minutos

### Configuración Post-Deployment

1. **Verificar que las variables de entorno estén activas:**
   - Ve a Settings > Environment Variables
   - Verifica que todas las variables estén configuradas
   - Si agregaste variables después del primer deploy, haz un redeploy

2. **Configurar dominio personalizado (opcional):**
   - Ve a Settings > Domains
   - Agrega tu dominio personalizado
   - Sigue las instrucciones para configurar DNS

3. **Verificar funcionamiento:**
   - Visita la URL de deployment
   - Verifica que los mapas carguen correctamente
   - Verifica que la autenticación funcione

### Troubleshooting

**Error: "Google Maps API key not configured"**
- Verifica que `EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY` esté en Environment Variables
- Asegúrate de haber hecho redeploy después de agregar la variable
- Verifica que la key tenga las restricciones correctas en Google Cloud Console

**Build falla:**
- Revisa los logs de build en Vercel Dashboard
- Verifica que todas las dependencias estén en `package.json`
- Asegúrate de que el comando de build sea correcto

**La app no carga:**
- Verifica que el Output Directory sea correcto
- Revisa la consola del navegador para errores
- Verifica que las rutas estén configuradas correctamente en `app.json`

## Deployment en EAS Build (Mobile)

Para desplegar en App Store y Google Play Store, usa EAS Build.

### Prerrequisitos

1. Cuenta en [Expo](https://expo.dev)
2. EAS CLI instalado: `npm install -g eas-cli`
3. Proyecto configurado con `eas.json`

### Pasos de Deployment

1. **Configurar EAS:**
   ```bash
   eas login
   eas build:configure
   ```

2. **Configurar variables de entorno:**
   - En `eas.json` o en el dashboard de Expo
   - Agrega las variables necesarias para cada perfil de build

3. **Build para iOS:**
   ```bash
   eas build --platform ios
   ```

4. **Build para Android:**
   ```bash
   eas build --platform android
   ```

5. **Submit a stores:**
   ```bash
   eas submit --platform ios
   eas submit --platform android
   ```

### Más información

Consulta la [documentación oficial de EAS Build](https://docs.expo.dev/build/introduction/) para más detalles.

## Variables de Entorno Requeridas

### Desarrollo Local
- `EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY`
- `EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY`
- `EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY`
- Variables de Supabase (si aplica)

### Producción Vercel
- `EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY`
- Variables de Supabase (si aplica)

### Producción Mobile (EAS)
- `EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY`
- `EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY`
- Variables de Supabase (si aplica)

## Checklist de Deployment

Antes de hacer deploy a producción:

- [ ] Todas las variables de entorno están configuradas
- [ ] API keys tienen las restricciones correctas
- [ ] Build local funciona sin errores
- [ ] Tests pasan (si aplica)
- [ ] Documentación está actualizada
- [ ] Versión en `package.json` está actualizada
- [ ] Changelog está actualizado (si aplica)

