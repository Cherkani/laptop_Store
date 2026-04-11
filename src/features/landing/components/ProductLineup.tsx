import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useProducts } from '@/features/products/hooks/useProducts'
import { DEFAULT_FILTERS } from '@/features/products/types'
import { cn, formatPrice, getImageSrc } from '@/lib/utils'
import { ScrollReveal } from './ScrollReveal'
import { Section } from '@/components/shared/Section'

const FILTER_BRANDS = ['Tous', 'HP', 'Microsoft', 'Dell', 'Lenovo'] as const
type BrandFilter = (typeof FILTER_BRANDS)[number]

export function ProductLineup() {
  const { data: products, isLoading } = useProducts(DEFAULT_FILTERS)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [brandFilter, setBrandFilter] = useState<BrandFilter>('Tous')

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [products])

  const scroll = (direction: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: direction === 'left' ? -400 : 400, behavior: 'smooth' })
  }

  const filtered =
    brandFilter === 'Tous'
      ? products
      : products?.filter(p => p.brand.toLowerCase().includes(brandFilter.toLowerCase()))

  if (!isLoading && (!filtered || filtered.length === 0)) return null

  return (
    <Section bg="bg-surface-sunken" className="relative" as="section">
      {/* Subtle top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
        {/* Header */}
        <ScrollReveal>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-500">
                Sélection
              </p>
              <h2 className="mt-1.5 font-display text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
                Produits en avant
              </h2>
            </div>
            <Link
              to="/products"
              className="hidden items-center gap-1.5 text-sm font-semibold text-on-surface-subtle transition-colors hover:text-on-surface sm:inline-flex"
            >
              Voir tout
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>

        {/* Brand filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          {FILTER_BRANDS.map(label => (
            <button
              key={label}
              onClick={() => setBrandFilter(label)}
              className={cn(
                'rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-95',
                brandFilter === label
                  ? 'border-amber-500 bg-amber-500/15 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'border-border-subtle bg-surface-raised/50 text-on-surface-subtle hover:border-border hover:text-on-surface-muted',
              )}
            >
              {label === 'Microsoft' ? 'Surface' : label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin text-on-surface-faint" />
          </div>
        ) : (
          <div className="relative">
            {/* Scroll buttons */}
            {canScrollLeft && (
              <button
                onClick={() => scroll('left')}
                className="absolute -left-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border-subtle bg-surface-raised text-on-surface shadow-xl transition hover:bg-surface-overlay md:flex"
                aria-label="Défiler à gauche"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {canScrollRight && (
              <button
                onClick={() => scroll('right')}
                className="absolute -right-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border-subtle bg-surface-raised text-on-surface shadow-xl transition hover:bg-surface-overlay md:flex"
                aria-label="Défiler à droite"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}

            {/* Cards track */}
            <div
              ref={scrollRef}
              onScroll={checkScroll}
              className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide"
            >
              {filtered?.map((product, index) => {
                const primaryImage =
                  product.product_images?.find(img => img.is_primary) ?? product.product_images?.[0]
                const imageUrl = getImageSrc(primaryImage)

                return (
                  <ScrollReveal
                    key={product.id}
                    delay={index * 60}
                    className="w-[290px] shrink-0 snap-start sm:w-[330px]"
                  >
                    <Link
                      to={`/products/${product.id}`}
                      className="group block overflow-hidden rounded-2xl border border-border-faint bg-surface-raised p-5 transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
                    >
                      {/* Brand + name */}
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-faint">
                        {product.brand}
                      </p>
                      <h3 className="mt-1 line-clamp-2 text-base font-bold tracking-tight text-on-surface">
                        {product.name}
                      </h3>

                      {/* Image */}
                      <div className="mt-4 flex h-44 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-surface-overlay to-surface-overlay">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-3xl font-black text-on-surface-faint">
                            {product.brand?.[0]}
                          </span>
                        )}
                      </div>

                      {/* Specs */}
                      <p className="mt-4 line-clamp-1 text-xs text-on-surface-faint">
                        {product.processor} · {product.ram} · {product.storage}
                      </p>

                      {/* Price row */}
                      <div className="mt-4 flex items-end justify-between">
                        <div>
                          <p className="text-lg font-extrabold tracking-tight text-on-surface">
                            {formatPrice(product.price)}
                          </p>
                          {product.original_price && product.original_price > product.price && (
                            <p className="text-xs text-on-surface-faint line-through">
                              {formatPrice(product.original_price)}
                            </p>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 transition-all group-hover:gap-2">
                          Voir plus
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </Link>
                  </ScrollReveal>
                )
              })}
            </div>
          </div>
        )}

        {/* Mobile view all */}
        <div className="mt-6 sm:hidden">
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400"
          >
            Voir tous les produits
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
    </Section>
  )
}
