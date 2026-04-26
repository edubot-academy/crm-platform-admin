import apiClient from '../../shared/api/client';

export interface AuditLogMetadata {
  [key: string]: string | number | boolean | null;
}

export interface PlatformAuditLog {
  id: string;
  action: string;
  title: string;
  actorUserId: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  targetType: string;
  targetId: string;
  metadata: AuditLogMetadata;
  createdAt: string;
}

export interface AuditLogsQueryParams {
  page?: number;
  limit?: number;
  action?: string;
  actorUserId?: string;
  targetType?: string;
  targetId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AuditLogsResponse {
  items: PlatformAuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const auditLogsApi = {
  async getAuditLogs(params?: AuditLogsQueryParams): Promise<AuditLogsResponse> {
    const response = await apiClient.get<AuditLogsResponse>('/platform/audit-logs', { params });
    return response.data;
  },
};
