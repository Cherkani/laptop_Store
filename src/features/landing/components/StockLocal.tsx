import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Package, Zap } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'
import { Section } from '@/components/shared/Section'

const highlights = [
  { icon: Package, text: 'Stock réel disponible immédiatement' },
  { icon: Zap, text: 'Expédition rapide depuis le Maroc' },
  { icon: MapPin, text: 'Support local fiable inclus' },
]

export function StockLocal() {
  return (
    <Section bg="bg-surface-sunken">
        <div className="overflow-hidden rounded-3xl border border-border-faint bg-surface-raised">
          <div className="grid lg:grid-cols-2 lg:items-stretch">
            {/* Left: Images */}
            <ScrollReveal
              direction="left"
              className="relative min-h-[260px] overflow-hidden lg:min-h-[480px]"
            >
              {/* Stack of images */}
              <div className="absolute inset-0 z-[3]">
                <img
                  src="/local_store.png"
                  alt="Stock local"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-surface-raised/80 lg:block hidden" />
              </div>
              {/* Layered images desktop only */}
              <div className="absolute bottom-6 right-6 z-[4] hidden flex-col gap-2 lg:flex">
                <div className="h-24 w-36 overflow-hidden rounded-xl border border-border-subtle shadow-xl opacity-80">
                  {/* secondary shot intentionally removed */}
                </div>
                <div className="h-20 w-32 overflow-hidden rounded-xl border border-border-subtle shadow-xl opacity-50 self-end">
                  {/* tertiary shot intentionally removed */}
                </div>
              </div>
            </ScrollReveal>

            {/* Right: Content */}
            <ScrollReveal delay={100} className="flex flex-col justify-center p-8 lg:p-12">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">
                Local & Rapide
              </p>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
                Stock local au Maroc.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-on-surface-subtle">
                Tous nos ordinateurs portables sont disponibles en stock réel au Maroc. Aucune
                attente, aucune importation — votre commande est préparée et expédiée rapidement
                avec garantie incluse.
              </p>

              {/* Highlights */}
              <ul className="mt-7 space-y-3">
                {highlights.map(item => (
                  <li key={item.text} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 ring-1 ring-emerald-500/20">
                      <item.icon className="h-4 w-4 text-emerald-400" />
                    </div>
                    <span className="text-sm text-on-surface-subtle">{item.text}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                to="/products"
                className="mt-8 inline-flex w-fit items-center gap-2 rounded-2xl bg-emerald-500 px-7 py-3.5 text-sm font-bold text-on-surface shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-emerald-400/35 active:scale-95"
              >
                Acheter maintenant
                <ArrowRight className="h-4 w-4" />
              </Link>
            </ScrollReveal>
          </div>
        </div>
    </Section>
  )
}
