import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUp, ArrowDown, ArrowRight, Loader2, ShoppingCart, MessageCircle } from 'lucide-react'
import { useFeaturedProducts } from '@/features/products/hooks/useProducts'
import { Section } from '@/components/shared/Section'
import { getImageSrc, formatPrice } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { toast } from '@/hooks/use-toast'
import { WHATSAPP_URL, CONDITION_STYLES } from '@/lib/constants'

// depth 0 = front, depth N-1 = furthest back
// transformOrigin is '50% 0%' so cards fan downward from their top edge
const STACK = [
  { scale: 1.00, y:  0,   z: 50, shadow: '0 40px 90px rgba(0,0,0,0.30), 0 10px 28px rgba(0,0,0,0.18)' },
  { scale: 0.92, y:  4.5, z: 40, shadow: '0 20px 55px rgba(0,0,0,0.20)' },
  { scale: 0.85, y:  8,   z: 30, shadow: '0 12px 36px rgba(0,0,0,0.14)' },
  { scale: 0.78, y: 10.5, z: 20, shadow: '0 8px 24px rgba(0,0,0,0.10)'  },
  { scale: 0.72, y: 12.5, z: 10, shadow: '0 4px 14px rgba(0,0,0,0.07)'  },
]

const EASE = 'cubic-bezier(0.76, 0, 0.24, 1)'
const DUR  = '0.52s'

