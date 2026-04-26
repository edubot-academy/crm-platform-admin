import apiClient from '../../shared/api/client';

export type PlanStatus = 'active' | 'inactive' | 'archived';

export interface PlanLimits {
  [key: string]: number | string | boolean;
}

export interface Plan {
  id: string;
  name: string;
  code: string;
  description: string | null;
  status: PlanStatus;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  currency: string;
  limits: PlanLimits;
  features: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanData {
  name: string;
  code: string;
  description?: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
  currency?: string;
  limits?: PlanLimits;
  features?: Record<string, boolean>;
  status?: PlanStatus;
}

export interface UpdatePlanData {
  name?: string;
  code?: string;
  description?: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
  currency?: string;
  limits?: PlanLimits;
  features?: Record<string, boolean>;
  status?: PlanStatus;
}

export interface UpdatePlanStatusData {
  status: PlanStatus;
}

export interface AssignTenantPlanData {
  planId: string;
}

export const plansApi = {
  async getPlans(): Promise<Plan[]> {
    const response = await apiClient.get<Plan[]>('/platform/plans');
    return response.data;
  },

  async getPlanById(id: string): Promise<Plan> {
    const response = await apiClient.get<Plan>(`/platform/plans/${id}`);
    return response.data;
  },

  async createPlan(data: CreatePlanData): Promise<Plan> {
    const response = await apiClient.post<Plan>('/platform/plans', data);
    return response.data;
  },

  async updatePlan(id: string, data: UpdatePlanData): Promise<Plan> {
    const response = await apiClient.patch<Plan>(`/platform/plans/${id}`, data);
    return response.data;
  },

  async updatePlanStatus(id: string, data: UpdatePlanStatusData): Promise<Plan> {
    const response = await apiClient.patch<Plan>(`/platform/plans/${id}/status`, data);
    return response.data;
  },

  async assignTenantPlan(tenantId: string, data: AssignTenantPlanData): Promise<void> {
    await apiClient.patch(`/platform/tenants/${tenantId}/plan`, data);
  },
};
