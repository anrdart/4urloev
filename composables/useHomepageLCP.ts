/**
 * Homepage LCP Optimization Composable
 * 
 * Provides LCP optimization specifically for the homepage
 * Feature: performance-seo-optimization
 * Requirement: 8.1
 */

export function useHomepageLCP() {
  const { preconnect } = useLCP()
  
  // Only run on client
  if (import.meta.client) {
    onMounted(() => {
      // Preconnect to critical origins for homepage
      preconnect('https://fonts.googleapis.com', false)
      preconnect('https://fonts.gstatic.com', true)
    })
  }
  
  return {
    // Return empty object for SSR compatibility
  }
}
