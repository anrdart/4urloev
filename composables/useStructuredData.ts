/**
 * Structured Data Composable (JSON-LD)
 * Provides functions for generating schema.org structured data
 * 
 * Feature: performance-seo-optimization
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import type { Product } from '~/types'

// Site configuration for structured data
const SITE_CONFIG = {
  name: '4UrLoev',
  description: 'DIY Products & Personalized Gifts - Platform e-commerce untuk produk DIY dan hadiah personalisasi di Indonesia.',
  url: '', // Will be set from runtime config
  logo: '/favicon/android-chrome-512x512.png',
  email: 'hello@4urloev.com',
  phone: '+6281234567890',
  address: {
    streetAddress: 'Jakarta',
    addressLocality: 'Jakarta',
    addressRegion: 'DKI Jakarta',
    postalCode: '10110',
    addressCountry: 'ID',
  },
  socialLinks: {
    instagram: 'https://instagram.com/4urloev',
    facebook: 'https://facebook.com/4urloev',
    whatsapp: 'https://wa.me/6281234567890',
  },
}

// Types for structured data
export interface BreadcrumbItem {
  name: string
  url: string
}

export interface FAQItem {
  question: string
  answer: string
}

export interface ProductStructuredData {
  product: Product
  currentImage?: string
  breadcrumbs?: BreadcrumbItem[]
}

/**
 * Get the site URL from runtime config
 */
function getSiteUrl(): string {
  const config = useRuntimeConfig()
  return config.public.siteUrl || 'https://4urloev.com'
}

/**
 * Generate absolute URL
 */
function getAbsoluteUrl(path: string): string {
  const siteUrl = getSiteUrl()
  const baseUrl = siteUrl.replace(/\/$/, '')
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return path.startsWith('http') ? path : `${baseUrl}${cleanPath}`
}

/**
 * Organization Schema (Requirement 6.2)
 * Used on homepage to provide business information
 */
export function useOrganizationSchema() {
  const siteUrl = getSiteUrl()
  
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: siteUrl,
    logo: getAbsoluteUrl(SITE_CONFIG.logo),
    email: SITE_CONFIG.email,
    telephone: SITE_CONFIG.phone,
    address: {
      '@type': 'PostalAddress',
      ...SITE_CONFIG.address,
    },
    sameAs: Object.values(SITE_CONFIG.socialLinks).filter(Boolean),
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: SITE_CONFIG.phone,
      contactType: 'customer service',
      availableLanguage: ['Indonesian', 'English'],
    },
  }

  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(organizationSchema),
      },
    ],
  })

  return { organizationSchema }
}

/**
 * Website Schema (Requirement 5.5)
 * Used on homepage for site-wide search
 */
export function useWebsiteSchema() {
  const siteUrl = getSiteUrl()
  
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    url: siteUrl,
    description: SITE_CONFIG.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(websiteSchema),
      },
    ],
  })

  return { websiteSchema }
}

/**
 * Product Schema (Requirements 6.1, 6.3)
 * Used on product detail pages
 */
export function useProductSchema(config: ProductStructuredData) {
  const { product, currentImage } = config
  const siteUrl = getSiteUrl()
  const route = useRoute()
  
  // Get product image
  const productImage = currentImage || product.product_images?.[0]?.url || SITE_CONFIG.logo
  const imageUrl = getAbsoluteUrl(productImage)
  
  // Determine availability
  const availability = product.stock === null || product.stock === undefined || product.stock > 0
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock'

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `Beli ${product.name} di ${SITE_CONFIG.name}`,
    image: imageUrl,
    url: getAbsoluteUrl(route.path),
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: SITE_CONFIG.name,
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'IDR',
      availability: availability,
      url: getAbsoluteUrl(route.path),
      seller: {
        '@type': 'Organization',
        name: SITE_CONFIG.name,
      },
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    },
    // Add category if available
    ...(product.category && {
      category: product.category.name,
    }),
  }

  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(productSchema),
      },
    ],
  })

  return { productSchema }
}

/**
 * BreadcrumbList Schema (Requirement 6.4)
 * Used on pages with breadcrumb navigation
 */
export function useBreadcrumbSchema(items: BreadcrumbItem[]) {
  if (!items || items.length === 0) return { breadcrumbSchema: null }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: getAbsoluteUrl(item.url),
    })),
  }

  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(breadcrumbSchema),
      },
    ],
  })

  return { breadcrumbSchema }
}

/**
 * FAQPage Schema (Requirement 6.5)
 * Used on FAQ page for rich snippets
 */
export function useFAQSchema(faqs: FAQItem[]) {
  if (!faqs || faqs.length === 0) return { faqSchema: null }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(faqSchema),
      },
    ],
  })

  return { faqSchema }
}

/**
 * LocalBusiness Schema (Optional enhancement)
 * Can be used for local SEO
 */
export function useLocalBusinessSchema() {
  const siteUrl = getSiteUrl()
  
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: siteUrl,
    logo: getAbsoluteUrl(SITE_CONFIG.logo),
    image: getAbsoluteUrl(SITE_CONFIG.logo),
    email: SITE_CONFIG.email,
    telephone: SITE_CONFIG.phone,
    address: {
      '@type': 'PostalAddress',
      ...SITE_CONFIG.address,
    },
    priceRange: 'Rp',
    currenciesAccepted: 'IDR',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer, E-Wallet',
  }

  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(localBusinessSchema),
      },
    ],
  })

  return { localBusinessSchema }
}

/**
 * Combined homepage structured data
 * Includes Organization and Website schemas
 */
export function useHomepageStructuredData() {
  const { organizationSchema } = useOrganizationSchema()
  const { websiteSchema } = useWebsiteSchema()
  
  return {
    organizationSchema,
    websiteSchema,
  }
}

/**
 * Combined product page structured data
 * Includes Product and Breadcrumb schemas
 */
export function useProductPageStructuredData(config: ProductStructuredData) {
  const { productSchema } = useProductSchema(config)
  
  // Generate default breadcrumbs if not provided
  const defaultBreadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', url: '/' },
    { name: 'Produk', url: '/products' },
    { name: config.product.name, url: `/products/${config.product.id}` },
  ]
  
  const breadcrumbs = config.breadcrumbs || defaultBreadcrumbs
  const { breadcrumbSchema } = useBreadcrumbSchema(breadcrumbs)
  
  return {
    productSchema,
    breadcrumbSchema,
  }
}
