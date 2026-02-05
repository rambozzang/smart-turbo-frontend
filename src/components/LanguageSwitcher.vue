<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const isOpen = ref(false)

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'ko', label: 'KO' },
]

function changeLanguage(code: string) {
  locale.value = code
  localStorage.setItem('locale', code)
  isOpen.value = false
}
</script>

<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      class="px-2 py-1 text-[10px] font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary transition-all uppercase tracking-wider border border-slate-400 dark:border-dark-border-secondary hover:border-slate-400 dark:hover:border-slate-600"
    >
      {{ locale.toUpperCase() }}
    </button>

    <!-- Backdrop for click outside -->
    <div
      v-if="isOpen"
      @click="isOpen = false"
      class="fixed inset-0 z-40"
    ></div>

    <!-- Dropdown menu -->
    <div
      v-if="isOpen"
      class="absolute bottom-full left-0 mb-2 bg-white dark:bg-dark-bg-secondary border border-slate-400 dark:border-dark-border-primary shadow-panel-lg dark:shadow-dark-panel-lg min-w-[80px] z-50"
    >
      <button
        v-for="lang in languages"
        :key="lang.code"
        @click="changeLanguage(lang.code)"
        class="w-full px-3 py-2 text-[10px] font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary transition-all uppercase tracking-wider text-left border-b border-slate-400 dark:border-dark-border-primary last:border-b-0"
        :class="{ '!text-accent-primary !bg-slate-100 dark:!bg-dark-bg-tertiary': locale === lang.code }"
      >
        {{ lang.label }}
      </button>
    </div>
  </div>
</template>
