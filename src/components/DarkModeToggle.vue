<script setup lang="ts">
import { useDarkMode } from '../composables/useDarkMode'

const { isDark, toggleDarkMode } = useDarkMode()
</script>

<template>
  <button
    @click="toggleDarkMode"
    :class="['toggle-button', { 'button-dark': isDark }]"
    :title="isDark ? 'Light Mode' : 'Dark Mode'"
  >
    <svg v-if="isDark" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
    <svg v-else class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  </button>
</template>

<style scoped>
.toggle-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.toggle-button.button-dark {
  background: #1e293b;
  border-color: #334155;
  color: #e2e8f0;
}

.toggle-button:hover {
  background: #f8fafc;
  border-color: #3b82f6;
  color: #3b82f6;
}

.toggle-button.button-dark:hover {
  background: #334155;
  border-color: #3b82f6;
  color: #3b82f6;
}

.icon {
  width: 20px;
  height: 20px;
}
</style>
