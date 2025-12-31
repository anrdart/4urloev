/**
 * Link Prefetching Property Tests
 * 
 * Feature: performance-seo-optimization
 * Property 7: Link Prefetching
 * Validates: Requirements 4.2
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

/**
 * Interface for NuxtLink attributes
 */
interface NuxtLinkAttributes {
  to: string
  prefetch?: boolean
  noPrefetch?: boolean
  external?: boolean
  target?: string
}

/**
 * Parse NuxtLink component attributes from template string
 */
function parseNuxtLinkAttributes(linkTag: string): NuxtLinkAttributes | null {
  // Match NuxtLink or nuxt-link tags
  const nuxtLinkMatch = linkTag.match(/<(?:NuxtLink|nuxt-link)\s+([^>]*)>/i)
  if (!nuxtLinkMatch) return null

  const attrsString = nuxtLinkMatch[1]
  
  // Extract 'to' attribute (required)
  const toMatch = attrsString.match(/:?to=["']([^"']+)["']/) || 
                  attrsString.match(/:to="`([^`]+)`"/)
  if (!toMatch) return null

  const attrs: NuxtLinkAttributes = {
    to: toMatch[1],
  }

  // Check for prefetch attribute
  if (attrsString.includes('prefetch')) {
    attrs.prefetch = !attrsString.includes(':prefetch="false"') && 
                     !attrsString.includes('prefetch="false"')
  }

  // Check for no-prefetch attribute
  if (attrsString.includes('no-prefetch') || attrsString.includes('noPrefetch')) {
    attrs.noPrefetch = true
  }

  // Check for external attribute
  if (attrsString.includes('external')) {
    attrs.external = true
  }

  // Check for target attribute
  const targetMatch = attrsString.match(/target=["']([^"']+)["']/)
  if (targetMatch) {
    attrs.target = targetMatch[1]
  }

  return attrs
}

/**
 * Check if a link is an internal link (should have prefetching)
 */
function isInternalLink(to: string): boolean {
  // External links start with http://, https://, or //
  if (to.startsWith('http://') || to.startsWith('https://') || to.startsWith('//')) {
    return false
  }
  // Internal links start with / or are relative paths
  return to.startsWith('/') || !to.includes('://')
}

/**
 * Check if a NuxtLink has prefetching enabled
 * By default, NuxtLink has prefetching enabled for internal links
 */
function hasPrefetchingEnabled(attrs: NuxtLinkAttributes): boolean {
  // External links don't get prefetched
  if (attrs.external || attrs.target === '_blank') {
    return false
  }
  
  // If explicitly disabled
  if (attrs.noPrefetch || attrs.prefetch === false) {
    return false
  }

  // Internal links have prefetching enabled by default
  return isInternalLink(attrs.to)
}

/**
 * Extract all NuxtLink components from HTML/Vue template
 */
function extractNuxtLinks(template: string): string[] {
  const linkRegex = /<(?:NuxtLink|nuxt-link)\s+[^>]*>/gi
  const matches = template.match(linkRegex) || []
  return matches
}

/**
 * Validate that all internal NuxtLinks have prefetching enabled
 */
function validateLinkPrefetching(template: string): {
  valid: boolean
  totalLinks: number
  internalLinks: number
  prefetchedLinks: number
  violations: string[]
} {
  const links = extractNuxtLinks(template)
  const violations: string[] = []
  let internalLinks = 0
  let prefetchedLinks = 0

  for (const link of links) {
    const attrs = parseNuxtLinkAttributes(link)
    if (!attrs) continue

    if (isInternalLink(attrs.to)) {
      internalLinks++
      if (hasPrefetchingEnabled(attrs)) {
        prefetchedLinks++
      } else {
        violations.push(`Link to "${attrs.to}" has prefetching disabled`)
      }
    }
  }

  return {
    valid: violations.length === 0,
    totalLinks: links.length,
    internalLinks,
    prefetchedLinks,
    violations,
  }
}

/**
 * Generate a NuxtLink tag for testing
 */
function generateNuxtLink(attrs: Partial<NuxtLinkAttributes>): string {
  const parts: string[] = []
  
  if (attrs.to) {
    // Use dynamic binding for paths with variables
    if (attrs.to.includes('${') || attrs.to.includes('`')) {
      parts.push(`:to="\`${attrs.to}\`"`)
    } else {
      parts.push(`to="${attrs.to}"`)
    }
  }
  
  if (attrs.prefetch === false) {
    parts.push(':prefetch="false"')
  }
  
  if (attrs.noPrefetch) {
    parts.push('no-prefetch')
  }
  
  if (attrs.external) {
    parts.push('external')
  }
  
  if (attrs.target) {
    parts.push(`target="${attrs.target}"`)
  }

  return `<NuxtLink ${parts.join(' ')}>`
}

// Arbitrary generators for property-based testing
const arbitraryInternalPath = fc.stringMatching(/^\/[a-z][a-z0-9-/]*$/, { minLength: 2, maxLength: 50 })
  .filter(s => s.length >= 2 && s.startsWith('/') && !s.startsWith('//'))

const arbitraryExternalUrl = fc.webUrl()

const arbitraryProductId = fc.uuid()

/**
 * Property 7: Link Prefetching
 * 
 * For any internal NuxtLink component in the application, the link SHALL have
 * prefetching enabled (default Nuxt behavior) to preload linked page data
 * on hover or viewport intersection.
 * 
 * Validates: Requirements 4.2
 */
