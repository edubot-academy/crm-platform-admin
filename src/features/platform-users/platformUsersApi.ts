import apiClient from '../../shared/api/client';

export interface PlatformUser {
  id: number;
  tenantId: null;
  name?: string;
  fullName?: string;
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
  name?: string;
  fullName?: string;
  email: string;
  role: 'superadmin';
}

export interface UpdateUserStatusData {
  isActive: boolean;
}

export interface CreatePlatformUserResponse {
  userId: number;
  inviteLink: string;
  inviteToken: string;
  message: string;
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

  getDisplayName(user: PlatformUser): string {
    return user.name ?? user.fullName ?? user.email;
  },

  async getMe(): Promise<PlatformUser> {
    const response = await apiClient.get<PlatformUser>('/platform/users/me');
    return response.data;
  },

  async createUser(data: CreatePlatformUserData): Promise<CreatePlatformUserResponse> {
    const response = await apiClient.post<CreatePlatformUserResponse>('/platform/users', data);
    return response.data;
  },

  normalizeCreateData(data: CreatePlatformUserData): CreatePlatformUserData {
    // Normalize name/fullName field - use name if provided, otherwise fullName
    return {
      ...data,
      name: data.name || data.fullName,
    };
  },

  async updateUserStatus(userId: number, data: UpdateUserStatusData): Promise<{ message: string }> {
    const response = await apiClient.patch<{ message: string }>(`/platform/users/${userId}/status`, data);
    return response.data;
  },

  async resendInvite(userId: number): Promise<ResendInviteResponse> {
    const response = await apiClient.post<ResendInviteResponse>(`/platform/users/${userId}/resend-invite`);
    return response.data;
  },
};
