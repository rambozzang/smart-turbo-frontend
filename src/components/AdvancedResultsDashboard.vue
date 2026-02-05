<script setup lang="ts">
// @ts-nocheck
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import VueApexCharts from 'vue3-apexcharts'
import { useDarkMode } from '../composables/useDarkMode'
import type { TestResult } from '../api/client'

const { t } = useI18n()
const { isDark } = useDarkMode()

const props = defineProps<{
  result: TestResult
}>()

const activeTab = ref<'overview' | 'http' | 'errors' | 'performance'>('overview')

const chartColors = computed(() => ({
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  purple: '#8b5cf6',
  text: isDark.value ? '#e2e8f0' : '#1e293b',
  grid: isDark.value ? '#334155' : '#e2e8f0'
}))

// Response Time Distribution Chart
const responseTimeChartOptions = computed(() => ({
  chart: {
    type: 'bar' as const,
    height: 300,
    background: 'transparent',
    toolbar: { show: false }
  },
  colors: [chartColors.value.success],
  plotOptions: {
    bar: { horizontal: false, columnWidth: '70%' }
  },
  dataLabels: { enabled: false },
  xaxis: {
    categories: ['Min', 'Avg', 'Med', 'P90', 'P95', 'P99', 'Max'],
    labels: {
      style: { colors: chartColors.value.text, fontSize: '11px', fontFamily: 'JetBrains Mono, monospace' }
    }
  },
  yaxis: {
    labels: {
      formatter: (val: number) => `${Math.round(val)}ms`,
      style: { colors: chartColors.value.text, fontSize: '11px', fontFamily: 'JetBrains Mono, monospace' }
    }
  },
  grid: { borderColor: chartColors.value.grid, strokeDashArray: 4 },
  theme: { mode: isDark.value ? 'dark' : 'light' },
  tooltip: {
    theme: isDark.value ? 'dark' : 'light',
    y: { formatter: (val: number) => `${val.toFixed(2)}ms` }
  }
}))

const responseTimeChartSeries = computed(() => [{
  name: 'Response Time',
  data: [
    props.result.metrics.httpReqDuration.min || 0,
    props.result.metrics.httpReqDuration.avg,
    props.result.metrics.httpReqDuration.med || 0,
    props.result.metrics.httpReqDuration.p90 || 0,
    props.result.metrics.httpReqDuration.p95,
    props.result.metrics.httpReqDuration.p99,
    props.result.metrics.httpReqDuration.max || 0
  ]
}])

// Status Code Distribution Chart
const statusCodeChartOptions = computed(() => ({
  chart: {
    type: 'donut' as const,
    height: 300,
    background: 'transparent'
  },
  labels: Object.keys(props.result.metrics.detailedMetrics?.statusCodeDistribution || {}),
  colors: [chartColors.value.success, chartColors.value.warning, chartColors.value.error, chartColors.value.purple],
  legend: {
    position: 'bottom',
    fontSize: '12px',
    fontFamily: 'JetBrains Mono, monospace',
    labels: { colors: chartColors.value.text }
  },
  dataLabels: {
    formatter: (val: number) => `${val.toFixed(1)}%`
  },
  theme: { mode: isDark.value ? 'dark' : 'light' },
  tooltip: {
    theme: isDark.value ? 'dark' : 'light'
  }
}))

const statusCodeChartSeries = computed(() =>
  Object.values(props.result.metrics.detailedMetrics?.statusCodeDistribution || {})
)

// HTTP Timing Breakdown Chart
const httpTimingChartOptions = computed(() => ({
  chart: {
    type: 'bar' as const,
    height: 250,
    background: 'transparent',
    stacked: true,
    toolbar: { show: false }
  },
  colors: [chartColors.value.primary, chartColors.value.success, chartColors.value.warning, chartColors.value.error, chartColors.value.purple],
  plotOptions: {
    bar: { horizontal: true }
  },
  dataLabels: { enabled: false },
  xaxis: {
    labels: {
      formatter: (val: number) => `${val.toFixed(1)}ms`,
      style: { colors: chartColors.value.text, fontSize: '10px', fontFamily: 'JetBrains Mono, monospace' }
    }
  },
  yaxis: {
    labels: {
      style: { colors: chartColors.value.text, fontSize: '10px', fontFamily: 'JetBrains Mono, monospace' }
    }
  },
  grid: { borderColor: chartColors.value.grid, strokeDashArray: 4 },
  theme: { mode: isDark.value ? 'dark' : 'light' },
  legend: {
    position: 'top',
    fontSize: '10px',
    fontFamily: 'JetBrains Mono, monospace',
    labels: { colors: chartColors.value.text }
  },
  tooltip: {
    theme: isDark.value ? 'dark' : 'light',
    y: { formatter: (val: number) => `${val.toFixed(2)}ms` }
  }
}))

