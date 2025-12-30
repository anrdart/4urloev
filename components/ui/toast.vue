<script setup lang="ts">
import { Toaster } from 'vue-sonner'
</script>

<template>
  <Toaster
    position="top-right"
    :toast-options="{
      classes: {
        toast: 'glass-card-sm !border-border !text-foreground',
        title: 'font-semibold',
        description: 'text-muted-foreground text-sm',
        actionButton: 'bg-primary text-primary-foreground',
        cancelButton: 'bg-muted text-muted-foreground',
      },
      duration: 4000,
    }"
    rich-colors
    expand
    close-button
  />
</template>


