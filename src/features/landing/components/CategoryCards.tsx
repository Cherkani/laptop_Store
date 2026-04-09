import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

// Bento layout:
//  Desktop: [créatifs — tall left] | [devs top-right] [entreprises top-right]
//                                  | [gamers — full-width bottom]
// Mobile: stacked single column

const categories = [
  {
    id:          'creators',
    badge:       'Créatifs',
    title:       'Pour les créatifs',
    description: 'Écrans haute résolution, GPU rapides et autonomie solide pour créer sans limite.',
    href:        '/advisor/creators',
    image:       'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=1400&q=90',
    // tall left card
    colSpan: 'lg:col-span-1',
    rowSpan: 'lg:row-span-2',
    tall:    true,
  },
  {
    id:          'developers',
    badge:       'Développeurs',
    title:       'Pour les développeurs',
    description: 'Compilez rapidement et faites tourner plusieurs outils en simultané.',
    href:        '/advisor/developers',
    image:       'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1400&q=90',
    colSpan: 'lg:col-span-1',
    rowSpan: '',
    tall:    false,
  },
  {
    id:          'business',
    badge:       'Entreprises',
    title:       'Pour les entreprises',
    description: 'Appareils fiables conçus pour la productivité et la portabilité.',
    href:        '/advisor/business',
    image:       'https://images.unsplash.com/photo-1556761175-129418cb2dfe?auto=format&fit=crop&w=1400&q=90',
    colSpan: 'lg:col-span-1',
    rowSpan: '',
    tall:    false,
  },
  {
    id:          'gaming',
    badge:       'Gamers',
    title:       'Pour les gamers',
    description: 'Graphismes puissants et dalles haute fréquence pour une expérience immersive.',
    href:        '/advisor/gaming',
    // Better gaming laptop image
    image:       'https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&w=2000&q=90',
    colSpan: 'lg:col-span-2',
    rowSpan: '',
    tall:    false,
    wide:    true,
  },
]

export function CategoryCards() {
  return (
    <section className="relative overflow-hidden bg-[#f0f4ff] py-20 sm:py-28">
      {/* Soft ambient glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 -top-24 h-96 w-96 rounded-full bg-amber-400/12 blur-[96px]" />
        <div className="absolute right-[-10%] bottom-[-20%] h-96 w-96 rounded-full bg-sky-400/10 blur-[96px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">

        {/* Header */}
        <ScrollReveal>
          <div className="mb-12 flex flex-col gap-2 lg:mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-500">
              Catégories
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl lg:text-5xl">
                Trouvez votre laptop.
              </h2>
              <p className="max-w-xs text-sm leading-relaxed text-on-surface-subtle sm:text-right">
                Un ordinateur adapté à votre façon de travailler.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Bento grid
            Desktop (lg): 2-col, 2-row grid
              Col 1 Row 1+2 → Créatifs (tall)
              Col 2 Row 1   → Développeurs
              Col 2 Row 2   → Entreprises
              Col 1+2 Row 3 → Gamers (wide, separate row)
        */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr] lg:grid-rows-[320px_260px_280px]">

          {categories.map((cat, idx) => (
            <ScrollReveal
              key={cat.id}
              delay={idx * 70}
              className={[
                'flex flex-col',
                cat.tall ? 'lg:row-span-2' : '',
                cat.wide ? 'sm:col-span-2 lg:col-span-2' : '',
              ].filter(Boolean).join(' ')}
            >
              <Link
                to={cat.href}
                className={[
                  'group relative flex h-full overflow-hidden rounded-3xl',
                  cat.tall ? 'min-h-[420px]' : '',
                  cat.wide ? 'min-h-[280px]' : '',
                  !cat.tall && !cat.wide ? 'min-h-[260px]' : '',
                ].filter(Boolean).join(' ')}
              >
                {/* Background image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                  style={{ backgroundImage: `url(${cat.image})` }}
                />

                {/* Overlay adapts to theme */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/5 transition-opacity duration-300 group-hover:from-black/80 dark:from-black/78 dark:via-black/35 dark:to-black/10" />
                <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/35 to-white/10 opacity-0 transition-opacity duration-300 dark:opacity-0 group-hover:opacity-30 dark:group-hover:opacity-0" />

                {/* Subtle amber bottom glow on hover */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-amber-500/0 opacity-0 transition-opacity duration-500 group-hover:from-amber-500/12 group-hover:opacity-100" />

                {/* Border ring */}
                <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/12 transition duration-300 group-hover:ring-amber-500/30 dark:ring-white/8" />

                {/* Content */}
                <div className="relative mt-auto w-full p-6">
                  {/* Badge */}
                  <span className="inline-flex items-center rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white/80 backdrop-blur-sm dark:border-white/15">
                    {cat.badge}
                  </span>

                  <h3 className="mt-3 text-xl font-bold leading-tight text-white sm:text-2xl">
                    {cat.title}
                  </h3>

                  <p className="mt-1.5 text-sm leading-relaxed text-white/80">
                    {cat.description}
                  </p>

                  {/* Explorer link */}
                  <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-amber-400 transition-all duration-300 group-hover:gap-2.5">
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
