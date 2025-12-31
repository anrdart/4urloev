/**
 * Script Optimization Test Helpers
 * Utilities for testing third-party script deferral
 * 
 * Feature: performance-seo-optimization
 * Requirements: 2.4
 */

import * as fc from 'fast-check'

/**
 * List of known third-party domains that should have deferred loading
 */
export const THIRD_PARTY_DOMAINS = [
  'stripe.com',
  'js.stripe.com',
  'google-analytics.com',
  'googletagmanager.com',
  'facebook.net',
  'connect.facebook.net',
  'platform.twitter.com',
  'cdn.jsdelivr.net',
  'unpkg.com',
  'cdnjs.cloudflare.com',
]

/**
 * List of critical inline script patterns that should NOT be deferred
 */
export const CRITICAL_SCRIPT_PATTERNS = [
  'nuxt',
  '__NUXT__',
  'window.__NUXT__',
  'data-n-head',
]

/**
 * Interface for parsed script tag attributes
 */
export interface ScriptAttributes {
  src?: string
  async?: boolean
  defer?: boolean
  type?: string
  id?: string
  inline?: boolean
  content?: string
}

/**
 * Extract all script tags from HTML
 */
export function extractAllScripts(html: string): string[] {
  const scriptRegex = /<script[^>]*>[\s\S]*?<\/script>|<script[^>]*\/>/gi
  return html.match(scriptRegex) || []
}

/**
 * Parse script tag attributes
 */
export function parseScriptAttributes(scriptTag: string): ScriptAttributes {
  const srcMatch = scriptTag.match(/src=["']([^"']+)["']/)
  const asyncMatch = scriptTag.match(/\basync\b/)
  const deferMatch = scriptTag.match(/\bdefer\b/)
  const typeMatch = scriptTag.match(/type=["']([^"']+)["']/)
  const idMatch = scriptTag.match(/id=["']([^"']+)["']/)
  
  // Check if it's an inline script (has content between tags, including whitespace)
  const contentMatch = scriptTag.match(/<script[^>]*>([\s\S]*)<\/script>/i)
  const content = contentMatch ? contentMatch[1] : undefined
  // A script is inline if it has no src AND has any content (including whitespace)
  const inline = !srcMatch && content !== undefined && content.length > 0

  return {
    src: srcMatch ? srcMatch[1] : undefined,
    async: !!asyncMatch,
    defer: !!deferMatch,
    type: typeMatch ? typeMatch[1] : undefined,
    id: idMatch ? idMatch[1] : undefined,
    inline,
    content: content?.trim() || undefined,
  }
}

/**
 * Check if a script is from a third-party domain
 */
export function isThirdPartyScript(src: string): boolean {
  if (!src) return false
  return THIRD_PARTY_DOMAINS.some(domain => src.includes(domain))
}

/**
 * Check if a script is a critical inline script that should not be deferred
 */
export function isCriticalInlineScript(scriptTag: string): boolean {
  const attrs = parseScriptAttributes(scriptTag)
  
  // External scripts are not inline
  if (attrs.src) return false
  
  // Check if content contains critical patterns
  if (attrs.content) {
    return CRITICAL_SCRIPT_PATTERNS.some(pattern => 
      attrs.content!.includes(pattern)
    )
  }
  
  return false
}

/**
 * Check if a script has defer or async attribute
 */
export function hasScriptDeferral(scriptTag: string): boolean {
  const attrs = parseScriptAttributes(scriptTag)
  return attrs.defer || attrs.async
}

/**
 * Check if a third-party script is properly deferred
 * Returns true if:
 * - Script is not from a third-party domain (not applicable)
 * - Script is from third-party and has defer or async
 */
export function isProperlyDeferred(scriptTag: string): boolean {
  const attrs = parseScriptAttributes(scriptTag)
  
  // Inline scripts don't need deferral
  if (attrs.inline) return true
  
  // No src means inline script
  if (!attrs.src) return true
  
  // Check if it's a third-party script
  if (!isThirdPartyScript(attrs.src)) {
    // First-party scripts don't need to be deferred
    return true
  }
  
  // Third-party scripts should have defer or async
  return attrs.defer || attrs.async
}

/**
 * Validate all scripts in HTML are properly deferred
 */
export function validateScriptDeferral(html: string): {
  valid: boolean
  violations: string[]
  totalScripts: number
  thirdPartyScripts: number
  deferredScripts: number
} {
  const scripts = extractAllScripts(html)
  const violations: string[] = []
  let thirdPartyCount = 0
  let deferredCount = 0

  scripts.forEach(script => {
    const attrs = parseScriptAttributes(script)
    
    if (attrs.src && isThirdPartyScript(attrs.src)) {
      thirdPartyCount++
      
      if (attrs.defer || attrs.async) {
        deferredCount++
      } else {
        violations.push(attrs.src)
      }
    }
  })

  return {
    valid: violations.length === 0,
    violations,
    totalScripts: scripts.length,
    thirdPartyScripts: thirdPartyCount,
    deferredScripts: deferredCount,
  }
}

/**
 * Generate a script tag with given attributes
 */
export function generateScriptTag(options: {
  src?: string
  defer?: boolean
  async?: boolean
  type?: string
  content?: string
}): string {
  const attrs: string[] = []
  
  if (options.src) attrs.push(`src="${options.src}"`)
  if (options.defer) attrs.push('defer')
  if (options.async) attrs.push('async')
  if (options.type) attrs.push(`type="${options.type}"`)
  
  const attrString = attrs.length > 0 ? ' ' + attrs.join(' ') : ''
  
  if (options.content) {
    return `<script${attrString}>${options.content}</script>`
  }
  
  return `<script${attrString}></script>`
}

// Fast-check arbitraries for property testing

/**
 * Arbitrary for generating third-party script URLs
 */
export const arbitraryThirdPartyUrl = fc.constantFrom(...THIRD_PARTY_DOMAINS)
  .map(domain => `https://${domain}/script.js`)

/**
 * Arbitrary for generating first-party script URLs
 */
export const arbitraryFirstPartyUrl = fc.stringMatching(/^[a-z0-9-]+$/, { minLength: 1, maxLength: 20 })
  .map(path => `/_nuxt/${path}.js`)

/**
 * Arbitrary for generating script tags
 */
export const arbitraryScriptTag = fc.record({
  src: fc.option(fc.oneof(arbitraryThirdPartyUrl, arbitraryFirstPartyUrl)),
  defer: fc.boolean(),
  async: fc.boolean(),
  content: fc.option(fc.string({ minLength: 0, maxLength: 100 })),
}).map(opts => {
  if (opts.src) {
    return generateScriptTag({
      src: opts.src,
      defer: opts.defer,
      async: opts.async,
    })
  }
  return generateScriptTag({
    content: opts.content || '',
  })
})
