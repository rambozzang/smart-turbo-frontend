<script setup lang="ts">
/**
 * Simplified icon version of Smart-Turbo logo
 * Perfect for favicons, small UI elements, and mobile views
 */

interface Props {
  size?: number
  variant?: 'full' | 'minimal' | 'monochrome'
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  variant: 'full'
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#8b5cf6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
      </linearGradient>
    </defs>

    <!-- Full color variant -->
    <g v-if="variant === 'full'">
      <!-- Turbo blades -->
      <path d="M12 3 L15 6 L12 7.5 Z" fill="url(#iconGradient)" opacity="0.8"/>
      <path d="M21 12 L18 15 L16.5 12 Z" fill="url(#iconGradient)" opacity="0.8"/>
      <path d="M12 21 L9 18 L12 16.5 Z" fill="url(#iconGradient)" opacity="0.8"/>
      <path d="M3 12 L6 9 L7.5 12 Z" fill="url(#iconGradient)" opacity="0.8"/>

      <!-- Center hub -->
      <circle cx="12" cy="12" r="6" fill="url(#iconGradient)"/>

      <!-- Lightning -->
      <path d="M13.5 8 L10.5 12 L12 12 L10.5 16 L15 11 L13 11 Z" fill="white"/>
    </g>

    <!-- Minimal variant (single color) -->
    <g v-else-if="variant === 'minimal'">
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.1"/>
      <path d="M13.5 6 L9 12 L11.5 12 L9 18 L16.5 11 L13.5 11 Z" fill="currentColor"/>
    </g>

    <!-- Monochrome variant -->
    <g v-else-if="variant === 'monochrome'">
      <!-- Outer ring -->
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" fill="none"/>

      <!-- Blades -->
      <path d="M12 4 L14 7 L12 8 Z" fill="currentColor"/>
      <path d="M20 12 L17 14 L16 12 Z" fill="currentColor"/>
      <path d="M12 20 L10 17 L12 16 Z" fill="currentColor"/>
      <path d="M4 12 L7 10 L8 12 Z" fill="currentColor"/>

      <!-- Center -->
      <circle cx="12" cy="12" r="5" fill="currentColor"/>

      <!-- Lightning -->
      <path d="M13 9 L10.5 12 L12 12 L10.5 15 L14.5 11 L13 11 Z" fill="white"/>
    </g>
  </svg>
</template>
