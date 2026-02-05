<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDarkMode } from './composables/useDarkMode'
import { useAuthStore } from './stores/auth'
import LanguageSwitcher from './components/LanguageSwitcher.vue'
import SmartTurboLogo from './components/SmartTurboLogo.vue'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const { isDark, toggleDarkMode } = useDarkMode()
const authStore = useAuthStore()

const isRouterReady = ref(false)
const username = computed(() => authStore.user?.fullName || authStore.user?.username || 'User')
const hideLayout = computed(() => route.meta.hideLayout === true)

// Wait for router to be ready before showing content
onMounted(async () => {
  await router.isReady()
  isRouterReady.value = true
})

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div v-if="isRouterReady" class="min-h-screen bg-slate-50 dark:bg-dark-bg-primary flex transition-colors duration-200">
    <!-- Left Sidebar Navigation -->
    <aside v-if="!hideLayout" class="w-64 bg-white dark:bg-dark-bg-secondary border-r border-slate-400 dark:border-dark-border-primary flex flex-col fixed h-screen">
      <!-- Logo & Brand -->
      <div class="px-5 py-4 border-b border-slate-400 dark:border-dark-border-primary">
        <RouterLink to="/" class="flex items-center space-x-3 group">
          <div class="relative">
            <SmartTurboLogo :size="40" :animated="true" class="transition-transform group-hover:scale-110" />
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-semibold text-slate-800 dark:text-slate-100 tracking-tight uppercase">
              Smart-Turbo
            </span>
            <span class="text-[10px] font-mono text-slate-500 dark:text-slate-500 tracking-wider uppercase">
              Load Testing
            </span>
          </div>
        </RouterLink>
      </div>

      <!-- Navigation Menu -->
      <nav class="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        <!-- Overview Section -->
        <div class="space-y-1">
          <div class="px-3 mb-2">
            <p class="text-[10px] font-mono text-slate-500 dark:text-slate-600 uppercase tracking-wider">{{ t('nav.overview') }}</p>
          </div>

          <RouterLink
            to="/"
            class="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary transition-all group rounded"
            active-class="!text-slate-900 dark:!text-slate-100 !bg-slate-100 dark:!bg-dark-bg-tertiary border-l-2 border-accent-primary"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>{{ t('nav.dashboard') }}</span>
          </RouterLink>

          <RouterLink
            to="/analytics"
            class="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary transition-all group rounded"
            active-class="!text-slate-900 dark:!text-slate-100 !bg-slate-100 dark:!bg-dark-bg-tertiary border-l-2 border-accent-primary"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>{{ t('nav.analytics') }}</span>
            <span class="ml-auto px-1.5 py-0.5 text-[9px] font-mono bg-accent-primary/20 text-accent-primary rounded">PRO</span>
          </RouterLink>
        </div>

        <!-- Testing Section -->
        <div class="space-y-1">
          <div class="px-3 mb-2">
            <p class="text-[10px] font-mono text-slate-500 dark:text-slate-600 uppercase tracking-wider">{{ t('nav.testing') }}</p>
          </div>

          <RouterLink
            to="/tests"
            class="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary transition-all group rounded"
            active-class="!text-slate-900 dark:!text-slate-100 !bg-slate-100 dark:!bg-dark-bg-tertiary border-l-2 border-accent-primary"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span>{{ t('nav.allTests') }}</span>
          </RouterLink>

          <RouterLink
            to="/tests/new"
            class="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary transition-all group rounded"
            active-class="!text-slate-900 dark:!text-slate-100 !bg-slate-100 dark:!bg-dark-bg-tertiary border-l-2 border-accent-primary"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>{{ t('nav.createTest') }}</span>
          </RouterLink>

          <RouterLink
            to="/tests/scenario"
            class="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary transition-all group rounded"
            active-class="!text-slate-900 dark:!text-slate-100 !bg-slate-100 dark:!bg-dark-bg-tertiary border-l-2 border-accent-primary"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <span>{{ t('nav.scenarioBuilder') }}</span>
          </RouterLink>

          <RouterLink
            to="/data"
            class="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary transition-all group rounded"
            active-class="!text-slate-900 dark:!text-slate-100 !bg-slate-100 dark:!bg-dark-bg-tertiary border-l-2 border-accent-primary"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
            <span>{{ t('nav.dataParameterization') }}</span>
          </RouterLink>

          <RouterLink
            to="/templates"
            class="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary transition-all group rounded"
            active-class="!text-slate-900 dark:!text-slate-100 !bg-slate-100 dark:!bg-dark-bg-tertiary border-l-2 border-accent-primary"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            <span>{{ t('nav.templates') }}</span>
          </RouterLink>

          <RouterLink
            to="/schedules"
            class="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary transition-all group rounded"
            active-class="!text-slate-900 dark:!text-slate-100 !bg-slate-100 dark:!bg-dark-bg-tertiary border-l-2 border-accent-primary"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ t('nav.schedules') }}</span>
            <span class="ml-auto px-1.5 py-0.5 text-[9px] font-mono bg-accent-primary/20 text-accent-primary rounded">PRO</span>
          </RouterLink>
        </div>

        <!-- Reports & Monitoring Section -->
        <div class="space-y-1">
          <div class="px-3 mb-2">
            <p class="text-[10px] font-mono text-slate-500 dark:text-slate-600 uppercase tracking-wider">{{ t('nav.reportsMonitoring') }}</p>
          </div>

          <RouterLink
            to="/reports"
            class="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary transition-all group rounded"
            active-class="!text-slate-900 dark:!text-slate-100 !bg-slate-100 dark:!bg-dark-bg-tertiary border-l-2 border-accent-primary"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{{ t('nav.testReports') }}</span>
          </RouterLink>

          <RouterLink
            to="/monitoring"
            class="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary transition-all group rounded"
            active-class="!text-slate-900 dark:!text-slate-100 !bg-slate-100 dark:!bg-dark-bg-tertiary border-l-2 border-accent-primary"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{{ t('nav.liveMonitoring') }}</span>
            <span class="ml-auto w-2 h-2 bg-accent-success rounded-full animate-pulse"></span>
          </RouterLink>

          <RouterLink
            to="/trends"
            class="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary transition-all group rounded"
            active-class="!text-slate-900 dark:!text-slate-100 !bg-slate-100 dark:!bg-dark-bg-tertiary border-l-2 border-accent-primary"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            <span>{{ t('nav.performanceTrends') }}</span>
          </RouterLink>

          <RouterLink
            to="/comparison"
            class="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary transition-all group rounded"
            active-class="!text-slate-900 dark:!text-slate-100 !bg-slate-100 dark:!bg-dark-bg-tertiary border-l-2 border-accent-primary"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>{{ t('nav.testComparison') }}</span>
          </RouterLink>
        </div>

        <!-- Configuration Section -->
        <div class="space-y-1">
          <div class="px-3 mb-2">
            <p class="text-[10px] font-mono text-slate-500 dark:text-slate-600 uppercase tracking-wider">{{ t('nav.configuration') }}</p>
          </div>

          <RouterLink
            to="/integrations"
            class="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary transition-all group rounded"
            active-class="!text-slate-900 dark:!text-slate-100 !bg-slate-100 dark:!bg-dark-bg-tertiary border-l-2 border-accent-primary"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
            </svg>
            <span>{{ t('nav.integrations') }}</span>
          </RouterLink>

          <RouterLink
            to="/api-keys"
            class="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary transition-all group rounded"
            active-class="!text-slate-900 dark:!text-slate-100 !bg-slate-100 dark:!bg-dark-bg-tertiary border-l-2 border-accent-primary"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <span>{{ t('nav.apiKeys') }}</span>
          </RouterLink>

          <RouterLink
            to="/settings"
            class="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary transition-all group rounded"
            active-class="!text-slate-900 dark:!text-slate-100 !bg-slate-100 dark:!bg-dark-bg-tertiary border-l-2 border-accent-primary"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{{ t('nav.settings') }}</span>
          </RouterLink>

          <RouterLink
            v-if="authStore.canManageUsers"
            to="/users"
            class="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary transition-all group rounded"
            active-class="!text-slate-900 dark:!text-slate-100 !bg-slate-100 dark:!bg-dark-bg-tertiary border-l-2 border-accent-primary"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>{{ t('users.title') }}</span>
          </RouterLink>
        </div>
      </nav>

      <!-- Utilities Footer -->
      <div class="px-3 py-3 border-t border-slate-400 dark:border-dark-border-primary space-y-2">
        <div class="flex items-center justify-between">
          <LanguageSwitcher />

          <!-- Dark Mode Toggle -->
          <button
            @click="toggleDarkMode"
            class="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary transition-all border border-slate-400 dark:border-dark-border-secondary"
            :title="isDark ? 'Light Mode' : 'Dark Mode'"
          >
            <svg v-if="isDark" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
        </div>

        <div class="flex items-center justify-center space-x-1 text-[10px] font-mono text-slate-500 dark:text-slate-500 py-1">
          <div class="w-1.5 h-1.5 bg-accent-success rounded-full"></div>
          <span>ONLINE</span>
        </div>

        <div class="text-[10px] font-mono text-slate-500 dark:text-slate-500 text-center space-y-0.5">
          <div>Smart-Turbo v1.0.0</div>
          <div class="flex items-center justify-center space-x-1">
            <span class="text-slate-600 dark:text-slate-600">Powered by</span>
            <span>Claude AI × k6</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-h-screen" :class="{ 'ml-64': !hideLayout }">
      <!-- Top Header -->
      <header v-if="!hideLayout" class="bg-white dark:bg-dark-bg-secondary border-b border-slate-400 dark:border-dark-border-primary h-14 flex items-center px-6">
        <div class="flex items-center justify-between w-full max-w-[1400px] mx-auto">
          <div class="text-sm font-medium text-slate-700 dark:text-slate-300">
            <!-- Breadcrumb or page title can go here -->
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-xs font-mono text-slate-500 dark:text-slate-400">{{ new Date().toLocaleDateString() }}</span>

            <!-- User Info & Logout -->
            <div class="flex items-center space-x-3">
              <div class="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 dark:bg-dark-bg-tertiary border border-slate-400 dark:border-dark-border-primary rounded">
                <svg class="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ username }}</span>
              </div>

              <button
                @click="handleLogout"
                class="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary border border-slate-400 dark:border-dark-border-primary rounded transition-all"
                :title="t('nav.logout')"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>{{ t('nav.logout') }}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 bg-slate-50 dark:bg-dark-bg-primary overflow-y-auto">
        <div class="w-full max-w-[1400px] mx-auto px-6 py-6">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

body {
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
