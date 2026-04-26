import apiClient from '../../shared/api/client';

export interface TenantDomain {
  id: number;
  tenantId: number;
  domain: string;
  type: 'default' | 'custom';
  status: 'active' | 'pending' | 'failed' | 'disabled';
  isPrimary: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantDomainDto {
  domain: string;
  type?: 'default' | 'custom';
  status?: 'active' | 'pending' | 'failed' | 'disabled';
}

export interface UpdateTenantDomainStatusDto {
  status: 'active' | 'pending' | 'failed' | 'disabled';
}

export const tenantDomainsApi = {
  async getTenantDomains(tenantId: string): Promise<TenantDomain[]> {
    const response = await apiClient.get<TenantDomain[]>(`/platform/tenants/${tenantId}/domains`);
    return response.data;
  },

  async createTenantDomain(tenantId: string, data: CreateTenantDomainDto): Promise<TenantDomain> {
    const response = await apiClient.post<TenantDomain>(`/platform/tenants/${tenantId}/domains`, data);
    return response.data;
  },

  async setDomainPrimary(domainId: string, isPrimary: boolean): Promise<TenantDomain> {
    const response = await apiClient.patch<TenantDomain>(`/platform/tenant-domains/${domainId}/primary`, { isPrimary });
    return response.data;
  },

  async updateDomainStatus(domainId: string, data: UpdateTenantDomainStatusDto): Promise<TenantDomain> {
    const response = await apiClient.patch<TenantDomain>(`/platform/tenant-domains/${domainId}/status`, data);
    return response.data;
  },
};
