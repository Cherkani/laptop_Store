import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Truck, ShieldCheck } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

const PILLS = [
  { icon: Zap,         label: 'Stock disponible' },
  { icon: Truck,       label: 'Livraison rapide'  },
  { icon: ShieldCheck, label: 'Garantie incluse'  },
]

export function PromoBanner() {
  return (
    <section className="relative overflow-hidden">
      {/* ── full-bleed dark background ── */}
      <div className="absolute inset-0 bg-[#090f1f]" />

      {/* background image — right half only */}
      <div className="absolute inset-y-0 right-0 w-full md:w-[62%]">
        <img
          src="https://c.animaapp.com/mnm6ln0dq3mZP0/assets/59.jpg"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-center opacity-30"
        />
        {/* left-to-right mask so text side stays dark */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#090f1f] via-[#090f1f]/60 to-transparent" />
        {/* bottom mask */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090f1f]/80 via-transparent to-transparent" />
      </div>

      {/* subtle amber glow bottom-left */}
      <div
        className="pointer-events-none absolute -bottom-32 -left-32 h-[480px] w-[480px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, rgb(245 158 11) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-8 md:py-32 lg:px-12">
        <ScrollReveal>
          <div className="max-w-xl">
            {/* eyebrow */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-amber-400">
                Offres exclusives
              </span>
            </div>

            {/* headline */}
            <h2 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
              Haute performance,{' '}
              <span
                className="block bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent"
              >
                meilleur prix.
              </span>
            </h2>

            <p className="mt-5 text-base leading-relaxed text-white/55 md:text-lg">
              Seulement sur Laptopstore.dz — stock disponible, livraison rapide.
            </p>

            {/* pill badges */}
            <div className="mt-6 flex flex-wrap gap-2">
              {PILLS.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/6 px-3.5 py-1.5 text-xs font-medium text-white/70 backdrop-blur-sm"
                >
                  <Icon className="h-3.5 w-3.5 text-amber-400" />
                  {label}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-7 py-3.5 text-sm font-bold text-on-primary shadow-xl shadow-amber-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-amber-400/40 active:scale-95"
              >
                Voir toutes les offres
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/products?filter=promo"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/50 transition hover:text-white"
              >
                Promotions du jour →
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
