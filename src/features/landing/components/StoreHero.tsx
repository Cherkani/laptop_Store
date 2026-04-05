import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BadgePercent, Flame, MessageCircle, ShieldCheck, Truck } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'

type Slide = {
  title: string
  subtitle: string
  price: number
  originalPrice?: number
  badge?: string
  cta: string
  href: string
  image: string
  theme: 'red' | 'blue' | 'orange'
}

const slides: Slide[] = [
  {
    title: 'MacBook Pro 14" M3',
    subtitle: 'Puissance créative. Garantie 6 mois.',
    price: 18990,
    originalPrice: 22990,
    badge: '-18%',
    cta: 'Voir les MacBook',
    href: '/products?os=macOS',
    image: 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/mbp-14-spacegray-select-202310?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1697304231226',
    theme: 'blue',
  },
  {
    title: 'Soldes Windows – Dell / HP / Lenovo',
    subtitle: 'Business, étudiant ou créa. Livraison rapide au Maroc.',
    price: 7490,
    originalPrice: 9990,
    badge: '-25%',
    cta: 'Voir les promos Windows',
    href: '/products?os=Windows',
    image: 'https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/page/category/laptop/xps-13-9340-lap-campaign-hero-800x620.png',
    theme: 'red',
  },
  {
    title: 'Gaming ASUS ROG / MSI',
    subtitle: 'RTX 4060 à partir de 10 990 MAD.',
    price: 10990,
    originalPrice: 14990,
    badge: 'FPS Boost',
    cta: 'Voir les laptops gaming',
    href: '/products?brand=ASUS&brand=MSI&gpu=NVIDIA%20RTX%204060',
    image: 'https://dlcdnwebimgs.asus.com/gain/4c1c8cfe-09db-4936-8f59-3a5a700ac029/',
    theme: 'orange',
  },
  {
    title: 'Reconditionné certifié',
    subtitle: 'Testé, nettoyé, garanti. Économisez jusqu’à 30%.',
    price: 0,
    badge: 'Garantie 6 mois',
    cta: 'Découvrir la charte qualité',
    href: '/products?sortBy=newest',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
    theme: 'blue',
  },
]

const miniBanners = [
  {
    title: 'MacBook Air M2',
    subtitle: 'Dès 5 990 MAD',
    href: '/products?brand=Apple&processor=Apple%20M2',
    tone: 'light',
    image: 'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/mb-air-13-midnight-gallery1-202402?wid=400&hei=380&fmt=jpeg&qlt=90&.v=1707248295408',
  },
  {
    title: 'Gaming ASUS ROG',
    subtitle: 'Performance maximale',
    href: '/products?brand=ASUS',
    tone: 'dark',
    image: 'https://dlcdnwebimgs.asus.com/gain/75d27be9-4081-4d8a-9672-9bb7dfb08dbb/',
  },
]

export function StoreHero() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive(prev => (prev + 1) % slides.length)
    }, 5200)
    return () => window.clearInterval(id)
  }, [])

  const slide = slides[active]

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0f0f0f] via-[#121525] to-[#f8f9fa] pt-8 pb-14 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute -left-10 top-10 h-72 w-72 rounded-full bg-[#0f5dcf]/30 blur-3xl" />
        <div className="absolute right-10 top-0 h-80 w-80 rounded-full bg-[#e63946]/25 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1260px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-orange-200 ring-1 ring-orange-400/30">
              <BadgePercent className="h-3.5 w-3.5" />
              Semaine des Laptops
            </div>

            <div className="mt-4 space-y-3">
              <h1 className="font-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
                {slide.title}
              </h1>
              <p className="max-w-xl text-base text-slate-200 sm:text-lg">{slide.subtitle}</p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                {slide.price > 0 && (
                  <span className="text-3xl font-extrabold text-white">
                    {formatPrice(slide.price)}
                  </span>
                )}
                {slide.originalPrice && slide.originalPrice > slide.price && (
                  <span className="text-lg text-slate-400 line-through">{formatPrice(slide.originalPrice)}</span>
                )}
                {slide.badge && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#e63946] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                    <Flame className="h-4 w-4" />
                    {slide.badge}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-3">
                <Link
                  to={slide.href}
                  className="inline-flex items-center gap-2 rounded-full bg-[#0f5dcf] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(15,93,207,0.35)] hover:bg-[#0d4fb6]"
                >
                  {slide.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="https://wa.me/212612345678"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white/90 hover:border-white/50"
                >
                  <MessageCircle className="h-4 w-4" />
                  Commander sur WhatsApp
                </a>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 text-sm text-slate-200">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  Garantie 6 mois
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
                  <Truck className="h-4 w-4 text-orange-300" />
                  Livraison gratuite à Casablanca
                </span>
              </div>
            </div>

            {/* Slider dots */}
            <div className="mt-6 flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={cn(
                    'h-2.5 rounded-full transition-all',
                    active === i ? 'w-8 bg-white' : 'w-3 bg-white/40',
                  )}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
              <img
                src={slide.image}
                alt={slide.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Mini banners */}
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {miniBanners.map(banner => (
            <Link
              to={banner.href}
              key={banner.title}
              className={cn(
                'group relative overflow-hidden rounded-2xl border shadow-lg transition-transform hover:-translate-y-1',
                banner.tone === 'dark'
                  ? 'border-slate-800/60 bg-gradient-to-r from-[#121525] to-[#0f0f0f]'
                  : 'border-white/40 bg-white text-slate-900',
              )}
            >
              <div className="flex items-center gap-4 p-4">
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-400">
                    Offre du moment
                  </p>
                  <h3 className={cn('text-xl font-bold', banner.tone === 'dark' ? 'text-white' : 'text-slate-900')}>
                    {banner.title}
                  </h3>
                  <p className={cn('text-sm', banner.tone === 'dark' ? 'text-slate-200' : 'text-slate-600')}>
                    {banner.subtitle}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#0f5dcf]">
                    Découvrir
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
                <div className="h-28 w-32 overflow-hidden rounded-xl bg-white/5">
                  <img src={banner.image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
