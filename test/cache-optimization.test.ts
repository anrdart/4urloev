/**
 * Cache Optimization Property Tests
 * Tests for SWR caching pattern implementation
 * 
 * Feature: performance-seo-optimization
 * Property 8: API Data Caching with SWR
 * Validates: Requirements 4.4
 */

import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import {
  createCacheEntry,
  isCacheFresh,
  isCacheStaleButUsable,
  isCacheExpired,
  isCacheUsable,
  advanceTime,
  generateCacheKey,
  areCacheKeysUnique,
  arbitraryMaxAge,
  arbitraryStaleWhileRevalidate,
  arbitraryCacheKey,
  arbitraryQueryParams,
  arbitraryTimeOffset,
  arbitraryProductData,
} from './utils/cache-helpers'

describe('Property 8: API Data Caching with SWR', () => {
  /**
   * Feature: performance-seo-optimization
   * Property 8: API Data Caching with SWR
   * Validates: Requirements 4.4
   * 
   * For any data fetching operation using useAsyncData or useFetch,
   * the composable SHALL implement stale-while-revalidate pattern
   * using getCachedData option for improved perceived performance.
   */

  describe('Cache State Transitions', () => {
    it('Property 8.1: Fresh cache entries are within maxAge window', () => {
      fc.assert(
        fc.property(
          arbitraryProductData,
          arbitraryMaxAge,
          arbitraryStaleWhileRevalidate,
          fc.integer({ min: 0, max: 100 }), // percentage of maxAge
          (data, maxAge, swr, percentage) => {
            const timestamp = Date.now()
            const entry = createCacheEntry(data, { timestamp, maxAge, staleWhileRevalidate: swr })
            
            // Time within maxAge should be fresh
            const timeWithinMaxAge = timestamp + Math.floor(maxAge * percentage / 100)
            const isFresh = isCacheFresh(entry, timeWithinMaxAge)
            
            // If percentage < 100, should be fresh
            if (percentage < 100) {
              expect(isFresh).toBe(true)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('Property 8.2: Stale-but-usable entries are between maxAge and maxAge+SWR', () => {
      fc.assert(
        fc.property(
          arbitraryProductData,
          arbitraryMaxAge,
          arbitraryStaleWhileRevalidate,
          fc.integer({ min: 1, max: 99 }), // percentage into SWR window
          (data, maxAge, swr, percentage) => {
            const timestamp = Date.now()
            const entry = createCacheEntry(data, { timestamp, maxAge, staleWhileRevalidate: swr })
            
            // Time in SWR window (after maxAge, before maxAge + swr)
            const timeInSwrWindow = timestamp + maxAge + Math.floor(swr * percentage / 100)
            
            const isStaleButUsable = isCacheStaleButUsable(entry, timeInSwrWindow)
            const isUsable = isCacheUsable(entry, timeInSwrWindow)
            const isFresh = isCacheFresh(entry, timeInSwrWindow)
            
            // Should be stale but usable
            expect(isStaleButUsable).toBe(true)
            expect(isUsable).toBe(true)
            expect(isFresh).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('Property 8.3: Expired entries are beyond maxAge+SWR window', () => {
      fc.assert(
        fc.property(
          arbitraryProductData,
          arbitraryMaxAge,
          arbitraryStaleWhileRevalidate,
          fc.integer({ min: 1, max: 1000000 }), // additional time beyond expiry
          (data, maxAge, swr, additionalTime) => {
            const timestamp = Date.now()
            const entry = createCacheEntry(data, { timestamp, maxAge, staleWhileRevalidate: swr })
            
            // Time beyond SWR window
            const timeExpired = timestamp + maxAge + swr + additionalTime
            
            const isExpired = isCacheExpired(entry, timeExpired)
            const isUsable = isCacheUsable(entry, timeExpired)
            
            // Should be expired and not usable
            expect(isExpired).toBe(true)
            expect(isUsable).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Cache State Mutual Exclusivity', () => {
    it('Property 8.4: Cache states are mutually exclusive (fresh, stale-usable, expired)', () => {
      fc.assert(
        fc.property(
          arbitraryProductData,
          arbitraryMaxAge,
          arbitraryStaleWhileRevalidate,
          arbitraryTimeOffset,
          (data, maxAge, swr, timeOffset) => {
            const timestamp = Date.now() - timeOffset // Entry created in the past
            const entry = createCacheEntry(data, { timestamp, maxAge, staleWhileRevalidate: swr })
            const currentTime = Date.now()
            
            const isFresh = isCacheFresh(entry, currentTime)
            const isStaleButUsable = isCacheStaleButUsable(entry, currentTime)
            const isExpired = isCacheExpired(entry, currentTime)
            
            // Exactly one state should be true
            const stateCount = [isFresh, isStaleButUsable, isExpired].filter(Boolean).length
            expect(stateCount).toBe(1)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Cache Key Generation', () => {
    it('Property 8.5: Same parameters produce same cache key', () => {
      fc.assert(
        fc.property(
          arbitraryCacheKey,
          arbitraryQueryParams,
          (baseKey, params) => {
            const key1 = generateCacheKey(baseKey, params)
            const key2 = generateCacheKey(baseKey, params)
            
            expect(key1).toBe(key2)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('Property 8.6: Different parameters produce different cache keys', () => {
      fc.assert(
        fc.property(
          arbitraryCacheKey,
          arbitraryQueryParams,
          arbitraryQueryParams,
          (baseKey, params1, params2) => {
            // Only test when params are actually different
            const paramsAreDifferent = JSON.stringify(params1) !== JSON.stringify(params2)
            
            if (paramsAreDifferent) {
              const key1 = generateCacheKey(baseKey, params1)
              const key2 = generateCacheKey(baseKey, params2)
              
              // Keys should be different when params differ
              expect(key1).not.toBe(key2)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('Property 8.7: Cache keys are deterministic regardless of param order', () => {
      fc.assert(
        fc.property(
          arbitraryCacheKey,
          fc.record({
            a: fc.string({ minLength: 1, maxLength: 10 }),
            b: fc.string({ minLength: 1, maxLength: 10 }),
            c: fc.integer(),
          }),
          (baseKey, params) => {
            // Create params in different orders
            const params1 = { a: params.a, b: params.b, c: params.c }
            const params2 = { c: params.c, a: params.a, b: params.b }
            const params3 = { b: params.b, c: params.c, a: params.a }
            
            const key1 = generateCacheKey(baseKey, params1)
            const key2 = generateCacheKey(baseKey, params2)
            const key3 = generateCacheKey(baseKey, params3)
            
            // All keys should be identical
            expect(key1).toBe(key2)
            expect(key2).toBe(key3)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('SWR Behavior Invariants', () => {
    it('Property 8.8: Usable cache always returns data (fresh or stale)', () => {
      fc.assert(
        fc.property(
          arbitraryProductData,
          arbitraryMaxAge,
          arbitraryStaleWhileRevalidate,
          fc.integer({ min: 0, max: 99 }), // percentage into total usable window
          (data, maxAge, swr, percentage) => {
            const timestamp = Date.now()
            const entry = createCacheEntry(data, { timestamp, maxAge, staleWhileRevalidate: swr })
            
            // Time within usable window (maxAge + swr)
            const totalUsableTime = maxAge + swr
            const timeWithinUsable = timestamp + Math.floor(totalUsableTime * percentage / 100)
            
            const isUsable = isCacheUsable(entry, timeWithinUsable)
            
            // Should be usable and data should be accessible
            expect(isUsable).toBe(true)
            expect(entry.data).toEqual(data)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('Property 8.9: Fresh cache does not need revalidation', () => {
      fc.assert(
        fc.property(
          arbitraryProductData,
          arbitraryMaxAge,
          arbitraryStaleWhileRevalidate,
          fc.integer({ min: 0, max: 99 }), // percentage of maxAge
          (data, maxAge, swr, percentage) => {
            const timestamp = Date.now()
            const entry = createCacheEntry(data, { timestamp, maxAge, staleWhileRevalidate: swr })
            
            // Time within maxAge
            const timeWithinMaxAge = timestamp + Math.floor(maxAge * percentage / 100)
            
            const isFresh = isCacheFresh(entry, timeWithinMaxAge)
            const needsRevalidation = !isFresh && isCacheUsable(entry, timeWithinMaxAge)
            
            // Fresh cache should not need revalidation
            expect(isFresh).toBe(true)
            expect(needsRevalidation).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('Property 8.10: Stale-but-usable cache needs background revalidation', () => {
      fc.assert(
        fc.property(
          arbitraryProductData,
          arbitraryMaxAge,
          arbitraryStaleWhileRevalidate,
          fc.integer({ min: 1, max: 99 }), // percentage into SWR window
          (data, maxAge, swr, percentage) => {
            const timestamp = Date.now()
            const entry = createCacheEntry(data, { timestamp, maxAge, staleWhileRevalidate: swr })
            
            // Time in SWR window
            const timeInSwrWindow = timestamp + maxAge + Math.floor(swr * percentage / 100)
            
            const isFresh = isCacheFresh(entry, timeInSwrWindow)
            const isUsable = isCacheUsable(entry, timeInSwrWindow)
            const needsRevalidation = !isFresh && isUsable
            
            // Stale but usable should need revalidation
            expect(isFresh).toBe(false)
            expect(isUsable).toBe(true)
            expect(needsRevalidation).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })
  })


  describe('Cache Data Integrity', () => {
    it('Property 8.11: Cached data is preserved unchanged', () => {
      fc.assert(
        fc.property(
          arbitraryProductData,
          arbitraryMaxAge,
          arbitraryStaleWhileRevalidate,
          (data, maxAge, swr) => {
            const entry = createCacheEntry(data, { maxAge, staleWhileRevalidate: swr })
            
            // Data should be exactly what was stored
            expect(entry.data).toEqual(data)
            expect(entry.data.id).toBe(data.id)
            expect(entry.data.name).toBe(data.name)
            expect(entry.data.price).toBe(data.price)
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
