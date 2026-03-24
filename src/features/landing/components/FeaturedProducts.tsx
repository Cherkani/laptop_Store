import { Link } from 'react-router-dom'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/features/products/components/ProductCard'
import { useFeaturedProducts } from '@/features/products/hooks/useProducts'

export function FeaturedProducts() {
  const { data: products, isLoading } = useFeaturedProducts()

  if (!isLoading && (!products || products.length === 0)) return null

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">Handpicked</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">Featured Laptops</h2>
            <p className="text-muted-foreground mt-2">Our top picks for exceptional performance and value</p>
          </div>
          <Button variant="outline" asChild className="hidden sm:flex">
            <Link to="/products">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products?.slice(0, 8).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="flex justify-center mt-8 sm:hidden">
          <Button asChild>
            <Link to="/products">View all laptops <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
