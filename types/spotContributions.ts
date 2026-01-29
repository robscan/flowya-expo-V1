import { SpotImage, SpotType } from '@/data/spots';

export type SpotContributionStatus = 'pending' | 'applied' | 'rejected';
export type SpotContributionType = 'create' | 'update' | 'rollback';

export type SpotReportReason = 'incorrecta' | 'no es del lugar' | 'ofensiva' | 'spam';

export type SpotContributionPayload = Partial<{
  name: string;
  type: SpotType;
  location: {
    lat: number;
    lng: number;
    city?: string;
    country?: string;
  };
  short_description: string;
  description: string;
  image: SpotImage;
  has_generated_content: boolean;
}>;

export interface SpotContributionRecord {
  id: string;
  spot_id?: string | null;
  author_id: string;
  type: SpotContributionType;
  payload: SpotContributionPayload;
  status: SpotContributionStatus;
  created_at: string;
  applied_at?: string | null;
  rejected_at?: string | null;
  reviewed_by?: string | null;
  review_reason?: string | null;
}

export interface SpotVersionRecord {
  id: string;
  spot_id: string;
  contribution_id?: string | null;
  snapshot: Record<string, unknown>;
  created_at: string;
  created_by?: string | null;
}

export type SpotMediaStatus = 'active' | 'soft_hidden';

export interface SpotMediaPublicRecord {
  id: string;
  spot_id: string;
  storage_path: string;
  url?: string;
  source?: string | null;
  license?: string | null;
  status: SpotMediaStatus;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SpotReportRecord {
  id: string;
  spot_id: string;
  media_id?: string | null;
  reporter_id: string;
  reason: SpotReportReason;
  created_at: string;
}
