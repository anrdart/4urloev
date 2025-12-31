/**
 * SEO Composable
 * Provides functions for page meta, Open Graph tags, Twitter cards, and canonical URLs
 * 
 * Feature: performance-seo-optimization
 * Requirements: 5.1, 5.2, 5.3, 5.4, 7.3
 */

import type { Product } from '~/types'

// Site configuration
const SITE_CONFIG = {
  name: '4UrLoev',
  description: 'DIY Products & Personalized Gifts - Pilih jalur yang tepat: Desain siap pakai instant download atau desain kustom eksklusif.',
  url: '', // Will be set from runtime config
  logo: '/favicon/android-chrome-512x512.png',
  locale: 'id_ID',
  twitterHandle: '@4urloev',
  defaultImage: '/og-image.png',
}

export interface PageSeoConfig {
  title: string
  description: string
  image?: string
  type?: 'website' | 'product' | 'article'
  noindex?: boolean
  keywords?: string[]
}

export interface ProductSeoConfig {
  product: Product
  currentImage?: string
}

/**
 * Get the site URL from runtime config
 */
function getSiteUrl(): string {
  const config = useRuntimeConfig()
  return config.public.siteUrl || 'https://4urloev.com'
}

/**
 * Generate canonical URL for a given path
 */
export function generateCanonicalUrl(path: string): string {
  const siteUrl = getSiteUrl()
  // Remove trailing slash from site URL and leading slash from path if both exist
  const baseUrl = siteUrl.replace(/\/$/, '')
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}

/**
 * Main SEO composable for setting page meta tags
 * Implements Requirements: 5.1, 5.2, 5.3, 7.3
 */
export function useSeo(config: PageSeoConfig) {
  const route = useRoute()
  const siteUrl = getSiteUrl()
  const canonicalUrl = generateCanonicalUrl(route.path)
  
  const fullTitle = config.title.includes(SITE_CONFIG.name) 
    ? config.title 
    : `${config.title} - ${SITE_CONFIG.name}`
  
  const imageUrl = config.image 
    ? (config.image.startsWith('http') ? config.image : `${siteUrl}${config.image}`)
    : `${siteUrl}${SITE_CONFIG.defaultImage}`

  // Set all SEO meta tags
  useSeoMeta({
    // Basic meta tags (Requirement 5.1)
    title: fullTitle,
    description: config.description,
    keywords: config.keywords?.join(', '),
    
    // Open Graph tags (Requirement 5.2)
    ogTitle: fullTitle,
    ogDescription: config.description,
    ogImage: imageUrl,
    ogUrl: canonicalUrl,
    ogType: config.type || 'website',
    ogSiteName: SITE_CONFIG.name,
    ogLocale: SITE_CONFIG.locale,
    
    // Twitter Card tags (Requirement 5.3)
    twitterCard: 'summary_large_image',
    twitterTitle: fullTitle,
    twitterDescription: config.description,
    twitterImage: imageUrl,
    twitterSite: SITE_CONFIG.twitterHandle,
    
    // Robots
    robots: config.noindex ? 'noindex, nofollow' : 'index, follow',
  })

  // Set canonical URL (Requirement 7.3)
  useHead({
    link: [
      { rel: 'canonical', href: canonicalUrl },
    ],
  })

  return {
    canonicalUrl,
    fullTitle,
    imageUrl,
  }
}

/**
 * Product-specific SEO composable
 * Implements Requirements: 5.4
 */
