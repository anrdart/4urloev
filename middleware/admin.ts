export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  
  // Wait for auth to initialize
  if (authStore.isLoading) {
    return
  }
  
  if (!authStore.isAuthenticated) {
    return navigateTo({
      path: '/auth',
      query: { redirect: to.fullPath },
    })
  }
  
  if (!authStore.isAdmin) {
    return navigateTo('/')
  }
})


