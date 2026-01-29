/**
 * Search Screen - CANONICAL IMPLEMENTATION
 * 
 * Rules:
 * - Minimal, fast, content-focused
 * - Search input replaces header title
 * - Single vertical scroll, no tabs, no map
 * - Suggested content when input is empty (same layout as results)
 * - Spots: 2-column grid, Flows: single-column list
 * - Add New Spot: secondary button after results
 */

import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FlowCard } from '@/components/FlowCard';
import { SpotGrid } from '@/components/SpotGrid';
import { SpotMediaCard } from '@/components/SpotMediaCard';
import { Icon } from '@/components/ui/Icon';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SkeletonList } from '@/components/ui/SkeletonList';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { fontFamilyMedium, textStyles } from '@/constants/typography';
import { useFlow } from '@/contexts/FlowContext';
import { usePath } from '@/contexts/PathContext';
import { useSpot } from '@/contexts/SpotContext';
import { Spot, SpotType } from '@/data/spots';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBaseLocation } from '@/hooks/useBaseLocation';
import { getSpotDistance } from '@/hooks/useSpotDistance';
import { useImagePreloader } from '@/hooks/useImagePreloader';
import { anyLoading, shouldShowSkeleton } from '@/utils/loadingHelpers';
import { forwardGeocode, GeocodeResult } from '@/utils/geocoding';
import { searchAll } from '@/utils/searchLogic';
import { isMapboxConfigured } from '@/utils/mapsConfig';


