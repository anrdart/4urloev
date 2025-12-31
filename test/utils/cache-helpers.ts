/**
 * Cache Test Helpers
 * Utilities for testing SWR caching pattern
 * 
 * Feature: performance-seo-optimization
 * Requirements: 4.4
 */

import * as fc from 'fast-check'

/**
 * Interface for cache entry
 */
export interface CacheEntry<T> {
  data: T
  timestamp: number
  maxAge: number
  staleWhileRevalidate: number
}

/**
 * Check if cache entry is fresh (within maxAge)
 */
export function isCacheFresh<T>(entry: CacheEntry<T>, currentTime: number = Date.now()): boolean {
  return currentTime - entry.timestamp < entry.maxAge
}

/**
 * Check if cache entry is stale but usable (within SWR window)
 */
export function isCacheStaleButUsable<T>(entry: CacheEntry<T>, currentTime: number = Date.now()): boolean {
  const age = currentTime - entry.timestamp
  return age >= entry.maxAge && age < entry.maxAge + entry.staleWhileRevalidate
}

/**
 * Check if cache entry is expired (beyond SWR window)
 */
export function isCacheExpired<T>(entry: CacheEntry<T>, currentTime: number = Date.now()): boolean {
  return currentTime - entry.timestamp >= entry.maxAge + entry.staleWhileRevalidate
}

/**
 * Check if cache entry is usable (fresh or stale-but-usable)
 */
export function isCacheUsable<T>(entry: CacheEntry<T>, currentTime: number = Date.now()): boolean {
  return currentTime - entry.timestamp < entry.maxAge + entry.staleWhileRevalidate
}

/**
 * Create a cache entry for testing
 */
export function createCacheEntry<T>(
  data: T,
  options: {
    timestamp?: number
    maxAge?: number
    staleWhileRevalidate?: number
  } = {}
): CacheEntry<T> {
  return {
    data,
    timestamp: options.timestamp ?? Date.now(),
    maxAge: options.maxAge ?? 5 * 60 * 1000, // 5 minutes default
    staleWhileRevalidate: options.staleWhileRevalidate ?? 60 * 60 * 1000, // 1 hour default
  }
}

/**
 * Simulate time passing for cache testing
 */
export function advanceTime(entry: CacheEntry<unknown>, milliseconds: number): number {
  return entry.timestamp + milliseconds
}

/**
 * Validate SWR behavior: fresh data should be returned immediately
 */
export function validateFreshDataBehavior<T>(
  entry: CacheEntry<T>,
  currentTime: number
): { shouldReturnCached: boolean; shouldRevalidate: boolean } {
  const isFresh = isCacheFresh(entry, currentTime)
  return {
    shouldReturnCached: true, // Always return cached if usable
    shouldRevalidate: !isFresh, // Only revalidate if stale
  }
}

/**
 * Validate SWR behavior: stale data should trigger background revalidation
 */
export function validateStaleDataBehavior<T>(
  entry: CacheEntry<T>,
  currentTime: number
): { shouldReturnCached: boolean; shouldRevalidate: boolean } {
  const isUsable = isCacheUsable(entry, currentTime)
  const isFresh = isCacheFresh(entry, currentTime)
  
  return {
    shouldReturnCached: isUsable,
    shouldRevalidate: isUsable && !isFresh,
  }
}

/**
 * Generate cache key from parameters
 */
export function generateCacheKey(base: string, params?: Record<string, unknown>): string {
  if (!params) return base
  const sortedParams = Object.entries(params)
    .filter(([_, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&')
  return sortedParams ? `${base}?${sortedParams}` : base
}

/**
 * Validate cache key uniqueness
 */
export function areCacheKeysUnique(keys: string[]): boolean {
  return new Set(keys).size === keys.length
}

// ============================================
// Fast-check arbitraries for property testing
// ============================================

/**
 * Arbitrary for generating cache timestamps
 */
export const arbitraryCacheTimestamp = fc.integer({ min: 0, max: Date.now() })

/**
 * Arbitrary for generating maxAge values (1 second to 24 hours)
 */
export const arbitraryMaxAge = fc.integer({ min: 1000, max: 24 * 60 * 60 * 1000 })

/**
 * Arbitrary for generating staleWhileRevalidate values (1 minute to 7 days)
 */
export const arbitraryStaleWhileRevalidate = fc.integer({ min: 60 * 1000, max: 7 * 24 * 60 * 60 * 1000 })

/**
 * Arbitrary for generating cache entries with any data
 */
export const arbitraryCacheEntry = <T>(dataArbitrary: fc.Arbitrary<T>) =>
  fc.record({
    data: dataArbitrary,
    timestamp: arbitraryCacheTimestamp,
    maxAge: arbitraryMaxAge,
    staleWhileRevalidate: arbitraryStaleWhileRevalidate,
  })

/**
 * Arbitrary for generating cache keys
 */
export const arbitraryCacheKey = fc.stringMatching(/^[a-z0-9-]+$/, { minLength: 1, maxLength: 50 })

/**
 * Arbitrary for generating query parameters
 */
export const arbitraryQueryParams = fc.dictionary(
  fc.stringMatching(/^[a-z]+$/, { minLength: 1, maxLength: 10 }),
  fc.oneof(
    fc.string({ minLength: 1, maxLength: 20 }),
    fc.integer(),
    fc.boolean()
  ),
  { minKeys: 0, maxKeys: 5 }
)

/**
 * Arbitrary for generating time offsets relative to cache entry
 */
export const arbitraryTimeOffset = fc.integer({ min: 0, max: 10 * 24 * 60 * 60 * 1000 }) // 0 to 10 days

/**
 * Arbitrary for product-like data
 */
export const arbitraryProductData = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  price: fc.integer({ min: 1000, max: 10000000 }),
  is_active: fc.boolean(),
})

/**
 * Arbitrary for array of products
 */
export const arbitraryProductArray = fc.array(arbitraryProductData, { minLength: 0, maxLength: 20 })
