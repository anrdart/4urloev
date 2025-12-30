<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '~/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
  glass?: boolean
}>()

const cardClasses = computed(() => 
  cn(
    'rounded-2xl border text-card-foreground transition-all duration-300',
    props.glass 
      ? 'glass-card hover-lift' 
      : 'bg-card shadow-lg hover:shadow-xl',
    props.class
  )
)
</script>

<template>
  <div :class="cardClasses">
    <slot />
  </div>
</template>


