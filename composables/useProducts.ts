import type { Product, Category, ProductBundle } from '~/types'
import { useCachedQuery, type CacheOptions } from './useCachedData'

/**
 * Products Composable with SWR Caching
 * Implements stale-while-revalidate pattern for product data
 * 
 * Feature: performance-seo-optimization
 * Requirements: 4.4
 */

// Cache configuration for different data types
const CACHE_CONFIG = {
  products: { maxAge: 5 * 60 * 1000, staleWhileRevalidate: 60 * 60 * 1000 }, // 5min fresh, 1hr stale
  categories: { maxAge: 30 * 60 * 1000, staleWhileRevalidate: 24 * 60 * 60 * 1000 }, // 30min fresh, 24hr stale
  bundles: { maxAge: 10 * 60 * 1000, staleWhileRevalidate: 60 * 60 * 1000 }, // 10min fresh, 1hr stale
  search: { maxAge: 2 * 60 * 1000, staleWhileRevalidate: 10 * 60 * 1000 }, // 2min fresh, 10min stale
}

export interface ProductQueryOptions {
  categoryId?: string
  featured?: boolean
  limit?: number
  offset?: number
  search?: string
  sortBy?: 'price' | 'created_at' | 'name'
  sortOrder?: 'asc' | 'desc'
}

export const useProducts = () => {
  const supabase = useSupabaseClient()

  /**
   * Generate cache key from query options
   */
  const generateCacheKey = (base: string, options?: Record<string, unknown>): string => {
    if (!options) return base
    const sortedParams = Object.entries(options)
      .filter(([_, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('&')
    return sortedParams ? `${base}?${sortedParams}` : base
  }

  const getProducts = async (options?: ProductQueryOptions) => {
    let query = supabase
      .from('products')
      .select('*, product_images(*), categories(*)')
      .eq('is_active', true)

    if (options?.categoryId) {
      query = query.eq('category_id', options.categoryId)
    }

    if (options?.featured !== undefined) {
      query = query.eq('featured', options.featured)
    }

    if (options?.search) {
      query = query.ilike('name', `%${options.search}%`)
    }

    if (options?.sortBy) {
      query = query.order(options.sortBy, { ascending: options.sortOrder === 'asc' })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) throw error
    return data as Product[]
  }

  const getProductById = async (id: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*), categories(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Product
  }

  const getFeaturedProducts = async (limit = 6) => {
    return getProducts({ featured: true, limit })
  }

  const getCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) throw error
    return data as Category[]
  }

  const getBundles = async (activeOnly = true) => {
    let query = supabase
      .from('product_bundles')
      .select('*, bundle_items(*, products(*, product_images(*)))')
      .order('created_at', { ascending: false })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) throw error
    return data as ProductBundle[]
  }

  const getBundleById = async (id: string) => {
    const { data, error } = await supabase
      .from('product_bundles')
      .select('*, bundle_items(*, products(*, product_images(*)))')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as ProductBundle
  }

  const searchProducts = async (query: string, limit = 10) => {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*)')
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(limit)

    if (error) throw error
    return data as Product[]
  }

  // ============================================
  // Cached versions with SWR pattern (Requirements: 4.4)
  // ============================================

  /**
   * Get products with SWR caching
   * Returns cached data immediately while revalidating in background
   */
  const getProductsCached = (options?: ProductQueryOptions) => {
    const cacheKey = generateCacheKey('products', options)
    return useCachedQuery<Product[]>(
      cacheKey,
      () => getProducts(options),
      CACHE_CONFIG.products
    )
  }

  /**
   * Get product by ID with SWR caching
   */
  const getProductByIdCached = (id: string) => {
    return useCachedQuery<Product>(
      `product-${id}`,
      () => getProductById(id),
      CACHE_CONFIG.products
    )
  }

  /**
   * Get featured products with SWR caching
   */
  const getFeaturedProductsCached = (limit = 6) => {
    return useCachedQuery<Product[]>(
      `products-featured-${limit}`,
      () => getFeaturedProducts(limit),
      CACHE_CONFIG.products
    )
  }

  /**
   * Get categories with SWR caching (longer cache as categories change rarely)
   */
  const getCategoriesCached = () => {
    return useCachedQuery<Category[]>(
      'categories',
      getCategories,
      CACHE_CONFIG.categories
    )
  }

  /**
   * Get bundles with SWR caching
   */
  const getBundlesCached = (activeOnly = true) => {
    return useCachedQuery<ProductBundle[]>(
      `bundles-${activeOnly ? 'active' : 'all'}`,
      () => getBundles(activeOnly),
      CACHE_CONFIG.bundles
    )
  }

  /**
   * Get bundle by ID with SWR caching
   */
  const getBundleByIdCached = (id: string) => {
    return useCachedQuery<ProductBundle>(
      `bundle-${id}`,
      () => getBundleById(id),
      CACHE_CONFIG.bundles
    )
  }

  /**
   * Search products with SWR caching (shorter cache for search results)
   */
  const searchProductsCached = (query: string, limit = 10) => {
    return useCachedQuery<Product[]>(
      `search-${query}-${limit}`,
      () => searchProducts(query, limit),
      CACHE_CONFIG.search
    )
  }

  return {
    // Original methods (direct fetch)
    getProducts,
    getProductById,
    getFeaturedProducts,
    getCategories,
    getBundles,
    getBundleById,
    searchProducts,
    // Cached methods with SWR pattern (Requirements: 4.4)
    getProductsCached,
    getProductByIdCached,
    getFeaturedProductsCached,
    getCategoriesCached,
    getBundlesCached,
    getBundleByIdCached,
    searchProductsCached,
    // Utility
    generateCacheKey,
  }
}


