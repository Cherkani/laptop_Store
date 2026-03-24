import { useQuery } from '@tanstack/react-query'
import { productsService } from '../services/productsService'
import type { ProductFilters } from '../types'

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsService.getProducts(filters),
    staleTime: 1000 * 60 * 2,
  })
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsService.getProductById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productsService.getFeaturedProducts(),
    staleTime: 1000 * 60 * 5,
  })
}
