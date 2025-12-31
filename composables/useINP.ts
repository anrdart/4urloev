/**
 * INP (Interaction to Next Paint) / FID Optimization Composable
 * 
 * Provides utilities for optimizing interaction responsiveness:
 * - Defer non-critical JavaScript execution
 * - Use requestIdleCallback for low-priority tasks
 * - Optimize event handlers to minimize main thread blocking
 * 
 * Feature: performance-seo-optimization
 * Requirements: 8.2 (FID/INP Optimization)
 */

/**
 * Execute a callback during browser idle time
 * Falls back to setTimeout for browsers without requestIdleCallback
 */
export function useIdleCallback() {
  const executeWhenIdle = (
    callback: () => void,
    options: { timeout?: number } = {}
  ): number => {
    const { timeout = 2000 } = options
    
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      return (window as any).requestIdleCallback(callback, { timeout })
    }
    
    // Fallback for Safari and older browsers
    return window.setTimeout(callback, 1) as unknown as number
  }

  const cancelIdleCallback = (id: number): void => {
    if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
      (window as any).cancelIdleCallback(id)
    } else {
      window.clearTimeout(id)
    }
  }

  return {
    executeWhenIdle,
    cancelIdleCallback,
  }
}

/**
 * Defer non-critical initialization
 * Use this for analytics, tracking, and other non-essential scripts
 */
export function useDeferredInit() {
  const { executeWhenIdle } = useIdleCallback()
  const pendingCallbacks = ref<number[]>([])

  const deferInit = (callback: () => void, priority: 'low' | 'medium' | 'high' = 'low') => {
    const timeouts = {
      low: 5000,
      medium: 2000,
      high: 500,
    }

    const id = executeWhenIdle(callback, { timeout: timeouts[priority] })
    pendingCallbacks.value.push(id)
    return id
  }

  // Cleanup on unmount
  onUnmounted(() => {
    const { cancelIdleCallback } = useIdleCallback()
    pendingCallbacks.value.forEach(id => cancelIdleCallback(id))
  })

  return { deferInit }
}

/**
 * Debounced event handler for better INP
 * Prevents excessive re-renders during rapid interactions
 */
export function useDebouncedHandler<T extends (...args: any[]) => any>(
  handler: T,
  delay: number = 150
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const debouncedHandler = (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      handler(...args)
      timeoutId = null
    }, delay)
  }

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  onUnmounted(cancel)

  return { debouncedHandler, cancel }
}

/**
 * Throttled event handler for scroll/resize events
 * Limits execution frequency for better performance
 */
export function useThrottledHandler<T extends (...args: any[]) => any>(
  handler: T,
  limit: number = 100
) {
  let lastRun = 0
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const throttledHandler = (...args: Parameters<T>) => {
    const now = Date.now()
    
    if (now - lastRun >= limit) {
      handler(...args)
      lastRun = now
    } else {
      // Schedule trailing call
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        handler(...args)
        lastRun = Date.now()
        timeoutId = null
      }, limit - (now - lastRun))
    }
  }

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  onUnmounted(cancel)

  return { throttledHandler, cancel }
}

/**
 * Yield to main thread to prevent long tasks
 * Use this to break up long-running operations
 */
export function useYieldToMain() {
  const yieldToMain = (): Promise<void> => {
    return new Promise(resolve => {
      if (typeof window !== 'undefined' && 'scheduler' in window && 'yield' in (window as any).scheduler) {
        // Use scheduler.yield() if available (Chrome 115+)
        (window as any).scheduler.yield().then(resolve)
      } else {
        // Fallback to setTimeout
        setTimeout(resolve, 0)
      }
    })
  }

  /**
   * Process items in chunks, yielding to main thread between chunks
   */
  const processInChunks = async <T>(
    items: T[],
    processor: (item: T, index: number) => void,
    chunkSize: number = 5
  ): Promise<void> => {
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize)
      chunk.forEach((item, idx) => processor(item, i + idx))
      
      // Yield to main thread after each chunk
      if (i + chunkSize < items.length) {
        await yieldToMain()
      }
    }
  }

  return { yieldToMain, processInChunks }
}

/**
 * Optimize click handlers for better INP
 * Wraps handlers to ensure they don't block the main thread
 */
export function useOptimizedClick<T extends (...args: any[]) => any>(handler: T) {
  const optimizedHandler = async (...args: Parameters<T>) => {
    // Provide immediate visual feedback
    await nextTick()
    
    // Execute handler
    const result = handler(...args)
    
    // Handle async handlers
    if (result instanceof Promise) {
      return result
    }
    
    return result
  }

  return optimizedHandler
}

/**
 * Initialize non-critical features after page load
 * Use this for features that aren't needed immediately
 */
export function usePostLoadInit(callback: () => void) {
  const { deferInit } = useDeferredInit()

  onMounted(() => {
    // Wait for page to be fully interactive
    if (document.readyState === 'complete') {
      deferInit(callback, 'low')
    } else {
      window.addEventListener('load', () => {
        deferInit(callback, 'low')
      }, { once: true })
    }
  })
}
