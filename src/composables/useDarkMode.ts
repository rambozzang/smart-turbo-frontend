import { ref, watch } from 'vue'

const isDark = ref(false)

// Initialize immediately
const saved = localStorage.getItem('darkMode')
if (saved !== null) {
  isDark.value = saved === 'true'
} else {
  isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
}

// Apply dark mode immediately
function applyDarkMode() {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// Apply initial state
applyDarkMode()

// Watch for changes
watch(isDark, () => {
  applyDarkMode()
  localStorage.setItem('darkMode', String(isDark.value))
})

export function useDarkMode() {
  function toggleDarkMode() {
    isDark.value = !isDark.value
  }

  return {
    isDark,
    toggleDarkMode
  }
}
