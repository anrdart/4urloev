/**
 * SEO Meta Tags Property Tests
 * 
 * Feature: performance-seo-optimization
 * Requirements: 5.1, 5.2, 5.3, 5.4, 7.3
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  extractTitle,
  extractMetaTags,
  extractOpenGraphTags,
  extractTwitterCardTags,
  extractCanonicalUrl,
  hasRequiredSeoTags,
} from './utils/seo-helpers'

// Safe arbitrary generators that avoid HTML-breaking characters
const safePageTitle = fc.stringMatching(/^[a-zA-Z0-9\s\-_]+$/, { minLength: 1, maxLength: 60 })
  .filter(s => s.trim().length > 0)

const safeMetaDescription = fc.stringMatching(/^[a-zA-Z0-9\s\-_.,!?]+$/, { minLength: 50, maxLength: 160 })
  .filter(s => s.trim().length >= 50)

const safeProductName = fc.stringMatching(/^[a-zA-Z0-9\s\-_]+$/, { minLength: 1, maxLength: 100 })
  .filter(s => s.trim().length > 0)

const safeUrl = fc.tuple(
  fc.constantFrom('http', 'https'),
  fc.stringMatching(/^[a-z0-9]+$/, { minLength: 1, maxLength: 10 }),
  fc.constantFrom('.com', '.org', '.net', '.io'),
  fc.stringMatching(/^\/[a-z0-9\-\/]*$/, { minLength: 0, maxLength: 20 })
).map(([protocol, domain, tld, path]) => `${protocol}://${domain}${tld}${path}`)

const safePrice = fc.integer({ min: 100, max: 9999900 })

const safeCurrency = fc.constantFrom('IDR', 'USD', 'EUR', 'GBP')

const safeAvailability = fc.constantFrom(
  'https://schema.org/InStock',
  'https://schema.org/OutOfStock',
  'https://schema.org/PreOrder'
)

/**
 * Property 9: SEO Meta Tags Completeness
 * 
 * For any page in the application, the rendered HTML SHALL include:
 * - A unique `<title>` tag
 * - A `<meta name="description">` tag with page-specific content
 * - Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`)
 * - Twitter Card tags (`twitter:card`, `twitter:title`, `twitter:description`)
 * 
 * Validates: Requirements 5.1, 5.2, 5.3
 */
