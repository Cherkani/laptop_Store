import { StoreHero } from '@/features/landing/components/StoreHero'
import { WhyUs } from '@/features/landing/components/WhyUs'
import { FeatureHighlights } from '@/features/landing/components/FeatureHighlights'
import { CategoryCards } from '@/features/landing/components/CategoryCards'
import { FeaturedProducts } from '@/features/landing/components/FeaturedProducts'
import { BrandStrip } from '@/features/landing/components/BrandStrip'
import { BestSellers } from '@/features/landing/components/BestSellers'
import { PromoBanner } from '@/features/landing/components/PromoBanner'
import { ProductsCarousel } from '@/features/landing/components/ProductsCarousel'
import { StockLocal } from '@/features/landing/components/StockLocal'
export function LandingPage() {
  return (
    <div className="bg-surface-base">
      <StoreHero />
      <BrandStrip />
      <BestSellers />
      <WhyUs />
      <FeatureHighlights />
      <PromoBanner />
      <CategoryCards />
      <FeaturedProducts />
      <ProductsCarousel />
      <StockLocal />
    </div>
  )
}
