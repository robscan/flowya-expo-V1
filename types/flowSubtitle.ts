/**
 * Flow Subtitle Types - Schema para subtítulos del Flow
 * FLOWYA V1.1 - P0-07
 * 
 * ⚠️ CONGELAMIENTO: Este schema queda CONGELADO una vez aprobado en P0-07.
 * NO se puede modificar durante V1.1.
 * Cualquier ajuste debe documentarse como propuesta para V1.2.
 */

/**
 * Momentos del Flow
 * Representan estados narrativos, no pantallas
 */
export type FlowMoment = 
  | "start"      // Al iniciar Flow
  | "in_flow"    // Flow activo, entre spots
  | "near_spot"  // Usuario se acerca a un spot
  | "transition" // Spot completado, hay más spots
  | "end";        // Flow completo terminado

/**
 * Eventos del sistema
 * Eventos explícitos que disparan momentos del Flow
 */
export type FlowEvent = 
  | "FLOW_STARTED"           // Flow inicia (one-shot)
  | "FLOW_ACTIVE"            // Flow activo (estado pasivo)
  | "SPOT_PROXIMITY_ENTER"   // Usuario se acerca a spot (one-shot por spot)
  | "SPOT_COMPLETED"         // Spot completado (puede ocurrir múltiples veces)
  | "FLOW_COMPLETED";        // Flow cerrado (one-shot)

/**
 * Trigger para subtítulo
 * Define qué evento dispara el subtítulo y condiciones opcionales
 */
export interface FlowSubtitleTrigger {
  /** Evento que dispara el subtítulo */
  event: FlowEvent;
  /** Condición opcional (ej: "currentSpotIndex < totalSpots - 1" para transition) */
  condition?: string;
}

/**
 * Subtítulo del Flow
 * Schema canónico para subtítulos basados en eventos
 */
export interface FlowSubtitle {
  /** ID único del subtítulo */
  id: string;
  /** Momento del Flow que representa */
  moment: FlowMoment;
  /** Texto completo para Player */
  text: string;
  /** Texto corto para Mini Player (opcional) */
  shortText?: string;
  /** Prioridad del subtítulo */
  priority: "primary" | "secondary";
  /** Trigger que dispara este subtítulo */
  trigger: FlowSubtitleTrigger;
}
