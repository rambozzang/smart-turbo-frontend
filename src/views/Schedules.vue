<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiClient } from '../api/client'

const { t } = useI18n()

interface Test {
  id: number
  name: string
}

interface Schedule {
  id: number
  name: string
  description: string | null
  testId: number
  testName: string
  scheduleType: 'ONCE' | 'INTERVAL' | 'CRON' | 'DAILY' | 'WEEKLY' | 'MONTHLY'
  cronExpression: string | null
  intervalMinutes: number | null
  scheduledAt: string | null
  repeatCount: number | null
  executionsCount: number
  enabled: boolean
  lastRunAt: string | null
  nextRunAt: string | null
  lastRunStatus: string | null
  timezone: string
  createdAt: string
  updatedAt: string
}

interface ScheduleExecution {
  id: number
  scheduleId: number
  scheduleName: string
  testId: number | null
  status: string
  startedAt: string | null
  completedAt: string | null
  errorMessage: string | null
  createdAt: string
}

const schedules = ref<Schedule[]>([])
const tests = ref<Test[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showHistoryModal = ref(false)
const selectedSchedule = ref<Schedule | null>(null)
const executionHistory = ref<ScheduleExecution[]>([])

// Form state
const formData = ref({
  name: '',
  description: '',
  testId: 0,
  scheduleType: 'INTERVAL' as Schedule['scheduleType'],
  cronExpression: '',
  intervalMinutes: 60,
  scheduledAt: '',
  repeatCount: null as number | null,
  timezone: 'Asia/Seoul',
  enabled: true
})

const scheduleTypes = [
  { value: 'ONCE', label: '1회 실행' },
  { value: 'INTERVAL', label: '반복 간격' },
  { value: 'CRON', label: 'Cron 표현식' },
  { value: 'DAILY', label: '매일' },
  { value: 'WEEKLY', label: '매주' },
  { value: 'MONTHLY', label: '매월' }
]

const timezones = [
  'Asia/Seoul',
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai'
]

// Fetch schedules
async function fetchSchedules() {
  isLoading.value = true
  error.value = null
  try {
    schedules.value = await apiClient.get<Schedule[]>('/schedules')
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch schedules'
  } finally {
    isLoading.value = false
  }
}

// Fetch tests for dropdown
async function fetchTests() {
  try {
    tests.value = await apiClient.get<Test[]>('/tests')
  } catch (err) {
    console.error('Failed to fetch tests:', err)
  }
}

// Create schedule
async function createSchedule() {
  try {
    const payload: any = {
      name: formData.value.name,
      description: formData.value.description || null,
      testId: formData.value.testId,
      scheduleType: formData.value.scheduleType,
      timezone: formData.value.timezone
    }

    if (formData.value.scheduleType === 'CRON' ||
        formData.value.scheduleType === 'DAILY' ||
        formData.value.scheduleType === 'WEEKLY' ||
        formData.value.scheduleType === 'MONTHLY') {
      payload.cronExpression = formData.value.cronExpression
    }

    if (formData.value.scheduleType === 'INTERVAL') {
      payload.intervalMinutes = formData.value.intervalMinutes
    }

    if (formData.value.scheduleType === 'ONCE') {
      payload.scheduledAt = formData.value.scheduledAt
    }

    if (formData.value.repeatCount) {
      payload.repeatCount = formData.value.repeatCount
    }

    await apiClient.post('/schedules', payload)
    showCreateModal.value = false
    resetForm()
    await fetchSchedules()
  } catch (err: any) {
    error.value = err.message || 'Failed to create schedule'
  }
}

// Update schedule
async function updateSchedule() {
  if (!selectedSchedule.value) return

  try {
    const payload: any = {
      name: formData.value.name,
      description: formData.value.description || null,
      scheduleType: formData.value.scheduleType,
      timezone: formData.value.timezone,
      enabled: formData.value.enabled
    }

    if (formData.value.scheduleType === 'CRON' ||
        formData.value.scheduleType === 'DAILY' ||
        formData.value.scheduleType === 'WEEKLY' ||
        formData.value.scheduleType === 'MONTHLY') {
      payload.cronExpression = formData.value.cronExpression
    }

    if (formData.value.scheduleType === 'INTERVAL') {
      payload.intervalMinutes = formData.value.intervalMinutes
    }

    if (formData.value.scheduleType === 'ONCE') {
      payload.scheduledAt = formData.value.scheduledAt
    }

    if (formData.value.repeatCount) {
      payload.repeatCount = formData.value.repeatCount
    }

    await apiClient.put(`/schedules/${selectedSchedule.value.id}`, payload)
    showEditModal.value = false
    selectedSchedule.value = null
    resetForm()
    await fetchSchedules()
  } catch (err: any) {
    error.value = err.message || 'Failed to update schedule'
  }
}

// Delete schedule
async function deleteSchedule(id: number) {
  if (!confirm('Are you sure you want to delete this schedule?')) return

  try {
    await apiClient.delete(`/schedules/${id}`)
    await fetchSchedules()
  } catch (err: any) {
    error.value = err.message || 'Failed to delete schedule'
  }
}

// Toggle schedule enabled
async function toggleSchedule(id: number) {
  try {
    await apiClient.post(`/schedules/${id}/toggle`, {})
    await fetchSchedules()
  } catch (err: any) {
    error.value = err.message || 'Failed to toggle schedule'
  }
}

// Run schedule now
async function runNow(id: number) {
  try {
    await apiClient.post(`/schedules/${id}/run`, {})
    await fetchSchedules()
  } catch (err: any) {
    error.value = err.message || 'Failed to run schedule'
  }
}

// Show execution history
async function showHistory(schedule: Schedule) {
  selectedSchedule.value = schedule
  try {
    const response = await apiClient.get<{ content: ScheduleExecution[] }>(`/schedules/${schedule.id}/executions`)
    executionHistory.value = response.content || []
    showHistoryModal.value = true
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch execution history'
  }
}

// Edit schedule
function editSchedule(schedule: Schedule) {
  selectedSchedule.value = schedule
  formData.value = {
    name: schedule.name,
    description: schedule.description || '',
    testId: schedule.testId,
    scheduleType: schedule.scheduleType,
    cronExpression: schedule.cronExpression || '',
    intervalMinutes: schedule.intervalMinutes || 60,
    scheduledAt: schedule.scheduledAt || '',
    repeatCount: schedule.repeatCount,
    timezone: schedule.timezone,
    enabled: schedule.enabled
  }
  showEditModal.value = true
}

// Reset form
function resetForm() {
  formData.value = {
    name: '',
    description: '',
    testId: 0,
    scheduleType: 'INTERVAL',
    cronExpression: '',
    intervalMinutes: 60,
    scheduledAt: '',
    repeatCount: null,
    timezone: 'Asia/Seoul',
    enabled: true
  }
}

// Format date
function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('ko-KR')
}

