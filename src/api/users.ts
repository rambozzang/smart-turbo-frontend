import apiClient from './client'
import type { User } from '../stores/auth'

// Re-export User type for convenience
export type { User }

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  fullName?: string
  role: 'ADMIN' | 'MANAGER' | 'TESTER' | 'VIEWER'
}

export interface UpdateUserRequest {
  email?: string
  fullName?: string
  role?: 'ADMIN' | 'MANAGER' | 'TESTER' | 'VIEWER'
  status?: 'ACTIVE' | 'INACTIVE' | 'LOCKED'
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface UserStats {
  totalUsers: number
  activeUsers: number
  usersByRole: Record<string, number>
}

export interface AuditLog {
  id: number
  userId: number | null
  username: string
  action: string
  resourceType: string | null
  resourceId: string | null
  details: string | null
  ipAddress: string | null
  createdAt: string
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export const userApi = {
  // Create user
  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await apiClient.post<User>('/api/users', data)
    return response.data
  },

  // Get all users
  async getAllUsers(page = 0, size = 20): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<PaginatedResponse<User>>('/api/users', {
      params: { page, size, sort: 'createdAt,desc' }
    })
    return response.data
  },

  // Get user by ID
  async getUserById(id: number): Promise<User> {
    const response = await apiClient.get<User>(`/api/users/${id}`)
    return response.data
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/api/users/me')
    return response.data
  },

  // Update user
  async updateUser(id: number, data: UpdateUserRequest): Promise<User> {
    const response = await apiClient.put<User>(`/api/users/${id}`, data)
    return response.data
  },

  // Delete user
  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`/api/users/${id}`)
  },

  // Change password
  async changePassword(userId: number, data: ChangePasswordRequest): Promise<void> {
    await apiClient.post(`/api/users/${userId}/password`, data)
  },

  // Get user stats
  async getUserStats(): Promise<UserStats> {
    const response = await apiClient.get<UserStats>('/api/users/stats')
    return response.data
  },

  // Get audit logs
  async getAuditLogs(page = 0, size = 50): Promise<PaginatedResponse<AuditLog>> {
    const response = await apiClient.get<PaginatedResponse<AuditLog>>('/api/audit-logs', {
      params: { page, size, sort: 'createdAt,desc' }
    })
    return response.data
  },

  // Get user audit logs
  async getUserAuditLogs(userId: number, page = 0, size = 50): Promise<PaginatedResponse<AuditLog>> {
    const response = await apiClient.get<PaginatedResponse<AuditLog>>(`/api/users/${userId}/audit-logs`, {
      params: { page, size, sort: 'createdAt,desc' }
    })
    return response.data
  }
}
