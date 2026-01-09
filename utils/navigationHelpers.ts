/**
 * Navigation Helpers
 * Utilities for opening external navigation apps (Apple Maps, Google Maps, etc.)
 * 
 * POLÍTICA CANÓNICA: Este archivo SOLO construye URLs externas y abre apps del sistema.
 * NO hace llamadas internas a APIs de Google Maps.
 * NO consume Google Maps SDK.
 * NO requiere API keys.
 * 
 * Funcionalidades:
 * - Detectar plataforma (iOS, Android, Web)
 * - Construir URLs para apps de navegación externas (Google Maps, Apple Maps)
 * - Abrir la app correcta según plataforma mediante deep links / URL schemes
 * - Fallback si la app no está instalada (abre URL web)
 * 
 * Uso permitido:
 * - ÚNICA forma válida de usar Google Maps en FLOWYA: como app externa
 * - Se activa cuando el usuario toca "Get directions"
 * - FLOWYA delega la navegación al sistema externo
 */

import { Platform, Linking, Alert } from 'react-native';

export type NavigationMode = 'walking' | 'driving' | 'transit' | 'bicycling';

interface Location {
  latitude: number;
  longitude: number;
}

/**
 * Mapea MovementMode del flow a modo de navegación
 */
export function mapMovementModeToNavigationMode(mode: 'walking' | 'bike' | 'car'): NavigationMode {
  switch (mode) {
    case 'walking':
      return 'walking';
    case 'bike':
      return 'bicycling';
    case 'car':
      return 'driving';
    default:
      return 'walking';
  }
}

/**
 * Construye URL para Google Maps
 */
export function getGoogleMapsUrl(
  from: Location,
  to: Location,
  mode: NavigationMode = 'walking'
): string {
  const origin = `${from.latitude},${from.longitude}`;
  const destination = `${to.latitude},${to.longitude}`;
  
  // Mapear modo de navegación
  const travelMode = mode === 'bicycling' ? 'bicycling' : mode;
  
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=${travelMode}`;
}

/**
 * Construye URL para Apple Maps
 */
export function getAppleMapsUrl(
  from: Location,
  to: Location,
  mode: NavigationMode = 'walking'
): string {
  const saddr = `${from.latitude},${from.longitude}`;
  const daddr = `${to.latitude},${to.longitude}`;
  
  // Mapear modo de navegación a dirflg
  // w = walking, d = driving, r = transit
  let dirflg = 'w'; // walking por defecto
  if (mode === 'driving') {
    dirflg = 'd';
  } else if (mode === 'transit') {
    dirflg = 'r';
  } else if (mode === 'bicycling') {
    dirflg = 'w'; // Apple Maps no tiene modo bicicleta, usar walking
  }
  
  return `http://maps.apple.com/?saddr=${saddr}&daddr=${daddr}&dirflg=${dirflg}`;
}

/**
 * Construye URL para Google Maps app (deep link)
 */
export function getGoogleMapsAppUrl(
  to: Location,
  mode: NavigationMode = 'walking'
): string {
  const destination = `${to.latitude},${to.longitude}`;
  
  // Intentar usar deep link de Google Maps
  // Formato: google.navigation:q=lat,lng
  return `google.navigation:q=${destination}`;
}

/**
 * Abre Google Maps en la plataforma actual
 */
async function openGoogleMaps(from: Location, to: Location, mode: NavigationMode): Promise<boolean> {
  try {
    const url = Platform.OS === 'web' 
      ? getGoogleMapsUrl(from, to, mode)
      : getGoogleMapsAppUrl(to, mode);
    
    if (Platform.OS === 'web') {
      // En web, abrir en nueva pestaña
      window.open(url, '_blank');
      return true;
    }
    
    // En móvil, intentar abrir la app
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }
    
    // Si no se puede abrir la app, intentar con URL web
    const webUrl = getGoogleMapsUrl(from, to, mode);
    if (Platform.OS === 'ios') {
      // En iOS, abrir en Safari
      await Linking.openURL(webUrl);
    } else {
      // En Android, intentar abrir en navegador
      await Linking.openURL(webUrl);
    }
    return true;
  } catch (error) {
    console.error('Error opening Google Maps:', error);
    return false;
  }
}

/**
 * Abre Apple Maps (solo iOS)
 */
async function openAppleMaps(from: Location, to: Location, mode: NavigationMode): Promise<boolean> {
  try {
    const url = getAppleMapsUrl(from, to, mode);
    const canOpen = await Linking.canOpenURL(url);
    
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error opening Apple Maps:', error);
    return false;
  }
}

/**
 * Abre la app de navegación apropiada según la plataforma
 * 
 * @param from Ubicación de origen
 * @param to Ubicación de destino
 * @param mode Modo de transporte (walking, driving, transit, bicycling)
 * @returns Promise<boolean> - true si se abrió exitosamente, false si falló
 */
export async function openNavigationApp(
  from: Location,
  to: Location,
  mode: NavigationMode = 'walking'
): Promise<boolean> {
  // Validar coordenadas
  if (!from || !to || 
      typeof from.latitude !== 'number' || typeof from.longitude !== 'number' ||
      typeof to.latitude !== 'number' || typeof to.longitude !== 'number') {
    console.error('Invalid location coordinates');
    Alert.alert('Error', 'Invalid location coordinates');
    return false;
  }

  try {
    if (Platform.OS === 'ios') {
      // En iOS, intentar Apple Maps primero, luego Google Maps como fallback
      const appleMapsOpened = await openAppleMaps(from, to, mode);
      if (appleMapsOpened) {
        return true;
      }
      
      // Fallback a Google Maps
      return await openGoogleMaps(from, to, mode);
    } else if (Platform.OS === 'android') {
      // En Android, usar Google Maps
      return await openGoogleMaps(from, to, mode);
    } else {
      // En Web, usar Google Maps en nueva pestaña
      return await openGoogleMaps(from, to, mode);
    }
  } catch (error) {
    console.error('Error opening navigation app:', error);
    Alert.alert(
      'Error',
      'Could not open navigation app. Please try again.'
    );
    return false;
  }
}

