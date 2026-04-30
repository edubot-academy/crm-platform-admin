import apiClient from '../../shared/api/client';

export interface TenantConfig {
  tenantId: number;
  defaultLanguage: string;
  timezone: string;
  currency: string;
  brandingName: string | null;
  brandingLogoUrl: string | null;
  supportEmail: string;
  enabledModules: Record<string, boolean>;
  metadata: {
    platformNotes?: string;
    [key: string]: string | number | boolean | null | undefined;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateTenantConfigDto {
  defaultLanguage?: string;
  timezone?: string;
  currency?: string;
  supportEmail?: string;
  metadata?: {
    platformNotes?: string;
    [key: string]: string | number | boolean | null | undefined;
  };
}

export const tenantSettingsApi = {
  async getTenantSettings(tenantId: string): Promise<TenantConfig> {
    const response = await apiClient.get<TenantConfig>(`/platform/tenants/${tenantId}/settings`);
    return response.data;
  },

  async updateTenantSettings(tenantId: string, data: UpdateTenantConfigDto): Promise<TenantConfig> {
    const response = await apiClient.patch<TenantConfig>(`/platform/tenants/${tenantId}/settings`, data);
    return response.data;
  },
};
