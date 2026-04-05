import { Laptop } from 'lucide-react'
import { ProductCard } from './ProductCard'
import type { ProductWithImages } from '@/types/database.types'

interface ProductGridProps {
  products: ProductWithImages[]
  isLoading: boolean
  error: Error | null
  viewMode?: 'grid' | 'list'
}

export function ProductGrid({ products, isLoading, error, viewMode = 'grid' }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-100 overflow-hidden animate-pulse"
          >
            <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100" />
            <div className="p-5 space-y-3">
              <div className="h-2.5 bg-gray-100 rounded-full w-16" />
              <div className="h-4 bg-gray-100 rounded-full w-3/4" />
              <div className="flex gap-1.5">
                <div className="h-6 bg-gray-50 rounded-full w-16 border border-gray-100" />
                <div className="h-6 bg-gray-50 rounded-full w-14 border border-gray-100" />
                <div className="h-6 bg-gray-50 rounded-full w-16 border border-gray-100" />
              </div>
              <div className="h-6 bg-gray-100 rounded-full w-24 mt-1" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
          <span className="text-2xl font-bold text-red-400">!</span>
        </div>
        <h3 className="font-bold text-lg text-[#1d1d1f]">
          Failed to load products
        </h3>
        <p className="text-sm text-gray-400 mt-1.5 max-w-sm">
          {error.message}
        </p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-5">
          <Laptop className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="font-bold text-lg text-[#1d1d1f]">No laptops found</h3>
        <p className="text-sm text-gray-400 mt-1.5 max-w-sm">
          Try adjusting your filters or search query to find what you're looking
          for.
        </p>
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {products.map(product => (
          <div key={product.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[240px_1fr] md:items-center">
              <div className="overflow-hidden rounded-xl bg-gray-50">
                <ProductCard product={product} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-[#0f172a]">{product.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-3">{product.description}</p>
                <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                  <span className="rounded-full bg-gray-100 px-3 py-1">{product.processor}</span>
                  <span className="rounded-full bg-gray-100 px-3 py-1">{product.ram}</span>
                  <span className="rounded-full bg-gray-100 px-3 py-1">{product.storage}</span>
                  <span className="rounded-full bg-gray-100 px-3 py-1">{product.graphics_card}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
