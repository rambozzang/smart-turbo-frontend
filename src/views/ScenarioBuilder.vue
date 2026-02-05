<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDarkMode } from '../composables/useDarkMode'
import { apiClient } from '../api/client'

const router = useRouter()
const { t } = useI18n()
const { isDark } = useDarkMode()

// Mode selection
type Mode = 'gui' | 'code'
const mode = ref<Mode>('gui')

// Scenario data
const scenarioName = ref('')
const scenarioDescription = ref('')
const baseUrl = ref('https://api.example.com')
const globalHeaders = ref<Array<{ key: string; value: string }>>([])

// Steps for GUI mode
interface Step {
  name: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  url: string
  headers: Array<{ key: string; value: string }>
  body: string
  thinkTime: string
  extractVariables: Array<{ key: string; value: string }>
  checks: Array<{ name: string; condition: string }>
}

const steps = ref<Step[]>([])
const currentStep = ref<Step>({
  name: '',
  method: 'GET',
  url: '${baseUrl}/endpoint',
  headers: [],
  body: '',
  thinkTime: '1s',
  extractVariables: [],
  checks: []
})

// Code mode
const codeContent = ref(`{
  "name": "Example Scenario",
  "description": "Multi-step user journey",
  "baseUrl": "https://api.example.com",
  "steps": [
    {
      "name": "Login",
      "method": "POST",
      "url": "\${baseUrl}/auth/login",
      "body": "{\\"email\\":\\"test@example.com\\",\\"password\\":\\"password\\"}",
      "thinkTime": "2s",
      "extractVariables": {
        "token": "json.token"
      }
    },
    {
      "name": "Get Profile",
      "method": "GET",
      "url": "\${baseUrl}/users/me",
      "headers": {
        "Authorization": "Bearer \${token}"
      },
      "thinkTime": "1s"
    }
  ]
}`)

// Preview
const previewScript = ref('')
const showPreview = ref(false)
const isLoadingPreview = ref(false)

// Test creation
const testName = ref('')
const testVus = ref(50)
const testDuration = ref('5m')
const testType = ref<'LOAD' | 'STRESS' | 'SPIKE' | 'SOAK'>('LOAD')
const showTestCreation = ref(false)
const isCreatingTest = ref(false)

// Error handling
const error = ref('')
const success = ref('')

// Help modal
const showHelp = ref(false)

// Add step in GUI mode
function addStep() {
  if (!currentStep.value.name || !currentStep.value.url) {
    error.value = t('scenarioBuilder.messages.stepNameRequired')
    return
  }

  steps.value.push({ ...currentStep.value })

  // Reset current step
  currentStep.value = {
    name: '',
    method: 'GET',
    url: '${baseUrl}/endpoint',
    headers: [],
    body: '',
    thinkTime: '1s',
    extractVariables: [],
    checks: []
  }

  success.value = t('scenarioBuilder.messages.stepAdded')
  setTimeout(() => success.value = '', 3000)
}

function removeStep(index: number) {
  steps.value.splice(index, 1)
}

function editStep(index: number) {
  currentStep.value = { ...steps.value[index] }
  steps.value.splice(index, 1)
}

// Header/variable management
function addHeader() {
  currentStep.value.headers.push({ key: '', value: '' })
}

function removeHeader(index: number) {
  currentStep.value.headers.splice(index, 1)
}

function addGlobalHeader() {
  globalHeaders.value.push({ key: '', value: '' })
}

function removeGlobalHeader(index: number) {
  globalHeaders.value.splice(index, 1)
}

function addExtractVariable() {
  currentStep.value.extractVariables.push({ key: '', value: '' })
}

function removeExtractVariable(index: number) {
  currentStep.value.extractVariables.splice(index, 1)
}

function addCheck() {
  currentStep.value.checks.push({ name: '', condition: '' })
}

function removeCheck(index: number) {
  currentStep.value.checks.splice(index, 1)
}