export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'spots' | 'flows' | 'places'>('all');
  const [geocodeResults, setGeocodeResults] = useState<GeocodeResult[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const mapboxConfigured = isMapboxConfigured();

  // Ubicación base estable
  const { baseLocation } = useBaseLocation();

  const { spots, isLoading: isLoadingSpots } = useSpot();
  const { paths: flows, isLoading: isLoadingPaths } = usePath();
  const { startFlow } = useFlow();
  
  // Combinar estados de carga para sugerencias iniciales
  const isLoading = anyLoading(isLoadingSpots, isLoadingPaths);



  const { resolvedQuery, resolvedType } = useMemo(() => {
    const trimmed = searchQuery.trim();
    const lower = trimmed.toLowerCase();
    const prefixes: Array<{ prefix: string; type: 'spots' | 'flows' | 'places' }> = [
      { prefix: 'spot:', type: 'spots' },
      { prefix: 'spots:', type: 'spots' },
      { prefix: 'flow:', type: 'flows' },
      { prefix: 'flows:', type: 'flows' },
      { prefix: 'ruta:', type: 'flows' },
      { prefix: 'lugar:', type: 'places' },
      { prefix: 'lugares:', type: 'places' },
      { prefix: 'direccion:', type: 'places' },
      { prefix: 'address:', type: 'places' },
      { prefix: 'place:', type: 'places' },
    ];

    for (const item of prefixes) {
      if (lower.startsWith(item.prefix)) {
        return {
          resolvedQuery: trimmed.slice(item.prefix.length).trim(),
          resolvedType: item.type,
        };
      }
    }

    return { resolvedQuery: trimmed, resolvedType: searchType };
  }, [searchQuery, searchType]);

  // CANONICAL: Suggested/Nearby spots when input is empty (same layout as results)
  const suggestedSpotsWithDistance = useMemo(() => {
    // Show suggested spots when query is empty (all or spots filter)
    if (resolvedQuery.length > 0 || (resolvedType !== 'all' && resolvedType !== 'spots')) {
      return [];
    }
    
    let suggested: { spot: Spot; distance?: number }[] = [];
    
    if (baseLocation) {
      // Prioritize proximity and variety
      const spotsWithDistance = spots
        .map((spot) => {
          const distance = getSpotDistance(spot, baseLocation);
          return {
            spot,
            distance: distance !== undefined ? distance : Infinity,
          };
        })
        .sort((a, b) => a.distance - b.distance);
      
      // Select varied spots (different types)
      const usedTypes = new Set<SpotType>();
      for (const { spot, distance } of spotsWithDistance) {
        if (suggested.length >= 6) break;
        if (!usedTypes.has(spot.type) || suggested.length < 3) {
          suggested.push({ spot, distance: distance !== Infinity ? distance : undefined });
          usedTypes.add(spot.type);
        }
      }
      
      // If not enough, add more nearby
      if (suggested.length < 6) {
        for (const { spot, distance } of spotsWithDistance) {
          if (suggested.length >= 6) break;
          if (!suggested.find((s) => s.spot.id === spot.id)) {
            suggested.push({ spot, distance: distance !== Infinity ? distance : undefined });
          }
        }
      }
    } else {
      // No location: show varied spots
      const usedTypes = new Set<SpotType>();
      for (const spot of spots) {
        if (suggested.length >= 6) break;
        if (!usedTypes.has(spot.type) || suggested.length < 3) {
          suggested.push({ spot, distance: undefined });
          usedTypes.add(spot.type);
        }
      }
    }
    
    return suggested;
  }, [spots, baseLocation, resolvedQuery, resolvedType]);
  
  const suggestedSpots = useMemo(() => {
    return suggestedSpotsWithDistance.map(item => item.spot);
  }, [suggestedSpotsWithDistance]);
  const suggestedFlows = useMemo(() => {
    if (resolvedQuery.length > 0 || (resolvedType !== 'all' && resolvedType !== 'flows')) {
      return [];
    }
    return flows.slice(0, 6);
  }, [resolvedQuery, resolvedType, flows]);

  // CANONICAL: Search results (only when query has 2+ characters)
  const searchResults = useMemo(() => {
    if (resolvedQuery.length < 2 || resolvedType === 'places') {
      return { spots: [], flows: [] };
    }
    
    const results = searchAll(spots, flows, resolvedQuery, {
      spotLimit: 20,
      flowLimit: 10,
    });

    if (resolvedType === 'spots') {
      results.flows = [];
    }
    if (resolvedType === 'flows') {
      results.spots = [];
    }
    
    // Add distance and sort by relevance + proximity
    if (baseLocation) {
      results.spots = results.spots
        .map((result) => {
          if (result.spot) {
            const distance = getSpotDistance(result.spot, baseLocation);
            return { ...result, distance };
          }
          return result;
        })
        .sort((a, b) => {
          // Prioritize relevance first, then distance as tie-breaker
          if (Math.abs(a.relevanceScore - b.relevanceScore) > 10) {
            return b.relevanceScore - a.relevanceScore;
          }
          const distA = a.distance || Infinity;
          const distB = b.distance || Infinity;
          return distA - distB;
        });
    } else {
      // No location: sort by relevance only
      results.spots.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
    
    return results;
  }, [resolvedQuery, resolvedType, spots, flows, baseLocation]);

  useEffect(() => {
    let isActive = true;
    const shouldGeocode = resolvedType === 'places' || resolvedType === 'all';
    const canGeocode = resolvedQuery.length >= 2 && shouldGeocode;

    if (!canGeocode) {
      setGeocodeResults([]);
      setIsGeocoding(false);
      return;
    }

    setIsGeocoding(true);
    const timeout = setTimeout(async () => {
      const results = await forwardGeocode(resolvedQuery, 6);
      if (!isActive) return;
      setGeocodeResults(results);
      setIsGeocoding(false);
    }, 400);

    return () => {
      isActive = false;
      clearTimeout(timeout);
    };
  }, [resolvedQuery, resolvedType]);

  // CANONICAL: Determine what to show
  const hasQuery = searchQuery.trim().length >= 2;
  const hasResults = searchResults.spots.length > 0 || searchResults.flows.length > 0;
  const showResults = hasQuery && hasResults;
  const showNoResults = hasQuery
    && !hasResults
    && !isGeocoding
    && (resolvedType === 'spots' || resolvedType === 'flows'
      ? true
      : geocodeResults.length === 0 && isMapboxConfigured());
  const showSuggested = !hasQuery && (suggestedSpots.length > 0 || suggestedFlows.length > 0);

  const criticalSpots = useMemo(() => {
    if (showResults) {
      return searchResults.spots
        .map((result) => result.spot)
        .filter((spot): spot is Spot => !!spot)
        .slice(0, 6);
    }
    if (showSuggested) {
      return suggestedSpots.slice(0, 6);
    }
    return [];
  }, [showResults, showSuggested, searchResults.spots, suggestedSpots]);

  useImagePreloader({
    spots: criticalSpots,
    count: 6,
  });


  // Manejar selección de Spot desde resultados o mapa
  const handleSpotPress = (spotOrId: Spot | string) => {
    const spotId = typeof spotOrId === 'string' ? spotOrId : spotOrId.id;
    router.push(`/spot-detail?id=${spotId}`);
  };

  const handleFlowPress = (flowId: string) => {
    startFlow(flowId);
  };

  // CANONICAL: Handle search input
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  // Manejar creación de Spot desde búsqueda
  const handleCreateSpotFromSearch = () => {
    // Usar ubicación base si está disponible, sino usar ubicación por defecto
    const location = baseLocation || {
        latitude: -12.0464,
        longitude: -77.0428,
    };
    router.push(`/create-spot?lat=${location.latitude}&lng=${location.longitude}`);
  };

  const handleSelectGeocode = (result: GeocodeResult) => {
    router.push(`/create-spot?lat=${result.center.latitude}&lng=${result.center.longitude}`);
  };

  const handleAskAi = () => {
    Alert.alert(
      'Sugerencia con IA',
      'La IA solo sugiere opciones. No ejecuta acciones ni crea spots automaticamente.'
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      {/* Contenido */}
      <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          // @ts-ignore - Web-specific CSS properties
          {...(Platform.OS === 'web' && {
            WebkitOverflowScrolling: 'touch',
          })}>
          {/* CANONICAL: Search header with integrated input */}
          <SectionHeader
            variant="search"
            searchValue={searchQuery}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Buscar spots y flows"
            autoFocus={true}
          />

          <View style={styles.typeFilters}>
            {[
              { key: 'all', label: 'Todo' },
              { key: 'spots', label: 'Spots' },
              { key: 'flows', label: 'Flows' },
            ].map((option) => {
              const isActive = resolvedType === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.typeFilterButton,
                    {
                      borderColor: isActive ? colors.tint : colors.icon + '30',
                      backgroundColor: isActive ? colors.tint + '15' : 'transparent',
                    },
                  ]}
                  onPress={() => setSearchType(option.key as 'all' | 'spots' | 'flows' | 'places')}
                  activeOpacity={0.7}>
                  <Text style={[textStyles.caption, { color: isActive ? colors.tint : colors.text }]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          
          {/* CANONICAL: Search results header with count */}
          {showResults && (
            <View style={styles.searchResultsHeader}>
              <Text style={[textStyles.caption, { color: colors.icon, flex: 1, marginRight: spacing.sm }]}>
                {`Resultados para "${resolvedQuery}"`}
              </Text>
              <View style={[styles.resultsBadge, { backgroundColor: colors.tint + '20' }]}>
                <Text style={[textStyles.caption, { color: colors.tint, fontFamily: fontFamilyMedium }]}>
                  {searchResults.spots.length + searchResults.flows.length} {searchResults.spots.length + searchResults.flows.length === 1 ? 'resultado' : 'resultados'}
                </Text>
              </View>
            </View>
          )}

          {/* CANONICAL: Search Results */}
          {showResults && (
            <>
              {/* Spots - 2-column grid */}
              {searchResults.spots.length > 0 && (
                <View style={styles.section}>
                  <SectionHeader title="Spots" variant="large" />
                  <SpotGrid
                    spots={searchResults.spots
                      .filter((result) => result.spot)
                      .map((result) => ({
                        spot: result.spot!,
                        distance: result.distance,
                      }))}
                    onSpotPress={handleSpotPress}
                  />
                </View>
              )}

              {/* Flows - Single column list */}
              {searchResults.flows.length > 0 && (
                <View style={styles.section}>
                  <SectionHeader title="Flows" variant="large" />
                  <View style={styles.pathsList}>
                    {searchResults.flows.map((result) => {
                      if (!result.flow) return null;
                      const flowSpots = result.flow.spots
                        .map((spotId) => spots.find((s) => s.id === spotId))
                        .filter((s): s is Spot => s !== undefined);
                      const distance = flowSpots.length > 0
                        ? getSpotDistance(flowSpots[0], baseLocation)
                        : undefined;
                      return (
                        <FlowCard.Display
                          key={`flow-${result.flow.id}`}
                          flow={result.flow}
                          spots={spots}
                          distance={distance}
                          onPress={() => handleFlowPress(result.flow!.id)}
                        />
                      );
                    })}
                  </View>
                </View>
              )}

              {/* CANONICAL: Add New Spot - Secondary button after results */}
              <View style={styles.addSpotContainer}>
                <TouchableOpacity
                  style={[styles.addSpotButton, { borderColor: colors.icon + '30' }]}
                  onPress={handleCreateSpotFromSearch}
                  activeOpacity={0.7}>
                  <View style={styles.addSpotButtonContent}>
                    <Icon name="add-location" size={18} color={colors.text} />
                    <Text style={[textStyles.bodyMedium, { color: colors.text, marginLeft: spacing.xs }]}>Agregar nuevo spot</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </>
          )}
          {/* Suggested content */}
          {!hasQuery && (
            <>
              {suggestedSpots.length > 0 && (
                <View style={styles.section}>
                  <SectionHeader title="Spots sugeridos" variant="large" />
                  <SpotGrid
                    spots={suggestedSpotsWithDistance.map((item) => ({
                      spot: item.spot,
                      distance: item.distance,
                    }))}
                    onSpotPress={handleSpotPress}
                  />
                </View>
              )}
              {suggestedFlows.length > 0 && (
                <View style={styles.section}>
                  <SectionHeader title="Flows sugeridos" variant="large" />
                  <View style={styles.pathsList}>
                    {suggestedFlows.map((flow) => {
                      const flowSpots = flow.spots
                        .map((spotId) => spots.find((s) => s.id === spotId))
                        .filter((s): s is Spot => s !== undefined);
                      const distance = flowSpots.length > 0
                        ? getSpotDistance(flowSpots[0], baseLocation)
                        : undefined;
                      return (
                        <FlowCard.Display
                          key={`suggested-flow-${flow.id}`}
                          flow={flow}
                          spots={spots}
                          distance={distance}
                          onPress={() => handleFlowPress(flow.id)}
                        />
                      );
                    })}
                  </View>
                </View>
              )}
            </>
          )}

          {/* CANONICAL: Geocoding results */}
          {hasQuery && (resolvedType === 'places' || resolvedType === 'all') && (
            <View style={styles.section}>
              <SectionHeader title="Lugares" variant="large" />
              {!isMapboxConfigured() && (
                <Text style={[textStyles.body, { color: colors.icon, paddingHorizontal: spacing.md }]}>
                  Geocoding no configurado. Agrega EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN.
                </Text>
              )}
              {isGeocoding && (
                <Text style={[textStyles.body, { color: colors.icon, paddingHorizontal: spacing.md }]}>
                  Buscando lugares...
                </Text>
              )}
              {!isGeocoding && geocodeResults.length === 0 && (
                <Text style={[textStyles.body, { color: colors.icon, paddingHorizontal: spacing.md }]}>
                  No se encontraron lugares con ese texto.
                </Text>
              )}
              {geocodeResults.map((result) => (
                <TouchableOpacity
                  key={result.id}
                  style={[styles.geocodeItem, { borderColor: colors.icon + '20' }]}
                  onPress={() => handleSelectGeocode(result)}
                  activeOpacity={0.7}>
                  <View style={styles.geocodeItemText}>
                    <Text style={[textStyles.bodyMedium, { color: colors.text }]} numberOfLines={1}>
                      {result.name}
                    </Text>
                    <Text style={[textStyles.caption, { color: colors.icon }]} numberOfLines={1}>
                      {result.description}
                    </Text>
                  </View>
                  <Text style={[textStyles.caption, { color: colors.tint }]}>Crear spot</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* CTA IA (solo sugerencias, no ejecuta) */}
          {hasQuery && (
            <View style={styles.aiCtaContainer}>
              <TouchableOpacity
                style={[styles.aiCtaButton, { borderColor: colors.tint }]}
                onPress={handleAskAi}
                activeOpacity={0.7}>
                <Icon name="gems" size={18} color={colors.tint} />
                <Text style={[textStyles.bodyMedium, { color: colors.tint, marginLeft: spacing.xs }]}>
                  Pedir sugerencia a IA
                </Text>
              </TouchableOpacity>
              <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs }]}>
                La IA solo sugiere. No ejecuta acciones ni crea spots.
              </Text>
            </View>
          )}

          {/* CANONICAL: No results */}
          {showNoResults && (
            <View style={styles.noResultsContainer}>
              <Icon name="search" size={48} color={colors.icon + '60'} />
              <Text style={[textStyles.heading3, { color: colors.text, marginTop: spacing.md, marginBottom: spacing.xs }]}>
                No se encontraron resultados
              </Text>
              <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.lg, textAlign: 'center' }]}>
                Ningún spot o flow coincide con &quot;{resolvedQuery}&quot;
              </Text>
              <TouchableOpacity
                style={[styles.addSpotButton, { borderColor: colors.icon + '30', marginTop: spacing.md }]}
                onPress={handleCreateSpotFromSearch}
                activeOpacity={0.7}>
                <View style={styles.addSpotButtonContent}>
                  <Icon name="add-location" size={18} color={colors.text} />
                  <Text style={[textStyles.bodyMedium, { color: colors.text, marginLeft: spacing.xs }]}>Agregar nuevo spot</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* CANONICAL: Suggested/Nearby spots when input is empty (same layout as results) */}
          {showSuggested && (
            <View style={styles.section}>
              {shouldShowSkeleton(isLoading, suggestedSpots.length > 0) ? (
                <SkeletonList
                  count={6}
                  layout="grid"
                  variant="card"
                  cardProps={{ size: 'small' }}
                  style={styles.gridContent}
                />
              ) : (
                <SpotGrid
                  spots={suggestedSpotsWithDistance}
                  onSpotPress={handleSpotPress}
                />
              )}
            </View>
          )}

          {/* CANONICAL: Add New Spot - Secondary button after suggested content */}
          {showSuggested && (
            <View style={styles.addSpotContainer}>
              <TouchableOpacity
                style={[styles.addSpotButton, { borderColor: colors.icon + '30' }]}
                onPress={handleCreateSpotFromSearch}
                activeOpacity={0.7}>
                <View style={styles.addSpotButtonContent}>
                  <Icon name="add-location" size={18} color={colors.text} />
                  <Text style={[textStyles.bodyMedium, { color: colors.text, marginLeft: spacing.xs }]}>Agregar nuevo spot</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing['2xl'],
  },
  searchResultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  resultsBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
  },
  section: {
    marginBottom: spacing.xl,
  },
  gridContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  gridRow: {
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  gridItem: {
    flex: 1,
    minWidth: 0,
    maxWidth: '50%',
  },
  pathsList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  typeFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  typeFilterButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
  },
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    minHeight: 300,
  },
  addSpotContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  addSpotButton: {
    width: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  addSpotButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  geocodeItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  geocodeItemText: {
    flex: 1,
    minWidth: 0,
  },
  aiCtaContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  aiCtaButton: {
    width: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
});
