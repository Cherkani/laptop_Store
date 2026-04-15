import { useQuery } from '@tanstack/react-query'
import { productsService } from '../services/productsService'
import type { ProductFilters } from '../types'
import { BRANDS, PROCESSORS, RAM_OPTIONS, STORAGE_OPTIONS, GRAPHICS_OPTIONS, SCREEN_SIZES } from '../types'
import { STALE } from '@/lib/queryConfig'

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsService.getProducts(filters),
    staleTime: STALE.SHORT,
  })
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsService.getProductById(id!),
    enabled: !!id,
    staleTime: STALE.NORMAL,
  })
}

export function useFilterOptions() {
  return useQuery({
    queryKey: ['filter-options'],
    queryFn: () => productsService.getFilterOptions(),
    staleTime: STALE.SHORT,
    placeholderData: {
      brands: BRANDS,
      processors: PROCESSORS,
      rams: RAM_OPTIONS,
      storages: STORAGE_OPTIONS,
      graphicsCards: GRAPHICS_OPTIONS,
      screenSizes: SCREEN_SIZES,
    },
  })
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productsService.getFeaturedProducts(),
    staleTime: STALE.NORMAL,
  })
}
