import apiClient from '../../shared/api/client';

export interface TenantUserSummary {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'sales' | 'assistant';
  status: 'active' | 'inactive' | 'suspended' | boolean;
  companyId: number | null;
  tenantId: string | number;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export interface GetTenantUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface TenantUsersResponse {
  items: TenantUserSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateTenantUserStatusDto {
  status: boolean;
}

export interface CreateTenantUserDto {
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'sales' | 'assistant';
  status?: 'active' | 'inactive';
  password?: string;
  sendInvite?: boolean;
}

export const tenantUsersApi = {
  async getTenantUsers(tenantId: string, params: GetTenantUsersParams = {}): Promise<TenantUsersResponse> {
    const response = await apiClient.get<TenantUsersResponse>(`/platform/tenants/${tenantId}/users`, { params });
    return response.data;
  },

  async updateTenantUserStatus(tenantId: string, userId: string, data: UpdateTenantUserStatusDto): Promise<TenantUserSummary> {
    const response = await apiClient.patch<TenantUserSummary>(`/platform/tenants/${tenantId}/users/${userId}/status`, data);
    return response.data;
  },

  async createTenantUser(tenantId: string, data: CreateTenantUserDto): Promise<TenantUserSummary> {
    const response = await apiClient.post<TenantUserSummary>(`/platform/tenants/${tenantId}/users`, data);
    return response.data;
  },
};
