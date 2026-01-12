/**
 * Pin First Time Utility
 * Maneja el flag de "primera vez" para mostrar el modal educativo de pins
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const FIRST_TIME_KEY = '@flowya_pin_first_time_shown';

/**
 * Verifica si el usuario ya ha visto el modal de pins
 * @returns Promise<boolean> - true si ya vio el modal, false si es la primera vez
 */
export async function hasSeenPinModal(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(FIRST_TIME_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking pin first time flag:', error);
    // En caso de error, asumimos que ya vio el modal para evitar mostrarlo repetidamente
    return true;
  }
}

/**
 * Marca que el usuario ya vio el modal de pins
 */
export async function markPinModalSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(FIRST_TIME_KEY, 'true');
  } catch (error) {
    console.error('Error marking pin first time flag:', error);
  }
}
