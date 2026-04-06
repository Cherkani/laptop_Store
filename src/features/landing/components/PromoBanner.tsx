import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

export function PromoBanner() {
  return (
    <section className="relative overflow-hidden bg-[#070c15]">
      <div className="relative min-h-[300px] w-full overflow-hidden md:min-h-[440px]">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://c.animaapp.com/mnm6ln0dq3mZP0/assets/59.jpg"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-center opacity-40"
          />
          {/* Dark overlays for legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#070c15]/95 via-[#070c15]/70 to-[#070c15]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070c15] via-transparent to-transparent" />
        </div>

        {/* Content */}
        <ScrollReveal className="relative z-10 flex h-full min-h-[300px] flex-col items-start justify-center px-6 py-16 md:min-h-[440px] md:px-16 lg:px-24">
          <div className="max-w-xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-amber-500">
              Offres exclusives
            </p>
            <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
              Haute performance,{' '}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                meilleur prix.
              </span>
            </h2>
            <p className="mt-4 text-base text-white/60 md:text-lg">
              Seulement sur Laptopstore.ma — stock disponible, livraison rapide.
            </p>
            <Link
              to="/products"
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-7 py-3.5 text-sm font-bold text-[#070c15] shadow-lg shadow-amber-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-amber-400/40 active:scale-95"
            >
              Voir toutes les offres
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
