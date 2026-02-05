<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiClient } from '../api/client'

const { t } = useI18n()

// Types
interface Agent {
  id: number
  name: string
  host: string
  port: number
  description: string | null
  status: 'ONLINE' | 'OFFLINE' | 'BUSY' | 'MAINTENANCE' | 'ERROR'
  maxVUs: number
  currentVUs: number
  cpuCores: number | null
  memoryGb: number | null
  k6Version: string | null
  osInfo: string | null
  lastHeartbeat: string | null
  cpuUsage: number | null
  memoryUsage: number | null
  tags: string[] | null
  region: string | null
  zone: string | null
  apiKey: string | null
  enabled: boolean
  createdAt: string
  updatedAt: string
}

interface AgentStats {
  total: number
  online: number
  busy: number
  offline: number
  totalCapacity: number
  currentLoad: number
  utilizationPercent: number
}

interface Test {
  id: number
  name: string
}

interface DistributedTest {
  id: number
  testId: number
  testName: string
  totalVUs: number
  duration: string
  status: string
  distributionStrategy: string
  targetRegions: string[] | null
  targetTags: string[] | null
  startedAt: string | null
  completedAt: string | null
  createdAt: string
}

// State
const activeTab = ref<'agents' | 'tests'>('agents')
const agents = ref<Agent[]>([])
const agentStats = ref<AgentStats | null>(null)
const tests = ref<Test[]>([])
const distributedTests = ref<DistributedTest[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

// Agent Modal
const showAgentModal = ref(false)
const editingAgent = ref<Agent | null>(null)
const agentForm = ref({
  name: '',
  host: '',
  port: 6565,
  description: '',
  maxVUs: 1000,
  region: '',
  zone: '',
  tags: '',
  enabled: true
})

// Distributed Test Modal
const showTestModal = ref(false)
const testForm = ref({
  testId: 0,
  totalVUs: 100,
  duration: '5m',
  distributionStrategy: 'EQUAL' as 'EQUAL' | 'WEIGHTED' | 'GEOGRAPHIC' | 'CUSTOM',
  targetRegions: '',
  targetTags: ''
})

// Fetch functions
async function fetchAgents() {
  isLoading.value = true
  try {
    agents.value = await apiClient.get<Agent[]>('/agents')
  } catch (err: any) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}

async function fetchAgentStats() {
  try {
    agentStats.value = await apiClient.get<AgentStats>('/agents/stats')
  } catch (err: any) {
    console.error('Failed to fetch agent stats:', err)
  }
}

async function fetchTests() {
  try {
    tests.value = await apiClient.get<Test[]>('/tests')
  } catch (err: any) {
    console.error('Failed to fetch tests:', err)
  }
}

async function fetchDistributedTests() {
  isLoading.value = true
  try {
    const response = await apiClient.get<{ content: DistributedTest[] }>('/distributed-tests')
    distributedTests.value = response.content || []
  } catch (err: any) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}

// Agent CRUD
async function saveAgent() {
  try {
    const payload = {
      name: agentForm.value.name,
      host: agentForm.value.host,
      port: agentForm.value.port,
      description: agentForm.value.description || null,
      maxVUs: agentForm.value.maxVUs,
      region: agentForm.value.region || null,
      zone: agentForm.value.zone || null,
      tags: agentForm.value.tags ? agentForm.value.tags.split(',').map(t => t.trim()) : null,
      enabled: agentForm.value.enabled
    }

    if (editingAgent.value) {
      await apiClient.put(`/agents/${editingAgent.value.id}`, payload)
    } else {
      await apiClient.post('/agents', payload)
    }

    showAgentModal.value = false
    resetAgentForm()
    await fetchAgents()
    await fetchAgentStats()
  } catch (err: any) {
    error.value = err.message
  }
}

async function deleteAgent(id: number) {
  if (!confirm('Are you sure you want to delete this agent?')) return

  try {
    await apiClient.delete(`/agents/${id}`)
    await fetchAgents()
    await fetchAgentStats()
  } catch (err: any) {
    error.value = err.message
  }
}

async function toggleAgent(id: number) {
  try {
    await apiClient.post(`/agents/${id}/toggle`, {})
    await fetchAgents()
  } catch (err: any) {
    error.value = err.message
  }
}

function editAgent(agent: Agent) {
  editingAgent.value = agent
  agentForm.value = {
    name: agent.name,
    host: agent.host,
    port: agent.port,
    description: agent.description || '',
    maxVUs: agent.maxVUs,
    region: agent.region || '',
    zone: agent.zone || '',
    tags: agent.tags?.join(', ') || '',
    enabled: agent.enabled
  }
  showAgentModal.value = true
}

function resetAgentForm() {
  editingAgent.value = null
  agentForm.value = {
    name: '',
    host: '',
    port: 6565,
    description: '',
    maxVUs: 1000,
    region: '',
    zone: '',
    tags: '',
    enabled: true
  }
}

// Distributed Test CRUD
async function createDistributedTest() {
  try {
    const payload = {
      testId: testForm.value.testId,
      totalVUs: testForm.value.totalVUs,
      duration: testForm.value.duration,
      distributionStrategy: testForm.value.distributionStrategy,
      targetRegions: testForm.value.targetRegions ? testForm.value.targetRegions.split(',').map(r => r.trim()) : null,
      targetTags: testForm.value.targetTags ? testForm.value.targetTags.split(',').map(t => t.trim()) : null
    }

    await apiClient.post('/distributed-tests', payload)
    showTestModal.value = false
    resetTestForm()
    await fetchDistributedTests()
  } catch (err: any) {
    error.value = err.message
  }
}

async function startDistributedTest(id: number) {
  try {
    await apiClient.post(`/distributed-tests/${id}/start`, {})
    await fetchDistributedTests()
  } catch (err: any) {
    error.value = err.message
  }
}

async function cancelDistributedTest(id: number) {
  if (!confirm('Are you sure you want to cancel this test?')) return

  try {
    await apiClient.post(`/distributed-tests/${id}/cancel`, {})
    await fetchDistributedTests()
  } catch (err: any) {
    error.value = err.message
  }
}

async function deleteDistributedTest(id: number) {
  if (!confirm('Are you sure you want to delete this test?')) return

  try {
    await apiClient.delete(`/distributed-tests/${id}`)
    await fetchDistributedTests()
  } catch (err: any) {
    error.value = err.message
  }
}

function resetTestForm() {
  testForm.value = {
    testId: 0,
    totalVUs: 100,
    duration: '5m',
    distributionStrategy: 'EQUAL',
    targetRegions: '',
    targetTags: ''
  }
}

// Helpers
function getStatusColor(status: string): string {
  switch (status) {
    case 'ONLINE': return 'bg-accent-success/10 text-accent-success border-accent-success/20'
    case 'BUSY': return 'bg-accent-warning/10 text-accent-warning border-accent-warning/20'
    case 'OFFLINE': return 'bg-slate-100 dark:bg-dark-bg-tertiary text-slate-500 border-slate-300'
    case 'ERROR': return 'bg-accent-error/10 text-accent-error border-accent-error/20'
    case 'COMPLETED': return 'bg-accent-success/10 text-accent-success border-accent-success/20'
    case 'RUNNING': return 'bg-accent-primary/10 text-accent-primary border-accent-primary/20'
    case 'FAILED': return 'bg-accent-error/10 text-accent-error border-accent-error/20'
    case 'PENDING': return 'bg-slate-100 dark:bg-dark-bg-tertiary text-slate-500 border-slate-300'
    default: return 'bg-slate-100 dark:bg-dark-bg-tertiary text-slate-500 border-slate-300'
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('ko-KR')
}

onMounted(() => {
  fetchAgents()
  fetchAgentStats()
  fetchTests()
  fetchDistributedTests()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          분산 부하 테스트
        </h1>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-400 font-mono">
          여러 에이전트에서 동시에 부하 테스트 실행
        </p>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="bg-accent-error/10 border border-accent-error/20 text-accent-error px-4 py-3 text-sm">
      {{ error }}
      <button @click="error = null" class="ml-2 underline">Dismiss</button>
    </div>

    <!-- Stats Cards -->
    <div v-if="agentStats" class="grid grid-cols-4 gap-4">
      <div class="bg-white dark:bg-dark-bg-secondary border border-slate-300 dark:border-dark-border-primary p-4">
        <div class="text-xs font-mono uppercase text-slate-500 dark:text-slate-400">총 에이전트</div>
        <div class="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{{ agentStats.total }}</div>
      </div>
      <div class="bg-white dark:bg-dark-bg-secondary border border-slate-300 dark:border-dark-border-primary p-4">
        <div class="text-xs font-mono uppercase text-slate-500 dark:text-slate-400">온라인</div>
        <div class="mt-1 text-2xl font-bold text-accent-success">{{ agentStats.online }}</div>
      </div>
      <div class="bg-white dark:bg-dark-bg-secondary border border-slate-300 dark:border-dark-border-primary p-4">
        <div class="text-xs font-mono uppercase text-slate-500 dark:text-slate-400">총 용량</div>
        <div class="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{{ agentStats.totalCapacity.toLocaleString() }} VUs</div>
      </div>
      <div class="bg-white dark:bg-dark-bg-secondary border border-slate-300 dark:border-dark-border-primary p-4">
        <div class="text-xs font-mono uppercase text-slate-500 dark:text-slate-400">활용률</div>
        <div class="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{{ agentStats.utilizationPercent.toFixed(1) }}%</div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-slate-300 dark:border-dark-border-primary">
      <nav class="flex space-x-8">
        <button
          @click="activeTab = 'agents'"
          :class="activeTab === 'agents' ? 'border-accent-primary text-accent-primary' : 'border-transparent text-slate-500 hover:text-slate-700'"
          class="py-2 px-1 border-b-2 font-medium text-sm"
        >
          에이전트 관리
        </button>
        <button
          @click="activeTab = 'tests'"
          :class="activeTab === 'tests' ? 'border-accent-primary text-accent-primary' : 'border-transparent text-slate-500 hover:text-slate-700'"
          class="py-2 px-1 border-b-2 font-medium text-sm"
        >
          분산 테스트
        </button>
      </nav>
    </div>

    <!-- Agents Tab -->
    <div v-if="activeTab === 'agents'">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">등록된 에이전트</h2>
        <button
          @click="showAgentModal = true; resetAgentForm()"
          class="px-4 py-2 bg-accent-primary text-white text-xs font-mono uppercase hover:bg-accent-primary/90"
        >
          에이전트 추가
        </button>
      </div>

      <div v-if="isLoading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-accent-primary border-t-transparent"></div>
      </div>

      <div v-else-if="agents.length === 0" class="bg-white dark:bg-dark-bg-secondary border border-slate-300 dark:border-dark-border-primary p-8 text-center">
        <p class="text-slate-500 dark:text-slate-400">등록된 에이전트가 없습니다.</p>
      </div>

      <div v-else class="bg-white dark:bg-dark-bg-secondary border border-slate-300 dark:border-dark-border-primary divide-y divide-slate-200 dark:divide-dark-border-primary">
        <div v-for="agent in agents" :key="agent.id" class="p-4 hover:bg-slate-50 dark:hover:bg-dark-bg-tertiary">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3">
                <h3 class="font-medium text-slate-900 dark:text-slate-100">{{ agent.name }}</h3>
                <span :class="getStatusColor(agent.status)" class="px-2 py-0.5 text-xs font-mono uppercase border">{{ agent.status }}</span>
                <span v-if="!agent.enabled" class="px-2 py-0.5 text-xs font-mono uppercase bg-slate-100 text-slate-500 border border-slate-300">DISABLED</span>
              </div>
              <div class="mt-1 flex items-center space-x-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                <span>🖥️ {{ agent.host }}:{{ agent.port }}</span>
                <span v-if="agent.region">📍 {{ agent.region }}</span>
                <span>💪 {{ agent.currentVUs }} / {{ agent.maxVUs }} VUs</span>
                <span v-if="agent.k6Version">k6 {{ agent.k6Version }}</span>
              </div>
              <div v-if="agent.cpuUsage || agent.memoryUsage" class="mt-1 flex items-center space-x-4 text-xs font-mono text-slate-500">
                <span v-if="agent.cpuUsage">CPU: {{ agent.cpuUsage.toFixed(1) }}%</span>
                <span v-if="agent.memoryUsage">Memory: {{ agent.memoryUsage.toFixed(1) }}%</span>
                <span v-if="agent.lastHeartbeat">Last heartbeat: {{ formatDate(agent.lastHeartbeat) }}</span>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button @click="toggleAgent(agent.id)" class="p-2 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary" :title="agent.enabled ? 'Disable' : 'Enable'">
                <svg v-if="agent.enabled" class="w-4 h-4 text-accent-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <svg v-else class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <button @click="editAgent(agent)" class="p-2 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary text-slate-600">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button @click="deleteAgent(agent.id)" class="p-2 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary text-accent-error">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Distributed Tests Tab -->
    <div v-if="activeTab === 'tests'">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">분산 테스트 목록</h2>
        <button
          @click="showTestModal = true; resetTestForm()"
          class="px-4 py-2 bg-accent-primary text-white text-xs font-mono uppercase hover:bg-accent-primary/90"
        >
          새 분산 테스트
        </button>
      </div>

      <div v-if="distributedTests.length === 0" class="bg-white dark:bg-dark-bg-secondary border border-slate-300 dark:border-dark-border-primary p-8 text-center">
        <p class="text-slate-500 dark:text-slate-400">분산 테스트가 없습니다.</p>
      </div>

      <div v-else class="bg-white dark:bg-dark-bg-secondary border border-slate-300 dark:border-dark-border-primary divide-y divide-slate-200 dark:divide-dark-border-primary">
        <div v-for="test in distributedTests" :key="test.id" class="p-4 hover:bg-slate-50 dark:hover:bg-dark-bg-tertiary">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3">
                <h3 class="font-medium text-slate-900 dark:text-slate-100">{{ test.testName }}</h3>
                <span :class="getStatusColor(test.status)" class="px-2 py-0.5 text-xs font-mono uppercase border">{{ test.status }}</span>
              </div>
              <div class="mt-1 flex items-center space-x-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                <span>👥 {{ test.totalVUs }} VUs</span>
                <span>⏱️ {{ test.duration }}</span>
                <span>📊 {{ test.distributionStrategy }}</span>
                <span v-if="test.startedAt">Started: {{ formatDate(test.startedAt) }}</span>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button
                v-if="test.status === 'PENDING'"
                @click="startDistributedTest(test.id)"
                class="px-3 py-1 bg-accent-success text-white text-xs font-mono uppercase hover:bg-accent-success/90"
              >
                시작
              </button>
              <button
                v-if="test.status === 'RUNNING' || test.status === 'DISTRIBUTING'"
                @click="cancelDistributedTest(test.id)"
                class="px-3 py-1 bg-accent-error text-white text-xs font-mono uppercase hover:bg-accent-error/90"
              >
                취소
              </button>
              <button
                v-if="test.status !== 'RUNNING' && test.status !== 'DISTRIBUTING'"
                @click="deleteDistributedTest(test.id)"
                class="p-2 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary text-accent-error"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Agent Modal -->
    <div v-if="showAgentModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-dark-bg-secondary border border-slate-300 dark:border-dark-border-primary w-full max-w-md mx-4">
        <div class="px-6 py-4 border-b border-slate-300 dark:border-dark-border-primary">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {{ editingAgent ? '에이전트 수정' : '새 에이전트' }}
          </h2>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-mono uppercase text-slate-600 dark:text-slate-400 mb-1">이름 *</label>
            <input v-model="agentForm.name" type="text" class="w-full px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-slate-300 dark:border-dark-border-primary text-slate-900 dark:text-slate-100 text-sm" placeholder="Agent 1" />
          </div>
          <div class="grid grid-cols-3 gap-3">
            <div class="col-span-2">
              <label class="block text-xs font-mono uppercase text-slate-600 dark:text-slate-400 mb-1">Host *</label>
              <input v-model="agentForm.host" type="text" class="w-full px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-slate-300 dark:border-dark-border-primary text-slate-900 dark:text-slate-100 text-sm" placeholder="192.168.1.100" />
            </div>
            <div>
              <label class="block text-xs font-mono uppercase text-slate-600 dark:text-slate-400 mb-1">Port</label>
              <input v-model.number="agentForm.port" type="number" class="w-full px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-slate-300 dark:border-dark-border-primary text-slate-900 dark:text-slate-100 text-sm" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-mono uppercase text-slate-600 dark:text-slate-400 mb-1">Max VUs</label>
            <input v-model.number="agentForm.maxVUs" type="number" class="w-full px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-slate-300 dark:border-dark-border-primary text-slate-900 dark:text-slate-100 text-sm" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-mono uppercase text-slate-600 dark:text-slate-400 mb-1">Region</label>
              <input v-model="agentForm.region" type="text" class="w-full px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-slate-300 dark:border-dark-border-primary text-slate-900 dark:text-slate-100 text-sm" placeholder="ap-northeast-2" />
            </div>
            <div>
              <label class="block text-xs font-mono uppercase text-slate-600 dark:text-slate-400 mb-1">Zone</label>
              <input v-model="agentForm.zone" type="text" class="w-full px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-slate-300 dark:border-dark-border-primary text-slate-900 dark:text-slate-100 text-sm" placeholder="a" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-mono uppercase text-slate-600 dark:text-slate-400 mb-1">Tags (comma separated)</label>
            <input v-model="agentForm.tags" type="text" class="w-full px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-slate-300 dark:border-dark-border-primary text-slate-900 dark:text-slate-100 text-sm" placeholder="production, high-cpu" />
          </div>
          <div>
            <label class="block text-xs font-mono uppercase text-slate-600 dark:text-slate-400 mb-1">Description</label>
            <textarea v-model="agentForm.description" rows="2" class="w-full px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-slate-300 dark:border-dark-border-primary text-slate-900 dark:text-slate-100 text-sm"></textarea>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-slate-300 dark:border-dark-border-primary flex justify-end space-x-3">
          <button @click="showAgentModal = false" class="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">취소</button>
          <button @click="saveAgent" class="px-4 py-2 bg-accent-primary text-white text-sm hover:bg-accent-primary/90">저장</button>
        </div>
      </div>
    </div>

    <!-- Distributed Test Modal -->
    <div v-if="showTestModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-dark-bg-secondary border border-slate-300 dark:border-dark-border-primary w-full max-w-md mx-4">
        <div class="px-6 py-4 border-b border-slate-300 dark:border-dark-border-primary">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">새 분산 테스트</h2>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-mono uppercase text-slate-600 dark:text-slate-400 mb-1">테스트 선택 *</label>
            <select v-model="testForm.testId" class="w-full px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-slate-300 dark:border-dark-border-primary text-slate-900 dark:text-slate-100 text-sm">
              <option :value="0" disabled>테스트 선택</option>
              <option v-for="test in tests" :key="test.id" :value="test.id">{{ test.name }}</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-mono uppercase text-slate-600 dark:text-slate-400 mb-1">Total VUs *</label>
              <input v-model.number="testForm.totalVUs" type="number" min="1" class="w-full px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-slate-300 dark:border-dark-border-primary text-slate-900 dark:text-slate-100 text-sm" />
            </div>
            <div>
              <label class="block text-xs font-mono uppercase text-slate-600 dark:text-slate-400 mb-1">Duration *</label>
              <input v-model="testForm.duration" type="text" class="w-full px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-slate-300 dark:border-dark-border-primary text-slate-900 dark:text-slate-100 text-sm" placeholder="5m" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-mono uppercase text-slate-600 dark:text-slate-400 mb-1">분배 전략</label>
            <select v-model="testForm.distributionStrategy" class="w-full px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-slate-300 dark:border-dark-border-primary text-slate-900 dark:text-slate-100 text-sm">
              <option value="EQUAL">균등 분배</option>
              <option value="WEIGHTED">용량 기반 분배</option>
              <option value="GEOGRAPHIC">지역 기반 분배</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-mono uppercase text-slate-600 dark:text-slate-400 mb-1">Target Regions (comma separated)</label>
            <input v-model="testForm.targetRegions" type="text" class="w-full px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-slate-300 dark:border-dark-border-primary text-slate-900 dark:text-slate-100 text-sm" placeholder="ap-northeast-2, us-east-1" />
          </div>
          <div>
            <label class="block text-xs font-mono uppercase text-slate-600 dark:text-slate-400 mb-1">Target Tags (comma separated)</label>
            <input v-model="testForm.targetTags" type="text" class="w-full px-3 py-2 bg-white dark:bg-dark-bg-tertiary border border-slate-300 dark:border-dark-border-primary text-slate-900 dark:text-slate-100 text-sm" placeholder="production" />
          </div>
        </div>
        <div class="px-6 py-4 border-t border-slate-300 dark:border-dark-border-primary flex justify-end space-x-3">
          <button @click="showTestModal = false" class="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">취소</button>
          <button @click="createDistributedTest" class="px-4 py-2 bg-accent-primary text-white text-sm hover:bg-accent-primary/90">생성</button>
        </div>
      </div>
    </div>
  </div>
</template>
