<script setup lang="ts">
/**
 * Loading Skeleton Component
 * Enhanced with fixed dimensions for CLS prevention
 * 
 * Feature: performance-seo-optimization
 * Requirements: 8.4 (CLS Prevention)
 */

const props = withDefaults(defineProps<{
  variant?: 'default' | 'card' | 'product' | 'page' | 'hero' | 'text' | 'avatar'
  // Fixed dimensions for CLS prevention
  width?: string | number
  height?: string | number
  // Number of items for grid variants
  count?: number
}>(), {
  variant: 'default',
  count: 6,
})

// Compute fixed dimensions style for CLS prevention
const dimensionStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }
  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  return style
})

// Fixed heights for different variants (CLS prevention)
const VARIANT_HEIGHTS = {
  product: 'min-h-[420px]', // ProductCard approximate height
  card: 'min-h-[280px]',
  hero: 'min-h-[400px]',
  page: 'min-h-[600px]',
  text: 'min-h-[24px]',
  avatar: 'min-h-[40px] min-w-[40px]',
  default: '',
}
</script>

<template>
  <!-- Default Skeleton -->
  <div 
    v-if="variant === 'default'" 
    class="animate-pulse"
    :style="dimensionStyle"
  >
    <slot>
      <UiSkeleton class="h-4 w-full" />
    </slot>
  </div>

  <!-- Text Skeleton - for text content placeholders -->
  <div 
    v-else-if="variant === 'text'" 
    class="animate-pulse space-y-2"
    :class="VARIANT_HEIGHTS.text"
    :style="dimensionStyle"
  >
    <UiSkeleton class="h-4 w-full" />
    <UiSkeleton class="h-4 w-3/4" />
  </div>

  <!-- Avatar Skeleton -->
  <div 
    v-else-if="variant === 'avatar'" 
    class="animate-pulse"
    :class="VARIANT_HEIGHTS.avatar"
  >
    <UiSkeleton class="h-10 w-10 rounded-full" />
  </div>

  <!-- Card Skeleton -->
  <div 
    v-else-if="variant === 'card'" 
    class="glass-card rounded-2xl p-6 animate-pulse"
    :class="VARIANT_HEIGHTS.card"
    :style="dimensionStyle"
  >
    <UiSkeleton class="h-40 w-full rounded-xl mb-4" />
    <UiSkeleton class="h-6 w-3/4 mb-2" />
    <UiSkeleton class="h-4 w-1/2" />
  </div>

  <!-- Product Card Skeleton - Fixed dimensions matching ProductCard -->
  <div 
    v-else-if="variant === 'product'" 
    class="glass-card rounded-2xl overflow-hidden animate-pulse"
    :class="VARIANT_HEIGHTS.product"
    :style="dimensionStyle"
  >
    <!-- Image placeholder with fixed aspect ratio -->
    <div class="aspect-square w-full bg-muted/50">
      <UiSkeleton class="w-full h-full" />
    </div>
    <!-- Content placeholder with fixed height -->
    <div class="p-5 min-h-[140px]">
      <UiSkeleton class="h-6 w-3/4 mb-2" />
      <UiSkeleton class="h-4 w-full mb-1" />
      <UiSkeleton class="h-4 w-2/3 mb-4" />
      <div class="flex justify-between items-center">
        <UiSkeleton class="h-7 w-24" />
        <UiSkeleton class="h-9 w-20 rounded-lg" />
      </div>
    </div>
  </div>

  <!-- Hero Skeleton - for hero sections -->
  <div 
    v-else-if="variant === 'hero'" 
    class="animate-pulse"
    :class="VARIANT_HEIGHTS.hero"
    :style="dimensionStyle"
  >
    <div class="container mx-auto px-4 py-20">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <div class="space-y-6">
          <UiSkeleton class="h-8 w-48 rounded-full" />
          <UiSkeleton class="h-16 w-full" />
          <UiSkeleton class="h-16 w-3/4" />
          <UiSkeleton class="h-6 w-full max-w-xl" />
          <div class="flex gap-4">
            <UiSkeleton class="h-12 w-40 rounded-lg" />
            <UiSkeleton class="h-12 w-40 rounded-lg" />
          </div>
        </div>
        <div class="hidden lg:block">
          <UiSkeleton class="aspect-square max-w-lg mx-auto rounded-3xl" />
        </div>
      </div>
    </div>
  </div>

  <!-- Page Skeleton - for full page loading -->
  <div 
    v-else-if="variant === 'page'" 
    class="container mx-auto px-4 py-8 animate-pulse"
    :class="VARIANT_HEIGHTS.page"
    :style="dimensionStyle"
  >
    <UiSkeleton class="h-10 w-64 mb-4" />
    <UiSkeleton class="h-6 w-full max-w-xl mb-8" />
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div 
        v-for="i in count" 
        :key="i" 
        class="min-h-[420px]"
      >
        <UiLoadingSkeleton variant="product" />
      </div>
    </div>
  </div>
</template>


