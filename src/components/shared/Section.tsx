import { cn } from '@/lib/utils'
import { LAYOUT } from '@/lib/constants'

interface SectionProps {
  children: React.ReactNode
  /** Override the section-level background class */
  bg?: string
  /** Extra classes on the outer <section> */
  className?: string
  /** Extra classes on the inner container */
  containerClassName?: string
  as?: React.ElementType
}

/**
 * Standard page section wrapper.
 * Provides consistent max-width, padding, and background across all sections.
 *
 * Usage:
 *   <Section>...</Section>
 *   <Section bg="bg-surface-sunken">...</Section>
 */
export function Section({
  children,
  bg = 'bg-surface-base',
  className,
  containerClassName,
  as: Tag = 'section',
}: SectionProps) {
  return (
    <Tag className={cn(bg, LAYOUT.sectionPy, className)}>
      <div className={cn('mx-auto', LAYOUT.maxWidth, LAYOUT.containerPx, containerClassName)}>
        {children}
      </div>
    </Tag>
  )
}
