import { Award, RotateCcw, ShieldCheck, Truck } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

const features = [
  {
    icon:        ShieldCheck,
    title:       'Qualité vérifiée',
    description: 'Chaque laptop passe un diagnostic multi-points rigoureux avant expédition.',
    num:         '01',
    // Tailwind classes — resting + hover all in CSS
    iconBg:      'bg-emerald-500/12 ring-emerald-500/25',
    iconColor:   'text-emerald-400',
    strip:       'bg-emerald-400',
    numColor:    'text-emerald-400',
    shadowRest:  '0 4px 20px rgba(52,211,153,0.08)',
    shadowHover: '0 16px 40px rgba(52,211,153,0.18)',
    borderRest:  '1px solid rgba(52,211,153,0.18)',
    borderHover: '1px solid rgba(52,211,153,0.45)',
    glowClass:   'group-hover:shadow-emerald-400/15',
  },
  {
    icon:        Award,
    title:       'Garantie incluse',
    description: 'Couverture claire avec support assuré par de vrais spécialistes.',
    num:         '02',
    iconBg:      'bg-amber-500/12 ring-amber-500/25',
    iconColor:   'text-amber-400',
    strip:       'bg-amber-400',
    numColor:    'text-amber-400',
    shadowRest:  '0 4px 20px rgba(251,191,36,0.08)',
    shadowHover: '0 16px 40px rgba(251,191,36,0.18)',
    borderRest:  '1px solid rgba(251,191,36,0.18)',
    borderHover: '1px solid rgba(251,191,36,0.45)',
    glowClass:   'group-hover:shadow-amber-400/15',
  },
  {
    icon:        Truck,
    title:       'Livraison rapide',
    description: 'Commandes soigneusement emballées avec suivi partout au Maroc.',
    num:         '03',
    iconBg:      'bg-sky-500/12 ring-sky-500/25',
    iconColor:   'text-sky-400',
    strip:       'bg-sky-400',
    numColor:    'text-sky-400',
    shadowRest:  '0 4px 20px rgba(56,189,248,0.08)',
    shadowHover: '0 16px 40px rgba(56,189,248,0.18)',
    borderRest:  '1px solid rgba(56,189,248,0.18)',
    borderHover: '1px solid rgba(56,189,248,0.45)',
    glowClass:   'group-hover:shadow-sky-400/15',
  },
  {
    icon:        RotateCcw,
    title:       'Retours 30 jours',
    description: 'Achetez en toute confiance avec notre politique de retour simplifiée.',
    num:         '04',
    iconBg:      'bg-violet-500/12 ring-violet-500/25',
    iconColor:   'text-violet-400',
    strip:       'bg-violet-400',
    numColor:    'text-violet-400',
    shadowRest:  '0 4px 20px rgba(167,139,250,0.08)',
    shadowHover: '0 16px 40px rgba(167,139,250,0.18)',
    borderRest:  '1px solid rgba(167,139,250,0.18)',
    borderHover: '1px solid rgba(167,139,250,0.45)',
    glowClass:   'group-hover:shadow-violet-400/15',
  },
]

export function WhyUs() {
  return (
    <section className="bg-surface-sunken py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-14 lg:flex-row lg:items-start lg:gap-20">

          {/* ── Left: sticky heading ── */}
          <ScrollReveal className="shrink-0 lg:sticky lg:top-28 lg:w-[300px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-amber-400">
              Pourquoi nous
            </span>
            <h2 className="mt-5 font-display text-3xl font-extrabold leading-tight tracking-tight text-on-surface sm:text-4xl">
              La différence{' '}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Casa By Tech.
              </span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-on-surface-subtle">
              Plus de raisons de faire confiance à chaque achat.
            </p>
            <div className="mt-8 h-0.5 w-12 rounded-full bg-gradient-to-r from-amber-400 to-orange-400" />
          </ScrollReveal>

          {/* ── Right: 2×2 grid ── */}
          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
            {features.map((f, idx) => (
              <ScrollReveal key={f.title} delay={idx * 80}>
                {/* Wrapper drives the border/shadow transition via inline style swap on hover.
                    We use a CSS custom-property trick: define rest values inline, override on hover
                    by swapping the style object — but since Tailwind can't do per-color shadows
                    dynamically we keep border+shadow in inline styles and transition them. */}
                <FeatureCard f={f} />
              </ScrollReveal>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}

// Isolated card so we can use React state for the hover without the parent re-rendering
function FeatureCard({ f }: { f: typeof features[number] }) {
  return (
    <div
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl p-6"
      style={{
        background:  'linear-gradient(145deg, hsl(var(--surface-raised)) 0%, hsl(var(--surface-base)) 100%)',
        border:      f.borderRest,
        boxShadow:   f.shadowRest,
        transition:  'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow   = f.shadowHover
        e.currentTarget.style.border      = f.borderHover
        e.currentTarget.style.transform   = 'translateY(-4px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow   = f.shadowRest
        e.currentTarget.style.border      = f.borderRest
        e.currentTarget.style.transform   = 'translateY(0px)'
      }}
    >
      {/* Colored left strip — always visible, brightens on hover */}
      <div
        className={`absolute inset-y-0 left-0 w-[3px] rounded-l-2xl ${f.strip} opacity-40 transition-opacity duration-300 group-hover:opacity-100`}
      />

      {/* Top accent line — faint at rest, full on hover */}
      <div
        className={`absolute inset-x-0 top-0 h-[2px] rounded-t-2xl ${f.strip} opacity-20 transition-opacity duration-300 group-hover:opacity-80`}
      />

      {/* Number + icon */}
      <div className="flex items-start justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ring-1 ${f.iconBg}`}>
          <f.icon className={`h-6 w-6 transition-transform duration-300 group-hover:scale-110 ${f.iconColor}`} />
        </div>
        <span className={`font-display text-4xl font-black tabular-nums opacity-10 transition-opacity duration-300 group-hover:opacity-20 ${f.numColor}`}>
          {f.num}
        </span>
      </div>

      {/* Text */}
      <h3 className="mt-5 text-base font-bold tracking-tight text-on-surface">
        {f.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-on-surface-subtle">
        {f.description}
      </p>

      {/* Bottom accent dot */}
      <div className="mt-auto pt-5">
        <div className={`h-1.5 w-1.5 rounded-full ${f.strip} opacity-40 transition-opacity duration-300 group-hover:opacity-100`} />
      </div>
    </div>
  )
}
