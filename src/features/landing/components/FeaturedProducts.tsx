import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { ProductCard } from '@/features/products/components/ProductCard'
import { useFeaturedProducts } from '@/features/products/hooks/useProducts'
import { ScrollReveal } from './ScrollReveal'
import { Section } from '@/components/shared/Section'

export function FeaturedProducts() {
  const { data: products, isLoading } = useFeaturedProducts()
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  if (!isLoading && (!products || products.length === 0)) return null

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 8)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
  }

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const delta = dir === 'left' ? -340 : 340
    el.scrollBy({ left: delta, behavior: 'smooth' })
  }

  useEffect(() => {
    checkScroll()
    const handleResize = () => checkScroll()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <Section>
        <ScrollReveal>
          <div className="mb-10 flex items-end justify-between gap-4 lg:mb-14">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-faint">
                Recommandés
              </p>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl lg:text-5xl">
                Sélection de l'équipe.
              </h2>
              <p className="mt-2 text-base text-on-surface-subtle sm:text-lg">
                Nos meilleures recommandations du moment.
              </p>
            </div>
            <Link
              to="/products"
              className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-on-surface-subtle transition-colors hover:text-on-surface sm:inline-flex"
            >
              Tout voir
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin text-on-surface-faint" />
          </div>
        ) : (
          <div className="relative">
            {/* Scroll buttons (desktop) */}
            {canScrollLeft && (
              <button
                onClick={() => scroll('left')}
                className="absolute -left-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border-subtle bg-white/90 text-on-surface shadow-xl backdrop-blur transition hover:bg-white md:flex"
                aria-label="Défiler à gauche"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {canScrollRight && (
              <button
                onClick={() => scroll('right')}
                className="absolute -right-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border-subtle bg-white/90 text-on-surface shadow-xl backdrop-blur transition hover:bg-white md:flex"
                aria-label="Défiler à droite"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}

            <div
              ref={scrollRef}
              onScroll={checkScroll}
              className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide sm:mx-0"
            >
              {products?.slice(0, 12).map((product, index) => (
                <ScrollReveal key={product.id} delay={index * 50} className="snap-start">
                  <div className="w-[260px] shrink-0 sm:w-[300px]">
                    <ProductCard product={product} />
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 sm:hidden">
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400"
          >
            Voir tous les laptops
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
    </Section>
  )
}
