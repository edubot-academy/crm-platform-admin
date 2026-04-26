import apiClient from '../../shared/api/client';

export type DemoRequestStatus = 'new' | 'contacted' | 'demo_scheduled' | 'closed' | 'spam';

export interface DemoRequest {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  email: string | null;
  message: string | null;
  status: DemoRequestStatus;
  source: string;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface DemoRequestsQueryParams {
  page?: number;
  limit?: number;
  status?: DemoRequestStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface DemoRequestsResponse {
  items: DemoRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateDemoRequestStatusData {
  status: DemoRequestStatus;
}

export const demoRequestsApi = {
  async getDemoRequests(params?: DemoRequestsQueryParams): Promise<DemoRequestsResponse> {
    const response = await apiClient.get<DemoRequestsResponse>('/platform/demo-requests', { params });
    return response.data;
  },

  async getDemoRequestById(id: string): Promise<DemoRequest> {
    const response = await apiClient.get<DemoRequest>(`/platform/demo-requests/${id}`);
    return response.data;
  },

  async updateDemoRequestStatus(id: string, data: UpdateDemoRequestStatusData): Promise<DemoRequest> {
    const response = await apiClient.patch<DemoRequest>(`/platform/demo-requests/${id}/status`, data);
    return response.data;
  },
};
