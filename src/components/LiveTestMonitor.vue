<script setup lang="ts">
// @ts-nocheck
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import VueApexCharts from 'vue3-apexcharts'
import { useDarkMode } from '../composables/useDarkMode'

const { t } = useI18n()
const { isDark } = useDarkMode()

const props = defineProps<{
  testId: number
}>()

// Real-time metrics data
const metrics = ref({
  currentVUs: 0,
  currentRPS: 0,
  avgResponseTime: 0,
  errorRate: 0,
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  dataReceived: 0,
  dataSent: 0
})

// Time series data for charts
const timeSeriesData = ref<{
  timestamps: string[]
  vus: number[]
  rps: number[]
  responseTime: number[]
  errorRate: number[]
}>({
  timestamps: [],
  vus: [],
  rps: [],
  responseTime: [],
  errorRate: []
})

const testStatus = ref<'RUNNING' | 'COMPLETED' | 'FAILED'>('RUNNING')
const elapsedTime = ref(0)
let pollingInterval: number | null = null
let timeInterval: number | null = null

// Chart colors
const chartColors = computed(() => ({
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  text: isDark.value ? '#e2e8f0' : '#1e293b',
  grid: isDark.value ? '#334155' : '#e2e8f0'
}))

// VUs Chart Options
const vusChartOptions = computed(() => ({
  chart: {
    type: 'area',
    height: 200,
    background: 'transparent',
    toolbar: { show: false },
    animations: { enabled: true, easing: 'linear', dynamicAnimation: { speed: 1000 } }
  },
  stroke: { curve: 'smooth', width: 2 },
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.3 }
  },
  colors: [chartColors.value.primary],
  xaxis: {
    type: 'datetime',
    labels: {
      datetimeUTC: false,
      style: { colors: chartColors.value.text, fontSize: '10px', fontFamily: 'JetBrains Mono, monospace' }
    }
  },
  yaxis: {
    labels: {
      formatter: (val: number) => Math.round(val).toString(),
      style: { colors: chartColors.value.text, fontSize: '10px', fontFamily: 'JetBrains Mono, monospace' }
    }
  },
  grid: { borderColor: chartColors.value.grid, strokeDashArray: 4 },
  theme: { mode: isDark.value ? 'dark' : 'light' },
  tooltip: {
    theme: isDark.value ? 'dark' : 'light',
    x: { format: 'HH:mm:ss' }
  }
}))

const vusChartSeries = computed(() => [{
  name: 'Virtual Users',
  data: timeSeriesData.value.timestamps.map((ts, idx) => ({
    x: new Date(ts).getTime(),
    y: timeSeriesData.value.vus[idx]
  }))
}])

// Response Time Chart
const responseTimeChartOptions = computed(() => ({
  ...vusChartOptions.value,
  colors: [chartColors.value.success],
  yaxis: {
    labels: {
      formatter: (val: number) => `${Math.round(val)}ms`,
      style: { colors: chartColors.value.text, fontSize: '10px', fontFamily: 'JetBrains Mono, monospace' }
    }
  }
}))

const responseTimeChartSeries = computed(() => [{
  name: 'Response Time',
  data: timeSeriesData.value.timestamps.map((ts, idx) => ({
    x: new Date(ts).getTime(),
    y: timeSeriesData.value.responseTime[idx]
  }))
}])

// RPS Chart
const rpsChartOptions = computed(() => ({
  ...vusChartOptions.value,
  colors: [chartColors.value.warning]
}))

const rpsChartSeries = computed(() => [{
  name: 'Requests/sec',
  data: timeSeriesData.value.timestamps.map((ts, idx) => ({
    x: new Date(ts).getTime(),
    y: timeSeriesData.value.rps[idx]
  }))
}])

// Error Rate Chart
const errorRateChartOptions = computed(() => ({
  ...vusChartOptions.value,
  colors: [chartColors.value.error],
  yaxis: {
    labels: {
      formatter: (val: number) => `${val.toFixed(2)}%`,
      style: { colors: chartColors.value.text, fontSize: '10px', fontFamily: 'JetBrains Mono, monospace' }
    }
  }
}))

