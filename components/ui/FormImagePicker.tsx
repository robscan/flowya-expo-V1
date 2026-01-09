/**
 * FormImagePicker - Selector de imagen con optimización
 * CANONICAL: Selector de imagen para formularios
 * 
 * Características:
 * - Integración con useImageUpload hook
 * - Optimización automática de imágenes
 * - Estados: empty, loading, loaded, error
 * - Usa tokens del design system
 * - Integración con FormField
 */

import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { useImageUpload, ImageUploadResult } from '@/hooks/useImageUpload';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface FormImagePickerProps {
  /** URI de la imagen actual (opcional, para edición) */
  initialUri?: string | null;
  /** Callback cuando se selecciona una imagen */
  onImageSelected?: (uri: string) => void;
  /** Callback cuando se remueve la imagen */
  onImageRemoved?: () => void;
  /** Función externa para seleccionar imagen (si se proporciona, se usa en lugar del hook interno) */
  onPickImage?: () => Promise<void>;
  /** Altura del contenedor (default: 200) */
  height?: number;
  /** Aspect ratio para edición (default: [4, 3]) */
  aspect?: [number, number];
  /** Si está deshabilitado */
  disabled?: boolean;
  /** Estilo adicional */
  style?: any;
}

/**
 * FormImagePicker - Selector de imagen canónico
 */
export function FormImagePicker({
  initialUri,
  onImageSelected,
  onImageRemoved,
  onPickImage,
  height = 200,
  aspect = [4, 3],
  disabled = false,
  style,
}: FormImagePickerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Usar hook interno solo si no se proporciona función externa
  const internalHook = useImageUpload({
    initialUri: onPickImage ? undefined : initialUri,
    allowsEditing: true,
    aspect,
    quality: 75,
    onOptimized: (optimizedUri) => {
      onImageSelected?.(optimizedUri);
    },
    onError: (error) => {
      console.error('Error selecting image:', error);
    },
  });

  // Si se proporciona función externa, usar esa; si no, usar hook interno
  const isOptimizing = onPickImage ? false : internalHook.isOptimizing;
  const imageUri = onPickImage ? initialUri : (internalHook.uri || initialUri);

  const handlePickImage = async () => {
    if (disabled) return;
    if (onPickImage) {
      // Usar función externa si se proporciona
      await onPickImage();
    } else {
      // Usar hook interno
      await internalHook.pickFromGallery();
    }
  };

  const handleRemoveImage = () => {
    if (onPickImage) {
      // Si usa función externa, solo llamar callback
      onImageRemoved?.();
    } else {
      // Si usa hook interno, resetear
      internalHook.reset();
      onImageRemoved?.();
    }
  };

  return (
    <View style={[styles.container, { height }, style]}>
      {imageUri ? (
        <View style={styles.imageContainer}>
          {isOptimizing ? (
            <View style={[styles.loadingOverlay, { backgroundColor: colors.background }]}>
              <ActivityIndicator size="large" color={colors.tint} />
              <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs }]}>
                Optimizando imagen...
              </Text>
            </View>
          ) : (
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          )}
          {!disabled && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={handleRemoveImage}
              activeOpacity={0.7}>
              <Icon name="close" size={20} color={colors.background} />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.placeholder,
            {
              backgroundColor: colors.icon + '10',
              borderColor: colors.icon + '30',
            },
          ]}
          onPress={handlePickImage}
          disabled={disabled}
          activeOpacity={0.7}>
          <Icon name="add" size={32} color={colors.icon} />
          <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs }]}>
            Add photo
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
