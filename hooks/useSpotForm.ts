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

import { Spot, SpotImage, SpotType } from '@/data/spots';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// FASE 3: SpotNarration eliminado - Flow narrative eliminado del modelo Spot
// FASE 4: SpotHours, SpotCost, SpotHowToVisit eliminados - campos avanzados eliminados
import { useSpot } from '@/contexts/SpotContext';
import { resolveRegion } from '@/core/region';
import { LocationRegion } from '@/types/locationRegion';
import { isAIConfigured } from '@/utils/aiConfig';
import { GeneratedContent, generateSpotContent } from '@/utils/aiContentGenerator';
import { findExistingSpot } from '@/utils/spotDetection';
import { useImageUpload } from './useImageUpload';

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
  // FASE 4-5: Estados de campos simplificados
  name: string;
  setName: (name: string) => void;
  shortDescription: string; // FASE 4: Nuevo - reemplaza description/whyItMatters
  setShortDescription: (shortDescription: string) => void;
  type: SpotType;
  setType: (type: SpotType) => void;
  location: { lat: number; lng: number; city?: string; country?: string } | null; // FASE 4: Cambio lat/lng
  setLocation: (location: { lat: number; lng: number; city?: string; country?: string } | null) => void;
  image: SpotImage; // FASE 5: Cambio de photos[] → image{}
  setImage: (image: SpotImage) => void;
  hasGeneratedContent: boolean; // FASE 4: Nuevo - reemplaza aiGenerated
  setHasGeneratedContent: (hasGeneratedContent: boolean) => void;

  // Campos legacy para compatibilidad temporal (se eliminarán en FASE 6)
  description: string; // Legacy - mantener temporalmente
  setDescription: (description: string) => void;
  whyItMatters: string; // Legacy - mantener temporalmente
  setWhyItMatters: (whyItMatters: string) => void;
  culturalContext: string; // Legacy - mantener temporalmente
  setCulturalContext: (culturalContext: string) => void;
  planInfo: string; // Legacy - mantener temporalmente
  setPlanInfo: (planInfo: string) => void;
  photos: string[]; // Legacy - mantener temporalmente
  setPhotos: (photos: string[]) => void;
  
  // FASE 4: Campos eliminados - hours, cost, restrictions, accessibility, howToVisit
  // FASE 3: narration eliminado - Flow narrative eliminado del modelo Spot

  // Imágenes (FASE 5: simplificado a imagen única)
  isOptimizingImage: boolean;
  pickImage: () => Promise<void>;
  removeImage: () => void; // FASE 5: Eliminar imagen única (no index)
  // FASE 5: addImage eliminado - solo una imagen

  // Validación
  isValid: boolean;
  errors: {
    photo?: string;
    location?: string;
  };

  // IA
  aiState: 'idle' | 'loading' | 'success' | 'error';
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

  // FASE 4-5: Estados de campos simplificados
  const [name, setName] = useState(initialSpot?.name || '');
  const [shortDescription, setShortDescription] = useState(
    initialSpot?.shortDescription || 
    initialSpot?.whyItMatters || 
    initialSpot?.description || 
    ''
  );
  const [type, setType] = useState<SpotType>(initialSpot?.type || 'other');
  
  // FASE 4: Location con lat/lng (compatible con ambos formatos)
  const getLocationFromSpot = useCallback((spot: Spot | null | undefined): { lat: number; lng: number; city?: string; country?: string } | null => {
    if (!spot?.location) return null;
    
    let lat: number;
    let lng: number;
    let city: string | undefined;
    let country: string | undefined;
    
    if ('lat' in spot.location && 'lng' in spot.location) {
      // Formato nuevo
      lat = spot.location.lat;
      lng = spot.location.lng;
      city = spot.location.city;
      country = spot.location.country;
    } else if ('latitude' in spot.location && 'longitude' in spot.location) {
      // Formato antiguo
      lat = spot.location.latitude;
      lng = spot.location.longitude;
      // city y country no existen en formato antiguo
    } else {
      return null;
    }
    
    return {
      lat,
      lng,
      ...(city && { city }),
      ...(country && { country }),
    };
  }, []);
  
  const [location, setLocation] = useState<{ lat: number; lng: number; city?: string; country?: string } | null>(
    getLocationFromSpot(initialSpot)
  );
  
  // FASE 5: Image (imagen única)
  const getImageFromSpot = useCallback((spot: Spot | null | undefined): SpotImage => {
    if (!spot) {
      return { url: '' };
    }
    
    if (spot.image && spot.image.url) {
      // Formato nuevo
      return spot.image;
    } else if (spot.photos && spot.photos.length > 0) {
      // Formato antiguo (photos[]), tomar primera foto
      return { url: spot.photos[0] };
    }
    return { url: '' };
  }, []);
  
  const [image, setImage] = useState<SpotImage>(getImageFromSpot(initialSpot));
  
  // FASE 4: hasGeneratedContent
  const [hasGeneratedContent, setHasGeneratedContent] = useState(
    initialSpot?.hasGeneratedContent !== undefined 
      ? initialSpot.hasGeneratedContent 
      : (initialSpot?.aiGenerated !== undefined && initialSpot.aiGenerated !== null)
  );
  
  // Campos legacy para compatibilidad temporal (se eliminarán en FASE 6)
  const [description, setDescription] = useState(initialSpot?.description || '');
  const [whyItMatters, setWhyItMatters] = useState(initialSpot?.whyItMatters || '');
  const [culturalContext, setCulturalContext] = useState(initialSpot?.culturalContext || '');
  const [planInfo, setPlanInfo] = useState(initialSpot?.planInfo || '');
  const [photos, setPhotos] = useState<string[]>(initialSpot?.photos || []); // Legacy - mantener temporalmente
  // FASE 4: Campos eliminados - hours, cost, restrictions, accessibility, howToVisit
  // FASE 3: narration eliminado - Flow narrative eliminado del modelo Spot

  // FASE 4-5: Función para cargar contenido de spot existente (simplificada)
  // FASE 4-5: Función para cargar contenido de spot existente (simplificada)
  const loadExistingSpotContent = useCallback((spot: Spot) => {
    // FASE 4-5: Cargar campos nuevos primero
    if (spot.name) {
      setName(spot.name);
    }
    if (spot.shortDescription || spot.whyItMatters || spot.description) {
      setShortDescription(spot.shortDescription || spot.whyItMatters || spot.description || '');
    }
    if (spot.type) {
      setType(spot.type);
    }
    const spotLocation = getLocationFromSpot(spot);
    if (spotLocation) {
      setLocation(spotLocation);
    }
    const spotImage = getImageFromSpot(spot);
    setImage(spotImage);
    
    // FASE 4: hasGeneratedContent
    const hasGenerated = spot.hasGeneratedContent !== undefined 
      ? spot.hasGeneratedContent 
      : (spot.aiGenerated !== undefined && spot.aiGenerated !== null);
    setHasGeneratedContent(hasGenerated);
    
    // Campos legacy para compatibilidad temporal
    if (spot.description) setDescription(spot.description);
    if (spot.whyItMatters) setWhyItMatters(spot.whyItMatters);
    if (spot.culturalContext) setCulturalContext(spot.culturalContext);
    if (spot.planInfo) setPlanInfo(spot.planInfo);
    if (spot.photos) setPhotos(spot.photos);
    
    // Actualizar initialState para que hasChanges funcione correctamente
    setInitialState(prev => ({
      ...prev,
      name: spot.name || prev.name,
      shortDescription: spot.shortDescription || spot.whyItMatters || spot.description || prev.shortDescription,
      type: spot.type || prev.type,
      location: getLocationFromSpot(spot) || prev.location,
      image: getImageFromSpot(spot),
      hasGeneratedContent: hasGenerated,
      // Legacy
      description: spot.description || prev.description,
      whyItMatters: spot.whyItMatters || prev.whyItMatters,
      culturalContext: spot.culturalContext || prev.culturalContext,
      planInfo: spot.planInfo || prev.planInfo,
      photos: spot.photos || prev.photos,
    }));
  }, [getLocationFromSpot, getImageFromSpot]);

  // FASE 5: Estados de imagen (imagen única)
  const [isOptimizingImage, setIsOptimizingImage] = useState(false);
  
  // Hook para manejar subida de imagen única
  const imageUploadHook = useImageUpload({
    initialUri: image.url || null, // FASE 5: Usar image.url
    allowsEditing: true,
    aspect: [4, 3],
    quality: 75,
    onOptimizing: () => setIsOptimizingImage(true),
    onOptimized: (uri) => {
      setIsOptimizingImage(false);
      // FASE 5: Actualizar image.url directamente
      setImage(prev => ({ ...prev, url: uri }));
      // Legacy: también actualizar photos para compatibilidad temporal
      setPhotos([uri]);
    },
    onError: () => setIsOptimizingImage(false),
  });

  // Estados de IA - Control absoluto por intención del usuario
  const [aiState, setAiState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [aiError, setAiError] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<GeneratedContent | null>(null);
  
  // Ref para prevenir múltiples ejecuciones simultáneas
  const isGeneratingRef = useRef(false);

  // FASE 4-5: Estado inicial para detectar cambios (simplificado)
  const [initialState, setInitialState] = useState(() => {
    const spotLocation = getLocationFromSpot(initialSpot);
    const spotImage = getImageFromSpot(initialSpot);
    const hasGenerated = initialSpot?.hasGeneratedContent !== undefined 
      ? initialSpot.hasGeneratedContent 
      : (initialSpot?.aiGenerated !== undefined && initialSpot.aiGenerated !== null);
    
    return {
      name: initialSpot?.name || '',
      shortDescription: initialSpot?.shortDescription || initialSpot?.whyItMatters || initialSpot?.description || '',
      type: initialSpot?.type || 'other',
      location: spotLocation,
      image: spotImage,
      hasGeneratedContent: hasGenerated,
      // Legacy para compatibilidad temporal
      description: initialSpot?.description || '',
      whyItMatters: initialSpot?.whyItMatters || '',
      culturalContext: initialSpot?.culturalContext || '',
      planInfo: initialSpot?.planInfo || '',
      photos: initialSpot?.photos || [],
      // FASE 4: Campos eliminados - hours, cost, restrictions, accessibility, howToVisit
      // FASE 3: narration eliminado
    };
  });

  // FASE 4-5: Actualizar estados cuando cambia initialSpot (simplificado)
  useEffect(() => {
    if (initialSpot) {
      const spotLocation = getLocationFromSpot(initialSpot);
      const spotImage = getImageFromSpot(initialSpot);
      const hasGenerated = initialSpot.hasGeneratedContent !== undefined 
        ? initialSpot.hasGeneratedContent 
        : (initialSpot.aiGenerated !== undefined && initialSpot.aiGenerated !== null);
      
      setName(initialSpot.name || '');
      setShortDescription(initialSpot.shortDescription || initialSpot.whyItMatters || initialSpot.description || '');
      setType(initialSpot.type);
      setLocation(spotLocation);
      setImage(spotImage);
      setHasGeneratedContent(hasGenerated);
      
      // Legacy para compatibilidad temporal
      setDescription(initialSpot.description || '');
      setWhyItMatters(initialSpot.whyItMatters || '');
      setCulturalContext(initialSpot.culturalContext || '');
      setPlanInfo(initialSpot.planInfo || '');
      setPhotos(initialSpot.photos || []);
      
      setExistingSpot(null); // Reset existingSpot cuando cambia initialSpot
      setInitialState({
        name: initialSpot.name || '',
        shortDescription: initialSpot.shortDescription || initialSpot.whyItMatters || initialSpot.description || '',
        type: initialSpot.type,
        location: spotLocation,
        image: spotImage,
        hasGeneratedContent: hasGenerated,
        // Legacy
        description: initialSpot.description || '',
        whyItMatters: initialSpot.whyItMatters || '',
        culturalContext: initialSpot.culturalContext || '',
        planInfo: initialSpot.planInfo || '',
        photos: initialSpot.photos || [],
      });
    }
  }, [initialSpot, getLocationFromSpot, getImageFromSpot]);

  // SCOPE 2: Detectar spot existente cuando cambia nombre o ubicación (modo creación)
  // Optimizado: usar useMemo para lazy evaluation y evitar recálculos innecesarios
  const detectedExistingSpot = useMemo(() => {
    // Lazy: solo buscar cuando ambos campos tienen valor
    if (!name || name.trim().length === 0 || !location) {
      return null;
    }
    // FASE 4: findExistingSpot ahora acepta lat/lng directamente
    return findExistingSpot(spots, name, location);
  }, [name, location, spots]);

  useEffect(() => {
    if (detectedExistingSpot) {
      setIsLoadingExisting(true);
      setExistingSpot(detectedExistingSpot);
      // En modo creación: cargar contenido automáticamente
      if (!isEditMode && (!initialSpot || initialSpot.id !== detectedExistingSpot.id)) {
        loadExistingSpotContent(detectedExistingSpot);
      }
      setIsLoadingExisting(false);
    } else {
      setExistingSpot(null);
      setIsLoadingExisting(false);
    }
  }, [detectedExistingSpot, isEditMode, initialSpot, loadExistingSpotContent]);

  // SCOPE 2: En modo edición: detectar si cambia nombre/ubicación y coincide con otro spot
  // Optimizado: usar el mismo useMemo para consistencia
  useEffect(() => {
    if (isEditMode && initialSpot && detectedExistingSpot) {
      // Si encontramos un spot diferente al que estamos editando
      if (detectedExistingSpot.id !== initialSpot.id) {
        setExistingSpot(detectedExistingSpot);
        // Cambiar automáticamente al spot existente
        loadExistingSpotContent(detectedExistingSpot);
        // Nota: Esto reemplazará el formulario actual con el contenido del spot existente
        // El usuario puede continuar editando desde ahí
      } else {
        setExistingSpot(null);
      }
    } else if (isEditMode && initialSpot && !detectedExistingSpot) {
      setExistingSpot(null);
    }
  }, [isEditMode, initialSpot, detectedExistingSpot, loadExistingSpotContent]);

  // FASE 4-5: Detectar cambios (simplificado)
  const hasChanges = 
    name !== initialState.name ||
    shortDescription !== initialState.shortDescription ||
    type !== initialState.type ||
    (location && initialState.location && (location.lat !== initialState.location.lat || location.lng !== initialState.location.lng)) ||
    (!location && initialState.location) ||
    (location && !initialState.location) ||
    image.url !== initialState.image.url ||
    hasGeneratedContent !== initialState.hasGeneratedContent;
  // Legacy: description, whyItMatters, culturalContext, planInfo, photos (no se usan en detección de cambios)
  // FASE 4: Campos eliminados - hours, cost, restrictions, accessibility, howToVisit
  // FASE 3: narration eliminado

  // Validaciones (imágenes son opcionales según el plan)
  const errors: { photo?: string; location?: string } = {};
  // Imágenes son opcionales, no requeridas
  if (!location) {
    errors.location = 'Location is required';
  }
  const isValid = !errors.location;

  // FASE 5: Seleccionar imagen (imagen única)
  const pickImage = useCallback(async () => {
    await imageUploadHook.pickFromGallery();
    // imageUploadHook.onOptimized ya actualiza image.url automáticamente
  }, [imageUploadHook]);

  // FASE 5: Eliminar imagen (imagen única, no index)
  const removeImage = useCallback(() => {
    setImage({ url: '' });
    setPhotos([]); // Legacy: también limpiar photos para compatibilidad
  }, []);

  // Generar contenido con IA - Control absoluto: solo se ejecuta por acción explícita del usuario
  const generateContent = useCallback(async (fields?: string[]): Promise<GeneratedContent | null> => {
    // Prevenir múltiples ejecuciones simultáneas
    if (isGeneratingRef.current || aiState === 'loading') {
      console.log('[AI] Generación ya en curso, ignorando llamada adicional');
      return null;
    }

    // CANONICAL: Control estricto de IA - NO ejecutar si hay spot existente o duplicado
    if (existingSpot) {
      console.log('[AI] Spot existente detectado — NO ejecutar IA', {
        existingSpotId: existingSpot.id,
        existingSpotName: existingSpot.name,
      });
      setAiState('error');
      setAiError('Cannot generate content for existing spot. This place already exists in FLOWYA.');
      return null;
    }

    // SCOPE: Log claro para spot nuevo
    console.log('[AI] Spot nuevo — generando contenido con OpenAI', {
      spotName: name,
      location: location ? { lat: location.lat, lng: location.lng } : null,
    });
    
    if (!location) {
      setAiState('error');
      setAiError('Location is required to generate content');
      return null;
    }

    if (!isAIConfigured()) {
      setAiState('error');
      setAiError('OpenAI API key is not configured');
      return null;
    }

    // Marcar como en progreso
    isGeneratingRef.current = true;
    setAiState('loading');
    setAiError(null);

    try {
      // FASE 4-5: Crear spot temporal con datos actuales (formato nuevo)
      const tempSpot: Spot = {
        id: 'temp',
        name: name || '',
        location: {
          lat: location.lat,
          lng: location.lng,
          ...(location.city && { city: location.city }),
          ...(location.country && { country: location.country }),
        },
        image: image.url ? image : { url: '' },
        shortDescription: shortDescription || undefined,
        hasGeneratedContent: hasGeneratedContent,
        type,
        // Legacy para compatibilidad temporal
        photos: image.url ? [image.url] : [],
        description: shortDescription || undefined,
        whyItMatters: shortDescription || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const generatedContent = await generateSpotContent(tempSpot, {
        fields,
      });

      setPreviewContent(generatedContent);
      setAiState('success');
      
      // FASE 4: Actualizar campos del formulario con contenido generado (solo shortDescription)
      if (generatedContent.shortDescription) {
        setShortDescription(generatedContent.shortDescription);
        // Legacy: también actualizar campos legacy para compatibilidad temporal
        setDescription(generatedContent.shortDescription);
        setWhyItMatters(generatedContent.shortDescription);
      }
      
      // FASE 4: Marcar que tiene contenido generado
      setHasGeneratedContent(true);
      
      // Legacy: actualizar campos legacy si existen (para compatibilidad temporal)
      if (generatedContent.planInfo) setPlanInfo(generatedContent.planInfo);
      if (generatedContent.culturalContext) setCulturalContext(generatedContent.culturalContext);
      
      // SCOPE: Log al completar generación
      console.log('[AI] Content generated and saved successfully');
      
      return generatedContent;
    } catch (error: any) {
      // SCOPE: Manejo robusto de errores - no romper el flujo
      console.error('[AI] Error generating AI content:', error);
      setAiState('error');
      setAiError(error.message || 'Couldn\'t generate content. Try again.');
      // NO hacer throw - permitir que el spot se cree sin contenido AI
      return null;
    } finally {
      isGeneratingRef.current = false;
    }
  }, [location, name, image, shortDescription, hasGeneratedContent, type, existingSpot, aiState]);

  // FASE 4-5: Guardar (actualizado para nuevo modelo)
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
        location.lat,
        location.lng
      );
      
      // FASE 4: Extraer city/country de locationRegion si no existen
      if (locationRegion && !location.city) {
        if (locationRegion.type === 'city' || locationRegion.type === 'locality') {
          location.city = locationRegion.label;
        }
      }
      if (locationRegion && !location.country) {
        const countryCodeMap: Record<string, string> = {
          'MX': 'Mexico',
          'US': 'United States',
          'ES': 'Spain',
          'FR': 'France',
          'IT': 'Italy',
          'PT': 'Portugal',
        };
        location.country = countryCodeMap[locationRegion.countryCode] || locationRegion.countryCode;
      }
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

    // FASE 4-5: Construir spotData con formato nuevo
    const spotData: Omit<Spot, 'id' | 'createdAt' | 'updatedAt'> = {
      name: name || '',
      location: {
        lat: location.lat,
        lng: location.lng,
        ...(location.city && { city: location.city }),
        ...(location.country && { country: location.country }),
      },
      image: image.url ? image : { url: '' },
      shortDescription: shortDescription || undefined,
      hasGeneratedContent: hasGeneratedContent,
      type,
      locationRegion, // Región generada desde coordenadas
      
      // Legacy para compatibilidad temporal (se eliminarán en FASE 6)
      photos: image.url ? [image.url] : [],
      description: shortDescription || undefined,
      whyItMatters: shortDescription || undefined,
      culturalContext: culturalContext || undefined,
      planInfo: planInfo || undefined,
      // FASE 4: Campos eliminados - hours, cost, restrictions, accessibility, howToVisit
      // FASE 3: narration eliminado
    };

    onSave?.(spotData);
  }, [isValid, location, name, image, shortDescription, hasGeneratedContent, type, culturalContext, planInfo, onSave]);

  // FASE 4-5: Cancelar (simplificado)
  const handleCancel = useCallback(() => {
    // Resetear a estado inicial
    setName(initialState.name);
    setShortDescription(initialState.shortDescription);
    setType(initialState.type);
    setLocation(initialState.location);
    setImage(initialState.image);
    setHasGeneratedContent(initialState.hasGeneratedContent);
    
    // Legacy para compatibilidad temporal
    setDescription(initialState.description || '');
    setWhyItMatters(initialState.whyItMatters || '');
    setCulturalContext(initialState.culturalContext || '');
    setPlanInfo(initialState.planInfo || '');
    setPhotos(initialState.photos || []);
    
    setPreviewContent(null);
    setAiError(null);
    setAiState('idle');
    isGeneratingRef.current = false;
    onCancel?.();
  }, [initialState, onCancel]);

  // FASE 4-5: Reset completo (simplificado)
  const reset = useCallback(() => {
    setName('');
    setShortDescription('');
    setType('other');
    setLocation(null);
    setImage({ url: '' });
    setHasGeneratedContent(false);
    
    // Legacy para compatibilidad temporal
    setDescription('');
    setWhyItMatters('');
    setCulturalContext('');
    setPlanInfo('');
    setPhotos([]);
    
    setPreviewContent(null);
    setAiError(null);
    setAiState('idle');
    isGeneratingRef.current = false;
  }, []);

  return {
    // FASE 4-5: Estados de campos nuevos
    name,
    setName,
    shortDescription,
    setShortDescription,
    type,
    setType,
    location,
    setLocation,
    image,
    setImage,
    hasGeneratedContent,
    setHasGeneratedContent,
    
    // Legacy para compatibilidad temporal (se eliminarán en FASE 6)
    description,
    setDescription,
    whyItMatters,
    setWhyItMatters,
    culturalContext,
    setCulturalContext,
    planInfo,
    setPlanInfo,
    photos,
    setPhotos,
    
    // FASE 4: Campos eliminados - hours, cost, restrictions, accessibility, howToVisit
    // FASE 3: narration eliminado - Flow narrative eliminado del modelo Spot

    // FASE 5: Imágenes (imagen única)
    isOptimizingImage,
    pickImage,
    removeImage,
    // FASE 5: addImage eliminado - solo una imagen

    // Validación
    isValid,
    errors,

    // IA
    aiState,
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
