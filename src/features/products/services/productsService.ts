import { supabase } from '@/lib/supabase'
import type { ProductWithImages } from '@/types/database.types'
import type { ProductFilters } from '../types'
import { BRANDS, PROCESSORS, RAM_OPTIONS, STORAGE_OPTIONS, GRAPHICS_OPTIONS, SCREEN_SIZES } from '../types'
import { normalizeGpu, normalizeScreenSize, normalizeRam, normalizeStorage } from '@/lib/normalizeSpecs'

/** Sort values by their position in a reference list; unknowns go last, sorted numerically then alphabetically */
function sortByRef(values: string[], ref: string[]): string[] {
  return [...values].sort((a, b) => {
    const ia = ref.indexOf(a)
    const ib = ref.indexOf(b)
    if (ia !== -1 && ib !== -1) return ia - ib
    if (ia !== -1) return -1
    if (ib !== -1) return 1
    // Both unknown — extract leading number for numeric sort
    const na = parseFloat(a)
    const nb = parseFloat(b)
    if (!isNaN(na) && !isNaN(nb)) return na - nb
    return a.localeCompare(b)
  })
}

export const productsService = {
  async getProducts(filters: ProductFilters): Promise<ProductWithImages[]> {
    let query = supabase
      .from('products')
      .select(`
        *,
        product_images (*)
      `)
      .eq('is_available', true)
      .gte('price', filters.priceRange[0])
      .lte('price', filters.priceRange[1])

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`)
    }

    // Map OS filter to brands to stay compatible even if products.os column is absent
    let brandFilter = filters.brands
    if (brandFilter.length === 0 && filters.operatingSystems.length > 0) {
      const wantsMac = filters.operatingSystems.includes('macOS')
      const wantsWindows = filters.operatingSystems.includes('Windows')
      if (wantsMac && wantsWindows) {
        brandFilter = BRANDS
      } else if (wantsMac) {
        brandFilter = ['Apple']
      } else if (wantsWindows) {
        brandFilter = BRANDS.filter(b => b !== 'Apple')
      }
    }
    if (brandFilter.length > 0) {
      query = query.in('brand', brandFilter)
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
      .eq('is_available', true)
      .single()

    if (error) throw error
    return data as ProductWithImages
  },

  async getFilterOptions() {
    const { data, error } = await supabase
      .from('products')
      .select('brand, processor, ram, storage, graphics_card, screen_size')
      .eq('is_available', true)
    if (error) throw error
    const rows = data ?? []
    const present = (v: string | null | undefined): v is string =>
      v !== null && v !== undefined && v.trim() !== ''
    const distinct = (arr: string[]): string[] => [...new Set(arr)]
    return {
      brands:        sortByRef(distinct(rows.map(r => r.brand).filter(present)), BRANDS),
      processors:    sortByRef(distinct(rows.map(r => r.processor).filter(present)), PROCESSORS),
      rams:          sortByRef(distinct(rows.map(r => r.ram).filter(present).map(normalizeRam)), RAM_OPTIONS),
      storages:      sortByRef(distinct(rows.map(r => r.storage).filter(present).map(normalizeStorage)), STORAGE_OPTIONS),
      graphicsCards: sortByRef(distinct(rows.map(r => r.graphics_card).filter(present).map(normalizeGpu)), GRAPHICS_OPTIONS),
      screenSizes:   sortByRef(distinct(rows.map(r => r.screen_size).filter(present).map(normalizeScreenSize)), SCREEN_SIZES),
    }
  },

  async getFeaturedProducts(): Promise<ProductWithImages[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`*, product_images (*)`)
      .eq('is_featured', true)
      .eq('is_available', true)
      .gt('stock_quantity', 0)
      .order('created_at', { ascending: false })
      .limit(8)

    if (error) throw error
    return (data as ProductWithImages[]) ?? []
  },
}
