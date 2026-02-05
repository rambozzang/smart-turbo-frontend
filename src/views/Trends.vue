<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import VueApexCharts from 'vue3-apexcharts'
import type { ApexOptions } from 'apexcharts'
import { useDarkMode } from '../composables/useDarkMode'

const { t } = useI18n()
const { isDark } = useDarkMode()

const chartColors = computed(() => ({
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  text: isDark.value ? '#e2e8f0' : '#1e293b',
  grid: isDark.value ? '#334155' : '#e2e8f0'
}))

const trendChartOptions = computed((): ApexOptions => ({
  chart: {
    type: 'line' as const,
    height: 350,
    background: 'transparent',
    toolbar: { show: false }
  },
  stroke: { curve: 'smooth' as const, width: 3 },
  colors: [chartColors.value.primary, chartColors.value.success, chartColors.value.warning],
  xaxis: {
    categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    labels: {
      style: { colors: chartColors.value.text, fontSize: '11px', fontFamily: 'JetBrains Mono, monospace' }
    }
  },
  yaxis: {
    labels: {
      formatter: (val: number) => `${val}ms`,
      style: { colors: chartColors.value.text, fontSize: '11px', fontFamily: 'JetBrains Mono, monospace' }
    }
  },
  grid: { borderColor: chartColors.value.grid, strokeDashArray: 4 },
  theme: { mode: isDark.value ? 'dark' : 'light' },
  legend: {
    position: 'top' as const,
    fontSize: '12px',
    fontFamily: 'JetBrains Mono, monospace',
    labels: { colors: chartColors.value.text }
  }
}))

const trendChartSeries = computed(() => [
  { name: 'Avg Response Time', data: [245, 232, 218, 205, 198, 192] },
  { name: 'P95', data: [512, 498, 475, 450, 432, 420] },
  { name: 'P99', data: [876, 834, 798, 756, 720, 695] }
])
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
        {{ t('trends.title') }}
      </h1>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-400 font-mono">
        {{ t('trends.subtitle') }}
      </p>
    </div>

    <!-- Trend Overview -->
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-white dark:bg-dark-bg-secondary border border-slate-500 dark:border-dark-border-primary p-6">
        <p class="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('trends.improvement30d') }}</p>
        <p class="mt-3 text-4xl font-mono font-bold text-accent-success">-21<span class="text-2xl">%</span></p>
        <p class="mt-2 text-xs text-slate-600 dark:text-slate-400 font-mono">{{ t('trends.responseTimeDecreased') }}</p>
      </div>
      <div class="bg-white dark:bg-dark-bg-secondary border border-slate-500 dark:border-dark-border-primary p-6">
        <p class="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('trends.successRate') }}</p>
        <p class="mt-3 text-4xl font-mono font-bold text-accent-success">99.2<span class="text-2xl">%</span></p>
        <p class="mt-2 text-xs text-slate-600 dark:text-slate-400 font-mono">{{ t('trends.fromLastMonth') }}</p>
      </div>
      <div class="bg-white dark:bg-dark-bg-secondary border border-slate-500 dark:border-dark-border-primary p-6">
        <p class="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('trends.testVolume') }}</p>
        <p class="mt-3 text-4xl font-mono font-bold text-slate-900 dark:text-slate-100">1,247</p>
        <p class="mt-2 text-xs text-slate-600 dark:text-slate-400 font-mono">{{ t('trends.testsThisMonth') }}</p>
      </div>
    </div>

    <!-- Response Time Trend -->
    <div class="bg-white dark:bg-dark-bg-secondary border border-slate-500 dark:border-dark-border-primary">
      <div class="px-6 py-3 border-b border-slate-500 dark:border-dark-border-primary">
        <h2 class="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">{{ t('trends.weekTrend') }}</h2>
      </div>
      <div class="p-6">
        <VueApexCharts
          type="line"
          height="350"
          :options="trendChartOptions"
          :series="trendChartSeries"
        />
      </div>
    </div>
  </div>
</template>
