<script setup lang="ts">
// @ts-nocheck
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDarkMode } from '../composables/useDarkMode'
import { apiClient } from '../api/client'

const router = useRouter()
const { t } = useI18n()
const { isDark } = useDarkMode()

interface DataFile {
  id: number
  name: string
  type: 'CSV' | 'JSON'
  size: number
  recordCount: number
  columns: string[]
  sampleData?: Array<Record<string, any>>
  uploadedAt: string
}

const dataFiles = ref<DataFile[]>([])
const selectedFile = ref<DataFile | null>(null)
const showPreview = ref(false)
const isLoading = ref(false)
const error = ref('')
const success = ref('')

// File upload
const fileInput = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)

onMounted(() => {
  loadDataFiles()
})

async function loadDataFiles() {
  isLoading.value = true
  error.value = ''

  try {
    const files = await apiClient.get<DataFile[]>('/data-files')
    dataFiles.value = files
  } catch (err: any) {
    error.value = err.message || 'Failed to load data files'
  } finally {
    isLoading.value = false
  }
}

function selectFile() {
  fileInput.value?.click()
}

async function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Validate file type
  if (!file.name.endsWith('.csv') && !file.name.endsWith('.json')) {
    error.value = 'Only CSV and JSON files are supported'
    return
  }

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    error.value = 'File size must be less than 10MB'
    return
  }

  isUploading.value = true
  error.value = ''

  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('http://localhost:8080/api/data-files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Upload failed')
    }

    const uploadedFile = await response.json()

    success.value = `File "${file.name}" uploaded successfully!`
    setTimeout(() => success.value = '', 3000)

    // Reload files
    await loadDataFiles()

    // Clear input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to upload file'
  } finally {
    isUploading.value = false
  }
}

