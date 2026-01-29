/**
 * useImageUpload Hook
 * CANONICAL: Hook para optimización de imágenes subidas por el usuario
 * 
 * Funcionalidades:
 * - Redimensiona imágenes (max width 1200-1600px según plataforma)
 * - Comprime imágenes (calidad 70-80)
 * - Remueve metadata pesada
 * - Genera preview optimizado
 * 
 * Pipeline:
 * 1. Usuario selecciona imagen (galería o cámara)
 * 2. Imagen se optimiza ANTES de mostrarse en UI
 * 3. Retorna URI optimizada lista para usar
 * 
 * @hook
 */

import { useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

export interface ImageUploadOptions {
  /** Permitir edición antes de optimizar (default: true) */
  allowsEditing?: boolean;
  /** Aspect ratio para edición (default: [4, 3]) */
  aspect?: [number, number];
  /** Calidad de compresión (70-80, default: 75) */
  quality?: number;
  /** Max width según plataforma (default: 1200 mobile, 1600 desktop) */
  maxWidth?: number;
  /** URI inicial (para imágenes existentes que no necesitan optimización) */
  initialUri?: string | null;
  /** Callback cuando la imagen se está optimizando */
  onOptimizing?: () => void;
  /** Callback cuando la optimización completa */
  onOptimized?: (uri: string) => void;
  /** Callback cuando hay error */
  onError?: (error: Error) => void;
}

export interface ImageUploadResult {
  /** URI de la imagen optimizada */
  uri: string | null;
  /** Si está optimizando */
  isOptimizing: boolean;
  /** Error si ocurre */
  error: Error | null;
  /** Función para seleccionar imagen desde galería */
  pickFromGallery: () => Promise<string | null>;
  /** Función para tomar foto con cámara */
  takePhoto: () => Promise<string | null>;
  /** Función para seleccionar imagen (galería o cámara) */
  pickImage: (source?: 'gallery' | 'camera') => Promise<string | null>;
  /** Resetear estado */
  reset: () => void;
}

/**
 * useImageUpload - Hook para optimización de imágenes
 * 
 * Pipeline de optimización:
 * 1. Selección de imagen (galería o cámara)
 * 2. Redimensionar (max width según plataforma)
 * 3. Comprimir (calidad 70-80)
 * 4. Remover metadata (automático con ImageManipulator)
 * 5. Retornar URI optimizada
 * 
 * Todas las imágenes pasan por este pipeline antes de mostrarse en UI.
 */
export function useImageUpload(options: ImageUploadOptions = {}): ImageUploadResult {
  const {
    allowsEditing = true,
    aspect = [4, 3],
    quality = 75, // Calidad 70-80 según requerimiento
    maxWidth,
    initialUri,
    onOptimizing,
    onOptimized,
    onError,
  } = options;

  const [uri, setUri] = useState<string | null>(initialUri || null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Actualizar URI cuando cambia initialUri
  useEffect(() => {
    if (initialUri !== undefined) {
      setUri(initialUri);
    }
  }, [initialUri]);

  // Determinar max width según plataforma
  const getMaxWidth = (): number => {
    if (maxWidth) return maxWidth;
    // Mobile: 1200px, Desktop/Web: 1600px
    return Platform.OS === 'web' ? 1600 : 1200;
  };

  /**
   * Optimizar imagen: redimensionar, comprimir y remover metadata
   */
  const optimizeImage = async (imageUri: string): Promise<string> => {
    try {
      setIsOptimizing(true);
      setError(null);
      onOptimizing?.();

      // Obtener dimensiones originales
      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG } // Sin compresión inicial para obtener dimensiones
      );

      // Calcular nuevas dimensiones manteniendo aspect ratio
      const maxW = getMaxWidth();
      let resizeAction: ImageManipulator.ActionResize | null = null;

      if (manipResult.width > maxW) {
        const aspectRatio = manipResult.height / manipResult.width;
        const newHeight = Math.round(maxW * aspectRatio);
        resizeAction = {
          resize: {
            width: maxW,
            height: newHeight,
          },
        };
      }

      // Aplicar redimensionamiento y compresión
      const actions: ImageManipulator.Action[] = [];
      if (resizeAction) {
        actions.push(resizeAction);
      }

      const optimizedResult = await ImageManipulator.manipulateAsync(
        imageUri,
        actions,
        {
          compress: quality / 100, // Convertir calidad 70-80 a 0.7-0.8
          format: ImageManipulator.SaveFormat.JPEG, // JPEG remueve metadata automáticamente
        }
      );

      setIsOptimizing(false);
      setUri(optimizedResult.uri);
      onOptimized?.(optimizedResult.uri);

      return optimizedResult.uri;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error optimizing image');
      setIsOptimizing(false);
      setError(error);
      onError?.(error);
      throw error;
    }
  };

  /**
   * Seleccionar imagen desde galería
   */
  const pickFromGallery = async (): Promise<string | null> => {
    try {
      // Solicitar permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'We need access to your photos to add a spot image.'
        );
        return null;
      }

      const mediaTypes =
        ImagePicker.MediaType?.Images ??
        ImagePicker.MediaTypeOptions?.Images ??
        ImagePicker.MediaTypeOptions?.All;

      // Abrir galería
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes,
        allowsEditing,
        aspect: allowsEditing ? aspect : undefined,
        quality: 1, // Usar calidad máxima inicial, luego optimizamos
      });

      if (result.canceled || !result.assets[0]) {
        return null;
      }

      // Optimizar imagen antes de retornar
      const optimizedUri = await optimizeImage(result.assets[0].uri);
      return optimizedUri;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error picking image from gallery');
      setError(error);
      onError?.(error);
      Alert.alert('Error', 'Couldn\'t pick image. Try again.');
      return null;
    }
  };

  /**
   * Tomar foto con cámara
   */
  const takePhoto = async (): Promise<string | null> => {
    try {
      // Solicitar permisos de cámara
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'We need access to your camera to take a photo.'
        );
        return null;
      }

      const mediaTypes =
        ImagePicker.MediaType?.Images ??
        ImagePicker.MediaTypeOptions?.Images ??
        ImagePicker.MediaTypeOptions?.All;

      // Abrir cámara
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes,
        allowsEditing,
        aspect: allowsEditing ? aspect : undefined,
        quality: 1, // Usar calidad máxima inicial, luego optimizamos
      });

      if (result.canceled || !result.assets[0]) {
        return null;
      }

      // Optimizar imagen antes de retornar
      const optimizedUri = await optimizeImage(result.assets[0].uri);
      return optimizedUri;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error taking photo');
      setError(error);
      onError?.(error);
      Alert.alert('Error', 'Couldn\'t take photo. Try again.');
      return null;
    }
  };

  /**
   * Seleccionar imagen (galería o cámara)
   */
  const pickImage = async (source: 'gallery' | 'camera' = 'gallery'): Promise<string | null> => {
    if (source === 'camera') {
      return takePhoto();
    }
    return pickFromGallery();
  };

  /**
   * Resetear estado
   */
  const reset = () => {
    setUri(null);
    setIsOptimizing(false);
    setError(null);
  };

  return {
    uri,
    isOptimizing,
    error,
    pickFromGallery,
    takePhoto,
    pickImage,
    reset,
  };
}
