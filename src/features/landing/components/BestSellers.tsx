import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { ProductCard } from '@/features/products/components/ProductCard'
import { useProducts } from '@/features/products/hooks/useProducts'
import { DEFAULT_FILTERS } from '@/features/products/types'

const tabs = [
  { id: 'Windows', label: 'Windows' },
  { id: 'macOS', label: 'macOS' },
]

export function BestSellers() {
  const [activeTab, setActiveTab] = useState<'Windows' | 'macOS'>('Windows')

  const filters = useMemo(() => ({
    ...DEFAULT_FILTERS,
    operatingSystems: [activeTab],
    sortBy: 'price_desc' as const,
  }), [activeTab])

  const { data: products = [], isLoading, error } = useProducts(filters)
  const list = products.slice(0, 8)

  return (
    <section className="bg-[#f8f9fa] py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1260px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#e63946]">
              Meilleures ventes
            </p>
            <h2 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-[#0f172a] sm:text-4xl">
              Top laptops par OS
            </h2>
          </div>
          <div className="flex gap-2 rounded-full bg-white p-1 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'Windows' | 'macOS')}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition-all',
                  activeTab === tab.id
                    ? 'bg-[#0f5dcf] text-white shadow-sm'
                    : 'text-[#0f172a] hover:text-[#0f5dcf]',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Impossible de charger les produits : {error.message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {(isLoading ? Array.from({ length: 4 }) : list).map((product, idx) => (
            <div key={product ? (product as any).id : idx} className="h-full">
              {isLoading ? (
                <div className="h-full rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="aspect-[4/3] rounded-xl bg-gray-100" />
                  <div className="mt-4 h-3 w-24 rounded-full bg-gray-200" />
                  <div className="mt-2 h-4 w-40 rounded-full bg-gray-200" />
                </div>
              ) : (
                <ProductCard product={product} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