const errorRateChartSeries = computed(() => [{
  name: 'Error Rate',
  data: timeSeriesData.value.timestamps.map((ts, idx) => ({
    x: new Date(ts).getTime(),
    y: timeSeriesData.value.errorRate[idx]
  }))
}])

// Format elapsed time
const formatElapsedTime = computed(() => {
  const hours = Math.floor(elapsedTime.value / 3600)
  const minutes = Math.floor((elapsedTime.value % 3600) / 60)
  const seconds = elapsedTime.value % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

// Poll for real-time metrics
const fetchMetrics = async () => {
  try {
    // Simulate real-time data (replace with actual API call)
    const timestamp = new Date().toISOString()
    const vus = 50 + Math.floor(Math.random() * 100)
    const rps = 200 + Math.floor(Math.random() * 300)
    const responseTime = 100 + Math.floor(Math.random() * 200)
    const errorRate = Math.random() * 2

    metrics.value = {
      currentVUs: vus,
      currentRPS: rps,
      avgResponseTime: responseTime,
      errorRate: errorRate,
      totalRequests: metrics.value.totalRequests + rps,
      successfulRequests: metrics.value.successfulRequests + Math.floor(rps * (1 - errorRate / 100)),
      failedRequests: metrics.value.failedRequests + Math.floor(rps * errorRate / 100),
      dataReceived: metrics.value.dataReceived + (rps * 2),
      dataSent: metrics.value.dataSent + (rps * 0.5)
    }

    // Update time series
    timeSeriesData.value.timestamps.push(timestamp)
    timeSeriesData.value.vus.push(vus)
    timeSeriesData.value.rps.push(rps)
    timeSeriesData.value.responseTime.push(responseTime)
    timeSeriesData.value.errorRate.push(errorRate)

    // Keep only last 60 data points
    if (timeSeriesData.value.timestamps.length > 60) {
      timeSeriesData.value.timestamps.shift()
      timeSeriesData.value.vus.shift()
      timeSeriesData.value.rps.shift()
      timeSeriesData.value.responseTime.shift()
      timeSeriesData.value.errorRate.shift()
    }
  } catch (error) {
    console.error('Failed to fetch metrics:', error)
  }
}

onMounted(() => {
  // Start polling
  fetchMetrics()
  pollingInterval = window.setInterval(fetchMetrics, 1000)

  // Start timer
  timeInterval = window.setInterval(() => {
    elapsedTime.value++
  }, 1000)
})

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval)
  if (timeInterval) clearInterval(timeInterval)
})
</script>

