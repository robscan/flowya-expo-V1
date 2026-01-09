/**
 * Permissions Helper - Gestión Canónica de Permisos
 * 
 * Centraliza la lógica de verificación de permisos para acciones sobre spots.
 * Reglas de permisos claras y explícitas, sin hacks.
 * 
 * Principios:
 * - Funciones puras (sin side-effects)
 * - Fácilmente extensibles para futuros roles
 * - Type-safe con tipos de Supabase y Spot
 */

import { User } from '@supabase/supabase-js';
import { Spot } from '@/data/spots';

// Email del usuario administrador (case-insensitive)
const ADMIN_EMAIL = 'oscar@agenciaparadigma.com';

/**
 * Verificar si un usuario es administrador
 * CANONICAL: Usuario admin = email exactamente "oscar@agenciaparadigma.com"
 * 
 * Verifica que:
 * - El usuario no sea null
 * - El usuario tenga email
 * - El email sea exactamente "oscar@agenciaparadigma.com" (case-insensitive)
 * 
 * @param user - Usuario autenticado (puede ser null)
 * @returns true si el usuario es administrador, false en caso contrario
 */
export function isAdminUser(user: User | null): boolean {
  if (!user) {
    return false;
  }

  if (!user.email) {
    return false;
  }

  // Comparación case-insensitive para seguridad
  return user.email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase();
}

/**
 * Verificar si un usuario puede eliminar un spot
 * CANONICAL: Usuario puede eliminar si:
 * - Es el autor del spot (spot.createdBy === user.id)
 * O
 * - Es usuario administrador (isAdminUser(user))
 * 
 * Si el spot no tiene createdBy, solo los administradores pueden eliminarlo.
 * 
 * @param spot - Spot a verificar
 * @param user - Usuario autenticado (puede ser null)
 * @returns true si el usuario puede eliminar el spot, false en caso contrario
 */
export function canDeleteSpot(spot: Spot, user: User | null): boolean {
  // Usuario no autenticado no puede eliminar
  if (!user) {
    return false;
  }

  // Administrador puede eliminar cualquier spot
  if (isAdminUser(user)) {
    return true;
  }

  // Usuario normal solo puede eliminar si es el autor
  if (spot.createdBy && spot.createdBy === user.id) {
    return true;
  }

  // Spot sin createdBy solo puede ser eliminado por admin (ya verificado arriba)
  return false;
}
