<script setup lang="ts">
// @ts-nocheck
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface NotificationConfig {
  id?: number
  name: string
  type: 'SLACK' | 'EMAIL' | 'WEBHOOK' | 'DISCORD' | 'TEAMS'
  enabled: boolean
  slackWebhookUrl?: string
  slackChannel?: string
  emailRecipients?: string
  smtpHost?: string
  smtpPort?: number
  smtpUsername?: string
  smtpPassword?: string
  webhookUrl?: string
  webhookHeaders?: string
  onTestComplete: boolean
  onTestFailed: boolean
  onThresholdExceeded: boolean
}

const configs = ref<NotificationConfig[]>([])
const loading = ref(true)
const showModal = ref(false)
const editingConfig = ref<NotificationConfig | null>(null)
const testingId = ref<number | null>(null)
const testResult = ref<{ success: boolean; message: string } | null>(null)

const newConfig = ref<NotificationConfig>({
  name: '',
  type: 'SLACK',
  enabled: true,
  slackWebhookUrl: '',
  slackChannel: '',
  emailRecipients: '',
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  smtpUsername: '',
  smtpPassword: '',
  webhookUrl: '',
  webhookHeaders: '{}',
  onTestComplete: true,
  onTestFailed: true,
  onThresholdExceeded: true
})

const notificationTypes = [
  { value: 'SLACK', label: 'Slack', icon: '💬' },
  { value: 'EMAIL', label: 'Email', icon: '📧' },
  { value: 'WEBHOOK', label: 'Webhook', icon: '🔗' },
  { value: 'DISCORD', label: 'Discord', icon: '🎮' },
  { value: 'TEAMS', label: 'Microsoft Teams', icon: '👥' }
]

const getTypeIcon = (type: string) => {
  return notificationTypes.find(t => t.value === type)?.icon || '📢'
}

const getTypeLabel = (type: string) => {
  return notificationTypes.find(t => t.value === type)?.label || type
}

onMounted(async () => {
  await fetchConfigs()
})

async function fetchConfigs() {
  try {
    loading.value = true
    const response = await fetch('/api/notifications/configs')
    configs.value = await response.json()
  } catch (error) {
    console.error('Failed to fetch configs:', error)
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  editingConfig.value = null
  newConfig.value = {
    name: '',
    type: 'SLACK',
    enabled: true,
    slackWebhookUrl: '',
    slackChannel: '',
    emailRecipients: '',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    webhookUrl: '',
    webhookHeaders: '{}',
    onTestComplete: true,
    onTestFailed: true,
    onThresholdExceeded: true
  }
  showModal.value = true
}

function openEditModal(config: NotificationConfig) {
  editingConfig.value = config
  newConfig.value = { ...config }
  showModal.value = true
}

async function saveConfig() {
  try {
    const url = editingConfig.value
      ? `/api/notifications/configs/${editingConfig.value.id}`
      : '/api/notifications/configs'

    const method = editingConfig.value ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig.value)
    })

    if (response.ok) {
      showModal.value = false
      await fetchConfigs()
    }
  } catch (error) {
    console.error('Failed to save config:', error)
  }
}

async function deleteConfig(id: number) {
  if (!confirm('Are you sure you want to delete this notification configuration?')) return

  try {
    await fetch(`/api/notifications/configs/${id}`, { method: 'DELETE' })
    await fetchConfigs()
  } catch (error) {
    console.error('Failed to delete config:', error)
  }
}

