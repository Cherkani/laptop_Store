import { Award, RotateCcw, ShieldCheck, Truck } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

const features = [
  {
    icon: ShieldCheck,
    title: 'Quality verified',
    description: 'Every laptop passes a strict multi-point diagnostic before it ships.',
  },
  {
    icon: Award,
    title: 'Warranty included',
    description: 'Clear coverage terms with support from real specialists.',
  },
  {
    icon: Truck,
    title: 'Fast delivery',
    description: 'Carefully packed orders with tracked shipping across the country.',
  },
  {
    icon: RotateCcw,
    title: 'Easy returns',
    description: '30-day returns so you can buy with confidence.',
  },
]

export function WhyUs() {
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-[1260px] mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-8 sm:mb-10 lg:mb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#607086]">
              Why us
            </p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-[#1d1d1f] sm:text-4xl lg:text-5xl">
              The TechFiable difference.
            </h2>
            <p className="mt-2 text-base text-[#5d6675] sm:text-lg">
              More reasons to shop with confidence.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <ScrollReveal key={feature.title} delay={index * 80}>
              <div className="glass-card lift-card h-full rounded-3xl p-6">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e8f3ff] to-[#eaf9f7] text-[#0f5dcf]">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-xl font-bold tracking-tight text-[#172033]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5b6472]">
                  {feature.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
