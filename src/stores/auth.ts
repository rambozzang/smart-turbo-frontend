import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export interface User {
  id: number
  username: string
  email: string
  fullName: string | null
  role: 'ADMIN' | 'MANAGER' | 'TESTER' | 'VIEWER'
  permissions: string[]
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED'
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
}

interface LoginResponse {
  success: boolean
  token: string
  expiresIn: number
  user: User
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const isManager = computed(() => user.value?.role === 'MANAGER')
  const canManageUsers = computed(() =>
    user.value?.role === 'ADMIN' || user.value?.role === 'MANAGER'
  )
  const canCreateTests = computed(() =>
    user.value?.permissions.includes('CREATE_TESTS')
  )
  const canRunTests = computed(() =>
    user.value?.permissions.includes('RUN_TESTS')
  )

  // Actions
  async function login(username: string, password: string) {
    isLoading.value = true
    error.value = null

    try {
      const response = await axios.post<LoginResponse>('/api/auth/login', {
        username,
        password
      })

      if (response.data.success) {
        token.value = response.data.token
        user.value = response.data.user

        // Store token in localStorage
        localStorage.setItem('auth_token', response.data.token)

        // Set default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`

        return true
      }
      return false
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try {
      await axios.post('/api/auth/logout')
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // Clear state
      token.value = null
      user.value = null
      localStorage.removeItem('auth_token')
      delete axios.defaults.headers.common['Authorization']
    }
  }

  async function verifyToken() {
    if (!token.value) return false

    try {
      const response = await axios.get('/api/auth/verify')
      if (response.data.valid) {
        user.value = response.data.user
        return true
      }
      return false
    } catch (err) {
      // Token invalid, clear auth
      await logout()
      return false
    }
  }

  async function fetchCurrentUser() {
    try {
      const response = await axios.get<User>('/api/users/me')
      user.value = response.data
      return response.data
    } catch (err) {
      console.error('Failed to fetch current user:', err)
      return null
    }
  }

  function hasPermission(permission: string): boolean {
    return user.value?.permissions.includes(permission) ?? false
  }

  function hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(p => hasPermission(p))
  }

  function hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(p => hasPermission(p))
  }

  function hasRole(role: string): boolean {
    return user.value?.role === role
  }

  function hasAnyRole(roles: string[]): boolean {
    return roles.some(r => hasRole(r))
  }

  // Initialize
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
    verifyToken()
  }

  return {
    // State
    token,
    user,
    isLoading,
    error,

    // Computed
    isAuthenticated,
    isAdmin,
    isManager,
    canManageUsers,
    canCreateTests,
    canRunTests,

    // Actions
    login,
    logout,
    verifyToken,
    fetchCurrentUser,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole
  }
})