async function deleteFile(id: number, name: string) {
  if (!confirm(`Are you sure you want to delete "${name}"?`)) {
    return
  }

  error.value = ''

  try {
    await apiClient.delete(`/data-files/${id}`)

    success.value = `File "${name}" deleted successfully`
    setTimeout(() => success.value = '', 3000)

    // Reload files
    await loadDataFiles()

    // Close preview if deleted file was selected
    if (selectedFile.value?.id === id) {
      selectedFile.value = null
      showPreview.value = false
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to delete file'
  }
}

function previewFile(file: DataFile) {
  selectedFile.value = file
  showPreview.value = true
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString()
}

// Test creation
const showTestCreationModal = ref(false)
const selectedFileForTest = ref<DataFile | null>(null)
const testForm = ref({
  name: '',
  url: 'https://api.example.com/endpoint',
  method: 'POST',
  testType: 'LOAD' as 'LOAD' | 'STRESS' | 'SPIKE' | 'SOAK',
  vus: 50,
  duration: '5m',
  headers: [] as Array<{ key: string; value: string }>,
  bodyTemplate: ''
})
const isCreatingTest = ref(false)
const previewScriptContent = ref('')
const showScriptPreview = ref(false)

function createTestWithData(file: DataFile) {
  selectedFileForTest.value = file
  showTestCreationModal.value = true

  // Set default body template based on file columns
  if (file.columns.length > 0) {
    const template: Record<string, string> = {}
    file.columns.forEach(col => {
      template[col] = `\${data.${col}}`
    })
    testForm.value.bodyTemplate = JSON.stringify(template, null, 2)
  }
}

function addTestHeader() {
  testForm.value.headers.push({ key: '', value: '' })
}

function removeTestHeader(index: number) {
  testForm.value.headers.splice(index, 1)
}

async function previewScript() {
  if (!selectedFileForTest.value) return

  error.value = ''

  try {
    const request = {
      name: testForm.value.name || 'Test',
      url: testForm.value.url,
      method: testForm.value.method,
      testType: testForm.value.testType,
      vus: testForm.value.vus,
      duration: testForm.value.duration,
      dataFileId: selectedFileForTest.value.id,
      headers: testForm.value.headers.filter(h => h.key && h.value).reduce((acc, h) => {
        acc[h.key] = h.value
        return acc
      }, {} as Record<string, string>),
      bodyTemplate: testForm.value.bodyTemplate || undefined
    }

    const response = await apiClient.post('/data-files/preview', request)
    previewScriptContent.value = response.script
    showScriptPreview.value = true
  } catch (err: any) {
    error.value = err.message || 'Failed to preview script'
  }
}

async function submitTestCreation() {
  if (!selectedFileForTest.value) return

  error.value = ''

  if (!testForm.value.name || !testForm.value.url) {
    error.value = 'Test name and URL are required'
    return
  }

  isCreatingTest.value = true

  try {
    const headers: Record<string, string> = {}
    testForm.value.headers.forEach(h => {
      if (h.key && h.value) headers[h.key] = h.value
    })

    const request = {
      name: testForm.value.name,
      url: testForm.value.url,
      method: testForm.value.method,
      testType: testForm.value.testType,
      vus: testForm.value.vus,
      duration: testForm.value.duration,
      dataFileId: selectedFileForTest.value.id,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
      bodyTemplate: testForm.value.bodyTemplate || undefined
    }

    await apiClient.post('/data-files/create-test', request)

    success.value = 'Test created successfully!'
    showTestCreationModal.value = false

    setTimeout(() => {
      router.push({ name: 'tests' })
    }, 1500)
  } catch (err: any) {
    error.value = err.message || 'Failed to create test'
  } finally {
    isCreatingTest.value = false
  }
}

function downloadSampleCSV() {
  const csvContent = `username,email,password
user1,user1@example.com,pass123
user2,user2@example.com,pass456
user3,user3@example.com,pass789`

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'sample_users.csv'
  a.click()
  URL.revokeObjectURL(url)

  success.value = 'Sample CSV downloaded'
  setTimeout(() => success.value = '', 3000)
}

function downloadSampleJSON() {
  const jsonContent = JSON.stringify([
    { username: 'user1', email: 'user1@example.com', password: 'pass123' },
    { username: 'user2', email: 'user2@example.com', password: 'pass456' },
    { username: 'user3', email: 'user3@example.com', password: 'pass789' }
  ], null, 2)

  const blob = new Blob([jsonContent], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'sample_users.json'
  a.click()
  URL.revokeObjectURL(url)

  success.value = 'Sample JSON downloaded'
  setTimeout(() => success.value = '', 3000)
}
</script>

<template>
  <div class="min-h-screen -m-6 p-6" :class="isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'">
    <!-- Header -->
    <div class="border-b pb-4 mb-6" :class="isDark ? 'border-slate-800' : 'border-slate-300'">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold font-mono">📊 Data Parameterization</h1>
          <p class="text-sm mt-1" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
            Upload CSV/JSON files for data-driven testing
          </p>
        </div>

        <div class="flex items-center space-x-3">
          <div class="relative">
            <button
              class="px-4 py-2 border text-sm font-mono hover:bg-slate-800 transition-colors"
              :class="isDark ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-700'"
              @click="downloadSampleCSV"
            >
              📄 Sample CSV
            </button>
          </div>
          <div class="relative">
            <button
              class="px-4 py-2 border text-sm font-mono hover:bg-slate-800 transition-colors"
              :class="isDark ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-700'"
              @click="downloadSampleJSON"
            >
              📄 Sample JSON
            </button>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept=".csv,.json"
            @change="handleFileUpload"
            class="hidden"
          />
          <button
            @click="selectFile"
            :disabled="isUploading"
            class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-mono transition-colors disabled:opacity-50"
          >
            {{ isUploading ? '⏳ Uploading...' : '📤 Upload File' }}
          </button>
        </div>
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
        <span class="text-sm font-mono">✓ {{ success }}</span>
        <button @click="success = ''" class="text-emerald-400 hover:text-emerald-300">✕</button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2" :class="isDark ? 'border-slate-300' : 'border-slate-900'"></div>
      <p class="mt-4 text-sm font-mono" :class="isDark ? 'text-slate-400' : 'text-slate-600'">Loading data files...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="dataFiles.length === 0" class="text-center py-12">
      <div class="text-6xl mb-4">📂</div>
      <h3 class="text-lg font-mono font-semibold mb-2">No data files uploaded</h3>
      <p class="text-sm mb-6" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
        Upload CSV or JSON files to use in data-driven tests
      </p>
      <button
        @click="selectFile"
        class="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-mono transition-colors"
      >
        📤 Upload Your First File
      </button>
    </div>

    <!-- Data Files Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="file in dataFiles"
        :key="file.id"
        class="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
        :class="isDark ? 'border-slate-800 bg-slate-900/50 hover:border-slate-700' : 'border-slate-300 bg-white hover:border-slate-400'"
        @click="previewFile(file)"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center space-x-3">
            <span class="text-3xl">{{ file.type === 'CSV' ? '📊' : '📋' }}</span>
            <div>
              <h3 class="font-mono font-semibold text-sm">{{ file.name }}</h3>
              <span class="text-xs font-mono px-2 py-1 rounded mt-1 inline-block" :class="
                file.type === 'CSV'
                  ? (isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700')
                  : (isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700')
              ">
                {{ file.type }}
              </span>
            </div>
          </div>
        </div>

        <div class="space-y-2 mb-4">
          <div class="flex items-center justify-between text-xs font-mono" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
            <span>Records:</span>
            <span class="font-semibold">{{ file.recordCount.toLocaleString() }}</span>
          </div>
          <div class="flex items-center justify-between text-xs font-mono" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
            <span>Size:</span>
            <span class="font-semibold">{{ formatFileSize(file.size) }}</span>
          </div>
          <div class="flex items-center justify-between text-xs font-mono" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
            <span>Columns:</span>
            <span class="font-semibold">{{ file.columns.length }}</span>
          </div>
          <div class="text-xs font-mono pt-1" :class="isDark ? 'text-slate-500' : 'text-slate-500'">
            {{ formatDate(file.uploadedAt) }}
          </div>
        </div>

        <div class="flex space-x-2" @click.stop>
          <button
            @click="createTestWithData(file)"
            class="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono transition-colors"
          >
            ✓ Create Test
          </button>
          <button
            @click="deleteFile(file.id, file.name)"
            class="px-3 py-2 border text-xs font-mono hover:bg-red-600 hover:text-white transition-colors"
            :class="isDark ? 'border-slate-700 text-red-400' : 'border-slate-300 text-red-600'"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <div v-if="showPreview && selectedFile" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showPreview = false">
      <div class="max-w-4xl w-full max-h-[90vh] overflow-auto border rounded-lg" :class="isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'">
        <div class="sticky top-0 border-b p-4 flex items-center justify-between" :class="isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'">
          <div>
            <h3 class="text-lg font-mono font-semibold">{{ selectedFile.name }}</h3>
            <p class="text-xs font-mono mt-1" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
              {{ selectedFile.recordCount.toLocaleString() }} records • {{ selectedFile.columns.length }} columns
            </p>
          </div>
          <button @click="showPreview = false" class="text-slate-400 hover:text-slate-300">✕</button>
        </div>

        <div class="p-6">
          <!-- Columns -->
          <div class="mb-6">
            <h4 class="text-sm font-mono font-semibold mb-3" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
              📋 Columns
            </h4>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="column in selectedFile.columns"
                :key="column"
                class="px-3 py-1 text-xs font-mono rounded"
                :class="isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'"
              >
                {{ column }}
              </span>
            </div>
          </div>

          <!-- Sample Data -->
          <div v-if="selectedFile.sampleData && selectedFile.sampleData.length > 0">
            <h4 class="text-sm font-mono font-semibold mb-3" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
              📊 Sample Data (first 5 rows)
            </h4>
            <div class="overflow-x-auto">
              <table class="w-full text-xs font-mono">
                <thead>
                  <tr class="border-b" :class="isDark ? 'border-slate-700' : 'border-slate-300'">
                    <th
                      v-for="column in selectedFile.columns"
                      :key="column"
                      class="text-left px-3 py-2 font-semibold"
                      :class="isDark ? 'text-slate-300' : 'text-slate-700'"
                    >
                      {{ column }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, index) in selectedFile.sampleData"
                    :key="index"
                    class="border-b"
                    :class="isDark ? 'border-slate-800' : 'border-slate-200'"
                  >
                    <td
                      v-for="column in selectedFile.columns"
                      :key="column"
                      class="px-3 py-2"
                      :class="isDark ? 'text-slate-400' : 'text-slate-600'"
                    >
                      {{ row[column] }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex space-x-3 mt-6 pt-6 border-t" :class="isDark ? 'border-slate-700' : 'border-slate-300'">
            <button
              @click="createTestWithData(selectedFile)"
              class="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-sm transition-colors"
            >
              ✓ Create Test with This Data
            </button>
            <button
              @click="deleteFile(selectedFile.id, selectedFile.name)"
              class="px-4 py-3 border font-mono text-sm hover:bg-red-600 hover:text-white transition-colors"
              :class="isDark ? 'border-slate-700 text-red-400' : 'border-slate-300 text-red-600'"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Test Creation Modal -->
    <div v-if="showTestCreationModal && selectedFileForTest" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" @click.self="showTestCreationModal = false">
      <div class="max-w-3xl w-full my-8 border rounded-lg" :class="isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'">
        <div class="border-b p-4 flex items-center justify-between" :class="isDark ? 'border-slate-700' : 'border-slate-300'">
          <div>
            <h3 class="text-lg font-mono font-semibold">✓ Create Test with Data Parameterization</h3>
            <p class="text-xs font-mono mt-1" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
              Using: {{ selectedFileForTest.name }} ({{ selectedFileForTest.recordCount }} records)
            </p>
          </div>
          <button @click="showTestCreationModal = false" class="text-slate-400 hover:text-slate-300">✕</button>
        </div>

        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-mono mb-2" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
              Test Name *
            </label>
            <input
              v-model="testForm.name"
              type="text"
              placeholder="E.g., API Load Test with User Data"
              class="w-full px-3 py-2 border rounded font-mono text-sm"
              :class="isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300'"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-mono mb-2" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
                Target URL *
              </label>
              <input
                v-model="testForm.url"
                type="text"
                placeholder="https://api.example.com/endpoint"
                class="w-full px-3 py-2 border rounded font-mono text-sm"
                :class="isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300'"
              />
            </div>

            <div>
              <label class="block text-sm font-mono mb-2" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
                HTTP Method
              </label>
              <select
                v-model="testForm.method"
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

          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-mono mb-2" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
                Test Type
              </label>
              <select
                v-model="testForm.testType"
                class="w-full px-3 py-2 border rounded font-mono text-sm"
                :class="isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300'"
              >
                <option value="LOAD">Load Test</option>
                <option value="STRESS">Stress Test</option>
                <option value="SPIKE">Spike Test</option>
                <option value="SOAK">Soak Test</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-mono mb-2" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
                Virtual Users
              </label>
              <input
                v-model.number="testForm.vus"
                type="number"
                min="1"
                max="10000"
                class="w-full px-3 py-2 border rounded font-mono text-sm"
                :class="isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300'"
              />
            </div>

            <div>
              <label class="block text-sm font-mono mb-2" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
                Duration
              </label>
              <input
                v-model="testForm.duration"
                type="text"
                placeholder="5m"
                class="w-full px-3 py-2 border rounded font-mono text-sm"
                :class="isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300'"
              />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-mono" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
                Headers (optional)
              </label>
              <button
                @click="addTestHeader"
                class="text-xs font-mono px-2 py-1 rounded"
                :class="isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'"
              >
                + Add
              </button>
            </div>
            <div v-for="(header, index) in testForm.headers" :key="index" class="flex space-x-2 mb-2">
              <input
                v-model="header.key"
                type="text"
                placeholder="Content-Type"
                class="flex-1 px-3 py-2 border rounded font-mono text-sm"
                :class="isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300'"
              />
              <input
                v-model="header.value"
                type="text"
                placeholder="application/json"
                class="flex-1 px-3 py-2 border rounded font-mono text-sm"
                :class="isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300'"
              />
              <button @click="removeTestHeader(index)" class="px-3 py-2 text-red-400 hover:text-red-300">✕</button>
            </div>
          </div>

          <div v-if="['POST', 'PUT', 'PATCH'].includes(testForm.method)">
            <label class="block text-sm font-mono mb-2" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
              Request Body Template (use ${data.columnName} for data fields)
            </label>
            <textarea
              v-model="testForm.bodyTemplate"
              rows="8"
              placeholder='{"username": "${data.username}", "email": "${data.email}"}'
              class="w-full px-3 py-2 border rounded font-mono text-sm"
              :class="isDark ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300'"
            />
          </div>

          <div class="flex space-x-3 pt-4">
            <button
              @click="showTestCreationModal = false"
              class="px-4 py-3 border font-mono text-sm"
              :class="isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'"
            >
              Cancel
            </button>
            <button
              @click="previewScript"
              class="px-4 py-3 border font-mono text-sm"
              :class="isDark ? 'border-purple-700 text-purple-400 hover:bg-purple-900/30' : 'border-purple-300 text-purple-600 hover:bg-purple-50'"
            >
              👁️ Preview Script
            </button>
            <button
              @click="submitTestCreation"
              :disabled="isCreatingTest || !testForm.name || !testForm.url"
              class="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-sm transition-colors disabled:opacity-50"
            >
              {{ isCreatingTest ? '⏳ Creating...' : '✓ Create Test' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Script Preview Modal -->
    <div v-if="showScriptPreview" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" @click.self="showScriptPreview = false">
      <div class="max-w-4xl w-full max-h-[90vh] overflow-auto border rounded-lg" :class="isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'">
        <div class="sticky top-0 border-b p-4 flex items-center justify-between" :class="isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'">
          <h3 class="text-lg font-mono font-semibold">👁️ Generated k6 Script with Data Parameterization</h3>
          <button @click="showScriptPreview = false" class="text-slate-400 hover:text-slate-300">✕</button>
        </div>
        <div class="p-6">
          <pre class="text-xs font-mono overflow-x-auto p-4 rounded" :class="isDark ? 'bg-slate-950 text-slate-300' : 'bg-slate-50 text-slate-700'">{{ previewScriptContent }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>
