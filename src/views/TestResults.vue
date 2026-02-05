<script setup lang="ts">
// @ts-nocheck
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { apiClient, type TestResult } from '../api/client'
import { marked } from 'marked'
import AdvancedResultsDashboard from '../components/AdvancedResultsDashboard.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const result = ref<TestResult | null>(null)
const loading = ref(true)
const error = ref('')
const availableReports = ref({ markdown: false, html: false })
const downloadingReport = ref<string | null>(null)
const activeTab = ref<'metrics' | 'report'>('metrics')
const reportContent = ref<string>('')
const loadingReport = ref(false)

const testId = computed(() => Number(route.params.id))

const renderedReport = computed(() => {
  if (!reportContent.value) return ''
  return marked(reportContent.value)
})

onMounted(async () => {
  try {
    result.value = await apiClient.getTestResult(testId.value)
    // Check available reports
    availableReports.value = await apiClient.checkAvailableReports(testId.value)
  } catch (err: any) {
    error.value = err.message || 'Failed to load test results'
  } finally {
    loading.value = false
  }
})

function viewHtmlReport() {
  // Open HTML report in new tab
  const url = `http://localhost:8080/api/tests/${testId.value}/reports/html/view`
  window.open(url, '_blank')
}

async function downloadHtmlReport() {
  try {
    downloadingReport.value = 'html'
    await apiClient.downloadReport(testId.value, 'html')
  } catch (err: any) {
    alert('Failed to download HTML report: ' + err.message)
  } finally {
    downloadingReport.value = null
  }
}

async function downloadMarkdownReport() {
  try {
    downloadingReport.value = 'markdown'

    // Generate if not available
    if (!availableReports.value.markdown) {
      await apiClient.generateMarkdownReport(testId.value)
      availableReports.value.markdown = true
    }

    await apiClient.downloadReport(testId.value, 'markdown')
  } catch (err: any) {
    alert('Failed to download Markdown report: ' + err.message)
  } finally {
    downloadingReport.value = null
  }
}

async function loadReportContent() {
  if (reportContent.value) return // Already loaded

  try {
    loadingReport.value = true

    // Generate if not available
    if (!availableReports.value.markdown) {
      await apiClient.generateMarkdownReport(testId.value)
      availableReports.value.markdown = true
    }

    const response = await apiClient.getMarkdownContent(testId.value)
    reportContent.value = response.content
  } catch (err: any) {
    reportContent.value = `# ❌ 보고서 로드 실패\n\n${err.message}`
  } finally {
    loadingReport.value = false
  }
}

