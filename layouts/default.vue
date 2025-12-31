<script setup lang="ts">
// SSR-safe store refs - initialized on client only
const authStore = ref<ReturnType<typeof useAuthStore> | null>(null)
const themeStore = ref<ReturnType<typeof useThemeStore> | null>(null)

onMounted(async () => {
  try {
    // Initialize stores on client only
    authStore.value = useAuthStore()
    themeStore.value = useThemeStore()
    
    await authStore.value.initialize()
    themeStore.value.applyTheme()
    
    // Load user theme if authenticated
    if (authStore.value.user) {
      await themeStore.value.loadThemeFromSupabase(authStore.value.user.id)
    }
  } catch (error) {
    console.error('Layout initialization error:', error)
  }
})
</script>

<template>
  <div class="min-h-screen flex flex-col gradient-bg">
    <!-- Background decorations -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 dark:bg-primary/20 rounded-full blur-3xl" />
      <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 dark:bg-secondary/20 rounded-full blur-3xl" />
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-accent/5 dark:bg-accent/10 rounded-full blur-3xl" />
    </div>

    <LayoutNavbar />
    
    <main class="flex-1 pt-20">
      <slot />
    </main>
    
    <LayoutFooter />
    <LayoutFloatingWhatsApp />
    <ThemeCustomizer />
    <UiToast />
  </div>
</template>

