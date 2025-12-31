/**
 * SEO Testing Utilities
 * Helpers for testing SEO meta tags, structured data, and Open Graph tags
 * 
 * Feature: performance-seo-optimization
 * Requirements: Testing Strategy
 */

import * as fc from 'fast-check'

// Types for SEO testing
export interface MetaTag {
  name?: string
  property?: string
  content: string
}

export interface OpenGraphTags {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: string
}

export interface TwitterCardTags {
  card?: string
  title?: string
  description?: string
  image?: string
}

export interface StructuredData {
  '@context': string
  '@type': string
  [key: string]: unknown
}

export interface ProductStructuredData extends StructuredData {
  '@type': 'Product'
  name: string
  description?: string
  image?: string | string[]
  offers?: {
    '@type': 'Offer'
    price: number | string
    priceCurrency: string
    availability: string
  }
}

export interface BreadcrumbStructuredData extends StructuredData {
  '@type': 'BreadcrumbList'
  itemListElement: Array<{
    '@type': 'ListItem'
    position: number
    name: string
    item?: string
  }>
}

// Arbitrary generators for property-based testing
export const arbitraryPageTitle = fc.string({ minLength: 1, maxLength: 60 })
  .filter(s => s.trim().length > 0)

export const arbitraryMetaDescription = fc.string({ minLength: 50, maxLength: 160 })
  .filter(s => s.trim().length >= 50)

export const arbitraryUrl = fc.webUrl()

export const arbitraryProductName = fc.string({ minLength: 1, maxLength: 100 })
  .filter(s => s.trim().length > 0)

export const arbitraryPrice = fc.float({ min: Math.fround(0.01), max: Math.fround(999999.0), noNaN: true })
  .map(p => Math.round(p * 100) / 100)

export const arbitraryCurrency = fc.constantFrom('IDR', 'USD', 'EUR', 'GBP')

export const arbitraryAvailability = fc.constantFrom(
  'https://schema.org/InStock',
  'https://schema.org/OutOfStock',
  'https://schema.org/PreOrder'
)

// Helper functions for extracting and validating SEO elements
export function extractMetaTags(html: string): MetaTag[] {
  const metaRegex = /<meta\s+(?:[^>]*?\s+)?(?:name|property)=["']([^"']+)["']\s+content=["']([^"']*)["'][^>]*>/gi
  const altMetaRegex = /<meta\s+content=["']([^"']*)["']\s+(?:name|property)=["']([^"']+)["'][^>]*>/gi
  
  const tags: MetaTag[] = []
  let match

  while ((match = metaRegex.exec(html)) !== null) {
    const attr = match[1]
    const content = match[2]
    if (attr.startsWith('og:') || attr.startsWith('twitter:')) {
      tags.push({ property: attr, content })
    } else {
      tags.push({ name: attr, content })
    }
  }

  while ((match = altMetaRegex.exec(html)) !== null) {
    const content = match[1]
    const attr = match[2]
    if (attr.startsWith('og:') || attr.startsWith('twitter:')) {
      tags.push({ property: attr, content })
    } else {
      tags.push({ name: attr, content })
    }
  }

  return tags
}


export function extractTitle(html: string): string | null {
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
  return titleMatch ? titleMatch[1] : null
}

export function extractCanonicalUrl(html: string): string | null {
  const canonicalMatch = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)
  const altCanonicalMatch = html.match(/<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i)
  return canonicalMatch?.[1] || altCanonicalMatch?.[1] || null
}

export function extractOpenGraphTags(html: string): OpenGraphTags {
  const tags = extractMetaTags(html)
  const ogTags: OpenGraphTags = {}

  for (const tag of tags) {
    if (tag.property === 'og:title') ogTags.title = tag.content
    if (tag.property === 'og:description') ogTags.description = tag.content
    if (tag.property === 'og:image') ogTags.image = tag.content
    if (tag.property === 'og:url') ogTags.url = tag.content
    if (tag.property === 'og:type') ogTags.type = tag.content
  }

  return ogTags
}

export function extractTwitterCardTags(html: string): TwitterCardTags {
  const tags = extractMetaTags(html)
  const twitterTags: TwitterCardTags = {}

  for (const tag of tags) {
    if (tag.property === 'twitter:card' || tag.name === 'twitter:card') twitterTags.card = tag.content
    if (tag.property === 'twitter:title' || tag.name === 'twitter:title') twitterTags.title = tag.content
    if (tag.property === 'twitter:description' || tag.name === 'twitter:description') twitterTags.description = tag.content
    if (tag.property === 'twitter:image' || tag.name === 'twitter:image') twitterTags.image = tag.content
  }

  return twitterTags
}

export function extractStructuredData(html: string): StructuredData[] {
  const scriptRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  const structuredData: StructuredData[] = []
  let match

  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1])
      if (Array.isArray(data)) {
        structuredData.push(...data)
      } else {
        structuredData.push(data)
      }
    } catch {
      // Invalid JSON, skip
    }
  }

  return structuredData
}

// Validation functions
export function hasRequiredSeoTags(html: string): {
  valid: boolean
  missing: string[]
} {
  const missing: string[] = []
  
  if (!extractTitle(html)) missing.push('title')
  
  const tags = extractMetaTags(html)
  const hasDescription = tags.some(t => t.name === 'description')
  if (!hasDescription) missing.push('meta description')

  const ogTags = extractOpenGraphTags(html)
  if (!ogTags.title) missing.push('og:title')
  if (!ogTags.description) missing.push('og:description')
  if (!ogTags.image) missing.push('og:image')
  if (!ogTags.url) missing.push('og:url')

  const twitterTags = extractTwitterCardTags(html)
  if (!twitterTags.card) missing.push('twitter:card')
  if (!twitterTags.title) missing.push('twitter:title')
  if (!twitterTags.description) missing.push('twitter:description')

  return {
    valid: missing.length === 0,
    missing
  }
}

export function isValidProductStructuredData(data: unknown): data is ProductStructuredData {
  if (!data || typeof data !== 'object') return false
  const d = data as Record<string, unknown>
  
  return (
    d['@type'] === 'Product' &&
    typeof d.name === 'string' &&
    d.name.length > 0 &&
    d.offers !== undefined &&
    typeof d.offers === 'object' &&
    d.offers !== null
  )
}

export function isValidBreadcrumbStructuredData(data: unknown): data is BreadcrumbStructuredData {
  if (!data || typeof data !== 'object') return false
  const d = data as Record<string, unknown>
  
  return (
    d['@type'] === 'BreadcrumbList' &&
    Array.isArray(d.itemListElement) &&
    d.itemListElement.length > 0 &&
    d.itemListElement.every((item: unknown) => {
      if (!item || typeof item !== 'object') return false
      const i = item as Record<string, unknown>
      return (
        i['@type'] === 'ListItem' &&
        typeof i.position === 'number' &&
        typeof i.name === 'string'
      )
    })
  )
}
