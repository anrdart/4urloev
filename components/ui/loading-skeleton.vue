<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'default' | 'card' | 'product' | 'page'
}>(), {
  variant: 'default',
})
</script>

<template>
  <!-- Default Skeleton -->
  <div v-if="variant === 'default'" class="animate-pulse">
    <slot>
      <UiSkeleton class="h-4 w-full" />
    </slot>
  </div>

  <!-- Card Skeleton -->
  <div v-else-if="variant === 'card'" class="glass-card rounded-2xl p-6 animate-pulse">
    <UiSkeleton class="h-40 w-full rounded-xl mb-4" />
    <UiSkeleton class="h-6 w-3/4 mb-2" />
    <UiSkeleton class="h-4 w-1/2" />
  </div>

  <!-- Product Card Skeleton -->
  <div v-else-if="variant === 'product'" class="glass-card rounded-2xl overflow-hidden animate-pulse">
    <UiSkeleton class="aspect-square w-full" />
    <div class="p-5">
      <UiSkeleton class="h-6 w-3/4 mb-2" />
      <UiSkeleton class="h-4 w-full mb-4" />
      <div class="flex justify-between items-center">
        <UiSkeleton class="h-6 w-24" />
        <UiSkeleton class="h-10 w-20 rounded-lg" />
      </div>
    </div>
  </div>

  <!-- Page Skeleton -->
  <div v-else-if="variant === 'page'" class="container mx-auto px-4 py-8 animate-pulse">
    <UiSkeleton class="h-10 w-64 mb-4" />
    <UiSkeleton class="h-6 w-full max-w-xl mb-8" />
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <UiSkeleton v-for="i in 6" :key="i" class="h-64 rounded-2xl" />
    </div>
  </div>
</template>


