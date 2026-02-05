<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { apiClient, type Test } from '../api/client'

const { t, locale } = useI18n()
const router = useRouter()

const tests = ref<Test[]>([])
const loading = ref(true)
const error = ref('')
const selectedFilter = ref<string>('ALL')

const filteredTests = computed(() => {
  if (selectedFilter.value === 'ALL') return tests.value
  return tests.value.filter(test => test.status === selectedFilter.value)
})

onMounted(async () => {
  try {
    tests.value = await apiClient.getAllTests()
  } catch (err: any) {
    error.value = err.message || '테스트 목록을 불러오는데 실패했습니다'
    console.error('Failed to load tests:', err)
  } finally {
    loading.value = false
  }
})

function getStatusConfig(status: string) {
  const configs = {
    PENDING: { color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-500/20', border: 'border-slate-500 dark:border-slate-600', label: t('status.pending') },
    RUNNING: { color: 'text-accent-info', bg: 'bg-accent-info/10 dark:bg-accent-info/20', border: 'border-accent-info/20 dark:border-accent-info/30', label: t('status.running') },
    COMPLETED: { color: 'text-accent-success', bg: 'bg-accent-success/10 dark:bg-accent-success/20', border: 'border-accent-success/20 dark:border-accent-success/30', label: t('status.completed') },
    FAILED: { color: 'text-accent-error', bg: 'bg-accent-error/10 dark:bg-accent-error/20', border: 'border-accent-error/20 dark:border-accent-error/30', label: t('status.failed') }
  }
  return configs[status as keyof typeof configs] || configs.PENDING
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  const localeString = locale.value === 'ko' ? 'ko-KR' : 'en-US'
  return date.toLocaleString(localeString, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">{{ t('testList.title') }}</h1>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-400 font-mono">{{ t('testList.subtitle') }}</p>
      </div>
      <button
        @click="router.push('/tests/new')"
        class="px-4 py-2 bg-accent-primary text-white text-xs font-medium uppercase tracking-wide hover:bg-accent-primary/90 transition-all border border-accent-primary/20"
      >
        {{ t('nav.createTest') }}
      </button>
    </div>

    <!-- Filters -->
    <div class="flex items-center space-x-2 bg-white dark:bg-dark-bg-secondary border border-slate-500 dark:border-dark-border-primary p-2">
      <button
        v-for="filter in ['ALL', 'PENDING', 'RUNNING', 'COMPLETED', 'FAILED']"
        :key="filter"
        @click="selectedFilter = filter"
        class="px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all"
        :class="selectedFilter === filter
          ? 'bg-slate-900 dark:bg-slate-700 text-white'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary'"
      >
        {{ filter === 'ALL' ? t('testList.filters.all') : t('status.' + filter.toLowerCase()) }}
      </button>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="border border-red-900 bg-red-900/20 rounded-lg mb-4">
      <div class="border-b border-red-900 px-4 py-2 flex items-center justify-between">
        <span class="text-xs font-mono text-red-400 font-bold">❌ 오류 발생</span>
        <button
          @click="error = ''"
          class="text-red-400 hover:text-red-300 text-xs"
          title="Close"
        >
          ✕
        </button>
      </div>
      <div class="p-4">
        <p class="text-sm font-mono text-red-300 whitespace-pre-wrap break-words">{{ error }}</p>
      </div>
    </div>

    <!-- Tests Table -->
    <div class="bg-white dark:bg-dark-bg-secondary border border-slate-500 dark:border-dark-border-primary">
      <div v-if="loading" class="p-12 text-center">
        <div class="inline-block w-8 h-8 border-2 border-slate-500 dark:border-dark-border-primary border-t-accent-primary rounded-full animate-spin"></div>
      </div>

      <div v-else-if="filteredTests.length === 0" class="p-12 text-center">
        <svg class="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="mt-4 text-sm font-mono text-slate-500 dark:text-slate-400">{{ t('testList.noTests') }}</p>
      </div>

      <table v-else class="w-full">
        <thead class="bg-slate-50 dark:bg-dark-bg-tertiary border-b border-slate-500 dark:border-dark-border-primary">
          <tr>
            <th class="px-6 py-3 text-left text-[10px] font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{{ t('testList.table.name') }}</th>
            <th class="px-6 py-3 text-left text-[10px] font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{{ t('testList.table.type') }}</th>
            <th class="px-6 py-3 text-left text-[10px] font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{{ t('testList.table.config') }}</th>
            <th class="px-6 py-3 text-left text-[10px] font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{{ t('testList.table.status') }}</th>
            <th class="px-6 py-3 text-left text-[10px] font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{{ t('testList.table.created') }}</th>
            <th class="px-6 py-3 text-right text-[10px] font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-dark-border-primary">
          <tr
            v-for="test in filteredTests"
            :key="test.id"
            class="hover:bg-slate-50 dark:hover:bg-dark-bg-tertiary transition-colors"
          >
            <td class="px-6 py-4">
              <div class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ test.name }}</div>
              <div class="text-xs font-mono text-slate-500 dark:text-slate-400 truncate max-w-xs">{{ test.url }}</div>
            </td>
            <td class="px-6 py-4">
              <span class="text-xs font-mono text-slate-700 dark:text-slate-300 uppercase">{{ test.testType }}</span>
            </td>
            <td class="px-6 py-4">
              <div class="text-xs font-mono text-slate-600 dark:text-slate-400">
                {{ test.vus }} VUs × {{ test.duration }}
              </div>
            </td>
            <td class="px-6 py-4">
              <span
                :class="[
                  getStatusConfig(test.status).bg,
                  getStatusConfig(test.status).color,
                  getStatusConfig(test.status).border
                ]"
                class="px-2 py-1 text-[10px] font-mono uppercase tracking-wider border inline-block"
              >
                {{ getStatusConfig(test.status).label }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span class="text-xs font-mono text-slate-600 dark:text-slate-400">{{ formatDateTime(test.createdAt) }}</span>
            </td>
            <td class="px-6 py-4 text-right">
              <button
                v-if="test.status === 'COMPLETED'"
                @click="router.push('/results/' + test.id)"
                class="px-3 py-1 text-xs font-mono text-accent-primary hover:text-accent-primary/80 uppercase tracking-wider"
              >
                View →
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
