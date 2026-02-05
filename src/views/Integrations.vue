<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const integrations = [
  {
    name: 'Slack',
    description: 'Get real-time test notifications in your Slack workspace',
    icon: '💬',
    status: 'available',
    connected: false
  },
  {
    name: 'GitHub',
    description: 'Integrate with GitHub Actions for CI/CD workflows',
    icon: '🐙',
    status: 'available',
    connected: false
  },
  {
    name: 'Datadog',
    description: 'Export test metrics to Datadog for centralized monitoring',
    icon: '📊',
    status: 'available',
    connected: false
  },
  {
    name: 'PagerDuty',
    description: 'Create incidents automatically when tests fail',
    icon: '🚨',
    status: 'available',
    connected: false
  },
  {
    name: 'Jira',
    description: 'Create issues from test failures automatically',
    icon: '📝',
    status: 'coming-soon',
    connected: false
  },
  {
    name: 'Grafana',
    description: 'Visualize test metrics in Grafana dashboards',
    icon: '📈',
    status: 'coming-soon',
    connected: false
  }
]
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
        {{ t('integrations.title') }}
      </h1>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-400 font-mono">
        {{ t('integrations.subtitle') }}
      </p>
    </div>

    <!-- Integrations Grid -->
    <div class="grid grid-cols-2 gap-4">
      <div
        v-for="integration in integrations"
        :key="integration.name"
        class="bg-white dark:bg-dark-bg-secondary border border-slate-500 dark:border-dark-border-primary hover:border-accent-primary dark:hover:border-accent-primary transition-all"
      >
        <div class="p-6">
          <div class="flex items-start justify-between">
            <div class="text-4xl">{{ integration.icon }}</div>
            <div v-if="integration.status === 'coming-soon'" class="px-2 py-1 bg-slate-100 dark:bg-dark-bg-tertiary text-slate-500 dark:text-slate-400 text-[10px] font-mono uppercase">
              {{ t('integrations.comingSoon') }}
            </div>
            <div v-else-if="integration.connected" class="px-2 py-1 bg-accent-success/10 text-accent-success text-[10px] font-mono uppercase border border-accent-success/20">
              {{ t('integrations.connected') }}
            </div>
          </div>
          <h3 class="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {{ integration.name }}
          </h3>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {{ integration.description }}
          </p>
          <button
            :disabled="integration.status === 'coming-soon'"
            :class="integration.status === 'coming-soon' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent-primary hover:text-white'"
            class="mt-4 w-full px-4 py-2 bg-slate-100 dark:bg-dark-bg-tertiary text-slate-900 dark:text-slate-100 text-xs font-mono uppercase tracking-wider transition-all disabled:opacity-50"
          >
            {{ integration.connected ? t('integrations.configure') : t('integrations.connect') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
