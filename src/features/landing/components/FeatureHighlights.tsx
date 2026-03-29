import { Briefcase, Headphones, Wrench } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

const supportItems = [
  {
    icon: Headphones,
    title: 'Pre-purchase guidance',
    description: 'Quick recommendations based on your workflow and budget.',
  },
  {
    icon: Wrench,
    title: 'Setup assistance',
    description: 'Help with migration, setup, and first-day configuration.',
  },
  {
    icon: Briefcase,
    title: 'Business orders',
    description: 'Dedicated support for teams and bulk laptop purchases.',
  },
]

export function FeatureHighlights() {
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-[1260px] mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <section className="glass-card rounded-[32px] p-6 sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#607086]">
                  Support
                </p>
                <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-[#1d1d1f] sm:text-4xl">
                  Simple, expert help.
                </h2>
                <p className="mt-3 max-w-md text-sm text-[#5b6472] sm:text-base">
                  Clear assistance before and after purchase. Fast answers, straightforward guidance.
                </p>
              </div>

              <div className="divide-y divide-[#dde7f3] rounded-2xl border border-[#dbe6f1] bg-gradient-to-br from-[#f8fcff] via-[#f8fbff] to-[#f2f7ff]">
                {supportItems.map((item, index) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-4 px-5 py-4 first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    <div className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#0f5dcf] ring-1 ring-black/5">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold tracking-tight text-[#122036]">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-[#5b6472]">{item.description}</p>
                    </div>
                    {index === 0 && (
                      <span className="ml-auto mt-1 rounded-full bg-[#dff1ff] px-2.5 py-1 text-[11px] font-semibold text-[#0f5dcf]">
                        Fast
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>
      </div>
    </section>
  )
}
