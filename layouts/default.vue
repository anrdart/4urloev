<script setup lang="ts">
// Direct store access - Nuxt handles SSR safety
const authStore = useAuthStore()
const themeStore = useThemeStore()

onMounted(async () => {
  try {
    await authStore.initialize()
    themeStore.applyTheme()
    
    // Load user theme if authenticated
    if (authStore.user) {
      await themeStore.loadThemeFromSupabase(authStore.user.id)
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
