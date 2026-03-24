import { HeroSection } from '@/features/landing/components/HeroSection'
import { FeaturedProducts } from '@/features/landing/components/FeaturedProducts'
import { CategoryCards } from '@/features/landing/components/CategoryCards'
import { WhyUs } from '@/features/landing/components/WhyUs'
import { NewsletterSection } from '@/features/landing/components/NewsletterSection'

export function LandingPage() {
  return (
    <div>
      <HeroSection />
      <FeaturedProducts />
      <CategoryCards />
      <WhyUs />
      <NewsletterSection />
    </div>
  )
}
