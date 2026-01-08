/**
 * Profile Screen - Configuration Screen
 * CANONICAL: Profile is a configuration screen, not a content or exploration surface
 * 
 * Rules:
 * - No BottomTabBar
 * - Stack navigation (push)
 * - Simple header with back action
 * - Vertical list layout, single column
 * - No cards, hero images, map, media
 * - Use existing Design System components only
 * - No auto-save, toasts, modals, experimental UI
 */

import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Colors } from '@/constants/theme';
import { spacing } from '@/constants/spacing';
import { textStyles } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Icon } from '@/components/ui/Icon';
import { iconTouchableContainer } from '@/components/ui/Icon';
import { SettingsToggle } from '@/components/SettingsToggle';
import { clearAllStorage } from '@/utils/clearStorage';
import { useAuth } from '@/contexts/AuthContext';
import { useOverlay } from '@/contexts/OverlayContext';

const PREFERENCES_KEY = '@flowya_preferences';

interface UserPreferences {
  narrationEnabled: boolean;
  locationEnabled: boolean;
  notificationsEnabled: boolean;
}

const defaultPreferences: UserPreferences = {
  narrationEnabled: true,
  locationEnabled: true,
  notificationsEnabled: true,
};

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, isAuthenticated, signOut } = useAuth();
  const { setIsTabBarVisible } = useOverlay();
  
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

  // CANONICAL: Hide BottomTabBar for Profile
  useEffect(() => {
    setIsTabBarVisible(false);
    return () => {
      setIsTabBarVisible(true);
    };
  }, [setIsTabBarVisible]);

  // Cargar preferencias
  useEffect(() => {
    loadPreferences();
  }, []);

  // Guardar preferencias
  useEffect(() => {
    if (preferences) {
      savePreferences(preferences);
      // Aplicar preferencias
      if (preferences.narrationEnabled !== undefined) {
        // La narration se maneja a través del contexto
        // Aquí solo guardamos la preferencia
      }
    }
  }, [preferences]);

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem(PREFERENCES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const savePreferences = async (prefs: UserPreferences) => {
    try {
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const handlePreferenceChange = (key: keyof UserPreferences, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  // Navegación hacia atrás
  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };


  const handleClearStorage = () => {
    Alert.alert(
      'Limpiar todos los datos',
      '¿Estás seguro de que quieres eliminar todos los datos guardados?\n\nEsto incluye:\n• Todos los lugares creados\n• Todos los flows guardados\n• Tus lugares y flows favoritos\n• Historial de actividad\n\nEsta acción no se puede deshacer. La app se recargará después de limpiar los datos.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Limpiar todo',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllStorage();
              Alert.alert('Data cleared', 'All data deleted. App will reload.');
              // Recargar la app
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            } catch (error) {
              Alert.alert('Error', 'Couldn\'t clear data. Try again.');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(tabs)/home');
            } catch (error) {
                  Alert.alert('Error', 'Couldn\'t sign out. Check console for details.');
            }
          },
        },
      ]
    );
  };

  const handleLogin = () => {
    router.push('/(tabs)/login');
  };

  const handleSignup = () => {
    router.push('/(tabs)/signup');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* CANONICAL: Simple header with back action, no sticky behavior */}
      <View
        style={[
          styles.header,
          {
            borderBottomColor:
              colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
        ]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={handleBackPress}
            style={iconTouchableContainer.base}
            activeOpacity={0.7}>
            <Icon name="back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[textStyles.heading3, { color: colors.text }]}>Profile</Text>
          <View style={iconTouchableContainer.base} />
        </View>
      </View>

      {/* CANONICAL: Vertical list layout, single column, no cards */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>

        {/* User Info - Simple row, no card */}
        <View style={styles.section}>
          <View style={styles.userRow}>
            <View style={[styles.avatar, { backgroundColor: colors.tint + '40' }]}>
              <Icon name="profile" size={32} color={colors.tint} />
            </View>
            <View style={styles.userInfo}>
              <Text style={[textStyles.heading4, { color: colors.text }]}>
                {isAuthenticated && user
                  ? user.email?.split('@')[0] || 'Usuario'
                  : 'Guest'}
              </Text>
              <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs / 2 }]}>
                {isAuthenticated && user
                  ? user.email || 'usuario@ejemplo.com'
                  : 'Sign in to save preferences'}
              </Text>
            </View>
          </View>
        </View>

        {/* Login/Signup Section - Simple list items, no cards */}
        {!isAuthenticated && (
          <View style={styles.section}>
            <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.md, textTransform: 'uppercase' }]}>
              ACCOUNT
            </Text>
            <TouchableOpacity
              style={styles.listItem}
              onPress={handleLogin}
              activeOpacity={0.7}>
              <View style={styles.listItemContent}>
                <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Sign in</Text>
                <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs / 2 }]}>
                  Access your account
                </Text>
              </View>
              <Icon name="next" size={20} color={colors.icon} />
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: colors.icon + '20' }]} />
            <TouchableOpacity
              style={styles.listItem}
              onPress={handleSignup}
              activeOpacity={0.7}>
              <View style={styles.listItemContent}>
                <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Create account</Text>
                <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs / 2 }]}>
                  Create an account to start
                </Text>
              </View>
              <Icon name="next" size={20} color={colors.icon} />
            </TouchableOpacity>
          </View>
        )}

        {/* GENERAL Section - Simple list, no cards */}
        <View style={styles.section}>
          <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.md, textTransform: 'uppercase' }]}>
            General
          </Text>
          <SettingsToggle
            label="Narration"
            value={preferences.narrationEnabled}
            onValueChange={(value) => handlePreferenceChange('narrationEnabled', value)}
            description="Audio narrations during flow"
          />
          <View style={[styles.divider, { backgroundColor: colors.icon + '20' }]} />
          <SettingsToggle
            label="Location"
            value={preferences.locationEnabled}
            onValueChange={(value) => handlePreferenceChange('locationEnabled', value)}
            description="Use location for nearby places"
          />
          <View style={[styles.divider, { backgroundColor: colors.icon + '20' }]} />
          <SettingsToggle
            label="Notifications"
            value={preferences.notificationsEnabled}
            onValueChange={(value) => handlePreferenceChange('notificationsEnabled', value)}
            description="Notifications about new places and flows"
          />
        </View>

        {/* My Content Section - Simple list item */}
        <View style={styles.section}>
          <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.md, textTransform: 'uppercase' }]}>
            My content
          </Text>
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => router.push('/liked-spots')}
            activeOpacity={0.7}>
            <View style={styles.listItemContent}>
              <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Liked places</Text>
              <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs / 2 }]}>
                Places you liked while moving
              </Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.icon} />
          </TouchableOpacity>
        </View>

        {/* ACCOUNT Section - Simple list item */}
        {isAuthenticated && (
          <View style={styles.section}>
            <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.md, textTransform: 'uppercase' }]}>
              ACCOUNT
            </Text>
            <TouchableOpacity
              style={styles.listItem}
              onPress={handleLogout}
              activeOpacity={0.7}>
              <View style={styles.listItemContent}>
                <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Sign out</Text>
                <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs / 2 }]}>
                  Sign out of your account
                </Text>
              </View>
              <Icon name="next" size={20} color={colors.icon} />
            </TouchableOpacity>
          </View>
        )}

        {/* DATA & PERMISSIONS Section - Simple list item */}
        <View style={styles.section}>
          <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.md, textTransform: 'uppercase' }]}>
            DATA & PERMISSIONS
          </Text>
          <TouchableOpacity
            style={styles.listItem}
            onPress={handleClearStorage}
            activeOpacity={0.7}>
            <View style={styles.listItemContent}>
              <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Clear all data</Text>
              <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs / 2 }]}>
                Delete spots, flows and saved data
              </Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.icon} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  listItemContent: {
    flex: 1,
    marginRight: spacing.md,
  },
});
