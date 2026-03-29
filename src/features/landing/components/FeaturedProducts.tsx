import { Link } from 'react-router-dom'
import { ArrowRight, Loader2 } from 'lucide-react'
import { ProductCard } from '@/features/products/components/ProductCard'
import { useFeaturedProducts } from '@/features/products/hooks/useProducts'
import { ScrollReveal } from './ScrollReveal'

export function FeaturedProducts() {
  const { data: products, isLoading } = useFeaturedProducts()

  if (!isLoading && (!products || products.length === 0)) return null

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-[1260px] mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10 lg:mb-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#607086]">
                Recommended
              </p>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-[#1d1d1f] sm:text-4xl lg:text-5xl">
                Staff picks.
              </h2>
              <p className="mt-2 text-base text-[#5d6675] sm:text-lg">
                Top recommendations from our team.
              </p>
            </div>
            <Link
              to="/products"
              className="hidden items-center gap-1.5 text-base font-semibold text-[#0f5dcf] hover:text-[#004999] sm:inline-flex"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#8e8e93]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products?.slice(0, 8).map((product, index) => (
              <ScrollReveal key={product.id} delay={index * 60}>
                <ProductCard product={product} />
              </ScrollReveal>
            ))}
          </div>
        )}

        <div className="mt-8 sm:hidden">
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-base font-semibold text-[#0066cc] hover:text-[#004999]"
          >
            View all laptops
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
