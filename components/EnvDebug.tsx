/**
 * EnvDebug Component
 * TEMPORAL: Componente de debug para verificar variables de entorno en producción
 * 
 * Este componente muestra las variables de entorno en la UI para diagnóstico.
 * ELIMINAR después de resolver el problema.
 */

import { StyleSheet, Text, View, ScrollView } from 'react-native';
import Constants from 'expo-constants';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

export function EnvDebug() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Leer variables de entorno de múltiples fuentes
  const envVars = {
    // process.env (runtime)
    processEnv: {
      MAPBOX: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN,
      SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      SUPABASE_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      OPENAI: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
    },
    // Constants.expoConfig.extra (build time)
    constantsExtra: {
      MAPBOX: Constants.expoConfig?.extra?.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN,
      SUPABASE_URL: Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL,
      SUPABASE_KEY: Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      OPENAI: Constants.expoConfig?.extra?.EXPO_PUBLIC_OPENAI_API_KEY,
    },
    // Constants.manifest (legacy)
    manifest: {
      MAPBOX: Constants.manifest?.extra?.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN,
      SUPABASE_URL: Constants.manifest?.extra?.EXPO_PUBLIC_SUPABASE_URL,
      SUPABASE_KEY: Constants.manifest?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      OPENAI: Constants.manifest?.extra?.EXPO_PUBLIC_OPENAI_API_KEY,
    },
  };

  const formatValue = (value: string | undefined): string => {
    if (!value) return '❌ undefined';
    if (value.length > 20) return `✅ ${value.substring(0, 20)}... (${value.length} chars)`;
    return `✅ ${value}`;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[textStyles.heading2, { color: colors.text, marginBottom: spacing.md }]}>
          🔍 Debug: Variables de Entorno
        </Text>

        <View style={styles.section}>
          <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.sm }]}>
            process.env (Runtime)
          </Text>
          <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.xs }]}>
            MAPBOX: {formatValue(envVars.processEnv.MAPBOX)}
          </Text>
          <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.xs }]}>
            SUPABASE_URL: {formatValue(envVars.processEnv.SUPABASE_URL)}
          </Text>
          <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.xs }]}>
            SUPABASE_KEY: {formatValue(envVars.processEnv.SUPABASE_KEY)}
          </Text>
          <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.xs }]}>
            OPENAI: {formatValue(envVars.processEnv.OPENAI)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.sm }]}>
            Constants.expoConfig.extra (Build Time)
          </Text>
          <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.xs }]}>
            MAPBOX: {formatValue(envVars.constantsExtra.MAPBOX)}
          </Text>
          <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.xs }]}>
            SUPABASE_URL: {formatValue(envVars.constantsExtra.SUPABASE_URL)}
          </Text>
          <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.xs }]}>
            SUPABASE_KEY: {formatValue(envVars.constantsExtra.SUPABASE_KEY)}
          </Text>
          <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.xs }]}>
            OPENAI: {formatValue(envVars.constantsExtra.OPENAI)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.sm }]}>
            Platform Info
          </Text>
          <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.xs }]}>
            Platform: {require('react-native').Platform.OS}
          </Text>
          <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.xs }]}>
            __DEV__: {__DEV__ ? 'true' : 'false'}
          </Text>
          <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.xs }]}>
            Constants.expoConfig exists: {Constants.expoConfig ? 'true' : 'false'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
});
