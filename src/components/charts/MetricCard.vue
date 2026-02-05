<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  value: string | number
  unit?: string
  subtitle?: string
  icon?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info'
}

const props = withDefaults(defineProps<Props>(), {
  unit: '',
  subtitle: '',
  icon: '',
  trend: 'neutral',
  trendValue: '',
  color: 'primary'
})

const colorClasses = computed(() => {
  const colors = {
    primary: 'border-indigo-500/30 bg-indigo-500/5',
    success: 'border-emerald-500/30 bg-emerald-500/5',
    warning: 'border-amber-500/30 bg-amber-500/5',
    error: 'border-red-500/30 bg-red-500/5',
    info: 'border-blue-500/30 bg-blue-500/5'
  }
  return colors[props.color]
})

const valueColorClasses = computed(() => {
  const colors = {
    primary: 'text-indigo-500',
    success: 'text-emerald-500',
    warning: 'text-amber-500',
    error: 'text-red-500',
    info: 'text-blue-500'
  }
  return colors[props.color]
})

const trendIcon = computed(() => {
  if (props.trend === 'up') return '↑'
  if (props.trend === 'down') return '↓'
  return '→'
})

const trendColorClass = computed(() => {
  if (props.trend === 'up') return 'text-emerald-500'
  if (props.trend === 'down') return 'text-red-500'
  return 'text-slate-500 dark:text-slate-400'
})
</script>

<template>
  <div
    class="border rounded-lg p-4 transition-all hover:shadow-lg"
    :class="colorClasses"
  >
    <div class="flex items-start justify-between mb-2">
      <div class="text-xs font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400">
        {{ title }}
      </div>
      <div v-if="icon" class="text-2xl opacity-50">
        {{ icon }}
      </div>
    </div>

    <div class="flex items-baseline space-x-2 mb-1">
      <div
        class="text-3xl font-bold font-mono"
        :class="valueColorClasses"
      >
        {{ value }}
      </div>
      <div
        v-if="unit"
        class="text-sm font-mono text-slate-500 dark:text-slate-400"
      >
        {{ unit }}
      </div>
    </div>

    <div v-if="subtitle || trendValue" class="flex items-center justify-between text-xs">
      <div v-if="subtitle" class="text-slate-500 dark:text-slate-400 font-mono">
        {{ subtitle }}
      </div>
      <div
        v-if="trendValue"
        class="flex items-center space-x-1 font-mono font-medium"
        :class="trendColorClass"
      >
        <span>{{ trendIcon }}</span>
        <span>{{ trendValue }}</span>
      </div>
    </div>
  </div>
</template>
