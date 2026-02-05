<script setup lang="ts">
// @ts-nocheck
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDarkMode } from '../composables/useDarkMode'
import { apiClient } from '../api/client'
import VisualStageBuilder from '../components/VisualStageBuilder.vue'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const { isDark } = useDarkMode()

const form = ref({
  name: '',
  url: '',
  type: 'LOAD' as 'LOAD' | 'STRESS' | 'SPIKE' | 'SOAK',
  vus: 100,
  duration: '5m',
  template: 'none'
})

// 템플릿 데이터로 폼 초기화
onMounted(() => {
  const query = route.query

  if (query.template) {
    // URL 쿼리 파라미터에서 템플릿 데이터 읽기
    form.value.name = (query.name as string) || ''
    form.value.url = (query.url as string) || ''
    form.value.type = (query.testType as 'LOAD' | 'STRESS' | 'SPIKE' | 'SOAK') || 'LOAD'
    form.value.vus = parseInt(query.vus as string) || 100
    form.value.duration = (query.duration as string) || '5m'
    form.value.template = query.template as string
  }
})

const showAdvanced = ref(false)

// Advanced Configuration
const advancedConfig = ref({
  // Custom Stages
  useCustomStages: false,
  stages: [
    { duration: '2m', target: 100 }
  ] as Array<{ duration: string; target: number }>,

  // Thresholds
  thresholds: [
    { metric: 'http_req_duration', condition: 'p(95)<500' },
    { metric: 'http_req_failed', condition: 'rate<0.01' }
  ] as Array<{ metric: string; condition: string }>,

  // HTTP Headers
  headers: [] as Array<{ key: string; value: string }>,

  // Authentication
  auth: {
    type: 'none' as 'none' | 'bearer' | 'basic',
    token: '',
    username: '',
    password: ''
  },

  // Checks
  checks: [
    { name: 'status is 200', condition: 'res.status === 200' }
  ] as Array<{ name: string; condition: string }>,

  // Environment Variables
  envVars: [] as Array<{ key: string; value: string }>,

  // Tags
  tags: [] as Array<{ key: string; value: string }>,

  // HTTP Options
  timeout: 30,
  maxRedirects: 10,
  userAgent: 'k6/0.45.0 (https://k6.io/)',
  http2: true,
  discardResponseBodies: false,
  sleep: '1s'
})

// Helper functions for dynamic arrays
const addThreshold = () => {
  advancedConfig.value.thresholds.push({ metric: 'http_req_duration', condition: 'p(95)<500' })
}

const removeThreshold = (index: number) => {
  advancedConfig.value.thresholds.splice(index, 1)
}

const addHeader = () => {
  advancedConfig.value.headers.push({ key: '', value: '' })
}

const removeHeader = (index: number) => {
  advancedConfig.value.headers.splice(index, 1)
}

const addCheck = () => {
  advancedConfig.value.checks.push({ name: '', condition: '' })
}

const removeCheck = (index: number) => {
  advancedConfig.value.checks.splice(index, 1)
}

const addEnvVar = () => {
  advancedConfig.value.envVars.push({ key: '', value: '' })
}

const removeEnvVar = (index: number) => {
  advancedConfig.value.envVars.splice(index, 1)
}

const addTag = () => {
  advancedConfig.value.tags.push({ key: '', value: '' })
}

const removeTag = (index: number) => {
  advancedConfig.value.tags.splice(index, 1)
}

const testTypes = computed(() => [
  {
    value: 'LOAD',
    label: t('testCreate.loadTest'),
    icon: '📊',
    desc: t('testCreate.loadTestDesc'),
    metrics: t('testCreate.loadTestMetrics'),
    useCase: t('testCreate.loadTestUseCase')
  },
  {
    value: 'STRESS',
    label: t('testCreate.stressTest'),
    icon: '⚡',
    desc: t('testCreate.stressTestDesc'),
    metrics: t('testCreate.stressTestMetrics'),
    useCase: t('testCreate.stressTestUseCase')
  },
  {
    value: 'SPIKE',
    label: t('testCreate.spikeTest'),
    icon: '📈',
    desc: t('testCreate.spikeTestDesc'),
    metrics: t('testCreate.spikeTestMetrics'),
    useCase: t('testCreate.spikeTestUseCase')
  },
  {
    value: 'SOAK',
    label: t('testCreate.soakTest'),
    icon: '⏱️',
    desc: t('testCreate.soakTestDesc'),
    metrics: t('testCreate.soakTestMetrics'),
    useCase: t('testCreate.soakTestUseCase')
  }
])

const vusPresets = [
  { value: 10, label: t('testCreate.presets.dev'), color: 'slate', desc: '10 VUs', rps: '~50 req/s' },
  { value: 100, label: t('testCreate.presets.stage'), color: 'blue', desc: '100 VUs', rps: '~500 req/s' },
  { value: 500, label: t('testCreate.presets.prodS'), color: 'cyan', desc: '500 VUs', rps: '~2.5K req/s' },
  { value: 1000, label: t('testCreate.presets.prodM'), color: 'green', desc: '1K VUs', rps: '~5K req/s' },
  { value: 2500, label: t('testCreate.presets.prodL'), color: 'amber', desc: '2.5K VUs', rps: '~12.5K req/s' },
  { value: 5000, label: t('testCreate.presets.prodXL'), color: 'red', desc: '5K VUs', rps: '~25K req/s' },
]

