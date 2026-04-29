import apiClient from '../../shared/api/client';

export interface TenantUserSummary {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'sales' | 'assistant';
  isActive?: boolean;
  status?: 'active' | 'inactive';
  companyId: number | null;
  tenantId: string | number;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  inviteLink?: string;
}

export interface GetTenantUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface TenantUsersResponse {
  items: TenantUserSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateTenantUserStatusDto {
  isActive: boolean;
}

export interface CreateTenantUserDto {
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'sales' | 'assistant';
  isActive?: boolean;
  password?: string;
  sendInvite?: boolean;
}

export interface ResendInviteResponse {
  inviteLink: string;
}

export const tenantUsersApi = {
  async getTenantUsers(tenantId: string, params: GetTenantUsersParams = {}): Promise<TenantUsersResponse> {
    const response = await apiClient.get<TenantUsersResponse>(`/platform/tenants/${tenantId}/users`, { params });
    // Normalize isActive/status field for consistency
    const normalizedItems = response.data.items.map(user => ({
      ...user,
      // If status is provided, derive isActive from it
      isActive: user.isActive !== undefined ? user.isActive : user.status === 'active',
    }));
    return { ...response.data, items: normalizedItems };
  },

  async updateTenantUserStatus(tenantId: string, userId: string, data: UpdateTenantUserStatusDto): Promise<TenantUserSummary> {
    const response = await apiClient.patch<TenantUserSummary>(`/platform/tenants/${tenantId}/users/${userId}/status`, data);
    // Normalize response
    return {
      ...response.data,
      isActive: response.data.isActive !== undefined ? response.data.isActive : response.data.status === 'active',
    };
  },

  async createTenantUser(tenantId: string, data: CreateTenantUserDto): Promise<TenantUserSummary> {
    // Transform isActive to status for backend compatibility
    const payload = {
      ...data,
      status: data.isActive !== undefined ? (data.isActive ? 'active' : 'inactive') : undefined,
      isActive: undefined,
    };
    const response = await apiClient.post<TenantUserSummary>(`/platform/tenants/${tenantId}/users`, payload);
    // Normalize response
    return {
      ...response.data,
      isActive: response.data.isActive !== undefined ? response.data.isActive : response.data.status === 'active',
    };
  },

  async resendInvite(tenantId: string, userId: string): Promise<ResendInviteResponse> {
    const response = await apiClient.post<ResendInviteResponse>(`/platform/tenants/${tenantId}/users/${userId}/resend-invite`);
    return response.data;
  },
};
