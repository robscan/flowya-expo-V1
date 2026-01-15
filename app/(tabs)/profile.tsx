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

import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Icon, iconTouchableContainer } from '@/components/ui/Icon';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { useAuth } from '@/contexts/AuthContext';
import { useOverlay } from '@/contexts/OverlayContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { showAlert } from '@/utils/alertPolyfill';
import { isAdminUser } from '@/utils/permissions';
import { fetchUserContributions } from '@/utils/spotContributionsService';
import { getTrustPermissions, getTrustTier, getTrustTierLabel } from '@/utils/trustScore';
import type { SpotContributionRecord } from '@/types/spotContributions';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, isAuthenticated, signOut } = useAuth();
  const isAdmin = isAdminUser(user);
  const { setIsTabBarVisible } = useOverlay();
  const [contributions, setContributions] = useState<SpotContributionRecord[]>([]);
  const [isLoadingContributions, setIsLoadingContributions] = useState(false);
  const [contributionsError, setContributionsError] = useState<string | null>(null);
  const [selectedContribution, setSelectedContribution] = useState<SpotContributionRecord | null>(null);

  // CANONICAL: Hide BottomTabBar for Profile
  useEffect(() => {
    setIsTabBarVisible(false);
    return () => {
      setIsTabBarVisible(true);
    };
  }, [setIsTabBarVisible]);

  // Navegaci?n hacia atr?s
  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const handleLogout = () => {
    showAlert(
      'Cerrar Sesi?n',
      '?Est?s seguro de que quieres cerrar sesi?n?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesi?n',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(tabs)/home');
            } catch (error) {
              showAlert('Error', 'No se pudo cerrar sesi?n. Revisa la consola para m?s detalles.');
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

  const handleAdminAccess = () => {
    router.push('/admin');
  };

  const contributionCounts = useMemo(() => {
    const pending = contributions.filter((c) => c.status === 'pending').length;
    const applied = contributions.filter((c) => c.status === 'applied').length;
    const rejected = contributions.filter((c) => c.status === 'rejected').length;
    return { pending, applied, rejected };
  }, [contributions]);

  const trustTier = useMemo(() => getTrustTier(contributions, isAuthenticated), [contributions, isAuthenticated]);
  const trustPermissions = useMemo(
    () => getTrustPermissions(trustTier, isAuthenticated),
    [trustTier, isAuthenticated]
  );

  const recentContributions = useMemo(() => contributions.slice(0, 5), [contributions]);

  useEffect(() => {
    const loadContributions = async () => {
      if (!isAuthenticated || !user?.id) {
        setContributions([]);
        return;
      }
      setIsLoadingContributions(true);
      setContributionsError(null);
      const result = await fetchUserContributions(user.id);
      if (result.error) {
        setContributionsError(result.error);
        setContributions([]);
      } else {
        setContributions(result.data);
      }
      setIsLoadingContributions(false);
    };

    loadContributions();
  }, [isAuthenticated, user?.id]);

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
          <Text style={[textStyles.heading3, { color: colors.text }]}>Perfil</Text>
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
                  : 'Invitado'}
              </Text>
              <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs / 2 }]}>
                {isAuthenticated && user
                  ? user.email || 'usuario@ejemplo.com'
                  : 'Inicia sesi?n para acceder a tu cuenta'}
              </Text>
            </View>
          </View>
        </View>

        {/* Trust & Permissions */}
        <View style={styles.section}>
          <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.md, textTransform: 'uppercase' }]}>
            CONFIANZA
          </Text>
          <View style={styles.listItem}>
            <View style={styles.listItemContent}>
              <Text style={[textStyles.bodyMedium, { color: colors.text }]}>
                Nivel: {getTrustTierLabel(trustTier)}
              </Text>
              <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs / 2 }]}>
                Se calcula internamente segun aportes aplicados.
              </Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.icon + '20' }]} />
          <View style={styles.listItem}>
            <View style={styles.listItemContent}>
              <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Permisos activos</Text>
              <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs / 2 }]}>
                Crear spots: {trustPermissions.canCreateSpots ? 'Disponible' : 'Aun no disponible'}
              </Text>
              <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs / 2 }]}>
                Sugerir ediciones: {trustPermissions.canSuggestEdits ? 'Disponible' : 'No disponible'}
              </Text>
              <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs / 2 }]}>
                Reportar contenido: {trustPermissions.canReport ? 'Disponible' : 'No disponible'}
              </Text>
            </View>
          </View>
        </View>

        {/* Login/Signup Section - Simple list items, no cards */}
        {!isAuthenticated && (
          <View style={styles.section}>
            <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.md, textTransform: 'uppercase' }]}>
              CUENTA
            </Text>
            <TouchableOpacity
              style={styles.listItem}
              onPress={handleLogin}
              activeOpacity={0.7}>
              <View style={styles.listItemContent}>
                <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Iniciar sesi?n</Text>
                <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs / 2 }]}>
                  Accede a tu cuenta
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
                <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Crear cuenta</Text>
                <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs / 2 }]}>
                  Crea una cuenta para comenzar
                </Text>
              </View>
              <Icon name="next" size={20} color={colors.icon} />
            </TouchableOpacity>
          </View>
        )}

        {/* ACCOUNT Section - Simple list item */}
        {isAuthenticated && (
          <View style={styles.section}>
            <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.md, textTransform: 'uppercase' }]}>
              CUENTA
            </Text>
            <TouchableOpacity
              style={styles.listItem}
              onPress={handleLogout}
              activeOpacity={0.7}>
              <View style={styles.listItemContent}>
                <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Cerrar sesi?n</Text>
                <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs / 2 }]}>
                  Cierra sesi?n de tu cuenta
                </Text>
              </View>
              <Icon name="next" size={20} color={colors.icon} />
            </TouchableOpacity>
          </View>
        )}

        {isAuthenticated && isAdmin && (
          <View style={styles.section}>
            <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.md, textTransform: 'uppercase' }]}>
              ADMIN
            </Text>
            <TouchableOpacity
              style={styles.listItem}
              onPress={handleAdminAccess}
              activeOpacity={0.7}>
              <View style={styles.listItemContent}>
                <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Admin Panel</Text>
                <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs / 2 }]}>
                  Acceso administrativo
                </Text>
              </View>
              <Icon name="next" size={20} color={colors.icon} />
            </TouchableOpacity>
          </View>
        )}

        {isAuthenticated && (
          <View style={styles.section}>
            <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.md, textTransform: 'uppercase' }]}>
              CONTRIBUTIONS
            </Text>
            {isLoadingContributions ? (
              <Text style={[textStyles.body, { color: colors.icon }]}>Cargando contributions?</Text>
            ) : contributionsError ? (
              <Text style={[textStyles.body, { color: colors.error || '#FF3B30' }]}>
                {contributionsError}
              </Text>
            ) : (
              <View style={styles.contributionsRow}>
                <View style={styles.contributionPill}>
                  <Text style={[textStyles.caption, { color: colors.icon }]}>Pendientes</Text>
                  <Text style={[textStyles.heading4, { color: colors.text }]}>{contributionCounts.pending}</Text>
                </View>
                <View style={styles.contributionPill}>
                  <Text style={[textStyles.caption, { color: colors.icon }]}>Aplicadas</Text>
                  <Text style={[textStyles.heading4, { color: colors.text }]}>{contributionCounts.applied}</Text>
                </View>
                <View style={styles.contributionPill}>
                  <Text style={[textStyles.caption, { color: colors.icon }]}>Rechazadas</Text>
                  <Text style={[textStyles.heading4, { color: colors.text }]}>{contributionCounts.rejected}</Text>
                </View>
              </View>
            )}
            {!isLoadingContributions && !contributionsError && recentContributions.length > 0 ? (
              <View style={styles.contributionList}>
                <Text style={[textStyles.caption, { color: colors.icon }]}>Recientes</Text>
                {recentContributions.map((contribution) => (
                  <TouchableOpacity
                    key={contribution.id}
                    style={styles.contributionRow}
                    onPress={() => setSelectedContribution(contribution)}
                    activeOpacity={0.7}>
                    <Text style={[textStyles.bodyMedium, { color: colors.text }]}>
                      {contribution.status.toUpperCase()}
                    </Text>
                    <Text style={[textStyles.caption, { color: colors.icon }]}>
                      {contribution.spot_id || 'Nuevo spot'} ? {new Date(contribution.created_at).toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={!!selectedContribution}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedContribution(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[textStyles.heading4, { color: colors.text }]}>Contribution</Text>
            {selectedContribution ? (
              <>
                <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.sm }]}>
                  {selectedContribution.status.toUpperCase()} ? {new Date(selectedContribution.created_at).toLocaleString()}
                </Text>
                <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.sm }]}>
                  {selectedContribution.spot_id || 'Nuevo spot'}
                </Text>
                <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.sm }]}>
                  {JSON.stringify(selectedContribution.payload)}
                </Text>
              </>
            ) : null}
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.icon + '20' }]}
              onPress={() => setSelectedContribution(null)}
              activeOpacity={0.7}>
              <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  contributionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  contributionPill: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.04)',
    alignItems: 'center',
  },
  contributionList: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  contributionRow: {
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    borderRadius: 16,
    padding: spacing.lg,
  },
  modalButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    alignItems: 'center',
  },
});