export function FeaturedProducts() {
  const { data: products, isLoading } = useFeaturedProducts()
  // positions[itemIndex] = stack depth (0 = front)
  const [positions,   setPositions]   = useState<number[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [textKey,     setTextKey]     = useState(0)
  const autoRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const addItem  = useCartStore(s => s.addItem)
  const [isAdding, setIsAdding] = useState(false)

  const items = products?.slice(0, 6) ?? []
  const N     = items.length

  useEffect(() => {
    if (N) setPositions(items.map((_, i) => i))
  }, [N]) // eslint-disable-line

  const frontIdx  = positions.indexOf(0)
  const frontItem = items[frontIdx] ?? null
  const condStyle = frontItem?.condition ? CONDITION_STYLES[frontItem.condition] : null
  const savings   =
    frontItem?.original_price && frontItem.original_price > frontItem.price
      ? Math.round(((frontItem.original_price - frontItem.price) / frontItem.original_price) * 100)
      : null

  // ── auto-advance ──────────────────────────────────────────────────────────
  const stopAuto = () => { if (autoRef.current) clearInterval(autoRef.current) }

  // store advanceNext in a ref so startAuto doesn't need it as dep
  const advanceRef = useRef<() => void>(() => {})

  const startAuto = useCallback(() => {
    stopAuto()
    autoRef.current = setInterval(() => advanceRef.current(), 4200)
  }, []) // eslint-disable-line

  useEffect(() => {
    if (N) startAuto()
    return stopAuto
  }, [N, startAuto])

  // ── navigation ────────────────────────────────────────────────────────────
  function advanceNext() {
    if (isAnimating || !N) return
    setIsAnimating(true)
    setPositions(prev => {
      const fi = prev.indexOf(0)
      return prev.map((p, i) => (i === fi ? N - 1 : p - 1))
    })
    setTextKey(k => k + 1)
    setTimeout(() => setIsAnimating(false), 520)
  }

  function advancePrev() {
    if (isAnimating || !N) return
    setIsAnimating(true)
    setPositions(prev => {
      const bi = prev.indexOf(N - 1)
      return prev.map((p, i) => (i === bi ? 0 : p + 1))
    })
    setTextKey(k => k + 1)
    setTimeout(() => setIsAnimating(false), 520)
  }

  // keep the ref up-to-date so the interval always calls the latest version
  advanceRef.current = advanceNext

  function handleNext() { if (isAnimating) return; stopAuto(); advanceNext(); startAuto() }
  function handlePrev() { if (isAnimating) return; stopAuto(); advancePrev(); startAuto() }

  // jump to a specific item (by rotating until it's front)
  function jumpTo(itemIdx: number) {
    if (isAnimating) return
    const depth = positions[itemIdx]
    if (depth === 0) return
    stopAuto()
    // advance `depth` times — but we can't loop setPositions, so compute directly
    setIsAnimating(true)
    setPositions(prev => {
      // rotate the whole array so that itemIdx ends up at depth 0
      return prev.map((p) => {
        const next = (p - depth + N) % N
        return next
      })
    })
    setTextKey(k => k + 1)
    setTimeout(() => { setIsAnimating(false); startAuto() }, 520)
  }

  // ── cart ──────────────────────────────────────────────────────────────────
  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    if (!frontItem || isAdding) return
    setIsAdding(true)
    try {
      await addItem(frontItem.id, 1)
      toast({ title: 'Ajouté au panier', description: frontItem.name })
    } catch {
      toast({ title: "Erreur lors de l'ajout", variant: 'destructive' })
    } finally {
      setIsAdding(false)
    }
  }

  if (!isLoading && (!products || products.length === 0)) return null

  return (
    <Section bg="bg-[#faf9f7] dark:bg-surface-base" className="overflow-hidden">

      {/* ── Section header ───────────────────────────────────────────────── */}
      <div className="mb-14 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-faint">
            Recommandés
          </p>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl lg:text-5xl">
            Sélection de l'équipe.
          </h2>
          <p className="mt-2 text-base text-on-surface-subtle sm:text-lg">
            Nos meilleures recommandations du moment.
          </p>
        </div>
        <Link
          to="/products"
          className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-on-surface-subtle transition-colors hover:text-on-surface sm:inline-flex"
        >
          Tout voir <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-7 w-7 animate-spin text-on-surface-faint" />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-start lg:gap-20">

          {/* ── Stacked card deck ────────────────────────────────────────── */}
          {/* isolate creates a new stacking context so z-indexes inside
              cannot bleed above the navbar or other page elements */}
          <div className="isolate w-full max-w-[540px] shrink-0">
            {/* padding-bottom trick for fixed intrinsic height */}
            <div className="relative" style={{ paddingBottom: '64%' }}>
              {items.map((item, i) => {
                const depth   = positions[i] ?? i
                const pos     = STACK[Math.min(depth, STACK.length - 1)]
                const hidden  = depth >= STACK.length
                const isFront = depth === 0

                const imgs   = item.product_images?.sort((a, b) => a.display_order - b.display_order) ?? []
                const imgSrc = getImageSrc(imgs[0])
                const itemCondStyle = item.condition ? CONDITION_STYLES[item.condition] : null

                return (
                  <div
                    key={item.id}
                    onClick={isFront ? undefined : () => jumpTo(i)}
                    style={{
                      position:        'absolute',
                      inset:           0,
                      display:         'flex',
                      alignItems:      'flex-start',
                      justifyContent:  'center',
                      zIndex:          hidden ? 0 : pos.z,
                      opacity:         hidden ? 0 : 1,
                      transform:       `translateY(${pos.y}%) scale(${pos.scale})`,
                      transformOrigin: '50% 0%',
                      transition:      `transform ${DUR} ${EASE}, opacity 0.4s ${EASE}`,
                      willChange:      'transform, opacity',
                      cursor:          isFront ? 'default' : 'pointer',
                      pointerEvents:   hidden ? 'none' : 'auto',
                    }}
                  >
                    {/* Card */}
                    <div
                      className="relative w-full overflow-hidden rounded-3xl"
                      style={{
                        aspectRatio: '16/10',
                        background:  'linear-gradient(155deg, hsl(var(--surface-raised)) 0%, hsl(var(--surface-base)) 100%)',
                        border:      '1px solid hsl(var(--border-subtle) / 0.6)',
                        boxShadow:   pos.shadow,
                        transition:  `box-shadow ${DUR} ${EASE}`,
                      }}
                    >
                      {/* Product photo */}
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={item.name}
                          className="h-full w-full object-contain transition-transform duration-700 ease-out"
                          style={{ padding: '7%', transform: isFront ? 'scale(1.04)' : 'scale(1)' }}
                          loading="lazy"
                          draggable={false}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="text-6xl font-black opacity-10 text-on-surface">
                            {item.brand?.[0]}
                          </span>
                        </div>
                      )}

                      {/* ── Frosted bottom bar ── */}
                      <div
                        className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 px-5 pb-5 pt-12"
                        style={{
                          background: [
                            'linear-gradient(to top,',
                            '  hsl(var(--surface-raised) / 0.97) 0%,',
                            '  hsl(var(--surface-raised) / 0.80) 55%,',
                            '  transparent 100%)',
                          ].join(' '),
                          backdropFilter:         'blur(14px) saturate(1.4)',
                          WebkitBackdropFilter:   'blur(14px) saturate(1.4)',
                        }}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-faint">
                            {item.brand}
                          </p>
                          <p className="mt-0.5 truncate text-sm font-bold leading-tight text-on-surface">
                            {item.name}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-[15px] font-extrabold tabular-nums text-on-surface">
                            {formatPrice(item.price)}
                          </p>
                          {item.original_price && item.original_price > item.price && (
                            <p className="text-[10px] tabular-nums text-on-surface-faint line-through">
                              {formatPrice(item.original_price)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Condition badge — top-left */}
                      {item.condition && itemCondStyle && (
                        <div className="absolute left-3.5 top-3.5">
                          <span className={
                            'rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] backdrop-blur-sm '
                            + itemCondStyle.className
                          }>
                            {itemCondStyle.label}
                          </span>
                        </div>
                      )}

                      {/* Savings badge — top-right, front only */}
                      {savings !== null && isFront && (
                        <div className="absolute right-3.5 top-3.5">
                          <span className="rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                            -{savings}%
                          </span>
                        </div>
                      )}

                      {/* front-card subtle highlight ring */}
                      {isFront && (
                        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-amber-400/20" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Dot indicators */}
            <div className="mt-6 flex items-center justify-center gap-2">
              {items.map((_, i) => {
                const isActive = positions[i] === 0
                return (
                  <button
                    key={i}
                    onClick={() => jumpTo(i)}
                    aria-label={`Slide ${i + 1}`}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width:      isActive ? 22 : 6,
                      height:     4,
                      background: isActive
                        ? 'rgb(245 158 11)'
                        : 'hsl(var(--border-subtle))',
                    }}
                  />
                )
              })}
            </div>
          </div>

          {/* ── Info panel ───────────────────────────────────────────────── */}
          <div className="flex w-full flex-col lg:max-w-[360px] lg:pt-1">

            {/* Keyed div so entering animation fires on each item change */}
            <div
              key={textKey}
              style={{ animation: 'featSlideIn 0.38s cubic-bezier(0.22,1,0.36,1) both' }}
            >
              <style>{`
                @keyframes featSlideIn {
                  from { opacity: 0; transform: translateY(12px); }
                  to   { opacity: 1; transform: translateY(0px);  }
                }
              `}</style>

              {frontItem && (
                <>
                  {/* Brand + condition */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-on-surface-faint">
                      {frontItem.brand}
                    </span>
                    {condStyle && (
                      <span className={
                        'rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] '
                        + condStyle.className
                      }>
                        {condStyle.label}
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="mt-2 font-display text-2xl font-extrabold leading-snug text-on-surface sm:text-[1.75rem]">
                    {frontItem.name}
                  </h3>

                  {/* Spec chips */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {[frontItem.processor, frontItem.ram, frontItem.storage, frontItem.screen_size]
                      .filter(Boolean)
                      .map((spec, idx) => (
                        <span
                          key={idx}
                          className="rounded-full border border-border-subtle bg-surface-raised px-2.5 py-[5px] text-[11px] font-medium text-on-surface-subtle"
                        >
                          {spec}
                        </span>
                      ))}
                  </div>

                  {/* Price */}
                  <div className="mt-5 flex items-baseline gap-2.5">
                    <span className="text-[2rem] font-extrabold leading-none tabular-nums tracking-tight text-on-surface">
                      {formatPrice(frontItem.price)}
                    </span>
                    {frontItem.original_price && frontItem.original_price > frontItem.price && (
                      <>
                        <span className="text-sm tabular-nums text-on-surface-faint line-through">
                          {formatPrice(frontItem.original_price)}
                        </span>
                        {savings !== null && (
                          <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-bold text-red-500">
                            -{savings}%
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-on-surface-faint">
                    TVA incluse · Paiement en 3x
                  </p>

                  {/* Divider */}
                  <div className="my-5 h-px w-full bg-border-faint" />

                  {/* CTAs */}
                  <div className="flex flex-col gap-2.5 sm:flex-row">
                    <button
                      onClick={handleAddToCart}
                      disabled={frontItem.stock_quantity === 0 || isAdding}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-bold text-[#0a0f1a] shadow-lg shadow-amber-500/25 transition hover:bg-amber-400 active:scale-[0.97] disabled:opacity-50"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {isAdding ? 'Ajout…' : 'Ajouter au panier'}
                    </button>
                    <a
                      href={WHATSAPP_URL}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/18"
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </a>
                  </div>

                  <Link
                    to={`/products/${frontItem.id}`}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-on-surface-faint transition hover:text-on-surface"
                  >
                    Voir la fiche produit →
                  </Link>
                </>
              )}
            </div>

            {/* Navigation row */}
            <div className="mt-8 flex items-center gap-3">
              <button
                onClick={handlePrev}
                aria-label="Précédent"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border-subtle bg-surface-raised text-on-surface shadow-sm transition hover:border-amber-400/50 hover:text-amber-400"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Suivant"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border-subtle bg-surface-raised text-on-surface shadow-sm transition hover:border-amber-400/50 hover:text-amber-400"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
              <span className="ml-1 text-xs tabular-nums text-on-surface-faint">
                {String(frontIdx + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}
              </span>
            </div>

            <Link
              to="/products"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400 sm:hidden"
            >
              Voir tous les laptops <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>
      )}
    </Section>
  )
}