const durationPresets = [
  { value: '30s', label: '30s', desc: t('testCreate.presets.smokeTest') },
  { value: '1m', label: '1m', desc: t('testCreate.presets.quickCheck') },
  { value: '5m', label: '5m', desc: t('testCreate.presets.standard') },
  { value: '10m', label: '10m', desc: t('testCreate.presets.extended') },
  { value: '20m', label: '20m', desc: t('testCreate.presets.stability') },
  { value: '30m', label: '30m', desc: t('testCreate.presets.soakTest') },
]

const isGenerating = ref(false)
const error = ref('')
const showPreview = ref(false)
const previewScript = ref('')
const loadingPreview = ref(false)

// Parse duration string to seconds
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smh])$/)
  if (!match) return 0
  const [, value, unit] = match
  if (!value || !unit) return 0
  const num = parseInt(value)

  switch (unit) {
    case 's': return num
    case 'm': return num * 60
    case 'h': return num * 60 * 60
    default: return 0
  }
}

// Calculate estimated metrics
const estimatedMetrics = computed(() => {
  const vus = form.value.vus
  const durationSeconds = parseDuration(form.value.duration)
  const avgRps = vus * 5 // Assume 5 req/s per VU
  const totalRequests = avgRps * durationSeconds
  const dataPerReq = 2 // KB
  const totalData = (totalRequests * dataPerReq) / 1024 // MB

  return {
    rps: avgRps.toLocaleString(),
    totalRequests: totalRequests.toLocaleString(),
    totalData: totalData.toFixed(1),
    avgLatency: vus < 100 ? '50-100' : vus < 500 ? '100-200' : vus < 1000 ? '200-500' : '500-1000'
  }
})

const handlePreview = async () => {
  loadingPreview.value = true
  error.value = ''

  try {
    // Create temporary test to generate script preview
    const advConfig = showAdvanced.value ? {
      stages: advancedConfig.value.useCustomStages && advancedConfig.value.stages.length > 0
        ? advancedConfig.value.stages
        : undefined,
      thresholds: advancedConfig.value.thresholds.length > 0
        ? advancedConfig.value.thresholds
        : undefined,
      headers: advancedConfig.value.headers.filter(h => h.key && h.value).length > 0
        ? advancedConfig.value.headers.filter(h => h.key && h.value)
        : undefined,
      auth: advancedConfig.value.auth.type !== 'none'
        ? {
            type: advancedConfig.value.auth.type,
            token: advancedConfig.value.auth.type === 'bearer' ? advancedConfig.value.auth.token : undefined,
            username: advancedConfig.value.auth.type === 'basic' ? advancedConfig.value.auth.username : undefined,
            password: advancedConfig.value.auth.type === 'basic' ? advancedConfig.value.auth.password : undefined
          }
        : undefined,
      checks: advancedConfig.value.checks.filter(c => c.name && c.condition).length > 0
        ? advancedConfig.value.checks.filter(c => c.name && c.condition)
        : undefined,
      envVars: advancedConfig.value.envVars.filter(e => e.key && e.value).length > 0
        ? advancedConfig.value.envVars.filter(e => e.key && e.value)
        : undefined,
      tags: advancedConfig.value.tags.filter(t => t.key && t.value).length > 0
        ? advancedConfig.value.tags.filter(t => t.key && t.value)
        : undefined,
      timeout: advancedConfig.value.timeout,
      maxRedirects: advancedConfig.value.maxRedirects,
      userAgent: advancedConfig.value.userAgent,
      http2: advancedConfig.value.http2,
      discardResponseBodies: advancedConfig.value.discardResponseBodies,
      sleep: advancedConfig.value.sleep
    } : undefined

    const test = await apiClient.createTest({
      name: form.value.name || 'Preview Test',
      url: form.value.url || 'https://example.com',
      testType: form.value.type as 'LOAD' | 'STRESS' | 'SPIKE' | 'SOAK',
      vus: form.value.vus,
      duration: form.value.duration,
      advancedConfig: advConfig
    })

    // Note: Preview disabled - scripts are now auto-generated during test creation
    // The test was created with an auto-generated script
    // Delete the preview test since we don't need it
    // TODO: Add script field to Test response or create a dedicated preview endpoint
    previewScript.value = '// Script preview temporarily disabled\n// Scripts are now auto-generated when you create a test'
    showPreview.value = true
  } catch (err: any) {
    error.value = err.message || 'Failed to generate script preview'
  } finally {
    loadingPreview.value = false
  }
}