describe('Property 9: SEO Meta Tags Completeness', () => {
  it('should validate that HTML with all required SEO tags passes completeness check', () => {
    fc.assert(
      fc.property(
        safePageTitle,
        safeMetaDescription,
        safeUrl,
        safeUrl,
        (title, description, imageUrl, pageUrl) => {
          const html = `
            <!DOCTYPE html>
            <html>
              <head>
                <title>${title}</title>
                <meta name="description" content="${description}">
                <meta property="og:title" content="${title}">
                <meta property="og:description" content="${description}">
                <meta property="og:image" content="${imageUrl}">
                <meta property="og:url" content="${pageUrl}">
                <meta name="twitter:card" content="summary_large_image">
                <meta name="twitter:title" content="${title}">
                <meta name="twitter:description" content="${description}">
              </head>
              <body></body>
            </html>
          `
          
          const result = hasRequiredSeoTags(html)
          return result.valid === true && result.missing.length === 0
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should detect missing title tag', () => {
    fc.assert(
      fc.property(
        safeMetaDescription,
        safeUrl,
        (description, url) => {
          const html = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta name="description" content="${description}">
                <meta property="og:title" content="Title">
                <meta property="og:description" content="${description}">
                <meta property="og:image" content="${url}">
                <meta property="og:url" content="${url}">
                <meta name="twitter:card" content="summary">
                <meta name="twitter:title" content="Title">
                <meta name="twitter:description" content="${description}">
              </head>
            </html>
          `
          
          const result = hasRequiredSeoTags(html)
          return result.missing.includes('title')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should detect missing meta description', () => {
    fc.assert(
      fc.property(
        safePageTitle,
        safeUrl,
        (title, url) => {
          const html = `
            <!DOCTYPE html>
            <html>
              <head>
                <title>${title}</title>
                <meta property="og:title" content="${title}">
                <meta property="og:description" content="OG Description">
                <meta property="og:image" content="${url}">
                <meta property="og:url" content="${url}">
                <meta name="twitter:card" content="summary">
                <meta name="twitter:title" content="${title}">
                <meta name="twitter:description" content="Twitter Description">
              </head>
            </html>
          `
          
          const result = hasRequiredSeoTags(html)
          return result.missing.includes('meta description')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should detect missing Open Graph tags', () => {
    fc.assert(
      fc.property(
        safePageTitle,
        safeMetaDescription,
        (title, description) => {
          const html = `
            <!DOCTYPE html>
            <html>
              <head>
                <title>${title}</title>
                <meta name="description" content="${description}">
                <meta name="twitter:card" content="summary">
                <meta name="twitter:title" content="${title}">
                <meta name="twitter:description" content="${description}">
              </head>
            </html>
          `
          
          const result = hasRequiredSeoTags(html)
          return result.missing.some(m => m.startsWith('og:'))
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should detect missing Twitter Card tags', () => {
    fc.assert(
      fc.property(
        safePageTitle,
        safeMetaDescription,
        safeUrl,
        (title, description, url) => {
          const html = `
            <!DOCTYPE html>
            <html>
              <head>
                <title>${title}</title>
                <meta name="description" content="${description}">
                <meta property="og:title" content="${title}">
                <meta property="og:description" content="${description}">
                <meta property="og:image" content="${url}">
                <meta property="og:url" content="${url}">
              </head>
            </html>
          `
          
          const result = hasRequiredSeoTags(html)
          return result.missing.some(m => m.startsWith('twitter:'))
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should correctly extract Open Graph tags from valid HTML', () => {
    fc.assert(
      fc.property(
        safePageTitle,
        safeMetaDescription,
        safeUrl,
        safeUrl,
        (title, description, imageUrl, pageUrl) => {
          const html = `
            <meta property="og:title" content="${title}">
            <meta property="og:description" content="${description}">
            <meta property="og:image" content="${imageUrl}">
            <meta property="og:url" content="${pageUrl}">
            <meta property="og:type" content="website">
          `
          
          const ogTags = extractOpenGraphTags(html)
          
          return (
            ogTags.title === title &&
            ogTags.description === description &&
            ogTags.image === imageUrl &&
            ogTags.url === pageUrl
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should correctly extract Twitter Card tags from valid HTML', () => {
    fc.assert(
      fc.property(
        safePageTitle,
        safeMetaDescription,
        safeUrl,
        fc.constantFrom('summary', 'summary_large_image', 'app', 'player'),
        (title, description, imageUrl, cardType) => {
          const html = `
            <meta name="twitter:card" content="${cardType}">
            <meta name="twitter:title" content="${title}">
            <meta name="twitter:description" content="${description}">
            <meta name="twitter:image" content="${imageUrl}">
          `
          
          const twitterTags = extractTwitterCardTags(html)
          
          return (
            twitterTags.card === cardType &&
            twitterTags.title === title &&
            twitterTags.description === description &&
            twitterTags.image === imageUrl
          )
        }
      ),
      { numRuns: 100 }
    )
  })
})


/**
 * Property 10: Product Page SEO Enhancement
 * 
 * For any product detail page, the rendered HTML SHALL include product-specific
 * meta tags including `product:price:amount`, `product:price:currency`, and
 * `product:availability`.
 * 
 * Validates: Requirements 5.4
 */
describe('Property 10: Product Page SEO Enhancement', () => {
  it('should validate product meta tags are present and correctly formatted', () => {
    fc.assert(
      fc.property(
        safeProductName,
        safePrice,
        safeCurrency,
        safeAvailability,
        (name, price, currency, availability) => {
          const html = `
            <!DOCTYPE html>
            <html>
              <head>
                <title>${name} - 4UrLoev</title>
                <meta name="description" content="Buy ${name} at 4UrLoev">
                <meta property="og:type" content="product">
                <meta property="product:price:amount" content="${price}">
                <meta property="product:price:currency" content="${currency}">
                <meta property="product:availability" content="${availability}">
              </head>
            </html>
          `
          
          const tags = extractMetaTags(html)
          
          const hasPriceAmount = tags.some(
            t => t.property === 'product:price:amount' && t.content === String(price)
          )
          const hasPriceCurrency = tags.some(
            t => t.property === 'product:price:currency' && t.content === currency
          )
          const hasAvailability = tags.some(
            t => t.property === 'product:availability' && t.content === availability
          )
          
          return hasPriceAmount && hasPriceCurrency && hasAvailability
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should detect missing product price meta tag', () => {
    fc.assert(
      fc.property(
        safeProductName,
        safeCurrency,
        safeAvailability,
        (name, currency, availability) => {
          const html = `
            <!DOCTYPE html>
            <html>
              <head>
                <title>${name} - 4UrLoev</title>
                <meta property="product:price:currency" content="${currency}">
                <meta property="product:availability" content="${availability}">
              </head>
            </html>
          `
          
          const tags = extractMetaTags(html)
          const hasPriceAmount = tags.some(t => t.property === 'product:price:amount')
          
          return hasPriceAmount === false
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should validate price is a valid positive number', () => {
    fc.assert(
      fc.property(
        safePrice,
        (price) => {
          const html = `<meta property="product:price:amount" content="${price}">`
          const tags = extractMetaTags(html)
          const priceTag = tags.find(t => t.property === 'product:price:amount')
          
          if (!priceTag) return false
          
          const parsedPrice = parseFloat(priceTag.content)
          return !isNaN(parsedPrice) && parsedPrice >= 0
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should validate currency is a valid ISO code', () => {
    fc.assert(
      fc.property(
        safeCurrency,
        (currency) => {
          const html = `<meta property="product:price:currency" content="${currency}">`
          const tags = extractMetaTags(html)
          const currencyTag = tags.find(t => t.property === 'product:price:currency')
          
          if (!currencyTag) return false
          
          // Currency should be 3 uppercase letters (ISO 4217)
          return /^[A-Z]{3}$/.test(currencyTag.content)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should validate availability uses schema.org format', () => {
    fc.assert(
      fc.property(
        safeAvailability,
        (availability) => {
          const html = `<meta property="product:availability" content="${availability}">`
          const tags = extractMetaTags(html)
          const availabilityTag = tags.find(t => t.property === 'product:availability')
          
          if (!availabilityTag) return false
          
          // Should be a valid schema.org availability URL
          const validAvailabilities = [
            'https://schema.org/InStock',
            'https://schema.org/OutOfStock',
            'https://schema.org/PreOrder',
          ]
          
          return validAvailabilities.includes(availabilityTag.content)
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * Property 11: Canonical URL Presence
 * 
 * For any page in the application, the rendered HTML SHALL include a
 * `<link rel="canonical">` tag with the absolute URL of the current page
 * to prevent duplicate content issues.
 * 
 * Validates: Requirements 7.3
 */
describe('Property 11: Canonical URL Presence', () => {
  it('should detect canonical URL in valid HTML', () => {
    fc.assert(
      fc.property(
        safeUrl,
        (url) => {
          const html = `
            <!DOCTYPE html>
            <html>
              <head>
                <link rel="canonical" href="${url}">
              </head>
            </html>
          `
          
          const canonicalUrl = extractCanonicalUrl(html)
          return canonicalUrl === url
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should detect missing canonical URL', () => {
    fc.assert(
      fc.property(
        safePageTitle,
        (title) => {
          const html = `
            <!DOCTYPE html>
            <html>
              <head>
                <title>${title}</title>
              </head>
            </html>
          `
          
          const canonicalUrl = extractCanonicalUrl(html)
          return canonicalUrl === null
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should validate canonical URL is absolute (starts with http/https)', () => {
    fc.assert(
      fc.property(
        safeUrl,
        (url) => {
          const html = `<link rel="canonical" href="${url}">`
          const canonicalUrl = extractCanonicalUrl(html)
          
          if (!canonicalUrl) return false
          
          return canonicalUrl.startsWith('http://') || canonicalUrl.startsWith('https://')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle canonical URL with alternate attribute order', () => {
    fc.assert(
      fc.property(
        safeUrl,
        (url) => {
          // Test with href before rel
          const html = `<link href="${url}" rel="canonical">`
          const canonicalUrl = extractCanonicalUrl(html)
          
          return canonicalUrl === url
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should validate canonical URL does not contain fragments or query params for clean URLs', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-z0-9]+$/, { minLength: 1, maxLength: 10 }),
        fc.stringMatching(/^\/[a-z0-9\-\/]*$/, { minLength: 1, maxLength: 20 }),
        (domain, path) => {
          const cleanUrl = `https://${domain}.com${path}`
          const html = `<link rel="canonical" href="${cleanUrl}">`
          const canonicalUrl = extractCanonicalUrl(html)
          
          if (!canonicalUrl) return false
          
          // Clean canonical URLs should not have query params or fragments
          return !canonicalUrl.includes('?') && !canonicalUrl.includes('#')
        }
      ),
      { numRuns: 100 }
    )
  })
})
