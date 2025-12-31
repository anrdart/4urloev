<script setup lang="ts">
/**
 * Lazy-loaded wrapper for LivePreviewCustomizer component
 * Dynamically imports Fabric.js only when the customizer is needed
 * Requirements: 2.3 - Dynamically import Fabric.js on demand
 */

const props = defineProps<{
  productImage?: string
}>()

const emit = defineEmits<{
  save: [dataUrl: string]
}>()

const isLoading = ref(true)
const hasError = ref(false)
const errorMessage = ref('')

// Lazy load the actual customizer component
const LivePreviewCustomizer = defineAsyncComponent({
  loader: () => import('./LivePreviewCustomizer.vue'),
  loadingComponent: {
    template: `
      <div class="glass-card rounded-2xl p-12 text-center">
        <div class="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-muted-foreground">Memuat customizer...</p>
        <p class="text-sm text-muted-foreground/70 mt-2">Mengunduh library Fabric.js...</p>
      </div>
    `,
  },
  errorComponent: {
    template: `
      <div class="glass-card rounded-2xl p-12 text-center">
        <div class="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p class="text-destructive font-medium">Gagal memuat customizer</p>
        <p class="text-sm text-muted-foreground mt-2">Silakan refresh halaman untuk mencoba lagi</p>
      </div>
    `,
  },
  delay: 200,
  timeout: 60000, // Longer timeout for Fabric.js which is a large library
  onError: (error, retry, fail, attempts) => {
    if (attempts <= 2) {
      // Retry up to 2 times
      retry()
    } else {
      fail()
    }
  },
})

// Track loading state
const handleLoaded = () => {
  isLoading.value = false
}

const handleSave = (dataUrl: string) => {
  emit('save', dataUrl)
}
</script>

<template>
  <Suspense @resolve="handleLoaded">
    <LivePreviewCustomizer
      :product-image="productImage"
      @save="handleSave"
    />
    <template #fallback>
      <div class="glass-card rounded-2xl p-12 text-center">
        <div class="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-muted-foreground">Memuat customizer...</p>
        <p class="text-sm text-muted-foreground/70 mt-2">Mengunduh library Fabric.js...</p>
      </div>
    </template>
  </Suspense>
</template>
