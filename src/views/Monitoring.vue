<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiClient } from '../api/client'

const { t } = useI18n()

interface MetricsSummary {
  activeTests: number
  activeVUs: number
  onlineAgents: number
  registeredMeters: number
}

interface AgentStats {
  total: number
  online: number
  busy: number
  offline: number
  totalCapacity: number
  currentLoad: number
  utilizationPercent: number
}

const metricsSummary = ref<MetricsSummary | null>(null)
const agentStats = ref<AgentStats | null>(null)
const prometheusConfig = ref<string>('')
const showGrafanaModal = ref(false)
const grafanaDashboard = ref<any>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

const recentEvents = ref<Array<{ time: string; type: string; message: string }>>([])

async function fetchMetrics() {
  try {
    metricsSummary.value = await apiClient.get<MetricsSummary>('/metrics/summary')
  } catch (err: any) {
    console.error('Failed to fetch metrics:', err)
  }
}

async function fetchAgentStats() {
  try {
    agentStats.value = await apiClient.get<AgentStats>('/agents/stats')
  } catch (err: any) {
    console.error('Failed to fetch agent stats:', err)
  }
}

async function fetchPrometheusConfig() {
  try {
    prometheusConfig.value = await apiClient.get<string>('/metrics/prometheus/config')
  } catch (err: any) {
    console.error('Failed to fetch prometheus config:', err)
  }
}

