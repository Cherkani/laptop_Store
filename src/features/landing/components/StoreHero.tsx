import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Truck, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ─────────────────────────────────────────────────────────────
   SLIDE DATA
   objectPosition: tune where the camera focuses per image
   image 1 & 3 are 9600×5400 landscape → center on the product
   image 2 is 1536×1024 → slight top-center crop
───────────────────────────────────────────────────────────── */
const SLIDES = [
  {
    bg: '/first backgroubd1.png',
    objectPosition: 'center 35%',
    eyebrow: 'Stock local · Maroc',
    headlineTop: 'Votre prochain laptop,',
    headlineBottom: 'livré demain.',
    sub: 'Reconditionnés & neufs, testés, garantis et expédiés depuis le Maroc. Prix nets, sans mauvaises surprises.',
    cta: { label: 'Explorer le catalogue', to: '/products' },
    ctaSecondary: { label: 'Trouver mon laptop', to: '/advisor/creators' },
    overlayStrength: 'from-black/70 via-black/40 to-black/10',
  },
  {
    bg: '/first backgroubd2.png',
    objectPosition: 'center 20%',
    eyebrow: 'Prix imbattables',
    headlineTop: 'Performant,',
    headlineBottom: 'abordable.',
    sub: 'Des laptops haut de gamme reconditionnés — testés et garantis, accessibles à tous les budgets.',
    cta: { label: 'Voir les promotions', to: '/products?sale=true' },
    ctaSecondary: { label: 'PC Windows', to: '/products?os=Windows' },
    overlayStrength: 'from-black/75 via-black/45 to-black/15',
  },
  {
    bg: '/first backgroubd3.png',
    objectPosition: 'center 40%',
    eyebrow: 'MacBook & Apple',
    headlineTop: 'Mac, au meilleur',
    headlineBottom: 'prix du Maroc.',
    sub: 'MacBook Air, MacBook Pro — reconditionnés avec soin, garantis, expédiés rapidement partout au Maroc.',
    cta: { label: 'Voir les MacBooks', to: '/products?os=macOS' },
    ctaSecondary: { label: 'Conseils achat', to: '/advisor/creators' },
    overlayStrength: 'from-black/70 via-black/40 to-black/10',
  },
] as const

const DURATION  = 6000  // ms per slide
const EXIT_MS   = 500   // text fade-out duration
const ENTER_MS  = 600   // text fade-in duration

const BADGES = [
  { icon: ShieldCheck, label: 'Garantie incluse',  color: 'text-emerald-400' },
  { icon: Truck,       label: 'Livraison rapide',  color: 'text-sky-400'     },
  { icon: Zap,         label: 'Retours 30 jours',  color: 'text-amber-400'   },
] as const

/* ─────────────────────────────────────────────────────────────
   ANIMATION KEYFRAMES  (injected once via <style>)
   We use CSS keyframes so they run on the GPU compositor and
   aren't blocked by React re-renders.
───────────────────────────────────────────────────────────── */
const KEYFRAMES = `
@keyframes hero-kenburns {
  0%   { transform: scale(1)    translateX(0px); }
  100% { transform: scale(1.08) translateX(-20px); }
}
@keyframes hero-slide-up {
  0%   { opacity: 0; transform: translateY(28px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes hero-slide-down {
  0%   { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
}
@keyframes hero-fade-in {
  0%   { opacity: 0; }
  100% { opacity: 1; }
}
@keyframes hero-fade-out {
  0%   { opacity: 1; }
  100% { opacity: 0; }
}
@keyframes hero-badge-pop {
  0%   { opacity: 0; transform: scale(0.85) translateY(10px); }
  60%  { transform: scale(1.04) translateY(-2px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
`

function useSlider(total: number) {
  const [current, setCurrent]       = useState(0)
  const [phase, setPhase]           = useState<'enter' | 'hold' | 'exit'>('enter')
  const [progress, setProgress]     = useState(0)
  const timerRef                    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progressRef                 = useRef<ReturnType<typeof setInterval> | null>(null)

  const advance = useCallback(() => {
    setPhase('exit')
    timerRef.current = setTimeout(() => {
      setCurrent(c => (c + 1) % total)
      setProgress(0)
      setPhase('enter')
    }, EXIT_MS)
  }, [total])

  const goTo = useCallback((index: number) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (progressRef.current) clearInterval(progressRef.current)
    setPhase('exit')
    timerRef.current = setTimeout(() => {
      setCurrent(index)
      setProgress(0)
      setPhase('enter')
    }, EXIT_MS)
  }, [])

  /* Auto-advance */
  useEffect(() => {
    const id = setTimeout(advance, DURATION)
    return () => clearTimeout(id)
  }, [current, advance])

  /* Progress bar */
  useEffect(() => {
    setProgress(0)
    const step = 100 / (DURATION / 40)
    progressRef.current = setInterval(() => setProgress(p => Math.min(p + step, 100)), 40)
    return () => { if (progressRef.current) clearInterval(progressRef.current) }
  }, [current])

  return { current, phase, progress, goTo }
}

/* ─────────────────────────────────────────────────────────────
   TEXT LAYER — each element animates independently
───────────────────────────────────────────────────────────── */
interface TextLayerProps {
  slide: (typeof SLIDES)[number]
  phase: 'enter' | 'hold' | 'exit'
}

