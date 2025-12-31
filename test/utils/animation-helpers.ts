/**
 * Animation Testing Helpers
 * 
 * Feature: performance-seo-optimization
 * Requirements: 3.2, 3.3, 3.4, 10.4
 * 
 * Utilities for testing animation GPU acceleration, viewport awareness,
 * and mobile responsiveness.
 */

import * as fc from 'fast-check'

// Layout-triggering CSS properties that should NOT be animated
export const LAYOUT_TRIGGERING_PROPERTIES = [
  'width',
  'height',
  'top',
  'left',
  'right',
  'bottom',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'border-width',
  'font-size',
  'line-height',
] as const

// GPU-accelerated CSS properties that are safe to animate
export const GPU_ACCELERATED_PROPERTIES = [
  'transform',
  'opacity',
  'filter',
  'backdrop-filter',
] as const

// Properties that can be animated but may cause repaints (acceptable in some cases)
export const REPAINT_PROPERTIES = [
  'background-color',
  'background-position',
  'box-shadow',
  'color',
  'visibility',
] as const

export interface AnimationKeyframe {
  properties: Record<string, string>
}

export interface CSSAnimation {
  name: string
  keyframes: AnimationKeyframe[]
  duration?: string
  timingFunction?: string
}

export interface AnimationAnalysis {
  name: string
  usesGPUAcceleration: boolean
  layoutTriggeringProperties: string[]
  gpuAcceleratedProperties: string[]
  repaintProperties: string[]
  isOptimal: boolean
}

/**
 * Parse CSS keyframes from a CSS string
 */
export function parseKeyframes(css: string): CSSAnimation[] {
  const animations: CSSAnimation[] = []
  
  // Match @keyframes blocks
  const keyframeRegex = /@keyframes\s+['"]?([a-zA-Z0-9_-]+)['"]?\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/g
  let match
  
  while ((match = keyframeRegex.exec(css)) !== null) {
    const name = match[1]
    const content = match[2]
    const keyframes: AnimationKeyframe[] = []
    
    // Match individual keyframe blocks (0%, 50%, 100%, from, to)
    const frameRegex = /(?:from|to|\d+%)\s*\{([^}]*)\}/g
    let frameMatch
    
    while ((frameMatch = frameRegex.exec(content)) !== null) {
      const properties: Record<string, string> = {}
      const propsStr = frameMatch[1]
      
      // Parse individual properties
      const propRegex = /([a-zA-Z-]+)\s*:\s*([^;]+);?/g
      let propMatch
      
      while ((propMatch = propRegex.exec(propsStr)) !== null) {
        properties[propMatch[1].trim()] = propMatch[2].trim()
      }
      
      keyframes.push({ properties })
    }
    
    animations.push({ name, keyframes })
  }
  
  return animations
}

/**
 * Analyze a CSS animation for GPU acceleration
 */
export function analyzeAnimation(animation: CSSAnimation): AnimationAnalysis {
  const layoutTriggeringProperties: string[] = []
  const gpuAcceleratedProperties: string[] = []
  const repaintProperties: string[] = []
  
  for (const keyframe of animation.keyframes) {
    for (const prop of Object.keys(keyframe.properties)) {
      const normalizedProp = prop.toLowerCase()
      
      if (LAYOUT_TRIGGERING_PROPERTIES.includes(normalizedProp as any)) {
        if (!layoutTriggeringProperties.includes(normalizedProp)) {
          layoutTriggeringProperties.push(normalizedProp)
        }
      } else if (GPU_ACCELERATED_PROPERTIES.includes(normalizedProp as any)) {
        if (!gpuAcceleratedProperties.includes(normalizedProp)) {
          gpuAcceleratedProperties.push(normalizedProp)
        }
      } else if (REPAINT_PROPERTIES.includes(normalizedProp as any)) {
        if (!repaintProperties.includes(normalizedProp)) {
          repaintProperties.push(normalizedProp)
        }
      }
    }
  }
  
  const usesGPUAcceleration = gpuAcceleratedProperties.length > 0
  const isOptimal = layoutTriggeringProperties.length === 0 && usesGPUAcceleration
  
  return {
    name: animation.name,
    usesGPUAcceleration,
    layoutTriggeringProperties,
    gpuAcceleratedProperties,
    repaintProperties,
    isOptimal,
  }
}

/**
 * Check if an animation uses only GPU-accelerated properties
 */
export function usesOnlyGPUAcceleratedProperties(animation: CSSAnimation): boolean {
  const analysis = analyzeAnimation(animation)
  return analysis.layoutTriggeringProperties.length === 0
}

/**
 * Check if CSS contains will-change hint for a selector
 */
export function hasWillChangeHint(css: string, selector: string): boolean {
  const selectorRegex = new RegExp(
    `${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{[^}]*will-change\\s*:[^}]*\\}`,
    'i'
  )
  return selectorRegex.test(css)
}

/**
 * Check if CSS contains translateZ(0) or translate3d for GPU layer creation
 */
export function hasGPULayerHint(css: string): boolean {
  return /translateZ\s*\(\s*0\s*\)|translate3d/i.test(css)
}

/**
 * Extract all animation names from CSS
 */
