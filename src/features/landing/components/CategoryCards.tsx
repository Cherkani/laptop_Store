import { Link } from 'react-router-dom'
import { ArrowRight, Briefcase, Clapperboard, Code2, Gamepad2 } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

const categories = [
  {
    title: 'Pour les créatifs',
    description: 'Écrans haute résolution, GPU rapides et autonomie solide pour créer sans limite.',
    icon: Clapperboard,
    href: '/advisor/creators',
    accent: 'from-violet-500/20 to-pink-500/10',
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/15 ring-violet-500/20',
    arrowColor: 'text-violet-400',
  },
  {
    title: 'Pour les développeurs',
    description: 'Compilez rapidement et faites tourner plusieurs outils en simultané.',
    icon: Code2,
    href: '/advisor/developers',
    accent: 'from-sky-500/20 to-blue-500/10',
    iconColor: 'text-sky-400',
    iconBg: 'bg-sky-500/15 ring-sky-500/20',
    arrowColor: 'text-sky-400',
  },
  {
    title: 'Pour les entreprises',
    description: 'Appareils fiables conçus pour la productivité et la portabilité.',
    icon: Briefcase,
    href: '/advisor/business',
    accent: 'from-emerald-500/20 to-teal-500/10',
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/15 ring-emerald-500/20',
    arrowColor: 'text-emerald-400',
  },
  {
    title: 'Pour les gamers',
    description: 'Graphismes puissants et dalles haute fréquence pour une expérience immersive.',
    icon: Gamepad2,
    href: '/advisor/gaming',
    accent: 'from-orange-500/20 to-red-500/10',
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/15 ring-orange-500/20',
    arrowColor: 'text-orange-400',
  },
]

export function CategoryCards() {
  return (
    <section className="bg-[#070c15] py-14 sm:py-18 lg:py-24">
      <div className="mx-auto max-w-[1260px] px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-10 lg:mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
              Catégories
            </p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Trouvez votre laptop.
            </h2>
            <p className="mt-2 max-w-lg text-base text-white/50 sm:text-lg">
              Un ordinateur adapté à votre façon de travailler.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((category, index) => (
            <ScrollReveal key={category.title} delay={index * 80}>
              <Link
                to={category.href}
                className={`group relative block overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br ${category.accent} p-7 transition-all duration-300 hover:-translate-y-1 hover:border-white/12 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]`}
              >
                {/* Subtle noise texture overlay */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[#0f1726]/70" />

                <div className="relative">
                  <div
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${category.iconBg}`}
                  >
                    <category.icon className={`h-5 w-5 ${category.iconColor}`} />
                  </div>
                  <h3 className="mt-5 text-xl font-bold tracking-tight text-white">
                    {category.title}
                  </h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/50">
                    {category.description}
                  </p>
                  <div
                    className={`mt-5 inline-flex items-center gap-1.5 text-sm font-semibold ${category.arrowColor}`}
                  >
                    Explorer
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
