<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useDarkMode } from '../composables/useDarkMode'
import DarkModeToggle from './DarkModeToggle.vue'

defineProps<{
  showBackButton?: boolean
}>()

const { t } = useI18n()
const router = useRouter()
const { isDark } = useDarkMode()
</script>

<template>
  <div :class="['public-layout', { 'layout-dark': isDark }]">
    <!-- Dark Mode Toggle - Fixed Top Right -->
    <div class="dark-mode-toggle">
      <DarkModeToggle />
    </div>

    <div class="container">
      <!-- Back Button -->
      <button v-if="showBackButton" @click="router.back()" class="back-button">
        <svg class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span>{{ t('common.back') }}</span>
      </button>

      <!-- Content Slot -->
      <div class="content-card">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.public-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 48px 16px;
  position: relative;
}

.public-layout.layout-dark {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.dark-mode-toggle {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 50;
}

.container {
  max-width: 1024px;
  margin: 0 auto;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #475569;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.layout-dark .back-button {
  background: #1e293b;
  border-color: #334155;
  color: #cbd5e1;
}

.back-button:hover {
  background: #f8fafc;
  color: #3b82f6;
  border-color: #3b82f6;
}

.layout-dark .back-button:hover {
  background: #334155;
  color: #60a5fa;
  border-color: #60a5fa;
}

.back-button .icon {
  width: 16px;
  height: 16px;
}

.content-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 48px;
}

.layout-dark .content-card {
  background: #1e293b;
  border-color: #334155;
}

@media (max-width: 768px) {
  .public-layout {
    padding: 24px 16px;
  }

  .content-card {
    padding: 24px;
  }
}
</style>
