/**
 * Cached Data Composable with SWR Pattern
 * Implements stale-while-revalidate caching strategy for API data
 * 
 * Feature: performance-seo-optimization
 * Requirements: 4.4
 */

import type { AsyncDataOptions } from '#app'

/**
 * Cache configuration options
 */
export interface CacheOptions {
  /** Time in milliseconds before data is considered stale (default: 5 minutes) */
  maxAge?: number
  /** Time in milliseconds to keep stale data while revalidating (default: 1 hour) */
  staleWhileRevalidate?: number
  /** Custom cache key (defaults to URL/key) */
  cacheKey?: string
}

/**
 * In-memory cache store for SWR pattern
 */
interface CacheEntry<T> {
  data: T
  timestamp: number
  maxAge: number
  staleWhileRevalidate: number
}

const cacheStore = new Map<string, CacheEntry<unknown>>()

/**
 * Check if cached data is fresh (within maxAge)
 */
function isFresh<T>(entry: CacheEntry<T>): boolean {
  return Date.now() - entry.timestamp < entry.maxAge
}

/**
 * Check if cached data is still usable (within stale-while-revalidate window)
 */
function isUsable<T>(entry: CacheEntry<T>): boolean {
  return Date.now() - entry.timestamp < entry.maxAge + entry.staleWhileRevalidate
}

/**
 * Get cached data if available and usable
 */
export function getCachedData<T>(key: string): T | null {
  const entry = cacheStore.get(key) as CacheEntry<T> | undefined
  if (entry && isUsable(entry)) {
    return entry.data
  }
  return null
}

/**
 * Set data in cache
 */
export function setCachedData<T>(
  key: string,
  data: T,
  options: CacheOptions = {}
): void {
  const { maxAge = 5 * 60 * 1000, staleWhileRevalidate = 60 * 60 * 1000 } = options
  
  cacheStore.set(key, {
    data,
    timestamp: Date.now(),
    maxAge,
    staleWhileRevalidate,
  })
}

/**
 * Check if data needs revalidation (is stale but usable)
 */
export function needsRevalidation(key: string): boolean {
  const entry = cacheStore.get(key)
  if (!entry) return true
  return !isFresh(entry) && isUsable(entry)
}

/**
 * Clear specific cache entry
 */
export function clearCache(key: string): void {
  cacheStore.delete(key)
}

/**
 * Clear all cache entries
 */
export function clearAllCache(): void {
  cacheStore.clear()
}

/**
 * Default cache options
 */
const DEFAULT_CACHE_OPTIONS: CacheOptions = {
  maxAge: 5 * 60 * 1000, // 5 minutes
  staleWhileRevalidate: 60 * 60 * 1000, // 1 hour
}

/**
 * Composable for cached data fetching with SWR pattern
 * 
 * @param key - Unique key for the data
 * @param fetcher - Function that fetches the data
 * @param options - Cache and async data options
 * 
 * @example
 * ```ts
 * const { data, pending, refresh } = await useCachedData(
 *   'products-featured',
 *   () => useProducts().getFeaturedProducts(),
 *   { maxAge: 10 * 60 * 1000 } // 10 minutes
 * )
 * ```
 */
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions & Omit<AsyncDataOptions<T>, 'getCachedData'> = {}
) {
  const {
    maxAge = DEFAULT_CACHE_OPTIONS.maxAge,
    staleWhileRevalidate = DEFAULT_CACHE_OPTIONS.staleWhileRevalidate,
    cacheKey,
    ...asyncDataOptions
  } = options

  const resolvedKey = cacheKey || key

  return useAsyncData<T>(
    key,
    fetcher,
    {
      ...asyncDataOptions,
      // SWR pattern: return cached data immediately while revalidating
      getCachedData: (key: string) => {
        const cached = getCachedData<T>(resolvedKey)
        if (cached !== null) {
          // Schedule background revalidation if stale
          if (needsRevalidation(resolvedKey)) {
            // Revalidate in background (non-blocking)
            fetcher().then(freshData => {
              setCachedData(resolvedKey, freshData, { maxAge, staleWhileRevalidate })
            }).catch(() => {
              // Silently fail background revalidation
            })
          }
          return cached
        }
        return undefined
      },
      // Transform to cache the result
      transform: (data: T) => {
        setCachedData(resolvedKey, data, { maxAge, staleWhileRevalidate })
        return data
      },
    }
  )
}

/**
 * Composable for cached Supabase queries with SWR pattern
 * Specifically designed for Supabase data fetching
 * 
 * @param key - Unique key for the query
 * @param queryFn - Function that executes the Supabase query
 * @param options - Cache options
 */
export function useCachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  options: CacheOptions = {}
) {
  return useCachedData(key, queryFn, {
    ...options,
    // Default longer cache for database queries
    maxAge: options.maxAge ?? 5 * 60 * 1000, // 5 minutes
    staleWhileRevalidate: options.staleWhileRevalidate ?? 60 * 60 * 1000, // 1 hour
  })
}

/**
 * Export cache utilities for testing and debugging
 */
export const cacheUtils = {
  getCachedData,
  setCachedData,
  needsRevalidation,
  clearCache,
  clearAllCache,
  isCacheEmpty: () => cacheStore.size === 0,
  getCacheSize: () => cacheStore.size,
  getCacheKeys: () => Array.from(cacheStore.keys()),
}
