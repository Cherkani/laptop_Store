import { Award, RotateCcw, ShieldCheck, Truck } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

const features = [
  {
    icon: ShieldCheck,
    title: 'Qualité vérifiée',
    description: 'Chaque laptop passe un diagnostic multi-points rigoureux avant expédition.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 ring-emerald-500/20',
  },
  {
    icon: Award,
    title: 'Garantie incluse',
    description: 'Couverture claire avec support assuré par de vrais spécialistes.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 ring-amber-500/20',
  },
  {
    icon: Truck,
    title: 'Livraison rapide',
    description: 'Commandes soigneusement emballées avec suivi partout au Maroc.',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10 ring-sky-500/20',
  },
  {
    icon: RotateCcw,
    title: 'Retours 30 jours',
    description: 'Achetez en toute confiance avec notre politique de retour simplifiée.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 ring-violet-500/20',
  },
]

export function WhyUs() {
  return (
    <section className="bg-[#070c15] py-14 sm:py-18 lg:py-24">
      <div className="pointer-events-none absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      <div className="mx-auto max-w-[1260px] px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-10 lg:mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
              Pourquoi nous
            </p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              La différence TechFiable.
            </h2>
            <p className="mt-2 max-w-lg text-base text-white/50 sm:text-lg">
              Plus de raisons de faire confiance à chaque achat.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <ScrollReveal key={feature.title} delay={index * 80}>
              <div className="group h-full rounded-2xl border border-white/[0.07] bg-[#0f1726] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/12 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                <div
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${feature.bg}`}
                >
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <h3 className="mt-5 text-base font-bold tracking-tight text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  {feature.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