const handleSubmit = async () => {
  isGenerating.value = true
  error.value = ''

  try {
    // Prepare advanced config
    const advConfig = showAdvanced.value ? {
      stages: advancedConfig.value.useCustomStages && advancedConfig.value.stages.length > 0
        ? advancedConfig.value.stages
        : undefined,
      thresholds: advancedConfig.value.thresholds.length > 0
        ? advancedConfig.value.thresholds
        : undefined,
      headers: advancedConfig.value.headers.filter(h => h.key && h.value).length > 0
        ? advancedConfig.value.headers.filter(h => h.key && h.value)
        : undefined,
      auth: advancedConfig.value.auth.type !== 'none'
        ? {
            type: advancedConfig.value.auth.type,
            token: advancedConfig.value.auth.type === 'bearer' ? advancedConfig.value.auth.token : undefined,
            username: advancedConfig.value.auth.type === 'basic' ? advancedConfig.value.auth.username : undefined,
            password: advancedConfig.value.auth.type === 'basic' ? advancedConfig.value.auth.password : undefined
          }
        : undefined,
      checks: advancedConfig.value.checks.filter(c => c.name && c.condition).length > 0
        ? advancedConfig.value.checks.filter(c => c.name && c.condition)
        : undefined,
      envVars: advancedConfig.value.envVars.filter(e => e.key && e.value).length > 0
        ? advancedConfig.value.envVars.filter(e => e.key && e.value)
        : undefined,
      tags: advancedConfig.value.tags.filter(t => t.key && t.value).length > 0
        ? advancedConfig.value.tags.filter(t => t.key && t.value)
        : undefined,
      timeout: advancedConfig.value.timeout,
      maxRedirects: advancedConfig.value.maxRedirects,
      userAgent: advancedConfig.value.userAgent,
      http2: advancedConfig.value.http2,
      discardResponseBodies: advancedConfig.value.discardResponseBodies,
      sleep: advancedConfig.value.sleep
    } : undefined

    const test = await apiClient.createTest({
      name: form.value.name,
      url: form.value.url,
      testType: form.value.type as 'LOAD' | 'STRESS' | 'SPIKE' | 'SOAK',
      vus: form.value.vus,
      duration: form.value.duration,
      template: form.value.template !== 'none' ? form.value.template : undefined,
      advancedConfig: advConfig
    })

    // Script is now auto-generated during test creation
    await apiClient.runTest(test.id)
    router.push('/tests')
  } catch (err: any) {
    error.value = err.message || 'Failed to create test'
  } finally {
    isGenerating.value = false
  }
}
</script>

