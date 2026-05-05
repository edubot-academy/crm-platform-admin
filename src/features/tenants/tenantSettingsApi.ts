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

export interface PlatformTenantWhatsAppSettings {
  id: number;
  whatsapp_business_account_id: string;
  phone_number_id: string;
  display_phone_number: string;
  status: 'pending' | 'connected' | 'disabled' | 'failed';
  last_verified_at?: string | null;
  created_at: string;
  updated_at: string;
  access_token_preview: string;
}

export interface PlatformTenantWhatsAppSettingsPayload {
  whatsapp_business_account_id: string;
  phone_number_id: string;
  display_phone_number: string;
  access_token: string;
}

export interface PlatformTenantWhatsAppSettingsUpdatePayload {
  whatsapp_business_account_id?: string;
  display_phone_number?: string;
  access_token?: string;
}

export interface PlatformTenantWhatsAppHealth {
  configured: boolean;
  connected: boolean;
  featureEnabled: boolean | null;
  settings: PlatformTenantWhatsAppSettings | null;
  lastConversationActivityAt?: string | null;
  lastSuccessfulWebhookAt?: string | null;
  lastFailedWebhookAt?: string | null;
  lastWebhookAt?: string | null;
  lastError?: string | null;
  failedWebhookCount: number;
}

export interface PlatformTenantWhatsAppFailedEvent {
  id: number;
  event_type: string;
  status: string;
  retry_count: number;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
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

  async getTenantWhatsAppSettings(tenantId: string): Promise<PlatformTenantWhatsAppSettings | { message: string }> {
    const response = await apiClient.get<PlatformTenantWhatsAppSettings | { message: string }>(`/platform/tenants/${tenantId}/whatsapp/settings`);
    return response.data;
  },

  async getTenantWhatsAppHealth(tenantId: string): Promise<PlatformTenantWhatsAppHealth> {
    const response = await apiClient.get<PlatformTenantWhatsAppHealth>(`/platform/tenants/${tenantId}/whatsapp/health`);
    return response.data;
  },

  async getTenantWhatsAppFailedEvents(tenantId: string, limit = 5): Promise<PlatformTenantWhatsAppFailedEvent[]> {
    const response = await apiClient.get<PlatformTenantWhatsAppFailedEvent[]>(`/platform/tenants/${tenantId}/whatsapp/webhook-events/failed`, {
      params: { limit },
    });
    return response.data;
  },

  async createTenantWhatsAppSettings(tenantId: string, data: PlatformTenantWhatsAppSettingsPayload): Promise<{ message: string; account: PlatformTenantWhatsAppSettings }> {
    const response = await apiClient.post<{ message: string; account: PlatformTenantWhatsAppSettings }>(`/platform/tenants/${tenantId}/whatsapp/settings`, data);
    return response.data;
  },

  async updateTenantWhatsAppSettings(tenantId: string, data: PlatformTenantWhatsAppSettingsUpdatePayload): Promise<{ message: string; account: PlatformTenantWhatsAppSettings }> {
    const response = await apiClient.patch<{ message: string; account: PlatformTenantWhatsAppSettings }>(`/platform/tenants/${tenantId}/whatsapp/settings`, data);
    return response.data;
  },
};
