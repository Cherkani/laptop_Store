import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  History,
  RefreshCw,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { adminService } from '../services/adminService'

type Product = {
  id: string
  name: string
  brand: string
  source_url?: string | null
  is_available?: boolean
  last_checked_at?: string | null
  availability_note?: string | null
}

type CheckLog = {
  id: string
  product_id: string
  checked_at: string
  status: 'online' | 'unavailable'
  note: string | null
}

const TODAY = new Date().toISOString().slice(0, 10)

function isCheckedToday(last_checked_at?: string | null): boolean {
  if (!last_checked_at) return false
  return last_checked_at.slice(0, 10) === TODAY
}

function fmtRelative(iso?: string | null): string {
  if (!iso) return 'Jamais verifie'
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const diffH = Math.floor(diffMs / 3_600_000)
  if (diffH < 1) return "Il y a moins d'1h"
  if (diffH < 24) return `Il y a ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD === 1) return 'Hier'
  return `Il y a ${diffD} jours`
}

function fmtLogTime(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function StatCard({
  tone,
  label,
  value,
}: {
  tone: 'emerald' | 'cyan' | 'red' | 'amber'
  label: string
  value: string
}) {
  const classes = {
    emerald: 'border-emerald-200 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900/40 dark:text-emerald-400',
    cyan: 'border-cyan-200 bg-cyan-500/10 text-cyan-700 dark:border-cyan-900/40 dark:text-cyan-400',
    red: 'border-red-200 bg-red-500/10 text-red-700 dark:border-red-900/40 dark:text-red-400',
    amber: 'border-amber-200 bg-amber-500/10 text-amber-700 dark:border-amber-900/40 dark:text-amber-400',
  } as const

  return (
    <div className={cn('rounded-xl border px-3 py-2.5', classes[tone])}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] opacity-80">{label}</p>
      <p className="mt-1 text-xl font-bold leading-none">{value}</p>
    </div>
  )
}

function LogPill({ log }: { log: CheckLog }) {
  const isOnline = log.status === 'online'
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg border px-2.5 py-2 text-xs',
        isOnline
          ? 'border-emerald-200 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900/40 dark:text-emerald-400'
          : 'border-red-200 bg-red-500/10 text-red-700 dark:border-red-900/40 dark:text-red-400',
      )}
    >
      <span className="font-medium">{isOnline ? 'En ligne' : 'Hors ligne'}</span>
      <span className="text-on-surface-faint">{fmtLogTime(log.checked_at)}</span>
    </div>
  )
}

function ProductCard({
  product,
  todayChecks,
  recentLogs,
  logsOpen,
  onToggleLogs,
  busy,
  onMarkChecked,
  onMarkUnavailable,
}: {
  product: Product
  todayChecks: number
  recentLogs: CheckLog[]
  logsOpen: boolean
  onToggleLogs: () => void
  busy: boolean
  onMarkChecked: (id: string) => void
  onMarkUnavailable: (id: string) => void
}) {
  const checkedToday = todayChecks > 0 || isCheckedToday(product.last_checked_at)
  const isOffline = !product.is_available

  const shellClass = isOffline
    ? 'border-red-200/70 bg-red-500/5 dark:border-red-900/40'
    : checkedToday
      ? 'border-emerald-200/70 bg-emerald-500/[0.03] dark:border-emerald-900/30'
      : 'border-amber-200/70 bg-amber-500/[0.04] dark:border-amber-900/30'

  const dotClass = isOffline ? 'bg-red-500' : checkedToday ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'

  const statusTone = isOffline
    ? 'border-red-200 bg-red-500/10 text-red-700 dark:border-red-900/40 dark:text-red-400'
    : checkedToday
      ? 'border-emerald-200 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900/40 dark:text-emerald-400'
      : 'border-amber-200 bg-amber-500/10 text-amber-700 dark:border-amber-900/40 dark:text-amber-400'

  const statusLabel = isOffline
    ? product.availability_note ?? 'Hors ligne'
    : checkedToday
      ? todayChecks > 0
        ? `${todayChecks} verification${todayChecks > 1 ? 's' : ''} aujourd'hui`
        : `Verifie ${fmtRelative(product.last_checked_at)}`
      : product.last_checked_at
        ? `Derniere verif : ${fmtRelative(product.last_checked_at)}`
        : 'Jamais verifie'

  return (
    <div className={cn('rounded-2xl border p-4 shadow-sm transition-colors', shellClass)}>
      <div className="flex items-start gap-3">
        <div className={cn('mt-1 h-2.5 w-2.5 shrink-0 rounded-full', dotClass)} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={cn('truncate text-sm font-semibold', isOffline ? 'text-on-surface-faint line-through' : 'text-on-surface')}>
                {product.brand} {product.name}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={cn('rounded-full border px-2.5 py-1 text-[11px] font-medium', statusTone)}>
                  {statusLabel}
                </span>
                <span className="rounded-full border border-border-faint bg-surface-base px-2.5 py-1 text-[11px] text-on-surface-subtle">
                  {todayChecks} fois aujourd'hui
                </span>
              </div>
            </div>

            {product.source_url && (
              <a
                href={product.source_url}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 rounded-lg border border-border-faint bg-surface-base p-2 text-on-surface-faint transition-colors hover:text-blue-500"
                title="Ouvrir l'annonce source"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={logsOpen ? 'secondary' : 'ghost'}
              onClick={onToggleLogs}
              className="h-8 gap-1.5 text-xs"
            >
              <History className="h-3.5 w-3.5" />
              {logsOpen ? 'Masquer log' : 'Voir log'}
            </Button>

            {!checkedToday && !isOffline && (
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => onMarkChecked(product.id)}
                className="h-8 gap-1.5 border-emerald-300 text-xs text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                En ligne
              </Button>
            )}

            {checkedToday && !isOffline && (
              <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={() => onMarkChecked(product.id)}
                className="h-8 gap-1.5 text-xs text-on-surface-faint hover:text-emerald-600"
                title="Re-confirmer en ligne"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Re-verifier
              </Button>
            )}

            {!isOffline && (
              <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={() => onMarkUnavailable(product.id)}
                className="h-8 gap-1.5 text-xs text-on-surface-faint hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
              >
                <XCircle className="h-3.5 w-3.5" />
                Vendu
              </Button>
            )}

            {isOffline && (
              <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={() => onMarkChecked(product.id)}
                className="h-8 gap-1.5 text-xs text-on-surface-faint hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/20"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Remettre en ligne
              </Button>
            )}
          </div>

          {logsOpen && (
            <div className="mt-4 rounded-xl border border-border-faint bg-surface-base p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-on-surface-faint">
                  Journal recent
                </p>
                <span className="text-[11px] text-on-surface-faint">
                  {recentLogs.length} entree{recentLogs.length > 1 ? 's' : ''}
                </span>
              </div>

              {recentLogs.length === 0 ? (
                <p className="mt-2 text-xs text-on-surface-faint">Aucun log disponible pour ce produit.</p>
              ) : (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {recentLogs.slice(0, 8).map(log => <LogPill key={log.id} log={log} />)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function AdCheckHeatmap() {
  const queryClient = useQueryClient()
  const [collapsed, setCollapsed] = useState(false)
  const [openLogs, setOpenLogs] = useState<Record<string, boolean>>({})

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => adminService.getProducts(),
    staleTime: 2 * 60 * 1000,
  })

  const trackedProducts = products as Product[]

  const { data: todayCheckCounts = {} } = useQuery({
    queryKey: ['product-check-counts', TODAY],
    queryFn: () => adminService.getTodayVerificationCounts(trackedProducts.map(product => product.id)),
    enabled: trackedProducts.length > 0,
    staleTime: 30 * 1000,
  })

  const { data: recentLogs = [] } = useQuery({
    queryKey: ['product-check-logs'],
    queryFn: () => adminService.getRecentCheckLogs(trackedProducts.map(product => product.id), 600),
    enabled: trackedProducts.length > 0,
    staleTime: 30 * 1000,
  })

  const logsByProduct = (recentLogs as CheckLog[]).reduce<Record<string, CheckLog[]>>((acc, log) => {
    if (!acc[log.product_id]) acc[log.product_id] = []
    acc[log.product_id].push(log)
    return acc
  }, {})

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    queryClient.invalidateQueries({ queryKey: ['products'] })
    queryClient.invalidateQueries({ queryKey: ['product-check-counts'] })
    queryClient.invalidateQueries({ queryKey: ['product-check-logs'] })
    queryClient.invalidateQueries({ queryKey: ['verification-activity'] })
  }

  const checkMut = useMutation({
    mutationFn: (id: string) => adminService.markChecked(id),
    onSuccess: () => invalidate(),
    onError: () => toast({ title: 'Erreur', variant: 'destructive' }),
  })

  const unavailMut = useMutation({
    mutationFn: (id: string) => adminService.markUnavailable(id),
    onSuccess: () => {
      invalidate()
      toast({ title: 'Produit masque', description: 'Le produit est marque vendu et masque du catalogue.' })
    },
    onError: () => toast({ title: 'Erreur', variant: 'destructive' }),
  })

  const bulkMut = useMutation({
    mutationFn: (ids: string[]) => adminService.bulkMarkChecked(ids),
    onSuccess: (_, ids) => {
      invalidate()
      toast({ title: `${ids.length} produit(s) marques en ligne`, description: 'Verification du jour complete.' })
    },
    onError: () => toast({ title: 'Erreur', variant: 'destructive' }),
  })

  const checkedToday = trackedProducts.filter(product => product.is_available && ((todayCheckCounts[product.id] ?? 0) > 0 || isCheckedToday(product.last_checked_at)))
  const offlineToday = trackedProducts.filter(product => !product.is_available)
  const uncheckedToday = trackedProducts.filter(product => product.is_available && (todayCheckCounts[product.id] ?? 0) === 0 && !isCheckedToday(product.last_checked_at))
  const totalChecksToday = Object.values(todayCheckCounts).reduce((sum, count) => sum + count, 0)
  const busy = checkMut.isPending || unavailMut.isPending || bulkMut.isPending

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border-faint bg-surface-raised p-5 shadow-sm">
        <div className="space-y-3">
          <div className="h-5 w-56 animate-pulse rounded bg-surface-sunken" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-xl bg-surface-sunken" />
            ))}
          </div>
          <div className="grid gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-32 animate-pulse rounded-2xl bg-surface-sunken" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (trackedProducts.length === 0) return null

  const orderedProducts = [...uncheckedToday, ...checkedToday, ...offlineToday]

  return (
    <div className="overflow-hidden rounded-2xl border border-border-faint bg-surface-raised shadow-sm">
      <div className="border-b border-border-faint px-5 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-on-surface">Verification quotidienne des produits</p>
            <p className="mt-1 text-xs text-on-surface-subtle">
              Chaque verification est historisee. Vous pouvez verifier plusieurs fois le meme produit dans la journee et consulter son journal recent.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {uncheckedToday.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => bulkMut.mutate(uncheckedToday.map(product => product.id))}
                className="h-8 gap-1.5 text-xs"
              >
                <RefreshCw className={cn('h-3.5 w-3.5', bulkMut.isPending && 'animate-spin')} />
                Tout marquer en ligne
              </Button>
            )}
            <button onClick={() => setCollapsed(value => !value)} className="text-on-surface-faint transition-colors hover:text-on-surface">
              {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {!collapsed && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard tone="emerald" label="Produits verifies" value={String(checkedToday.length)} />
            <StatCard tone="cyan" label="Checks aujourd'hui" value={String(totalChecksToday)} />
            <StatCard tone="red" label="Hors ligne" value={String(offlineToday.length)} />
            <StatCard tone="amber" label="A verifier" value={String(uncheckedToday.length)} />
          </div>
        )}
      </div>

      {!collapsed && uncheckedToday.length > 0 && (
        <div className="flex items-center gap-2 border-b border-amber-200/60 bg-amber-50 px-5 py-3 dark:border-amber-900/40 dark:bg-amber-900/15">
          <Clock className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            <strong>{uncheckedToday.length} produit(s)</strong> n'ont pas encore ete verifies aujourd'hui.
          </p>
        </div>
      )}

      {!collapsed && (
        <div className="border-b border-border-faint bg-sky-50 px-5 py-3 dark:bg-sky-900/20">
          <p className="text-xs text-sky-700 dark:text-sky-300">
            <strong>Important :</strong> Cette vue couvre maintenant tous les produits du catalogue. Les liens source restent disponibles quand ils existent.
          </p>
        </div>
      )}

      {!collapsed && (
        <div className="p-4">
          <div className="grid gap-3">
            {orderedProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                todayChecks={todayCheckCounts[product.id] ?? 0}
                recentLogs={logsByProduct[product.id] ?? []}
                logsOpen={!!openLogs[product.id]}
                onToggleLogs={() => setOpenLogs(prev => ({ ...prev, [product.id]: !prev[product.id] }))}
                busy={busy}
                onMarkChecked={id => checkMut.mutate(id)}
                onMarkUnavailable={id => unavailMut.mutate(id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
