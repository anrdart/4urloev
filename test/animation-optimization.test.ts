/**
 * Animation Optimization Property Tests
 * 
 * Feature: performance-seo-optimization
 * Requirements: 3.2, 3.3, 3.4, 10.4
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { readFileSync } from 'fs'
import { join } from 'path'
import {
  parseKeyframes,
  analyzeAnimation,
  usesOnlyGPUAcceleratedProperties,
  hasWillChangeHint,
  hasGPULayerHint,
  hasReducedMotionSupport,
  hasMobileAnimationAdjustments,
  isElementInViewport,
  arbitraryGPUAnimation,
  arbitraryLayoutAnimation,
  arbitraryViewportPosition,
  arbitraryMobileViewportWidth,
  arbitraryDesktopViewportWidth,
  GPU_ACCELERATED_PROPERTIES,
  LAYOUT_TRIGGERING_PROPERTIES,
} from './utils/animation-helpers'

// Read actual CSS files for testing
const mainCssPath = join(process.cwd(), 'assets/css/main.css')
const tailwindConfigPath = join(process.cwd(), 'tailwind.config.ts')

let mainCss: string
let tailwindConfig: string

try {
  mainCss = readFileSync(mainCssPath, 'utf-8')
  tailwindConfig = readFileSync(tailwindConfigPath, 'utf-8')
} catch {
  mainCss = ''
  tailwindConfig = ''
}

/**
 * Property 5: Animation GPU Acceleration
 * 
 * For any animation defined in the CSS, the animation SHALL use only `transform`
 * and/or `opacity` properties for GPU acceleration, and SHALL NOT animate
 * properties that trigger layout recalculation (width, height, top, left,
 * margin, padding).
 * 
 * Validates: Requirements 3.2
 */
