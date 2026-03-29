import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Briefcase,
  Gamepad2,
  Leaf,
  Palette,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

const quickLinks = [
  {
    label: 'Performance',
    subtitle: 'Latest CPUs and all-day battery',
    icon: Sparkles,
    href: '/products?sortBy=newest',
  },
  {
    label: 'Gaming',
    subtitle: 'RTX laptops built for smooth frames',
    icon: Gamepad2,
    href: '/products?brand=ASUS',
  },
  {
    label: 'Business',
    subtitle: 'Secure, reliable, travel-ready',
    icon: Briefcase,
    href: '/products?brand=Dell&brand=Lenovo',
  },
  {
    label: 'Creative',
    subtitle: 'Sharp displays and pro workflows',
    icon: Palette,
    href: '/products?brand=Apple&brand=ASUS',
  },
]

const laptopDesigns = [
  {
    title: 'Creator Pro',
    subtitle: 'Color-accurate • Silent',
    shell: 'from-[#1f2937] to-[#111827]',
    glow: 'from-[#60a5fa]/35 to-[#38bdf8]/15',
  },
  {
    title: 'Game Pulse',
    subtitle: 'High FPS • RTX-ready',
    shell: 'from-[#334155] to-[#0f172a]',
    glow: 'from-[#a78bfa]/30 to-[#f472b6]/15',
  },
  {
    title: 'Everyday Air',
    subtitle: 'Lightweight • All-day',
    shell: 'from-[#64748b] to-[#334155]',
    glow: 'from-[#2dd4bf]/30 to-[#60a5fa]/15',
  },
]

export function StoreHero() {
  return (
    <section className="relative overflow-hidden pt-14 pb-10 sm:pt-16 sm:pb-12 lg:pt-20 lg:pb-14">
      <div className="max-w-[1260px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.06fr_0.94fr] lg:items-end">
          <ScrollReveal>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#a9d8ff] bg-[#ebf6ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#0c4a6e]">
                <Zap className="h-3.5 w-3.5" />
                Spring Edit 2026
              </div>

              <h1 className="mt-4 max-w-2xl font-display text-4xl font-extrabold leading-[1.06] tracking-tight text-[#1d1d1f] sm:text-5xl lg:text-6xl">
                Refurbished laptops,
                <span className="headline-gradient block">with premium energy.</span>
              </h1>

              <p className="mt-5 max-w-xl text-base text-[#4a4a50] sm:text-lg">
                A curated store built for speed, style, and smarter pricing. Certified devices, cleaner aesthetics, and a better buying experience.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/products"
                  className="accent-button inline-flex items-center gap-1.5 rounded-full px-6 py-3 text-sm font-semibold text-white"
                >
                  Shop collection
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/products?sortBy=newest"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#c7d8ec] bg-white/80 px-6 py-3 text-sm font-semibold text-[#0b4f87] backdrop-blur hover:bg-white"
                >
                  View new arrivals
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-2.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/85 px-3.5 py-1.5 text-xs font-medium text-[#425466] ring-1 ring-black/5">
                  <Leaf className="h-3.5 w-3.5 text-[#1f9d5a]" />
                  Lower carbon footprint
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/85 px-3.5 py-1.5 text-xs font-medium text-[#425466] ring-1 ring-black/5">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#0b63ce]" />
                  Warranty included
                </span>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={120}>
            <div className="glass-card lift-card relative overflow-hidden rounded-[30px] p-6 sm:p-7">
              <div className="pointer-events-none absolute -right-14 -top-16 h-40 w-40 rounded-full bg-[#3da6ff]/30 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-[#42d8cf]/20 blur-3xl" />

              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5b6a7c]">
                Signature designs
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#1d1d1f] sm:text-3xl">
                Find your fit.
              </h2>
              <p className="mt-2 text-sm text-[#5f6673]">
                Three curated laptop styles designed for how people actually work and play.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {laptopDesigns.map(design => (
                  <article
                    key={design.title}
                    className="rounded-2xl bg-white/70 p-3 ring-1 ring-black/5"
                  >
                    <div className={`relative rounded-xl bg-gradient-to-br ${design.glow} p-2`}>
                      <div className={`mx-auto h-12 w-20 rounded-t-md bg-gradient-to-br ${design.shell} ring-1 ring-white/20`} />
                      <div className="mx-auto mt-1 h-1.5 w-24 rounded-full bg-[#94a3b8]/50" />
                    </div>
                    <p className="mt-2 text-sm font-bold tracking-tight text-[#162033]">
                      {design.title}
                    </p>
                    <p className="text-[11px] text-[#5d6675]">{design.subtitle}</p>
                  </article>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={170}>
          <div className="mt-10 -mx-4 px-4 overflow-x-auto scrollbar-hide sm:mt-12">
            <div className="flex min-w-max gap-3.5">
              {quickLinks.map(item => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="glass-card lift-card group min-w-[235px] rounded-2xl px-4 py-4"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#e6f3ff] to-[#edf9f7] text-[#0f5dcf]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-base font-bold tracking-tight text-[#172033]">{item.label}</p>
                  <p className="text-sm text-[#5b6472]">{item.subtitle}</p>
                  <p className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#0f5dcf]">
                    Explore
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
