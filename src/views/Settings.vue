<script setup lang="ts">
import { ref } from 'vue'
import { useDarkMode } from '../composables/useDarkMode'
import { useI18n } from 'vue-i18n'

const { isDark, toggleDarkMode } = useDarkMode()
const { t, locale } = useI18n()

const settings = ref({
  notifications: {
    email: true,
    slack: false,
    testCompletion: true,
    testFailure: true,
    weeklyReport: true
  },
  defaults: {
    testType: 'LOAD',
    vus: 100,
    duration: '5m',
    timeout: 30
  },
  advanced: {
    maxConcurrentTests: 3,
    retentionDays: 90,
    autoCleanup: true
  }
})

function saveSettings() {
  alert('Settings saved!')
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
        {{ t('settings.title') }}
      </h1>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-400 font-mono">
        {{ t('settings.subtitle') }}
      </p>
    </div>

    <!-- Appearance -->
    <div class="bg-white dark:bg-dark-bg-secondary border border-slate-500 dark:border-dark-border-primary">
      <div class="px-6 py-3 border-b border-slate-500 dark:border-dark-border-primary">
        <h2 class="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">{{ t('settings.appearance') }}</h2>
      </div>
      <div class="p-6 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ t('settings.darkMode') }}</p>
            <p class="mt-1 text-xs text-slate-600 dark:text-slate-400">{{ t('settings.darkModeDesc') }}</p>
          </div>
          <button
            @click="toggleDarkMode"
            :class="isDark ? 'bg-accent-primary' : 'bg-slate-200 dark:bg-dark-bg-tertiary'"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
          >
            <span :class="isDark ? 'translate-x-6' : 'translate-x-1'" class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
          </button>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ t('settings.language') }}</p>
            <p class="mt-1 text-xs text-slate-600 dark:text-slate-400">{{ t('settings.languageDesc') }}</p>
          </div>
          <select
            v-model="locale"
            class="px-3 py-1.5 bg-slate-100 dark:bg-dark-bg-tertiary border border-slate-500 dark:border-dark-border-primary text-sm text-slate-900 dark:text-slate-100 font-mono"
          >
            <option value="en">English</option>
            <option value="ko">한국어</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Notifications -->
    <div class="bg-white dark:bg-dark-bg-secondary border border-slate-500 dark:border-dark-border-primary">
      <div class="px-6 py-3 border-b border-slate-500 dark:border-dark-border-primary">
        <h2 class="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">{{ t('settings.notifications') }}</h2>
      </div>
      <div class="p-6 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ t('settings.emailNotifications') }}</p>
            <p class="mt-1 text-xs text-slate-600 dark:text-slate-400">{{ t('settings.emailNotificationsDesc') }}</p>
          </div>
          <button
            @click="settings.notifications.email = !settings.notifications.email"
            :class="settings.notifications.email ? 'bg-accent-primary' : 'bg-slate-200 dark:bg-dark-bg-tertiary'"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
          >
            <span :class="settings.notifications.email ? 'translate-x-6' : 'translate-x-1'" class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
          </button>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ t('settings.testCompletion') }}</p>
            <p class="mt-1 text-xs text-slate-600 dark:text-slate-400">{{ t('settings.testCompletionDesc') }}</p>
          </div>
          <button
            @click="settings.notifications.testCompletion = !settings.notifications.testCompletion"
            :class="settings.notifications.testCompletion ? 'bg-accent-primary' : 'bg-slate-200 dark:bg-dark-bg-tertiary'"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
          >
            <span :class="settings.notifications.testCompletion ? 'translate-x-6' : 'translate-x-1'" class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
          </button>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ t('settings.testFailures') }}</p>
            <p class="mt-1 text-xs text-slate-600 dark:text-slate-400">{{ t('settings.testFailuresDesc') }}</p>
          </div>
          <button
            @click="settings.notifications.testFailure = !settings.notifications.testFailure"
            :class="settings.notifications.testFailure ? 'bg-accent-primary' : 'bg-slate-200 dark:bg-dark-bg-tertiary'"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
          >
            <span :class="settings.notifications.testFailure ? 'translate-x-6' : 'translate-x-1'" class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
          </button>
        </div>
      </div>
    </div>

    <!-- Test Defaults -->
    <div class="bg-white dark:bg-dark-bg-secondary border border-slate-500 dark:border-dark-border-primary">
      <div class="px-6 py-3 border-b border-slate-500 dark:border-dark-border-primary">
        <h2 class="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">{{ t('settings.testDefaults') }}</h2>
      </div>
      <div class="p-6 space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">{{ t('settings.defaultTestType') }}</label>
            <select v-model="settings.defaults.testType" class="w-full px-3 py-2 bg-slate-100 dark:bg-dark-bg-tertiary border border-slate-500 dark:border-dark-border-primary text-sm text-slate-900 dark:text-slate-100 font-mono">
              <option value="LOAD">LOAD</option>
              <option value="STRESS">STRESS</option>
              <option value="SPIKE">SPIKE</option>
              <option value="SOAK">SOAK</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">{{ t('settings.defaultVUs') }}</label>
            <input v-model.number="settings.defaults.vus" type="number" class="w-full px-3 py-2 bg-slate-100 dark:bg-dark-bg-tertiary border border-slate-500 dark:border-dark-border-primary text-sm text-slate-900 dark:text-slate-100 font-mono" />
          </div>
          <div>
            <label class="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">{{ t('settings.defaultDuration') }}</label>
            <input v-model="settings.defaults.duration" type="text" class="w-full px-3 py-2 bg-slate-100 dark:bg-dark-bg-tertiary border border-slate-500 dark:border-dark-border-primary text-sm text-slate-900 dark:text-slate-100 font-mono" />
          </div>
          <div>
            <label class="block text-xs font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">{{ t('settings.timeout') }}</label>
            <input v-model.number="settings.defaults.timeout" type="number" class="w-full px-3 py-2 bg-slate-100 dark:bg-dark-bg-tertiary border border-slate-500 dark:border-dark-border-primary text-sm text-slate-900 dark:text-slate-100 font-mono" />
          </div>
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <div class="flex justify-end space-x-3">
      <button class="px-6 py-2 bg-slate-800 dark:bg-dark-bg-tertiary text-slate-100 text-xs font-mono uppercase tracking-wider hover:bg-slate-700 transition-all border border-slate-700">
        {{ t('settings.resetToDefaults') }}
      </button>
      <button @click="saveSettings" class="px-6 py-2 bg-accent-primary text-white text-xs font-mono uppercase tracking-wider hover:bg-accent-primary/90 transition-all border border-accent-primary/20">
        {{ t('settings.saveSettings') }}
      </button>
    </div>
  </div>
</template>
