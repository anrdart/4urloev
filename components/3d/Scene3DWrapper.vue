<script setup lang="ts">
// Wrapper component for lazy loading 3D scenes
const props = withDefaults(defineProps<{
  height?: string
}>(), {
  height: '300px',
})

const isLoaded = ref(false)
const containerRef = ref<HTMLElement>()

// Use intersection observer to lazy load 3D content
onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        isLoaded.value = true
        observer.disconnect()
      }
    },
    { rootMargin: '100px' }
  )

  if (containerRef.value) {
    observer.observe(containerRef.value)
  }

  onUnmounted(() => {
    observer.disconnect()
  })
})
</script>

<template>
  <div
    ref="containerRef"
    :style="{ height }"
    class="relative bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl overflow-hidden"
  >
    <template v-if="isLoaded">
      <slot />
    </template>
    <template v-else>
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="text-center">
          <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p class="text-sm text-muted-foreground">Loading 3D...</p>
        </div>
      </div>
    </template>
  </div>
</template>


