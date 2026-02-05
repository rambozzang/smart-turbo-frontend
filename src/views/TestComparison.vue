<script setup lang="ts">
// @ts-nocheck
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import VueApexCharts from 'vue3-apexcharts'
import type { ApexOptions } from 'apexcharts'
import { apiClient, type TestResult, type Test } from '../api/client'
import { useDarkMode } from '../composables/useDarkMode'

const { t } = useI18n()
const router = useRouter()
const { isDark } = useDarkMode()

const availableTests = ref<Array<{ id: number; name: string; createdAt: string }>>([])
const selectedTestIds = ref<number[]>([])
const testResults = ref<TestResult[]>([])
const loading = ref(false)

const chartColors = computed(() => ({
  colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
  text: isDark.value ? '#e2e8f0' : '#1e293b',
  grid: isDark.value ? '#334155' : '#e2e8f0'
}))

onMounted(async () => {
  try {
    const tests = await apiClient.getAllTests()
    availableTests.value = tests
      .filter((test: Test) => test.status === 'COMPLETED')
      .map((test: Test) => ({ id: test.id, name: test.name, createdAt: test.createdAt }))
  } catch (error) {
    console.error('Failed to load tests:', error)
  }
})

async function addTestToComparison(testId: number) {
  if (selectedTestIds.value.includes(testId) || selectedTestIds.value.length >= 4) return

  loading.value = true
  try {
    const result = await apiClient.getTestResult(testId)
    testResults.value.push(result)
    selectedTestIds.value.push(testId)
  } catch (error) {
    console.error('Failed to load test result:', error)
  } finally {
    loading.value = false
  }
}

function removeTest(testId: number) {
  const index = selectedTestIds.value.indexOf(testId)
  if (index !== -1) {
    selectedTestIds.value.splice(index, 1)
    testResults.value.splice(index, 1)
  }
}

// Comparison Chart: Response Time
const responseTimeComparisonOptions = computed((): ApexOptions => ({
  chart: {
    type: 'bar' as const,
    height: 300,
    background: 'transparent',
    toolbar: { show: false }
  },
  colors: chartColors.value.colors,
  plotOptions: {
    bar: { horizontal: false, columnWidth: '70%', dataLabels: { position: 'top' as const } }
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => `${val.toFixed(0)}ms`,
    offsetY: -20,
    style: { fontSize: '10px', colors: [chartColors.value.text] }
  },
  xaxis: {
    categories: testResults.value.map((r: TestResult) => r.testName),
    labels: {
      style: { colors: chartColors.value.text, fontSize: '10px', fontFamily: 'JetBrains Mono, monospace' }
    }
  },
  yaxis: {
    labels: {
      formatter: (val: number) => `${val}ms`,
      style: { colors: chartColors.value.text, fontSize: '10px', fontFamily: 'JetBrains Mono, monospace' }
    }
  },
  grid: { borderColor: chartColors.value.grid, strokeDashArray: 4 },
  theme: { mode: isDark.value ? 'dark' : 'light' },
  tooltip: {
    theme: isDark.value ? 'dark' : 'light',
    y: { formatter: (val: number) => `${val.toFixed(2)}ms` }
  }
}))

const responseTimeComparisonSeries = computed(() => [
  {
    name: 'Avg Response Time',
    data: testResults.value.map(r => r.metrics.httpReqDuration.avg)
  },
  {
    name: 'P95',
    data: testResults.value.map(r => r.metrics.httpReqDuration.p95)
  },
  {
    name: 'P99',
    data: testResults.value.map(r => r.metrics.httpReqDuration.p99)
  }
])

// Error Rate Comparison
const errorRateComparisonOptions = computed(() => ({
  chart: {
    type: 'line',
    height: 250,
    background: 'transparent',
    toolbar: { show: false }
  },
  colors: [chartColors.value.colors[3]],
  stroke: { curve: 'smooth', width: 3 },
  xaxis: {
    categories: testResults.value.map(r => r.testName),
    labels: {
      style: { colors: chartColors.value.text, fontSize: '10px', fontFamily: 'JetBrains Mono, monospace' }
    }
  },
  yaxis: {
    labels: {
      formatter: (val: number) => `${val.toFixed(2)}%`,
      style: { colors: chartColors.value.text, fontSize: '10px', fontFamily: 'JetBrains Mono, monospace' }
    }
  },
  grid: { borderColor: chartColors.value.grid, strokeDashArray: 4 },
  theme: { mode: isDark.value ? 'dark' : 'light' },
  tooltip: {
    theme: isDark.value ? 'dark' : 'light',
    y: { formatter: (val: number) => `${val.toFixed(2)}%` }
  },
  markers: { size: 5 }
}))

const errorRateComparisonSeries = computed(() => [{
  name: 'Error Rate',
  data: testResults.value.map(r => r.metrics.httpReqFailed)
}])