// Preview script
async function previewScenario() {
  error.value = ''
  isLoadingPreview.value = true

  try {
    const scenario = mode.value === 'gui' ? buildScenarioFromGui() : JSON.parse(codeContent.value)

    const response = await apiClient.post('/scenarios/preview', scenario)
    previewScript.value = response.script
    showPreview.value = true
  } catch (err: any) {
    error.value = err.message || t('scenarioBuilder.messages.previewFailed')
  } finally {
    isLoadingPreview.value = false
  }
}

// Build scenario from GUI
function buildScenarioFromGui() {
  const headers: Record<string, string> = {}
  globalHeaders.value.forEach(h => {
    if (h.key && h.value) headers[h.key] = h.value
  })

  return {
    name: scenarioName.value,
    description: scenarioDescription.value || null,
    baseUrl: baseUrl.value,
    globalHeaders: Object.keys(headers).length > 0 ? headers : null,
    steps: steps.value.map(step => ({
      name: step.name,
      method: step.method,
      url: step.url,
      headers: step.headers.length > 0 ?
        step.headers.reduce((acc, h) => {
          if (h.key && h.value) acc[h.key] = h.value
          return acc
        }, {} as Record<string, string>) : null,
      body: step.body || null,
      thinkTime: step.thinkTime || null,
      extractVariables: step.extractVariables.length > 0 ?
        step.extractVariables.reduce((acc, v) => {
          if (v.key && v.value) acc[v.key] = v.value
          return acc
        }, {} as Record<string, string>) : null,
      checks: step.checks.length > 0 ? step.checks.filter(c => c.name && c.condition) : null
    }))
  }
}

// Create test from scenario
async function createTest() {
  error.value = ''

  if (!testName.value) {
    error.value = t('scenarioBuilder.messages.testNameRequired')
    return
  }

  isCreatingTest.value = true

  try {
    const scenario = mode.value === 'gui' ? buildScenarioFromGui() : JSON.parse(codeContent.value)

    const request = {
      name: testName.value,
      testType: testType.value,
      vus: testVus.value,
      duration: testDuration.value,
      scenario: scenario
    }

    const response = await apiClient.post('/scenarios/create-test', request)

    success.value = t('scenarioBuilder.messages.testCreated')
    setTimeout(() => {
      router.push({ name: 'tests' })
    }, 1500)
  } catch (err: any) {
    error.value = err.message || t('scenarioBuilder.messages.createFailed')
  } finally {
    isCreatingTest.value = false
  }
}

// Validate scenario
async function validateScenario() {
  error.value = ''

  try {
    const scenario = mode.value === 'gui' ? buildScenarioFromGui() : JSON.parse(codeContent.value)

    const response = await apiClient.post('/scenarios/validate', scenario)

    if (response.warnings && response.warnings.length > 0) {
      success.value = `${t('scenarioBuilder.messages.scenarioValidWithWarnings', { count: response.warnings.length })}:\n${response.warnings.join('\n')}`
    } else {
      success.value = t('scenarioBuilder.messages.scenarioValid')
    }

    setTimeout(() => success.value = '', 5000)
  } catch (err: any) {
    error.value = err.message || t('scenarioBuilder.messages.validateFailed')
  }
}