// Get schedule description
function getScheduleDescription(schedule: Schedule): string {
  switch (schedule.scheduleType) {
    case 'ONCE':
      return `1회: ${formatDate(schedule.scheduledAt)}`
    case 'INTERVAL':
      return `${schedule.intervalMinutes}분 간격`
    case 'CRON':
      return `Cron: ${schedule.cronExpression}`
    case 'DAILY':
      return `매일 (${schedule.cronExpression})`
    case 'WEEKLY':
      return `매주 (${schedule.cronExpression})`
    case 'MONTHLY':
      return `매월 (${schedule.cronExpression})`
    default:
      return '-'
  }
}

// Get status color
function getStatusColor(status: string | null): string {
  switch (status) {
    case 'COMPLETED':
      return 'bg-accent-success/10 text-accent-success border-accent-success/20'
    case 'FAILED':
      return 'bg-accent-error/10 text-accent-error border-accent-error/20'
    case 'RUNNING':
      return 'bg-accent-warning/10 text-accent-warning border-accent-warning/20'
    default:
      return 'bg-slate-100 dark:bg-dark-bg-tertiary text-slate-500 dark:text-slate-400 border-slate-500 dark:border-dark-border-primary'
  }
}

onMounted(() => {
  fetchSchedules()
  fetchTests()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          {{ t('schedules.title') }}
        </h1>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-400 font-mono">
          {{ t('schedules.subtitle') }}
        </p>
      </div>
      <button
        @click="showCreateModal = true"
        class="px-4 py-2 bg-accent-primary text-white text-xs font-mono uppercase tracking-wider hover:bg-accent-primary/90 transition-all"
      >
        {{ t('schedules.createSchedule') }}
      </button>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="bg-accent-error/10 border border-accent-error/20 text-accent-error px-4 py-3 text-sm">
      {{ error }}
      <button @click="error = null" class="ml-2 underline">Dismiss</button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-accent-primary border-t-transparent"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="schedules.length === 0" class="bg-white dark:bg-dark-bg-secondary border border-slate-500 dark:border-dark-border-primary p-8 text-center">
      <svg class="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">No schedules</h3>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Get started by creating a new schedule.</p>
    </div>

    <!-- Schedule List -->
    <div v-else class="bg-white dark:bg-dark-bg-secondary border border-slate-500 dark:border-dark-border-primary">
      <div class="px-6 py-3 border-b border-slate-500 dark:border-dark-border-primary">
        <h2 class="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          {{ t('schedules.activeSchedules') }} ({{ schedules.length }})
        </h2>
      </div>
      <div class="divide-y divide-slate-200 dark:divide-dark-border-primary">
        <div v-for="schedule in schedules" :key="schedule.id" class="px-6 py-4 hover:bg-slate-50 dark:hover:bg-dark-bg-tertiary transition-colors">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3">
                <h3 class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ schedule.name }}</h3>
                <span :class="schedule.enabled ? 'bg-accent-success/10 text-accent-success border-accent-success/20' : 'bg-slate-100 dark:bg-dark-bg-tertiary text-slate-500 dark:text-slate-400 border-slate-500'" class="px-2 py-0.5 text-xs font-mono uppercase border">
                  {{ schedule.enabled ? t('schedules.active') : t('schedules.paused') }}
                </span>
              </div>
              <p v-if="schedule.description" class="mt-1 text-xs text-slate-500 dark:text-slate-400">{{ schedule.description }}</p>
              <div class="mt-2 flex items-center space-x-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                <span>📋 {{ schedule.testName }}</span>
                <span>•</span>
                <span>⏱️ {{ getScheduleDescription(schedule) }}</span>
                <span>•</span>
                <span>🌐 {{ schedule.timezone }}</span>
              </div>
              <div class="mt-1 flex items-center space-x-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                <span>{{ t('schedules.nextRun') }}: {{ formatDate(schedule.nextRunAt) }}</span>
                <span v-if="schedule.lastRunAt">•</span>
                <span v-if="schedule.lastRunAt">Last: {{ formatDate(schedule.lastRunAt) }}</span>
                <span v-if="schedule.lastRunStatus" :class="getStatusColor(schedule.lastRunStatus)" class="px-1.5 py-0.5 border text-xs">
                  {{ schedule.lastRunStatus }}
                </span>
                <span>•</span>
                <span>Runs: {{ schedule.executionsCount }}</span>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button
                @click="runNow(schedule.id)"
                class="p-2 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary transition-colors text-accent-primary"
                title="Run Now"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button
                @click="toggleSchedule(schedule.id)"
                class="p-2 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary transition-colors"
                :class="schedule.enabled ? 'text-accent-success' : 'text-slate-400'"
                :title="schedule.enabled ? 'Pause' : 'Enable'"
              >
                <svg v-if="schedule.enabled" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button
                @click="showHistory(schedule)"
                class="p-2 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary transition-colors text-slate-600 dark:text-slate-400"
                title="History"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button
                @click="editSchedule(schedule)"
                class="p-2 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary transition-colors text-slate-600 dark:text-slate-400"
                title="Edit"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="deleteSchedule(schedule.id)"
                class="p-2 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary transition-colors text-accent-error"
                title="Delete"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-dark-bg-secondary border border-slate-500 dark:border-dark-border-primary w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-slate-500 dark:border-dark-border-primary">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {{ showEditModal ? 'Edit Schedule' : 'Create Schedule' }}
          </h2>
        </div>
        <div class="p-6 space-y-4">
          <!-- Name -->
          <div>
            <label class="block text-xs font-mono uppercase text-slate-600 dark:text-slate-400 mb-1">Name *</label>
            <input
              v-model="formData.name"
              type="text"
              class="w-full px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-slate-300 dark:border-dark-border-primary text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="Daily Health Check"
            />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-xs font-mono uppercase text-slate-600 dark:text-slate-400 mb-1">Description</label>
            <textarea
              v-model="formData.description"
              rows="2"
              class="w-full px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-slate-300 dark:border-dark-border-primary text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="Optional description"
            ></textarea>
          </div>

          <!-- Test Selection -->
          <div v-if="!showEditModal">
            <label class="block text-xs font-mono uppercase text-slate-600 dark:text-slate-400 mb-1">Test *</label>
            <select
              v-model="formData.testId"
              class="w-full px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-slate-300 dark:border-dark-border-primary text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary"
            >
              <option :value="0" disabled>Select a test</option>
              <option v-for="test in tests" :key="test.id" :value="test.id">{{ test.name }}</option>
            </select>
          </div>

          <!-- Schedule Type -->
          <div>
            <label class="block text-xs font-mono uppercase text-slate-600 dark:text-slate-400 mb-1">Schedule Type *</label>
            <select
              v-model="formData.scheduleType"
              class="w-full px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-slate-300 dark:border-dark-border-primary text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary"
            >
              <option v-for="type in scheduleTypes" :key="type.value" :value="type.value">{{ type.label }}</option>
            </select>
          </div>

          <!-- Cron Expression (for CRON, DAILY, WEEKLY, MONTHLY) -->
          <div v-if="['CRON', 'DAILY', 'WEEKLY', 'MONTHLY'].includes(formData.scheduleType)">
            <label class="block text-xs font-mono uppercase text-slate-600 dark:text-slate-400 mb-1">Cron Expression *</label>
            <input
              v-model="formData.cronExpression"
              type="text"
              class="w-full px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-slate-300 dark:border-dark-border-primary text-slate-900 dark:text-slate-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="0 9 * * *"
            />
            <p class="mt-1 text-xs text-slate-500">Format: minute hour day-of-month month day-of-week</p>
          </div>

          <!-- Interval Minutes (for INTERVAL) -->
          <div v-if="formData.scheduleType === 'INTERVAL'">
            <label class="block text-xs font-mono uppercase text-slate-600 dark:text-slate-400 mb-1">Interval (minutes) *</label>
            <input
              v-model.number="formData.intervalMinutes"
              type="number"
              min="1"
              class="w-full px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-slate-300 dark:border-dark-border-primary text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary"
            />
          </div>

          <!-- Scheduled At (for ONCE) -->
          <div v-if="formData.scheduleType === 'ONCE'">
            <label class="block text-xs font-mono uppercase text-slate-600 dark:text-slate-400 mb-1">Scheduled At *</label>
            <input
              v-model="formData.scheduledAt"
              type="datetime-local"
              class="w-full px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-slate-300 dark:border-dark-border-primary text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary"
            />
          </div>

          <!-- Repeat Count -->
          <div>
            <label class="block text-xs font-mono uppercase text-slate-600 dark:text-slate-400 mb-1">Repeat Count (optional)</label>
            <input
              v-model.number="formData.repeatCount"
              type="number"
              min="1"
              class="w-full px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-slate-300 dark:border-dark-border-primary text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="Leave empty for unlimited"
            />
          </div>

          <!-- Timezone -->
          <div>
            <label class="block text-xs font-mono uppercase text-slate-600 dark:text-slate-400 mb-1">Timezone</label>
            <select
              v-model="formData.timezone"
              class="w-full px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-slate-300 dark:border-dark-border-primary text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary"
            >
              <option v-for="tz in timezones" :key="tz" :value="tz">{{ tz }}</option>
            </select>
          </div>

          <!-- Enabled (for edit only) -->
          <div v-if="showEditModal" class="flex items-center space-x-2">
            <input
              v-model="formData.enabled"
              type="checkbox"
              id="enabled"
              class="w-4 h-4"
            />
            <label for="enabled" class="text-sm text-slate-700 dark:text-slate-300">Enabled</label>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-slate-500 dark:border-dark-border-primary flex justify-end space-x-3">
          <button
            @click="showCreateModal = false; showEditModal = false; resetForm()"
            class="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary transition-colors"
          >
            Cancel
          </button>
          <button
            @click="showEditModal ? updateSchedule() : createSchedule()"
            class="px-4 py-2 bg-accent-primary text-white text-sm font-medium hover:bg-accent-primary/90 transition-colors"
          >
            {{ showEditModal ? 'Update' : 'Create' }}
          </button>
        </div>
      </div>
    </div>

    <!-- History Modal -->
    <div v-if="showHistoryModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-dark-bg-secondary border border-slate-500 dark:border-dark-border-primary w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <div class="px-6 py-4 border-b border-slate-500 dark:border-dark-border-primary flex justify-between items-center">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Execution History: {{ selectedSchedule?.name }}
          </h2>
          <button @click="showHistoryModal = false" class="text-slate-400 hover:text-slate-600">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto">
          <div v-if="executionHistory.length === 0" class="p-8 text-center text-slate-500">
            No execution history yet.
          </div>
          <table v-else class="w-full">
            <thead class="bg-slate-50 dark:bg-dark-bg-tertiary sticky top-0">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-mono uppercase text-slate-500">Status</th>
                <th class="px-4 py-2 text-left text-xs font-mono uppercase text-slate-500">Started</th>
                <th class="px-4 py-2 text-left text-xs font-mono uppercase text-slate-500">Completed</th>
                <th class="px-4 py-2 text-left text-xs font-mono uppercase text-slate-500">Error</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-dark-border-primary">
              <tr v-for="exec in executionHistory" :key="exec.id" class="hover:bg-slate-50 dark:hover:bg-dark-bg-tertiary">
                <td class="px-4 py-3">
                  <span :class="getStatusColor(exec.status)" class="px-2 py-0.5 text-xs font-mono uppercase border">
                    {{ exec.status }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 font-mono">{{ formatDate(exec.startedAt) }}</td>
                <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 font-mono">{{ formatDate(exec.completedAt) }}</td>
                <td class="px-4 py-3 text-sm text-accent-error font-mono truncate max-w-xs" :title="exec.errorMessage || ''">
                  {{ exec.errorMessage || '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
