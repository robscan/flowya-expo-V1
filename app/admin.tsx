import { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { GlassView } from '@/components/ui/GlassView';
import { Icon, iconTouchableContainer } from '@/components/ui/Icon';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { isAdminUser } from '@/utils/permissions';
import {
  applyContribution,
  fetchAdminAuditLog,
  fetchContributionCountByStatus,
  fetchContributionTimings,
  fetchRecentContributionsForUsers,
  fetchPendingContributions,
  fetchRecentReports,
  fetchUserRole,
  fetchUserRoles,
  fetchSpotById,
  fetchSpotVersionsForSpot,
  fetchContributionsBySpot,
  fetchReportsBySpot,
  fetchMediaBySpot,
  fetchNeedsReviewCount,
  fetchSoftHiddenMediaCount,
  markSpotNeedsReview,
  rejectContribution,
  rollbackSpotToVersion,
  setMediaSoftHidden,
  updateContributionPayload,
  upsertUserRole,
} from '@/utils/adminModerationService';
import { fetchAiCoverageSessions } from '@/utils/aiCoverageService';
import type {
  SpotContributionRecord,
  SpotMediaPublicRecord,
  SpotReportRecord,
  SpotVersionRecord,
} from '@/types/spotContributions';
import type { Spot } from '@/data/spots';
import type { AdminAuditRecord } from '@/types/adminAudit';

type SpotDiffItem = {
  label: string;
  before: string;
  after: string;
};

type UserContributionSummary = {
  authorId: string;
  pending: number;
  applied: number;
  rejected: number;
  total: number;
};

type AdminRole = 'admin' | 'curator' | 'support' | 'analyst';

const formatDiffValue = (value: unknown): string => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string') return value.trim() || '—';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return '—';
  }
};

const buildSpotDiffs = (current: Spot, snapshot?: Record<string, unknown>): SpotDiffItem[] => {
  if (!snapshot) return [];
  const diffs: SpotDiffItem[] = [];
  const addDiff = (label: string, before: unknown, after: unknown) => {
    if (after === undefined) return;
    const beforeText = formatDiffValue(before);
    const afterText = formatDiffValue(after);
    if (beforeText !== afterText) {
      diffs.push({ label, before: beforeText, after: afterText });
    }
  };

  const snapshotLocation = (snapshot.location || {}) as {
    lat?: number;
    lng?: number;
    city?: string;
    country?: string;
  };
  const snapshotImage = (snapshot.image || {}) as { url?: string };
  const snapshotHasGenerated =
    (snapshot.has_generated_content as boolean | undefined) ?? (snapshot.hasGeneratedContent as boolean | undefined);

  addDiff('Nombre', current.name, snapshot.name);
  addDiff('Tipo', current.type, snapshot.type);
  addDiff('Descripción', current.shortDescription || '', snapshot.short_description);
  addDiff('Latitud', current.location.lat, snapshotLocation.lat);
  addDiff('Longitud', current.location.lng, snapshotLocation.lng);
  addDiff('Ciudad', current.location.city || '', snapshotLocation.city);
  addDiff('País', current.location.country || '', snapshotLocation.country);
  addDiff('Imagen', current.image?.url, snapshotImage.url);
  addDiff('AI generado', current.hasGeneratedContent, snapshotHasGenerated);

  return diffs;
};

