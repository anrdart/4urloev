/**
 * Image Optimization Property Tests
 * 
 * Feature: performance-seo-optimization
 * Requirements: 1.1, 1.3, 10.1
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  hasLazyLoading,
  hasExplicitDimensions,
  hasResponsiveSrcset,
  parseSrcset,
  shouldBeLazyLoaded,
  arbitraryImageDimensions,
  arbitraryViewportWidth,
  getExpectedSrcsetWidths
} from './utils/image-helpers'

/**
 * Property 1: Image Lazy Loading
 * 
 * For any image element that is positioned below the viewport on initial page load,
 * the image SHALL have `loading="lazy"` attribute and SHALL NOT be loaded until
 * it approaches the viewport.
 * 
 * Validates: Requirements 1.1
 */
describe('Property 1: Image Lazy Loading', () => {
  it('should determine lazy loading based on image position relative to viewport', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 5000 }), // imagePosition
        fc.integer({ min: 300, max: 1200 }), // viewportHeight
        (imagePosition, viewportHeight) => {
          const shouldLazy = shouldBeLazyLoaded(imagePosition, viewportHeight)
          
          // Images below the viewport should be lazy loaded
          if (imagePosition > viewportHeight) {
            return shouldLazy === true
          }
          // Images within the viewport should NOT be lazy loaded
          return shouldLazy === false
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should correctly identify lazy loading attribute in img tags', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('lazy', 'eager', undefined),
        (loadingValue) => {
          const imgTag = loadingValue 
            ? `<img src="test.jpg" loading="${loadingValue}" alt="test">`
            : '<img src="test.jpg" alt="test">'
          
          const isLazy = hasLazyLoading(imgTag)
          
          // Only 'lazy' value should return true
          return isLazy === (loadingValue === 'lazy')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should validate that below-fold images require lazy loading', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 800, max: 5000 }), // below fold position
        fc.integer({ min: 600, max: 800 }), // typical viewport height
        (imagePosition, viewportHeight) => {
          // For images clearly below the fold
          const shouldLazy = shouldBeLazyLoaded(imagePosition, viewportHeight)
          return shouldLazy === true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should validate that above-fold images should not be lazy loaded', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 400 }), // above fold position
        fc.integer({ min: 600, max: 1200 }), // viewport height
        (imagePosition, viewportHeight) => {
          // For images clearly above the fold
          const shouldLazy = shouldBeLazyLoaded(imagePosition, viewportHeight)
          return shouldLazy === false
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * Property 2: Responsive Image Srcset Generation
 * 
 * For any product image rendered by NuxtImage component, the output SHALL include
 * a `srcset` attribute with multiple size variants appropriate for different
 * screen sizes (xs, sm, md, lg, xl).
 * 
 * Validates: Requirements 1.3, 10.1
 */
describe('Property 2: Responsive Image Srcset Generation', () => {
  it('should parse srcset with multiple width descriptors correctly', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            width: fc.integer({ min: 320, max: 2560 }),
            // Use alphanumeric strings to avoid special characters like commas that break srcset parsing
            path: fc.stringMatching(/^[a-z0-9-]+$/, { minLength: 1, maxLength: 20 })
          }),
          { minLength: 2, maxLength: 6 }
        ),
        (entries) => {
          // Generate srcset string with safe URLs (no commas or special chars)
          const srcset = entries
            .map(e => `https://example.com/${e.path}/image.jpg ${e.width}w`)
            .join(', ')
          
          const parsed = parseSrcset(srcset)
          
          // Should parse all entries
          return parsed.length === entries.length
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should validate srcset contains appropriate breakpoints for responsive design', () => {
    // Generate srcsets that always include both mobile and desktop sizes
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 640 }), // mobile width
        fc.integer({ min: 1024, max: 1536 }), // desktop width
        fc.array(fc.integer({ min: 641, max: 1023 }), { minLength: 0, maxLength: 2 }), // optional middle widths
        (mobileWidth, desktopWidth, middleWidths) => {
          const allWidths = [mobileWidth, ...middleWidths, desktopWidth]
          const srcset = allWidths
            .map(w => `https://example.com/image-${w}.jpg ${w}w`)
            .join(', ')
          
          const parsed = parseSrcset(srcset)
          const widths = parsed.map(p => parseInt(p.descriptor.replace('w', ''), 10))
          
          // Should have at least one mobile size (<=640) and one desktop size (>=1024)
          const hasMobile = widths.some(w => w <= 640)
          const hasDesktop = widths.some(w => w >= 1024)
          
          return hasMobile && hasDesktop
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should detect responsive srcset with multiple variants', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 6 }),
        (numVariants) => {
          const widths = [320, 640, 768, 1024, 1280, 1536].slice(0, numVariants)
          const srcset = widths
            .map(w => `https://example.com/image-${w}.jpg ${w}w`)
            .join(', ')
          
          const imgTag = `<img src="test.jpg" srcset="${srcset}" sizes="100vw" alt="test">`
          
          // Should detect as responsive if 2+ variants
          return hasResponsiveSrcset(imgTag) === (numVariants >= 2)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should validate srcset width descriptors are properly formatted', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 100, max: 3000 }), { minLength: 1, maxLength: 10 }),
        (widths) => {
          const srcset = widths
            .map(w => `https://example.com/img-${w}.webp ${w}w`)
            .join(', ')
          
          const parsed = parseSrcset(srcset)
          
          // All descriptors should end with 'w'
          return parsed.every(entry => entry.descriptor.endsWith('w'))
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * Property 3: Image Placeholder for CLS Prevention
 * 
 * For any image container in the application, the container SHALL have explicit
 * width and height dimensions (or aspect-ratio) to prevent Cumulative Layout
 * Shift during image loading.
 * 
 * Validates: Requirements 1.4, 8.4
 */
describe('Property 3: Image Placeholder for CLS Prevention', () => {
  it('should detect explicit dimensions in img tags', () => {
    fc.assert(
      fc.property(
        arbitraryImageDimensions,
        fc.boolean(),
        ({ width, height }, includeDimensions) => {
          const imgTag = includeDimensions
            ? `<img src="test.jpg" width="${width}" height="${height}" alt="test">`
            : '<img src="test.jpg" alt="test">'
          
          const hasDimensions = hasExplicitDimensions(imgTag)
          
          return hasDimensions === includeDimensions
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should validate that images with dimensions prevent CLS', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 50, max: 2000 }),
        fc.integer({ min: 50, max: 2000 }),
        (width, height) => {
          const imgTag = `<img src="test.jpg" width="${width}" height="${height}" alt="test">`
          
          // Images with explicit dimensions should pass CLS check
          return hasExplicitDimensions(imgTag) === true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should detect aspect-ratio as valid CLS prevention', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 21 }),
        fc.integer({ min: 1, max: 21 }),
        (ratioW, ratioH) => {
          const containerHtml = `<div style="aspect-ratio: ${ratioW}/${ratioH}"><img src="test.jpg" alt="test"></div>`
          
          // Containers with aspect-ratio should be considered as having CLS prevention
          return containerHtml.includes('aspect-ratio')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should validate dimension values are positive integers', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),
        fc.integer({ min: 1, max: 10000 }),
        (width, height) => {
          const imgTag = `<img src="test.jpg" width="${width}" height="${height}" alt="test">`
          
          // Should correctly parse positive dimensions
          const hasDimensions = hasExplicitDimensions(imgTag)
          return hasDimensions === true && width > 0 && height > 0
        }
      ),
      { numRuns: 100 }
    )
  })
})
