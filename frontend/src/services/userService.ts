import api from './api';
import type { User } from '@/types';

export const userService = {
  // Get current user profile
  getProfile: async () => {
    return api.get<{ user: User }>('/users/profile');
  },

  // Update user profile
  updateProfile: async (data: {
    displayName?: string;
    username?: string;
    avatar?: string;
    preferences?: Partial<User['preferences']>;
  }) => {
    return api.patch<{ user: User }>('/users/profile', data);
  },

  // Check username availability
  checkUsername: async (username: string) => {
    return api.get<{ available: boolean }>(`/users/check-username/${username}`);
  },

  // Get user stats
  getStats: async () => {
    return api.get<{
      stats: {
        totalLabels: number;
        totalDownloads: number;
        lastActiveAt: string;
        memberSince: string;
      };
    }>('/users/stats');
  },

  // Delete account
  deleteAccount: async () => {
    return api.delete('/users/account');
  },

  // Get recent activity
  getRecentActivity: async (limit?: number) => {
    return api.get<{
      activities: Array<{
        id: string;
        action: 'CREATE_LABEL' | 'UPDATE_LABEL' | 'DELETE_LABEL' | 'PUBLISH_LABEL';
        labelId?: string;
        labelName: string;
        timestamp: string;
      }>;
    }>('/users/activity', { params: { limit } });
  },
};

export default userService;
