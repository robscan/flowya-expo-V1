import type { SpotContributionRecord } from '@/types/spotContributions';

export type TrustTier = 'invitado' | 'nuevo' | 'creciente' | 'confiable';

export interface TrustPermissions {
  canCreateSpots: boolean;
  canSuggestEdits: boolean;
  canReport: boolean;
  canAttachMedia: boolean;
}

export function getTrustTier(contributions: SpotContributionRecord[], isAuthenticated: boolean): TrustTier {
  if (!isAuthenticated) {
    return 'invitado';
  }

  const appliedCount = contributions.filter((contribution) => contribution.status === 'applied').length;

  if (appliedCount === 0) {
    return 'nuevo';
  }

  if (appliedCount <= 2) {
    return 'creciente';
  }

  return 'confiable';
}

export function getTrustPermissions(tier: TrustTier, isAuthenticated: boolean): TrustPermissions {
  if (!isAuthenticated) {
    return {
      canCreateSpots: false,
      canSuggestEdits: false,
      canReport: false,
      canAttachMedia: false,
    };
  }

  return {
    canCreateSpots: tier !== 'nuevo',
    canSuggestEdits: true,
    canReport: true,
    canAttachMedia: tier === 'confiable',
  };
}

export function getTrustTierLabel(tier: TrustTier): string {
  switch (tier) {
    case 'invitado':
      return 'Invitado';
    case 'nuevo':
      return 'Nuevo';
    case 'creciente':
      return 'Creciente';
    case 'confiable':
      return 'Confiable';
    default:
      return 'Nuevo';
  }
}
