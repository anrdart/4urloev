/**
 * Structured Data (JSON-LD) Property Tests
 * 
 * Feature: performance-seo-optimization
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  extractStructuredData,
  isValidProductStructuredData,
  isValidBreadcrumbStructuredData,
} from './utils/seo-helpers'

// Safe arbitrary generators for structured data testing
const safeProductName = fc.stringMatching(/^[a-zA-Z0-9\s\-_]+$/, { minLength: 1, maxLength: 100 })
  .filter(s => s.trim().length > 0)

const safeDescription = fc.stringMatching(/^[a-zA-Z0-9\s\-_.,!?]+$/, { minLength: 10, maxLength: 500 })
  .filter(s => s.trim().length >= 10)

const safeUrl = fc.tuple(
  fc.constantFrom('https'),
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

const safeBreadcrumbName = fc.stringMatching(/^[a-zA-Z0-9\s\-_]+$/, { minLength: 1, maxLength: 50 })
  .filter(s => s.trim().length > 0)

/**
 * Property 12: Product Structured Data
 * 
 * For any product detail page, the rendered HTML SHALL include a valid JSON-LD
 * script with `@type: "Product"` containing at minimum: `name`, `description`,
 * `image`, `offers` (with `price`, `priceCurrency`, `availability`).
 * 
 * Validates: Requirements 6.1
 */
