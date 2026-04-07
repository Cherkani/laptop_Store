import { Laptop } from 'lucide-react'
import { ProductCard } from './ProductCard'
import { SkeletonGrid, ErrorState, EmptyState } from '@/components/shared/PageState'
import type { ProductWithImages } from '@/types/database.types'

interface ProductGridProps {
  products: ProductWithImages[]
  isLoading: boolean
  error: Error | null
  viewMode?: 'grid' | 'list'
}

export function ProductGrid({ products, isLoading, error, viewMode = 'grid' }: ProductGridProps) {
  if (isLoading) return <SkeletonGrid />

  if (error) return <ErrorState message={error.message} />

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<Laptop className="h-8 w-8 text-muted-foreground" />}
        title="No laptops found"
        description="Try adjusting your filters or search query to find what you're looking for."
      />
    )
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {products.map(product => (
          <div key={product.id} className="rounded-2xl border border-border bg-surface-raised p-4 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[240px_1fr] md:items-center">
              <div className="overflow-hidden rounded-xl bg-muted">
                <ProductCard product={product} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-on-surface">{product.name}</h3>
                <p className="line-clamp-3 text-sm text-on-surface-subtle">{product.description}</p>
                <div className="flex flex-wrap gap-2 text-sm text-on-surface-subtle">
                  <span className="rounded-full bg-muted px-3 py-1">{product.processor}</span>
                  <span className="rounded-full bg-muted px-3 py-1">{product.ram}</span>
                  <span className="rounded-full bg-muted px-3 py-1">{product.storage}</span>
                  <span className="rounded-full bg-muted px-3 py-1">{product.graphics_card}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
