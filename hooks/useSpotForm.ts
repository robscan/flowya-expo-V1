/**
 * useSpotForm - Hook de gestión de estado de formularios de spots
 * CANONICAL: Hook reutilizable para manejar estado de creación/edición de spots
 * 
 * Funcionalidades:
 * - Estados de todos los campos del spot
 * - Validaciones
 * - Optimización de imágenes
 * - Integración con OpenAI API
 * - Guardado/cancelación
 */

import { useState, useCallback, useEffect } from 'react';
import { Spot, SpotType, SpotHours, SpotCost, SpotHowToVisit, SpotNarration } from '@/data/spots';
import { LocationRegion } from '@/types/locationRegion';
import { useImageUpload } from './useImageUpload';
import { generateSpotContent, GeneratedContent } from '@/utils/aiContentGenerator';
import { isAIConfigured } from '@/utils/aiConfig';
import { resolveRegion } from '@/core/region';

export interface UseSpotFormOptions {
  /** Spot inicial (para edición) */
  initialSpot?: Spot | null;
  /** Callback cuando se guarda */
  onSave?: (spotData: Omit<Spot, 'id' | 'createdAt' | 'updatedAt'>) => void;
  /** Callback cuando se cancela */
  onCancel?: () => void;
  /** Si está en modo edición */
  isEditMode?: boolean;
}

export interface UseSpotFormResult {
  // Estados de campos
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  whyItMatters: string;
  setWhyItMatters: (whyItMatters: string) => void;
  culturalContext: string;
  setCulturalContext: (culturalContext: string) => void;
  type: SpotType;
  setType: (type: SpotType) => void;
  location: { latitude: number; longitude: number } | null;
  setLocation: (location: { latitude: number; longitude: number } | null) => void;
  hours: SpotHours | undefined;
  setHours: (hours: SpotHours | undefined) => void;
  cost: SpotCost | undefined;
  setCost: (cost: SpotCost | undefined) => void;
  restrictions: string;
  setRestrictions: (restrictions: string) => void;
  accessibility: string;
  setAccessibility: (accessibility: string) => void;
  howToVisit: SpotHowToVisit | undefined;
  setHowToVisit: (howToVisit: SpotHowToVisit | undefined) => void;
  narration: SpotNarration | undefined;
  setNarration: (narration: SpotNarration | undefined) => void;

  // Imagen
  photo: string | null;
  isOptimizingImage: boolean;
  pickImage: () => Promise<void>;
  removeImage: () => void;

  // Validación
  isValid: boolean;
  errors: {
    photo?: string;
    location?: string;
  };

  // IA
  isGeneratingAI: boolean;
  aiError: string | null;
  generateContent: (fields?: string[]) => Promise<GeneratedContent | null>;
  previewContent: GeneratedContent | null;
  setPreviewContent: (content: GeneratedContent | null) => void;

  // Acciones
  handleSave: () => void;
  handleCancel: () => void;
  reset: () => void;
  hasChanges: boolean;
}

/**
 * useSpotForm - Hook de gestión de estado de formularios de spots
 */
