import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  /** Small label above the title */
  eyebrow?: string
  title: string
  description?: string
  /** 'left' | 'center' (default: 'center') */
  align?: 'left' | 'center'
  className?: string
}

/**
 * Standard section heading: optional eyebrow → h2 title → optional description.
 * Used by every landing-page section. Edit once, changes everywhere.
 *
 * Usage:
 *   <SectionHeader eyebrow="Catalogue" title="Nos laptops" description="..." />
 */
export function SectionHeader({ eyebrow, title, description, align = 'center', className }: SectionHeaderProps) {
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start'

  return (
    <div className={cn('flex flex-col gap-3', alignClass, className)}>
      {eyebrow && (
        <span className="inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-500">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className={cn('max-w-2xl text-base leading-relaxed text-on-surface-subtle', align === 'center' && 'mx-auto')}>
          {description}
        </p>
      )}
    </div>
  )
}