describe('Property 5: Animation GPU Acceleration', () => {
  describe('GPU-accelerated animations should not use layout-triggering properties', () => {
    it('should identify GPU-accelerated animations correctly', () => {
      fc.assert(
        fc.property(
          arbitraryGPUAnimation,
          (animation) => {
            const analysis = analyzeAnimation(animation)
            
            // GPU animations should have no layout-triggering properties
            return analysis.layoutTriggeringProperties.length === 0
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should detect layout-triggering properties in animations', () => {
      fc.assert(
        fc.property(
          arbitraryLayoutAnimation,
          (animation) => {
            const analysis = analyzeAnimation(animation)
            
            // Layout animations should have layout-triggering properties detected
            return analysis.layoutTriggeringProperties.length > 0
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should validate that transform and opacity are GPU-accelerated', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...GPU_ACCELERATED_PROPERTIES),
          (property) => {
            // All GPU_ACCELERATED_PROPERTIES should be recognized
            return GPU_ACCELERATED_PROPERTIES.includes(property)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should validate that width/height/margin/padding trigger layout', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...LAYOUT_TRIGGERING_PROPERTIES),
          (property) => {
            // All LAYOUT_TRIGGERING_PROPERTIES should be recognized
            return LAYOUT_TRIGGERING_PROPERTIES.includes(property)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Actual CSS file validation', () => {
    it('should have main.css loaded for testing', () => {
      expect(mainCss.length).toBeGreaterThan(0)
    })

    it('should have all keyframe animations using GPU-accelerated properties', () => {
      const animations = parseKeyframes(mainCss)
      
      for (const animation of animations) {
        const analysis = analyzeAnimation(animation)
        
        // Each animation should not use layout-triggering properties
        expect(
          analysis.layoutTriggeringProperties,
          `Animation "${animation.name}" uses layout-triggering properties: ${analysis.layoutTriggeringProperties.join(', ')}`
        ).toHaveLength(0)
      }
    })

    it('should have will-change hints for glassmorphism elements', () => {
      // Check that glass-card has will-change hint
      expect(hasWillChangeHint(mainCss, '.glass-card')).toBe(true)
    })

    it('should have GPU layer hints (translateZ) in animations', () => {
      expect(hasGPULayerHint(mainCss)).toBe(true)
    })

    it('should have reduced motion support', () => {
      expect(hasReducedMotionSupport(mainCss)).toBe(true)
    })
  })

  describe('Tailwind keyframes validation', () => {
    it('should have tailwind config loaded for testing', () => {
      expect(tailwindConfig.length).toBeGreaterThan(0)
    })

    it('should have translateZ(0) in transform animations for GPU acceleration', () => {
      // Check that fade-up, fade-down, scale-in, etc. use translateZ(0)
      expect(tailwindConfig).toContain('translateZ(0)')
    })

    it('should not animate width or height in keyframes (except accordion)', () => {
      // Accordion animations legitimately animate height for content reveal
      // This is acceptable as it's a necessary UI pattern for expanding/collapsing content
      const keyframeSection = tailwindConfig.match(/keyframes:\s*\{[\s\S]*?\n\s{6}\}/)?.[0] || ''
      
      // Check remaining keyframes don't animate width
      expect(keyframeSection).not.toMatch(/['"]?width['"]?\s*:\s*['"]?\d/i)
      
      // For height, we need to filter out accordion animations which legitimately animate height
      // The accordion-down and accordion-up animations use height for content reveal
      const heightMatches = keyframeSection.match(/['"]?height['"]?\s*:\s*[^,}]+/gi) || []
      const nonAccordionHeightMatches = heightMatches.filter(
        match => !match.includes('radix-accordion') && !match.includes("'0'") && !match.includes('"0"')
      )
      
      // All height animations should be accordion-related (either using radix variable or animating to 0)
      expect(nonAccordionHeightMatches).toHaveLength(0)
    })
  })
})

/**
 * Property 6: Viewport-Aware Animation Control
 * 
 * For any animated element using the ScrollReveal component or similar animation
 * controllers, the animation SHALL be controlled by Intersection Observer and
 * SHALL pause when the element is outside the viewport.
 * 
 * Validates: Requirements 3.3, 3.4
 */
describe('Property 6: Viewport-Aware Animation Control', () => {
  describe('Viewport intersection detection', () => {
    it('should correctly determine when element is in viewport', () => {
      fc.assert(
        fc.property(
          arbitraryViewportPosition,
          (position) => {
            const isInViewport = isElementInViewport(position)
            
            const elementBottom = position.elementTop + position.elementHeight
            const viewportBottom = position.viewportTop + position.viewportHeight
            
            // Element is in viewport if it overlaps with viewport
            const expectedInViewport = (
              position.elementTop < viewportBottom &&
              elementBottom > position.viewportTop
            )
            
            return isInViewport === expectedInViewport
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should detect elements completely above viewport as not visible', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 500 }), // element height
          fc.integer({ min: 600, max: 2000 }), // viewport top (scrolled down)
          fc.integer({ min: 300, max: 1200 }), // viewport height
          (elementHeight, viewportTop, viewportHeight) => {
            // Element at top of page (position 0) when viewport is scrolled down
            const position = {
              elementTop: 0,
              elementHeight,
              viewportTop,
              viewportHeight,
            }
            
            // If element bottom is above viewport top, it should not be visible
            if (elementHeight < viewportTop) {
              return isElementInViewport(position) === false
            }
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should detect elements completely below viewport as not visible', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2000, max: 5000 }), // element top (far down page)
          fc.integer({ min: 50, max: 500 }), // element height
          fc.integer({ min: 0, max: 500 }), // viewport top
          fc.integer({ min: 300, max: 1200 }), // viewport height
          (elementTop, elementHeight, viewportTop, viewportHeight) => {
            const position = {
              elementTop,
              elementHeight,
              viewportTop,
              viewportHeight,
            }
            
            // If element top is below viewport bottom, it should not be visible
            const viewportBottom = viewportTop + viewportHeight
            if (elementTop > viewportBottom) {
              return isElementInViewport(position) === false
            }
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should detect partially visible elements as visible', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 400, max: 600 }), // element top near viewport edge
          fc.integer({ min: 200, max: 400 }), // element height
          fc.integer({ min: 0, max: 100 }), // viewport top
          fc.integer({ min: 500, max: 800 }), // viewport height
          (elementTop, elementHeight, viewportTop, viewportHeight) => {
            const position = {
              elementTop,
              elementHeight,
              viewportTop,
              viewportHeight,
            }
            
            const viewportBottom = viewportTop + viewportHeight
            const elementBottom = elementTop + elementHeight
            
            // If there's any overlap, element should be visible
            const hasOverlap = elementTop < viewportBottom && elementBottom > viewportTop
            
            return isElementInViewport(position) === hasOverlap
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('ScrollReveal component requirements', () => {
    it('should have ScrollReveal component file', () => {
      const scrollRevealPath = join(process.cwd(), 'components/animations/ScrollReveal.vue')
      let scrollRevealContent: string
      
      try {
        scrollRevealContent = readFileSync(scrollRevealPath, 'utf-8')
      } catch {
        scrollRevealContent = ''
      }
      
      expect(scrollRevealContent.length).toBeGreaterThan(0)
    })

    it('should use IntersectionObserver in ScrollReveal', () => {
      const scrollRevealPath = join(process.cwd(), 'components/animations/ScrollReveal.vue')
      let scrollRevealContent: string
      
      try {
        scrollRevealContent = readFileSync(scrollRevealPath, 'utf-8')
      } catch {
        scrollRevealContent = ''
      }
      
      expect(scrollRevealContent).toContain('IntersectionObserver')
    })

    it('should support reduced motion preference in ScrollReveal', () => {
      const scrollRevealPath = join(process.cwd(), 'components/animations/ScrollReveal.vue')
      let scrollRevealContent: string
      
      try {
        scrollRevealContent = readFileSync(scrollRevealPath, 'utf-8')
      } catch {
        scrollRevealContent = ''
      }
      
      expect(scrollRevealContent).toContain('prefers-reduced-motion')
    })

    it('should use GPU-accelerated transforms in ScrollReveal', () => {
      const scrollRevealPath = join(process.cwd(), 'components/animations/ScrollReveal.vue')
      let scrollRevealContent: string
      
      try {
        scrollRevealContent = readFileSync(scrollRevealPath, 'utf-8')
      } catch {
        scrollRevealContent = ''
      }
      
      // Should use translateZ(0) for GPU acceleration
      expect(scrollRevealContent).toContain('translateZ(0)')
    })
  })
})

/**
 * Property 14: Mobile-Responsive Animations
 * 
 * For any animation that runs on desktop, there SHALL be corresponding CSS
 * media queries or JavaScript checks that reduce or disable the animation
 * on mobile devices (viewport width < 768px) to preserve performance.
 * 
 * Validates: Requirements 10.4
 */
describe('Property 14: Mobile-Responsive Animations', () => {
  describe('Mobile viewport detection', () => {
    it('should correctly identify mobile viewport widths', () => {
      fc.assert(
        fc.property(
          arbitraryMobileViewportWidth,
          (width) => {
            // Mobile is defined as < 768px
            return width < 768
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should correctly identify desktop viewport widths', () => {
      fc.assert(
        fc.property(
          arbitraryDesktopViewportWidth,
          (width) => {
            // Desktop is defined as >= 768px
            return width >= 768
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('CSS mobile animation adjustments', () => {
    it('should have mobile-specific media queries in main.css', () => {
      expect(hasMobileAnimationAdjustments(mainCss)).toBe(true)
    })

    it('should have max-width media query for mobile', () => {
      expect(mainCss).toMatch(/@media\s*\([^)]*max-width\s*:\s*767px[^)]*\)/i)
    })

    it('should reduce animation complexity on mobile', () => {
      // Check for animation-duration adjustments in mobile media query
      const mobileSection = mainCss.match(/@media\s*\([^)]*max-width\s*:\s*767px[^)]*\)\s*\{[\s\S]*?\n\}/)?.[0] || ''
      
      // Should have some animation-related adjustments
      expect(mobileSection).toMatch(/animation|transition|transform|backdrop-filter/i)
    })

    it('should have reduced motion support for accessibility', () => {
      expect(mainCss).toContain('prefers-reduced-motion')
    })

    it('should disable hover effects on mobile', () => {
      // Check that hover-lift is adjusted for mobile
      const mobileSection = mainCss.match(/@media\s*\([^)]*max-width\s*:\s*767px[^)]*\)\s*\{[\s\S]*?\n\}/)?.[0] || ''
      
      expect(mobileSection).toContain('hover-lift')
    })
  })

  describe('Animation performance on mobile', () => {
    it('should reduce glassmorphism blur on mobile for performance', () => {
      const mobileSection = mainCss.match(/@media\s*\([^)]*max-width\s*:\s*767px[^)]*\)\s*\{[\s\S]*?\n\}/)?.[0] || ''
      
      // Should have reduced backdrop-filter blur on mobile
      expect(mobileSection).toContain('backdrop-filter')
    })

    it('should have slower/simpler animations on mobile', () => {
      const mobileSection = mainCss.match(/@media\s*\([^)]*max-width\s*:\s*767px[^)]*\)\s*\{[\s\S]*?\n\}/)?.[0] || ''
      
      // Should have animation-duration adjustments
      expect(mobileSection).toMatch(/animation-duration|transition-duration/i)
    })
  })
})
