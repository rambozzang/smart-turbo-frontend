<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { apiClient, type Test } from '../api/client'

const router = useRouter()
const { t } = useI18n()
const reports = ref<Test[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const tests = await apiClient.getAllTests()
    // Filter completed and failed tests (both can have reports)
    reports.value = tests.filter((test: Test) => test.status === 'COMPLETED' || test.status === 'FAILED')
  } catch (err: any) {
    error.value = err.message || '보고서 목록을 불러오는데 실패했습니다'
    console.error('Failed to load reports:', err)
  } finally {
    loading.value = false
  }
})

function viewReport(testId: number) {
  router.push(`/results/${testId}`)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('ko-KR', {
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
        <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          {{ t('reports.title') }}
        </h1>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-400 font-mono">
          {{ t('reports.subtitle') }}
        </p>
      </div>
      <button class="px-4 py-2 bg-slate-800 dark:bg-dark-bg-tertiary text-slate-100 text-xs font-mono uppercase tracking-wider hover:bg-slate-700 transition-all border border-slate-700">
        {{ t('reports.exportAll') }}
      </button>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="border border-red-900 bg-red-900/20 rounded-lg">
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

    <!-- Loading -->
    <div v-if="loading" class="p-12 text-center bg-white dark:bg-dark-bg-secondary border border-slate-500 dark:border-dark-border-primary">
      <div class="inline-block w-8 h-8 border-2 border-slate-500 dark:border-dark-border-primary border-t-accent-primary rounded-full animate-spin"></div>
    </div>

    <!-- Reports List -->
    <div v-else class="bg-white dark:bg-dark-bg-secondary border border-slate-500 dark:border-dark-border-primary">
      <div class="border-b border-slate-500 dark:border-dark-border-primary px-6 py-3">
        <h2 class="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">{{ t('reports.availableReports') }} ({{ reports.length }})</h2>
      </div>

      <div class="divide-y divide-slate-200 dark:divide-dark-border-primary">
        <div
          v-for="report in reports"
          :key="report.id"
          class="px-6 py-4 hover:bg-slate-50 dark:hover:bg-dark-bg-tertiary transition-colors cursor-pointer"
          @click="viewReport(report.id)"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <h3 class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ report.name }}</h3>
              <div class="mt-1 flex items-center space-x-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                <span>{{ report.testType }}</span>
                <span>•</span>
                <span>{{ formatDate(report.createdAt) }}</span>
                <span>•</span>
                <span>{{ report.vus }} VUs × {{ report.duration }}</span>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <div class="px-2 py-1 bg-accent-success/10 text-accent-success text-xs font-mono border border-accent-success/20">
                {{ t('status.COMPLETED') }}
              </div>
              <svg class="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        <div v-if="reports.length === 0" class="px-6 py-12 text-center">
          <svg class="mx-auto w-12 h-12 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="mt-4 text-sm text-slate-500 dark:text-slate-400 font-mono">{{ t('reports.noReports') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
