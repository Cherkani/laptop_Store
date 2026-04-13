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
 */
export function SectionHeader({ eyebrow, title, description, align = 'center', className }: SectionHeaderProps) {
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start'

  return (
    <div className={cn('flex flex-col gap-3.5', alignClass, className)}>
      {eyebrow && (
        <span className="inline-block rounded-full border border-amber-500/25 bg-amber-500/8 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl font-extrabold leading-[1.1] tracking-[-0.025em] text-on-surface sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className={cn(
          'max-w-2xl text-base leading-relaxed text-on-surface-subtle sm:text-[1.05rem]',
          align === 'center' && 'mx-auto',
        )}>
          {description}
        </p>
      )}
    </div>
  )
}
