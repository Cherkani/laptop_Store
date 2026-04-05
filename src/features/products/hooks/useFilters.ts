import { useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { ProductFilters, SortOption } from '../types'
import { DEFAULT_FILTERS } from '../types'

export function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFiltersState] = useState<ProductFilters>(() => {
    const priceMin = searchParams.get('priceMin')
    const priceMax = searchParams.get('priceMax')
    return {
      search: searchParams.get('q') ?? '',
      brands: searchParams.getAll('brand'),
      operatingSystems: searchParams.getAll('os'),
      processors: searchParams.getAll('processor'),
      rams: searchParams.getAll('ram'),
      storages: searchParams.getAll('storage'),
      graphicsCards: searchParams.getAll('gpu'),
      screenSizes: searchParams.getAll('size'),
      priceRange: [
        priceMin ? parseInt(priceMin) : DEFAULT_FILTERS.priceRange[0],
        priceMax ? parseInt(priceMax) : DEFAULT_FILTERS.priceRange[1],
      ],
      inStockOnly: searchParams.get('inStock') === 'true',
      sortBy: (searchParams.get('sort') as SortOption) ?? DEFAULT_FILTERS.sortBy,
    }
  })

  const setFilters = useCallback((updater: Partial<ProductFilters> | ((prev: ProductFilters) => ProductFilters)) => {
    setFiltersState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      const params = new URLSearchParams()
      if (next.search) params.set('q', next.search)
      next.brands.forEach(b => params.append('brand', b))
      next.operatingSystems.forEach(os => params.append('os', os))
      next.processors.forEach(p => params.append('processor', p))
      next.rams.forEach(r => params.append('ram', r))
      next.storages.forEach(s => params.append('storage', s))
      next.graphicsCards.forEach(g => params.append('gpu', g))
      next.screenSizes.forEach(s => params.append('size', s))
      if (next.priceRange[0] > 0) params.set('priceMin', String(next.priceRange[0]))
      if (next.priceRange[1] < DEFAULT_FILTERS.priceRange[1]) params.set('priceMax', String(next.priceRange[1]))
      if (next.inStockOnly) params.set('inStock', 'true')
      if (next.sortBy !== 'newest') params.set('sort', next.sortBy)
      setSearchParams(params, { replace: true })
      return next
    })
  }, [setSearchParams])

  const clearFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS)
    setSearchParams({}, { replace: true })
  }, [setSearchParams])

  const toggleArrayFilter = useCallback(<K extends 'brands' | 'operatingSystems' | 'processors' | 'rams' | 'storages' | 'graphicsCards' | 'screenSizes'>(
    key: K,
    value: string
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value],
    }))
  }, [setFilters])

  const activeFilterCount = [
    filters.brands.length,
    filters.operatingSystems.length,
    filters.processors.length,
    filters.rams.length,
    filters.storages.length,
    filters.graphicsCards.length,
    filters.screenSizes.length,
    filters.priceRange[0] > 0 || filters.priceRange[1] < DEFAULT_FILTERS.priceRange[1] ? 1 : 0,
    filters.inStockOnly ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  return { filters, setFilters, clearFilters, toggleArrayFilter, activeFilterCount }
}
