import apiClient from './client';

export interface PlatformOverviewResponse {
  tenants: {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    archived: number;
  };
  platformUsers: {
    total: number;
    active: number;
    inactive: number;
  };
  plans: {
    total: number;
    active: number;
  };
  featureFlags: {
    total: number;
    enabled: number;
    disabled: number;
  };
  auditLogs: {
    recent: Array<{
      id: string;
      action: string;
      title: string;
      actorEmail?: string | null;
      createdAt: string;
    }>;
  };
}

export const dashboardApi = {
  async getPlatformOverview(): Promise<PlatformOverviewResponse> {
    const response = await apiClient.get<PlatformOverviewResponse>('/platform/dashboard/overview');
    return response.data;
  },
};