const httpTimingChartSeries = computed(() => {
  const detailedMetrics = props.result.metrics.detailedMetrics
  return [
    { name: 'Blocked', data: [detailedMetrics?.httpReqBlocked?.avg || 0] },
    { name: 'Connecting', data: [detailedMetrics?.httpReqConnecting?.avg || 0] },
    { name: 'Waiting', data: [detailedMetrics?.httpReqWaiting?.avg || 0] }
  ]
})

const gradeColor = computed(() => {
  const grade = props.result.analysis.grade
  if (grade === 'A') return 'text-green-400'
  if (grade === 'B') return 'text-blue-400'
  if (grade === 'C') return 'text-yellow-400'
  if (grade === 'D') return 'text-orange-400'
  return 'text-red-400'
})

const successRate = computed(() => {
  const total = props.result.metrics.httpReqs
  const failed = (props.result.metrics.httpReqFailed / 100) * total
  return ((total - failed) / total) * 100
})

// Error Analysis
const errorCount = computed(() => {
  return Math.floor((props.result.metrics.httpReqFailed / 100) * props.result.metrics.httpReqs)
})

const errorsByType = computed(() => {
  const distribution = props.result.metrics.detailedMetrics?.statusCodeDistribution || {}
  const errors = {
    '4xx': 0,
    '5xx': 0,
    other: 0
  }

  Object.entries(distribution).forEach(([code, count]) => {
    const statusCode = parseInt(code)
    if (statusCode >= 400 && statusCode < 500) {
      errors['4xx'] += count
    } else if (statusCode >= 500) {
      errors['5xx'] += count
    } else if (statusCode >= 300) {
      errors.other += count
    }
  })

  return errors
})

const errorChartOptions = computed(() => ({
  chart: {
    type: 'donut' as const,
    height: 300,
    background: 'transparent'
  },
  labels: [
    t('testResults.advancedDashboard.errorLabels.clientErrors'),
    t('testResults.advancedDashboard.errorLabels.serverErrors'),
    t('testResults.advancedDashboard.errorLabels.otherErrors')
  ],
  colors: [chartColors.value.warning, chartColors.value.error, chartColors.value.purple],
  legend: {
    position: 'bottom',
    fontSize: '12px',
    fontFamily: 'JetBrains Mono, monospace',
    labels: { colors: chartColors.value.text }
  },
  dataLabels: {
    formatter: (val: number) => `${val.toFixed(1)}%`
  },
  theme: { mode: isDark.value ? 'dark' : 'light' },
  tooltip: {
    theme: isDark.value ? 'dark' : 'light',
    y: { formatter: (val: number) => `${val} requests` }
  }
}))

const errorChartSeries = computed(() => {
  const errors = errorsByType.value
  return [errors['4xx'], errors['5xx'], errors.other]
})

const topErrors = computed(() => {
  const distribution = props.result.metrics.detailedMetrics?.statusCodeDistribution || {}
  return Object.entries(distribution)
    .filter(([code]) => parseInt(code) >= 400)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([code, count]) => ({
      code,
      count,
      percentage: ((count / props.result.metrics.httpReqs) * 100).toFixed(2)
    }))
})

const getStatusDescription = (code: string): string => {
  return t(`testResults.advancedDashboard.statusCodes.${code}`, t('testResults.advancedDashboard.statusCodes.unknown'))
}
</script>

