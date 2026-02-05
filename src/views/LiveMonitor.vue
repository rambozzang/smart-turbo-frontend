<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDarkMode } from '../composables/useDarkMode'
import LineChart from '../components/charts/LineChart.vue'
import MetricCard from '../components/charts/MetricCard.vue'
import GaugeChart from '../components/charts/GaugeChart.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { isDark } = useDarkMode()

const testId = computed(() => Number(route.params.id))
const eventSource = ref<EventSource | null>(null)
const isConnected = ref(false)
const error = ref('')

// Test info
const testName = ref('Load Test')
const testStatus = ref<'RUNNING' | 'COMPLETED' | 'FAILED'>('RUNNING')
const progress = ref(0)
const elapsedTime = ref('0:00')

// Real-time metrics
const currentVUs = ref(0)
const currentRPS = ref(0)
const avgResponseTime = ref(0)
const errorRate = ref(0)

// Historical data for charts
const timeLabels = ref<string[]>([])
const responseTimeData = ref<number[]>([])
const throughputData = ref<number[]>([])
const errorRateData = ref<number[]>([])
const vusData = ref<number[]>([])

const maxDataPoints = 50

// Chart data
const responseTimeChartData = computed(() => ({
  labels: timeLabels.value,
  series: [{
    name: 'Response Time',
    data: responseTimeData.value,
    color: '#10b981',
    smooth: true
  }]
}))

const throughputChartData = computed(() => ({
  labels: timeLabels.value,
  series: [{
    name: 'Requests/sec',
    data: throughputData.value,
    color: '#3b82f6',
    smooth: true
  }]
}))

const errorChartData = computed(() => ({
  labels: timeLabels.value,
  series: [{
    name: 'Error Rate',
    data: errorRateData.value,
    color: '#ef4444',
    smooth: true
  }]
}))

const vusChartData = computed(() => ({
  labels: timeLabels.value,
  series: [{
    name: 'Virtual Users',
    data: vusData.value,
    color: '#8b5cf6',
    smooth: false
  }]
}))

onMounted(() => {
  connectToStream()
})

onUnmounted(() => {
  disconnectFromStream()
})

function connectToStream() {
  const url = `http://localhost:8080/api/tests/${testId.value}/live/metrics`

  try {
    eventSource.value = new EventSource(url)

    eventSource.value.onopen = () => {
      isConnected.value = true
      error.value = ''
      console.log('Connected to live metrics stream')
    }

    eventSource.value.addEventListener('connected', (event: MessageEvent) => {
      console.log('Connection confirmed:', event.data)
    })

    eventSource.value.addEventListener('metrics', (event: MessageEvent) => {
      try {
        const metrics = JSON.parse(event.data)
        updateMetrics(metrics)
      } catch (e) {
        console.error('Failed to parse metrics:', e)
      }
    })

    eventSource.value.addEventListener('completed', (event: MessageEvent) => {
      const data = JSON.parse(event.data)
      testStatus.value = data.status
      isConnected.value = false
      console.log('Test completed:', data)
    })

    eventSource.value.onerror = (err) => {
      console.error('SSE error:', err)
      error.value = '실시간 연결이 끊어졌습니다'
      isConnected.value = false

      // Retry connection after 3 seconds
      setTimeout(() => {
        if (testStatus.value === 'RUNNING') {
          connectToStream()
        }
      }, 3000)
    }
  } catch (e: any) {
    error.value = '실시간 모니터링에 연결할 수 없습니다: ' + e.message
  }
}

function disconnectFromStream() {
  if (eventSource.value) {
    eventSource.value.close()
    eventSource.value = null
    isConnected.value = false
  }
}

function updateMetrics(metrics: any) {
  // Update current values
  currentVUs.value = metrics.vus || 0
  currentRPS.value = metrics.rps || 0
  avgResponseTime.value = metrics.responseTime || 0
  errorRate.value = metrics.errorRate || 0

  // Update progress
  if (metrics.progress !== undefined) {
    progress.value = metrics.progress
  }

  if (metrics.elapsed) {
    elapsedTime.value = metrics.elapsed
  }

  // Add to historical data
  const timestamp = new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  timeLabels.value.push(timestamp)
  responseTimeData.value.push(avgResponseTime.value)
  throughputData.value.push(currentRPS.value)
  errorRateData.value.push(errorRate.value)
  vusData.value.push(currentVUs.value)

  // Keep only last N data points
  if (timeLabels.value.length > maxDataPoints) {
    timeLabels.value.shift()
    responseTimeData.value.shift()
    throughputData.value.shift()
    errorRateData.value.shift()
    vusData.value.shift()
  }
}

function stopTest() {
  // TODO: Implement stop test API call
  alert('Stop test functionality coming soon')
}

function goBack() {
  router.push('/tests')
}
</script>

