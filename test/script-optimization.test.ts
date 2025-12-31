/**
 * Script Optimization Property Tests
 * 
 * Feature: performance-seo-optimization
 * Property 4: Third-Party Script Deferral
 * Validates: Requirements 2.4
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  parseScriptAttributes,
  isThirdPartyScript,
  hasScriptDeferral,
  isProperlyDeferred,
  validateScriptDeferral,
  generateScriptTag,
  extractAllScripts,
  isCriticalInlineScript,
  THIRD_PARTY_DOMAINS,
  arbitraryThirdPartyUrl,
  arbitraryFirstPartyUrl,
} from './utils/script-helpers'

/**
 * Property 4: Third-Party Script Deferral
 * 
 * For any third-party script loaded in the application (excluding critical inline scripts),
 * the script tag SHALL have either `defer` or `async` attribute to prevent render blocking.
 * 
 * Validates: Requirements 2.4
 */
describe('Property 4: Third-Party Script Deferral', () => {
  describe('Script attribute parsing', () => {
    it('should correctly parse script tags with defer attribute', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[a-z0-9-]+$/, { minLength: 1, maxLength: 30 }),
          (filename) => {
            const scriptTag = `<script src="https://example.com/${filename}.js" defer></script>`
            const attrs = parseScriptAttributes(scriptTag)
            
            return attrs.defer === true && attrs.src?.includes(filename)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should correctly parse script tags with async attribute', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[a-z0-9-]+$/, { minLength: 1, maxLength: 30 }),
          (filename) => {
            const scriptTag = `<script src="https://example.com/${filename}.js" async></script>`
            const attrs = parseScriptAttributes(scriptTag)
            
            return attrs.async === true && attrs.src?.includes(filename)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should correctly identify inline scripts', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          (content) => {
            // Escape any script-breaking characters
            const safeContent = content.replace(/</g, '&lt;').replace(/>/g, '&gt;')
            const scriptTag = `<script>${safeContent}</script>`
            const attrs = parseScriptAttributes(scriptTag)
            
            return attrs.inline === true && attrs.src === undefined
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Third-party script detection', () => {
    it('should identify all known third-party domains', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...THIRD_PARTY_DOMAINS),
          (domain) => {
            const url = `https://${domain}/some-script.js`
            return isThirdPartyScript(url) === true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should not identify first-party scripts as third-party', () => {
      fc.assert(
        fc.property(
          arbitraryFirstPartyUrl,
          (url) => {
            return isThirdPartyScript(url) === false
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should handle various URL formats for third-party detection', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...THIRD_PARTY_DOMAINS),
          fc.stringMatching(/^[a-z0-9-]+$/, { minLength: 1, maxLength: 20 }),
          fc.constantFrom('http', 'https'),
          (domain, path, protocol) => {
            const url = `${protocol}://${domain}/${path}.js`
            return isThirdPartyScript(url) === true
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Script deferral validation', () => {
    it('should validate that third-party scripts with defer are properly deferred', () => {
      fc.assert(
        fc.property(
          arbitraryThirdPartyUrl,
          (url) => {
            const scriptTag = generateScriptTag({ src: url, defer: true })
            return isProperlyDeferred(scriptTag) === true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should validate that third-party scripts with async are properly deferred', () => {
      fc.assert(
        fc.property(
          arbitraryThirdPartyUrl,
          (url) => {
            const scriptTag = generateScriptTag({ src: url, async: true })
            return isProperlyDeferred(scriptTag) === true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should flag third-party scripts without defer/async as violations', () => {
      fc.assert(
        fc.property(
          arbitraryThirdPartyUrl,
          (url) => {
            const scriptTag = generateScriptTag({ src: url, defer: false, async: false })
            return isProperlyDeferred(scriptTag) === false
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should allow first-party scripts without defer/async', () => {
      fc.assert(
        fc.property(
          arbitraryFirstPartyUrl,
          (url) => {
            const scriptTag = generateScriptTag({ src: url, defer: false, async: false })
            // First-party scripts don't need deferral
            return isProperlyDeferred(scriptTag) === true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should allow inline scripts without defer/async', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (content) => {
            const safeContent = content.replace(/</g, '').replace(/>/g, '')
            const scriptTag = generateScriptTag({ content: safeContent })
            // Inline scripts don't need deferral
            return isProperlyDeferred(scriptTag) === true
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('HTML document validation', () => {
    it('should validate HTML with all third-party scripts properly deferred', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom(...THIRD_PARTY_DOMAINS), { minLength: 1, maxLength: 5 }),
          (domains) => {
            const scripts = domains.map(domain => 
              generateScriptTag({ src: `https://${domain}/script.js`, defer: true })
            )
            const html = `<html><head>${scripts.join('\n')}</head><body></body></html>`
            
            const result = validateScriptDeferral(html)
            return result.valid === true && result.violations.length === 0
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should detect violations when third-party scripts lack defer/async', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...THIRD_PARTY_DOMAINS),
          (domain) => {
            const script = generateScriptTag({ src: `https://${domain}/script.js` })
            const html = `<html><head>${script}</head><body></body></html>`
            
            const result = validateScriptDeferral(html)
            return result.valid === false && result.violations.length > 0
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should correctly count third-party and deferred scripts', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          fc.integer({ min: 0, max: 5 }),
          (deferredCount, nonDeferredCount) => {
            const deferredScripts = Array(deferredCount).fill(null).map((_, i) => 
              generateScriptTag({ src: `https://js.stripe.com/script${i}.js`, defer: true })
            )
            const nonDeferredScripts = Array(nonDeferredCount).fill(null).map((_, i) => 
              generateScriptTag({ src: `https://google-analytics.com/script${i}.js` })
            )
            
            const html = `<html><head>${[...deferredScripts, ...nonDeferredScripts].join('\n')}</head></html>`
            const result = validateScriptDeferral(html)
            
            return (
              result.thirdPartyScripts === deferredCount + nonDeferredCount &&
              result.deferredScripts === deferredCount &&
              result.violations.length === nonDeferredCount
            )
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Edge cases', () => {
    it('should handle empty HTML documents', () => {
      const result = validateScriptDeferral('')
      expect(result.valid).toBe(true)
      expect(result.totalScripts).toBe(0)
    })

    it('should handle HTML with no scripts', () => {
      const html = '<html><head><title>Test</title></head><body><p>Content</p></body></html>'
      const result = validateScriptDeferral(html)
      expect(result.valid).toBe(true)
      expect(result.totalScripts).toBe(0)
    })

    it('should handle scripts with both defer and async', () => {
      const script = '<script src="https://js.stripe.com/v3" defer async></script>'
      const attrs = parseScriptAttributes(script)
      expect(attrs.defer).toBe(true)
      expect(attrs.async).toBe(true)
      expect(isProperlyDeferred(script)).toBe(true)
    })

    it('should handle scripts with type="module" (implicitly deferred)', () => {
      const script = '<script type="module" src="https://js.stripe.com/v3"></script>'
      const attrs = parseScriptAttributes(script)
      expect(attrs.type).toBe('module')
      // Note: type="module" scripts are deferred by default in browsers
      // but our validation checks for explicit defer/async attributes
    })
  })
})
