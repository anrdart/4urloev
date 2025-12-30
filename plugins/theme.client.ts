export default defineNuxtPlugin(() => {
  const themeStore = useThemeStore()
  
  // Apply theme immediately on client to prevent flash
  // This runs after Pinia persistence has restored the state
  if (themeStore.isDark) {
    document.documentElement.classList.add('dark')
  }
  
  // Apply full theme after a tick to ensure DOM is ready
  nextTick(() => {
    themeStore.applyTheme()
  })
})
