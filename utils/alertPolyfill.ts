/**
 * Alert Polyfill for Web
 * React Native Alert.alert doesn't work on web, so we provide a polyfill
 */

import { Alert, Platform } from 'react-native';

/**
 * Polyfill para Alert.alert que funciona en web usando window.confirm
 * En iOS/Android usa Alert.alert nativo
 * En web usa window.confirm
 */
export function showAlert(
  title: string,
  message?: string,
  buttons?: Array<{
    text?: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>
): void {
  if (Platform.OS === 'web') {
    // Web: usar window.confirm como polyfill
    const fullMessage = message ? `${title}\n\n${message}` : title;
    
    // Si no hay botones o solo hay un botón "OK"
    if (!buttons || buttons.length === 0) {
      window.alert(fullMessage);
      return;
    }
    
    // Si hay botones, usar window.confirm
    // Buscar botón de cancelar y botón de confirmar
    const cancelButton = buttons.find((btn) => btn.style === 'cancel');
    const confirmButton = buttons.find((btn) => btn.style !== 'cancel') || buttons[0];
    
    const userConfirmed = window.confirm(fullMessage);
    
    if (userConfirmed && confirmButton?.onPress) {
      confirmButton.onPress();
    } else if (!userConfirmed && cancelButton?.onPress) {
      cancelButton.onPress();
    }
  } else {
    // iOS/Android: usar Alert.alert nativo
    Alert.alert(title, message, buttons);
  }
}
