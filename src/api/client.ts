import axios from 'axios'
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

// ========== Type Definitions ==========

export type TestType = 'LOAD' | 'STRESS' | 'SPIKE' | 'SOAK'
export type TestStatus = 'CREATED' | 'RUNNING' | 'COMPLETED' | 'FAILED'

export interface Test {
  id: number
  name: string
  description?: string
  targetUrl: string
  url?: string  // Alias for targetUrl
  virtualUsers: number
  vus?: number  // Alias for virtualUsers
  duration: string
  testType: TestType
  status: TestStatus
  script?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface TestResultMetrics {
  httpReqDuration: {
    avg: number
    min: number
    max: number
    p90: number
    p95: number
    p99: number
  }
  httpReqs: number
  httpReqFailed: number
  vusMax: number
  [key: string]: any
}

export interface TestResult {
  id: number
  testId: number
  testName?: string
  status: string
  startedAt: string
  completedAt?: string
  totalRequests: number
  failedRequests: number
  avgResponseTime: number
  minResponseTime: number
  maxResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
  requestsPerSecond: number
  errorRate: number
  metrics?: TestResultMetrics | string
  analysis?: {
    suggestions?: string[]
    summary?: string
  }
  rawOutput?: string
}

export interface Template {
  id: number
  name: string
  description?: string
  testType: TestType
  virtualUsers: number
  vus?: number  // Alias for virtualUsers
  duration: string
  rampUpTime?: string
  script?: string
  isSystem: boolean
  createdAt: string
  icon?: string
  url?: string
}

export interface CreateTestRequest {
  name: string
  description?: string
  targetUrl?: string
  url?: string  // Alias for targetUrl
  virtualUsers?: number
  vus?: number  // Alias for virtualUsers
  duration: string
  testType: TestType
  templateId?: number
  script?: string
}

export interface ErrorResponse {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
}

// ========== API Client ==========

// Create axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status

      if (status === 401) {
        // Unauthorized - clear auth and redirect to login
        localStorage.removeItem('auth_token')
        window.location.href = '/login'
      } else if (status === 403) {
        // Forbidden - no permission
        console.error('Access denied:', error.response.data)
      } else if (status === 500) {
        // Server error
        console.error('Server error:', error.response.data)
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network error:', error.message)
    }

    return Promise.reject(error)
  }
)

// ========== API Methods ==========

interface DashboardStats {
  totalTests: number
  successRate: number
  avgResponseTime: number
  testsThisWeek: number
}

interface AvailableReports {
  markdown: boolean
  html: boolean
}

// API wrapper with typed methods
const api = {
  // Tests
  async getAllTests(): Promise<Test[]> {
    const response = await apiClient.get<Test[]>('/api/tests')
    return response.data
  },

  async getTest(id: number): Promise<Test> {
    const response = await apiClient.get<Test>(`/api/tests/${id}`)
    return response.data
  },

  async createTest(data: CreateTestRequest): Promise<Test> {
    const response = await apiClient.post<Test>('/api/tests', data)
    return response.data
  },

  async runTest(id: number): Promise<TestResult> {
    const response = await apiClient.post<TestResult>(`/api/tests/${id}/run`)
    return response.data
  },

  async deleteTest(id: number): Promise<void> {
    await apiClient.delete(`/api/tests/${id}`)
  },

  // Results
  async getTestResult(id: number): Promise<TestResult> {
    const response = await apiClient.get<TestResult>(`/api/tests/${id}/result`)
    return response.data
  },

  async getAllResults(): Promise<TestResult[]> {
    const response = await apiClient.get<TestResult[]>('/api/results')
    return response.data
  },

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await apiClient.get<DashboardStats>('/api/dashboard/stats')
      return response.data
    } catch {
      // Fallback to calculating from tests
      const tests = await this.getAllTests()
      const completedTests = tests.filter(t => t.status === 'COMPLETED')
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const testsThisWeek = tests.filter(t => new Date(t.createdAt) >= weekAgo).length

      return {
        totalTests: tests.length,
        successRate: tests.length > 0 ? (completedTests.length / tests.length) * 100 : 0,
        avgResponseTime: 0,
        testsThisWeek
      }
    }
  },

  // Templates
  async getTemplates(): Promise<Template[]> {
    const response = await apiClient.get<Template[]>('/api/templates')
    return response.data
  },

  async getSystemTemplates(): Promise<Template[]> {
    const response = await apiClient.get<Template[]>('/api/templates/system')
    return response.data
  },

  async getTemplatesByType(type: TestType): Promise<Template[]> {
    const response = await apiClient.get<Template[]>(`/api/templates/type/${type}`)
    return response.data
  },

  // Reports
  async checkAvailableReports(testId: number): Promise<AvailableReports> {
    try {
      const response = await apiClient.get<AvailableReports>(`/api/tests/${testId}/reports/available`)
      return response.data
    } catch {
      return { markdown: false, html: false }
    }
  },

  async generateMarkdownReport(testId: number): Promise<string> {
    const response = await apiClient.post<string>(`/api/tests/${testId}/reports/markdown`)
    return response.data
  },

  async downloadReport(testId: number, format: 'markdown' | 'html'): Promise<void> {
    const url = `/api/tests/${testId}/reports/${format}/download`
    const response = await apiClient.get(url, { responseType: 'blob' })
    const blob = new Blob([response.data])
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `test-report-${testId}.${format === 'markdown' ? 'md' : 'html'}`
    link.click()
    URL.revokeObjectURL(link.href)
  },

  async getReportContent(testId: number): Promise<string> {
    const response = await apiClient.get<string>(`/api/tests/${testId}/reports/markdown/content`)
    return response.data
  },

  async getMarkdownContent(testId: number): Promise<string> {
    const response = await apiClient.get<string>(`/api/tests/${testId}/reports/markdown/content`)
    return response.data
  },

  // Generic methods for direct access with proper typing
  async get<T>(url: string, config?: Parameters<typeof apiClient.get>[1]): Promise<T> {
    const response = await apiClient.get<T>(url, config)
    return response.data
  },

  async post<T>(url: string, data?: unknown, config?: Parameters<typeof apiClient.post>[2]): Promise<T> {
    const response = await apiClient.post<T>(url, data, config)
    return response.data
  },

  async put<T>(url: string, data?: unknown, config?: Parameters<typeof apiClient.put>[2]): Promise<T> {
    const response = await apiClient.put<T>(url, data, config)
    return response.data
  },

  async delete<T>(url: string, config?: Parameters<typeof apiClient.delete>[1]): Promise<T> {
    const response = await apiClient.delete<T>(url, config)
    return response.data
  }
}

// Named export for compatibility (as the typed API wrapper)
export { api as apiClient }

// Default export (raw axios instance for advanced usage)
export default apiClient
