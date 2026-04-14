import { useState, useEffect, useCallback, useRef } from 'react'
import { useSpring, animated } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import { flushSync } from 'react-dom'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface SlideData {
  id: string
  title: string
  subtitle: string
  description: string
  ctaText: string
  ctaLink: string
  bgColor: string
  textColor: string
  accentColor: string
}

// ─── Slide Data ──────────────────────────────────────────────────────────────

const SLIDES: SlideData[] = [
  {
    id: 'macbook-pro',
    title: 'MacBook Pro',
    subtitle: 'Premium Pre-Owned.',
    description:
      'Get the power of an M3 Pro MacBook Pro at up to 40% off retail. Certified refurbished, tested, and ready to perform.',
    ctaText: 'Shop MacBook',
    ctaLink: '/products?brand=Apple',
    bgColor: '#0c0c1d',
    textColor: '#ffffff',
    accentColor: '#60a5fa',
  },
  {
    id: 'gaming',
    title: 'ROG Zephyrus',
    subtitle: 'Game Like New.',
    description:
      'RTX 4060 gaming power at half the new price. Our refurbished gaming laptops are tested to perform at full spec.',
    ctaText: 'Shop Gaming',
    ctaLink: '/products?brand=ASUS',
    bgColor: '#1a0505',
    textColor: '#ffffff',
    accentColor: '#ef4444',
  },
  {
    id: 'dell-xps',
    title: 'Dell XPS 15',
    subtitle: 'Pro Experience. Smart Price.',
    description:
      'OLED display, RTX 4060, Intel Core i9 — get the full Dell XPS experience for nearly half the new retail cost.',
    ctaText: 'Shop Dell',
    ctaLink: '/products?brand=Dell',
    bgColor: '#0a1628',
    textColor: '#ffffff',
    accentColor: '#38bdf8',
  },
  {
    id: 'thinkpad',
    title: 'ThinkPad X1',
    subtitle: 'Business Grade. Budget Friendly.',
    description:
      'MIL-SPEC durability, legendary keyboard, ultra-light — the world\'s best business laptop refurbished for less.',
    ctaText: 'Shop Lenovo',
    ctaLink: '/products?brand=Lenovo',
    bgColor: '#1a1a1a',
    textColor: '#ffffff',
    accentColor: '#a3e635',
  },
  {
    id: 'razer',
    title: 'Razer Blade 15',
    subtitle: 'Save 55%. Lose Nothing.',
    description:
      'Premium aluminium build, QHD 240Hz display, RTX 3080. Refurbished Razer laptops — same performance, fraction of the cost.',
    ctaText: 'Shop Razer',
    ctaLink: '/products?brand=Razer',
    bgColor: '#0d1f0d',
    textColor: '#ffffff',
    accentColor: '#4ade80',
  },
]

// ─── SVG Path Generator ──────────────────────────────────────────────────────
// Creates the liquid / blob curve used for the clip-path transition.
// y  = vertical centre of the bulge (follows pointer)
// x  = horizontal extent of the bulge (drag distance)
// w  = base width of the revealed area (0 → hidden, viewportW → full)
// h  = viewport height

function getPath(y: number, x: number, w: number, h: number): string {
  const anchorDistance = 200 + x * 0.5
  const curviness = anchorDistance - 60
  return `M0,${h}H0V0h${w}v${y - anchorDistance}c0,${curviness},${x},${curviness},${x},${anchorDistance}S${w},${y},${w},${y + anchorDistance * 2}V${h}z`
}

// ─── Slide Content ───────────────────────────────────────────────────────────

