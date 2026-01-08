/**
 * Design System Page
 * Fuente de verdad del sistema de diseño
 * 
 * Secciones:
 * - Typography: Tokens de tipografía
 * - Colors: Paleta de colores
 * - Micro Components: Componentes pequeños (Chip, IconButton, etc.)
 * - Components: Componentes canónicos (SpotCard, FlowCard, etc.)
 * - Patterns: Composiciones canónicas (ContentHeader, InfoMeta)
 */

import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FlowCard } from '@/components/FlowCard';
import { FlowSpotCard } from '@/components/FlowSpotCard';
import { FlowSpotNumberedMarker } from '@/components/FlowSpotNumberedMarker';
import { MapSpotMarker } from '@/components/MapSpotMarker';
import { SpotInlineCard } from '@/components/SpotInlineCard';
import { SpotMediaCard } from '@/components/SpotMediaCard';
import { Chip } from '@/components/ui/Chip';
import { ContentHeader, ContentHeaderAction } from '@/components/ui/ContentHeader';
import { Icon, iconTouchableContainer } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { InfoMeta } from '@/components/ui/InfoMeta';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SkeletonBlock, SkeletonCard, SkeletonImage, SkeletonList, SkeletonText } from '@/components/ui/Skeleton';
import { Toast } from '@/components/ui/Toast';
import { Tooltip } from '@/components/ui/Tooltip';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { fontSize, fontWeight, textStyles } from '@/constants/typography';
import { mockFlows } from '@/data/flows';
import { mockSpots } from '@/data/spots';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DesignSystemScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showDarkMode, setShowDarkMode] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Refs para secciones (navegación por scroll)
  const typographyRef = useRef<View>(null);
  const colorsRef = useRef<View>(null);
  const microComponentsRef = useRef<View>(null);
  const componentsRef = useRef<View>(null);
  const patternsRef = useRef<View>(null);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const scrollToSection = (ref: React.RefObject<View>) => {
    ref.current?.measureLayout(
      scrollViewRef.current?.getInnerViewNode() || (scrollViewRef.current as any),
      (x, y) => {
        scrollViewRef.current?.scrollTo({ y: y - spacing.md, animated: true });
      },
      () => {}
    );
  };

  // Datos de ejemplo
  const exampleSpot = mockSpots[0];
  const exampleFlow = mockFlows[0];
  const exampleImageUri = exampleSpot.photos && exampleSpot.photos.length > 0 ? exampleSpot.photos[0] : null;

  // Render Navigation Menu
  const renderNavigation = () => {
    const navItems = [
      { label: 'Typography', ref: typographyRef },
      { label: 'Colors', ref: colorsRef },
      { label: 'Micro Components', ref: microComponentsRef },
      { label: 'Components', ref: componentsRef },
      { label: 'Patterns', ref: patternsRef },
    ];

    return (
      <View style={[styles.navContainer, { backgroundColor: colors.background, borderRightColor: colors.icon + '20' }]}>
        <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.md }]}>
          Navigation
        </Text>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            onPress={() => scrollToSection(item.ref)}
            style={styles.navItem}
            activeOpacity={0.7}>
            <Text style={[textStyles.body, { color: colors.icon }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Render Typography tokens
  const renderTypography = () => (
    <View style={styles.tokensGrid}>
      {/* Text Styles */}
      <View style={styles.tokenGroup}>
        <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.sm }]}>
          Text Styles
        </Text>
        <View style={styles.tokensGrid}>
          {Object.entries(textStyles).map(([key, style]) => (
            <View key={key} style={[styles.tokenExample, { backgroundColor: colors.background, width: '48%' }]}>
              <Text style={[textStyles.caption, { color: colors.icon, marginBottom: spacing.xs }]}>
                {key}
              </Text>
              <Text style={[style, { color: colors.text }]} numberOfLines={2}>
                The quick brown fox jumps over the lazy dog
              </Text>
              <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs / 2 }]}>
                {style.fontSize}px / {style.lineHeight}px / {style.fontWeight}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Font Sizes */}
      <View style={styles.tokenGroup}>
        <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.sm }]}>
          Font Sizes
        </Text>
        <View style={styles.tokensGrid}>
          {Object.entries(fontSize).map(([key, size]) => (
            <View key={key} style={[styles.tokenExample, { backgroundColor: colors.background, width: '48%' }]}>
              <Text style={[textStyles.caption, { color: colors.icon, marginBottom: spacing.xs }]}>
                fontSize.{key}
              </Text>
              <Text style={[{ fontSize: size, color: colors.text, fontFamily: 'Inter-Regular' }]}>
                {size}px - Sample text
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Font Weights */}
      <View style={styles.tokenGroup}>
        <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.sm }]}>
          Font Weights
        </Text>
        <View style={styles.tokensGrid}>
          {Object.entries(fontWeight).map(([key, weight]) => (
            <View key={key} style={[styles.tokenExample, { backgroundColor: colors.background, width: '48%' }]}>
              <Text style={[textStyles.caption, { color: colors.icon, marginBottom: spacing.xs }]}>
                fontWeight.{key}
              </Text>
              <Text style={[{ fontSize: fontSize.base, fontWeight: weight, color: colors.text }]}>
                {weight} - Sample text
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  // Render Colors tokens
  const renderColors = () => {
    const lightColors = Colors.light;
    const darkColors = Colors.dark;
    const displayColors = showDarkMode ? darkColors : lightColors;
    const modeName = showDarkMode ? 'Dark' : 'Light';

    return (
      <View style={styles.tokensContainer}>
        <View style={styles.colorModeToggle}>
          <TouchableOpacity
            onPress={() => setShowDarkMode(false)}
            style={[
              styles.colorModeButton,
              { backgroundColor: !showDarkMode ? colors.tint + '20' : 'transparent' },
            ]}>
            <Text style={[textStyles.label, { color: !showDarkMode ? colors.tint : colors.icon }]}>
              Light
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowDarkMode(true)}
            style={[
              styles.colorModeButton,
              { backgroundColor: showDarkMode ? colors.tint + '20' : 'transparent' },
            ]}>
            <Text style={[textStyles.label, { color: showDarkMode ? colors.tint : colors.icon }]}>
              Dark
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tokenGroup}>
          <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.sm }]}>
            {modeName} Mode Colors
          </Text>
          <View style={styles.colorsGrid}>
            {Object.entries(displayColors).map(([key, value]) => (
              <View key={key} style={[styles.colorExample, { backgroundColor: colors.background, width: '48%' }]}>
                <View style={[styles.colorSwatch, { backgroundColor: value, borderColor: colors.icon + '40' }]} />
                <View style={styles.colorInfo}>
                  <Text style={[textStyles.bodyMedium, { color: colors.text }]}>
                    {key}
                  </Text>
                  <Text style={[textStyles.caption, { color: colors.icon }]}>
                    {value}
                  </Text>
                  {key === 'text' && (
                    <Text style={[textStyles.body, { color: value, marginTop: spacing.xs }]} numberOfLines={1}>
                      Sample text in this color
                    </Text>
                  )}
                  {key === 'background' && (
                    <View style={[styles.colorPreview, { backgroundColor: value, borderWidth: 1, borderColor: colors.icon + '40' }]}>
                      <Text style={[textStyles.caption, { color: displayColors.text }]}>
                        Background preview
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  // Render Micro Components
  const renderMicroComponents = () => (
    <View style={styles.componentsContainer}>
      {/* Chip */}
      <View style={styles.componentGroup}>
        <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.sm }]}>
          Chip
        </Text>
        <Text style={[textStyles.caption, { color: colors.icon, marginBottom: spacing.md }]}>
          Representa categorías, tipos o estados informativos
        </Text>
        
        <View style={styles.componentExamplesGrid}>
          <View style={styles.componentExample}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              default
            </Text>
            <Chip text="Beach" variant="default" />
          </View>

          <View style={styles.componentExample}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              subtle
            </Text>
            <Chip text="Café" variant="subtle" />
          </View>

          <View style={styles.componentExample}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              highlighted
            </Text>
            <Chip text="WALKING" variant="highlighted" />
          </View>

          <View style={styles.componentExample}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              with icon
            </Text>
            <Chip text="Museum" variant="default" icon="map" />
          </View>
        </View>
      </View>

      {/* IconButton */}
      <View style={styles.componentGroup}>
        <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.sm }]}>
          IconButton
        </Text>
        <Text style={[textStyles.caption, { color: colors.icon, marginBottom: spacing.md }]}>
          Botones de icono para headers y overlays (área táctil mínima 48x48px)
        </Text>
        
        <View style={styles.componentExamples}>
          <View style={styles.componentExample}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              Variantes
            </Text>
            <View style={styles.iconButtonRow}>
              <IconButton icon="back" onPress={() => {}} variant="primary" />
              <IconButton icon="close" onPress={() => {}} variant="secondary" />
              <IconButton icon="share" onPress={() => {}} variant="ghost" />
              <IconButton icon="bookmark" onPress={() => {}} variant="primary" />
              <IconButton icon="more" onPress={() => {}} variant="secondary" />
            </View>
          </View>

          <View style={styles.componentExample}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              Uso en header
            </Text>
            <View style={[styles.headerExample, { backgroundColor: colors.background, borderColor: colors.icon + '20' }]}>
              <IconButton icon="back" onPress={() => {}} />
              <Text style={[textStyles.heading4, { color: colors.text, flex: 1, textAlign: 'center' }]}>
                Header Title
              </Text>
              <View style={styles.headerActions}>
                <IconButton icon="share" onPress={() => {}} />
                <IconButton icon="bookmark" onPress={() => {}} />
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* MapPoint / MapPin */}
      <View style={styles.componentGroup}>
        <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.sm }]}>
          MapPoint / MapPin
        </Text>
        <Text style={[textStyles.caption, { color: colors.icon, marginBottom: spacing.md }]}>
          Componentes para representar spots en mapas
        </Text>
        
        <View style={styles.componentExamples}>
          <View style={styles.componentExample}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              MapSpotMarker
            </Text>
            <View style={styles.mapMarkerRow}>
              <View style={styles.mapMarkerExample}>
                <Text style={[textStyles.caption, { color: colors.icon, marginBottom: spacing.xs }]}>
                  default
                </Text>
                <MapSpotMarker spot={exampleSpot} onPress={() => {}} />
              </View>
              <View style={styles.mapMarkerExample}>
                <Text style={[textStyles.caption, { color: colors.icon, marginBottom: spacing.xs }]}>
                  highlighted
                </Text>
                <MapSpotMarker spot={exampleSpot} onPress={() => {}} isHighlighted={true} />
              </View>
            </View>
          </View>

          <View style={styles.componentExample}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              FlowSpotNumberedMarker
            </Text>
            <View style={styles.mapMarkerRow}>
              <View style={styles.mapMarkerExample}>
                <Text style={[textStyles.caption, { color: colors.icon, marginBottom: spacing.xs }]}>
                  active
                </Text>
                <FlowSpotNumberedMarker
                  spot={exampleSpot}
                  orderNumber={1}
                  state="active"
                  onPress={() => {}}
                />
              </View>
              <View style={styles.mapMarkerExample}>
                <Text style={[textStyles.caption, { color: colors.icon, marginBottom: spacing.xs }]}>
                  upNext
                </Text>
                <FlowSpotNumberedMarker
                  spot={exampleSpot}
                  orderNumber={2}
                  state="upNext"
                  onPress={() => {}}
                />
              </View>
              <View style={styles.mapMarkerExample}>
                <Text style={[textStyles.caption, { color: colors.icon, marginBottom: spacing.xs }]}>
                  visited
                </Text>
                <FlowSpotNumberedMarker
                  spot={exampleSpot}
                  orderNumber={3}
                  state="visited"
                  onPress={() => {}}
                />
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Skeleton Loaders */}
      <View style={styles.componentGroup}>
        <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.sm }]}>
          Skeleton Loaders
        </Text>
        <Text style={[textStyles.caption, { color: colors.icon, marginBottom: spacing.md }]}>
          CANONICAL: Componentes reutilizables para estados de carga. Usan tokens del Design System (spacing, colors, typography). Animación ligera de shimmer.
        </Text>
        
        <View style={styles.componentExamples}>
          {/* SkeletonBlock */}
          <View style={styles.componentExample}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              SkeletonBlock (base)
            </Text>
            <View style={styles.skeletonExamples}>
              <SkeletonBlock width={200} height={20} />
              <SkeletonBlock width={150} height={16} style={{ marginTop: spacing.xs }} />
              <SkeletonBlock width={100} height={12} style={{ marginTop: spacing.xs }} />
            </View>
            <View style={[styles.skeletonExamples, { marginTop: spacing.sm, flexDirection: 'row', gap: spacing.xs }]}>
              <SkeletonBlock size="xs" width={80} />
              <SkeletonBlock size="sm" width={100} />
              <SkeletonBlock size="md" width={120} />
              <SkeletonBlock size="lg" width={140} />
            </View>
          </View>

          {/* SkeletonText */}
          <View style={styles.componentExample}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              SkeletonText (variantes tipográficas)
            </Text>
            <View style={styles.skeletonExamples}>
              <SkeletonText variant="heading4" width="80%" />
              <SkeletonText variant="bodyMedium" width="90%" lines={2} style={{ marginTop: spacing.xs }} />
              <SkeletonText variant="caption" width="60%" style={{ marginTop: spacing.xs }} />
            </View>
          </View>

          {/* SkeletonImage */}
          <View style={styles.componentExample}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              SkeletonImage (aspect ratio)
            </Text>
            <View style={styles.skeletonExamples}>
              <SkeletonImage width={200} aspectRatio={16 / 9} />
              <SkeletonImage size="small" style={{ marginTop: spacing.sm }} />
              <SkeletonImage size="medium" style={{ marginTop: spacing.sm }} />
            </View>
          </View>

          {/* SkeletonCard */}
          <View style={styles.componentExample}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              SkeletonCard (completo)
            </Text>
            <View style={styles.skeletonExamples}>
              <SkeletonCard size="small" />
              <SkeletonCard size="medium" style={{ marginTop: spacing.md }} />
            </View>
          </View>

          {/* SkeletonList */}
          <View style={styles.componentExample}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              SkeletonList (listas)
            </Text>
            <View style={styles.skeletonExamples}>
              <SkeletonList count={3} layout="list" variant="card" cardProps={{ size: 'small' }} />
            </View>
            <View style={styles.skeletonExamples}>
              <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.md, marginBottom: spacing.xs }]}>
                Grid layout
              </Text>
              <SkeletonList count={4} layout="grid" variant="card" cardProps={{ size: 'small' }} />
            </View>
            <View style={styles.skeletonExamples}>
              <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.md, marginBottom: spacing.xs }]}>
                Row variant
              </Text>
              <SkeletonList count={3} variant="row" />
            </View>
          </View>
        </View>
      </View>

      {/* Toast */}
      <View style={styles.componentGroup}>
        <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.sm }]}>
          Toast
        </Text>
        <Text style={[textStyles.caption, { color: colors.icon, marginBottom: spacing.md }]}>
          Notificaciones discretas (solo contrato visual, sin lógica de timing)
        </Text>
        
        <View style={styles.componentExamplesGrid}>
          <View style={styles.componentExample}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              success
            </Text>
            <View style={[styles.toastExample, { backgroundColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)', borderColor: colors.icon + '20' }]}>
              <Toast
                message="Spot guardado correctamente"
                type="success"
                visible={true}
                duration={0}
              />
            </View>
          </View>

          <View style={styles.componentExample}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              error
            </Text>
            <View style={[styles.toastExample, { backgroundColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)', borderColor: colors.icon + '20' }]}>
              <Toast
                message="Error al guardar el spot"
                type="error"
                visible={true}
                duration={0}
              />
            </View>
          </View>

          <View style={styles.componentExample}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              info
            </Text>
            <View style={[styles.toastExample, { backgroundColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)', borderColor: colors.icon + '20' }]}>
              <Toast
                message="Información importante"
                type="info"
                visible={true}
                duration={0}
              />
            </View>
          </View>

          <View style={styles.componentExample}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              with action
            </Text>
            <View style={[styles.toastExample, { backgroundColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)', borderColor: colors.icon + '20' }]}>
              <Toast
                message="Spot eliminado"
                type="success"
                visible={true}
                duration={0}
                onUndo={() => {}}
                undoLabel="Deshacer"
              />
            </View>
          </View>
        </View>
      </View>

      {/* SectionHeader */}
      <View style={styles.componentGroup}>
        <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.sm }]}>
          SectionHeader
        </Text>
        <Text style={[textStyles.caption, { color: colors.icon, marginBottom: spacing.md }]}>
          Encabezados de sección con soporte para subtítulo y acciones declarativas
        </Text>
        
        <View style={styles.componentExamples}>
          <View style={styles.componentExample}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              large (default)
            </Text>
            <SectionHeader title="Nearby - Spots" variant="large" />
          </View>

          <View style={styles.componentExample}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              small
            </Text>
            <SectionHeader title="Maybe You Like" variant="small" />
          </View>

          <View style={styles.componentExample}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              con subtítulo
            </Text>
            <SectionHeader 
              title="Recommended - Spots" 
              subtitle="Basado en tu ubicación"
              variant="large" 
            />
          </View>

          <View style={styles.componentExample}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              con acciones
            </Text>
            <SectionHeader 
              title="My Flows" 
              actions={[
                { icon: 'profile', onPress: () => {}, variant: 'secondary' },
                { icon: 'add', onPress: () => {}, variant: 'secondary' },
              ]}
              variant="large" 
            />
          </View>
        </View>
      </View>

      {/* Tooltip */}
      <View style={styles.componentGroup}>
        <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.sm }]}>
          Tooltip
        </Text>
        <Text style={[textStyles.caption, { color: colors.icon, marginBottom: spacing.md }]}>
          Información contextual (long press o hover en web)
        </Text>
        
        <View style={styles.componentExamples}>
          <View style={styles.componentExample}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              Posiciones
            </Text>
            <View style={styles.tooltipExamples}>
              <View style={styles.tooltipExample}>
                <Text style={[textStyles.caption, { color: colors.icon, marginBottom: spacing.xs }]}>
                  top
                </Text>
                <Tooltip text="Tooltip arriba" position="top">
                  <View style={[styles.tooltipTrigger, { backgroundColor: colors.tint + '20' }]}>
                    <Text style={[textStyles.body, { color: colors.text }]}>Hover o long press</Text>
                  </View>
                </Tooltip>
              </View>

              <View style={styles.tooltipExample}>
                <Text style={[textStyles.caption, { color: colors.icon, marginBottom: spacing.xs }]}>
                  bottom
                </Text>
                <Tooltip text="Tooltip abajo" position="bottom">
                  <View style={[styles.tooltipTrigger, { backgroundColor: colors.tint + '20' }]}>
                    <Text style={[textStyles.body, { color: colors.text }]}>Hover o long press</Text>
                  </View>
                </Tooltip>
              </View>

              <View style={styles.tooltipExample}>
                <Text style={[textStyles.caption, { color: colors.icon, marginBottom: spacing.xs }]}>
                  left
                </Text>
                <Tooltip text="Tooltip izquierda" position="left">
                  <View style={[styles.tooltipTrigger, { backgroundColor: colors.tint + '20' }]}>
                    <Text style={[textStyles.body, { color: colors.text }]}>Hover o long press</Text>
                  </View>
                </Tooltip>
              </View>

              <View style={styles.tooltipExample}>
                <Text style={[textStyles.caption, { color: colors.icon, marginBottom: spacing.xs }]}>
                  right
                </Text>
                <Tooltip text="Tooltip derecha" position="right">
                  <View style={[styles.tooltipTrigger, { backgroundColor: colors.tint + '20' }]}>
                    <Text style={[textStyles.body, { color: colors.text }]}>Hover o long press</Text>
                  </View>
                </Tooltip>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  // Render Components
  const renderComponents = () => (
    <View style={styles.componentsContainer}>
      {/* SpotMediaCard - For Home/Search/Saved */}
      <View style={styles.componentGroup}>
        <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.sm }]}>
          SpotMediaCard
        </Text>
        <Text style={[textStyles.caption, { color: colors.icon, marginBottom: spacing.md }]}>
          CANONICAL: Spot card with image. Used in: Home, Search (grid), Saved, recommendations
        </Text>
        
        <View style={styles.componentExamples}>
          <View style={styles.componentExample}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              size="large"
            </Text>
            <SpotMediaCard
              spot={exampleSpot}
              size="large"
              distance={1250}
            />
          </View>

          <View style={styles.componentExample}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              size="small" (for grid/slider)
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <SpotMediaCard
                spot={exampleSpot}
                size="small"
                distance={1250}
              />
              <SpotMediaCard
                spot={mockSpots[1] || exampleSpot}
                size="small"
                distance={850}
              />
            </View>
          </View>
        </View>
      </View>

      {/* SpotInlineCard - For FlowScreen/Map/editing */}
      <View style={styles.componentGroup}>
        <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.sm }]}>
          SpotInlineCard
        </Text>
        <Text style={[textStyles.caption, { color: colors.icon, marginBottom: spacing.md }]}>
          CANONICAL: Spot card without image. Used in: FlowScreen, Map overlays, editing contexts
        </Text>
        
        <View style={styles.componentExamples}>
          <View style={styles.componentExample}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              state="default"
            </Text>
            <SpotInlineCard
              spot={exampleSpot}
              state="default"
              distance={1250}
            />
          </View>

          <View style={styles.componentExample}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              state="active"
            </Text>
            <SpotInlineCard
              spot={exampleSpot}
              state="active"
              distance={850}
            />
          </View>

          <View style={styles.componentExample}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              state="next"
            </Text>
            <SpotInlineCard
              spot={exampleSpot}
              state="next"
              orderNumber={2}
              distance={650}
            />
          </View>

          <View style={styles.componentExample}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              state="add"
            </Text>
            <SpotInlineCard
              spot={exampleSpot}
              state="add"
              distance={450}
              onAdd={() => {}}
            />
          </View>
        </View>
      </View>

      {/* FlowSpotCard */}
      <View style={styles.componentGroup}>
        <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.sm }]}>
          FlowSpotCard
        </Text>
        <Text style={[textStyles.caption, { color: colors.icon, marginBottom: spacing.md }]}>
          Estados: normal, activo
        </Text>
        
        <View style={styles.componentExamplesGrid}>
          <View style={styles.componentExample}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              normal
            </Text>
            <FlowSpotCard
              spot={exampleSpot}
              index={1}
              distance={1250}
              isActive={false}
            />
          </View>

          <View style={styles.componentExample}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              activo
            </Text>
            <FlowSpotCard
              spot={exampleSpot}
              index={0}
              distance={850}
              isActive={true}
            />
          </View>
        </View>
      </View>

      {/* FlowCard.Display */}
      <View style={styles.componentGroup}>
        <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.sm }]}>
          FlowCard.Display
        </Text>
        <Text style={[textStyles.caption, { color: colors.icon, marginBottom: spacing.md }]}>
          CANONICAL: Flow card for listings. Used in: Home, Search, Saved
        </Text>
        
        <View style={styles.componentExample}>
          <FlowCard.Display
            flow={exampleFlow}
            spots={mockSpots}
          />
        </View>
      </View>

      {/* FlowMiniBar */}
      <View style={styles.componentGroup}>
        <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.sm }]}>
          FlowMiniBar
        </Text>
        <Text style={[textStyles.caption, { color: colors.icon, marginBottom: spacing.md }]}>
          CANONICAL: Barra compacta que muestra estado de movimiento activo. Nota: Solo visible cuando hay un flow activo.
        </Text>
        
        <View style={styles.componentExample}>
          <Text style={[textStyles.caption, { color: colors.icon, marginBottom: spacing.sm }]}>
            (Requiere flow activo en FlowContext para renderizarse)
          </Text>
        </View>
      </View>
    </View>
  );

  // Render Patterns
  const renderPatterns = () => {
    // Acciones de ejemplo para ContentHeader
    const headerLeftActions: ContentHeaderAction[] = [
      {
        icon: 'back',
        onPress: () => {},
        tooltip: 'Back',
      },
    ];

    const headerRightActions: ContentHeaderAction[] = [
      {
        icon: 'share',
        onPress: () => {},
        tooltip: 'Share',
      },
      {
        icon: 'bookmark',
        onPress: () => {},
        tooltip: 'Bookmark',
        isActive: false,
      },
    ];

    return (
      <View style={styles.componentsContainer}>
        {/* ContentHeader */}
        <View style={styles.componentGroup}>
          <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.sm }]}>
            ContentHeader
          </Text>
          <Text style={[textStyles.caption, { color: colors.icon, marginBottom: spacing.md }]}>
            Header canónico para pantallas de contenido con hero (imagen o mapa) y acciones flotantes
          </Text>
          
          <View style={styles.componentExamples}>
            {/* ContentHeader con imagen hero */}
            <View style={styles.componentExample}>
              <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
                Hero: Image
              </Text>
              <View style={[styles.patternExample, { borderColor: colors.icon + '20' }]}>
                <ContentHeader
                  heroType="image"
                  heroImage={exampleImageUri ? { uri: exampleImageUri } : null}
                  heroHeight={200}
                  leftActions={headerLeftActions}
                  rightActions={headerRightActions}
                  showOverlay={true}
                  sticky={false}
                />
              </View>
            </View>

            {/* ContentHeader con mapa hero */}
            <View style={styles.componentExample}>
              <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
                Hero: Map
              </Text>
              <View style={[styles.patternExample, { borderColor: colors.icon + '20', height: 300 }]}>
                <ContentHeader
                  heroType="map"
                  heroMap={
                    <View style={{ height: 300, width: '100%', backgroundColor: colors.icon + '10', justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={[textStyles.caption, { color: colors.icon }]}>
                        Map View (FlowyaMapView)
                      </Text>
                    </View>
                  }
                  leftActions={headerLeftActions}
                  rightActions={headerRightActions}
                  showOverlay={false}
                  sticky={true}
                />
              </View>
            </View>
          </View>
        </View>

        {/* InfoMeta */}
        <View style={styles.componentGroup}>
          <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.sm }]}>
            InfoMeta
          </Text>
          <Text style={[textStyles.caption, { color: colors.icon, marginBottom: spacing.md }]}>
            Bloque informativo canónico para información secundaria debajo de títulos
          </Text>
          
          <View style={styles.componentExamples}>
            {/* InfoMeta large */}
            <View style={styles.componentExample}>
              <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
                size="large" (con chip, distancia, duración, rating)
              </Text>
              <View style={[styles.patternExample, { borderColor: colors.icon + '20', padding: spacing.md }]}>
                <Text style={[textStyles.heading, { color: colors.text, marginBottom: spacing.sm }]}>
                  Spot Title
                </Text>
                <InfoMeta
                  chip={{ label: 'Beach' }}
                  distance={1250}
                  duration={45}
                  rating={{ value: 4.8, count: 128 }}
                  size="large"
                />
              </View>
            </View>

            {/* InfoMeta large sin rating */}
            <View style={styles.componentExample}>
              <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
                size="large" (chip, distancia, duración)
              </Text>
              <View style={[styles.patternExample, { borderColor: colors.icon + '20', padding: spacing.md }]}>
                <Text style={[textStyles.heading, { color: colors.text, marginBottom: spacing.sm }]}>
                  Flow Title
                </Text>
                <InfoMeta
                  chip={{ label: 'WALKING' }}
                  distance={3500}
                  duration={120}
                  size="large"
                />
              </View>
            </View>

            {/* InfoMeta small */}
            <View style={styles.componentExample}>
              <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
                size="small" (solo distancia)
              </Text>
              <View style={[styles.patternExample, { borderColor: colors.icon + '20', padding: spacing.md }]}>
                <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.sm }]}>
                  Spot Name
                </Text>
                <InfoMeta
                  distance={850}
                  size="small"
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={iconTouchableContainer.base}
          activeOpacity={0.7}>
          <Icon name="back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[textStyles.heading3, { color: colors.text }]}>
          Design System
        </Text>
        <View style={iconTouchableContainer.base} />
      </View>

      {/* Layout: Navigation + Content */}
      <View style={styles.layout}>
        {/* Navigation Menu */}
        {renderNavigation()}

        {/* Content */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          
          {/* Typography Section */}
          <View ref={typographyRef} style={styles.section}>
            <Text style={[textStyles.heading3, { color: colors.text, marginBottom: spacing.md }]}>
              Typography
            </Text>
            {renderTypography()}
          </View>

          {/* Colors Section */}
          <View ref={colorsRef} style={styles.section}>
            <Text style={[textStyles.heading3, { color: colors.text, marginBottom: spacing.md }]}>
              Colors
            </Text>
            {renderColors()}
          </View>

          {/* Micro Components Section */}
          <View ref={microComponentsRef} style={styles.section}>
            <Text style={[textStyles.heading3, { color: colors.text, marginBottom: spacing.md }]}>
              Micro Components
            </Text>
            {renderMicroComponents()}
          </View>

          {/* Components Section */}
          <View ref={componentsRef} style={styles.section}>
            <Text style={[textStyles.heading3, { color: colors.text, marginBottom: spacing.md }]}>
              Components
            </Text>
            {renderComponents()}
          </View>

          {/* Patterns Section */}
          <View ref={patternsRef} style={styles.section}>
            <Text style={[textStyles.heading3, { color: colors.text, marginBottom: spacing.md }]}>
              Patterns
            </Text>
            {renderPatterns()}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  layout: {
    flex: 1,
    flexDirection: 'row',
  },
  navContainer: {
    width: 200,
    padding: spacing.md,
    borderRightWidth: 1,
  },
  navItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  tokensContainer: {
    gap: spacing.lg,
  },
  tokensGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  tokenGroup: {
    gap: spacing.md,
    width: '100%',
  },
  tokenExample: {
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccc',
  },
  colorModeToggle: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  colorModeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  colorExample: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    gap: spacing.md,
    alignItems: 'center',
  },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
  },
  colorInfo: {
    flex: 1,
  },
  colorPreview: {
    padding: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.xs,
  },
  componentsContainer: {
    gap: spacing.xl,
  },
  componentGroup: {
    marginBottom: spacing.xl,
  },
  componentExamples: {
    gap: spacing.md,
  },
  componentExamplesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  componentExample: {
    marginBottom: spacing.md,
    minWidth: 200,
    flex: 1,
    maxWidth: '48%',
  },
  patternExample: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  iconButtonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  headerExample: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  mapMarkerRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'flex-end',
  },
  mapMarkerExample: {
    alignItems: 'center',
  },
  skeletonExamples: {
    gap: spacing.xs,
  },
  toastExample: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: spacing.sm,
    minHeight: 48,
  },
  tooltipExamples: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  tooltipExample: {
    alignItems: 'center',
  },
  tooltipTrigger: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
});
