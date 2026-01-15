export interface AdminAuditRecord {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  payload?: Record<string, unknown> | null;
  created_at: string;
}
