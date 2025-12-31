/**
 * Test Setup Verification
 * Ensures testing infrastructure is properly configured
 * 
 * Feature: performance-seo-optimization
 * Requirements: Testing Strategy
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  extractMetaTags,
  extractTitle,
  extractCanonicalUrl,
  extractOpenGraphTags,
  extractStructuredData,
  hasRequiredSeoTags
} from './utils/seo-helpers'
import {
  extractImageAttributes,
  extractAllImages,
  parseSrcset,
  hasLazyLoading,
  hasExplicitDimensions
} from './utils/image-helpers'

describe('Test Infrastructure Setup', () => {
  it('should have vitest configured correctly', () => {
    expect(true).toBe(true)
  })

  it('should have fast-check available for property testing', () => {
    fc.assert(
      fc.property(fc.integer(), (n) => {
        return typeof n === 'number'
      }),
      { numRuns: 10 }
    )
  })
})

describe('SEO Helpers', () => {
  it('should extract title from HTML', () => {
    const html = '<html><head><title>Test Page</title></head></html>'
    expect(extractTitle(html)).toBe('Test Page')
  })

  it('should extract meta tags from HTML', () => {
    const html = `
      <html>
        <head>
          <meta name="description" content="Test description">
          <meta property="og:title" content="OG Title">
        </head>
      </html>
    `
    const tags = extractMetaTags(html)
    expect(tags.length).toBeGreaterThan(0)
  })

  it('should extract canonical URL', () => {
    const html = '<link rel="canonical" href="https://example.com/page">'
    expect(extractCanonicalUrl(html)).toBe('https://example.com/page')
  })

  it('should extract Open Graph tags', () => {
    const html = `
      <meta property="og:title" content="Test Title">
      <meta property="og:description" content="Test Description">
      <meta property="og:image" content="https://example.com/image.jpg">
      <meta property="og:url" content="https://example.com">
    `
    const ogTags = extractOpenGraphTags(html)
    expect(ogTags.title).toBe('Test Title')
    expect(ogTags.description).toBe('Test Description')
  })

  it('should extract structured data', () => {
    const html = `
      <script type="application/ld+json">
        {"@context": "https://schema.org", "@type": "Product", "name": "Test"}
      </script>
    `
    const data = extractStructuredData(html)
    expect(data.length).toBe(1)
    expect(data[0]['@type']).toBe('Product')
  })
})

describe('Image Helpers', () => {
  it('should extract image attributes', () => {
    const imgTag = '<img src="test.jpg" alt="Test" width="100" height="100" loading="lazy">'
    const attrs = extractImageAttributes(imgTag)
    expect(attrs.src).toBe('test.jpg')
    expect(attrs.alt).toBe('Test')
    expect(attrs.width).toBe(100)
    expect(attrs.loading).toBe('lazy')
  })

  it('should extract all images from HTML', () => {
    const html = `
      <div>
        <img src="image1.jpg" alt="Image 1">
        <img src="image2.jpg" alt="Image 2">
      </div>
    `
    const images = extractAllImages(html)
    expect(images.length).toBe(2)
  })

  it('should parse srcset correctly', () => {
    const srcset = 'image-320.jpg 320w, image-640.jpg 640w, image-1024.jpg 1024w'
    const entries = parseSrcset(srcset)
    expect(entries.length).toBe(3)
    expect(entries[0].descriptor).toBe('320w')
  })

  it('should detect lazy loading', () => {
    const lazyImg = '<img src="test.jpg" loading="lazy">'
    const eagerImg = '<img src="test.jpg" loading="eager">'
    expect(hasLazyLoading(lazyImg)).toBe(true)
    expect(hasLazyLoading(eagerImg)).toBe(false)
  })

  it('should detect explicit dimensions', () => {
    const withDimensions = '<img src="test.jpg" width="100" height="100">'
    const withoutDimensions = '<img src="test.jpg">'
    expect(hasExplicitDimensions(withDimensions)).toBe(true)
    expect(hasExplicitDimensions(withoutDimensions)).toBe(false)
  })
})