async function toggleEnabled(config: NotificationConfig) {
  try {
    await fetch(`/api/notifications/configs/${config.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...config, enabled: !config.enabled })
    })
    await fetchConfigs()
  } catch (error) {
    console.error('Failed to toggle config:', error)
  }
}

async function testNotification(id: number) {
  try {
    testingId.value = id
    testResult.value = null

    const response = await fetch(`/api/notifications/configs/${id}/test`, {
      method: 'POST'
    })

    testResult.value = await response.json()

    setTimeout(() => {
      testResult.value = null
    }, 5000)
  } catch (error) {
    testResult.value = { success: false, message: 'Failed to send test notification' }
  } finally {
    testingId.value = null
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          Notification Settings
        </h1>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-400 font-mono">
          Configure alerts for test completion, failures, and threshold exceeded
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="px-4 py-2 bg-accent-primary text-white text-xs font-mono uppercase tracking-wider hover:bg-accent-primary/90 transition-all border border-accent-primary/20 flex items-center space-x-2"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>Add Channel</span>
      </button>
    </div>

    <!-- Test Result Toast -->
    <div v-if="testResult"
         :class="[
           'fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 transition-all',
           testResult.success ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
         ]">
      <div class="flex items-center space-x-2">
        <span>{{ testResult.success ? '✅' : '❌' }}</span>
        <span class="font-mono text-sm">{{ testResult.message }}</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-12 text-center bg-white dark:bg-dark-bg-secondary border border-slate-500 dark:border-dark-border-primary">
      <div class="inline-block w-8 h-8 border-2 border-slate-500 dark:border-dark-border-primary border-t-accent-primary rounded-full animate-spin"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="configs.length === 0" class="p-12 text-center bg-white dark:bg-dark-bg-secondary border border-slate-500 dark:border-dark-border-primary">
      <div class="text-4xl mb-4">🔔</div>
      <h3 class="text-lg font-mono text-slate-700 dark:text-slate-300 mb-2">No Notifications Configured</h3>
      <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">Add a notification channel to receive alerts when tests complete or fail.</p>
      <button
        @click="openCreateModal"
        class="px-4 py-2 bg-accent-primary text-white text-xs font-mono uppercase tracking-wider hover:bg-accent-primary/90 transition-all"
      >
        Add Your First Channel
      </button>
    </div>

    <!-- Configs List -->
    <div v-else class="grid gap-4">
      <div
        v-for="config in configs"
        :key="config.id"
        class="bg-white dark:bg-dark-bg-secondary border border-slate-500 dark:border-dark-border-primary p-6"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-start space-x-4">
            <div class="text-3xl">{{ getTypeIcon(config.type) }}</div>
            <div>
              <div class="flex items-center space-x-3">
                <h3 class="text-lg font-mono font-semibold text-slate-900 dark:text-slate-100">
                  {{ config.name }}
                </h3>
                <span
                  :class="[
                    'px-2 py-0.5 text-xs font-mono uppercase',
                    config.enabled
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  ]"
                >
                  {{ config.enabled ? 'Active' : 'Disabled' }}
                </span>
              </div>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {{ getTypeLabel(config.type) }}
              </p>

              <!-- Triggers -->
              <div class="flex items-center space-x-4 mt-3">
                <span v-if="config.onTestComplete" class="text-xs font-mono px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                  ✓ Test Complete
                </span>
                <span v-if="config.onTestFailed" class="text-xs font-mono px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                  ✓ Test Failed
                </span>
                <span v-if="config.onThresholdExceeded" class="text-xs font-mono px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                  ✓ Threshold Exceeded
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <button
              @click="testNotification(config.id!)"
              :disabled="testingId === config.id"
              class="px-3 py-1.5 text-xs font-mono border border-slate-500 dark:border-dark-border-primary text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              {{ testingId === config.id ? 'Sending...' : 'Test' }}
            </button>
            <button
              @click="toggleEnabled(config)"
              class="px-3 py-1.5 text-xs font-mono border border-slate-500 dark:border-dark-border-primary text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              {{ config.enabled ? 'Disable' : 'Enable' }}
            </button>
            <button
              @click="openEditModal(config)"
              class="px-3 py-1.5 text-xs font-mono border border-slate-500 dark:border-dark-border-primary text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              Edit
            </button>
            <button
              @click="deleteConfig(config.id!)"
              class="px-3 py-1.5 text-xs font-mono border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50" @click="showModal = false"></div>
      <div class="relative bg-white dark:bg-dark-bg-secondary border border-slate-500 dark:border-dark-border-primary w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-slate-500 dark:border-dark-border-primary">
          <h2 class="text-xl font-mono font-semibold text-slate-900 dark:text-slate-100">
            {{ editingConfig ? 'Edit' : 'Add' }} Notification Channel
          </h2>
        </div>

        <div class="p-6 space-y-6">
          <!-- Basic Info -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-2">Name</label>
              <input
                v-model="newConfig.name"
                type="text"
                placeholder="My Slack Notifications"
                class="w-full px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-slate-500 dark:border-dark-border-primary text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-accent-primary focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-2">Type</label>
              <select
                v-model="newConfig.type"
                class="w-full px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-slate-500 dark:border-dark-border-primary text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-accent-primary focus:border-transparent"
              >
                <option v-for="type in notificationTypes" :key="type.value" :value="type.value">
                  {{ type.icon }} {{ type.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Slack Settings -->
          <div v-if="newConfig.type === 'SLACK'" class="space-y-4">
            <h3 class="text-sm font-mono font-semibold text-slate-700 dark:text-slate-300">Slack Configuration</h3>
            <div>
              <label class="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-2">Webhook URL</label>
              <input
                v-model="newConfig.slackWebhookUrl"
                type="url"
                placeholder="https://hooks.slack.com/services/..."
                class="w-full px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-slate-500 dark:border-dark-border-primary text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-accent-primary focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-2">Channel (optional)</label>
              <input
                v-model="newConfig.slackChannel"
                type="text"
                placeholder="#alerts"
                class="w-full px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-slate-500 dark:border-dark-border-primary text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-accent-primary focus:border-transparent"
              />
            </div>
          </div>

          <!-- Email Settings -->
          <div v-if="newConfig.type === 'EMAIL'" class="space-y-4">
            <h3 class="text-sm font-mono font-semibold text-slate-700 dark:text-slate-300">Email Configuration</h3>
            <div>
              <label class="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-2">Recipients (comma-separated)</label>
              <input
                v-model="newConfig.emailRecipients"
                type="text"
                placeholder="team@example.com, alerts@example.com"
                class="w-full px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-slate-500 dark:border-dark-border-primary text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-accent-primary focus:border-transparent"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-2">SMTP Host</label>
                <input
                  v-model="newConfig.smtpHost"
                  type="text"
                  placeholder="smtp.gmail.com"
                  class="w-full px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-slate-500 dark:border-dark-border-primary text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-accent-primary focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-2">SMTP Port</label>
                <input
                  v-model.number="newConfig.smtpPort"
                  type="number"
                  placeholder="587"
                  class="w-full px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-slate-500 dark:border-dark-border-primary text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-accent-primary focus:border-transparent"
                />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-2">SMTP Username</label>
                <input
                  v-model="newConfig.smtpUsername"
                  type="text"
                  class="w-full px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-slate-500 dark:border-dark-border-primary text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-accent-primary focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-2">SMTP Password</label>
                <input
                  v-model="newConfig.smtpPassword"
                  type="password"
                  class="w-full px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-slate-500 dark:border-dark-border-primary text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-accent-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <!-- Webhook/Discord/Teams Settings -->
          <div v-if="['WEBHOOK', 'DISCORD', 'TEAMS'].includes(newConfig.type)" class="space-y-4">
            <h3 class="text-sm font-mono font-semibold text-slate-700 dark:text-slate-300">{{ getTypeLabel(newConfig.type) }} Configuration</h3>
            <div>
              <label class="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-2">Webhook URL</label>
              <input
                v-model="newConfig.webhookUrl"
                type="url"
                placeholder="https://..."
                class="w-full px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-slate-500 dark:border-dark-border-primary text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-accent-primary focus:border-transparent"
              />
            </div>
            <div v-if="newConfig.type === 'WEBHOOK'">
              <label class="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase mb-2">Custom Headers (JSON)</label>
              <textarea
                v-model="newConfig.webhookHeaders"
                rows="3"
                placeholder='{"Authorization": "Bearer token"}'
                class="w-full px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-slate-500 dark:border-dark-border-primary text-slate-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-accent-primary focus:border-transparent"
              ></textarea>
            </div>
          </div>

          <!-- Triggers -->
          <div class="space-y-4">
            <h3 class="text-sm font-mono font-semibold text-slate-700 dark:text-slate-300">Trigger Conditions</h3>
            <div class="space-y-3">
              <label class="flex items-center space-x-3 cursor-pointer">
                <input
                  v-model="newConfig.onTestComplete"
                  type="checkbox"
                  class="w-4 h-4 text-accent-primary border-slate-500 focus:ring-accent-primary"
                />
                <span class="text-sm font-mono text-slate-700 dark:text-slate-300">Test Completed Successfully</span>
              </label>
              <label class="flex items-center space-x-3 cursor-pointer">
                <input
                  v-model="newConfig.onTestFailed"
                  type="checkbox"
                  class="w-4 h-4 text-accent-primary border-slate-500 focus:ring-accent-primary"
                />
                <span class="text-sm font-mono text-slate-700 dark:text-slate-300">Test Failed</span>
              </label>
              <label class="flex items-center space-x-3 cursor-pointer">
                <input
                  v-model="newConfig.onThresholdExceeded"
                  type="checkbox"
                  class="w-4 h-4 text-accent-primary border-slate-500 focus:ring-accent-primary"
                />
                <span class="text-sm font-mono text-slate-700 dark:text-slate-300">Threshold Exceeded (Error rate > 5% or P95 > 2s)</span>
              </label>
            </div>
          </div>
        </div>

        <div class="p-6 border-t border-slate-500 dark:border-dark-border-primary flex justify-end space-x-3">
          <button
            @click="showModal = false"
            class="px-4 py-2 text-xs font-mono uppercase tracking-wider border border-slate-500 dark:border-dark-border-primary text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
          <button
            @click="saveConfig"
            class="px-4 py-2 bg-accent-primary text-white text-xs font-mono uppercase tracking-wider hover:bg-accent-primary/90 transition-all"
          >
            {{ editingConfig ? 'Update' : 'Create' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
