import { useState } from 'react'
import { SlidersHorizontal, X, Laptop, LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FilterSidebar } from '@/features/products/components/FilterSidebar'
import { ProductGrid } from '@/features/products/components/ProductGrid'
import { useProducts, useFilterOptions } from '@/features/products/hooks/useProducts'
import { useFilters } from '@/features/products/hooks/useFilters'
import { cn } from '@/lib/utils'
import type { SortOption } from '@/features/products/types'

export function ProductsPage() {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const {
    filters,
    setFilters,
    clearFilters,
    toggleArrayFilter,
    activeFilterCount,
  } = useFilters()
  const { data: products = [], isLoading, error } = useProducts(filters)
  const { data: filterOptions } = useFilterOptions()

  return (
    <div className="bg-surface-base min-h-screen text-on-surface">
      {/* Hero banner */}
      <div className="bg-gradient-to-b from-surface-raised via-surface-base to-surface-base border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.35)]">
              <Laptop className="w-5 h-5 text-on-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-on-surface tracking-tight">
              Refurbished Laptops
            </h1>
          </div>
          <p className="text-on-surface-subtle text-lg max-w-xl">
            Premium used laptops, tested and graded. Up to 60% less than new retail — same performance, smarter price.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-8 pb-6 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden flex items-center gap-2 rounded-full border-border text-on-surface bg-muted/50"
              onClick={() => setIsMobileFilterOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 w-5 h-5 rounded-full bg-amber-500 text-on-primary text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            <span className="text-sm text-on-surface-subtle font-medium">
              {isLoading
                ? 'Loading...'
                : `${products.length} laptop${products.length !== 1 ? 's' : ''}`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Select
              value={filters.sortBy}
              onValueChange={v => setFilters({ sortBy: v as SortOption })}
            >
              <SelectTrigger className="w-48 h-9 rounded-full text-sm border-border bg-muted/50 text-on-surface">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-surface-raised text-on-surface border border-border-subtle">
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="name_asc">Name: A to Z</SelectItem>
              </SelectContent>
            </Select>

            <div className="hidden items-center gap-2 lg:flex">
              <button
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full border',
                  viewMode === 'grid'
                    ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                    : 'border-border text-on-surface-subtle hover:bg-muted/50',
                )}
                onClick={() => setViewMode('grid')}
                aria-label="Vue grille"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full border',
                  viewMode === 'list'
                    ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                    : 'border-border text-on-surface-subtle hover:bg-muted/50',
                )}
                onClick={() => setViewMode('list')}
                aria-label="Vue liste"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-10">
          {/* Desktop sidebar */}
          <FilterSidebar
            filters={filters}
            options={filterOptions!}
            onToggle={toggleArrayFilter}
            onFilterChange={setFilters}
            onClear={clearFilters}
            activeFilterCount={activeFilterCount}
            className="hidden lg:block w-60 shrink-0 sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto scrollbar-hide pr-2"
          />

          {/* Products grid */}
          <div className="flex-1 min-w-0">
            <ProductGrid
              products={products}
              isLoading={isLoading}
              error={error as Error | null}
              viewMode={viewMode}
            />
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {isMobileFilterOpen && (
        <>
          <div
            className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-80 max-w-[85vw] z-[1001] bg-surface-overlay shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-surface-overlay/95 backdrop-blur flex items-center justify-between px-5 py-4 border-b border-border-faint z-10">
              <h2 className="font-bold text-lg text-on-surface">Filters</h2>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => setIsMobileFilterOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-5">
              <FilterSidebar
                filters={filters}
                options={filterOptions!}
                onToggle={toggleArrayFilter}
                onFilterChange={setFilters}
                onClear={() => {
                  clearFilters()
                  setIsMobileFilterOpen(false)
                }}
                activeFilterCount={activeFilterCount}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
