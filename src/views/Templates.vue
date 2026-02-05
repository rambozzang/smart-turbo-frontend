<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { apiClient, type Template } from '../api/client'

const { t } = useI18n()
const router = useRouter()

const templates = ref<Template[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    loading.value = true
    templates.value = await apiClient.getTemplates()
  } catch (err: any) {
    error.value = err.message || 'Failed to load templates'
    console.error('Failed to load templates:', err)
  } finally {
    loading.value = false
  }
})

function useTemplate(template: Template) {
  // 템플릿 데이터를 query parameter로 전달하여 테스트 생성 페이지로 이동
  router.push({
    path: '/tests/new',
    query: {
      template: template.id.toString(),
      name: template.name,
      testType: template.testType,
      vus: template.virtualUsers.toString(),
      duration: template.duration,
      url: ''
    }
  })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          {{ t('templates.title') }}
        </h1>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-400 font-mono">
          {{ t('templates.subtitle') }}
        </p>
      </div>
      <button class="px-4 py-2 bg-accent-primary text-white text-xs font-mono uppercase tracking-wider hover:bg-accent-primary/90 transition-all border border-accent-primary/20">
        {{ t('templates.createTemplate') }}
      </button>
    </div>

    <!-- Error Message -->
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

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="inline-block w-8 h-8 border-2 border-slate-500 dark:border-dark-border-primary border-t-accent-primary rounded-full animate-spin"></div>
    </div>

    <!-- Templates Grid -->
    <div v-else-if="!error && templates.length > 0" class="grid grid-cols-2 gap-4">
      <div
        v-for="template in templates"
        :key="template.id"
        class="bg-white dark:bg-dark-bg-secondary border border-slate-500 dark:border-dark-border-primary hover:border-accent-primary dark:hover:border-accent-primary transition-all cursor-pointer group"
        @click="useTemplate(template)"
      >
        <div class="p-6">
          <div class="flex items-start justify-between">
            <div class="text-4xl">{{ template.icon }}</div>
            <div class="px-2 py-1 bg-slate-100 dark:bg-dark-bg-tertiary text-slate-600 dark:text-slate-400 text-[10px] font-mono uppercase">
              {{ template.testType }}
            </div>
          </div>
          <h3 class="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-accent-primary transition-colors">
            {{ template.name }}
          </h3>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {{ template.description }}
          </p>
          <div class="mt-4 flex items-center space-x-4 text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>{{ template.vus }} VUs</span>
            <span>•</span>
            <span>{{ template.duration }}</span>
          </div>
          <button
            @click.stop="useTemplate(template)"
            class="mt-4 w-full px-4 py-2 bg-slate-100 dark:bg-dark-bg-tertiary text-slate-900 dark:text-slate-100 text-xs font-mono uppercase tracking-wider hover:bg-accent-primary hover:text-white transition-all"
          >
            {{ t('templates.useTemplate') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && !error && templates.length === 0" class="text-center py-12">
      <svg class="w-16 h-16 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="text-slate-600 dark:text-slate-400 text-sm font-mono">{{ t('templates.noTemplates') || 'No templates available' }}</p>
    </div>
  </div>
</template>
