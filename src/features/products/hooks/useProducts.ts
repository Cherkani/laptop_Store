import { useQuery } from '@tanstack/react-query'
import { productsService } from '../services/productsService'
import type { ProductFilters } from '../types'
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

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productsService.getFeaturedProducts(),
    staleTime: STALE.NORMAL,
  })
}
