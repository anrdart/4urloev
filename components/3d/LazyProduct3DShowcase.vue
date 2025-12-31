<script setup lang="ts">
/**
 * Lazy-loaded wrapper for Product3DShowcase component
 * Uses defineAsyncComponent to dynamically import Three.js/TresJS
 * Requirements: 2.2 - Lazy load 3D components only when required
 */

const props = withDefaults(defineProps<{
  type?: 'box' | 'sphere' | 'torus' | 'gift'
  color?: string
  autoRotate?: boolean
}>(), {
  type: 'box',
  color: '#6366f1',
  autoRotate: true,
})

// Lazy load the actual 3D component
const Product3DShowcase = defineAsyncComponent({
  loader: () => import('./Product3DShowcase.vue'),
  loadingComponent: {
    template: `
      <div class="w-full h-full min-h-[200px] flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl">
        <div class="text-center">
          <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p class="text-sm text-muted-foreground">Loading 3D Scene...</p>
        </div>
      </div>
    `,
  },
  errorComponent: {
    template: `
      <div class="w-full h-full min-h-[200px] flex items-center justify-center bg-muted/50 rounded-xl">
        <div class="text-center">
          <p class="text-sm text-muted-foreground">Failed to load 3D content</p>
        </div>
      </div>
    `,
  },
  delay: 200,
  timeout: 30000,
})
</script>

<template>
  <Product3DShowcase
    :type="type"
    :color="color"
    :auto-rotate="autoRotate"
  />
</template>
