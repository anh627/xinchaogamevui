import { apiService } from './api';
import { User, UserStatistics } from '../types';

export interface UpdateProfileData {
  username?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'auto';
  soundEnabled?: boolean;
  notificationsEnabled?: boolean;
  language?: string;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  rating: number;
  wins: number;
  losses: number;
  winRate: number;
}

class UserService {
  private baseUrl = '/api/users';

  // Get current user profile
  async getProfile(): Promise<User> {
    return apiService.get<User>(`${this.baseUrl}/profile`);
  }

  // Update user profile
  async updateProfile(data: UpdateProfileData): Promise<User> {
    return apiService.put<User>(`${this.baseUrl}/profile`, data);
  }

  // Get user by ID
  async getUser(userId: string): Promise<User> {
    return apiService.get<User>(`${this.baseUrl}/${userId}`);
  }

  // Get user statistics
  async getUserStatistics(userId: string): Promise<UserStatistics> {
    return apiService.get<UserStatistics>(`${this.baseUrl}/${userId}/statistics`);
  }

  // Get global leaderboard
  async getLeaderboard(gameType?: string, limit = 100): Promise<LeaderboardEntry[]> {
    const params = { limit, ...(gameType && { gameType }) };
    return apiService.get<LeaderboardEntry[]>(`${this.baseUrl}/leaderboard`, { params });
  }

  // Get friends list
  async getFriends(): Promise<User[]> {
    return apiService.get<User[]>(`${this.baseUrl}/friends`);
  }

  // Add friend
  async addFriend(userId: string): Promise<void> {
    return apiService.post(`${this.baseUrl}/friends/${userId}`);
  }

  // Remove friend
  async removeFriend(userId: string): Promise<void> {
    return apiService.delete(`${this.baseUrl}/friends/${userId}`);
  }

  // Get friend requests
  async getFriendRequests(): Promise<any[]> {
    return apiService.get(`${this.baseUrl}/friend-requests`);
  }

  // Accept friend request
  async acceptFriendRequest(requestId: string): Promise<void> {
    return apiService.post(`${this.baseUrl}/friend-requests/${requestId}/accept`);
  }

  // Reject friend request
  async rejectFriendRequest(requestId: string): Promise<void> {
    return apiService.post(`${this.baseUrl}/friend-requests/${requestId}/reject`);
  }

  // Upload avatar
  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await apiService.post<{ url: string }>(
      `${this.baseUrl}/avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.url;
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return apiService.post(`${this.baseUrl}/change-password`, {
      currentPassword,
      newPassword
    });
  }

  // Delete account
  async deleteAccount(password: string): Promise<void> {
    return apiService.delete(`${this.baseUrl}/account`, {
      data: { password }
    });
  }

  // Get notifications
  async getNotifications(): Promise<any[]> {
    return apiService.get(`${this.baseUrl}/notifications`);
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<void> {
    return apiService.post(`${this.baseUrl}/notifications/${notificationId}/read`);
  }

  // Get achievements
  async getAchievements(): Promise<any[]> {
    return apiService.get(`${this.baseUrl}/achievements`);
  }
}

export const userService = new UserService();