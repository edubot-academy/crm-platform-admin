import apiClient from '../../shared/api/client';

export interface PlatformUser {
  id: number;
  tenantId: null;
  fullName: string;
  email: string;
  role: 'superadmin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  invitedAt: string | null;
  lastLoginAt: string | null;
  deletedAt: string | null;
  telegramChatId: string | null;
  inviteLink?: string;
}

export interface PlatformUsersResponse {
  items: PlatformUser[];
  total: number;
}

export interface CreatePlatformUserData {
  fullName: string;
  email: string;
  password?: string;
  role: 'superadmin';
}

export interface UpdateUserStatusData {
  isActive: boolean;
}

export interface ResendInviteResponse {
  userId: number;
  email: string;
  inviteLink: string;
  inviteToken: string;
  message: string;
}

export const platformUsersApi = {
  async getUsers(): Promise<PlatformUser[]> {
    const response = await apiClient.get<PlatformUsersResponse>('/platform/users');
    return response.data.items;
  },

  async getMe(): Promise<PlatformUser> {
    const response = await apiClient.get<PlatformUser>('/platform/users/me');
    return response.data;
  },

  async createUser(data: CreatePlatformUserData): Promise<PlatformUser> {
    const response = await apiClient.post<PlatformUser>('/platform/users', data);
    return response.data;
  },

  async updateUserStatus(userId: number, data: UpdateUserStatusData): Promise<PlatformUser> {
    const response = await apiClient.patch<PlatformUser>(`/platform/users/${userId}/status`, data);
    return response.data;
  },

  async resendInvite(userId: number): Promise<ResendInviteResponse> {
    const response = await apiClient.post<ResendInviteResponse>(`/platform/users/${userId}/resend-invite`);
    return response.data;
  },
};
