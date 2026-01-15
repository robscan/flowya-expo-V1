/**
 * ImageSlider Component
 * Slider simple para mostrar múltiples imágenes
 * 
 * Características:
 * - Navegación swipe entre imágenes
 * - Indicadores de posición
 * - Soporte para placeholder cuando no hay imágenes
 */

import { useRef, useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, View } from 'react-native';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getPlaceholderImageSource } from '@/utils/imageHelpers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ImageSliderProps {
  images: string[]; // Array de URIs de imágenes
  height?: number; // Altura del slider
  showIndicators?: boolean; // Mostrar indicadores de posición
  showFallback?: boolean; // Mostrar placeholder si no hay imágenes
}

export function ImageSlider({
  images,
  height = 300,
  showIndicators = true,
  showFallback = true,
}: ImageSliderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Si no hay imágenes, mostrar placeholder
  if (images.length === 0 && showFallback) {
    return (
      <View style={[styles.container, { height }]}>
        <OptimizedImage
          source={getPlaceholderImageSource()}
          width="100%"
          height={height}
          showFallback={false}
          resizeMode="cover"
        />
      </View>
    );
  }

  // Si solo hay una imagen, mostrar directamente sin slider
  if (images.length === 1) {
    return (
      <View style={[styles.container, { height }]}>
        <OptimizedImage
          source={{ uri: images[0] }}
          width="100%"
          height={height}
          showFallback={showFallback}
          resizeMode="cover"
        />
      </View>
    );
  }

  // Múltiples imágenes: mostrar slider
  return (
    <View style={[styles.container, { height }]}>
      <FlatList
        ref={flatListRef}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => `${item}-${index}`}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={[styles.imageContainer, { width: SCREEN_WIDTH, height }]}>
            <OptimizedImage
              source={{ uri: item }}
              width="100%"
              height={height}
              showFallback={showFallback}
              resizeMode="cover"
            />
          </View>
        )}
      />
      
      {/* Indicadores de posición */}
      {showIndicators && images.length > 1 && (
        <View style={styles.indicatorsContainer}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                {
                  backgroundColor: currentIndex === index ? colors.tint : colors.icon + '40',
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  imageContainer: {
    width: SCREEN_WIDTH,
  },
  indicatorsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