<template>
  <div class="min-h-screen -m-6 p-6" :class="isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'">
    <!-- Header -->
    <div class="border-b pb-4 mb-6" :class="isDark ? 'border-slate-800' : 'border-slate-300'">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button
            @click="goBack"
            class="text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← Back
          </button>
          <div>
            <div class="flex items-center space-x-3">
              <div class="flex items-center space-x-2">
                <div v-if="testStatus === 'RUNNING'" class="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                <div v-else class="w-3 h-3 rounded-full bg-slate-500"></div>
                <h1 class="text-2xl font-bold font-mono">{{ testName }}</h1>
              </div>
              <span
                class="px-3 py-1 text-xs font-mono font-bold uppercase rounded"
                :class="{
                  'bg-red-500/20 text-red-400 border border-red-500/30': testStatus === 'RUNNING',
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30': testStatus === 'COMPLETED',
                  'bg-amber-500/20 text-amber-400 border border-amber-500/30': testStatus === 'FAILED'
                }"
              >
                🔴 {{ testStatus }}
              </span>
            </div>
            <p class="text-sm font-mono mt-1" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
              Test ID: #{{ testId }} | Elapsed: {{ elapsedTime }}
            </p>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <div
            v-if="isConnected"
            class="flex items-center space-x-2 text-xs font-mono text-emerald-400"
          >
            <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span>LIVE</span>
          </div>
          <button
            v-if="testStatus === 'RUNNING'"
            @click="stopTest"
            class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-mono uppercase transition-all"
          >
            ⏹ Stop Test
          </button>
        </div>
      </div>

      <!-- Progress Bar -->
      <div v-if="testStatus === 'RUNNING'" class="mt-4">
        <div class="flex items-center justify-between text-xs font-mono mb-1" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
          <span>Progress</span>
          <span>{{ progress }}%</span>
        </div>
        <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="border border-red-900 bg-red-900/20 rounded-lg mb-6">
      <div class="border-b border-red-900 px-4 py-2 flex items-center justify-between">
        <span class="text-xs font-mono text-red-400 font-bold">❌ 연결 오류</span>
        <button
          @click="error = ''"
          class="text-red-400 hover:text-red-300 text-xs"
        >
          ✕
        </button>
      </div>
      <div class="p-4">
        <p class="text-sm font-mono text-red-300">{{ error }}</p>
        <button
          @click="connectToStream"
          class="mt-2 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-mono rounded transition-colors"
        >
          재연결
        </button>
      </div>
    </div>

    <!-- Metric Cards -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <MetricCard
        title="Virtual Users"
        :value="currentVUs"
        icon="👥"
        color="primary"
      />
      <MetricCard
        title="Requests/sec"
        :value="currentRPS"
        icon="⚡"
        color="info"
      />
      <MetricCard
        title="Avg Response Time"
        :value="avgResponseTime.toFixed(1)"
        unit="ms"
        icon="⏱️"
        :color="avgResponseTime < 200 ? 'success' : avgResponseTime < 500 ? 'warning' : 'error'"
      />
      <MetricCard
        title="Error Rate"
        :value="errorRate.toFixed(2)"
        unit="%"
        icon="⚠️"
        :color="errorRate < 1 ? 'success' : errorRate < 5 ? 'warning' : 'error'"
      />
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-2 gap-4">
      <!-- Response Time Chart -->
      <div class="border rounded-lg p-4" :class="isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-300 bg-white'">
        <h3 class="text-sm font-mono font-semibold mb-4" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
          📊 Response Time
        </h3>
        <LineChart
          :data="responseTimeChartData"
          height="250px"
          y-axis-label="ms"
          :show-legend="false"
        />
      </div>

      <!-- Throughput Chart -->
      <div class="border rounded-lg p-4" :class="isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-300 bg-white'">
        <h3 class="text-sm font-mono font-semibold mb-4" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
          ⚡ Throughput
        </h3>
        <LineChart
          :data="throughputChartData"
          height="250px"
          y-axis-label="req/s"
          :show-legend="false"
        />
      </div>

      <!-- Error Rate Chart -->
      <div class="border rounded-lg p-4" :class="isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-300 bg-white'">
        <h3 class="text-sm font-mono font-semibold mb-4" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
          ⚠️ Error Rate
        </h3>
        <LineChart
          :data="errorChartData"
          height="250px"
          y-axis-label="%"
          :show-legend="false"
        />
      </div>

      <!-- VUs Chart -->
      <div class="border rounded-lg p-4" :class="isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-300 bg-white'">
        <h3 class="text-sm font-mono font-semibold mb-4" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
          👥 Virtual Users
        </h3>
        <LineChart
          :data="vusChartData"
          height="250px"
          y-axis-label="VUs"
          :show-legend="false"
        />
      </div>
    </div>
  </div>
</template>
