import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useFeaturedProducts } from '@/features/products/hooks/useProducts'
import { formatPrice } from '@/lib/utils'
import { ScrollReveal } from './ScrollReveal'

export function ProductLineup() {
  const { data: products, isLoading } = useFeaturedProducts()
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
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: direction === 'left' ? -420 : 420, behavior: 'smooth' })
  }

  if (!isLoading && (!products || products.length === 0)) return null

  return (
    <section className="relative py-12 sm:py-16 lg:py-20">
      <div className="max-w-[1260px] mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10 lg:mb-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#607086]">
                Curated now
              </p>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-[#1d1d1f] sm:text-4xl lg:text-5xl">
                The latest.
                <span className="ml-2 headline-gradient">Built to impress.</span>
              </h2>
            </div>
            <span className="hidden rounded-full border border-[#c8d8e9] bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#57708a] md:inline-flex">
              Swipe to explore
            </span>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <p className="mb-6 max-w-2xl text-base text-[#5d6675] sm:mb-8 sm:text-lg">
            Fresh arrivals in certified refurbished laptops.
          </p>
        </ScrollReveal>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#8e8e93]" />
          </div>
        ) : (
          <div className="relative group">
            {canScrollLeft && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1d1d1f] shadow-[0_8px_20px_rgba(15,23,42,0.16)] ring-1 ring-black/5 transition md:flex"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {canScrollRight && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1d1d1f] shadow-[0_8px_20px_rgba(15,23,42,0.16)] ring-1 ring-black/5 transition md:flex"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}

            <div
              ref={scrollRef}
              onScroll={checkScroll}
              className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-3 scrollbar-hide"
            >
              {products?.map((product, index) => {
                const primaryImage = (
                  product.product_images as Array<{
                    is_primary: boolean
                    image_url: string
                  }>
                )?.find(img => img.is_primary)

                const imageUrl =
                  primaryImage?.image_url ||
                  (
                    product.product_images as Array<{ image_url: string }>
                  )?.[0]?.image_url

                return (
                  <ScrollReveal
                    key={product.id}
                    delay={index * 70}
                    className="w-[305px] shrink-0 snap-start sm:w-[360px]"
                  >
                    <Link
                      to={`/products/${product.id}`}
                      className="glass-card lift-card block overflow-hidden rounded-[28px] p-6"
                    >
                      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#617084]">
                        {product.brand}
                      </p>
                      <h3 className="mt-1 text-2xl font-bold tracking-tight text-[#1d1d1f]">
                        {product.name}
                      </h3>

                      <div className="mt-6 flex h-48 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f8fbff] via-[#f5f8ff] to-[#eef5ff] ring-1 ring-black/5">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="max-h-full max-w-full object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-16 w-24 items-center justify-center rounded-xl bg-[#ebebf0]">
                            <span className="text-2xl font-black text-[#b5b5bd]">
                              {product.brand?.[0]}
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="mt-5 line-clamp-2 text-sm text-[#5a6473]">
                        {product.processor} · {product.ram} · {product.storage}
                      </p>

                      <div className="mt-5 flex items-end justify-between">
                        <div>
                          <p className="text-xl font-bold tracking-tight text-[#1d1d1f]">
                            {formatPrice(product.price)}
                          </p>
                          {product.original_price && product.original_price > product.price && (
                            <p className="text-sm text-[#8e8e93] line-through">
                              {formatPrice(product.original_price)} new
                            </p>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#0f5dcf]">
                          Learn more
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </Link>
                  </ScrollReveal>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