// Load example
function loadExample() {
  if (mode.value === 'code') {
    codeContent.value = `{
  "name": "E-commerce Purchase Flow",
  "description": "Complete user journey from login to checkout",
  "baseUrl": "https://api.example.com",
  "globalHeaders": {
    "Content-Type": "application/json"
  },
  "steps": [
    {
      "name": "Login",
      "method": "POST",
      "url": "\${baseUrl}/auth/login",
      "body": "{\\"email\\":\\"test@example.com\\",\\"password\\":\\"password123\\"}",
      "thinkTime": "2s",
      "extractVariables": {
        "token": "json.token",
        "userId": "json.user.id"
      },
      "checks": [
        { "name": "login successful", "condition": "r.status === 200" },
        { "name": "token exists", "condition": "r.json('token') !== undefined" }
      ]
    },
    {
      "name": "Browse Products",
      "method": "GET",
      "url": "\${baseUrl}/products?page=1&limit=20",
      "headers": {
        "Authorization": "Bearer \${token}"
      },
      "thinkTime": "3s",
      "checks": [
        { "name": "products loaded", "condition": "r.status === 200" }
      ]
    },
    {
      "name": "Add to Cart",
      "method": "POST",
      "url": "\${baseUrl}/cart/items",
      "headers": {
        "Authorization": "Bearer \${token}"
      },
      "body": "{\\"productId\\":123,\\"quantity\\":2}",
      "thinkTime": "2s",
      "extractVariables": {
        "cartId": "json.cart.id"
      }
    },
    {
      "name": "Checkout",
      "method": "POST",
      "url": "\${baseUrl}/orders",
      "headers": {
        "Authorization": "Bearer \${token}"
      },
      "body": "{\\"cartId\\":\\"\${cartId}\\",\\"paymentMethod\\":\\"credit_card\\"}",
      "thinkTime": "1s",
      "checks": [
        { "name": "order created", "condition": "r.status === 201" }
      ]
    }
  ]
}`
  } else {
    // Load example into GUI
    scenarioName.value = 'E-commerce Purchase Flow'
    scenarioDescription.value = 'Complete user journey from login to checkout'
    baseUrl.value = 'https://api.example.com'

    globalHeaders.value = [{ key: 'Content-Type', value: 'application/json' }]

    steps.value = [
      {
        name: 'Login',
        method: 'POST',
        url: '${baseUrl}/auth/login',
        headers: [],
        body: '{"email":"test@example.com","password":"password123"}',
        thinkTime: '2s',
        extractVariables: [
          { key: 'token', value: 'json.token' },
          { key: 'userId', value: 'json.user.id' }
        ],
        checks: [
          { name: 'login successful', condition: 'r.status === 200' },
          { name: 'token exists', condition: "r.json('token') !== undefined" }
        ]
      },
      {
        name: 'Browse Products',
        method: 'GET',
        url: '${baseUrl}/products?page=1&limit=20',
        headers: [{ key: 'Authorization', value: 'Bearer ${token}' }],
        body: '',
        thinkTime: '3s',
        extractVariables: [],
        checks: [{ name: 'products loaded', condition: 'r.status === 200' }]
      }
    ]
  }

  success.value = t('scenarioBuilder.messages.exampleLoaded')
  setTimeout(() => success.value = '', 3000)
}
</script>

