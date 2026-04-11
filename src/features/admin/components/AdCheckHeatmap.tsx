import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertTriangle,
  Clock,
} from 'lucide-react'
import { adminService } from '../services/adminService'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'

// ── Types ────────────────────────────────────────────────────────

type Product = {
  id: string
  name: string
  brand: string
  source_url?: string | null
  is_available?: boolean
  last_checked_at?: string | null
  availability_note?: string | null
}

// ── Helpers ──────────────────────────────────────────────────────

const TODAY = new Date().toISOString().slice(0, 10)

function isCheckedToday(last_checked_at?: string | null): boolean {
  if (!last_checked_at) return false
  return last_checked_at.slice(0, 10) === TODAY
}

function fmtRelative(iso?: string | null): string {
  if (!iso) return 'Jamais vérifié'
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const diffH = Math.floor(diffMs / 3_600_000)
  if (diffH < 1) return 'Il y a moins d\'1h'
  if (diffH < 24) return `Il y a ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD === 1) return 'Hier'
  return `Il y a ${diffD} jours`
}

// ── Product Row ──────────────────────────────────────────────────

function ProductRow({
  product,
  busy,
  onMarkChecked,
  onMarkUnavailable,
}: {
  product: Product
  busy: boolean
  onMarkChecked: (id: string) => void
  onMarkUnavailable: (id: string) => void
}) {
  const checkedToday = isCheckedToday(product.last_checked_at)
  const isOffline = !product.is_available

  let statusColor = ''
  let statusLabel = ''
  let statusIcon = null

  if (isOffline) {
    statusColor = 'bg-red-500/10 border-red-200 text-red-700 dark:text-red-400'
    statusLabel = product.availability_note ?? 'Hors ligne'
    statusIcon = <XCircle className="h-3.5 w-3.5 shrink-0" />
  } else if (!checkedToday) {
    statusColor = 'bg-amber-400/10 border-amber-300 text-amber-700 dark:text-amber-400'
    statusLabel = product.last_checked_at ? `Dernière vérif : ${fmtRelative(product.last_checked_at)}` : 'Jamais vérifié'
    statusIcon = <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
  } else {
    statusColor = 'bg-emerald-500/10 border-emerald-200 text-emerald-700 dark:text-emerald-400'
    statusLabel = `Vérifié ${fmtRelative(product.last_checked_at)}`
    statusIcon = <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
  }

  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors',
      isOffline
        ? 'bg-red-500/5 border-red-200/60 dark:border-red-900/40'
        : !checkedToday
          ? 'bg-amber-400/5 border-amber-200/60 dark:border-amber-900/40'
          : 'bg-surface-raised border-border-faint',
    )}>
      {/* Status dot */}
      <div className={cn(
        'w-2.5 h-2.5 rounded-full shrink-0',
        isOffline ? 'bg-red-500' :
        !checkedToday ? 'bg-amber-400 animate-pulse' :
        'bg-emerald-500',
      )} />

      {/* Product name + brand */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-medium truncate',
          isOffline ? 'text-on-surface-faint line-through' : 'text-on-surface',
        )}>
          {product.brand} {product.name}
        </p>
        <div className={cn('flex items-center gap-1 mt-0.5 text-xs', statusColor.split(' ').filter(c => c.startsWith('text-')).join(' '))}>
          {statusIcon}
          <span>{statusLabel}</span>
        </div>
      </div>

      {/* Source link */}
      {product.source_url && (
        <a
          href={product.source_url}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 text-on-surface-faint hover:text-blue-500 transition-colors"
          title="Ouvrir l'annonce source"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        {!checkedToday && (
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => onMarkChecked(product.id)}
            className="h-7 text-xs gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
          >
            <CheckCircle2 className="h-3 w-3" />
            En ligne
          </Button>
        )}
        {checkedToday && !isOffline && (
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => onMarkChecked(product.id)}
            className="h-7 text-xs gap-1 text-on-surface-faint hover:text-emerald-600"
            title="Re-confirmer en ligne"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
        {!isOffline && (
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => onMarkUnavailable(product.id)}
            className="h-7 text-xs gap-1 text-on-surface-faint hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Marquer vendu / hors ligne"
          >
            <XCircle className="h-3 w-3" />
            Vendu
          </Button>
        )}
        {isOffline && (
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => onMarkChecked(product.id)}
            className="h-7 text-xs gap-1 text-on-surface-faint hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            title="Remettre en ligne"
          >
            <CheckCircle2 className="h-3 w-3" />
            Remettre en ligne
          </Button>
        )}
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────

export function AdCheckHeatmap() {
  const queryClient = useQueryClient()
  const [collapsed, setCollapsed] = useState(false)

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => adminService.getProducts(),
    staleTime: 2 * 60 * 1000,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    queryClient.invalidateQueries({ queryKey: ['products'] })
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
      toast({ title: 'Produit masqué', description: 'Le produit est marqué vendu et masqué du catalogue.' })
    },
    onError: () => toast({ title: 'Erreur', variant: 'destructive' }),
  })

  const bulkMut = useMutation({
    mutationFn: (ids: string[]) => adminService.bulkMarkChecked(ids),
    onSuccess: (_, ids) => {
      invalidate()
      toast({ title: `${ids.length} produit(s) marqués en ligne`, description: 'Vérification du jour complète.' })
    },
    onError: () => toast({ title: 'Erreur', variant: 'destructive' }),
  })

  const sourced = (products as unknown as Product[]).filter(p => p.source_url)

  const checkedToday  = sourced.filter(p => isCheckedToday(p.last_checked_at) && p.is_available)
  const offlineToday  = sourced.filter(p => !p.is_available)
  const uncheckedToday = sourced.filter(p => p.is_available && !isCheckedToday(p.last_checked_at))

  const busy = checkMut.isPending || unavailMut.isPending || bulkMut.isPending

  if (isLoading) {
    return (
      <div className="bg-surface-raised rounded-2xl border border-border-faint shadow-sm p-5 space-y-3">
        <div className="h-5 w-52 bg-surface-sunken rounded animate-pulse" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 bg-surface-sunken rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (sourced.length === 0) return null

  return (
    <div className="bg-surface-raised rounded-2xl border border-border-faint shadow-sm overflow-hidden">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 border-b border-border-faint">
        <div>
          <p className="text-sm font-semibold text-on-surface flex items-center gap-2">
            Vérification quotidienne des annonces
            <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-surface-sunken text-on-surface-subtle border border-border-faint">
              {sourced.length} produits sourcés
            </span>
          </p>
          <p className="text-xs text-on-surface-subtle mt-0.5">
            Vérifiez chaque jour si les annonces sont encore disponibles. Si vendues, le produit est masqué automatiquement.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Today summary pills */}
          <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="h-3 w-3" /> {checkedToday.length} vérifiés
          </span>
          {offlineToday.length > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 border border-red-200 dark:border-red-800">
              <XCircle className="h-3 w-3" /> {offlineToday.length} hors ligne
            </span>
          )}
          {uncheckedToday.length > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-600 border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="h-3 w-3" /> {uncheckedToday.length} à vérifier
            </span>
          )}

          {/* Bulk mark all live */}
          {uncheckedToday.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => bulkMut.mutate(uncheckedToday.map(p => p.id))}
              className="h-7 text-xs gap-1.5"
            >
              <RefreshCw className={cn('h-3 w-3', bulkMut.isPending && 'animate-spin')} />
              Tout marquer en ligne
            </Button>
          )}

          <button onClick={() => setCollapsed(v => !v)} className="text-on-surface-faint hover:text-on-surface">
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* ── Warning banner if unchecked products exist ── */}
      {uncheckedToday.length > 0 && !collapsed && (
        <div className="px-5 py-2.5 bg-amber-50 dark:bg-amber-900/15 border-b border-amber-200/60 dark:border-amber-900/40 flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            <strong>{uncheckedToday.length} produit(s)</strong> n'ont pas encore été vérifiés aujourd'hui.
            Vérifiez que les annonces sources sont toujours disponibles avant de vendre.
          </p>
        </div>
      )}

      {/* ── Context note ── */}
      {!collapsed && (
        <div className="px-5 py-2.5 bg-sky-50 dark:bg-sky-900/20 border-b border-border-faint">
          <p className="text-xs text-sky-700 dark:text-sky-300">
            <strong>Important :</strong> Le chiffre d'affaires de ces produits sourcés est <strong>séparé</strong> de vos ventes propres.
            Si l'annonce disparaît, le produit n'est plus vendable et ne doit pas compter dans vos revenus.
          </p>
        </div>
      )}

      {!collapsed && (
        <div className="p-4 space-y-2">
          {/* Unchecked first, then checked, then offline */}
          {[...uncheckedToday, ...checkedToday, ...offlineToday].map(product => (
            <ProductRow
              key={product.id}
              product={product}
              busy={busy}
              onMarkChecked={(id) => checkMut.mutate(id)}
              onMarkUnavailable={(id) => unavailMut.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