function SlideContent({ slide }: { slide: SlideData }) {
  return (
    <div
      className="relative w-full h-full flex items-center overflow-hidden"
      style={{ color: slide.textColor }}
    >
      {/* ── Background decorations ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Gradient orb */}
        <div
          className="absolute -right-20 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
          style={{
            background: `radial-gradient(circle, ${slide.accentColor}, transparent 70%)`,
          }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(${slide.textColor} 1px, transparent 1px), linear-gradient(90deg, ${slide.textColor} 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />
        {/* Diagonal accent lines */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.06]">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className="absolute h-px origin-right"
              style={{
                top: `${15 + i * 14}%`,
                right: 0,
                width: `${30 + i * 10}%`,
                background: `linear-gradient(90deg, transparent, ${slide.accentColor})`,
                transform: `rotate(${-10 + i * 3}deg)`,
              }}
            />
          ))}
        </div>
        {/* Geometric shapes */}
        <div
          className="absolute right-[15%] top-[20%] w-32 h-32 rounded-2xl border opacity-10 rotate-12"
          style={{ borderColor: slide.accentColor }}
        />
        <div
          className="absolute right-[25%] bottom-[25%] w-24 h-24 rounded-full border opacity-10"
          style={{ borderColor: slide.accentColor }}
        />
        <div
          className="absolute right-[10%] bottom-[15%] w-40 h-40 rounded-3xl opacity-[0.06]"
          style={{ background: slide.accentColor }}
        />
      </div>

      {/* ── Text content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 sm:px-12 lg:px-20 w-full">
        <div className="max-w-xl lg:max-w-2xl">
          <p
            className="text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] mb-4 sm:mb-6"
            style={{ color: slide.accentColor }}
          >
            Casa By Tech
          </p>

          <h2 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.9] tracking-tight mb-4 sm:mb-6">
            {slide.title}
          </h2>

          <p className="text-xl sm:text-2xl lg:text-3xl font-light opacity-70 mb-3 sm:mb-4">
            {slide.subtitle}
          </p>

          <p className="text-sm sm:text-base opacity-50 max-w-md mb-8 sm:mb-10 leading-relaxed">
            {slide.description}
          </p>

          <Link
            to={slide.ctaLink}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold transition-all duration-300 hover:gap-3 hover:shadow-lg"
            style={{ background: slide.accentColor, color: slide.bgColor }}
          >
            {slide.ctaText}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function LiquidSwipeHero() {
  // Dimensions (ref to avoid re-renders on resize)
  const dims = useRef({ w: window.innerWidth, h: window.innerHeight })
  const containerRef = useRef<HTMLDivElement>(null)
  const animatingRef = useRef(false)
  const clipId = useRef(`lq-${Math.random().toString(36).slice(2, 8)}`).current

  // Slide indices
  const [bgIndex, setBgIndex] = useState(0)
  const [overlayIndex, setOverlayIndex] = useState(1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  // Resize listener
  useEffect(() => {
    const update = () => {
      dims.current = { w: window.innerWidth, h: window.innerHeight }
    }
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // ── Springs ──

  const [pathSpring, pathApi] = useSpring(() => ({
    d: getPath(dims.current.h * 0.72, 48, 5, dims.current.h),
    config: { mass: 3, tension: 200, friction: 30 },
  }))

  const [btnSpring, btnApi] = useSpring(() => ({
    x: 7,
    y: dims.current.h * 0.72 - 20,
    opacity: 1,
    config: { mass: 2, tension: 250, friction: 30 },
  }))

  // ── Post-transition handler ──

  const handlePostTransition = useCallback(
    (completedIndex: number) => {
      const { h } = dims.current
      const nextOverlay = (completedIndex + 1) % SLIDES.length

      // 1. Sync-render bg to match what the user is already seeing (overlay)
      flushSync(() => setBgIndex(completedIndex))

      // 2. Collapse clip → overlay vanishes, bg is identical so no flash
      pathApi.set({ d: getPath(h * 0.72, 0, 0, h) })

      // 3. Swap overlay content (invisible at this point)
      setOverlayIndex(nextOverlay)

      // 4. Animate the bump back in
      requestAnimationFrame(() => {
        pathApi.start({
          d: getPath(h * 0.72, 48, 5, h),
          config: { mass: 3, tension: 200, friction: 30 },
          onRest: () => {
            animatingRef.current = false
            setIsAnimating(false)
          },
        })
        btnApi.start({ x: 7, y: h * 0.72 - 20, opacity: 1 })
      })
    },
    [pathApi, btnApi],
  )

  // ── Advance (next slide) ──

  const advance = useCallback(() => {
    if (animatingRef.current) return
    animatingRef.current = true
    setIsAnimating(true)
    const { w, h } = dims.current

    pathApi.start({
      d: getPath(h * 0.5, -50, w + 200, h),
      config: { mass: 2, tension: 170, friction: 24 },
      onRest: () => handlePostTransition(overlayIndex),
    })
    btnApi.start({ opacity: 0 })
  }, [overlayIndex, pathApi, btnApi, handlePostTransition])

  // ── Go to specific slide ──

  const goToSlide = useCallback(
    (index: number) => {
      if (animatingRef.current || index === bgIndex) return
      animatingRef.current = true
      setIsAnimating(true)
      const { h, w } = dims.current

      // Hide clip, swap overlay content, then expand
      pathApi.set({ d: getPath(h * 0.72, 0, 0, h) })
      setOverlayIndex(index)

      // Wait for React to render new content, then expand
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          pathApi.start({
            d: getPath(h * 0.5, -50, w + 200, h),
            config: { mass: 2, tension: 170, friction: 24 },
            onRest: () => handlePostTransition(index),
          })
          btnApi.start({ opacity: 0 })
        })
      })
    },
    [bgIndex, pathApi, btnApi, handlePostTransition],
  )

  // ── Auto-play ──

  useEffect(() => {
    if (isAnimating || isPaused) return
    const timer = setInterval(advance, 5000)
    return () => clearInterval(timer)
  }, [isAnimating, isPaused, advance])

  // ── Keyboard nav ──

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') advance()
      if (e.key === 'ArrowLeft')
        goToSlide((bgIndex - 1 + SLIDES.length) % SLIDES.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [advance, goToSlide, bgIndex])

  // ── Drag gesture (on the liquid-bump button) ──

  const bind = useDrag(
    ({ active, movement: [mx], xy: [, my], velocity: [vx], first, last }) => {
      if (animatingRef.current && !first) return
      const { w, h } = dims.current
      const rect = containerRef.current?.getBoundingClientRect()
      const localY = my - (rect?.top ?? 0)

      if (first) setIsPaused(true)

      if (active && mx > 5) {
        if (!animatingRef.current) {
          pathApi.start({
            d: getPath(localY, mx + 60, 10, h),
            immediate: true,
          })
          btnApi.start({
            x: mx + 20,
            y: localY - 20,
            opacity: Math.max(0, 1 - mx / 300),
            immediate: true,
          })

          if (mx > w * 0.35 || vx > 3) {
            setIsPaused(false)
            advance()
          }
        }
      }

      if (last && !animatingRef.current) {
        setIsPaused(false)
        pathApi.start({
          d: getPath(h * 0.72, 48, 5, h),
          config: { mass: 3, tension: 200, friction: 30 },
        })
        btnApi.start({ x: 7, y: h * 0.72 - 20, opacity: 1 })
      }
    },
    { filterTaps: true, pointer: { touch: true } },
  )

  // ── Render ──

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Featured laptops showcase"
    >
      {/* ▸ Background (current) slide */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: SLIDES[bgIndex].bgColor }}
      >
        <SlideContent slide={SLIDES[bgIndex]} />
      </div>

      {/* ▸ SVG clip-path definition */}
      <svg
        className="absolute top-0 left-0"
        width="0"
        height="0"
        aria-hidden="true"
      >
        <defs>
          <clipPath id={clipId}>
            <animated.path d={pathSpring.d} />
          </clipPath>
        </defs>
      </svg>

      {/* ▸ Overlay (next) slide — clipped by liquid path */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: `url(#${clipId})`,
          WebkitClipPath: `url(#${clipId})`,
          backgroundColor: SLIDES[overlayIndex].bgColor,
        }}
      >
        <SlideContent slide={SLIDES[overlayIndex]} />
      </div>

      {/* ▸ Drag handle (the liquid bump button) */}
      <animated.div
        {...bind()}
        className="absolute z-20 w-14 h-14 rounded-full border-2 bg-muted/50 backdrop-blur-md flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{
          left: btnSpring.x,
          top: btnSpring.y,
          opacity: btnSpring.opacity,
          touchAction: 'none',
          borderColor: `${SLIDES[overlayIndex].textColor}30`,
        }}
        role="button"
        aria-label="Drag to reveal next slide"
        tabIndex={0}
      >
        <ChevronRight
          className="w-5 h-5"
          style={{ color: `${SLIDES[overlayIndex].textColor}99` }}
        />
      </animated.div>

      {/* ▸ Bottom navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-5 bg-black/20 backdrop-blur-xl rounded-full px-5 py-2.5">
        <button
          onClick={() =>
            goToSlide((bgIndex - 1 + SLIDES.length) % SLIDES.length)
          }
          className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-subtle hover:text-on-surface transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === bgIndex
                  ? 'w-7 bg-white'
                  : 'w-1.5 bg-white/30 hover:bg-muted/500'
              }`}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === bgIndex ? 'true' : undefined}
            />
          ))}
        </div>

        <button
          onClick={advance}
          className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-subtle hover:text-on-surface transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ▸ Scroll indicator */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-10">
        <ChevronDown className="w-5 h-5 text-on-surface-faint animate-bounce" />
      </div>
    </section>
  )
}
