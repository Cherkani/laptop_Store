import { Link } from 'react-router-dom'
import { ArrowRight, Briefcase, Clapperboard, Code2, Gamepad2 } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

const categories = [
  {
    title: 'For creators',
    description: 'High-resolution displays, fast GPUs, and strong battery life.',
    icon: Clapperboard,
    href: '/advisor/creators',
    bg: 'from-[#fcfdff] to-[#eef5ff]',
  },
  {
    title: 'For developers',
    description: 'Compile quickly and run multiple tools with confidence.',
    icon: Code2,
    href: '/advisor/developers',
    bg: 'from-[#fbfbfd] to-[#f1f1f6]',
  },
  {
    title: 'For business',
    description: 'Reliable devices built for productivity and portability.',
    icon: Briefcase,
    href: '/advisor/business',
    bg: 'from-[#f9fcff] to-[#e8f5f2]',
  },
  {
    title: 'For gaming',
    description: 'Powerful graphics and high refresh-rate panels.',
    icon: Gamepad2,
    href: '/advisor/gaming',
    bg: 'from-[#fdfdff] to-[#f2eeff]',
  },
]

export function CategoryCards() {
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-[1260px] mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-8 sm:mb-10 lg:mb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#607086]">
              Categories
            </p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-[#1d1d1f] sm:text-4xl lg:text-5xl">
              Shop by workflow.
            </h2>
            <p className="mt-2 text-base text-[#5d6675] sm:text-lg">
              Find a laptop that matches the way you work.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((category, index) => (
            <ScrollReveal key={category.title} delay={index * 80}>
              <Link
                to={category.href}
                className={`group lift-card block rounded-3xl bg-gradient-to-br ${category.bg} p-7 ring-1 ring-black/5`}
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#1d1d1f] shadow-sm ring-1 ring-black/5">
                  <category.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-2xl font-bold tracking-tight text-[#172033]">
                  {category.title}
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#556074] sm:text-base">
                  {category.description}
                </p>
                <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0f5dcf]">
                  Browse collection
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
