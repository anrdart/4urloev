/**
 * Image Testing Utilities
 * Helpers for testing image optimization, lazy loading, and responsive images
 * 
 * Feature: performance-seo-optimization
 * Requirements: Testing Strategy
 */

import * as fc from 'fast-check'

// Types for image testing
export interface ImageAttributes {
  src?: string
  srcset?: string
  sizes?: string
  loading?: 'lazy' | 'eager'
  width?: string | number
  height?: string | number
  alt?: string
  decoding?: 'async' | 'sync' | 'auto'
}

export interface SrcsetEntry {
  url: string
  descriptor: string // e.g., '320w', '2x'
}

export interface ImageDimensions {
  width: number
  height: number
}

// Arbitrary generators for property-based testing
export const arbitraryImageUrl = fc.webUrl().map(url => `${url}/image.jpg`)

export const arbitraryImageWidth = fc.integer({ min: 16, max: 4096 })

export const arbitraryImageHeight = fc.integer({ min: 16, max: 4096 })

export const arbitraryImageDimensions = fc.record({
  width: arbitraryImageWidth,
  height: arbitraryImageHeight
})

export const arbitraryAltText = fc.string({ minLength: 1, maxLength: 125 })
  .filter(s => s.trim().length > 0)

export const arbitraryScreenSize = fc.constantFrom('xs', 'sm', 'md', 'lg', 'xl', '2xl')

export const arbitraryViewportWidth = fc.integer({ min: 320, max: 2560 })

export const arbitraryImageFormat = fc.constantFrom('webp', 'avif', 'jpg', 'png', 'gif')

// Helper functions for extracting and validating image elements
export function extractImageAttributes(imgTag: string): ImageAttributes {
  const attrs: ImageAttributes = {}
  
  const srcMatch = imgTag.match(/\ssrc=["']([^"']+)["']/i)
  if (srcMatch) attrs.src = srcMatch[1]
  
  const srcsetMatch = imgTag.match(/\ssrcset=["']([^"']+)["']/i)
  if (srcsetMatch) attrs.srcset = srcsetMatch[1]
  
  const sizesMatch = imgTag.match(/\ssizes=["']([^"']+)["']/i)
  if (sizesMatch) attrs.sizes = sizesMatch[1]
  
  const loadingMatch = imgTag.match(/\sloading=["']([^"']+)["']/i)
  if (loadingMatch) attrs.loading = loadingMatch[1] as 'lazy' | 'eager'
  
  const widthMatch = imgTag.match(/\swidth=["']?(\d+)["']?/i)
  if (widthMatch) attrs.width = parseInt(widthMatch[1], 10)
  
  const heightMatch = imgTag.match(/\sheight=["']?(\d+)["']?/i)
  if (heightMatch) attrs.height = parseInt(heightMatch[1], 10)
  
  const altMatch = imgTag.match(/\salt=["']([^"']*)["']/i)
  if (altMatch) attrs.alt = altMatch[1]
  
  const decodingMatch = imgTag.match(/\sdecoding=["']([^"']+)["']/i)
  if (decodingMatch) attrs.decoding = decodingMatch[1] as 'async' | 'sync' | 'auto'
  
  return attrs
}

export function extractAllImages(html: string): string[] {
  const imgRegex = /<img[^>]+>/gi
  return html.match(imgRegex) || []
}

export function parseSrcset(srcset: string): SrcsetEntry[] {
  if (!srcset) return []
  
  return srcset.split(',').map(entry => {
    const parts = entry.trim().split(/\s+/)
    return {
      url: parts[0],
      descriptor: parts[1] || '1x'
    }
  })
}


// Validation functions
export function hasLazyLoading(imgTag: string): boolean {
  const attrs = extractImageAttributes(imgTag)
  return attrs.loading === 'lazy'
}

export function hasExplicitDimensions(imgTag: string): boolean {
  const attrs = extractImageAttributes(imgTag)
  return (
    (attrs.width !== undefined && attrs.height !== undefined) ||
    imgTag.includes('aspect-ratio') ||
    imgTag.includes('style=') && imgTag.includes('aspect-ratio')
  )
}

export function hasResponsiveSrcset(imgTag: string): boolean {
  const attrs = extractImageAttributes(imgTag)
  if (!attrs.srcset) return false
  
  const entries = parseSrcset(attrs.srcset)
  // Should have multiple size variants
  return entries.length >= 2
}

export function hasSizesAttribute(imgTag: string): boolean {
  const attrs = extractImageAttributes(imgTag)
  return attrs.sizes !== undefined && attrs.sizes.length > 0
}

export function hasAltText(imgTag: string): boolean {
  const attrs = extractImageAttributes(imgTag)
  return attrs.alt !== undefined
}

export function isModernFormat(url: string): boolean {
  const modernFormats = ['.webp', '.avif']
  return modernFormats.some(format => url.toLowerCase().includes(format))
}

export function validateImageOptimization(imgTag: string): {
  valid: boolean
  issues: string[]
} {
  const issues: string[] = []
  const attrs = extractImageAttributes(imgTag)
  
  if (!hasAltText(imgTag)) {
    issues.push('Missing alt attribute')
  }
  
  if (!hasExplicitDimensions(imgTag)) {
    issues.push('Missing explicit width/height dimensions')
  }
  
  if (attrs.loading !== 'lazy' && attrs.loading !== 'eager') {
    issues.push('Missing loading attribute')
  }
  
  return {
    valid: issues.length === 0,
    issues
  }
}

// Check if image should be lazy loaded based on position
export function shouldBeLazyLoaded(
  imagePosition: number,
  viewportHeight: number,
  aboveTheFoldThreshold: number = 1
): boolean {
  // Images above the fold (within first viewport) should NOT be lazy loaded
  // Images below the fold SHOULD be lazy loaded
  return imagePosition > viewportHeight * aboveTheFoldThreshold
}

// Validate srcset has appropriate breakpoints
export function hasAppropriateBreakpoints(srcset: string): boolean {
  const entries = parseSrcset(srcset)
  const widths = entries
    .filter(e => e.descriptor.endsWith('w'))
    .map(e => parseInt(e.descriptor.replace('w', ''), 10))
  
  if (widths.length < 2) return false
  
  // Check for reasonable spread of sizes
  const minWidth = Math.min(...widths)
  const maxWidth = Math.max(...widths)
  
  // Should have at least mobile and desktop sizes
  return minWidth <= 640 && maxWidth >= 1024
}

// Calculate expected srcset widths for responsive images
export function getExpectedSrcsetWidths(): number[] {
  // Common responsive breakpoints
  return [320, 640, 768, 1024, 1280, 1536]
}

// Check if container has CLS prevention styles
export function hasCLSPrevention(containerHtml: string): boolean {
  // Check for explicit dimensions or aspect-ratio
  const hasWidth = /width[:=]\s*["']?\d+/i.test(containerHtml)
  const hasHeight = /height[:=]\s*["']?\d+/i.test(containerHtml)
  const hasAspectRatio = /aspect-ratio/i.test(containerHtml)
  const hasMinHeight = /min-height[:=]\s*["']?\d+/i.test(containerHtml)
  
  return (hasWidth && hasHeight) || hasAspectRatio || hasMinHeight
}
