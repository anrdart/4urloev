<script setup lang="ts">
import { ref, computed, type HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'

export interface OptimizedImageProps {
  src: string
  alt: string
  width?: number | string
  height?: number | string
  aspectRatio?: string
  loading?: 'lazy' | 'eager'
  priority?: boolean
  preset?: 'productCard' | 'thumbnail' | 'hero' | 'productDetail' | 'avatar'
  placeholder?: 'skeleton' | 'blur' | 'empty'
  fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  class?: HTMLAttributes['class']
  imgClass?: HTMLAttributes['class']
  sizes?: string
}

const props = withDefaults(defineProps<OptimizedImageProps>(), {
  loading: 'lazy',
  priority: false,
  placeholder: 'skeleton',
  fit: 'cover',
  sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
})

const emit = defineEmits<{
  load: [event: Event]
  error: [event: Event]
}>()

const isLoaded = ref(false)
const hasError = ref(false)

// Check if src is a placeholder or SVG (skip optimization for these)
const isPlaceholderOrSvg = computed(() => {
  return props.src.includes('placeholder') || props.src.endsWith('.svg')
})

// Determine loading attribute based on priority
const loadingAttr = computed(() => {
  return props.priority ? 'eager' : props.loading
})

// Compute container styles for CLS prevention
const containerStyle = computed(() => {
  const styles: Record<string, string> = {}
  
  if (props.aspectRatio) {
    styles.aspectRatio = props.aspectRatio
  }
  
  return styles
})

// Compute container classes
const containerClasses = computed(() => {
  return cn(
    'relative overflow-hidden',
    props.class
  )
})

// Compute image classes
const imageClasses = computed(() => {
  return cn(
    'transition-opacity duration-300',
    {
      'opacity-0': !isLoaded.value && props.placeholder !== 'empty',
      'opacity-100': isLoaded.value || props.placeholder === 'empty',
      'object-cover': props.fit === 'cover',
      'object-contain': props.fit === 'contain',
      'object-fill': props.fit === 'fill',
      'object-none': props.fit === 'none',
      'object-scale-down': props.fit === 'scale-down',
    },
    props.imgClass
  )
})

// Handle image load
const handleLoad = (event: Event) => {
  isLoaded.value = true
  emit('load', event)
}

// Handle image error
const handleError = (event: Event) => {
  hasError.value = true
  emit('error', event)
}
</script>

<template>
  <div
    :class="containerClasses"
    :style="containerStyle"
  >
    <!-- Skeleton placeholder -->
    <div
      v-if="placeholder === 'skeleton' && !isLoaded && !hasError"
      class="absolute inset-0 z-10"
    >
      <UiSkeleton class="w-full h-full" />
    </div>

    <!-- Error fallback -->
    <div
      v-if="hasError"
      class="absolute inset-0 flex items-center justify-center bg-muted"
    >
      <span class="text-muted-foreground text-sm">Failed to load image</span>
    </div>

    <!-- Optimized image using NuxtImg -->
    <NuxtImg
      v-if="!hasError && !isPlaceholderOrSvg"
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      :loading="loadingAttr"
      :preset="preset"
      :sizes="sizes"
      :class="imageClasses"
      :fetchpriority="priority ? 'high' : undefined"
      @load="handleLoad"
      @error="handleError"
    />
    
    <!-- Regular img for placeholders/SVGs (skip NuxtImg optimization) -->
    <img
      v-else-if="!hasError && isPlaceholderOrSvg"
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      :loading="loadingAttr"
      :class="imageClasses"
      @load="handleLoad"
      @error="handleError"
    />
  </div>
</template>