<template>
  <div class="space-y-6">
    <!-- Performance Summary -->
    <div class="grid grid-cols-5 gap-4">
      <div class="col-span-1 p-6 bg-slate-900/50 border border-slate-800 flex flex-col items-center justify-center">
        <div class="text-xs font-mono text-slate-500 uppercase mb-2">Overall Grade</div>
        <div class="text-6xl font-mono font-bold" :class="gradeColor">{{ result.analysis.grade }}</div>
      </div>

      <div class="p-4 bg-slate-900/50 border border-slate-800">
        <div class="text-xs font-mono text-slate-500 uppercase mb-2">Total Requests</div>
        <div class="text-3xl font-mono font-bold text-accent-primary">{{ result.metrics.httpReqs.toLocaleString() }}</div>
        <div class="text-xs font-mono text-slate-600 mt-1">{{ successRate.toFixed(2) }}% success rate</div>
      </div>

      <div class="p-4 bg-slate-900/50 border border-slate-800">
        <div class="text-xs font-mono text-slate-500 uppercase mb-2">Avg Response</div>
        <div class="text-3xl font-mono font-bold text-green-400">
          {{ result.metrics.httpReqDuration.avg.toFixed(1) }}<span class="text-lg">ms</span>
        </div>
        <div class="text-xs font-mono text-slate-600 mt-1">
          P95: {{ result.metrics.httpReqDuration.p95.toFixed(1) }}ms
        </div>
      </div>

      <div class="p-4 bg-slate-900/50 border border-slate-800">
        <div class="text-xs font-mono text-slate-500 uppercase mb-2">Error Rate</div>
        <div class="text-3xl font-mono font-bold" :class="result.metrics.httpReqFailed > 1 ? 'text-red-400' : 'text-green-400'">
          {{ result.metrics.httpReqFailed.toFixed(2) }}<span class="text-lg">%</span>
        </div>
        <div class="text-xs font-mono text-slate-600 mt-1">
          {{ Math.floor((result.metrics.httpReqFailed / 100) * result.metrics.httpReqs) }} failed
        </div>
      </div>

      <div class="p-4 bg-slate-900/50 border border-slate-800">
        <div class="text-xs font-mono text-slate-500 uppercase mb-2">Max VUs</div>
        <div class="text-3xl font-mono font-bold text-purple-400">{{ result.metrics.vusMax }}</div>
        <div class="text-xs font-mono text-slate-600 mt-1">{{ result.duration }}</div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-slate-800">
      <div class="flex space-x-1">
        <button
          v-for="tab in (['overview', 'http', 'errors', 'performance'] as const)"
          :key="tab"
          @click="activeTab = tab"
          class="px-4 py-2 text-xs font-mono uppercase transition-all"
          :class="activeTab === tab
            ? 'border-b-2 border-accent-primary text-accent-primary'
            : 'text-slate-500 hover:text-slate-300'"
        >
          {{ t(`testResults.advancedDashboard.tabs.${tab}`) }}
        </button>
      </div>
    </div>

    <!-- Overview Tab -->
    <div v-show="activeTab === 'overview'" class="grid grid-cols-2 gap-4">
      <!-- Response Time Distribution -->
      <div class="bg-slate-900/50 border border-slate-800">
        <div class="px-4 py-3 border-b border-slate-800">
          <h3 class="text-xs font-mono font-semibold text-slate-400 uppercase">{{ t('testResults.advancedDashboard.headers.responseTimeDistribution') }}</h3>
        </div>
        <div class="p-4">
          <VueApexCharts
            type="bar"
            height="300"
            :options="responseTimeChartOptions"
            :series="responseTimeChartSeries"
          />
        </div>
      </div>

      <!-- Status Code Distribution -->
      <div class="bg-slate-900/50 border border-slate-800">
        <div class="px-4 py-3 border-b border-slate-800">
          <h3 class="text-xs font-mono font-semibold text-slate-400 uppercase">{{ t('testResults.advancedDashboard.headers.statusCodeDistribution') }}</h3>
        </div>
        <div class="p-4">
          <VueApexCharts
            v-if="Object.keys(result.metrics.detailedMetrics?.statusCodeDistribution || {}).length > 0"
            type="donut"
            height="300"
            :options="statusCodeChartOptions"
            :series="statusCodeChartSeries"
          />
          <div v-else class="flex items-center justify-center h-[300px] text-slate-500 font-mono text-sm">
            {{ t('testResults.advancedDashboard.messages.noStatusData') }}
          </div>
        </div>
      </div>

      <!-- AI Analysis -->
      <div class="col-span-2 bg-slate-900/50 border border-slate-800">
        <div class="px-4 py-3 border-b border-slate-800">
          <h3 class="text-xs font-mono font-semibold text-slate-400 uppercase">{{ t('testResults.advancedDashboard.headers.aiAnalysis') }}</h3>
        </div>
        <div class="p-4">
          <div class="mb-4">
            <div class="text-sm font-mono text-slate-300">{{ result.analysis.summary }}</div>
          </div>
          <div class="space-y-2">
            <h4 class="text-xs font-mono text-slate-500 uppercase">{{ t('testResults.advancedDashboard.headers.recommendations') }}</h4>
            <ul class="space-y-1">
              <li
                v-for="(rec, idx) in result.analysis.recommendations"
                :key="idx"
                class="text-xs font-mono text-slate-400 flex items-start space-x-2"
              >
                <span class="text-accent-primary">→</span>
                <span>{{ rec }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- HTTP Tab -->
    <div v-show="activeTab === 'http'" class="space-y-4">
      <!-- HTTP Timing Breakdown -->
      <div class="bg-slate-900/50 border border-slate-800">
        <div class="px-4 py-3 border-b border-slate-800">
          <h3 class="text-xs font-mono font-semibold text-slate-400 uppercase">{{ t('testResults.advancedDashboard.headers.httpTimingBreakdown') }}</h3>
        </div>
        <div class="p-4">
          <VueApexCharts
            type="bar"
            height="250"
            :options="httpTimingChartOptions"
            :series="httpTimingChartSeries"
          />
        </div>
      </div>

      <!-- HTTP Metrics Table -->
      <div class="bg-slate-900/50 border border-slate-800">
        <div class="px-4 py-3 border-b border-slate-800">
          <h3 class="text-xs font-mono font-semibold text-slate-400 uppercase">{{ t('testResults.advancedDashboard.headers.detailedHttpMetrics') }}</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-xs font-mono">
            <thead>
              <tr class="border-b border-slate-800">
                <th class="px-4 py-3 text-left text-slate-500 uppercase">Metric</th>
                <th class="px-4 py-3 text-right text-slate-500 uppercase">Avg</th>
                <th class="px-4 py-3 text-right text-slate-500 uppercase">P95</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-slate-800/50">
                <td class="px-4 py-3 text-slate-300">Blocked</td>
                <td class="px-4 py-3 text-right text-slate-200">{{ result.metrics.detailedMetrics?.httpReqBlocked?.avg.toFixed(2) || 'N/A' }}ms</td>
                <td class="px-4 py-3 text-right text-slate-200">{{ result.metrics.detailedMetrics?.httpReqBlocked?.p95.toFixed(2) || 'N/A' }}ms</td>
              </tr>
              <tr class="border-b border-slate-800/50">
                <td class="px-4 py-3 text-slate-300">Connecting</td>
                <td class="px-4 py-3 text-right text-slate-200">{{ result.metrics.detailedMetrics?.httpReqConnecting?.avg.toFixed(2) || 'N/A' }}ms</td>
                <td class="px-4 py-3 text-right text-slate-200">{{ result.metrics.detailedMetrics?.httpReqConnecting?.p95.toFixed(2) || 'N/A' }}ms</td>
              </tr>
              <tr class="border-b border-slate-800/50">
                <td class="px-4 py-3 text-slate-300">Waiting</td>
                <td class="px-4 py-3 text-right text-slate-200">{{ result.metrics.detailedMetrics?.httpReqWaiting?.avg.toFixed(2) || 'N/A' }}ms</td>
                <td class="px-4 py-3 text-right text-slate-200">{{ result.metrics.detailedMetrics?.httpReqWaiting?.p95.toFixed(2) || 'N/A' }}ms</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Errors Tab -->
    <div v-show="activeTab === 'errors'" class="space-y-4">
      <!-- Error Summary Cards -->
      <div class="grid grid-cols-3 gap-4">
        <div class="p-6 bg-slate-900/50 border border-slate-800">
          <div class="text-xs font-mono text-slate-500 uppercase mb-2">Total Errors</div>
          <div class="text-3xl font-mono font-bold text-red-400">{{ errorCount.toLocaleString() }}</div>
          <div class="text-xs font-mono text-slate-600 mt-1">
            {{ result.metrics.httpReqFailed.toFixed(2) }}% of total requests
          </div>
        </div>

        <div class="p-6 bg-slate-900/50 border border-slate-800">
          <div class="text-xs font-mono text-slate-500 uppercase mb-2">Client Errors (4xx)</div>
          <div class="text-3xl font-mono font-bold text-yellow-400">{{ errorsByType['4xx'].toLocaleString() }}</div>
          <div class="text-xs font-mono text-slate-600 mt-1">
            {{ errorCount > 0 ? ((errorsByType['4xx'] / errorCount) * 100).toFixed(1) : 0 }}% of errors
          </div>
        </div>

        <div class="p-6 bg-slate-900/50 border border-slate-800">
          <div class="text-xs font-mono text-slate-500 uppercase mb-2">Server Errors (5xx)</div>
          <div class="text-3xl font-mono font-bold text-red-500">{{ errorsByType['5xx'].toLocaleString() }}</div>
          <div class="text-xs font-mono text-slate-600 mt-1">
            {{ errorCount > 0 ? ((errorsByType['5xx'] / errorCount) * 100).toFixed(1) : 0 }}% of errors
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <!-- Error Type Distribution -->
        <div class="bg-slate-900/50 border border-slate-800">
          <div class="px-4 py-3 border-b border-slate-800">
            <h3 class="text-xs font-mono font-semibold text-slate-400 uppercase">Error Type Distribution</h3>
          </div>
          <div class="p-4">
            <VueApexCharts
              v-if="errorCount > 0"
              type="donut"
              height="300"
              :options="errorChartOptions"
              :series="errorChartSeries"
            />
            <div v-else class="flex items-center justify-center h-[300px] text-slate-500 font-mono text-sm">
              🎉 {{ t('testResults.advancedDashboard.messages.noErrors') }}
            </div>
          </div>
        </div>

        <!-- Top 5 Errors -->
        <div class="bg-slate-900/50 border border-slate-800">
          <div class="px-4 py-3 border-b border-slate-800">
            <h3 class="text-xs font-mono font-semibold text-slate-400 uppercase">Top Errors</h3>
          </div>
          <div class="p-4">
            <div v-if="topErrors.length > 0" class="space-y-3">
              <div
                v-for="(error, idx) in topErrors"
                :key="error.code"
                class="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700"
              >
                <div class="flex items-center space-x-3">
                  <div class="text-lg font-mono font-bold text-slate-500">#{{ idx + 1 }}</div>
                  <div>
                    <div class="text-sm font-mono font-bold" :class="parseInt(error.code) >= 500 ? 'text-red-400' : 'text-yellow-400'">
                      HTTP {{ error.code }}
                    </div>
                    <div class="text-xs font-mono text-slate-500">
                      {{ error.percentage }}% of requests
                    </div>
                  </div>
                </div>
                <div class="text-xl font-mono font-bold text-slate-300">{{ error.count }}</div>
              </div>
            </div>
            <div v-else class="flex items-center justify-center h-[300px] text-slate-500 font-mono text-sm">
              {{ t('testResults.advancedDashboard.messages.noErrorData') }}
            </div>
          </div>
        </div>
      </div>

      <!-- Error Details Table -->
      <div class="bg-slate-900/50 border border-slate-800" v-if="result.metrics.detailedMetrics?.statusCodeDistribution">
        <div class="px-4 py-3 border-b border-slate-800">
          <h3 class="text-xs font-mono font-semibold text-slate-400 uppercase">Error Status Codes</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-xs font-mono">
            <thead>
              <tr class="border-b border-slate-800">
                <th class="px-4 py-3 text-left text-slate-500 uppercase">Status Code</th>
                <th class="px-4 py-3 text-right text-slate-500 uppercase">Count</th>
                <th class="px-4 py-3 text-right text-slate-500 uppercase">Percentage</th>
                <th class="px-4 py-3 text-left text-slate-500 uppercase">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="[code, count] in Object.entries(result.metrics.detailedMetrics.statusCodeDistribution).filter(([c]) => parseInt(c) >= 400)"
                :key="code"
                class="border-b border-slate-800/50"
              >
                <td class="px-4 py-3">
                  <span class="px-2 py-1 font-bold" :class="parseInt(code) >= 500 ? 'text-red-400 bg-red-400/10' : 'text-yellow-400 bg-yellow-400/10'">
                    {{ code }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right text-slate-200">{{ count }}</td>
                <td class="px-4 py-3 text-right text-slate-200">{{ ((count / result.metrics.httpReqs) * 100).toFixed(2) }}%</td>
                <td class="px-4 py-3 text-slate-400">
                  {{ getStatusDescription(code) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Data Transfer -->
    <div v-show="activeTab === 'performance'" class="grid grid-cols-2 gap-4">
      <div class="p-6 bg-slate-900/50 border border-slate-800">
        <div class="text-xs font-mono text-slate-500 uppercase mb-4">Data Transfer</div>
        <div class="space-y-3">
          <div>
            <div class="text-sm font-mono text-slate-400 mb-1">Received</div>
            <div class="text-2xl font-mono font-bold text-green-400">
              {{ result.metrics.detailedMetrics?.dataReceived || 'N/A' }}
            </div>
          </div>
          <div>
            <div class="text-sm font-mono text-slate-400 mb-1">Sent</div>
            <div class="text-2xl font-mono font-bold text-blue-400">
              {{ result.metrics.detailedMetrics?.dataSent || 'N/A' }}
            </div>
          </div>
        </div>
      </div>

      <div class="p-6 bg-slate-900/50 border border-slate-800">
        <div class="text-xs font-mono text-slate-500 uppercase mb-4">Request Rate</div>
        <div class="text-2xl font-mono font-bold text-amber-400">
          {{ result.metrics.detailedMetrics?.requestRate?.toFixed(2) || 'N/A' }}
          <span class="text-sm text-slate-500">req/s</span>
        </div>
      </div>
    </div>
  </div>
</template>