<template>
  <div class="min-h-screen -m-6 p-6" :class="isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'">
    <!-- Terminal-style Header -->
    <div :class="isDark ? 'border-slate-800' : 'border-slate-500'" class="border-b pb-4 mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-3 h-3 rounded-full bg-red-500"></div>
          <div class="w-3 h-3 rounded-full bg-amber-500"></div>
          <div class="w-3 h-3 rounded-full bg-green-500"></div>
          <span :class="isDark ? 'text-slate-500' : 'text-slate-400'" class="ml-4 text-xs font-mono">{{ t('testCreate.headerTitle') }}</span>
          <span :class="isDark ? 'text-slate-700' : 'text-slate-300'" class="text-xs font-mono">/</span>
          <span class="text-xs font-mono text-accent-primary">{{ t('testCreate.testConfig') }}</span>
        </div>
        <button
          @click="router.push('/tests')"
          :class="isDark ? 'text-slate-400 hover:text-slate-100 border-slate-800 hover:border-slate-600' : 'text-slate-600 hover:text-slate-900 border-slate-500 hover:border-slate-500'"
          class="px-3 py-1 text-xs font-mono border transition-all"
        >
          {{ t('testCreate.escape') }}
        </button>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Main Grid -->
      <div class="grid grid-cols-12 gap-6">
        <!-- Left: Configuration -->
        <div class="col-span-8 space-y-6">
          <!-- Test Metadata -->
          <div :class="isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-500 bg-white'" class="border">
            <div :class="isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-500 bg-slate-50'" class="border-b px-4 py-2">
              <div class="flex items-center justify-between">
                <span :class="isDark ? 'text-slate-400' : 'text-slate-600'" class="text-xs font-mono">{{ t('testCreate.metadata') }}</span>
                <span :class="isDark ? 'text-slate-600' : 'text-slate-400'" class="text-xs font-mono">{{ t('testCreate.required') }}</span>
              </div>
            </div>
            <div class="p-4 space-y-4 font-mono">
              <div>
                <div class="flex items-center space-x-2 mb-2">
                  <span :class="isDark ? 'text-slate-500' : 'text-slate-400'" class="text-xs">$</span>
                  <label :class="isDark ? 'text-slate-400' : 'text-slate-600'" class="text-xs uppercase">{{ t('testCreate.testName') }}</label>
                  <span class="text-xs text-red-500">*</span>
                </div>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  :class="isDark ? 'bg-slate-950 border-slate-700 text-green-400 placeholder:text-slate-700' : 'bg-white border-slate-500 text-slate-900 placeholder:text-slate-400'"
                  class="w-full px-3 py-2 border text-sm focus:outline-none focus:border-accent-primary font-mono"
                  :placeholder="t('testCreate.testNamePlaceholder')"
                />
              </div>

              <div>
                <div class="flex items-center space-x-2 mb-2">
                  <span :class="isDark ? 'text-slate-500' : 'text-slate-400'" class="text-xs">$</span>
                  <label :class="isDark ? 'text-slate-400' : 'text-slate-600'" class="text-xs uppercase">{{ t('testCreate.targetEndpoint') }}</label>
                  <span class="text-xs text-red-500">*</span>
                </div>
                <input
                  v-model="form.url"
                  type="url"
                  required
                  :class="isDark ? 'bg-slate-950 border-slate-700 text-cyan-400 placeholder:text-slate-700' : 'bg-white border-slate-500 text-slate-900 placeholder:text-slate-400'"
                  class="w-full px-3 py-2 border text-sm focus:outline-none focus:border-accent-primary font-mono"
                  :placeholder="t('testCreate.targetUrlPlaceholder')"
                />
              </div>
            </div>
          </div>

          <!-- Test Methodology -->
          <div :class="isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-500 bg-white'" class="border">
            <div :class="isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-500 bg-slate-50'" class="border-b px-4 py-2">
              <span :class="isDark ? 'text-slate-400' : 'text-slate-600'" class="text-xs font-mono">{{ t('testCreate.methodology') }}</span>
            </div>
            <div class="p-4">
              <div class="grid grid-cols-2 gap-3">
                <button
                  v-for="type in testTypes"
                  :key="type.value"
                  type="button"
                  @click="form.type = type.value"
                  class="p-4 border text-left transition-all group"
                  :class="form.type === type.value
                    ? 'border-accent-primary bg-accent-primary/5'
                    : isDark ? 'border-slate-800 bg-slate-900/30 hover:border-slate-600' : 'border-slate-500 bg-slate-50 hover:border-slate-500'"
                >
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center space-x-2">
                      <span class="text-lg">{{ type.icon }}</span>
                      <span :class="isDark ? 'text-slate-200' : 'text-slate-700'" class="text-xs font-mono font-bold">{{ type.label }}</span>
                    </div>
                    <div class="w-2 h-2 rounded-full transition-all" :class="form.type === type.value ? 'bg-accent-primary' : isDark ? 'bg-slate-700' : 'bg-slate-300'"></div>
                  </div>
                  <div :class="isDark ? 'text-slate-400' : 'text-slate-600'" class="text-xs mb-2 font-mono">{{ type.desc }}</div>
                  <div :class="isDark ? 'text-slate-600 border-slate-800' : 'text-slate-500 border-slate-500'" class="text-[10px] font-mono border-t pt-2 mt-2">
                    {{ type.metrics }}
                  </div>
                  <div :class="isDark ? 'text-slate-700' : 'text-slate-400'" class="text-[10px] font-mono mt-1 italic">
                    → {{ type.useCase }}
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- Load Configuration -->
          <div :class="isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-500 bg-white'" class="border">
            <div :class="isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-500 bg-slate-50'" class="border-b px-4 py-2">
              <span :class="isDark ? 'text-slate-400' : 'text-slate-600'" class="text-xs font-mono">{{ t('testCreate.loadProfile') }}</span>
            </div>
            <div class="p-4 space-y-6 font-mono">
              <!-- VUs -->
              <div>
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center space-x-2">
                    <span :class="isDark ? 'text-slate-500' : 'text-slate-400'" class="text-xs">$</span>
                    <label :class="isDark ? 'text-slate-400' : 'text-slate-600'" class="text-xs uppercase">{{ t('testCreate.virtualUsers') }}</label>
                  </div>
                  <div class="text-right">
                    <div class="text-2xl font-bold text-accent-primary">{{ form.vus.toLocaleString() }}</div>
                    <div :class="isDark ? 'text-slate-600' : 'text-slate-500'" class="text-[10px]">{{ t('testCreate.concurrentConnections') }}</div>
                  </div>
                </div>
                <input
                  v-model.number="form.vus"
                  type="range"
                  min="1"
                  max="5000"
                  step="10"
                  :class="isDark ? 'bg-slate-800' : 'bg-slate-300'"
                  class="w-full h-1 appearance-none cursor-pointer accent-accent-primary mb-3"
                />
                <div class="grid grid-cols-6 gap-2">
                  <button
                    v-for="preset in vusPresets"
                    :key="preset.value"
                    type="button"
                    @click="form.vus = preset.value"
                    class="p-2 border text-center transition-all"
                    :class="form.vus === preset.value
                      ? 'border-accent-primary bg-accent-primary/10'
                      : isDark ? 'border-slate-800 bg-slate-900/50 hover:border-slate-600' : 'border-slate-500 bg-slate-50 hover:border-slate-500'"
                  >
                    <div class="text-[10px] font-bold" :class="form.vus === preset.value ? 'text-accent-primary' : isDark ? 'text-slate-400' : 'text-slate-600'">{{ preset.label }}</div>
                    <div :class="isDark ? 'text-slate-600' : 'text-slate-500'" class="text-[9px]">{{ preset.desc }}</div>
                    <div :class="isDark ? 'text-slate-700' : 'text-slate-400'" class="text-[8px] mt-1">{{ preset.rps }}</div>
                  </button>
                </div>
              </div>

              <!-- Duration -->
              <div>
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center space-x-2">
                    <span :class="isDark ? 'text-slate-500' : 'text-slate-400'" class="text-xs">$</span>
                    <label :class="isDark ? 'text-slate-400' : 'text-slate-600'" class="text-xs uppercase">{{ t('testCreate.testDuration') }}</label>
                  </div>
                  <div class="text-right">
                    <div class="text-2xl font-bold text-green-400">{{ form.duration }}</div>
                    <div :class="isDark ? 'text-slate-600' : 'text-slate-500'" class="text-[10px]">{{ t('testCreate.executionTime') }}</div>
                  </div>
                </div>
                <div class="grid grid-cols-6 gap-2">
                  <button
                    v-for="preset in durationPresets"
                    :key="preset.value"
                    type="button"
                    @click="form.duration = preset.value"
                    class="p-2 border text-center transition-all"
                    :class="form.duration === preset.value
                      ? 'border-green-500 bg-green-500/10'
                      : isDark ? 'border-slate-800 bg-slate-900/50 hover:border-slate-600' : 'border-slate-500 bg-slate-50 hover:border-slate-500'"
                  >
                    <div class="text-xs font-bold" :class="form.duration === preset.value ? 'text-green-400' : isDark ? 'text-slate-400' : 'text-slate-600'">{{ preset.label }}</div>
                    <div :class="isDark ? 'text-slate-600' : 'text-slate-500'" class="text-[9px]">{{ preset.desc }}</div>
                  </button>
                </div>
                <input
                  v-model="form.duration"
                  type="text"
                  required
                  pattern="^[0-9]+(s|m|h)$"
                  :class="isDark ? 'bg-slate-950 border-slate-700 text-green-400' : 'bg-white border-slate-500 text-slate-900'"
                  class="mt-3 w-full px-3 py-2 border text-sm focus:outline-none focus:border-green-500"
                  :placeholder="t('testCreate.customDuration')"
                />
              </div>
            </div>
          </div>

          <!-- Advanced Configuration -->
          <div :class="isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-500 bg-white'" class="border">
            <div
              :class="isDark ? 'border-slate-800 bg-slate-900 hover:bg-slate-800/50' : 'border-slate-500 bg-slate-50 hover:bg-slate-100'"
              class="border-b px-4 py-2 flex items-center justify-between cursor-pointer transition-colors"
              @click="showAdvanced = !showAdvanced"
            >
              <div class="flex items-center space-x-2">
                <span class="text-xs font-mono text-slate-400">{{ t('testCreate.advancedConfig') }}</span>
                <span class="text-xs font-mono text-slate-600">({{ t('testCreate.optional') }})</span>
              </div>
              <svg
                class="w-4 h-4 text-slate-400 transition-transform"
                :class="{ 'rotate-180': showAdvanced }"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <div v-show="showAdvanced" class="p-4 space-y-6 font-mono">
              <!-- Custom Stages with Visual Builder -->
              <div class="border border-slate-800 bg-slate-950/50">
                <div class="p-4 border-b border-slate-800">
                  <div class="flex items-center space-x-2">
                    <input
                      v-model="advancedConfig.useCustomStages"
                      type="checkbox"
                      id="useCustomStages"
                      class="w-4 h-4 bg-slate-900 border-slate-700 text-accent-primary focus:ring-accent-primary focus:ring-offset-slate-950"
                    />
                    <label for="useCustomStages" class="text-xs text-slate-300 uppercase">Custom Stages (Visual Builder)</label>
                  </div>
                </div>
                <div v-if="advancedConfig.useCustomStages" class="p-4">
                  <VisualStageBuilder
                    v-model="advancedConfig.stages"
                    :max-v-us="form.vus"
                  />
                </div>
              </div>

              <!-- HTTP Headers -->
              <div class="border border-slate-800 p-4 bg-slate-950/50">
                <div class="flex items-center justify-between mb-3">
                  <label class="text-xs text-slate-300 uppercase">HTTP Headers</label>
                  <button
                    @click="addHeader"
                    type="button"
                    class="px-2 py-1 text-[10px] border border-slate-700 text-slate-400 hover:border-accent-primary hover:text-accent-primary transition-all"
                  >
                    + Add Header
                  </button>
                </div>
                <div v-if="advancedConfig.headers.length > 0" class="space-y-2">
                  <div
                    v-for="(header, idx) in advancedConfig.headers"
                    :key="idx"
                    class="flex items-center space-x-2"
                  >
                    <input
                      v-model="header.key"
                      type="text"
                      placeholder="Header-Name"
                      class="flex-1 px-2 py-1 bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-accent-primary"
                    />
                    <input
                      v-model="header.value"
                      type="text"
                      placeholder="Header Value"
                      class="flex-1 px-2 py-1 bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-accent-primary"
                    />
                    <button
                      @click="removeHeader(idx)"
                      type="button"
                      class="p-1 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Authentication -->
              <div class="border border-slate-800 p-4 bg-slate-950/50">
                <label class="text-xs text-slate-300 uppercase mb-3 block">Authentication</label>
                <div class="space-y-3">
                  <select
                    v-model="advancedConfig.auth.type"
                    class="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-accent-primary"
                  >
                    <option value="none">None</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="basic">Basic Auth</option>
                  </select>
                  <input
                    v-if="advancedConfig.auth.type === 'bearer'"
                    v-model="advancedConfig.auth.token"
                    type="text"
                    placeholder="Bearer Token"
                    class="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-accent-primary"
                  />
                  <template v-if="advancedConfig.auth.type === 'basic'">
                    <input
                      v-model="advancedConfig.auth.username"
                      type="text"
                      placeholder="Username"
                      class="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-accent-primary"
                    />
                    <input
                      v-model="advancedConfig.auth.password"
                      type="password"
                      placeholder="Password"
                      class="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-accent-primary"
                    />
                  </template>
                </div>
              </div>

              <!-- Thresholds -->
              <div class="border border-slate-800 p-4 bg-slate-950/50">
                <div class="flex items-center justify-between mb-3">
                  <label class="text-xs text-slate-300 uppercase">Performance Thresholds</label>
                  <button
                    @click="addThreshold"
                    type="button"
                    class="px-2 py-1 text-[10px] border border-slate-700 text-slate-400 hover:border-accent-primary hover:text-accent-primary transition-all"
                  >
                    + Add Threshold
                  </button>
                </div>
                <div class="space-y-2">
                  <div
                    v-for="(threshold, idx) in advancedConfig.thresholds"
                    :key="idx"
                    class="flex items-center space-x-2"
                  >
                    <input
                      v-model="threshold.metric"
                      type="text"
                      placeholder="http_req_duration"
                      class="flex-1 px-2 py-1 bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-accent-primary"
                    />
                    <input
                      v-model="threshold.condition"
                      type="text"
                      placeholder="p(95)<500"
                      class="flex-1 px-2 py-1 bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-accent-primary"
                    />
                    <button
                      @click="removeThreshold(idx)"
                      type="button"
                      class="p-1 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Checks -->
              <div class="border border-slate-800 p-4 bg-slate-950/50">
                <div class="flex items-center justify-between mb-3">
                  <label class="text-xs text-slate-300 uppercase">Response Checks</label>
                  <button
                    @click="addCheck"
                    type="button"
                    class="px-2 py-1 text-[10px] border border-slate-700 text-slate-400 hover:border-accent-primary hover:text-accent-primary transition-all"
                  >
                    + Add Check
                  </button>
                </div>
                <div class="space-y-2">
                  <div
                    v-for="(check, idx) in advancedConfig.checks"
                    :key="idx"
                    class="flex items-center space-x-2"
                  >
                    <input
                      v-model="check.name"
                      type="text"
                      placeholder="status is 200"
                      class="flex-1 px-2 py-1 bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-accent-primary"
                    />
                    <input
                      v-model="check.condition"
                      type="text"
                      placeholder="res.status === 200"
                      class="flex-1 px-2 py-1 bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-accent-primary"
                    />
                    <button
                      @click="removeCheck(idx)"
                      type="button"
                      class="p-1 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Environment Variables -->
              <div class="border border-slate-800 p-4 bg-slate-950/50">
                <div class="flex items-center justify-between mb-3">
                  <label class="text-xs text-slate-300 uppercase">Environment Variables</label>
                  <button
                    @click="addEnvVar"
                    type="button"
                    class="px-2 py-1 text-[10px] border border-slate-700 text-slate-400 hover:border-accent-primary hover:text-accent-primary transition-all"
                  >
                    + Add Variable
                  </button>
                </div>
                <div v-if="advancedConfig.envVars.length > 0" class="space-y-2">
                  <div
                    v-for="(envVar, idx) in advancedConfig.envVars"
                    :key="idx"
                    class="flex items-center space-x-2"
                  >
                    <input
                      v-model="envVar.key"
                      type="text"
                      placeholder="VAR_NAME"
                      class="flex-1 px-2 py-1 bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-accent-primary"
                    />
                    <input
                      v-model="envVar.value"
                      type="text"
                      placeholder="value"
                      class="flex-1 px-2 py-1 bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-accent-primary"
                    />
                    <button
                      @click="removeEnvVar(idx)"
                      type="button"
                      class="p-1 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Tags -->
              <div class="border border-slate-800 p-4 bg-slate-950/50">
                <div class="flex items-center justify-between mb-3">
                  <label class="text-xs text-slate-300 uppercase">Tags</label>
                  <button
                    @click="addTag"
                    type="button"
                    class="px-2 py-1 text-[10px] border border-slate-700 text-slate-400 hover:border-accent-primary hover:text-accent-primary transition-all"
                  >
                    + Add Tag
                  </button>
                </div>
                <div v-if="advancedConfig.tags.length > 0" class="space-y-2">
                  <div
                    v-for="(tag, idx) in advancedConfig.tags"
                    :key="idx"
                    class="flex items-center space-x-2"
                  >
                    <input
                      v-model="tag.key"
                      type="text"
                      placeholder="tag-name"
                      class="flex-1 px-2 py-1 bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-accent-primary"
                    />
                    <input
                      v-model="tag.value"
                      type="text"
                      placeholder="value"
                      class="flex-1 px-2 py-1 bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-accent-primary"
                    />
                    <button
                      @click="removeTag(idx)"
                      type="button"
                      class="p-1 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- HTTP Options -->
              <div class="border border-slate-800 p-4 bg-slate-950/50">
                <label class="text-xs text-slate-300 uppercase mb-3 block">HTTP Options</label>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="text-[10px] text-slate-500 uppercase block mb-1">Timeout (s)</label>
                    <input
                      v-model.number="advancedConfig.timeout"
                      type="number"
                      class="w-full px-2 py-1 bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-accent-primary"
                    />
                  </div>
                  <div>
                    <label class="text-[10px] text-slate-500 uppercase block mb-1">Max Redirects</label>
                    <input
                      v-model.number="advancedConfig.maxRedirects"
                      type="number"
                      class="w-full px-2 py-1 bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-accent-primary"
                    />
                  </div>
                  <div class="col-span-2">
                    <label class="text-[10px] text-slate-500 uppercase block mb-1">User Agent</label>
                    <input
                      v-model="advancedConfig.userAgent"
                      type="text"
                      class="w-full px-2 py-1 bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-accent-primary"
                    />
                  </div>
                  <div class="col-span-2 space-y-2">
                    <label class="flex items-center space-x-2 cursor-pointer">
                      <input
                        v-model="advancedConfig.http2"
                        type="checkbox"
                        class="w-4 h-4 bg-slate-900 border-slate-700 text-accent-primary focus:ring-accent-primary focus:ring-offset-slate-950"
                      />
                      <span class="text-[10px] text-slate-400">Enable HTTP/2</span>
                    </label>
                    <label class="flex items-center space-x-2 cursor-pointer">
                      <input
                        v-model="advancedConfig.discardResponseBodies"
                        type="checkbox"
                        class="w-4 h-4 bg-slate-900 border-slate-700 text-accent-primary focus:ring-accent-primary focus:ring-offset-slate-950"
                      />
                      <span class="text-[10px] text-slate-400">Discard Response Bodies (save memory)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Metrics & Execution -->
        <div class="col-span-4 space-y-6">
          <!-- Estimated Performance -->
          <div :class="isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-500 bg-white'" class="border sticky top-6">
            <div :class="isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-500 bg-slate-50'" class="border-b px-4 py-2">
              <span :class="isDark ? 'text-slate-400' : 'text-slate-600'" class="text-xs font-mono">{{ t('testCreate.estimatedMetrics') }}</span>
            </div>
            <div class="p-4 space-y-4 font-mono">
              <div class="grid grid-cols-2 gap-3">
                <div :class="isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-500'" class="p-3 border">
                  <div :class="isDark ? 'text-slate-600' : 'text-slate-500'" class="text-[10px] uppercase mb-1">{{ t('testCreate.rps') }}</div>
                  <div class="text-lg font-bold text-amber-400">{{ estimatedMetrics.rps }}</div>
                  <div :class="isDark ? 'text-slate-700' : 'text-slate-400'" class="text-[9px]">{{ t('testCreate.reqPerSec') }}</div>
                </div>
                <div :class="isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-500'" class="p-3 border">
                  <div :class="isDark ? 'text-slate-600' : 'text-slate-500'" class="text-[10px] uppercase mb-1">{{ t('testCreate.totalReq') }}</div>
                  <div class="text-lg font-bold text-cyan-400">{{ estimatedMetrics.totalRequests }}</div>
                  <div :class="isDark ? 'text-slate-700' : 'text-slate-400'" class="text-[9px]">{{ t('testCreate.requests') }}</div>
                </div>
                <div :class="isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-500'" class="p-3 border">
                  <div :class="isDark ? 'text-slate-600' : 'text-slate-500'" class="text-[10px] uppercase mb-1">{{ t('testCreate.data') }}</div>
                  <div class="text-lg font-bold text-purple-400">{{ estimatedMetrics.totalData }}</div>
                  <div :class="isDark ? 'text-slate-700' : 'text-slate-400'" class="text-[9px]">{{ t('testCreate.mb') }}</div>
                </div>
                <div :class="isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-500'" class="p-3 border">
                  <div :class="isDark ? 'text-slate-600' : 'text-slate-500'" class="text-[10px] uppercase mb-1">{{ t('testCreate.estP95') }}</div>
                  <div class="text-lg font-bold text-green-400">{{ estimatedMetrics.avgLatency }}</div>
                  <div :class="isDark ? 'text-slate-700' : 'text-slate-400'" class="text-[9px]">{{ t('testCreate.ms') }}</div>
                </div>
              </div>

              <div :class="isDark ? 'border-slate-800' : 'border-slate-500'" class="border-t pt-4 space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <span :class="isDark ? 'text-slate-600' : 'text-slate-500'">{{ t('testCreate.testType') }}:</span>
                  <span :class="isDark ? 'text-slate-300' : 'text-slate-700'" class="font-bold">{{ form.type }}</span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span :class="isDark ? 'text-slate-600' : 'text-slate-500'">{{ t('testCreate.vus') }}:</span>
                  <span class="text-accent-primary font-bold">{{ form.vus.toLocaleString() }}</span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span :class="isDark ? 'text-slate-600' : 'text-slate-500'">{{ t('testCreate.duration') }}:</span>
                  <span class="text-green-400 font-bold">{{ form.duration }}</span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span :class="isDark ? 'text-slate-600' : 'text-slate-500'">{{ t('testCreate.target') }}:</span>
                  <span class="text-cyan-400 font-bold truncate max-w-[180px]" :title="form.url">{{ form.url || 'N/A' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- System Info -->
          <div :class="isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-500 bg-white'" class="border">
            <div :class="isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-500 bg-slate-50'" class="border-b px-4 py-2">
              <span :class="isDark ? 'text-slate-400' : 'text-slate-600'" class="text-xs font-mono">{{ t('testCreate.systemStatus') }}</span>
            </div>
            <div class="p-4 space-y-2 font-mono text-xs">
              <div class="flex items-center justify-between">
                <span :class="isDark ? 'text-slate-600' : 'text-slate-500'">{{ t('testCreate.k6Engine') }}:</span>
                <div class="flex items-center space-x-1">
                  <div class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span class="text-green-400">{{ t('testCreate.ready') }}</span>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <span :class="isDark ? 'text-slate-600' : 'text-slate-500'">{{ t('testCreate.aiGenerator') }}:</span>
                <div class="flex items-center space-x-1">
                  <div class="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span class="text-green-400">{{ t('testCreate.online') }}</span>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <span :class="isDark ? 'text-slate-600' : 'text-slate-500'">{{ t('testCreate.backendApi') }}:</span>
                <div class="flex items-center space-x-1">
                  <div class="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span class="text-green-400">{{ t('testCreate.connected') }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Error -->
          <div v-if="error" class="border border-red-900 bg-red-900/20 rounded-lg">
            <div class="border-b border-red-900 px-4 py-2 flex items-center justify-between">
              <span class="text-xs font-mono text-red-400 font-bold">❌ {{ t('testCreate.error') }}</span>
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

          <!-- Execute -->
          <div class="space-y-2">
            <button
              type="submit"
              :disabled="isGenerating || !form.name || !form.url"
              class="w-full px-4 py-4 bg-accent-primary hover:bg-accent-primary/90 text-white text-sm font-mono font-bold uppercase tracking-widest transition-all border border-accent-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isGenerating" class="flex items-center justify-center space-x-2">
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ t('testCreate.executing') }}</span>
              </span>
              <span v-else>⚡ {{ t('testCreate.executeTest') }}</span>
            </button>
            <button
              type="button"
              @click="handlePreview"
              :disabled="loadingPreview || !form.url"
              class="w-full px-4 py-2 border border-blue-600 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 hover:border-blue-500 text-xs font-mono uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loadingPreview" class="flex items-center justify-center space-x-2">
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ t('testCreate.preview.generating') }}</span>
              </span>
              <span v-else>👁️ {{ t('testCreate.preview.button') }}</span>
            </button>
            <button
              type="button"
              @click="router.push('/tests')"
              class="w-full px-4 py-2 border border-slate-700 text-slate-400 hover:text-slate-100 hover:border-slate-500 text-xs font-mono uppercase tracking-wider transition-all"
            >
              {{ t('testCreate.cancel') }}
            </button>
          </div>

          <!-- Execution Info -->
          <div class="border border-slate-800 bg-slate-950/50 p-4">
            <div class="text-[10px] font-mono text-slate-600 uppercase mb-3 flex items-center space-x-2">
              <span>ℹ️</span>
              <span>{{ t('testCreate.executionPipeline') }}</span>
            </div>
            <div class="space-y-2 text-xs font-mono text-slate-500">
              <div class="flex items-start space-x-2">
                <span class="text-slate-700">01.</span>
                <span>{{ t('testCreate.step1') }}</span>
              </div>
              <div class="flex items-start space-x-2">
                <span class="text-slate-700">02.</span>
                <span>{{ t('testCreate.step2') }}</span>
              </div>
              <div class="flex items-start space-x-2">
                <span class="text-slate-700">03.</span>
                <span>{{ t('testCreate.step3') }}</span>
              </div>
              <div class="flex items-start space-x-2">
                <span class="text-slate-700">04.</span>
                <span>{{ t('testCreate.step4') }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-slate-700">05.</span>
                <span>{{ t('testCreate.step5') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>

    <!-- Script Preview Modal -->
    <div
      v-if="showPreview"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      @click.self="showPreview = false"
      @keydown.esc="showPreview = false"
      tabindex="-1"
    >
      <div class="w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-700 shadow-2xl flex flex-col">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h2 id="preview-modal-title" class="text-lg font-mono font-bold text-slate-100">{{ t('testCreate.preview.title') }}</h2>
            <p class="text-xs font-mono text-slate-400 mt-1">{{ t('testCreate.preview.description') }}</p>
          </div>
          <button
            @click="showPreview = false"
            class="p-2 hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="flex-1 overflow-auto p-6">
          <pre class="text-xs font-mono text-slate-200 bg-slate-950 p-4 rounded border border-slate-800 overflow-x-auto"><code>{{ previewScript }}</code></pre>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
          <div class="text-xs font-mono text-slate-500">
            💡 {{ t('testCreate.preview.tip') }}
          </div>
          <button
            @click="showPreview = false"
            class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono uppercase tracking-wider transition-all"
          >
            {{ t('testCreate.preview.close') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
