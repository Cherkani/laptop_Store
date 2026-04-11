import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useProducts } from '@/features/products/hooks/useProducts'
import { DEFAULT_FILTERS } from '@/features/products/types'
import { ProductCard } from '@/features/products/components/ProductCard'
import { Section } from '@/components/shared/Section'
import { ScrollReveal } from './ScrollReveal'

export function ProductsCarousel() {
  const { data: products, isLoading } = useProducts(DEFAULT_FILTERS)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

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

  if (!isLoading && (!products || products.length === 0)) return null

  return (
    <Section bg="bg-sky-50 dark:bg-sky-900/25" className="relative">
      <ScrollReveal>
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-500">Catalogue</p>
            <h2 className="mt-1.5 font-display text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
              Tous nos produits
            </h2>
          </div>
          <div className="hidden gap-2 md:flex">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-surface-raised text-on-surface shadow transition hover:bg-surface-overlay disabled:opacity-30"
              aria-label="Défiler à gauche"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-surface-raised text-on-surface shadow transition hover:bg-surface-overlay disabled:opacity-30"
              aria-label="Défiler à droite"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </ScrollReveal>

      {isLoading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-80 w-[280px] shrink-0 animate-pulse rounded-2xl bg-surface-raised" />
          ))}
        </div>
      ) : (
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide"
        >
          {products?.map((product, index) => (
            <ScrollReveal
              key={product.id}
              delay={index * 50}
              className="w-[280px] shrink-0 snap-start sm:w-[300px]"
            >
              <ProductCard product={product} />
            </ScrollReveal>
          ))}
        </div>
      )}
    </Section>
  )
}