function TextLayer({ slide, phase }: TextLayerProps) {
  const entering = phase === 'enter'
  const exiting  = phase === 'exit'

  /* Shared animation helper */
  const anim = (delay: number): React.CSSProperties => ({
    animation: exiting
      ? `hero-slide-down ${EXIT_MS}ms cubic-bezier(.4,0,.6,1) both`
      : entering
      ? `hero-slide-up ${ENTER_MS}ms cubic-bezier(.16,1,.3,1) ${delay}ms both`
      : 'none',
  })

  return (
    <div className="max-w-2xl">
      {/* Eyebrow */}
      <div
        style={anim(0)}
        className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md"
      >
        <Zap className="h-3.5 w-3.5 text-amber-400" />
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white">
          {slide.eyebrow}
        </span>
      </div>

      {/* Headline line 1 */}
      <div style={{ overflow: 'hidden' }}>
        <h1
          className="font-display text-4xl font-extrabold leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-[3.75rem]"
          style={anim(80)}
        >
          {slide.headlineTop}
        </h1>
      </div>

      {/* Headline line 2 — gradient accent */}
      <div style={{ overflow: 'hidden' }}>
        <h1
          className="font-display text-4xl font-extrabold leading-[1.06] tracking-tight sm:text-5xl lg:text-[3.75rem] bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent"
          style={anim(140)}
        >
          {slide.headlineBottom}
        </h1>
      </div>

      {/* Sub */}
      <p
        className="mt-5 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg"
        style={anim(200)}
      >
        {slide.sub}
      </p>

      {/* CTAs */}
      <div className="mt-8 flex flex-wrap gap-3" style={anim(270)}>
        <Link
          to={slide.cta.to}
          className="group inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-7 py-3.5 text-sm font-bold text-[#0a0f1a] shadow-xl shadow-amber-500/40 transition-all duration-300 hover:-translate-y-1 hover:bg-amber-400 hover:shadow-amber-400/50 active:scale-95"
        >
          {slide.cta.label}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
        <Link
          to={slide.ctaSecondary.to}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/20 active:scale-95"
        >
          {slide.ctaSecondary.label}
        </Link>
      </div>

      {/* Trust badges */}
      <div className="mt-10 flex flex-wrap items-center gap-6" style={anim(350)}>
        {BADGES.map(({ icon: Icon, label, color }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={cn('flex h-7 w-7 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15')}>
              <Icon className={cn('h-3.5 w-3.5', color)} />
            </div>
            <span className="text-xs font-medium text-white/80">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export function StoreHero() {
  const { current, phase, progress, goTo } = useSlider(SLIDES.length)
  const slide = SLIDES[current]

  return (
    <>
      {/* Inject keyframes once */}
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      <section
        id="hero"
        className="relative overflow-hidden bg-black"
        style={{ height: 'clamp(520px, 88vh, 780px)' }}
      >
        {/* ── Background images with Ken Burns ── */}
        {SLIDES.map((s, i) => (
          <div
            key={s.bg}
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              zIndex: i === current ? 1 : 0,
              opacity: i === current ? 1 : 0,
              transition: `opacity ${EXIT_MS + 100}ms ease`,
            }}
          >
            <img
              src={s.bg}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                objectPosition: s.objectPosition,
                /* Ken Burns only runs on the active slide */
                animation: i === current
                  ? `hero-kenburns ${DURATION + 1000}ms ease-out both`
                  : 'none',
                transformOrigin: 'center center',
              }}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}

        {/* ── Gradient overlays ── */}
        {/* Left-to-right: content legibility */}
        <div className="absolute inset-0 z-[2] bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        {/* Bottom fade: smooth transition into next section */}
        <div className="absolute inset-0 z-[2] bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {/* Very subtle vignette top */}
        <div className="absolute inset-0 z-[2] bg-gradient-to-b from-black/30 via-transparent to-transparent" />

        {/* ── Content ── */}
        <div className="relative z-10 mx-auto flex h-full max-w-[1260px] flex-col justify-center px-4 pb-16 pt-24 sm:px-6 lg:px-8">
          <TextLayer slide={slide} phase={phase} />
        </div>

        {/* ── Slide nav dots ── */}
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              className={cn(
                'rounded-full transition-all duration-400 ease-out',
                i === current
                  ? 'h-2 w-8 bg-amber-400'
                  : 'h-2 w-2 bg-white/35 hover:bg-white/60',
              )}
            />
          ))}
        </div>

        {/* ── Progress bar (bottom edge) ── */}
        <div className="absolute bottom-0 left-0 right-0 z-20 h-[3px] bg-white/10">
          <div
            className="h-full bg-amber-400"
            style={{
              width: `${progress}%`,
              transition: progress === 0 ? 'none' : 'width 40ms linear',
            }}
          />
        </div>

        {/* ── Slide counter ── */}
        <div className="absolute bottom-[26px] right-6 z-20 hidden sm:flex items-center gap-1.5 text-[11px] font-semibold tabular-nums text-white/50">
          <span className="text-white/90">{String(current + 1).padStart(2, '0')}</span>
          <span>/</span>
          <span>{String(SLIDES.length).padStart(2, '0')}</span>
        </div>
      </section>
    </>
  )
}