export function extractAnimationNames(css: string): string[] {
  const names: string[] = []
  const regex = /@keyframes\s+['"]?([a-zA-Z0-9_-]+)['"]?/g
  let match
  
  while ((match = regex.exec(css)) !== null) {
    names.push(match[1])
  }
  
  return names
}

/**
 * Check if CSS has reduced motion media query
 */
export function hasReducedMotionSupport(css: string): boolean {
  return /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/i.test(css)
}

/**
 * Check if CSS has mobile-specific animation adjustments
 */
export function hasMobileAnimationAdjustments(css: string): boolean {
  // Check for max-width media query with animation-related properties
  const mobileMediaRegex = /@media\s*\([^)]*max-width\s*:\s*\d+px[^)]*\)\s*\{[^}]*(?:animation|transition|transform)[^}]*\}/i
  return mobileMediaRegex.test(css)
}

/**
 * Parse CSS transition property
 */
export function parseTransition(transitionValue: string): { property: string; duration: string }[] {
  const transitions: { property: string; duration: string }[] = []
  
  // Split by comma for multiple transitions
  const parts = transitionValue.split(',')
  
  for (const part of parts) {
    const trimmed = part.trim()
    const match = trimmed.match(/^([a-zA-Z-]+)\s+(\d+(?:\.\d+)?(?:ms|s))/i)
    
    if (match) {
      transitions.push({
        property: match[1],
        duration: match[2],
      })
    }
  }
  
  return transitions
}

/**
 * Check if a transition uses only GPU-accelerated properties
 */
export function transitionUsesGPUProperties(transitionValue: string): boolean {
  const transitions = parseTransition(transitionValue)
  
  if (transitions.length === 0) {
    // Check for 'all' keyword which is not optimal
    if (/\ball\b/i.test(transitionValue)) {
      return false
    }
    return true
  }
  
  return transitions.every(t => 
    GPU_ACCELERATED_PROPERTIES.includes(t.property.toLowerCase() as any) ||
    REPAINT_PROPERTIES.includes(t.property.toLowerCase() as any)
  )
}

// Arbitrary generators for property testing

/**
 * Generate arbitrary CSS animation names
 */
export const arbitraryAnimationName = fc.stringMatching(/^[a-z][a-z0-9-]*$/, { minLength: 3, maxLength: 20 })

/**
 * Generate arbitrary GPU-accelerated property
 */
export const arbitraryGPUProperty = fc.constantFrom(...GPU_ACCELERATED_PROPERTIES)

/**
 * Generate arbitrary layout-triggering property
 */
export const arbitraryLayoutProperty = fc.constantFrom(...LAYOUT_TRIGGERING_PROPERTIES)

/**
 * Generate arbitrary transform value
 */
export const arbitraryTransformValue = fc.oneof(
  fc.constant('translateY(20px)'),
  fc.constant('translateX(10px)'),
  fc.constant('scale(1.1)'),
  fc.constant('rotate(45deg)'),
  fc.constant('translateZ(0)'),
  fc.constant('translate3d(0, 0, 0)'),
  fc.tuple(fc.integer({ min: -100, max: 100 }), fc.integer({ min: -100, max: 100 }))
    .map(([x, y]) => `translate(${x}px, ${y}px)`),
)

/**
 * Generate arbitrary opacity value
 */
export const arbitraryOpacityValue = fc.float({ min: 0, max: 1 }).map(v => v.toFixed(2))

/**
 * Generate a GPU-accelerated animation keyframe
 */
export const arbitraryGPUKeyframe = fc.record({
  transform: arbitraryTransformValue,
  opacity: arbitraryOpacityValue,
}).map(props => ({ properties: props }))

/**
 * Generate a layout-triggering animation keyframe (for negative testing)
 */
export const arbitraryLayoutKeyframe = fc.record({
  width: fc.integer({ min: 50, max: 500 }).map(v => `${v}px`),
  height: fc.integer({ min: 50, max: 500 }).map(v => `${v}px`),
}).map(props => ({ properties: props }))

/**
 * Generate a complete GPU-accelerated animation
 */
export const arbitraryGPUAnimation = fc.record({
  name: arbitraryAnimationName,
  keyframes: fc.array(arbitraryGPUKeyframe, { minLength: 2, maxLength: 4 }),
})

/**
 * Generate a layout-triggering animation (for negative testing)
 */
export const arbitraryLayoutAnimation = fc.record({
  name: arbitraryAnimationName,
  keyframes: fc.array(arbitraryLayoutKeyframe, { minLength: 2, maxLength: 4 }),
})

/**
 * Viewport position relative to element
 */
export interface ViewportPosition {
  elementTop: number
  elementHeight: number
  viewportTop: number
  viewportHeight: number
}

/**
 * Check if element is visible in viewport
 */
export function isElementInViewport(position: ViewportPosition): boolean {
  const elementBottom = position.elementTop + position.elementHeight
  const viewportBottom = position.viewportTop + position.viewportHeight
  
  return (
    position.elementTop < viewportBottom &&
    elementBottom > position.viewportTop
  )
}

/**
 * Generate arbitrary viewport position
 */
export const arbitraryViewportPosition = fc.record({
  elementTop: fc.integer({ min: 0, max: 5000 }),
  elementHeight: fc.integer({ min: 50, max: 500 }),
  viewportTop: fc.integer({ min: 0, max: 4000 }),
  viewportHeight: fc.integer({ min: 300, max: 1200 }),
})

/**
 * Generate viewport width for mobile testing
 */
export const arbitraryMobileViewportWidth = fc.integer({ min: 320, max: 767 })

/**
 * Generate viewport width for desktop testing
 */
export const arbitraryDesktopViewportWidth = fc.integer({ min: 768, max: 2560 })
