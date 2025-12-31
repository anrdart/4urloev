<script setup lang="ts">
/**
 * Lazy-loaded wrapper for Scene3DWrapper component
 * Uses defineAsyncComponent with Intersection Observer for viewport-based loading
 * Requirements: 2.2 - Lazy load 3D components only when required
 */

const props = withDefaults(defineProps<{
  height?: string
}>(), {
  height: '300px',
})

const containerRef = ref<HTMLElement>()
const shouldLoad = ref(false)

// Use intersection observer to trigger lazy loading when component enters viewport
onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        shouldLoad.value = true
        observer.disconnect()
      }
    },
    { rootMargin: '200px' } // Start loading 200px before entering viewport
  )

  if (containerRef.value) {
    observer.observe(containerRef.value)
  }

  onUnmounted(() => {
    observer.disconnect()
  })
})

// Lazy load the actual Scene3DWrapper component
const Scene3DWrapper = defineAsyncComponent({
  loader: () => import('./Scene3DWrapper.vue'),
  loadingComponent: {
    template: `
      <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl">
        <div class="text-center">
          <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p class="text-sm text-muted-foreground">Loading 3D...</p>
        </div>
      </div>
    `,
  },
  errorComponent: {
    template: `
      <div class="w-full h-full flex items-center justify-center bg-muted/50 rounded-2xl">
        <div class="text-center">
          <p class="text-sm text-muted-foreground">Failed to load 3D scene</p>
        </div>
      </div>
    `,
  },
  delay: 200,
  timeout: 30000,
})
</script>

<template>
  <div
    ref="containerRef"
    :style="{ height }"
    class="relative"
  >
    <template v-if="shouldLoad">
      <Scene3DWrapper :height="height">
        <slot />
      </Scene3DWrapper>
    </template>
    <template v-else>
      <div 
        class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl"
      >
        <div class="text-center">
          <div class="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
          <p class="text-sm text-muted-foreground">Preparing 3D...</p>
        </div>
      </div>
    </template>
  </div>
</template>
