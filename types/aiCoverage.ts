export type AiCoverageStatus = 'pending' | 'generated' | 'failed' | 'cooldown';

export interface AiCoverageSessionRecord {
  id: string;
  user_id?: string | null;
  source?: string | null;
  reason?: string | null;
  bbox: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  bbox_key?: string | null;
  status: AiCoverageStatus;
  generated_count: number;
  cooldown_until?: string | null;
  created_at: string;
  updated_at: string;
}