export function useProductSeo(config: ProductSeoConfig) {
  const { product, currentImage } = config
  const route = useRoute()
  const siteUrl = getSiteUrl()
  const canonicalUrl = generateCanonicalUrl(route.path)
  
  const productImage = currentImage || product.product_images?.[0]?.url || SITE_CONFIG.defaultImage
  const imageUrl = productImage.startsWith('http') ? productImage : `${siteUrl}${productImage}`
  
  const fullTitle = `${product.name} - ${SITE_CONFIG.name}`
  const description = product.description || `Beli ${product.name} di ${SITE_CONFIG.name}. Produk DIY dan hadiah personalisasi berkualitas.`
  
  // Determine availability
  const availability = product.stock === null || product.stock === undefined || product.stock > 0 
    ? 'instock' 
    : 'outofstock'

  // Set all SEO meta tags including product-specific ones
  useSeoMeta({
    // Basic meta tags (Requirement 5.1)
    title: fullTitle,
    description: description,
    
    // Open Graph tags (Requirement 5.2)
    ogTitle: fullTitle,
    ogDescription: description,
    ogImage: imageUrl,
    ogUrl: canonicalUrl,
    ogType: 'product',
    ogSiteName: SITE_CONFIG.name,
    ogLocale: SITE_CONFIG.locale,
    
    // Twitter Card tags (Requirement 5.3)
    twitterCard: 'summary_large_image',
    twitterTitle: fullTitle,
    twitterDescription: description,
    twitterImage: imageUrl,
    twitterSite: SITE_CONFIG.twitterHandle,
    
    // Product-specific meta tags (Requirement 5.4)
    // @ts-ignore - These are valid Open Graph product tags
    'product:price:amount': product.price.toString(),
    'product:price:currency': 'IDR',
    'product:availability': availability,
    
    // Robots
    robots: 'index, follow',
  })

  // Set canonical URL and additional product meta (Requirement 7.3)
  useHead({
    link: [
      { rel: 'canonical', href: canonicalUrl },
    ],
    meta: [
      // Additional product meta tags for better SEO
      { property: 'product:price:amount', content: product.price.toString() },
      { property: 'product:price:currency', content: 'IDR' },
      { property: 'product:availability', content: availability },
    ],
  })

  return {
    canonicalUrl,
    fullTitle,
    imageUrl,
    availability,
  }
}

/**
 * Default SEO configurations for common pages
 */
export const defaultSeoConfigs = {
  home: {
    title: '4UrLoev - DIY Products & Personalized Gifts',
    description: 'Pilih jalur yang tepat: Desain siap pakai instant download atau desain kustom eksklusif. Solusi lengkap untuk kebutuhan desain Anda.',
    keywords: ['DIY products', 'personalized gifts', 'custom shopping', 'desain kustom', 'hadiah personal', 'kerajinan tangan'],
    type: 'website' as const,
  },
  products: {
    title: 'Produk',
    description: 'Jelajahi koleksi lengkap produk DIY dan hadiah personalisasi dari 4UrLoev. Temukan kerajinan tangan unik dan produk yang dapat disesuaikan.',
    keywords: ['produk DIY', 'hadiah personalisasi', 'kerajinan tangan', 'custom gifts'],
    type: 'website' as const,
  },
  bundles: {
    title: 'Bundles',
    description: 'Hemat lebih banyak dengan paket bundle produk DIY dari 4UrLoev. Dapatkan koleksi lengkap dengan harga spesial.',
    keywords: ['bundle produk', 'paket hemat', 'DIY bundle', 'gift set'],
    type: 'website' as const,
  },
  about: {
    title: 'Tentang Kami',
    description: 'Kenali lebih dekat 4UrLoev - platform e-commerce untuk produk DIY dan hadiah personalisasi di Indonesia.',
    keywords: ['tentang 4UrLoev', 'DIY Indonesia', 'toko online kerajinan'],
    type: 'website' as const,
  },
  faq: {
    title: 'FAQ - Pertanyaan Umum',
    description: 'Temukan jawaban untuk pertanyaan umum tentang produk, pemesanan, pengiriman, dan layanan 4UrLoev.',
    keywords: ['FAQ', 'pertanyaan umum', 'bantuan', 'customer service'],
    type: 'website' as const,
  },
  contact: {
    title: 'Hubungi Kami',
    description: 'Hubungi tim 4UrLoev untuk pertanyaan, saran, atau bantuan. Kami siap membantu Anda.',
    keywords: ['kontak', 'hubungi kami', 'customer support', 'bantuan'],
    type: 'website' as const,
  },
  customize: {
    title: 'Custom Design',
    description: 'Buat desain kustom Anda sendiri dengan alat customization canggih dari 4UrLoev. Wujudkan kreativitas Anda.',
    keywords: ['custom design', 'desain kustom', 'personalisasi', 'kreasi sendiri'],
    type: 'website' as const,
  },
}