async function switchTab(tab: 'metrics' | 'report') {
  activeTab.value = tab
  if (tab === 'report' && !reportContent.value) {
    await loadReportContent()
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <button
          @click="router.push('/tests')"
          class="mb-2 text-xs font-mono text-accent-primary hover:text-accent-primary/80 uppercase tracking-wider"
        >
          ← {{ t('testResults.backToTests') }}
        </button>
        <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          {{ result?.testName || t('testResults.title') }}
        </h1>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-400 font-mono">
          {{ t('testResults.subtitle') }} #{{ testId }}
        </p>
      </div>

      <!-- Download Reports -->
      <div v-if="!loading && !error" class="flex items-center space-x-3">
        <button
          @click="downloadMarkdownReport"
          :disabled="downloadingReport !== null"
          class="px-4 py-2 bg-slate-800 dark:bg-dark-bg-tertiary text-slate-100 dark:text-slate-200 text-xs font-mono uppercase tracking-wider hover:bg-slate-700 dark:hover:bg-slate-700 transition-all border border-slate-700 dark:border-dark-border-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <svg v-if="downloadingReport === 'markdown'" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>{{ availableReports.markdown ? t('testResults.reportDownload.markdown') : t('testResults.reportDownload.generateMd') }}</span>
        </button>

        <button
          @click="viewHtmlReport"
          :disabled="!availableReports.html"
          class="px-4 py-2 bg-accent-success text-white text-xs font-mono uppercase tracking-wider hover:bg-accent-success/90 transition-all border border-accent-success/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          :title="!availableReports.html ? 'HTML report not available' : 'View HTML report in browser'"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>브라우저에서 보기</span>
        </button>

        <button
          @click="downloadHtmlReport"
          :disabled="!availableReports.html || downloadingReport !== null"
          class="px-4 py-2 bg-accent-primary text-white text-xs font-mono uppercase tracking-wider hover:bg-accent-primary/90 transition-all border border-accent-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          :title="!availableReports.html ? 'HTML report not available' : 'Download HTML report'"
        >
          <svg v-if="downloadingReport === 'html'" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>{{ t('testResults.reportDownload.htmlReport') }}</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-12 text-center bg-white dark:bg-dark-bg-secondary border border-slate-500 dark:border-dark-border-primary">
      <div class="inline-block w-8 h-8 border-2 border-slate-500 dark:border-dark-border-primary border-t-accent-primary rounded-full animate-spin"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-8 bg-accent-error/10 dark:bg-accent-error/20 border border-accent-error/20 dark:border-accent-error/30">
      <p class="text-sm font-mono text-accent-error">{{ error }}</p>
    </div>

    <!-- Results -->
    <template v-else-if="result">
      <!-- Tabs -->
      <div class="bg-white dark:bg-dark-bg-secondary border border-slate-500 dark:border-dark-border-primary mb-6">
        <div class="flex border-b border-slate-500 dark:border-dark-border-primary">
          <button
            @click="switchTab('metrics')"
            class="px-6 py-3 text-xs font-mono uppercase tracking-wider transition-all"
            :class="activeTab === 'metrics'
              ? 'bg-slate-900 dark:bg-slate-700 text-white border-b-2 border-accent-primary'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary'"
          >
            📊 {{ t('testResults.tabs.metrics') }}
          </button>
          <button
            @click="switchTab('report')"
            class="px-6 py-3 text-xs font-mono uppercase tracking-wider transition-all"
            :class="activeTab === 'report'
              ? 'bg-slate-900 dark:bg-slate-700 text-white border-b-2 border-accent-primary'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary'"
          >
            📝 {{ t('testResults.tabs.report') }}
          </button>
        </div>
      </div>

      <!-- Metrics Tab -->
      <div v-if="activeTab === 'metrics'">
        <AdvancedResultsDashboard :result="result" />
      </div><!-- End Metrics Tab -->

      <!-- Report Tab -->
      <div v-else-if="activeTab === 'report'">
        <!-- Loading State -->
        <div v-if="loadingReport" class="p-12 text-center bg-white dark:bg-dark-bg-secondary border border-slate-500 dark:border-dark-border-primary">
          <div class="inline-block w-8 h-8 border-2 border-slate-500 dark:border-dark-border-primary border-t-accent-primary rounded-full animate-spin"></div>
          <p class="mt-4 text-sm font-mono text-slate-600 dark:text-slate-400">{{ t('testResults.reportLoading') }}</p>
        </div>

        <!-- Report Content -->
        <div v-else class="bg-white dark:bg-dark-bg-secondary border border-slate-500 dark:border-dark-border-primary p-8">
          <div
            class="prose prose-slate dark:prose-invert max-w-none
              prose-headings:font-mono prose-headings:tracking-tight
              prose-h1:text-2xl prose-h1:border-b prose-h1:border-slate-500 prose-h1:dark:border-dark-border-primary prose-h1:pb-2 prose-h1:mb-4
              prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4
              prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-sm prose-p:leading-relaxed
              prose-table:text-xs prose-table:font-mono
              prose-th:bg-slate-50 prose-th:dark:bg-dark-bg-tertiary
              prose-td:border-slate-500 prose-td:dark:border-dark-border-primary
              prose-strong:text-slate-900 prose-strong:dark:text-slate-100
              prose-code:bg-slate-100 prose-code:dark:bg-dark-bg-tertiary prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-slate-900 prose-pre:dark:bg-slate-950"
            v-html="renderedReport"
          ></div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* 마크다운 렌더링 스타일 개선 */
:deep(.prose) {
  @apply text-slate-800 dark:text-slate-200;
}

:deep(.prose table) {
  @apply border-collapse w-full;
}

:deep(.prose th) {
  @apply px-4 py-2 text-left border border-slate-500 dark:border-dark-border-primary;
}

:deep(.prose td) {
  @apply px-4 py-2 border border-slate-500 dark:border-dark-border-primary;
}

:deep(.prose ul) {
  @apply list-disc pl-6;
}

:deep(.prose ol) {
  @apply list-decimal pl-6;
}

:deep(.prose blockquote) {
  @apply border-l-4 border-accent-primary pl-4 italic;
}

:deep(.prose hr) {
  @apply border-slate-500 dark:border-dark-border-primary my-6;
}
</style>
