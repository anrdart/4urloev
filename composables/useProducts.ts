import type { Product, Category, ProductBundle } from '~/types'

export const useProducts = () => {
  const supabase = useSupabaseClient()

  const getProducts = async (options?: {
    categoryId?: string
    featured?: boolean
    limit?: number
    offset?: number
    search?: string
    sortBy?: 'price' | 'created_at' | 'name'
    sortOrder?: 'asc' | 'desc'
  }) => {
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

  return {
    getProducts,
    getProductById,
    getFeaturedProducts,
    getCategories,
    getBundles,
    getBundleById,
    searchProducts,
  }
}


