import { Briefcase, Headphones, Wrench } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

const supportItems = [
  {
    icon: Headphones,
    title: 'Conseils pré-achat',
    description: 'Recommandations rapides selon votre usage et budget.',
    badge: 'Rapide',
    badgeColor: 'bg-sky-500/15 text-sky-400',
  },
  {
    icon: Wrench,
    title: 'Assistance à la configuration',
    description: 'Aide à la migration, la configuration et la première utilisation.',
    badge: null,
    badgeColor: '',
  },
  {
    icon: Briefcase,
    title: 'Commandes entreprises',
    description: 'Support dédié pour les équipes et achats groupés.',
    badge: null,
    badgeColor: '',
  },
]

export function FeatureHighlights() {
  return (
    <section className="bg-[#0a0f1a] py-14 sm:py-18 lg:py-24">
      <div className="mx-auto max-w-[1260px] px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0f1726]">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch">
              {/* Left: text */}
              <div className="flex flex-col justify-center p-8 lg:p-12">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
                  Support
                </p>
                <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Une aide simple,{' '}
                  <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                    experte.
                  </span>
                </h2>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/50 sm:text-base">
                  Une assistance claire avant et après l'achat. Réponses rapides, conseils directs.
                </p>
              </div>

              {/* Right: items */}
              <div className="border-t border-white/[0.06] lg:border-l lg:border-t-0">
                {supportItems.map((item, index) => (
                  <div
                    key={item.title}
                    className={`flex items-start gap-4 p-6 lg:p-7 ${
                      index < supportItems.length - 1 ? 'border-b border-white/[0.06]' : ''
                    }`}
                  >
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/60">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold tracking-tight text-white">{item.title}</h3>
                      <p className="mt-1 text-sm text-white/45">{item.description}</p>
                    </div>
                    {item.badge && (
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