async function loadGrafanaDashboard() {
  try {
    grafanaDashboard.value = await apiClient.get('/metrics/grafana/dashboard')
    showGrafanaModal.value = true
  } catch (err: any) {
    error.value = 'Failed to load Grafana dashboard'
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}

function downloadDashboard() {
  if (!grafanaDashboard.value) return

  const blob = new Blob([JSON.stringify(grafanaDashboard.value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'smart-turbo-grafana-dashboard.json'
  a.click()
  URL.revokeObjectURL(url)
}

function addEvent(type: string, message: string) {
  const now = new Date()
  const time = now.toLocaleTimeString('ko-KR', { hour12: false })
  recentEvents.value.unshift({ time, type, message })
  if (recentEvents.value.length > 50) {
    recentEvents.value.pop()
  }
}

let interval: number | null = null

onMounted(() => {
  fetchMetrics()
  fetchAgentStats()
  fetchPrometheusConfig()

  // Add initial events
  addEvent('info', 'Monitoring dashboard initialized')
  addEvent('success', 'Connected to metrics endpoint')

  // Refresh metrics every 5 seconds
  interval = window.setInterval(() => {
    fetchMetrics()
    fetchAgentStats()
  }, 5000)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          {{ t('monitoring.title') }}
        </h1>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-400 font-mono">
          {{ t('monitoring.subtitle') }}
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <div class="flex items-center space-x-2 px-3 py-1.5 bg-accent-success/10 border border-accent-success/20 text-accent-success text-xs font-mono uppercase">
          <div class="w-2 h-2 bg-accent-success rounded-full animate-pulse"></div>
          <span>{{ t('monitoring.live') }}</span>
        </div>
        <button
          @click="loadGrafanaDashboard"
          class="px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-600 text-xs font-mono uppercase hover:bg-orange-500/20"
        >
          Grafana Dashboard
        </button>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="bg-accent-error/10 border border-accent-error/20 text-accent-error px-4 py-3 text-sm">
      {{ error }}
      <button @click="error = null" class="ml-2 underline">Dismiss</button>
    </div>

    <!-- Real-time Metrics -->
    <div class="grid grid-cols-5 gap-4">
      <div class="bg-white dark:bg-dark-bg-secondary border border-slate-300 dark:border-dark-border-primary p-6">
        <p class="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('monitoring.activeTests') }}</p>
        <p class="mt-3 text-4xl font-mono font-bold text-accent-primary">{{ metricsSummary?.activeTests || 0 }}</p>
      </div>
      <div class="bg-white dark:bg-dark-bg-secondary border border-slate-300 dark:border-dark-border-primary p-6">
        <p class="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active VUs</p>
        <p class="mt-3 text-4xl font-mono font-bold text-accent-info">{{ metricsSummary?.activeVUs || 0 }}</p>
      </div>
      <div class="bg-white dark:bg-dark-bg-secondary border border-slate-300 dark:border-dark-border-primary p-6">
        <p class="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">Online Agents</p>
        <p class="mt-3 text-4xl font-mono font-bold text-accent-success">{{ agentStats?.online || 0 }}</p>
      </div>
      <div class="bg-white dark:bg-dark-bg-secondary border border-slate-300 dark:border-dark-border-primary p-6">
        <p class="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Capacity</p>
        <p class="mt-3 text-4xl font-mono font-bold text-slate-900 dark:text-slate-100">{{ (agentStats?.totalCapacity || 0).toLocaleString() }}</p>
        <p class="text-xs text-slate-500">VUs</p>
      </div>
      <div class="bg-white dark:bg-dark-bg-secondary border border-slate-300 dark:border-dark-border-primary p-6">
        <p class="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">Utilization</p>
        <p class="mt-3 text-4xl font-mono font-bold" :class="(agentStats?.utilizationPercent || 0) > 80 ? 'text-accent-error' : 'text-accent-success'">
          {{ (agentStats?.utilizationPercent || 0).toFixed(1) }}<span class="text-2xl">%</span>
        </p>
      </div>
    </div>

    <!-- Prometheus Integration -->
    <div class="grid grid-cols-2 gap-6">
      <!-- Prometheus Config -->
      <div class="bg-white dark:bg-dark-bg-secondary border border-slate-300 dark:border-dark-border-primary">
        <div class="px-6 py-3 border-b border-slate-300 dark:border-dark-border-primary flex justify-between items-center">
          <h2 class="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Prometheus Configuration</h2>
          <button
            @click="copyToClipboard(prometheusConfig)"
            class="text-xs text-accent-primary hover:underline"
          >
            Copy
          </button>
        </div>
        <div class="p-4">
          <pre class="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-dark-bg-tertiary p-4 overflow-x-auto">{{ prometheusConfig }}</pre>
          <p class="mt-3 text-xs text-slate-500">
            Add this configuration to your <code class="bg-slate-100 dark:bg-dark-bg-tertiary px-1">prometheus.yml</code> file to scrape metrics from Smart Turbo.
          </p>
        </div>
      </div>

      <!-- Metrics Endpoint Info -->
      <div class="bg-white dark:bg-dark-bg-secondary border border-slate-300 dark:border-dark-border-primary">
        <div class="px-6 py-3 border-b border-slate-300 dark:border-dark-border-primary">
          <h2 class="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Metrics Endpoints</h2>
        </div>
        <div class="p-4 space-y-4">
          <div>
            <h3 class="text-sm font-medium text-slate-900 dark:text-slate-100">Prometheus Metrics</h3>
            <code class="block mt-1 text-xs font-mono text-accent-primary bg-slate-50 dark:bg-dark-bg-tertiary p-2">
              GET /actuator/prometheus
            </code>
          </div>
          <div>
            <h3 class="text-sm font-medium text-slate-900 dark:text-slate-100">Health Check</h3>
            <code class="block mt-1 text-xs font-mono text-accent-primary bg-slate-50 dark:bg-dark-bg-tertiary p-2">
              GET /actuator/health
            </code>
          </div>
          <div>
            <h3 class="text-sm font-medium text-slate-900 dark:text-slate-100">All Metrics</h3>
            <code class="block mt-1 text-xs font-mono text-accent-primary bg-slate-50 dark:bg-dark-bg-tertiary p-2">
              GET /actuator/metrics
            </code>
          </div>
          <div>
            <h3 class="text-sm font-medium text-slate-900 dark:text-slate-100">Grafana Dashboard</h3>
            <code class="block mt-1 text-xs font-mono text-accent-primary bg-slate-50 dark:bg-dark-bg-tertiary p-2">
              GET /api/metrics/grafana/dashboard
            </code>
          </div>
        </div>
      </div>
    </div>

    <!-- Available Metrics -->
    <div class="bg-white dark:bg-dark-bg-secondary border border-slate-300 dark:border-dark-border-primary">
      <div class="px-6 py-3 border-b border-slate-300 dark:border-dark-border-primary">
        <h2 class="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Available Metrics</h2>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-3 gap-4">
          <div>
            <h3 class="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Test Metrics</h3>
            <ul class="text-xs font-mono text-slate-600 dark:text-slate-400 space-y-1">
              <li>• smartturbo_tests_active</li>
              <li>• smartturbo_tests_started_total</li>
              <li>• smartturbo_tests_completed_total</li>
              <li>• smartturbo_tests_duration</li>
              <li>• smartturbo_test_vus_current</li>
              <li>• smartturbo_test_rps</li>
              <li>• smartturbo_test_response_time_avg</li>
              <li>• smartturbo_test_response_time_p95</li>
              <li>• smartturbo_test_response_time_p99</li>
              <li>• smartturbo_test_error_rate</li>
            </ul>
          </div>
          <div>
            <h3 class="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Agent Metrics</h3>
            <ul class="text-xs font-mono text-slate-600 dark:text-slate-400 space-y-1">
              <li>• smartturbo_agents_online</li>
              <li>• smartturbo_agents_total</li>
              <li>• smartturbo_agents_busy</li>
              <li>• smartturbo_agents_offline</li>
              <li>• smartturbo_agents_capacity_total</li>
              <li>• smartturbo_agents_capacity_used</li>
              <li>• smartturbo_agents_utilization</li>
            </ul>
          </div>
          <div>
            <h3 class="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">System Metrics</h3>
            <ul class="text-xs font-mono text-slate-600 dark:text-slate-400 space-y-1">
              <li>• smartturbo_vus_active</li>
              <li>• smartturbo_schedules_executions</li>
              <li>• smartturbo_database_queries</li>
              <li>• smartturbo_api_requests</li>
              <li>• jvm_memory_used_bytes</li>
              <li>• jvm_gc_pause_seconds</li>
              <li>• http_server_requests_seconds</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Stream -->
    <div class="bg-white dark:bg-dark-bg-secondary border border-slate-300 dark:border-dark-border-primary">
      <div class="px-6 py-3 border-b border-slate-300 dark:border-dark-border-primary">
        <h2 class="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">{{ t('monitoring.eventStream') }}</h2>
      </div>
      <div class="p-6 space-y-2 max-h-64 overflow-y-auto font-mono text-xs">
        <div v-if="recentEvents.length === 0" class="text-slate-500 text-center py-4">
          No events yet
        </div>
        <div v-for="(event, idx) in recentEvents" :key="idx" class="flex items-start space-x-3 p-2 hover:bg-slate-50 dark:hover:bg-dark-bg-tertiary transition-colors">
          <span class="text-slate-500 dark:text-slate-400">{{ event.time }}</span>
          <span
            :class="{
              'text-accent-success': event.type === 'success',
              'text-accent-warning': event.type === 'warning',
              'text-accent-error': event.type === 'error',
              'text-accent-info': event.type === 'info'
            }"
          >●</span>
          <span class="text-slate-700 dark:text-slate-300">{{ event.message }}</span>
        </div>
      </div>
    </div>

    <!-- Grafana Dashboard Modal -->
    <div v-if="showGrafanaModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-dark-bg-secondary border border-slate-300 dark:border-dark-border-primary w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <div class="px-6 py-4 border-b border-slate-300 dark:border-dark-border-primary flex justify-between items-center">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Grafana Dashboard Export</h2>
          <button @click="showGrafanaModal = false" class="text-slate-400 hover:text-slate-600">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6 flex-1 overflow-y-auto">
          <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Download this JSON file and import it into Grafana to get a pre-configured dashboard for Smart Turbo metrics.
          </p>
          <div class="bg-slate-50 dark:bg-dark-bg-tertiary p-4 rounded overflow-x-auto">
            <pre class="text-xs font-mono text-slate-700 dark:text-slate-300 max-h-64 overflow-y-auto">{{ JSON.stringify(grafanaDashboard, null, 2).substring(0, 2000) }}...</pre>
          </div>
          <div class="mt-4 space-y-2">
            <h3 class="text-sm font-medium text-slate-900 dark:text-slate-100">Import Instructions:</h3>
            <ol class="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-decimal list-inside">
              <li>Download the dashboard JSON file</li>
              <li>Open Grafana and go to Dashboards → Import</li>
              <li>Upload the JSON file or paste its contents</li>
              <li>Select your Prometheus data source</li>
              <li>Click Import</li>
            </ol>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-slate-300 dark:border-dark-border-primary flex justify-end space-x-3">
          <button
            @click="showGrafanaModal = false"
            class="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            Close
          </button>
          <button
            @click="downloadDashboard"
            class="px-4 py-2 bg-accent-primary text-white text-sm hover:bg-accent-primary/90"
          >
            Download JSON
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