export default function AdminScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isLoading, isAuthenticated, user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [contributions, setContributions] = useState<SpotContributionRecord[]>([]);
  const [reports, setReports] = useState<SpotReportRecord[]>([]);
  const [versionsBySpot, setVersionsBySpot] = useState<Record<string, SpotVersionRecord[]>>({});
  const [expandedSpotId, setExpandedSpotId] = useState<string | null>(null);
  const [expandedVersionId, setExpandedVersionId] = useState<string | null>(null);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [spotContributions, setSpotContributions] = useState<SpotContributionRecord[]>([]);
  const [spotReports, setSpotReports] = useState<SpotReportRecord[]>([]);
  const [spotMedia, setSpotMedia] = useState<SpotMediaPublicRecord[]>([]);
  const [isLoadingSpot, setIsLoadingSpot] = useState(false);
  const [detailFilter, setDetailFilter] = useState<'all' | 'contributions' | 'reports' | 'media'>('all');
  const [auditLog, setAuditLog] = useState<AdminAuditRecord[]>([]);
  const [auditFilter, setAuditFilter] = useState<'all' | 'spot' | 'spot_contribution' | 'spot_media_public'>('all');
  const [auditActionFilter, setAuditActionFilter] = useState<string>('all');
  const [softHiddenCount, setSoftHiddenCount] = useState(0);
  const [needsReviewCount, setNeedsReviewCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [appliedCount, setAppliedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [avgApplyHours, setAvgApplyHours] = useState(0);
  const [avgRejectHours, setAvgRejectHours] = useState(0);
  const [auditTimeFilter, setAuditTimeFilter] = useState<'all' | '24h' | '7d'>('all');
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [pendingRejectId, setPendingRejectId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userContributionSummary, setUserContributionSummary] = useState<UserContributionSummary[]>([]);
  const [editContributionId, setEditContributionId] = useState<string | null>(null);
  const [editContributionPayload, setEditContributionPayload] = useState<string>('');
  const [editContributionError, setEditContributionError] = useState<string | null>(null);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(false);
  const [rolesList, setRolesList] = useState<Array<{ user_id: string; role: string; updated_at: string }>>([]);
  const [roleUserIdInput, setRoleUserIdInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<AdminRole>('curator');
  const [roleError, setRoleError] = useState<string | null>(null);
  const [aiCoverageSessions, setAiCoverageSessions] = useState<Array<{
    id: string;
    status: string;
    source?: string | null;
    reason?: string | null;
    created_at: string;
    generated_count?: number;
    bbox?: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
  }>>([]);

  const canAccess =
    isAuthenticated && (isAdminUser(user) || adminRole === 'admin' || adminRole === 'curator' || adminRole === 'support' || adminRole === 'analyst');
  const canModerateContributions = isAdminUser(user) || adminRole === 'admin' || adminRole === 'curator';
  const canModerateReports = isAdminUser(user) || adminRole === 'admin' || adminRole === 'curator' || adminRole === 'support';
  const canEditPayload = isAdminUser(user) || adminRole === 'admin' || adminRole === 'curator';
  const canRollback = isAdminUser(user) || adminRole === 'admin';
  const canManageRoles = isAdminUser(user) || adminRole === 'admin';

  const refreshData = async () => {
    if (!canAccess) return;
    setIsRefreshing(true);
    setErrorMessage(null);
    const [
      contribResult,
      reportsResult,
      auditResult,
      softHiddenResult,
      needsReviewResult,
      pendingResult,
      appliedResult,
      rejectedResult,
      timingsResult,
      usersResult,
      rolesResult,
      aiCoverageResult,
    ] = await Promise.all([
      fetchPendingContributions(),
      fetchRecentReports(),
      fetchAdminAuditLog(),
      fetchSoftHiddenMediaCount(),
      fetchNeedsReviewCount(),
      fetchContributionCountByStatus('pending'),
      fetchContributionCountByStatus('applied'),
      fetchContributionCountByStatus('rejected'),
      fetchContributionTimings(),
      fetchRecentContributionsForUsers(),
      fetchUserRoles(),
      fetchAiCoverageSessions({ limit: 20 }),
    ]);

    if (contribResult.error) {
      setErrorMessage(contribResult.error);
    }
    if (reportsResult.error) {
      setErrorMessage(reportsResult.error);
    }
    if (auditResult.error) {
      setErrorMessage(auditResult.error);
    }
    if (softHiddenResult.error) {
      setErrorMessage(softHiddenResult.error);
    }
    if (needsReviewResult.error) {
      setErrorMessage(needsReviewResult.error);
    }
    if (pendingResult.error) {
      setErrorMessage(pendingResult.error);
    }
    if (appliedResult.error) {
      setErrorMessage(appliedResult.error);
    }
    if (rejectedResult.error) {
      setErrorMessage(rejectedResult.error);
    }
    if (timingsResult.error) {
      setErrorMessage(timingsResult.error);
    }
    if (usersResult.error) {
      setErrorMessage(usersResult.error);
    }
    if (rolesResult.error) {
      setErrorMessage(rolesResult.error);
    }
    if (aiCoverageResult.error) {
      setErrorMessage(aiCoverageResult.error);
    }

    setContributions(contribResult.data);
    setReports(reportsResult.data);
    setAuditLog(auditResult.data);
    setSoftHiddenCount(softHiddenResult.count);
    setNeedsReviewCount(needsReviewResult.count);
    setPendingCount(pendingResult.count);
    setAppliedCount(appliedResult.count);
    setRejectedCount(rejectedResult.count);
    if (!timingsResult.error) {
      const applied = timingsResult.data
        .filter((c) => c.status === 'applied' && c.applied_at)
        .map((c) => (new Date(c.applied_at as string).getTime() - new Date(c.created_at).getTime()) / 3600000);
      const rejected = timingsResult.data
        .filter((c) => c.status === 'rejected' && c.rejected_at)
        .map((c) => (new Date(c.rejected_at as string).getTime() - new Date(c.created_at).getTime()) / 3600000);
      const appliedAvg = applied.length > 0 ? applied.reduce((a, b) => a + b, 0) / applied.length : 0;
      const rejectedAvg = rejected.length > 0 ? rejected.reduce((a, b) => a + b, 0) / rejected.length : 0;
      setAvgApplyHours(appliedAvg);
      setAvgRejectHours(rejectedAvg);
    }
    if (!usersResult.error) {
      const summaryMap = new Map<string, UserContributionSummary>();
      usersResult.data.forEach((entry) => {
        const authorId = entry.author_id || 'unknown';
        const existing = summaryMap.get(authorId) || {
          authorId,
          pending: 0,
          applied: 0,
          rejected: 0,
          total: 0,
        };
        existing.total += 1;
        if (entry.status === 'pending') existing.pending += 1;
        if (entry.status === 'applied') existing.applied += 1;
        if (entry.status === 'rejected') existing.rejected += 1;
        summaryMap.set(authorId, existing);
      });
      const sorted = Array.from(summaryMap.values()).sort((a, b) => {
        if (b.pending !== a.pending) return b.pending - a.pending;
        return b.total - a.total;
      });
      setUserContributionSummary(sorted.slice(0, 10));
    }
    if (!rolesResult.error) {
      setRolesList(rolesResult.data);
    }
    if (!aiCoverageResult.error) {
      setAiCoverageSessions(aiCoverageResult.data);
    }
    setIsRefreshing(false);
  };
  const loadSpotDetails = async (spotId: string) => {
    setSelectedSpotId(spotId);
    setIsLoadingSpot(true);
    setDetailFilter('all');
    const [spotResult, contributionsResult, reportsResult, mediaResult] = await Promise.all([
      fetchSpotById(spotId),
      fetchContributionsBySpot(spotId),
      fetchReportsBySpot(spotId),
      fetchMediaBySpot(spotId),
    ]);

    if (spotResult.error) {
      Alert.alert('Error', spotResult.error);
      setSelectedSpot(null);
    } else {
      setSelectedSpot(spotResult.data);
    }
    if (contributionsResult.error) {
      Alert.alert('Error', contributionsResult.error);
    }
    if (reportsResult.error) {
      Alert.alert('Error', reportsResult.error);
    }
    if (mediaResult.error) {
      Alert.alert('Error', mediaResult.error);
    }

    setSpotContributions(contributionsResult.data);
    setSpotReports(reportsResult.data);
    setSpotMedia(mediaResult.data);
    setIsLoadingSpot(false);
  };


  useEffect(() => {
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAccess]);

  useEffect(() => {
    const loadRole = async () => {
      if (!isAuthenticated || !user?.id) {
        setAdminRole(null);
        return;
      }
      setIsLoadingRole(true);
      const result = await fetchUserRole(user.id);
      if (result.error) {
        setAdminRole(null);
        setIsLoadingRole(false);
        return;
      }
      setAdminRole((result.role as AdminRole) || null);
      setIsLoadingRole(false);
    };
    loadRole();
  }, [isAuthenticated, user?.id]);

  if (isLoading || isLoadingRole) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[textStyles.body, { color: colors.icon }]}>Cargando…</Text>
      </View>
    );
  }

  if (!canAccess) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[textStyles.heading3, { color: colors.text }]}>Admin Panel</Text>
        <Text style={[textStyles.body, { color: colors.icon, marginTop: spacing.sm }]}>Acceso restringido.</Text>
      </View>
    );
  }

  const handleApply = async (contributionId: string) => {
    const result = await applyContribution(contributionId);
    if (result.error) {
      Alert.alert('Error', result.error);
      return;
    }
    setAppliedCount((prev) => prev + 1);
    setPendingCount((prev) => Math.max(0, prev - 1));
    setContributions((prev) => prev.filter((c) => c.id !== contributionId));
  };

  const applyReject = async (contributionId: string, reviewReason?: string) => {
    const result = await rejectContribution(contributionId, reviewReason);
    if (result.error) {
      Alert.alert('Error', result.error);
      return false;
    }
    setContributions((prev) => prev.filter((c) => c.id !== contributionId));
    setRejectedCount((prev) => prev + 1);
    setPendingCount((prev) => Math.max(0, prev - 1));
    return true;
  };

  const handleReject = async (contributionId: string) => {
    const applyRejectWithReason = async (reviewReason?: string) => {
      await applyReject(contributionId, reviewReason);
    };

    if (Platform.OS === 'ios') {
      Alert.prompt(
        'Rechazar contribution',
        'Motivo (opcional)',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Rechazar', style: 'destructive', onPress: (value) => applyRejectWithReason(value) },
        ],
        'plain-text'
      );
      return;
    }

    setPendingRejectId(contributionId);
    setRejectReason('');
    setRejectModalVisible(true);
  };

  const handleEditContribution = (contribution: SpotContributionRecord) => {
    setEditContributionId(contribution.id);
    setEditContributionPayload(JSON.stringify(contribution.payload || {}, null, 2));
    setEditContributionError(null);
  };

  const handleSaveContributionEdit = async () => {
    if (!editContributionId) return;
    try {
      const parsed = JSON.parse(editContributionPayload || '{}');
      const result = await updateContributionPayload({
        contributionId: editContributionId,
        payload: parsed,
      });
      if (result.error) {
        setEditContributionError(result.error);
        return;
      }
      setContributions((prev) =>
        prev.map((item) => (item.id === editContributionId ? { ...item, payload: parsed } : item))
      );
      setEditContributionId(null);
      setEditContributionPayload('');
      setEditContributionError(null);
      Alert.alert('OK', 'Payload actualizado.');
    } catch (error) {
      setEditContributionError('Payload JSON invalido.');
    }
  };

  const handleAssignRole = async () => {
    if (!canManageRoles) {
      setRoleError('No tienes permisos para asignar roles.');
      return;
    }
    const trimmedUserId = roleUserIdInput.trim();
    if (!trimmedUserId) {
      setRoleError('User ID requerido.');
      return;
    }
    const result = await upsertUserRole({ userId: trimmedUserId, role: selectedRole });
    if (result.error) {
      setRoleError(result.error);
      return;
    }
    setRoleError(null);
    setRoleUserIdInput('');
    refreshData();
    Alert.alert('OK', 'Rol actualizado.');
  };

  const handleSoftHideMedia = async (mediaId: string) => {
    const result = await setMediaSoftHidden(mediaId);
    if (result.error) {
      Alert.alert('Error', result.error);
      return;
    }
    Alert.alert('OK', 'Media marcada como soft_hidden.');
  };

  const handleNeedsReview = async (spotId: string) => {
    const result = await markSpotNeedsReview(spotId);
    if (result.error) {
      Alert.alert('Error', result.error);
      return;
    }
    Alert.alert('OK', 'Spot marcado como needs_review.');
  };

  const handleToggleVersions = async (spotId: string) => {
    if (expandedSpotId === spotId) {
      setExpandedSpotId(null);
      setExpandedVersionId(null);
      return;
    }
    setExpandedSpotId(spotId);
    setExpandedVersionId(null);
    if (versionsBySpot[spotId]) {
      return;
    }
    const result = await fetchSpotVersionsForSpot(spotId);
    if (result.error) {
      Alert.alert('Error', result.error);
      return;
    }
    setVersionsBySpot((prev) => ({ ...prev, [spotId]: result.data }));
  };

  const handleRollback = async (spotId: string, versionId: string) => {
    const version = (versionsBySpot[spotId] || []).find((item) => item.id === versionId);
    const snapshot = version?.snapshot as Record<string, unknown> | undefined;
    const snapshotName = snapshot?.name ? String(snapshot.name) : 'Sin nombre';
    const snapshotType = snapshot?.type ? String(snapshot.type) : 'Sin tipo';
    const snapshotDesc = snapshot?.short_description ? String(snapshot.short_description) : 'Sin descripción';
    const current = selectedSpotId === spotId ? selectedSpot : null;
    const diffs = current ? buildSpotDiffs(current, snapshot).map((diff) => `${diff.label}: ${diff.before} → ${diff.after}`) : [];
    Alert.alert(
      'Confirmar rollback',
      `Aplicar esta versión:\n${snapshotName}\n${snapshotType}\n${snapshotDesc}\n\n` +
        (diffs.length > 0 ? `Cambios:\n${diffs.join('\n')}\n\n` : '') +
        '¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aplicar',
          style: 'destructive',
          onPress: async () => {
            const result = await rollbackSpotToVersion(spotId, versionId);
            if (result.error) {
              Alert.alert('Error', result.error);
              return;
            }
            Alert.alert('OK', 'Rollback aplicado.');
            setExpandedSpotId(null);
          },
        },
      ]
    );
  };


  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Modal animationType="fade" transparent visible={rejectModalVisible} onRequestClose={() => setRejectModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.background }]}>
            <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Rechazar contribution</Text>
            <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs }]}>
              Motivo (opcional)
            </Text>
            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.icon }]}
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="Escribe el motivo…"
              placeholderTextColor={colors.icon}
              multiline
            />
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.icon + '30' }]}
                onPress={() => {
                  setRejectModalVisible(false);
                  setPendingRejectId(null);
                }}>
                <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.error || '#FF3B30' }]}
                onPress={async () => {
                  if (!pendingRejectId) return;
                  const trimmedReason = rejectReason.trim();
                  const didReject = await applyReject(pendingRejectId, trimmedReason || undefined);
                  if (didReject) {
                    setRejectModalVisible(false);
                    setPendingRejectId(null);
                  }
                }}>
                <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>Rechazar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal animationType="fade" transparent visible={!!editContributionId} onRequestClose={() => setEditContributionId(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.background }]}>
            <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Editar payload</Text>
            <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs }]}>
              Ajusta el payload antes de aplicar.
            </Text>
            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.icon }]}
              value={editContributionPayload}
              onChangeText={setEditContributionPayload}
              placeholder="{ }"
              placeholderTextColor={colors.icon}
              multiline
            />
            {editContributionError && (
              <Text style={[textStyles.caption, { color: colors.error || '#FF3B30', marginTop: spacing.xs }]}>
                {editContributionError}
              </Text>
            )}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.icon + '30' }]}
                onPress={() => setEditContributionId(null)}>
                <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Cancelar</Text>
              </TouchableOpacity>
              {canEditPayload && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.tint }]}
                  onPress={handleSaveContributionEdit}>
                  <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>Guardar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
      <View style={styles.header}>
        <Text style={[textStyles.heading3, { color: colors.text }]}>Admin Panel</Text>
        <TouchableOpacity
          onPress={refreshData}
          style={iconTouchableContainer.base}
          disabled={isRefreshing}
          activeOpacity={0.7}>
          <Icon name="refresh" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {errorMessage && (
        <GlassView style={styles.warning} intensity="light" opacity="medium">
          <Text style={[textStyles.body, { color: colors.text }]}>{errorMessage}</Text>
        </GlassView>
      )}

      <View style={styles.metricsRow}>
        <GlassView style={styles.metricCard} intensity="light" opacity="medium">
          <Text style={[textStyles.caption, { color: colors.icon }]}>Contributions</Text>
          <Text style={[textStyles.heading3, { color: colors.text }]}>{pendingCount}</Text>
          <Text style={[textStyles.caption, { color: colors.icon }]}>pendientes</Text>
        </GlassView>
        <GlassView style={styles.metricCard} intensity="light" opacity="medium">
          <Text style={[textStyles.caption, { color: colors.icon }]}>Applied</Text>
          <Text style={[textStyles.heading3, { color: colors.text }]}>{appliedCount}</Text>
          <Text style={[textStyles.caption, { color: colors.icon }]}>totales</Text>
        </GlassView>
        <GlassView style={styles.metricCard} intensity="light" opacity="medium">
          <Text style={[textStyles.caption, { color: colors.icon }]}>Rejected</Text>
          <Text style={[textStyles.heading3, { color: colors.text }]}>{rejectedCount}</Text>
          <Text style={[textStyles.caption, { color: colors.icon }]}>totales</Text>
        </GlassView>
        <GlassView style={styles.metricCard} intensity="light" opacity="medium">
          <Text style={[textStyles.caption, { color: colors.icon }]}>Avg apply</Text>
          <Text style={[textStyles.heading3, { color: colors.text }]}>{avgApplyHours.toFixed(1)}</Text>
          <Text style={[textStyles.caption, { color: colors.icon }]}>horas</Text>
        </GlassView>
        <GlassView style={styles.metricCard} intensity="light" opacity="medium">
          <Text style={[textStyles.caption, { color: colors.icon }]}>Avg reject</Text>
          <Text style={[textStyles.heading3, { color: colors.text }]}>{avgRejectHours.toFixed(1)}</Text>
          <Text style={[textStyles.caption, { color: colors.icon }]}>horas</Text>
        </GlassView>
        <GlassView style={styles.metricCard} intensity="light" opacity="medium">
          <Text style={[textStyles.caption, { color: colors.icon }]}>Reportes</Text>
          <Text style={[textStyles.heading3, { color: colors.text }]}>{reports.length}</Text>
          <Text style={[textStyles.caption, { color: colors.icon }]}>últimos</Text>
        </GlassView>
        <GlassView style={styles.metricCard} intensity="light" opacity="medium">
          <Text style={[textStyles.caption, { color: colors.icon }]}>Soft hidden</Text>
          <Text style={[textStyles.heading3, { color: colors.text }]}>{softHiddenCount}</Text>
          <Text style={[textStyles.caption, { color: colors.icon }]}>media</Text>
        </GlassView>
        <GlassView style={styles.metricCard} intensity="light" opacity="medium">
          <Text style={[textStyles.caption, { color: colors.icon }]}>Needs review</Text>
          <Text style={[textStyles.heading3, { color: colors.text }]}>{needsReviewCount}</Text>
          <Text style={[textStyles.caption, { color: colors.icon }]}>spots</Text>
        </GlassView>
      </View>

      <SectionHeader title="Usuarios" variant="large" />
      {userContributionSummary.length === 0 ? (
        <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.lg }]}>
          No hay actividad de usuarios reciente.
        </Text>
      ) : (
        userContributionSummary.map((entry) => (
          <GlassView key={entry.authorId} style={styles.card} intensity="light" opacity="medium">
            <Text style={[textStyles.bodyMedium, { color: colors.text }]}>
              {entry.authorId}
            </Text>
            <Text style={[textStyles.caption, { color: colors.icon }]}>
              Pendientes: {entry.pending} · Aplicadas: {entry.applied} · Rechazadas: {entry.rejected}
            </Text>
            <Text style={[textStyles.caption, { color: colors.icon }]}>Total: {entry.total}</Text>
          </GlassView>
        ))
      )}

      <SectionHeader title="IA Coverage" variant="large" />
      {aiCoverageSessions.length === 0 ? (
        <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.lg }]}>
          No hay items de IA Coverage en V1.
        </Text>
      ) : (
        aiCoverageSessions.map((session) => (
          <GlassView key={session.id} style={styles.card} intensity="light" opacity="medium">
            <Text style={[textStyles.bodyMedium, { color: colors.text }]}>
              {session.status.toUpperCase()}
            </Text>
            <Text style={[textStyles.caption, { color: colors.icon }]}>
              {session.source || 'source: n/a'} · {new Date(session.created_at).toLocaleString()}
            </Text>
            {session.bbox ? (
              <Text style={[textStyles.caption, { color: colors.icon }]}>
                bbox: {session.bbox.west.toFixed(3)},{session.bbox.south.toFixed(3)} · {session.bbox.east.toFixed(3)},{session.bbox.north.toFixed(3)}
              </Text>
            ) : null}
            {typeof session.generated_count === 'number' ? (
              <Text style={[textStyles.caption, { color: colors.icon }]}>
                generados: {session.generated_count}
              </Text>
            ) : null}
            {session.reason ? (
              <Text style={[textStyles.caption, { color: colors.icon }]}>
                {session.reason}
              </Text>
            ) : null}
          </GlassView>
        ))
      )}

      <SectionHeader title="Roles" variant="large" />
      {!canManageRoles && (
        <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.lg }]}>
          Solo Admin puede asignar roles.
        </Text>
      )}
      {canManageRoles && (
        <GlassView style={styles.card} intensity="light" opacity="medium">
          <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Asignar rol</Text>
          <TextInput
            style={[styles.modalInput, { color: colors.text, borderColor: colors.icon }]}
            value={roleUserIdInput}
            onChangeText={setRoleUserIdInput}
            placeholder="User ID (UUID)"
            placeholderTextColor={colors.icon}
          />
          <View style={styles.actionsRow}>
            {(['admin', 'curator', 'support', 'analyst'] as AdminRole[]).map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.actionButton,
                  { backgroundColor: selectedRole === role ? colors.tint : colors.icon + '20' },
                ]}
                onPress={() => setSelectedRole(role)}>
                <Text style={[textStyles.caption, { color: selectedRole === role ? '#fff' : colors.text }]}>
                  {role}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {roleError && (
            <Text style={[textStyles.caption, { color: colors.error || '#FF3B30', marginTop: spacing.xs }]}>
              {roleError}
            </Text>
          )}
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.tint, marginTop: spacing.sm }]}
            onPress={handleAssignRole}>
            <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>Guardar rol</Text>
          </TouchableOpacity>
        </GlassView>
      )}
      {rolesList.length === 0 ? (
        <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.lg }]}>
          Sin roles asignados.
        </Text>
      ) : (
        rolesList.map((role) => (
          <GlassView key={`${role.user_id}-${role.role}`} style={styles.card} intensity="light" opacity="medium">
            <Text style={[textStyles.bodyMedium, { color: colors.text }]}>{role.user_id}</Text>
            <Text style={[textStyles.caption, { color: colors.icon }]}>
              Rol: {role.role} · Actualizado: {new Date(role.updated_at).toLocaleString()}
            </Text>
          </GlassView>
        ))
      )}

      <SectionHeader title="Contributions pendientes" variant="large" />
      {contributions.length === 0 ? (
        <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.lg }]}>
          No hay contributions pendientes.
        </Text>
      ) : (
        contributions.map((contribution) => (
          <GlassView key={contribution.id} style={styles.card} intensity="light" opacity="medium">
            <Text style={[textStyles.bodyMedium, { color: colors.text }]}>
              {contribution.spot_id ? `Spot: ${contribution.spot_id}` : 'Nuevo Spot'}
            </Text>
            <Text style={[textStyles.caption, { color: colors.icon }]}>
              {new Date(contribution.created_at).toLocaleString()}
            </Text>
            <View style={styles.actionsRow}>
              {canModerateContributions && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.tint }]}
                  onPress={() => handleApply(contribution.id)}>
                  <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>Aplicar</Text>
                </TouchableOpacity>
              )}
              {canModerateContributions && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.error || '#FF3B30' }]}
                  onPress={() => handleReject(contribution.id)}>
                  <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>Rechazar</Text>
                </TouchableOpacity>
              )}
              {canEditPayload && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.icon + '20' }]}
                  onPress={() => handleEditContribution(contribution)}>
                  <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Editar</Text>
                </TouchableOpacity>
              )}
              {contribution.spot_id ? (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.icon + '30' }]}
                  onPress={() => handleToggleVersions(contribution.spot_id as string)}>
                  <Text style={[textStyles.bodyMedium, { color: colors.text }]}>
                    {expandedSpotId === contribution.spot_id ? 'Ocultar' : 'Versiones'}
                  </Text>
                </TouchableOpacity>
              ) : null}
              {contribution.spot_id ? (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.icon + '20' }]}
                  onPress={() => loadSpotDetails(contribution.spot_id as string)}>
                  <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Detalle</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            {contribution.spot_id && expandedSpotId === contribution.spot_id && (
              <View style={styles.versionsContainer}>
                {(versionsBySpot[contribution.spot_id] || []).map((version) => {
                  const isExpanded = expandedVersionId === version.id;
                  const currentSpot = selectedSpotId === contribution.spot_id ? selectedSpot : null;
                  const diffs = currentSpot
                    ? buildSpotDiffs(currentSpot, version.snapshot as Record<string, unknown>)
                    : [];
                  return (
                    <View key={version.id}>
                      <View style={styles.versionRow}>
                        <View style={styles.versionInfo}>
                          <Text style={[textStyles.caption, { color: colors.icon }]}>
                            {new Date(version.created_at).toLocaleString()}
                          </Text>
                          <Text style={[textStyles.caption, { color: colors.icon }]}>
                            {(version.snapshot?.name as string) || 'Sin nombre'}
                          </Text>
                          <Text style={[textStyles.caption, { color: colors.icon }]}>
                            {(version.snapshot?.type as string) || 'Sin tipo'}
                          </Text>
                          <Text style={[textStyles.caption, { color: colors.icon }]}>
                            {(version.snapshot?.short_description as string) || 'Sin descripción'}
                          </Text>
                        </View>
                        <View style={styles.actionsRow}>
                          <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.icon + '20' }]}
                            onPress={() => setExpandedVersionId((prev) => (prev === version.id ? null : version.id))}>
                            <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Cambios</Text>
                          </TouchableOpacity>
                          {canRollback && (
                            <TouchableOpacity
                              style={[styles.actionButton, { backgroundColor: colors.icon + '20' }]}
                              onPress={() => handleRollback(contribution.spot_id as string, version.id)}>
                              <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Rollback</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                      {isExpanded && (
                        <View style={[styles.diffContainer, { backgroundColor: colors.icon + '10' }]}>
                          {!currentSpot ? (
                            <Text style={[textStyles.caption, { color: colors.icon }]}>
                              Selecciona "Detalle" para ver cambios.
                            </Text>
                          ) : diffs.length === 0 ? (
                            <Text style={[textStyles.caption, { color: colors.icon }]}>
                              Sin cambios detectados.
                            </Text>
                          ) : (
                            diffs.map((diff) => (
                              <View key={diff.label} style={styles.diffRow}>
                                <Text style={[textStyles.caption, { color: colors.icon }]}>{diff.label}</Text>
                                <Text style={[textStyles.caption, { color: colors.error || '#FF3B30' }]}>
                                  {diff.before}
                                </Text>
                                <Text style={[textStyles.caption, { color: colors.tint }]}>{diff.after}</Text>
                              </View>
                            ))
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </GlassView>
        ))
      )}

      <SectionHeader title="Reportes recientes" variant="large" />
      {reports.length === 0 ? (
        <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.lg }]}>
          No hay reportes recientes.
        </Text>
      ) : (
        reports.map((report) => (
          <GlassView key={report.id} style={styles.card} intensity="light" opacity="medium">
            <Text style={[textStyles.bodyMedium, { color: colors.text }]}>
              Spot: {report.spot_id}
            </Text>
            <Text style={[textStyles.caption, { color: colors.icon }]}>
              Motivo: {report.reason}
            </Text>
            <Text style={[textStyles.caption, { color: colors.icon }]}>
              {new Date(report.created_at).toLocaleString()}
            </Text>
            <View style={styles.actionsRow}>
              {report.media_id && canModerateReports ? (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.tint }]}
                  onPress={() => handleSoftHideMedia(report.media_id as string)}>
                  <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>Soft hide</Text>
                </TouchableOpacity>
              ) : null}
              {canModerateReports && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.icon + '50' }]}
                  onPress={() => handleNeedsReview(report.spot_id)}>
                  <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Needs review</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.icon + '20' }]}
                onPress={() => loadSpotDetails(report.spot_id)}>
                <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Detalle</Text>
              </TouchableOpacity>
            </View>
          </GlassView>
        ))
      )}

      <SectionHeader title="Spot detalle" variant="large" />
      {!selectedSpotId ? (
        <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.lg }]}>
          Selecciona un spot para ver detalle.
        </Text>
      ) : isLoadingSpot ? (
        <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.lg }]}>
          Cargando detalle…
        </Text>
      ) : selectedSpot ? (
        <GlassView style={styles.card} intensity="light" opacity="medium">
          <Text style={[textStyles.bodyMedium, { color: colors.text }]}>{selectedSpot.name}</Text>
          <Text style={[textStyles.caption, { color: colors.icon }]}>ID: {selectedSpot.id}</Text>
          <Text style={[textStyles.caption, { color: colors.icon }]}>
            Needs review: {selectedSpot.needs_review ? 'true' : 'false'}
          </Text>
          <Text style={[textStyles.caption, { color: colors.icon }]}>
            Media: {spotMedia.length} · Contributions: {spotContributions.length} · Reports: {spotReports.length}
          </Text>
          <View style={styles.auditFilters}>
            {[
              { key: 'all', label: 'Todo' },
              { key: 'contributions', label: 'Contributions' },
              { key: 'reports', label: 'Reports' },
              { key: 'media', label: 'Media' },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.auditFilterButton,
                  { backgroundColor: detailFilter === filter.key ? colors.tint : colors.icon + '20' },
                ]}
                onPress={() => setDetailFilter(filter.key as typeof detailFilter)}>
                <Text style={[textStyles.caption, { color: detailFilter === filter.key ? '#fff' : colors.text }]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {(detailFilter === 'all' || detailFilter === 'contributions') && (
            <View style={styles.detailSection}>
              <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Contributions</Text>
              {spotContributions.length === 0 ? (
                <Text style={[textStyles.caption, { color: colors.icon }]}>Sin contributions.</Text>
              ) : (
                spotContributions.map((contribution) => (
                  <View key={contribution.id} style={styles.detailRow}>
                    <Text style={[textStyles.caption, { color: colors.icon }]}>
                      {contribution.status} · {new Date(contribution.created_at).toLocaleString()}
                    </Text>
                    {contribution.payload ? (
                      <Text style={[textStyles.caption, { color: colors.icon }]}>
                        {JSON.stringify(contribution.payload)}
                      </Text>
                    ) : null}
                  </View>
                ))
              )}
            </View>
          )}
          {(detailFilter === 'all' || detailFilter === 'reports') && (
            <View style={styles.detailSection}>
              <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Reports</Text>
              {spotReports.length === 0 ? (
                <Text style={[textStyles.caption, { color: colors.icon }]}>Sin reportes.</Text>
              ) : (
                spotReports.map((report) => (
                  <Text key={report.id} style={[textStyles.caption, { color: colors.icon }]}>
                    {report.reason} · {new Date(report.created_at).toLocaleString()}
                  </Text>
                ))
              )}
            </View>
          )}
          {(detailFilter === 'all' || detailFilter === 'media') && (
            <View style={styles.detailSection}>
              <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Media</Text>
              {spotMedia.length === 0 ? (
                <Text style={[textStyles.caption, { color: colors.icon }]}>Sin media.</Text>
              ) : (
                spotMedia.map((media) => (
                  <View key={media.id} style={styles.detailRow}>
                    <Text style={[textStyles.caption, { color: colors.icon }]}>
                      {media.status} · {new Date(media.created_at).toLocaleString()}
                    </Text>
                    <Text style={[textStyles.caption, { color: colors.icon }]}>
                      {media.url}
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}
        </GlassView>
      ) : (
        <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.lg }]}>
          Spot no encontrado.
        </Text>
      )}

      <SectionHeader title="Auditoría admin" variant="large" />
      <View style={styles.auditFilters}>
        {[
          { key: 'all', label: 'Todas' },
          { key: 'spot', label: 'Spots' },
          { key: 'spot_contribution', label: 'Contributions' },
          { key: 'spot_media_public', label: 'Media' },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.auditFilterButton,
              { backgroundColor: auditFilter === filter.key ? colors.tint : colors.icon + '20' },
            ]}
            onPress={() => setAuditFilter(filter.key as typeof auditFilter)}>
            <Text style={[textStyles.caption, { color: auditFilter === filter.key ? '#fff' : colors.text }]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.auditFilters}>
        {['all', 'apply_contribution', 'reject_contribution', 'rollback_spot_version', 'soft_hide_media', 'mark_needs_review'].map(
          (action) => (
            <TouchableOpacity
              key={action}
              style={[
                styles.auditFilterButton,
                { backgroundColor: auditActionFilter === action ? colors.tint : colors.icon + '20' },
              ]}
              onPress={() => setAuditActionFilter(action)}>
              <Text style={[textStyles.caption, { color: auditActionFilter === action ? '#fff' : colors.text }]}>
                {action === 'all' ? 'Acciones' : action}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>
      <View style={styles.auditFilters}>
        {[
          { key: 'all', label: 'Todo el tiempo' },
          { key: '24h', label: '24h' },
          { key: '7d', label: '7d' },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.auditFilterButton,
              { backgroundColor: auditTimeFilter === filter.key ? colors.tint : colors.icon + '20' },
            ]}
            onPress={() => setAuditTimeFilter(filter.key as typeof auditTimeFilter)}>
            <Text style={[textStyles.caption, { color: auditTimeFilter === filter.key ? '#fff' : colors.text }]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {auditLog.length === 0 ? (
        <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.lg }]}>
          No hay acciones registradas.
        </Text>
      ) : (
        auditLog
          .filter((entry) => auditFilter === 'all' || entry.entity_type === auditFilter)
          .filter((entry) => auditActionFilter === 'all' || entry.action === auditActionFilter)
          .filter((entry) => {
            if (auditTimeFilter === 'all') return true;
            const now = Date.now();
            const created = new Date(entry.created_at).getTime();
            const diffHours = (now - created) / 3600000;
            if (auditTimeFilter === '24h') return diffHours <= 24;
            return diffHours <= 24 * 7;
          })
          .map((entry) => (
          <GlassView key={entry.id} style={styles.card} intensity="light" opacity="medium">
            <Text style={[textStyles.bodyMedium, { color: colors.text }]}>{entry.action}</Text>
            <Text style={[textStyles.caption, { color: colors.icon }]}>
              {entry.entity_type} · {entry.entity_id || 'N/A'}
            </Text>
            {entry.payload ? (
              <Text style={[textStyles.caption, { color: colors.icon }]}>
                {JSON.stringify(entry.payload)}
              </Text>
            ) : null}
            <Text style={[textStyles.caption, { color: colors.icon }]}>
              {new Date(entry.created_at).toLocaleString()}
            </Text>
          </GlassView>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  warning: {
    padding: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.lg,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  metricCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 16,
    alignItems: 'center',
  },
  card: {
    padding: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  actionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  versionsContainer: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  versionInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  auditFilters: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  auditFilterButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  detailSection: {
    marginTop: spacing.sm,
  },
  detailRow: {
    marginTop: spacing.xs,
  },
  diffContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    borderRadius: 12,
  },
  diffRow: {
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    borderRadius: 16,
    padding: spacing.lg,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    marginTop: spacing.sm,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
