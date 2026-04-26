import apiClient from '../../shared/api/client';

export interface TenantSettings {
  [key: string]: string | number | boolean | null;
}

export interface TenantSummary {
  id: number;
  name: string;
  slug: string;
  status: 'active' | 'inactive' | 'suspended' | 'archived';
  planId: string | null;
  primaryEmail: string | null;
  domain: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  settings: TenantSettings;
}

export interface Tenant {
  id: number;
  name: string;
  slug: string;
  primaryEmail: string | null;
  domain: string | null;
  status: 'active' | 'inactive' | 'suspended' | 'archived';
  planId: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  settings: TenantSettings;
}

export interface GetTenantsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface CreateTenantData {
  name: string;
  slug: string;
  primaryEmail: string;
  planId: string;
  status: 'active' | 'inactive' | 'suspended' | 'archived';
}

export interface UpdateTenantData {
  name?: string;
  slug?: string;
  primaryEmail?: string;
  planId?: string;
}

export const tenantApi = {
  async getTenants(params: GetTenantsParams = {}): Promise<TenantSummary[]> {
    const response = await apiClient.get<TenantSummary[]>('/platform/tenants', { params });
    return response.data;
  },

  async getTenantById(tenantId: string): Promise<Tenant> {
    const response = await apiClient.get<Tenant>(`/platform/tenants/${tenantId}`);
    return response.data;
  },

  async createTenant(data: CreateTenantData): Promise<Tenant> {
    const response = await apiClient.post<Tenant>('/platform/tenants', data);
    return response.data;
  },

  async updateTenant(tenantId: string, data: UpdateTenantData): Promise<Tenant> {
    const response = await apiClient.patch<Tenant>(`/platform/tenants/${tenantId}`, data);
    return response.data;
  },

  async updateTenantStatus(tenantId: string, status: 'active' | 'inactive' | 'suspended' | 'archived'): Promise<Tenant> {
    const response = await apiClient.patch<Tenant>(`/platform/tenants/${tenantId}/status`, { status });
    return response.data;
  },

  async deleteTenant(tenantId: string): Promise<void> {
    await apiClient.delete(`/platform/tenants/${tenantId}`);
  },
};