<template>
  <div class="space-y-4">
    <!-- Status Header -->
    <div class="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800">
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span class="text-sm font-mono text-green-400 uppercase">{{ testStatus }}</span>
        </div>
        <div class="text-sm font-mono text-slate-400">
          <span class="text-slate-600">Elapsed:</span>
          <span class="ml-2 text-slate-300">{{ formatElapsedTime }}</span>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <button class="px-3 py-1 text-xs font-mono border border-slate-700 text-slate-400 hover:border-red-500 hover:text-red-400 transition-all">
          STOP TEST
        </button>
      </div>
    </div>

    <!-- Key Metrics Grid -->
    <div class="grid grid-cols-4 gap-4">
      <div class="p-4 bg-slate-900/50 border border-slate-800">
        <div class="text-xs font-mono text-slate-500 uppercase mb-2">Virtual Users</div>
        <div class="text-3xl font-mono font-bold text-accent-primary">{{ metrics.currentVUs }}</div>
      </div>
      <div class="p-4 bg-slate-900/50 border border-slate-800">
        <div class="text-xs font-mono text-slate-500 uppercase mb-2">Requests/sec</div>
        <div class="text-3xl font-mono font-bold text-amber-400">{{ metrics.currentRPS }}</div>
      </div>
      <div class="p-4 bg-slate-900/50 border border-slate-800">
        <div class="text-xs font-mono text-slate-500 uppercase mb-2">Avg Response</div>
        <div class="text-3xl font-mono font-bold text-green-400">{{ metrics.avgResponseTime }}<span class="text-lg">ms</span></div>
      </div>
      <div class="p-4 bg-slate-900/50 border border-slate-800">
        <div class="text-xs font-mono text-slate-500 uppercase mb-2">Error Rate</div>
        <div class="text-3xl font-mono font-bold" :class="metrics.errorRate > 1 ? 'text-red-400' : 'text-green-400'">
          {{ metrics.errorRate.toFixed(2) }}<span class="text-lg">%</span>
        </div>
      </div>
    </div>

    <!-- Real-time Charts -->
    <div class="grid grid-cols-2 gap-4">
      <!-- VUs Chart -->
      <div class="bg-slate-900/50 border border-slate-800">
        <div class="px-4 py-2 border-b border-slate-800">
          <span class="text-xs font-mono text-slate-400 uppercase">Virtual Users Over Time</span>
        </div>
        <div class="p-4">
          <VueApexCharts
            type="area"
            height="200"
            :options="vusChartOptions"
            :series="vusChartSeries"
          />
        </div>
      </div>

      <!-- Response Time Chart -->
      <div class="bg-slate-900/50 border border-slate-800">
        <div class="px-4 py-2 border-b border-slate-800">
          <span class="text-xs font-mono text-slate-400 uppercase">Response Time</span>
        </div>
        <div class="p-4">
          <VueApexCharts
            type="area"
            height="200"
            :options="responseTimeChartOptions"
            :series="responseTimeChartSeries"
          />
        </div>
      </div>

      <!-- RPS Chart -->
      <div class="bg-slate-900/50 border border-slate-800">
        <div class="px-4 py-2 border-b border-slate-800">
          <span class="text-xs font-mono text-slate-400 uppercase">Requests Per Second</span>
        </div>
        <div class="p-4">
          <VueApexCharts
            type="area"
            height="200"
            :options="rpsChartOptions"
            :series="rpsChartSeries"
          />
        </div>
      </div>

      <!-- Error Rate Chart -->
      <div class="bg-slate-900/50 border border-slate-800">
        <div class="px-4 py-2 border-b border-slate-800">
          <span class="text-xs font-mono text-slate-400 uppercase">Error Rate</span>
        </div>
        <div class="p-4">
          <VueApexCharts
            type="area"
            height="200"
            :options="errorRateChartOptions"
            :series="errorRateChartSeries"
          />
        </div>
      </div>
    </div>

    <!-- Detailed Metrics -->
    <div class="grid grid-cols-3 gap-4">
      <div class="p-4 bg-slate-900/50 border border-slate-800">
        <div class="text-xs font-mono text-slate-500 uppercase mb-3">Requests</div>
        <div class="space-y-2">
          <div class="flex items-center justify-between text-xs font-mono">
            <span class="text-slate-400">Total:</span>
            <span class="text-slate-200">{{ metrics.totalRequests.toLocaleString() }}</span>
          </div>
          <div class="flex items-center justify-between text-xs font-mono">
            <span class="text-slate-400">Successful:</span>
            <span class="text-green-400">{{ metrics.successfulRequests.toLocaleString() }}</span>
          </div>
          <div class="flex items-center justify-between text-xs font-mono">
            <span class="text-slate-400">Failed:</span>
            <span class="text-red-400">{{ metrics.failedRequests.toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <div class="p-4 bg-slate-900/50 border border-slate-800">
        <div class="text-xs font-mono text-slate-500 uppercase mb-3">Data Transfer</div>
        <div class="space-y-2">
          <div class="flex items-center justify-between text-xs font-mono">
            <span class="text-slate-400">Received:</span>
            <span class="text-slate-200">{{ (metrics.dataReceived / 1024).toFixed(2) }} MB</span>
          </div>
          <div class="flex items-center justify-between text-xs font-mono">
            <span class="text-slate-400">Sent:</span>
            <span class="text-slate-200">{{ (metrics.dataSent / 1024).toFixed(2) }} MB</span>
          </div>
        </div>
      </div>

      <div class="p-4 bg-slate-900/50 border border-slate-800">
        <div class="text-xs font-mono text-slate-500 uppercase mb-3">Performance</div>
        <div class="space-y-2">
          <div class="flex items-center justify-between text-xs font-mono">
            <span class="text-slate-400">Current VUs:</span>
            <span class="text-accent-primary">{{ metrics.currentVUs }}</span>
          </div>
          <div class="flex items-center justify-between text-xs font-mono">
            <span class="text-slate-400">Current RPS:</span>
            <span class="text-amber-400">{{ metrics.currentRPS }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