export function useSpotForm(options: UseSpotFormOptions = {}): UseSpotFormResult {
  const { initialSpot, onSave, onCancel, isEditMode = false } = options;

  // Estados de campos básicos
  const [name, setName] = useState(initialSpot?.name || '');
  const [description, setDescription] = useState(initialSpot?.description || '');
  const [whyItMatters, setWhyItMatters] = useState(initialSpot?.whyItMatters || initialSpot?.description || '');
  const [culturalContext, setCulturalContext] = useState(initialSpot?.culturalContext || '');
  const [type, setType] = useState<SpotType>(initialSpot?.type || 'other');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(
    initialSpot?.location ? { latitude: initialSpot.location.latitude, longitude: initialSpot.location.longitude } : null
  );
  const [hours, setHours] = useState<SpotHours | undefined>(initialSpot?.hours);
  const [cost, setCost] = useState<SpotCost | undefined>(initialSpot?.cost);
  const [restrictions, setRestrictions] = useState(initialSpot?.restrictions || '');
  const [accessibility, setAccessibility] = useState(initialSpot?.accessibility || '');
  const [howToVisit, setHowToVisit] = useState<SpotHowToVisit | undefined>(initialSpot?.howToVisit);
  const [narration, setNarration] = useState<SpotNarration | undefined>(initialSpot?.narration);

  // Estados de imagen
  const {
    uri: photo,
    isOptimizing: isOptimizingImage,
    pickFromGallery,
    reset: resetImage,
  } = useImageUpload({
    initialUri: initialSpot?.photos?.[0] || null,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 75,
  });

  // Estados de IA
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<GeneratedContent | null>(null);

  // Estado inicial para detectar cambios
  const [initialState, setInitialState] = useState(() => ({
    name: initialSpot?.name || '',
    description: initialSpot?.description || '',
    whyItMatters: initialSpot?.whyItMatters || initialSpot?.description || '',
    culturalContext: initialSpot?.culturalContext || '',
    type: initialSpot?.type || 'other',
    location: initialSpot?.location ? { latitude: initialSpot.location.latitude, longitude: initialSpot.location.longitude } : null,
    photo: initialSpot?.photos?.[0] || null,
    hours: initialSpot?.hours,
    cost: initialSpot?.cost,
    restrictions: initialSpot?.restrictions || '',
    accessibility: initialSpot?.accessibility || '',
    howToVisit: initialSpot?.howToVisit,
    narration: initialSpot?.narration,
  }));

  // Actualizar estados cuando cambia initialSpot
  useEffect(() => {
    if (initialSpot) {
      setName(initialSpot.name || '');
      setDescription(initialSpot.description || '');
      setWhyItMatters(initialSpot.whyItMatters || initialSpot.description || '');
      setCulturalContext(initialSpot.culturalContext || '');
      setType(initialSpot.type);
      setLocation(initialSpot.location ? { latitude: initialSpot.location.latitude, longitude: initialSpot.location.longitude } : null);
      setHours(initialSpot.hours);
      setCost(initialSpot.cost);
      setRestrictions(initialSpot.restrictions || '');
      setAccessibility(initialSpot.accessibility || '');
      setHowToVisit(initialSpot.howToVisit);
      setNarration(initialSpot.narration);
      setInitialState({
        name: initialSpot.name || '',
        description: initialSpot.description || '',
        whyItMatters: initialSpot.whyItMatters || initialSpot.description || '',
        culturalContext: initialSpot.culturalContext || '',
        type: initialSpot.type,
        location: initialSpot.location ? { latitude: initialSpot.location.latitude, longitude: initialSpot.location.longitude } : null,
        photo: initialSpot.photos?.[0] || null,
        hours: initialSpot.hours,
        cost: initialSpot.cost,
        restrictions: initialSpot.restrictions || '',
        accessibility: initialSpot.accessibility || '',
        howToVisit: initialSpot.howToVisit,
        narration: initialSpot.narration,
      });
    }
  }, [initialSpot]);

  // Detectar cambios
  const hasChanges = 
    name !== initialState.name ||
    description !== initialState.description ||
    whyItMatters !== initialState.whyItMatters ||
    culturalContext !== initialState.culturalContext ||
    type !== initialState.type ||
    (location && initialState.location && (location.latitude !== initialState.location.latitude || location.longitude !== initialState.location.longitude)) ||
    (!location && initialState.location) ||
    (location && !initialState.location) ||
    photo !== initialState.photo ||
    JSON.stringify(hours) !== JSON.stringify(initialState.hours) ||
    JSON.stringify(cost) !== JSON.stringify(initialState.cost) ||
    restrictions !== initialState.restrictions ||
    accessibility !== initialState.accessibility ||
    JSON.stringify(howToVisit) !== JSON.stringify(initialState.howToVisit) ||
    JSON.stringify(narration) !== JSON.stringify(initialState.narration);

  // Validaciones
  const errors: { photo?: string; location?: string } = {};
  if (!photo) {
    errors.photo = 'Photo is required';
  }
  if (!location) {
    errors.location = 'Location is required';
  }
  const isValid = !errors.photo && !errors.location;

  // Seleccionar imagen
  const pickImage = useCallback(async () => {
    await pickFromGallery();
  }, [pickFromGallery]);

  const removeImage = useCallback(() => {
    resetImage();
  }, [resetImage]);

  // Generar contenido con IA
  const generateContent = useCallback(async (fields?: string[]): Promise<GeneratedContent | null> => {
    if (!location) {
      setAiError('Location is required to generate content');
      return null;
    }

    if (!isAIConfigured()) {
      setAiError('OpenAI API key is not configured');
      return null;
    }

    setIsGeneratingAI(true);
    setAiError(null);

    try {
      // Crear spot temporal con datos actuales
      const tempSpot: Spot = {
        id: 'temp',
        name: name || undefined,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          adjustable: true,
        },
        photos: photo ? [photo] : [],
        description: description || undefined,
        whyItMatters: whyItMatters || undefined,
        culturalContext: culturalContext || undefined,
        type,
        hours,
        cost,
        restrictions: restrictions || undefined,
        accessibility: accessibility || undefined,
        howToVisit,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const generatedContent = await generateSpotContent(tempSpot, {
        fields,
      });

      setPreviewContent(generatedContent);
      
      // Si se genera narration, guardarla automáticamente (no visible para el usuario)
      if (generatedContent.narration) {
        setNarration(generatedContent.narration);
      }
      
      return generatedContent;
    } catch (error: any) {
      console.error('Error generating AI content:', error);
      setAiError(error.message || 'Couldn\'t generate content. Try again.');
      return null;
    } finally {
      setIsGeneratingAI(false);
    }
  }, [location, name, photo, description, whyItMatters, culturalContext, type, hours, cost, restrictions, accessibility, howToVisit]);

  // Guardar
  const handleSave = useCallback(async () => {
    if (!isValid) {
      return;
    }

    if (!location) {
      return;
    }

    // CANONICAL: Resolver locationRegion canónico desde Mapbox antes de guardar
    // ⚠️ El spot NO puede guardarse sin este campo
    // Usa RegionResolver (core module) - única función permitida para resolver regiones
    let locationRegion: LocationRegion | undefined = undefined;
    try {
      locationRegion = await resolveRegion(
        location.latitude,
        location.longitude
      );
    } catch (error) {
      if (__DEV__) {
        console.error('Error resolving locationRegion:', error);
      }
      // Si no se puede resolver región canónica, no guardar el spot
      // El usuario debe seleccionar una ubicación válida
      throw new Error('Unable to determine region from location. Please select a valid location.');
    }

    // Validar que locationRegion se haya resuelto correctamente
    if (!locationRegion) {
      throw new Error('Location region is required. Please select a valid location.');
    }

    const spotData: Omit<Spot, 'id' | 'createdAt' | 'updatedAt'> = {
      name: name || undefined,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        adjustable: true,
      },
      photos: photo ? [photo] : [],
      description: description || undefined,
      whyItMatters: whyItMatters || undefined,
      culturalContext: culturalContext || undefined,
      type,
      hours,
      cost,
      restrictions: restrictions || undefined,
      accessibility: accessibility || undefined,
      howToVisit,
      narration, // Narration se persiste cuando se genera con AI (no visible en UI)
      locationRegion, // Región generada desde coordenadas
    };

    onSave?.(spotData);
  }, [isValid, location, name, photo, description, whyItMatters, culturalContext, type, hours, cost, restrictions, accessibility, howToVisit, narration, onSave]);

  // Cancelar
  const handleCancel = useCallback(() => {
    // Resetear a estado inicial
    setName(initialState.name);
    setDescription(initialState.description);
    setWhyItMatters(initialState.whyItMatters);
    setCulturalContext(initialState.culturalContext);
    setType(initialState.type);
    setLocation(initialState.location);
    setHours(initialState.hours);
    setCost(initialState.cost);
    setRestrictions(initialState.restrictions);
    setAccessibility(initialState.accessibility);
    setHowToVisit(initialState.howToVisit);
    setNarration(initialState.narration);
    if (initialState.photo) {
      // Resetear imagen si había una inicial
      // Nota: useImageUpload no tiene forma de setear URI directamente, así que esto es limitado
    } else {
      resetImage();
    }
    setPreviewContent(null);
    setAiError(null);
    onCancel?.();
  }, [initialState, resetImage, onCancel]);

  // Reset completo
  const reset = useCallback(() => {
    setName('');
    setDescription('');
    setWhyItMatters('');
    setCulturalContext('');
    setType('other');
    setLocation(null);
    setHours(undefined);
    setCost(undefined);
    setRestrictions('');
    setAccessibility('');
    setHowToVisit(undefined);
    setNarration(undefined);
    resetImage();
    setPreviewContent(null);
    setAiError(null);
  }, [resetImage]);

  return {
    // Estados de campos
    name,
    setName,
    description,
    setDescription,
    whyItMatters,
    setWhyItMatters,
    culturalContext,
    setCulturalContext,
    type,
    setType,
    location,
    setLocation,
    hours,
    setHours,
    cost,
    setCost,
    restrictions,
    setRestrictions,
    accessibility,
    setAccessibility,
    howToVisit,
    setHowToVisit,
    narration,
    setNarration,

    // Imagen
    photo,
    isOptimizingImage,
    pickImage,
    removeImage,

    // Validación
    isValid,
    errors,

    // IA
    isGeneratingAI,
    aiError,
    generateContent,
    previewContent,
    setPreviewContent,

    // Acciones
    handleSave,
    handleCancel,
    reset,
    hasChanges,
  };
}
