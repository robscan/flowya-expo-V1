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
import { findExistingSpot } from '@/utils/spotDetection';
import { useSpot } from '@/contexts/SpotContext';

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
  spotDescription: string; // SCOPE 2: Campo spotDescription del contrato
  setSpotDescription: (spotDescription: string) => void;
  planInfo: string; // SCOPE 2: Campo planInfo del contrato
  setPlanInfo: (planInfo: string) => void;
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

  // Imágenes (múltiples)
  photos: string[];
  isOptimizingImage: boolean;
  pickImage: () => Promise<void>;
  removeImage: (index: number) => void;
  addImage: () => Promise<void>;

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

  // SCOPE 2: Detección de spot existente
  existingSpot: Spot | null;
  isLoadingExisting: boolean;

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

  // SCOPE 2: Obtener spots del contexto para detección
  const { spots } = useSpot();

  // SCOPE 2: Estados para detección de spot existente
  const [existingSpot, setExistingSpot] = useState<Spot | null>(null);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);

  // Estados de campos básicos
  const [name, setName] = useState(initialSpot?.name || '');
  const [description, setDescription] = useState(initialSpot?.description || '');
  const [whyItMatters, setWhyItMatters] = useState(initialSpot?.whyItMatters || initialSpot?.description || '');
  const [spotDescription, setSpotDescription] = useState(initialSpot?.description || initialSpot?.whyItMatters || ''); // SCOPE 2: Campo spotDescription
  const [planInfo, setPlanInfo] = useState(initialSpot?.planInfo || ''); // SCOPE 2: Campo planInfo
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

  // SCOPE 2: Función para cargar contenido de spot existente
  const loadExistingSpotContent = useCallback((spot: Spot) => {
    // Cargar todos los campos automáticamente
    if (spot.description) {
      setDescription(spot.description);
      setSpotDescription(spot.description);
    }
    if (spot.whyItMatters) {
      setWhyItMatters(spot.whyItMatters);
      if (!spot.description) {
        setSpotDescription(spot.whyItMatters);
      }
    }
    if (spot.planInfo) {
      setPlanInfo(spot.planInfo);
    }
    if (spot.howToVisit) {
      setHowToVisit(spot.howToVisit);
    }
    if (spot.narration) {
      setNarration(spot.narration);
    }
    if (spot.culturalContext) {
      setCulturalContext(spot.culturalContext);
    }
    if (spot.hours) {
      setHours(spot.hours);
    }
    if (spot.cost) {
      setCost(spot.cost);
    }
    if (spot.restrictions) {
      setRestrictions(spot.restrictions);
    }
    if (spot.accessibility) {
      setAccessibility(spot.accessibility);
    }
    if (spot.type) {
      setType(spot.type);
    }
    if (spot.photos && spot.photos.length > 0) {
      setPhotos(spot.photos);
    }
    // Actualizar initialState para que hasChanges funcione correctamente
    setInitialState(prev => ({
      ...prev,
      description: spot.description || prev.description,
      spotDescription: spot.description || spot.whyItMatters || prev.spotDescription,
      planInfo: spot.planInfo || prev.planInfo,
      whyItMatters: spot.whyItMatters || prev.whyItMatters,
      culturalContext: spot.culturalContext || prev.culturalContext,
      howToVisit: spot.howToVisit || prev.howToVisit,
      narration: spot.narration || prev.narration,
      hours: spot.hours || prev.hours,
      cost: spot.cost || prev.cost,
      restrictions: spot.restrictions || prev.restrictions,
      accessibility: spot.accessibility || prev.accessibility,
      type: spot.type || prev.type,
      photos: spot.photos || prev.photos,
    }));
  }, []);

  // Estados de imágenes (múltiples)
  const [photos, setPhotos] = useState<string[]>(initialSpot?.photos || []);
  const [isOptimizingImage, setIsOptimizingImage] = useState(false);
  
  // Hook para manejar subida de imágenes
  const imageUploadHook = useImageUpload({
    initialUri: null, // No usamos initialUri, manejamos el array directamente
    allowsEditing: true,
    aspect: [4, 3],
    quality: 75,
    onOptimizing: () => setIsOptimizingImage(true),
    onOptimized: (uri) => {
      setIsOptimizingImage(false);
      setPhotos(prev => [...prev, uri]);
    },
    onError: () => setIsOptimizingImage(false),
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
    spotDescription: initialSpot?.description || initialSpot?.whyItMatters || '', // SCOPE 2: Incluir spotDescription
    planInfo: initialSpot?.planInfo || '', // SCOPE 2: Incluir planInfo
    culturalContext: initialSpot?.culturalContext || '',
    type: initialSpot?.type || 'other',
    location: initialSpot?.location ? { latitude: initialSpot.location.latitude, longitude: initialSpot.location.longitude } : null,
      photos: initialSpot?.photos || [],
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
      setSpotDescription(initialSpot.description || initialSpot.whyItMatters || ''); // SCOPE 2: Actualizar spotDescription
      setPlanInfo(initialSpot.planInfo || ''); // SCOPE 2: Actualizar planInfo
      setCulturalContext(initialSpot.culturalContext || '');
      setType(initialSpot.type);
      setLocation(initialSpot.location ? { latitude: initialSpot.location.latitude, longitude: initialSpot.location.longitude } : null);
      setHours(initialSpot.hours);
      setCost(initialSpot.cost);
      setRestrictions(initialSpot.restrictions || '');
      setAccessibility(initialSpot.accessibility || '');
      setHowToVisit(initialSpot.howToVisit);
      setNarration(initialSpot.narration);
      setPhotos(initialSpot.photos || []);
      setExistingSpot(null); // Reset existingSpot cuando cambia initialSpot
      setInitialState({
        name: initialSpot.name || '',
        description: initialSpot.description || '',
        whyItMatters: initialSpot.whyItMatters || initialSpot.description || '',
        spotDescription: initialSpot.description || initialSpot.whyItMatters || '', // SCOPE 2: Incluir spotDescription
        planInfo: initialSpot.planInfo || '', // SCOPE 2: Incluir planInfo
        culturalContext: initialSpot.culturalContext || '',
        type: initialSpot.type,
        location: initialSpot.location ? { latitude: initialSpot.location.latitude, longitude: initialSpot.location.longitude } : null,
        photos: initialSpot.photos || [],
        hours: initialSpot.hours,
        cost: initialSpot.cost,
        restrictions: initialSpot.restrictions || '',
        accessibility: initialSpot.accessibility || '',
        howToVisit: initialSpot.howToVisit,
        narration: initialSpot.narration,
      });
    }
  }, [initialSpot]);

  // SCOPE 2: Detectar spot existente cuando cambia nombre o ubicación (modo creación)
  useEffect(() => {
    if (name && name.trim().length > 0 && location) {
      setIsLoadingExisting(true);
      const existing = findExistingSpot(spots, name, location);
      if (existing) {
        setExistingSpot(existing);
        // En modo creación: cargar contenido automáticamente
        if (!isEditMode && (!initialSpot || initialSpot.id !== existing.id)) {
          loadExistingSpotContent(existing);
        }
      } else {
        setExistingSpot(null);
      }
      setIsLoadingExisting(false);
    } else {
      setExistingSpot(null);
    }
  }, [name, location, spots, isEditMode, initialSpot, loadExistingSpotContent]);

  // SCOPE 2: En modo edición: detectar si cambia nombre/ubicación y coincide con otro spot
  useEffect(() => {
    if (isEditMode && initialSpot && name && location) {
      const existing = findExistingSpot(spots, name, location);
      // Si encontramos un spot diferente al que estamos editando
      if (existing && existing.id !== initialSpot.id) {
        setExistingSpot(existing);
        // Cambiar automáticamente al spot existente
        loadExistingSpotContent(existing);
        // Nota: Esto reemplazará el formulario actual con el contenido del spot existente
        // El usuario puede continuar editando desde ahí
      } else if (!existing || existing.id === initialSpot.id) {
        setExistingSpot(null);
      }
    }
  }, [isEditMode, initialSpot, name, location, spots, loadExistingSpotContent]);

  // Detectar cambios
  const hasChanges = 
    name !== initialState.name ||
    description !== initialState.description ||
    whyItMatters !== initialState.whyItMatters ||
    spotDescription !== initialState.spotDescription || // SCOPE 2: Incluir spotDescription en comparación
    planInfo !== initialState.planInfo || // SCOPE 2: Incluir planInfo en comparación
    culturalContext !== initialState.culturalContext ||
    type !== initialState.type ||
    (location && initialState.location && (location.latitude !== initialState.location.latitude || location.longitude !== initialState.location.longitude)) ||
    (!location && initialState.location) ||
    (location && !initialState.location) ||
    JSON.stringify(photos) !== JSON.stringify(initialState.photos) ||
    JSON.stringify(hours) !== JSON.stringify(initialState.hours) ||
    JSON.stringify(cost) !== JSON.stringify(initialState.cost) ||
    restrictions !== initialState.restrictions ||
    accessibility !== initialState.accessibility ||
    JSON.stringify(howToVisit) !== JSON.stringify(initialState.howToVisit) ||
    JSON.stringify(narration) !== JSON.stringify(initialState.narration);

  // Validaciones (imágenes son opcionales según el plan)
  const errors: { photo?: string; location?: string } = {};
  // Imágenes son opcionales, no requeridas
  if (!location) {
    errors.location = 'Location is required';
  }
  const isValid = !errors.location;

  // Seleccionar imagen (agrega nueva imagen al array)
  const pickImage = useCallback(async () => {
    await imageUploadHook.pickFromGallery();
  }, [imageUploadHook]);

  const addImage = useCallback(async () => {
    await imageUploadHook.pickFromGallery();
  }, [imageUploadHook]);

  const removeImage = useCallback((index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Generar contenido con IA
  const generateContent = useCallback(async (fields?: string[]): Promise<GeneratedContent | null> => {
    // SCOPE: Validar duplicidad ANTES de llamar a OpenAI
    if (existingSpot) {
      console.log('[AI] Spot existente detectado — usando contenido existente', {
        existingSpotId: existingSpot.id,
        existingSpotName: existingSpot.name,
      });
      setAiError('Cannot generate content for existing spot. Existing content has been loaded automatically.');
      return null;
    }

    // SCOPE: Log claro para spot nuevo
    console.log('[AI] Spot nuevo — generando contenido con OpenAI', {
      spotName: name,
      location: location ? { lat: location.latitude, lng: location.longitude } : null,
    });
    
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
        photos: photos || [],
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
      
      // SCOPE 2: Actualizar campos del formulario con contenido generado
      if (generatedContent.spotDescription) {
        setSpotDescription(generatedContent.spotDescription);
        setDescription(generatedContent.spotDescription); // Mantener sincronizado
        setWhyItMatters(generatedContent.whyItMatters || generatedContent.spotDescription);
      }
      
      if (generatedContent.planInfo) {
        setPlanInfo(generatedContent.planInfo);
      }
      
      if (generatedContent.howToVisit) {
        setHowToVisit(generatedContent.howToVisit);
      }
      
      // Si se genera narration, guardarla automáticamente (no visible para el usuario)
      if (generatedContent.narration) {
        setNarration(generatedContent.narration);
      }
      
      // SCOPE: Log al completar generación
      console.log('[AI] Content generated and saved successfully');
      
      return generatedContent;
    } catch (error: any) {
      // SCOPE: Manejo robusto de errores - no romper el flujo
      console.error('[AI] Error generating AI content:', error);
      setAiError(error.message || 'Couldn\'t generate content. Try again.');
      // NO hacer throw - permitir que el spot se cree sin contenido AI
      return null;
    } finally {
      setIsGeneratingAI(false);
    }
  }, [location, name, photos, description, whyItMatters, culturalContext, type, hours, cost, restrictions, accessibility, howToVisit, existingSpot]);

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
      photos: photos || [],
      description: description || spotDescription || undefined, // SCOPE 2: Usar spotDescription si description está vacío
      whyItMatters: whyItMatters || spotDescription || undefined,
      planInfo: planInfo || undefined, // SCOPE 2: Persistir planInfo en DB
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
  }, [isValid, location, name, photos, description, spotDescription, whyItMatters, planInfo, culturalContext, type, hours, cost, restrictions, accessibility, howToVisit, narration, onSave]); // SCOPE 2: Incluir spotDescription y planInfo

  // Cancelar
  const handleCancel = useCallback(() => {
    // Resetear a estado inicial
    setName(initialState.name);
    setDescription(initialState.description);
    setWhyItMatters(initialState.whyItMatters);
    setSpotDescription(initialState.spotDescription); // SCOPE 2: Reset spotDescription
    setPlanInfo(initialState.planInfo); // SCOPE 2: Reset planInfo
    setCulturalContext(initialState.culturalContext);
    setType(initialState.type);
    setLocation(initialState.location);
    setHours(initialState.hours);
    setCost(initialState.cost);
    setRestrictions(initialState.restrictions);
    setAccessibility(initialState.accessibility);
    setHowToVisit(initialState.howToVisit);
    setNarration(initialState.narration);
      setPhotos(initialState.photos);
    setPreviewContent(null);
    setAiError(null);
    onCancel?.();
  }, [initialState, onCancel]);

  // Reset completo
  const reset = useCallback(() => {
    setName('');
    setDescription('');
    setWhyItMatters('');
    setSpotDescription(''); // SCOPE 2: Reset spotDescription
    setPlanInfo(''); // SCOPE 2: Reset planInfo
    setCulturalContext('');
    setType('other');
    setLocation(null);
    setHours(undefined);
    setCost(undefined);
    setRestrictions('');
    setAccessibility('');
    setHowToVisit(undefined);
    setNarration(undefined);
    setPhotos([]);
    setPreviewContent(null);
    setAiError(null);
  }, []);

  return {
    // Estados de campos
    name,
    setName,
    description,
    setDescription,
    whyItMatters,
    setWhyItMatters,
    spotDescription, // SCOPE 2: Exponer spotDescription
    setSpotDescription, // SCOPE 2: Exponer setter
    planInfo, // SCOPE 2: Exponer planInfo
    setPlanInfo, // SCOPE 2: Exponer setter
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

    // Imágenes
    photos,
    isOptimizingImage,
    pickImage,
    removeImage,
    addImage,

    // Validación
    isValid,
    errors,

    // IA
    isGeneratingAI,
    aiError,
    generateContent,
    previewContent,
    setPreviewContent,

    // SCOPE 2: Detección de spot existente
    existingSpot,
    isLoadingExisting,

    // Acciones
    handleSave,
    handleCancel,
    reset,
    hasChanges,
  };
}
