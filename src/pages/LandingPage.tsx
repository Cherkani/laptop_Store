import { StoreHero } from '@/features/landing/components/StoreHero'
import { ProductLineup } from '@/features/landing/components/ProductLineup'
import { WhyUs } from '@/features/landing/components/WhyUs'
import { FeatureHighlights } from '@/features/landing/components/FeatureHighlights'
import { CategoryCards } from '@/features/landing/components/CategoryCards'
import { FeaturedProducts } from '@/features/landing/components/FeaturedProducts'
import { NewsletterSection } from '@/features/landing/components/NewsletterSection'

export function LandingPage() {
  return (
    <div className="theme-shell">
      <div className="pointer-events-none absolute inset-x-0 top-24 z-0 h-[520px] overflow-hidden">
        <div className="orb-float absolute left-[6%] top-0 h-52 w-52 rounded-full bg-[#59b8ff]/30 blur-3xl" />
        <div className="orb-float-delay absolute right-[8%] top-12 h-64 w-64 rounded-full bg-[#4bd4c6]/20 blur-3xl" />
      </div>

      <div className="relative z-10">
        <StoreHero />
        <ProductLineup />
        <WhyUs />
        <FeatureHighlights />
        <CategoryCards />
        <FeaturedProducts />
        <NewsletterSection />
      </div>
    </div>
  )
}
