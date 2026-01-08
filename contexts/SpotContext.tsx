/**
 * SpotContext - Gestión de estado de Spots
 * Scope 3.1: Estado de Spots y funciones de gestión
 * 
 * Funciones:
 * - crearSpot
 * - actualizarSpot
 * - obtenerSpots
 * - Manejo de Spots incompletos (por diseño, los spots pueden ser incompletos)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Spot } from '@/data/spots';
import { mockSpots } from '@/data/spots';
import { generateSpotContent as generateAIContent, GenerateContentOptions } from '@/utils/aiContentGenerator';
import { useAuth } from './AuthContext';

const STORAGE_KEY = '@flowya_spots';

interface SpotContextType {
  spots: Spot[];
  isLoading: boolean;
  getSpotById: (id: string) => Spot | undefined;
  getSpotsByType: (type: Spot['type']) => Spot[];
  createSpot: (spot: Omit<Spot, 'id' | 'createdAt' | 'updatedAt'>) => Spot;
  updateSpot: (id: string, updates: Partial<Spot>) => void;
  deleteSpot: (id: string) => void;
  generateSpotContent: (spotId: string, options?: GenerateContentOptions) => Promise<void>;
  refreshSpots: () => Promise<void>;
}

const SpotContext = createContext<SpotContextType | undefined>(undefined);

export function SpotProvider({ children }: { children: ReactNode }) {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Cargar spots desde AsyncStorage
  useEffect(() => {
    loadSpots();
  }, []);

  // Guardar spots en AsyncStorage cuando cambien
  useEffect(() => {
    if (!isLoading) {
      saveSpots(spots);
    }
  }, [spots, isLoading]);

  const loadSpots = async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convertir fechas
        const spotsWithDates = parsed.map((spot: any) => ({
          ...spot,
          createdAt: new Date(spot.createdAt),
          updatedAt: new Date(spot.updatedAt),
        }));
        
        // Detectar nuevos spots en mockSpots que no están en el storage
        const storedIds = new Set(spotsWithDates.map((s: Spot) => s.id));
        const newSpots = mockSpots.filter(spot => !storedIds.has(spot.id));
        
        if (newSpots.length > 0) {
          // Hay nuevos spots: combinar los existentes con los nuevos
          const combinedSpots = [...spotsWithDates, ...newSpots];
          setSpots(combinedSpots);
          console.log(`✅ ${newSpots.length} nuevos spots agregados automáticamente`);
        } else {
          setSpots(spotsWithDates);
        }
      } else {
        // Usar mock data si no hay datos guardados
        setSpots(mockSpots);
      }
    } catch (error) {
      console.error('Error loading spots:', error);
      // Fallback a mock data
      setSpots(mockSpots);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSpots = async () => {
    // Recargar spots desde AsyncStorage
    await loadSpots();
  };

  const saveSpots = async (spotsToSave: Spot[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(spotsToSave));
    } catch (error) {
      console.error('Error saving spots:', error);
    }
  };

  const getSpotById = (id: string): Spot | undefined => {
    return spots.find((spot) => spot.id === id);
  };

  const getSpotsByType = (type: Spot['type']): Spot[] => {
    return spots.filter((spot) => spot.type === type);
  };

  const createSpot = (spotData: Omit<Spot, 'id' | 'createdAt' | 'updatedAt'>): Spot => {
    const now = new Date();
    const newSpot: Spot = {
      ...spotData,
      id: `spot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdBy: user?.id, // Guardar ID del usuario que crea el spot
      createdAt: now,
      updatedAt: now,
    };

    setSpots((prev) => [...prev, newSpot]);
    return newSpot;
  };

  const updateSpot = (id: string, updates: Partial<Spot>) => {
    setSpots((prev) =>
      prev.map((spot) =>
        spot.id === id
          ? { ...spot, ...updates, updatedAt: new Date() }
          : spot
      )
    );
  };

  const deleteSpot = (id: string) => {
    setSpots((prev) => prev.filter((spot) => spot.id !== id));
  };

  const generateSpotContent = async (spotId: string, options?: GenerateContentOptions): Promise<void> => {
    const spot = getSpotById(spotId);
    if (!spot) {
      throw new Error(`Spot with id ${spotId} not found`);
    }

    try {
      const generatedContent = await generateAIContent(spot, options);
      
      // Actualizar spot con contenido generado
      updateSpot(spotId, {
        whyItMatters: generatedContent.whyItMatters || spot.whyItMatters,
        culturalContext: generatedContent.culturalContext || spot.culturalContext,
        howToVisit: generatedContent.howToVisit || spot.howToVisit,
        narration: generatedContent.narration || spot.narration,
        aiGenerated: generatedContent.aiGenerated || spot.aiGenerated,
      });
    } catch (error) {
      console.error('Error generating spot content:', error);
      throw error;
    }
  };

  const value: SpotContextType = {
    spots,
    isLoading,
    getSpotById,
    getSpotsByType,
    createSpot,
    updateSpot,
    deleteSpot,
    generateSpotContent,
    refreshSpots,
  };

  return <SpotContext.Provider value={value}>{children}</SpotContext.Provider>;
}

export function useSpot() {
  const context = useContext(SpotContext);
  if (context === undefined) {
    throw new Error('useSpot must be used within a SpotProvider');
  }
  return context;
}

