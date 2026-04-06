import { StoreHero } from '@/features/landing/components/StoreHero'
import { ProductLineup } from '@/features/landing/components/ProductLineup'
import { WhyUs } from '@/features/landing/components/WhyUs'
import { FeatureHighlights } from '@/features/landing/components/FeatureHighlights'
import { CategoryCards } from '@/features/landing/components/CategoryCards'
import { FeaturedProducts } from '@/features/landing/components/FeaturedProducts'
import { BrandStrip } from '@/features/landing/components/BrandStrip'
import { BestSellers } from '@/features/landing/components/BestSellers'
import { PromoBanner } from '@/features/landing/components/PromoBanner'
import { StockLocal } from '@/features/landing/components/StockLocal'

export function LandingPage() {
  return (
    <div className="bg-[#0a0f1a]">
      <StoreHero />
      <BrandStrip />
      <ProductLineup />
      <BestSellers />
      <WhyUs />
      <FeatureHighlights />
      <PromoBanner />
      <CategoryCards />
      <FeaturedProducts />
      <StockLocal />
    </div>
  )
}