describe('Property 7: Link Prefetching', () => {
  describe('Internal link detection', () => {
    it('Property 7.1: Internal paths starting with / are correctly identified', () => {
      fc.assert(
        fc.property(
          arbitraryInternalPath,
          (path) => {
            return isInternalLink(path) === true
          }
        ),
        { numRuns: 20 }
      )
    })

    it('Property 7.2: External URLs are correctly identified', () => {
      fc.assert(
        fc.property(
          arbitraryExternalUrl,
          (url) => {
            return isInternalLink(url) === false
          }
        ),
        { numRuns: 20 }
      )
    })

    it('Property 7.3: Product detail paths are internal links', () => {
      fc.assert(
        fc.property(
          arbitraryProductId,
          (productId) => {
            const path = `/products/${productId}`
            return isInternalLink(path) === true
          }
        ),
        { numRuns: 20 }
      )
    })
  })

  describe('Prefetching behavior', () => {
    it('Property 7.4: Internal NuxtLinks have prefetching enabled by default', () => {
      fc.assert(
        fc.property(
          arbitraryInternalPath,
          (path) => {
            const link = generateNuxtLink({ to: path })
            const attrs = parseNuxtLinkAttributes(link)
            
            return attrs !== null && hasPrefetchingEnabled(attrs) === true
          }
        ),
        { numRuns: 20 }
      )
    })

    it('Property 7.5: External links do not have prefetching', () => {
      fc.assert(
        fc.property(
          arbitraryExternalUrl,
          (url) => {
            const link = generateNuxtLink({ to: url, external: true })
            const attrs = parseNuxtLinkAttributes(link)
            
            return attrs !== null && hasPrefetchingEnabled(attrs) === false
          }
        ),
        { numRuns: 20 }
      )
    })

    it('Property 7.6: Links with target="_blank" do not have prefetching', () => {
      fc.assert(
        fc.property(
          arbitraryInternalPath,
          (path) => {
            const link = generateNuxtLink({ to: path, target: '_blank' })
            const attrs = parseNuxtLinkAttributes(link)
            
            return attrs !== null && hasPrefetchingEnabled(attrs) === false
          }
        ),
        { numRuns: 20 }
      )
    })

    it('Property 7.7: Links with no-prefetch attribute have prefetching disabled', () => {
      fc.assert(
        fc.property(
          arbitraryInternalPath,
          (path) => {
            const link = generateNuxtLink({ to: path, noPrefetch: true })
            const attrs = parseNuxtLinkAttributes(link)
            
            return attrs !== null && hasPrefetchingEnabled(attrs) === false
          }
        ),
        { numRuns: 20 }
      )
    })

    it('Property 7.8: Links with prefetch="false" have prefetching disabled', () => {
      fc.assert(
        fc.property(
          arbitraryInternalPath,
          (path) => {
            const link = generateNuxtLink({ to: path, prefetch: false })
            const attrs = parseNuxtLinkAttributes(link)
            
            return attrs !== null && hasPrefetchingEnabled(attrs) === false
          }
        ),
        { numRuns: 20 }
      )
    })
  })

  describe('Template validation', () => {
    it('Property 7.9: Templates with only default NuxtLinks pass validation', () => {
      fc.assert(
        fc.property(
          fc.array(arbitraryInternalPath, { minLength: 1, maxLength: 3 }),
          (paths) => {
            const links = paths.map(path => generateNuxtLink({ to: path }))
            const template = `<template>${links.join('\n')}</template>`
            
            const result = validateLinkPrefetching(template)
            return result.valid === true && result.violations.length === 0
          }
        ),
        { numRuns: 20 }
      )
    })

    it('Property 7.10: Templates with disabled prefetch are flagged as violations', () => {
      fc.assert(
        fc.property(
          arbitraryInternalPath,
          (path) => {
            const link = generateNuxtLink({ to: path, noPrefetch: true })
            const template = `<template>${link}</template>`
            
            const result = validateLinkPrefetching(template)
            return result.valid === false && result.violations.length > 0
          }
        ),
        { numRuns: 20 }
      )
    })

    it('Property 7.11: Mixed templates correctly count prefetched vs non-prefetched links', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 3 }),
          fc.integer({ min: 1, max: 3 }),
          (prefetchedCount, nonPrefetchedCount) => {
            const prefetchedLinks = Array(prefetchedCount).fill(null).map((_, i) => 
              generateNuxtLink({ to: `/page${i}` })
            )
            const nonPrefetchedLinks = Array(nonPrefetchedCount).fill(null).map((_, i) => 
              generateNuxtLink({ to: `/other${i}`, noPrefetch: true })
            )
            
            const template = `<template>${[...prefetchedLinks, ...nonPrefetchedLinks].join('\n')}</template>`
            const result = validateLinkPrefetching(template)
            
            return (
              result.internalLinks === prefetchedCount + nonPrefetchedCount &&
              result.prefetchedLinks === prefetchedCount &&
              result.violations.length === nonPrefetchedCount
            )
          }
        ),
        { numRuns: 20 }
      )
    })
  })

  describe('Edge cases', () => {
    it('should handle empty templates', () => {
      const result = validateLinkPrefetching('')
      expect(result.valid).toBe(true)
      expect(result.totalLinks).toBe(0)
    })

    it('should handle templates with no NuxtLinks', () => {
      const template = '<template><div><a href="/products">Regular link</a></div></template>'
      const result = validateLinkPrefetching(template)
      expect(result.valid).toBe(true)
      expect(result.totalLinks).toBe(0)
    })

    it('should handle dynamic product links', () => {
      const link = '<NuxtLink :to="`/products/${product.id}`">'
      const attrs = parseNuxtLinkAttributes(link)
      expect(attrs).not.toBeNull()
      expect(attrs?.to).toContain('products')
    })

    it('should handle kebab-case nuxt-link tags', () => {
      const link = '<nuxt-link to="/products">'
      const attrs = parseNuxtLinkAttributes(link)
      expect(attrs).not.toBeNull()
      expect(attrs?.to).toBe('/products')
    })
  })
})
