import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'
import { Section } from '@/components/shared/Section'
import { SectionHeader } from '@/components/shared/SectionHeader'

const categories = [
  {
    title: 'Pour les créatifs',
    description: 'Écrans haute résolution, GPU rapides et autonomie solide pour créer sans limite.',
    href: '/advisor/creators',
    image:
      'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=1200&q=80',
    accent: 'from-white/0 via-white/65 to-white/92',
    badge: 'Créatifs',
  },
  {
    title: 'Pour les développeurs',
    description: 'Compilez rapidement et faites tourner plusieurs outils en simultané.',
    href: '/advisor/developers',
    image:
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
    accent: 'from-white/0 via-white/70 to-white/95',
    badge: 'Développeurs',
  },
  {
    title: 'Pour les entreprises',
    description: 'Appareils fiables conçus pour la productivité et la portabilité.',
    href: '/advisor/business',
    image:
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80',
    accent: 'from-white/0 via-white/75 to-white/95',
    badge: 'Entreprises',
  },
  {
    title: 'Pour les gamers',
    description: 'Graphismes puissants et dalles haute fréquence pour une expérience immersive.',
    href: '/advisor/gaming',
    image:
      'https://images.unsplash.com/photo-1486401899868-0e435ed85128?auto=format&fit=crop&w=1200&q=80',
    accent: 'from-white/0 via-white/70 to-white/90',
    badge: 'Gamers',
  },
]

export function CategoryCards() {
  return (
    <Section bg="bg-surface-sunken">
      <ScrollReveal>
        <SectionHeader
          eyebrow="Catégories"
          title="Trouvez votre laptop."
          description="Un ordinateur adapté à votre façon de travailler."
          align="left"
          className="mb-10 lg:mb-14"
        />
      </ScrollReveal>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category, index) => (
          <ScrollReveal key={category.title} delay={index * 60}>
            <Link
              to={category.href}
              className="group relative block h-[320px] overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${category.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-transparent" />
              <div
                className={`absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t ${category.accent}`}
              >
                <div className="inline-flex items-center rounded-full bg-black/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white">
                  {category.badge}
                </div>
                <h3 className="mt-4 text-xl font-bold text-gray-900 drop-shadow-sm">{category.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-700">
                  {category.description}
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600">
                  Explorer
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </Section>
  )
}
