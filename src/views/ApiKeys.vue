<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const apiKeys = ref([
  {
    id: 1,
    name: 'Production API Key',
    key: 'st_prod_****************************xyz',
    created: '2026-01-15',
    lastUsed: '2026-02-01',
    status: 'active'
  },
  {
    id: 2,
    name: 'Development API Key',
    key: 'st_dev_****************************abc',
    created: '2026-01-20',
    lastUsed: '2026-01-30',
    status: 'active'
  },
  {
    id: 3,
    name: 'Staging API Key',
    key: 'st_stg_****************************def',
    created: '2026-01-10',
    lastUsed: 'Never',
    status: 'inactive'
  }
])

const showCreateModal = ref(false)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          {{ t('apiKeys.title') }}
        </h1>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-400 font-mono">
          {{ t('apiKeys.subtitle') }}
        </p>
      </div>
      <button
        @click="showCreateModal = true"
        class="px-4 py-2 bg-accent-primary text-white text-xs font-mono uppercase tracking-wider hover:bg-accent-primary/90 transition-all border border-accent-primary/20"
      >
        {{ t('apiKeys.generateNewKey') }}
      </button>
    </div>

    <!-- API Keys List -->
    <div class="bg-white dark:bg-dark-bg-secondary border border-slate-500 dark:border-dark-border-primary">
      <div class="px-6 py-3 border-b border-slate-500 dark:border-dark-border-primary">
        <h2 class="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">{{ t('apiKeys.yourApiKeys') }} ({{ apiKeys.length }})</h2>
      </div>
      <div class="divide-y divide-slate-200 dark:divide-dark-border-primary">
        <div
          v-for="key in apiKeys"
          :key="key.id"
          class="px-6 py-4 hover:bg-slate-50 dark:hover:bg-dark-bg-tertiary transition-colors"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3">
                <h3 class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ key.name }}</h3>
                <div
                  :class="key.status === 'active' ? 'bg-accent-success/10 text-accent-success border-accent-success/20' : 'bg-slate-100 dark:bg-dark-bg-tertiary text-slate-500 dark:text-slate-400 border-slate-500 dark:border-dark-border-primary'"
                  class="px-2 py-0.5 text-[10px] font-mono uppercase border"
                >
                  {{ key.status }}
                </div>
              </div>
              <div class="mt-2 flex items-center space-x-2">
                <code class="px-2 py-1 bg-slate-100 dark:bg-dark-bg-tertiary text-slate-900 dark:text-slate-100 text-xs font-mono border border-slate-500 dark:border-dark-border-primary">
                  {{ key.key }}
                </code>
                <button class="p-1 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary transition-colors">
                  <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <div class="mt-2 flex items-center space-x-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                <span>{{ t('apiKeys.created') }}: {{ key.created }}</span>
                <span>•</span>
                <span>{{ t('apiKeys.lastUsed') }}: {{ key.lastUsed }}</span>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button class="p-2 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button class="p-2 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary text-slate-400 hover:text-accent-error transition-colors">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Documentation Link -->
    <div class="bg-accent-info/10 dark:bg-accent-info/20 border border-accent-info/20 dark:border-accent-info/30 p-6">
      <div class="flex items-start space-x-3">
        <svg class="w-5 h-5 text-accent-info mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ t('apiKeys.apiDocumentation') }}</h3>
          <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {{ t('apiKeys.apiDocumentationDesc') }}
          </p>
          <button class="mt-2 text-xs font-mono text-accent-primary hover:text-accent-primary/80 uppercase tracking-wider">
            {{ t('apiKeys.viewApiDocs') }} →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
