import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FilterSidebar } from '@/features/products/components/FilterSidebar'
import { ProductGrid } from '@/features/products/components/ProductGrid'
import { useProducts } from '@/features/products/hooks/useProducts'
import { useFilters } from '@/features/products/hooks/useFilters'
import { cn } from '@/lib/utils'
import type { SortOption } from '@/features/products/types'

export function ProductsPage() {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const { filters, setFilters, clearFilters, toggleArrayFilter, activeFilterCount } = useFilters()
  const { data: products = [], isLoading, error } = useProducts(filters)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Laptops</h1>
        <p className="text-muted-foreground mt-1">Find the perfect laptop for your needs</p>
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {/* Mobile filter toggle */}
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden flex items-center gap-2"
            onClick={() => setIsMobileFilterOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-xs">{activeFilterCount}</span>
            )}
          </Button>
          <span className="text-sm text-muted-foreground">
            {isLoading ? 'Loading...' : `${products.length} result${products.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {/* Sort */}
        <Select
          value={filters.sortBy}
          onValueChange={v => setFilters({ sortBy: v as SortOption })}
        >
          <SelectTrigger className="w-44 h-9">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="name_asc">Name: A to Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <FilterSidebar
          filters={filters}
          onToggle={toggleArrayFilter}
          onFilterChange={setFilters}
          onClear={clearFilters}
          activeFilterCount={activeFilterCount}
          className="hidden lg:block w-64 shrink-0 sticky top-24 self-start max-h-[calc(100vh-6rem)] overflow-y-auto pr-2"
        />

        {/* Products */}
        <div className="flex-1 min-w-0">
          <ProductGrid products={products} isLoading={isLoading} error={error as Error | null} />
        </div>
      </div>

      {/* Mobile filter drawer */}
      {isMobileFilterOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-80 max-w-full z-50 bg-background shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-background flex items-center justify-between px-4 py-3 border-b z-10">
              <h2 className="font-semibold">Filters</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileFilterOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4">
              <FilterSidebar
                filters={filters}
                onToggle={toggleArrayFilter}
                onFilterChange={setFilters}
                onClear={() => { clearFilters(); setIsMobileFilterOpen(false) }}
                activeFilterCount={activeFilterCount}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
