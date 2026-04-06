import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Truck, Zap } from 'lucide-react'

export function StoreHero() {
  return (
    <section id="hero" className="relative overflow-hidden bg-[#0a0f1a]">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/first%20backgroubd1.png"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover opacity-60"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-[#0a0f1a]/60 to-[#0a0f1a]/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1a]/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[78vh] max-w-[1260px] flex-col justify-end px-4 pb-14 pt-24 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
        <div className="max-w-2xl">
          {/* Eyebrow badge */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/90">
              Stock local au Maroc
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Votre prochain laptop,{' '}
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              livré demain.
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/70 sm:text-lg">
            Ordinateurs reconditionnés et neufs testés, garantis, et expédiés depuis le Maroc.
            Prix nets, sans mauvaises surprises.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-7 py-3.5 text-sm font-bold text-[#0a0f1a] shadow-lg shadow-amber-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-amber-400/40 active:scale-95"
            >
              Explorer le catalogue
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/advisor/creators"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/15 active:scale-95"
            >
              Trouver mon laptop
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-2 text-white/60">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="text-xs font-medium">Garantie incluse</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <Truck className="h-4 w-4 text-sky-400 shrink-0" />
              <span className="text-xs font-medium">Livraison rapide</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <Zap className="h-4 w-4 text-amber-400 shrink-0" />
              <span className="text-xs font-medium">Retours 30 jours</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