<template>
  <div class="min-h-screen -m-6 p-6" :class="isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'">
    <!-- Header -->
    <div class="border-b pb-4 mb-6" :class="isDark ? 'border-slate-800' : 'border-slate-300'">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold font-mono">🎬 {{ t('scenarioBuilder.title') }}</h1>
          <p class="text-sm mt-1" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
            {{ t('scenarioBuilder.subtitle') }}
          </p>
        </div>

        <div class="flex items-center space-x-3">
          <button
            @click="showHelp = true"
            class="px-4 py-2 border text-sm font-mono hover:bg-slate-800 transition-colors"
            :class="isDark ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-700'"
          >
            ❓ {{ t('common.view') }}
          </button>
          <button
            @click="loadExample"
            class="px-4 py-2 border text-sm font-mono hover:bg-slate-800 transition-colors"
            :class="isDark ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-700'"
          >
            📝 {{ t('scenarioBuilder.buttons.loadExample') }}
          </button>
          <button
            @click="validateScenario"
            class="px-4 py-2 border text-sm font-mono hover:bg-blue-600 transition-colors"
            :class="isDark ? 'border-blue-700 text-blue-400' : 'border-blue-300 text-blue-600'"
          >
            ✓ {{ t('scenarioBuilder.buttons.validate') }}
          </button>
          <button
            @click="previewScenario"
            :disabled="isLoadingPreview"
            class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-mono transition-colors disabled:opacity-50"
          >
            {{ isLoadingPreview ? '⏳ ' + t('scenarioBuilder.buttons.loading') : '👁️ ' + t('scenarioBuilder.buttons.previewScript') }}
          </button>
          <button
            @click="showTestCreation = true"
            class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-mono transition-colors"
          >
            ✓ {{ t('scenarioBuilder.buttons.createTest') }}
          </button>
        </div>
      </div>

      <!-- Mode Toggle -->
      <div class="mt-4 flex space-x-2">
        <button
          @click="mode = 'gui'"
          class="px-4 py-2 text-sm font-mono transition-colors"
          :class="mode === 'gui'
            ? 'bg-indigo-600 text-white'
            : (isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-200 text-slate-600 hover:bg-slate-300')"
        >
          🖱️ {{ t('scenarioBuilder.mode.gui') }}
        </button>
        <button
          @click="mode = 'code'"
          class="px-4 py-2 text-sm font-mono transition-colors"
          :class="mode === 'code'
            ? 'bg-indigo-600 text-white'
            : (isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-200 text-slate-600 hover:bg-slate-300')"
        >
          💻 {{ t('scenarioBuilder.mode.code') }}
        </button>
      </div>
    </div>

    <!-- Error/Success Messages -->
    <div v-if="error" class="mb-4 p-4 border rounded" :class="isDark ? 'border-red-900 bg-red-900/20 text-red-400' : 'border-red-300 bg-red-50 text-red-700'">
      <div class="flex items-center justify-between">
        <span class="text-sm font-mono">❌ {{ error }}</span>
        <button @click="error = ''" class="text-red-400 hover:text-red-300">✕</button>
      </div>
    </div>

    <div v-if="success" class="mb-4 p-4 border rounded" :class="isDark ? 'border-emerald-900 bg-emerald-900/20 text-emerald-400' : 'border-emerald-300 bg-emerald-50 text-emerald-700'">
      <div class="flex items-center justify-between">
        <span class="text-sm font-mono whitespace-pre-line">✓ {{ success }}</span>
        <button @click="success = ''" class="text-emerald-400 hover:text-emerald-300">✕</button>
      </div>
    </div>

    <!-- GUI Mode -->
    <div v-if="mode === 'gui'" class="space-y-6">
      <!-- Scenario Info -->
      <div class="border rounded-lg p-6" :class="isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-300 bg-white'">
        <h2 class="text-lg font-mono font-semibold mb-4">📋 {{ t('scenarioBuilder.scenarioInfo.title') }}</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-mono mb-2" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
              {{ t('scenarioBuilder.scenarioInfo.name') }} *
            </label>
            <input
              v-model="scenarioName"
              type="text"
              :placeholder="t('scenarioBuilder.scenarioInfo.namePlaceholder')"
              class="w-full px-3 py-2 border rounded font-mono text-sm"
              :class="isDark
                ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500'
                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'"
            />
          </div>

          <div>
            <label class="block text-sm font-mono mb-2" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
              {{ t('scenarioBuilder.scenarioInfo.description') }}
            </label>
            <textarea
              v-model="scenarioDescription"
              rows="2"
              :placeholder="t('scenarioBuilder.scenarioInfo.descriptionPlaceholder')"
              class="w-full px-3 py-2 border rounded font-mono text-sm"
              :class="isDark
                ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500'
                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'"
            />
          </div>

          <div>
            <label class="block text-sm font-mono mb-2" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
              {{ t('scenarioBuilder.scenarioInfo.baseUrl') }} *
            </label>
            <input
              v-model="baseUrl"
              type="text"
              :placeholder="t('scenarioBuilder.scenarioInfo.baseUrlPlaceholder')"
              class="w-full px-3 py-2 border rounded font-mono text-sm"
              :class="isDark
                ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500'
                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'"
            />
          </div>

          <!-- Global Headers -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-mono" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
                {{ t('scenarioBuilder.scenarioInfo.globalHeaders') }}
              </label>
              <button
                @click="addGlobalHeader"
                class="text-xs font-mono px-2 py-1 rounded"
                :class="isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'"
              >
                + {{ t('scenarioBuilder.scenarioInfo.addHeader') }}
              </button>
            </div>
            <div v-for="(header, index) in globalHeaders" :key="index" class="flex space-x-2 mb-2">
              <input
                v-model="header.key"
                type="text"
                :placeholder="t('scenarioBuilder.scenarioInfo.headerName')"
                class="flex-1 px-3 py-2 border rounded font-mono text-sm"
                :class="isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300'"
              />
              <input
                v-model="header.value"
                type="text"
                :placeholder="t('scenarioBuilder.scenarioInfo.headerValue')"
                class="flex-1 px-3 py-2 border rounded font-mono text-sm"
                :class="isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300'"
              />
              <button
                @click="removeGlobalHeader(index)"
                class="px-3 py-2 text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Steps List -->
      <div v-if="steps.length > 0" class="border rounded-lg p-6" :class="isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-300 bg-white'">
        <h2 class="text-lg font-mono font-semibold mb-4">📝 {{ t('scenarioBuilder.steps.title') }} ({{ steps.length }})</h2>

        <div v-for="(step, index) in steps" :key="index" class="mb-3 p-4 border rounded" :class="isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3">
                <span class="text-xs font-mono px-2 py-1 rounded" :class="isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'">
                  {{ t('scenarioBuilder.steps.stepNumber') }} {{ index + 1 }}
                </span>
                <span class="text-sm font-mono font-semibold">{{ step.name }}</span>
                <span class="text-xs font-mono px-2 py-1 rounded" :class="{
                  'bg-blue-900/30 text-blue-400': step.method === 'GET',
                  'bg-green-900/30 text-green-400': step.method === 'POST',
                  'bg-yellow-900/30 text-yellow-400': step.method === 'PUT',
                  'bg-red-900/30 text-red-400': step.method === 'DELETE',
                  'bg-purple-900/30 text-purple-400': step.method === 'PATCH'
                }">
                  {{ step.method }}
                </span>
              </div>
              <p class="text-xs font-mono mt-1" :class="isDark ? 'text-slate-400' : 'text-slate-600'">{{ step.url }}</p>
            </div>
            <div class="flex space-x-2">
              <button @click="editStep(index)" class="text-xs font-mono px-2 py-1 rounded" :class="isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'">
                ✏️ {{ t('scenarioBuilder.steps.edit') }}
              </button>
              <button @click="removeStep(index)" class="text-xs font-mono px-2 py-1 text-red-400 hover:text-red-300">
                🗑️ {{ t('scenarioBuilder.steps.remove') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Current Step Editor -->
      <div class="border rounded-lg p-6" :class="isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-300 bg-white'">
        <h2 class="text-lg font-mono font-semibold mb-4">➕ {{ t('scenarioBuilder.stepEditor.title') }}</h2>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-mono mb-2" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
                {{ t('scenarioBuilder.stepEditor.name') }} *
              </label>
              <input
                v-model="currentStep.name"
                type="text"
                :placeholder="t('scenarioBuilder.stepEditor.namePlaceholder')"
                class="w-full px-3 py-2 border rounded font-mono text-sm"
                :class="isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300'"
              />
            </div>

            <div>
              <label class="block text-sm font-mono mb-2" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
                {{ t('scenarioBuilder.stepEditor.method') }} *
              </label>
              <select
                v-model="currentStep.method"
                class="w-full px-3 py-2 border rounded font-mono text-sm"
                :class="isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300'"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-mono mb-2" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
              {{ t('scenarioBuilder.stepEditor.url') }} * ({{ t('scenarioBuilder.stepEditor.urlHint') }})
            </label>
            <input
              v-model="currentStep.url"
              type="text"
              :placeholder="t('scenarioBuilder.stepEditor.urlPlaceholder')"
              class="w-full px-3 py-2 border rounded font-mono text-sm"
              :class="isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300'"
            />
          </div>

          <!-- Headers -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-mono" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
                {{ t('scenarioBuilder.stepEditor.headers') }}
              </label>
              <button
                @click="addHeader"
                class="text-xs font-mono px-2 py-1 rounded"
                :class="isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'"
              >
                + {{ t('scenarioBuilder.stepEditor.addButton') }}
              </button>
            </div>
            <div v-for="(header, index) in currentStep.headers" :key="index" class="flex space-x-2 mb-2">
              <input
                v-model="header.key"
                type="text"
                placeholder="Authorization"
                class="flex-1 px-3 py-2 border rounded font-mono text-sm"
                :class="isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300'"
              />
              <input
                v-model="header.value"
                type="text"
                placeholder="Bearer ${token}"
                class="flex-1 px-3 py-2 border rounded font-mono text-sm"
                :class="isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300'"
              />
              <button @click="removeHeader(index)" class="px-3 py-2 text-red-400 hover:text-red-300">✕</button>
            </div>
          </div>

          <!-- Body -->
          <div v-if="['POST', 'PUT', 'PATCH'].includes(currentStep.method)">
            <label class="block text-sm font-mono mb-2" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
              {{ t('scenarioBuilder.stepEditor.body') }}
            </label>
            <textarea
              v-model="currentStep.body"
              rows="4"
              :placeholder="t('scenarioBuilder.stepEditor.bodyPlaceholder')"
              class="w-full px-3 py-2 border rounded font-mono text-sm"
              :class="isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300'"
            />
          </div>

          <!-- Think Time -->
          <div>
            <label class="block text-sm font-mono mb-2" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
              {{ t('scenarioBuilder.stepEditor.thinkTime') }} ({{ t('scenarioBuilder.stepEditor.thinkTimeHint') }})
            </label>
            <input
              v-model="currentStep.thinkTime"
              type="text"
              :placeholder="t('scenarioBuilder.stepEditor.thinkTimePlaceholder')"
              class="w-full px-3 py-2 border rounded font-mono text-sm"
              :class="isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300'"
            />
          </div>

          <!-- Extract Variables -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-mono" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
                {{ t('scenarioBuilder.stepEditor.extractVariables') }}
              </label>
              <button
                @click="addExtractVariable"
                class="text-xs font-mono px-2 py-1 rounded"
                :class="isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'"
              >
                + {{ t('scenarioBuilder.stepEditor.addButton') }}
              </button>
            </div>
            <div v-for="(variable, index) in currentStep.extractVariables" :key="index" class="flex space-x-2 mb-2">
              <input
                v-model="variable.key"
                type="text"
                :placeholder="t('scenarioBuilder.stepEditor.variableName')"
                class="flex-1 px-3 py-2 border rounded font-mono text-sm"
                :class="isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300'"
              />
              <input
                v-model="variable.value"
                type="text"
                :placeholder="t('scenarioBuilder.stepEditor.variablePath')"
                class="flex-1 px-3 py-2 border rounded font-mono text-sm"
                :class="isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300'"
              />
              <button @click="removeExtractVariable(index)" class="px-3 py-2 text-red-400 hover:text-red-300">✕</button>
            </div>
          </div>

          <!-- Checks -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-mono" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
                {{ t('scenarioBuilder.stepEditor.checks') }}
              </label>
              <button
                @click="addCheck"
                class="text-xs font-mono px-2 py-1 rounded"
                :class="isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'"
              >
                + {{ t('scenarioBuilder.stepEditor.addButton') }}
              </button>
            </div>
            <div v-for="(check, index) in currentStep.checks" :key="index" class="flex space-x-2 mb-2">
              <input
                v-model="check.name"
                type="text"
                :placeholder="t('scenarioBuilder.stepEditor.checkName')"
                class="flex-1 px-3 py-2 border rounded font-mono text-sm"
                :class="isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300'"
              />
              <input
                v-model="check.condition"
                type="text"
                :placeholder="t('scenarioBuilder.stepEditor.checkCondition')"
                class="flex-1 px-3 py-2 border rounded font-mono text-sm"
                :class="isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300'"
              />
              <button @click="removeCheck(index)" class="px-3 py-2 text-red-400 hover:text-red-300">✕</button>
            </div>
          </div>

          <button
            @click="addStep"
            class="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-mono transition-colors"
          >
            ➕ {{ t('scenarioBuilder.stepEditor.addStepButton') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Code Mode -->
    <div v-if="mode === 'code'" class="space-y-6">
      <div class="border rounded-lg p-6" :class="isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-300 bg-white'">
        <h2 class="text-lg font-mono font-semibold mb-4">💻 {{ t('scenarioBuilder.codeMode.title') }}</h2>
        <textarea
          v-model="codeContent"
          rows="25"
          class="w-full px-4 py-3 border rounded font-mono text-sm"
          :class="isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'"
        />
      </div>
    </div>

    <!-- Preview Modal -->
    <div v-if="showPreview" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showPreview = false">
      <div class="max-w-4xl w-full max-h-[90vh] overflow-auto border rounded-lg" :class="isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'">
        <div class="sticky top-0 border-b p-4 flex items-center justify-between" :class="isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'">
          <h3 class="text-lg font-mono font-semibold">👁️ {{ t('scenarioBuilder.preview.title') }}</h3>
          <button @click="showPreview = false" class="text-slate-400 hover:text-slate-300">✕</button>
        </div>
        <div class="p-6">
          <pre class="text-xs font-mono overflow-x-auto p-4 rounded" :class="isDark ? 'bg-slate-950 text-slate-300' : 'bg-slate-50 text-slate-700'">{{ previewScript }}</pre>
        </div>
      </div>
    </div>

    <!-- Test Creation Modal -->
    <div v-if="showTestCreation" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showTestCreation = false">
      <div class="max-w-2xl w-full border rounded-lg" :class="isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'">
        <div class="border-b p-4 flex items-center justify-between" :class="isDark ? 'border-slate-700' : 'border-slate-300'">
          <h3 class="text-lg font-mono font-semibold">✓ {{ t('scenarioBuilder.testCreation.title') }}</h3>
          <button @click="showTestCreation = false" class="text-slate-400 hover:text-slate-300">✕</button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-mono mb-2" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
              {{ t('scenarioBuilder.testCreation.testName') }} *
            </label>
            <input
              v-model="testName"
              type="text"
              :placeholder="t('scenarioBuilder.testCreation.testNamePlaceholder')"
              class="w-full px-3 py-2 border rounded font-mono text-sm"
              :class="isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300'"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-mono mb-2" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
                {{ t('scenarioBuilder.testCreation.testType') }}
              </label>
              <select
                v-model="testType"
                class="w-full px-3 py-2 border rounded font-mono text-sm"
                :class="isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300'"
              >
                <option value="LOAD">{{ t('testCreate.types.LOAD') }}</option>
                <option value="STRESS">{{ t('testCreate.types.STRESS') }}</option>
                <option value="SPIKE">{{ t('testCreate.types.SPIKE') }}</option>
                <option value="SOAK">{{ t('testCreate.types.SOAK') }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-mono mb-2" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
                {{ t('scenarioBuilder.testCreation.vus') }}
              </label>
              <input
                v-model.number="testVus"
                type="number"
                min="1"
                max="10000"
                class="w-full px-3 py-2 border rounded font-mono text-sm"
                :class="isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300'"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-mono mb-2" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
              {{ t('scenarioBuilder.testCreation.duration') }} ({{ t('scenarioBuilder.testCreation.durationHint') }})
            </label>
            <input
              v-model="testDuration"
              type="text"
              :placeholder="t('scenarioBuilder.testCreation.durationPlaceholder')"
              class="w-full px-3 py-2 border rounded font-mono text-sm"
              :class="isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300'"
            />
          </div>

          <div class="flex space-x-3 pt-4">
            <button
              @click="showTestCreation = false"
              class="flex-1 px-4 py-3 border font-mono text-sm"
              :class="isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'"
            >
              {{ t('scenarioBuilder.testCreation.cancel') }}
            </button>
            <button
              @click="createTest"
              :disabled="isCreatingTest || !testName"
              class="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-sm transition-colors disabled:opacity-50"
            >
              {{ isCreatingTest ? '⏳ ' + t('scenarioBuilder.buttons.creating') : '✓ ' + t('scenarioBuilder.testCreation.create') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Help Modal -->
    <div v-if="showHelp" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showHelp = false">
      <div class="max-w-3xl w-full max-h-[90vh] overflow-auto border rounded-lg" :class="isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'">
        <div class="sticky top-0 border-b p-4 flex items-center justify-between" :class="isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'">
          <h3 class="text-lg font-mono font-semibold">❓ {{ t('scenarioBuilder.help.title') }}</h3>
          <button @click="showHelp = false" class="text-slate-400 hover:text-slate-300">✕</button>
        </div>
        <div class="p-6 space-y-6">
          <p class="text-sm" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
            {{ t('scenarioBuilder.help.intro') }}
          </p>

          <div>
            <h4 class="font-mono font-semibold mb-3" :class="isDark ? 'text-slate-200' : 'text-slate-800'">
              {{ t('scenarioBuilder.help.modes.title') }}
            </h4>
            <ul class="list-disc list-inside space-y-2 text-sm" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
              <li>{{ t('scenarioBuilder.help.modes.gui') }}</li>
              <li>{{ t('scenarioBuilder.help.modes.code') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="font-mono font-semibold mb-3" :class="isDark ? 'text-slate-200' : 'text-slate-800'">
              {{ t('scenarioBuilder.help.steps.title') }}
            </h4>
            <ul class="list-disc list-inside space-y-2 text-sm" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
              <li>{{ t('scenarioBuilder.help.steps.step1') }}</li>
              <li>{{ t('scenarioBuilder.help.steps.step2') }}</li>
              <li>{{ t('scenarioBuilder.help.steps.step3') }}</li>
              <li>{{ t('scenarioBuilder.help.steps.step4') }}</li>
              <li>{{ t('scenarioBuilder.help.steps.step5') }}</li>
              <li>{{ t('scenarioBuilder.help.steps.step6') }}</li>
              <li>{{ t('scenarioBuilder.help.steps.step7') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="font-mono font-semibold mb-3" :class="isDark ? 'text-slate-200' : 'text-slate-800'">
              {{ t('scenarioBuilder.help.features.title') }}
            </h4>
            <ul class="list-disc list-inside space-y-2 text-sm" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
              <li>{{ t('scenarioBuilder.help.features.variables') }}</li>
              <li>{{ t('scenarioBuilder.help.features.thinkTime') }}</li>
              <li>{{ t('scenarioBuilder.help.features.checks') }}</li>
              <li>{{ t('scenarioBuilder.help.features.headers') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="font-mono font-semibold mb-3" :class="isDark ? 'text-slate-200' : 'text-slate-800'">
              {{ t('scenarioBuilder.help.examples.title') }}
            </h4>
            <p class="text-sm" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
              {{ t('scenarioBuilder.help.examples.description') }}
            </p>
          </div>

          <button
            @click="showHelp = false"
            class="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-sm transition-colors"
          >
            {{ t('common.close') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
