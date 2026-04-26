import apiClient from '../../shared/api/client';

export interface FeatureFlag {
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const platformFeatureFlagsApi = {
  async getFeatureFlags(): Promise<FeatureFlag[]> {
    const response = await apiClient.get<FeatureFlag[]>('/platform/feature-flags');
    return response.data;
  },

  async updateFeatureFlag(key: string, enabled: boolean): Promise<FeatureFlag> {
    const response = await apiClient.put<FeatureFlag>(`/platform/feature-flags/${key}`, { enabled });
    return response.data;
  },
};
