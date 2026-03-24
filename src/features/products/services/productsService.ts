import { supabase } from '@/lib/supabase'
import type { ProductWithImages } from '@/types/database.types'
import type { ProductFilters } from '../types'

export const productsService = {
  async getProducts(filters: ProductFilters): Promise<ProductWithImages[]> {
    let query = supabase
      .from('products')
      .select(`
        *,
        product_images (*)
      `)
      .gte('price', filters.priceRange[0])
      .lte('price', filters.priceRange[1])

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`)
    }
    if (filters.brands.length > 0) {
      query = query.in('brand', filters.brands)
    }
    if (filters.processors.length > 0) {
      query = query.in('processor', filters.processors)
    }
    if (filters.rams.length > 0) {
      query = query.in('ram', filters.rams)
    }
    if (filters.storages.length > 0) {
      query = query.in('storage', filters.storages)
    }
    if (filters.graphicsCards.length > 0) {
      query = query.in('graphics_card', filters.graphicsCards)
    }
    if (filters.screenSizes.length > 0) {
      query = query.in('screen_size', filters.screenSizes)
    }
    if (filters.inStockOnly) {
      query = query.gt('stock_quantity', 0)
    }

    switch (filters.sortBy) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'name_asc':
        query = query.order('name', { ascending: true })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query
    if (error) throw error
    return (data as ProductWithImages[]) ?? []
  },

  async getProductById(id: string): Promise<ProductWithImages | null> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images (*),
        specifications (*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data as ProductWithImages
  },

  async getFeaturedProducts(): Promise<ProductWithImages[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`*, product_images (*)`)
      .eq('is_featured', true)
      .gt('stock_quantity', 0)
      .order('created_at', { ascending: false })
      .limit(8)

    if (error) throw error
    return (data as ProductWithImages[]) ?? []
  },
}
