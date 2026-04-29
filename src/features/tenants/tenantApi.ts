import apiClient from '../../shared/api/client';

export interface TenantSettings {
  [key: string]: string | number | boolean | null;
}

export interface TenantPlan {
  id: string | null;
  name: string | null;
  code: string | null;
}

export interface TenantSummary {
  id: number;
  name: string;
  slug: string;
  status: 'active' | 'inactive' | 'suspended' | 'archived';
  primaryDomain: string | null;
  plan: TenantPlan;
  features: Record<string, boolean> | null;
  modules: Record<string, boolean> | null;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: number;
  name: string;
  slug: string;
  primaryDomain: string | null;
  status: 'active' | 'inactive' | 'suspended' | 'archived';
  plan: TenantPlan;
  features: Record<string, boolean> | null;
  modules: Record<string, boolean> | null;
  createdAt: string;
  updatedAt: string;
}

export interface TenantsResponse {
  items: TenantSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetTenantsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
}

export interface CreateTenantData {
  name: string;
  slug: string;
  primaryEmail?: string;
  planId?: string;
  status: 'active' | 'inactive' | 'suspended' | 'archived';
  adminName?: string;
  adminEmail?: string;
  adminPassword?: string;
}

export interface UpdateTenantData {
  name?: string;
  slug?: string;
  primaryEmail?: string;
  planId?: string;
}

export interface OnboardTenantAdmin {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  inviteLink?: string | null;
}

export interface OnboardTenantPlan {
  id: string | null;
  name: string | null;
  code: string | null;
}

export interface OnboardTenantResponse {
  tenantId: number;
  tenantName: string;
  tenantSlug: string;
  tenantStatus: 'active' | 'inactive' | 'suspended' | 'archived';
  primaryDomain: string;
  admin: OnboardTenantAdmin;
  plan: OnboardTenantPlan;
  features: Record<string, boolean> | null;
  modules: Record<string, boolean> | null;
  message: string;
  success: boolean;
  createdAt: string;
}

export interface OnboardTenantData {
  name: string;
  slug: string;
  adminFullName: string;
  adminEmail: string;
  adminRole?: 'admin' | 'manager';
  planId?: string;
  status?: 'active' | 'inactive' | 'suspended' | 'archived';
  industry?: string;
  brandColor?: string;
  logoUrl?: string;
  defaultLanguage?: string;
  timezone?: string;
  currency?: string;
}

export const tenantApi = {
  async getTenants(params: GetTenantsParams = {}): Promise<TenantsResponse> {
    const response = await apiClient.get<TenantsResponse>('/platform/tenants', { params });
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

  async onboardTenant(data: OnboardTenantData): Promise<OnboardTenantResponse> {
    const response = await apiClient.post<OnboardTenantResponse>('/platform/tenants/onboard', data);
    return response.data;
  },
};
