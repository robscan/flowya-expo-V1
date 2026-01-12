/**
 * Spot Data Model
 * 
 * Defines the Spot type and related interfaces for the application.
 * 
 * The system uses two types of spots:
 * - World Spots: Global spots loaded from seedSpots.v1.2.json
 * - User Spots: Spots created by users, persisted in AsyncStorage
 */

import { LocationRegion } from '@/types/locationRegion';

export type SpotType =
  | 'beach'
  | 'cafe'
  | 'viewpoint'
  | 'museum'
  | 'restaurant'
  | 'park'
  | 'monument'
  | 'market'
  | 'other';

// Removed types: SpotHours, SpotCost, SpotHowToVisit (removed in Phase 4)
// Removed: SpotNarration (removed in Phase 3 - Flow narratives handled by NarrationContext)

// AIGeneratedMetadata: Kept temporarily for compatibility
// Will be migrated to hasGeneratedContent (boolean) in Phase 6
export type AIGeneratedMetadata = {
  generatedAt?: Date;
  model?: string;
  source?: 'ai' | 'manual' | 'hybrid';
};

/**
 * Spot Image - Single image with metadata
 * Phase 5: Changed from photos[] array to single image object
 */
export type SpotImage = {
  url: string;
  source?: string;
  license?: string;
};

/**
 * Spot Model - V1.2
 * 
 * Removed fields: hours, cost, restrictions, accessibility, whyItMatters,
 * culturalContext, planInfo, howToVisit, narration
 * 
 * New fields: shortDescription, hasGeneratedContent
 * 
 * Structural changes:
 * - photos[] → image{} (Phase 5)
 * - location.latitude/longitude → location.lat/lng (Phase 4)
 * - location.city/country added (Phase 4)
 * - name optional → name required (Phase 4)
 */
export interface Spot {
  id: string;
  name: string; // Required (was optional in Phase 4)
  type: SpotType;
  location: {
    lat: number; // Changed from latitude (Phase 4)
    lng: number; // Changed from longitude (Phase 4)
    city?: string; // New - extracted from locationRegion (Phase 4)
    country?: string; // New - extracted from locationRegion (Phase 4)
  };
  shortDescription?: string; // New - replaces description/whyItMatters (1-2 lines, evocative)
  image: SpotImage; // Changed from photos[] array to single image object (Phase 5)
  hasGeneratedContent: boolean; // New - replaces aiGenerated (true if content was AI-generated)
  
  // Phase 7: World Spot → User Spot linking
  originWorldSpotId?: string; // ID of the World Spot from which this User Spot was derived (if applicable)
  
  // Legacy fields for temporary compatibility (will be removed in Phase 6)
  // These fields are maintained for backward compatibility during migration
  photos?: string[]; // Legacy - kept temporarily for compatibility (Phase 5)
  description?: string; // Legacy - kept temporarily for compatibility (Phase 4)
  whyItMatters?: string; // Legacy - kept temporarily for compatibility (Phase 4)
  culturalContext?: string; // Legacy - kept temporarily for compatibility (Phase 4)
  planInfo?: string; // Legacy - kept temporarily for compatibility (Phase 4)
  howToVisit?: any; // Legacy - kept temporarily for compatibility (Phase 4, type removed)
  hours?: any; // Legacy - kept temporarily for compatibility (Phase 4, type removed)
  cost?: any; // Legacy - kept temporarily for compatibility (Phase 4, type removed)
  restrictions?: string; // Legacy - kept temporarily for compatibility (Phase 4)
  accessibility?: string; // Legacy - kept temporarily for compatibility (Phase 4)
  aiGenerated?: AIGeneratedMetadata; // Legacy - kept temporarily for compatibility (Phase 4)
  isLegacySpot?: boolean; // Legacy - kept temporarily for compatibility
  createdBy?: string; // Legacy - kept temporarily for compatibility
  locationRegion?: LocationRegion; // Legacy - kept temporarily (city/country will be extracted)
  // Legacy location fields for temporary compatibility
  locationLatitude?: number; // Legacy - kept temporarily for compatibility (Phase 4)
  locationLongitude?: number; // Legacy - kept temporarily for compatibility (Phase 4)
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * FLOWYA V1.2 - Target Spot Model (Reference)
 * 
 * Phase 4-5: This is the final target model after complete migration.
 * The current Spot model is now aligned to this model with legacy fields
 * for temporary compatibility.
 * 
 * Once data migration is complete (Phase 6), legacy fields will be removed
 * and Spot will be identical to this model.
 * 
 * @see ANALISIS_MIGRACION_SPOT_V1.2.md for complete migration details
 */
export interface SpotV1_2 {
  id: string;
  name: string; // Required
  type: SpotType; // Closed enum
  location: {
    lat: number;
    lng: number;
    city?: string;
    country?: string;
  };
  shortDescription?: string; // 1-2 lines, evocative
  image: SpotImage; // Single image with metadata
  hasGeneratedContent: boolean; // true if content was AI-generated
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User Spots - Spots created by users
 * 
 * NOTE: User spots are created dynamically and persisted in AsyncStorage.
 * World Spots (global spots) are loaded from seedSpots.v1.2.json.
 * 
 * This array is empty by design - spots are created when users interact
 * with World Spots or create new spots.
 */
export const mockSpots: Spot[] = [];

