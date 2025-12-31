/**
 * LCP (Largest Contentful Paint) Optimization Composable
 *
 * Provides utilities for optimizing LCP by:
 * - Preloading critical resources (images, fonts)
 * - Prioritizing above-the-fold content
 * - Managing resource hints (preconnect, prefetch, preload)
 */

interface PreloadOptions {
  as: 'image' | 'font' | 'style' | 'script'
  type?: string
  crossorigin?: 'anonymous' | 'use-credentials'
  fetchpriority?: 'high' | 'low' | 'auto'
}

interface LCPImageOptions {
  src: string
  srcset?: string
  sizes?: string
  width?: number
  height?: number
}

export function useLCP() {
  /**
   * Preload a critical resource
   */
  function preloadResource(href: string, options: PreloadOptions) {
    if (!import.meta.client) return

    const existing = document.querySelector(`link[rel="preload"][href="${href}"]`)
    if (existing) return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = options.as

    if (options.type) link.type = options.type
    if (options.crossorigin) link.crossOrigin = options.crossorigin
    if (options.fetchpriority) link.setAttribute('fetchpriority', options.fetchpriority)

    document.head.appendChild(link)
  }

  /**
   * Preload LCP image with high priority
   */
  function preloadLCPImage(options: LCPImageOptions) {
    if (!import.meta.client) return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = options.src
    link.setAttribute('fetchpriority', 'high')

    if (options.srcset) link.setAttribute('imagesrcset', options.srcset)
    if (options.sizes) link.setAttribute('imagesizes', options.sizes)

    document.head.appendChild(link)
  }

  /**
   * Add preconnect hint for external origin
   */
  function preconnect(origin: string, crossorigin = true) {
    if (!import.meta.client) return

    const existing = document.querySelector(`link[rel="preconnect"][href="${origin}"]`)
    if (existing) return

    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = origin
    if (crossorigin) link.crossOrigin = 'anonymous'

    document.head.appendChild(link)
  }

  /**
   * Mark an element as the LCP candidate for priority loading
   */
  function markAsLCP(element: HTMLElement | null) {
    if (!element) return

    if (element instanceof HTMLImageElement) {
      element.loading = 'eager'
      element.decoding = 'sync'
      element.setAttribute('fetchpriority', 'high')
    }
  }

  /**
   * Observe and report LCP metrics (for debugging/monitoring)
   */
  function observeLCP(callback: (entry: PerformanceEntry) => void) {
    if (!import.meta.client || !('PerformanceObserver' in window)) return

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      if (lastEntry) callback(lastEntry)
    })

    observer.observe({ type: 'largest-contentful-paint', buffered: true })

    onUnmounted(() => observer.disconnect())
  }

  return {
    preloadResource,
    preloadLCPImage,
    preconnect,
    markAsLCP,
    observeLCP,
  }
}