describe('Property 12: Product Structured Data', () => {
  it('should validate product structured data contains all required fields', () => {
    fc.assert(
      fc.property(
        safeProductName,
        safeDescription,
        safeUrl,
        safePrice,
        safeCurrency,
        safeAvailability,
        (name, description, imageUrl, price, currency, availability) => {
          const productSchema = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: name,
            description: description,
            image: imageUrl,
            offers: {
              '@type': 'Offer',
              price: price,
              priceCurrency: currency,
              availability: availability,
            },
          }
          
          const html = `
            <!DOCTYPE html>
            <html>
              <head>
                <script type="application/ld+json">${JSON.stringify(productSchema)}</script>
              </head>
            </html>
          `
          
          const structuredData = extractStructuredData(html)
          const productData = structuredData.find(d => d['@type'] === 'Product')
          
          return (
            productData !== undefined &&
            isValidProductStructuredData(productData)
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should detect missing product name', () => {
    fc.assert(
      fc.property(
        safeDescription,
        safeUrl,
        safePrice,
        (description, imageUrl, price) => {
          const productSchema = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            // name is missing
            description: description,
            image: imageUrl,
            offers: {
              '@type': 'Offer',
              price: price,
              priceCurrency: 'IDR',
              availability: 'https://schema.org/InStock',
            },
          }
          
          const html = `<script type="application/ld+json">${JSON.stringify(productSchema)}</script>`
          const structuredData = extractStructuredData(html)
          const productData = structuredData.find(d => d['@type'] === 'Product')
          
          // Should be invalid because name is missing
          return !isValidProductStructuredData(productData)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should detect missing offers', () => {
    fc.assert(
      fc.property(
        safeProductName,
        safeDescription,
        safeUrl,
        (name, description, imageUrl) => {
          const productSchema = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: name,
            description: description,
            image: imageUrl,
            // offers is missing
          }
          
          const html = `<script type="application/ld+json">${JSON.stringify(productSchema)}</script>`
          const structuredData = extractStructuredData(html)
          const productData = structuredData.find(d => d['@type'] === 'Product')
          
          // Should be invalid because offers is missing
          return !isValidProductStructuredData(productData)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should validate price is a valid number', () => {
    fc.assert(
      fc.property(
        safeProductName,
        safePrice,
        (name, price) => {
          const productSchema = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: name,
            offers: {
              '@type': 'Offer',
              price: price,
              priceCurrency: 'IDR',
              availability: 'https://schema.org/InStock',
            },
          }
          
          const html = `<script type="application/ld+json">${JSON.stringify(productSchema)}</script>`
          const structuredData = extractStructuredData(html)
          const productData = structuredData.find(d => d['@type'] === 'Product') as Record<string, unknown>
          
          if (!productData || !productData.offers) return false
          
          const offers = productData.offers as Record<string, unknown>
          const parsedPrice = Number(offers.price)
          
          return !isNaN(parsedPrice) && parsedPrice >= 0
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should validate availability uses schema.org format', () => {
    fc.assert(
      fc.property(
        safeProductName,
        safeAvailability,
        (name, availability) => {
          const productSchema = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: name,
            offers: {
              '@type': 'Offer',
              price: 10000,
              priceCurrency: 'IDR',
              availability: availability,
            },
          }
          
          const html = `<script type="application/ld+json">${JSON.stringify(productSchema)}</script>`
          const structuredData = extractStructuredData(html)
          const productData = structuredData.find(d => d['@type'] === 'Product') as Record<string, unknown>
          
          if (!productData || !productData.offers) return false
          
          const offers = productData.offers as Record<string, unknown>
          const validAvailabilities = [
            'https://schema.org/InStock',
            'https://schema.org/OutOfStock',
            'https://schema.org/PreOrder',
          ]
          
          return validAvailabilities.includes(offers.availability as string)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should correctly extract product structured data from HTML', () => {
    fc.assert(
      fc.property(
        safeProductName,
        safePrice,
        safeCurrency,
        (name, price, currency) => {
          const productSchema = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: name,
            offers: {
              '@type': 'Offer',
              price: price,
              priceCurrency: currency,
              availability: 'https://schema.org/InStock',
            },
          }
          
          const html = `<script type="application/ld+json">${JSON.stringify(productSchema)}</script>`
          const structuredData = extractStructuredData(html)
          const productData = structuredData.find(d => d['@type'] === 'Product') as Record<string, unknown>
          
          if (!productData) return false
          
          return (
            productData.name === name &&
            (productData.offers as Record<string, unknown>).price === price &&
            (productData.offers as Record<string, unknown>).priceCurrency === currency
          )
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * Property 13: Breadcrumb Structured Data
 * 
 * For any page that displays breadcrumb navigation, the rendered HTML SHALL
 * include a valid JSON-LD script with `@type: "BreadcrumbList"` containing
 * an ordered list of `ListItem` elements.
 * 
 * Validates: Requirements 6.4
 */
describe('Property 13: Breadcrumb Structured Data', () => {
  it('should validate breadcrumb structured data contains required fields', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name: safeBreadcrumbName,
            url: safeUrl,
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (breadcrumbs) => {
          const breadcrumbSchema = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbs.map((item, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: item.name,
              item: item.url,
            })),
          }
          
          const html = `
            <!DOCTYPE html>
            <html>
              <head>
                <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
              </head>
            </html>
          `
          
          const structuredData = extractStructuredData(html)
          const breadcrumbData = structuredData.find(d => d['@type'] === 'BreadcrumbList')
          
          return (
            breadcrumbData !== undefined &&
            isValidBreadcrumbStructuredData(breadcrumbData)
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should validate breadcrumb positions are sequential', () => {
    fc.assert(
      fc.property(
        fc.array(safeBreadcrumbName, { minLength: 2, maxLength: 5 }),
        (names) => {
          const breadcrumbSchema = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: names.map((name, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: name,
              item: `https://example.com/path${index}`,
            })),
          }
          
          const html = `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`
          const structuredData = extractStructuredData(html)
          const breadcrumbData = structuredData.find(d => d['@type'] === 'BreadcrumbList') as Record<string, unknown>
          
          if (!breadcrumbData || !Array.isArray(breadcrumbData.itemListElement)) return false
          
          const items = breadcrumbData.itemListElement as Array<Record<string, unknown>>
          
          // Check positions are sequential starting from 1
          return items.every((item, index) => item.position === index + 1)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should detect empty breadcrumb list as invalid', () => {
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [],
    }
    
    const html = `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`
    const structuredData = extractStructuredData(html)
    const breadcrumbData = structuredData.find(d => d['@type'] === 'BreadcrumbList')
    
    expect(isValidBreadcrumbStructuredData(breadcrumbData)).toBe(false)
  })

  it('should validate each ListItem has required fields', () => {
    fc.assert(
      fc.property(
        safeBreadcrumbName,
        safeUrl,
        fc.integer({ min: 1, max: 10 }),
        (name, url, position) => {
          const breadcrumbSchema = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: position,
                name: name,
                item: url,
              },
            ],
          }
          
          const html = `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`
          const structuredData = extractStructuredData(html)
          const breadcrumbData = structuredData.find(d => d['@type'] === 'BreadcrumbList') as Record<string, unknown>
          
          if (!breadcrumbData || !Array.isArray(breadcrumbData.itemListElement)) return false
          
          const item = breadcrumbData.itemListElement[0] as Record<string, unknown>
          
          return (
            item['@type'] === 'ListItem' &&
            typeof item.position === 'number' &&
            typeof item.name === 'string' &&
            item.name.length > 0
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should correctly extract breadcrumb structured data from HTML', () => {
    fc.assert(
      fc.property(
        fc.array(safeBreadcrumbName, { minLength: 1, maxLength: 3 }),
        (names) => {
          const breadcrumbSchema = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: names.map((name, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: name,
            })),
          }
          
          const html = `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`
          const structuredData = extractStructuredData(html)
          const breadcrumbData = structuredData.find(d => d['@type'] === 'BreadcrumbList') as Record<string, unknown>
          
          if (!breadcrumbData || !Array.isArray(breadcrumbData.itemListElement)) return false
          
          const items = breadcrumbData.itemListElement as Array<Record<string, unknown>>
          
          return items.length === names.length &&
            items.every((item, index) => item.name === names[index])
        }
      ),
      { numRuns: 100 }
    )
  })
})
