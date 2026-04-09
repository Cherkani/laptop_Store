import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { ProductCard } from '@/features/products/components/ProductCard'
import { useProducts } from '@/features/products/hooks/useProducts'
import { DEFAULT_FILTERS } from '@/features/products/types'
import type { ProductWithImages } from '@/types/database.types'
import { Section } from '@/components/shared/Section'

type OS = 'Windows' | 'macOS'

const WINDOWS_BRANDS = ['Tous', 'HP', 'Surface', 'Dell', 'Lenovo'] as const
type WindowsBrand = (typeof WINDOWS_BRANDS)[number]
type MacChip = 'Tous' | string

function normalizeMacChip(processor?: string | null): string | null {
  if (!processor) return null
  const match = processor.match(/m\s?([123])(?:\s?(pro|max|ultra))?/i)
  if (!match) return null
  const gen = `M${match[1]}`
  const tier = match[2] ? match[2].toUpperCase() : ''
  return tier ? `${gen} ${tier}` : gen
}

export function BestSellers() {
  const [activeOS, setActiveOS] = useState<OS>('Windows')
  const [windowsBrand, setWindowsBrand] = useState<WindowsBrand>('Tous')
  const [macChip, setMacChip] = useState<MacChip>('Tous')

  const filters = useMemo(
    () => ({ ...DEFAULT_FILTERS, operatingSystems: [activeOS], sortBy: 'price_desc' as const }),
    [activeOS],
  )

  const { data: products = [], isLoading, error } = useProducts(filters)

  const list = useMemo(() => {
    let items = products as ProductWithImages[]
    if (activeOS === 'Windows' && windowsBrand !== 'Tous') {
      const search = windowsBrand === 'Surface' ? 'microsoft' : windowsBrand.toLowerCase()
      items = items.filter(p => p.brand.toLowerCase().includes(search))
    }
    if (activeOS === 'macOS' && macChip !== 'Tous') {
      items = items.filter(p => normalizeMacChip(p.processor) === macChip)
    }
    return items.slice(0, 8)
  }, [products, activeOS, windowsBrand, macChip])

  return (
    <Section>
        {/* Header row */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-400">
              Meilleures ventes
            </p>
            <h2 className="mt-1.5 font-display text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
              Top laptops par OS
            </h2>
          </div>

          {/* OS Tab switcher */}
          <div className="flex gap-1 rounded-xl border border-border-subtle bg-surface-raised/60 p-1">
            {(['Windows', 'macOS'] as OS[]).map(os => (
              <button
                key={os}
                onClick={() => {
                  setActiveOS(os)
                  setWindowsBrand('Tous')
                  setMacChip('Tous')
                }}
                className={cn(
                  'rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-200',
                  activeOS === os
                    ? 'bg-[#0f5dcf] text-on-surface shadow-[0_2px_10px_rgba(15,93,207,0.4)]'
                    : 'text-on-surface-subtle hover:text-on-surface-muted',
                )}
              >
                {os}
              </button>
            ))}
          </div>
        </div>

        {/* Windows brand sub-filters */}
        {activeOS === 'Windows' && (
          <div className="mb-7 flex flex-wrap gap-2">
            {WINDOWS_BRANDS.map(brand => (
              <button
                key={brand}
                onClick={() => setWindowsBrand(brand)}
                className={cn(
                  'rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-95',
                  windowsBrand === brand
                    ? 'border-amber-500 bg-amber-500/15 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                    : 'border-border-subtle bg-surface-raised/50 text-on-surface-subtle hover:border-border hover:text-on-surface-muted',
                )}
              >
                {brand}
              </button>
            ))}
          </div>
        )}

        {activeOS === 'macOS' && (
          <div className="mb-7 flex flex-wrap gap-2">
            {(['Tous', ...Array.from(new Set(products
              .map(p => normalizeMacChip(p.processor))
              .filter(Boolean) as string[]))] as MacChip[]).map(chip => (
              <button
                key={chip}
                onClick={() => setMacChip(chip)}
                className={cn(
                  'rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-95',
                  macChip === chip
                    ? 'border-amber-500 bg-amber-500/15 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                    : 'border-border-subtle bg-surface-raised/50 text-on-surface-subtle hover:border-border hover:text-on-surface-muted',
                )}
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            Impossible de charger les produits : {error.message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {(isLoading ? Array<ProductWithImages | null>(8).fill(null) : list).map((product, idx) => (
            <div key={product ? product.id : idx} className="h-full">
              {isLoading ? (
                <div className="h-full animate-pulse rounded-2xl border border-border-faint bg-surface-raised p-4">
                  <div className="aspect-[4/3] rounded-xl bg-surface-raised/60" />
                  <div className="mt-4 h-2.5 w-16 rounded-full bg-surface-raised/70" />
                  <div className="mt-2.5 h-4 w-36 rounded-full bg-muted/50" />
                  <div className="mt-2 h-2.5 w-28 rounded-full bg-surface-raised/60" />
                  <div className="mt-4 h-6 w-24 rounded-full bg-muted/50" />
                </div>
              ) : (
                <ProductCard product={product as ProductWithImages} />
              )}
            </div>
          ))}
        </div>
    </Section>
  )
}
