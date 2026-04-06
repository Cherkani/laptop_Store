import { Link } from 'react-router-dom'
import { ArrowRight, Loader2 } from 'lucide-react'
import { ProductCard } from '@/features/products/components/ProductCard'
import { useFeaturedProducts } from '@/features/products/hooks/useProducts'
import { ScrollReveal } from './ScrollReveal'

export function FeaturedProducts() {
  const { data: products, isLoading } = useFeaturedProducts()

  if (!isLoading && (!products || products.length === 0)) return null

  return (
    <section className="bg-[#0a0f1a] py-14 sm:py-18 lg:py-24">
      <div className="mx-auto max-w-[1260px] px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-10 flex items-end justify-between gap-4 lg:mb-14">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
                Recommandés
              </p>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Sélection de l'équipe.
              </h2>
              <p className="mt-2 text-base text-white/50 sm:text-lg">
                Nos meilleures recommandations du moment.
              </p>
            </div>
            <Link
              to="/products"
              className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-white/50 transition-colors hover:text-white sm:inline-flex"
            >
              Tout voir
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin text-white/20" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400"
          >
            Voir tous les laptops
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