// Throughput Comparison
const throughputComparisonOptions = computed(() => ({
  chart: {
    type: 'bar',
    height: 250,
    background: 'transparent',
    toolbar: { show: false }
  },
  colors: [chartColors.value.colors[1]],
  plotOptions: {
    bar: { horizontal: true, dataLabels: { position: 'top' } }
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => val.toLocaleString(),
    offsetX: 30,
    style: { fontSize: '10px', colors: [chartColors.value.text] }
  },
  xaxis: {
    labels: {
      formatter: (val: number) => val.toLocaleString(),
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
  tooltip: {
    theme: isDark.value ? 'dark' : 'light',
    y: { formatter: (val: number) => val.toLocaleString() }
  }
}))

const throughputComparisonSeries = computed(() => [{
  name: 'Total Requests',
  data: testResults.value.map(r => r.metrics.httpReqs)
}])

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getPerformanceTrend(index: number): { icon: string; color: string; text: string } {
  if (index === 0 || testResults.value.length < 2) {
    return { icon: '—', color: 'text-slate-500', text: 'Baseline' }
  }

  const current = testResults.value[index].metrics.httpReqDuration.avg
  const previous = testResults.value[index - 1].metrics.httpReqDuration.avg
  const change = ((current - previous) / previous) * 100

  if (Math.abs(change) < 5) {
    return { icon: '→', color: 'text-blue-400', text: 'Stable' }
  } else if (change < 0) {
    return { icon: '↑', color: 'text-green-400', text: `${Math.abs(change).toFixed(1)}% faster` }
  } else {
    return { icon: '↓', color: 'text-red-400', text: `${change.toFixed(1)}% slower` }
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 -m-6 p-6">
    <!-- Header -->
    <div class="border-b border-slate-800 pb-4 mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">Test Comparison</h1>
          <p class="mt-1 text-sm text-slate-400 font-mono">Compare performance across multiple test runs</p>
        </div>
        <button
          @click="router.push('/tests')"
          class="px-4 py-2 text-xs font-mono border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-100 transition-all"
        >
          ← Back to Tests
        </button>
      </div>
    </div>

    <!-- Test Selector -->
    <div class="mb-6 p-4 bg-slate-900/50 border border-slate-800">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-xs font-mono text-slate-400 uppercase">Select Tests to Compare (Max 4)</h2>
        <div class="text-xs font-mono text-slate-500">
          {{ selectedTestIds.length }} / 4 selected
        </div>
      </div>
      <div class="grid grid-cols-4 gap-3">
        <button
          v-for="test in availableTests"
          :key="test.id"
          @click="addTestToComparison(test.id)"
          :disabled="selectedTestIds.includes(test.id) || selectedTestIds.length >= 4"
          class="p-3 border text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          :class="selectedTestIds.includes(test.id)
            ? 'border-accent-primary bg-accent-primary/10'
            : 'border-slate-800 bg-slate-900/30 hover:border-slate-600'"
        >
          <div class="text-xs font-mono font-bold text-slate-200 truncate">{{ test.name }}</div>
          <div class="text-[10px] font-mono text-slate-600 mt-1">{{ formatDate(test.createdAt) }}</div>
        </button>
      </div>
    </div>

    <div v-if="loading" class="p-12 text-center">
      <div class="inline-block w-8 h-8 border-2 border-slate-700 border-t-accent-primary rounded-full animate-spin"></div>
    </div>

    <div v-else-if="testResults.length === 0" class="p-12 text-center">
      <svg class="mx-auto w-16 h-16 text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <p class="text-sm font-mono text-slate-500">Select tests above to start comparison</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Selected Tests Overview -->
      <div class="grid grid-cols-4 gap-4">
        <div
          v-for="(result, idx) in testResults"
          :key="result.id"
          class="p-4 bg-slate-900/50 border border-slate-800 relative"
        >
          <button
            @click="removeTest(result.testId)"
            class="absolute top-2 right-2 p-1 text-slate-600 hover:text-red-400 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div class="text-xs font-mono text-slate-500 uppercase mb-2">Test {{ idx + 1 }}</div>
          <div class="text-sm font-mono font-bold text-slate-200 mb-3 pr-6">{{ result.testName }}</div>
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs font-mono">
              <span class="text-slate-500">Grade:</span>
              <span class="text-lg font-bold" :class="result.analysis.grade === 'A' ? 'text-green-400' : 'text-yellow-400'">
                {{ result.analysis.grade }}
              </span>
            </div>
            <div class="flex items-center justify-between text-xs font-mono">
              <span class="text-slate-500">Avg:</span>
              <span class="text-slate-200">{{ result.metrics.httpReqDuration.avg.toFixed(1) }}ms</span>
            </div>
            <div class="flex items-center justify-between text-xs font-mono">
              <span class="text-slate-500">Trend:</span>
              <span :class="getPerformanceTrend(idx).color">
                {{ getPerformanceTrend(idx).icon }} {{ getPerformanceTrend(idx).text }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Comparison Charts -->
      <div class="grid grid-cols-2 gap-4">
        <!-- Response Time Comparison -->
        <div class="bg-slate-900/50 border border-slate-800">
          <div class="px-4 py-3 border-b border-slate-800">
            <h3 class="text-xs font-mono font-semibold text-slate-400 uppercase">Response Time Comparison</h3>
          </div>
          <div class="p-4">
            <VueApexCharts
              type="bar"
              height="300"
              :options="responseTimeComparisonOptions"
              :series="responseTimeComparisonSeries"
            />
          </div>
        </div>

        <!-- Error Rate Comparison -->
        <div class="bg-slate-900/50 border border-slate-800">
          <div class="px-4 py-3 border-b border-slate-800">
            <h3 class="text-xs font-mono font-semibold text-slate-400 uppercase">Error Rate Trend</h3>
          </div>
          <div class="p-4">
            <VueApexCharts
              type="line"
              height="300"
              :options="errorRateComparisonOptions"
              :series="errorRateComparisonSeries"
            />
          </div>
        </div>

        <!-- Throughput Comparison -->
        <div class="col-span-2 bg-slate-900/50 border border-slate-800">
          <div class="px-4 py-3 border-b border-slate-800">
            <h3 class="text-xs font-mono font-semibold text-slate-400 uppercase">Throughput Comparison</h3>
          </div>
          <div class="p-4">
            <VueApexCharts
              type="bar"
              height="250"
              :options="throughputComparisonOptions"
              :series="throughputComparisonSeries"
            />
          </div>
        </div>
      </div>

      <!-- Detailed Metrics Table -->
      <div class="bg-slate-900/50 border border-slate-800">
        <div class="px-4 py-3 border-b border-slate-800">
          <h3 class="text-xs font-mono font-semibold text-slate-400 uppercase">Detailed Metrics Comparison</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-xs font-mono">
            <thead>
              <tr class="border-b border-slate-800">
                <th class="px-4 py-3 text-left text-slate-500 uppercase">Metric</th>
                <th
                  v-for="result in testResults"
                  :key="result.id"
                  class="px-4 py-3 text-right text-slate-500 uppercase"
                >
                  {{ result.testName }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-slate-800/50">
                <td class="px-4 py-3 text-slate-400">Total Requests</td>
                <td
                  v-for="result in testResults"
                  :key="`req-${result.id}`"
                  class="px-4 py-3 text-right text-slate-200"
                >
                  {{ result.metrics.httpReqs.toLocaleString() }}
                </td>
              </tr>
              <tr class="border-b border-slate-800/50">
                <td class="px-4 py-3 text-slate-400">Avg Response Time</td>
                <td
                  v-for="result in testResults"
                  :key="`avg-${result.id}`"
                  class="px-4 py-3 text-right text-slate-200"
                >
                  {{ result.metrics.httpReqDuration.avg.toFixed(2) }}ms
                </td>
              </tr>
              <tr class="border-b border-slate-800/50">
                <td class="px-4 py-3 text-slate-400">P95</td>
                <td
                  v-for="result in testResults"
                  :key="`p95-${result.id}`"
                  class="px-4 py-3 text-right text-slate-200"
                >
                  {{ result.metrics.httpReqDuration.p95.toFixed(2) }}ms
                </td>
              </tr>
              <tr class="border-b border-slate-800/50">
                <td class="px-4 py-3 text-slate-400">P99</td>
                <td
                  v-for="result in testResults"
                  :key="`p99-${result.id}`"
                  class="px-4 py-3 text-right text-slate-200"
                >
                  {{ result.metrics.httpReqDuration.p99.toFixed(2) }}ms
                </td>
              </tr>
              <tr class="border-b border-slate-800/50">
                <td class="px-4 py-3 text-slate-400">Error Rate</td>
                <td
                  v-for="result in testResults"
                  :key="`err-${result.id}`"
                  class="px-4 py-3 text-right"
                  :class="result.metrics.httpReqFailed > 1 ? 'text-red-400' : 'text-green-400'"
                >
                  {{ result.metrics.httpReqFailed.toFixed(2) }}%
                </td>
              </tr>
              <tr class="border-b border-slate-800/50">
                <td class="px-4 py-3 text-slate-400">Max VUs</td>
                <td
                  v-for="result in testResults"
                  :key="`vus-${result.id}`"
                  class="px-4 py-3 text-right text-slate-200"
                >
                  {{ result.metrics.vusMax }}
                </td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-slate-400">AI Grade</td>
                <td
                  v-for="result in testResults"
                  :key="`grade-${result.id}`"
                  class="px-4 py-3 text-right font-bold"
                  :class="result.analysis.grade === 'A' ? 'text-green-400' : 'text-yellow-400'"
                >
                  {{ result.analysis.grade }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
