<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: number
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 32,
  animated: false
})

const viewBox = computed(() => `0 0 ${props.size} ${props.size}`)
</script>

<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="viewBox"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="{ 'logo-animated': animated }"
  >
    <defs>
      <!-- Gradient for modern look -->
      <linearGradient id="turboGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#8b5cf6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
      </linearGradient>

      <!-- Glow effect -->
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    <!-- Outer ring (turbo fan blades) -->
    <g class="turbo-ring">
      <path
        d="M16 4 L20 8 L16 10 L16 4 Z"
        fill="url(#turboGradient)"
        opacity="0.8"
      />
      <path
        d="M28 16 L24 20 L22 16 L28 16 Z"
        fill="url(#turboGradient)"
        opacity="0.8"
      />
      <path
        d="M16 28 L12 24 L16 22 L16 28 Z"
        fill="url(#turboGradient)"
        opacity="0.8"
      />
      <path
        d="M4 16 L8 12 L10 16 L4 16 Z"
        fill="url(#turboGradient)"
        opacity="0.8"
      />

      <!-- Diagonal blades -->
      <path
        d="M24 8 L26 10 L22 14 L20 12 Z"
        fill="url(#turboGradient)"
        opacity="0.6"
      />
      <path
        d="M24 24 L22 26 L18 22 L20 20 Z"
        fill="url(#turboGradient)"
        opacity="0.6"
      />
      <path
        d="M8 24 L10 26 L14 22 L12 20 Z"
        fill="url(#turboGradient)"
        opacity="0.6"
      />
      <path
        d="M8 8 L12 10 L10 14 L6 12 Z"
        fill="url(#turboGradient)"
        opacity="0.6"
      />
    </g>

    <!-- Center circle (hub) -->
    <circle
      cx="16"
      cy="16"
      r="8"
      fill="url(#turboGradient)"
      class="hub"
    />

    <!-- Lightning bolt (smart/power) -->
    <g class="lightning">
      <path
        d="M18 10 L14 16 L16.5 16 L14 22 L20 15 L17 15 Z"
        fill="white"
        filter="url(#glow)"
      />
    </g>

    <!-- Circuit pattern overlay (tech/smart element) -->
    <g class="circuit" opacity="0.3">
      <circle cx="16" cy="8" r="1" fill="white"/>
      <circle cx="24" cy="16" r="1" fill="white"/>
      <circle cx="16" cy="24" r="1" fill="white"/>
      <circle cx="8" cy="16" r="1" fill="white"/>
      <line x1="16" y1="9" x2="16" y2="11" stroke="white" stroke-width="0.5"/>
      <line x1="23" y1="16" x2="21" y2="16" stroke="white" stroke-width="0.5"/>
      <line x1="16" y1="23" x2="16" y2="21" stroke="white" stroke-width="0.5"/>
      <line x1="9" y1="16" x2="11" y2="16" stroke="white" stroke-width="0.5"/>
    </g>
  </svg>
</template>

<style scoped>
.logo-animated .turbo-ring {
  animation: spin 8s linear infinite;
  transform-origin: center;
}

.logo-animated .hub {
  animation: pulse 2s ease-in-out infinite;
}

.logo-animated .lightning {
  animation: flash 3s ease-in-out infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes flash {
  0%, 90%, 100% {
    opacity: 1;
  }
  95% {
    opacity: 0.3;
  }
}
</style>
