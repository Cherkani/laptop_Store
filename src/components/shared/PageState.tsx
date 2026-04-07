import { cn } from '@/lib/utils'

/* ─── Loading skeleton ────────────────────────────────────────── */

interface SkeletonGridProps {
  count?: number
  className?: string
}

/**
 * Animated skeleton grid — drop-in replacement while data is loading.
 *
 * Usage:
 *   if (isLoading) return <SkeletonGrid />
 */
export function SkeletonGrid({ count = 6, className }: SkeletonGridProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-border animate-pulse">
          <div className="aspect-[4/3] bg-muted" />
          <div className="space-y-3 p-5">
            <div className="h-2.5 w-16 rounded-full bg-muted" />
            <div className="h-4 w-3/4 rounded-full bg-muted" />
            <div className="flex gap-1.5">
              <div className="h-6 w-16 rounded-full border border-border bg-muted/60" />
              <div className="h-6 w-14 rounded-full border border-border bg-muted/60" />
              <div className="h-6 w-16 rounded-full border border-border bg-muted/60" />
            </div>
            <div className="mt-1 h-6 w-24 rounded-full bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Error state ─────────────────────────────────────────────── */

interface ErrorStateProps {
  message?: string
  className?: string
}

/**
 * Centred error state with an icon and message.
 *
 * Usage:
 *   if (error) return <ErrorState message={error.message} />
 */
export function ErrorState({ message, className }: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-24 text-center', className)}>
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
        <span className="text-2xl font-bold text-destructive">!</span>
      </div>
      <h3 className="text-lg font-bold text-on-surface">Une erreur est survenue</h3>
      {message && (
        <p className="mt-1.5 max-w-sm text-sm text-on-surface-subtle">{message}</p>
      )}
    </div>
  )
}

/* ─── Empty state ─────────────────────────────────────────────── */

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

/**
 * Centred empty state with optional icon, title, description, and action.
 *
 * Usage:
 *   if (!products.length) return (
 *     <EmptyState
 *       icon={<Laptop className="h-8 w-8 text-muted-foreground" />}
 *       title="No laptops found"
 *       description="Try adjusting your filters."
 *     />
 *   )
 */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-24 text-center', className)}>
      {icon && (
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-on-surface">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-on-surface-subtle">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
