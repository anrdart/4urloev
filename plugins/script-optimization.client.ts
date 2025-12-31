/**
 * Script Optimization Plugin
 * Ensures third-party scripts are loaded with defer/async attributes
 * Requirements: 2.4 - Defer non-critical scripts
 */

export default defineNuxtPlugin(() => {
  // Only run on client-side
  if (import.meta.server) return

  // Function to add defer attribute to scripts that don't have it
  const optimizeScripts = () => {
    // Get all script tags
    const scripts = document.querySelectorAll('script[src]')
    
    scripts.forEach((script) => {
      const src = script.getAttribute('src') || ''
      
      // Skip inline scripts and already optimized scripts
      if (!src || script.hasAttribute('defer') || script.hasAttribute('async')) {
        return
      }
      
      // List of third-party domains that should have deferred loading
      const thirdPartyDomains = [
        'stripe.com',
        'js.stripe.com',
        'google-analytics.com',
        'googletagmanager.com',
        'facebook.net',
        'connect.facebook.net',
        'platform.twitter.com',
        'cdn.jsdelivr.net',
        'unpkg.com',
      ]
      
      // Check if script is from a third-party domain
      const isThirdParty = thirdPartyDomains.some(domain => src.includes(domain))
      
      if (isThirdParty) {
        // Clone the script with defer attribute
        const newScript = document.createElement('script')
        newScript.src = src
        newScript.defer = true
        
        // Copy other attributes
        Array.from(script.attributes).forEach(attr => {
          if (attr.name !== 'src') {
            newScript.setAttribute(attr.name, attr.value)
          }
        })
        
        // Replace the old script
        script.parentNode?.replaceChild(newScript, script)
      }
    })
  }

  // Run optimization after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', optimizeScripts)
  } else {
    // DOM is already ready, run immediately
    optimizeScripts()
  }

  // Also observe for dynamically added scripts
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeName === 'SCRIPT' && (node as HTMLScriptElement).src) {
          const script = node as HTMLScriptElement
          const src = script.src
          
          // List of third-party domains
          const thirdPartyDomains = [
            'stripe.com',
            'js.stripe.com',
            'google-analytics.com',
            'googletagmanager.com',
          ]
          
          const isThirdParty = thirdPartyDomains.some(domain => src.includes(domain))
          
          if (isThirdParty && !script.defer && !script.async) {
            script.defer = true
          }
        }
      })
    })
  })

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  })

  // Cleanup observer on page unload
  window.addEventListener('beforeunload', () => {
    observer.disconnect()
  })
})
