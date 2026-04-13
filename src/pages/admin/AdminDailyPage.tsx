import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2, Circle, Plus, Package, Target, MessageCircle, TrendingUp,
  Truck, Share2, CheckCheck, XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AdCheckHeatmap } from '@/features/admin/components/AdCheckHeatmap'
import { useAdminProducts } from '@/features/admin/hooks/useAdminProducts'
import { useWhatsAppLeads } from '@/features/admin/hooks/useBackoffice'
import { getImageSrc, formatPrice } from '@/lib/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/features/admin/services/adminService'
import { toast } from '@/hooks/use-toast'
import type { Product, ProductImage, Delivery } from '@/types/database.types'

const DAILY_GOAL = 3
const TODAY = new Date().toISOString().slice(0, 10)

type AdminProduct = Product & { product_images: ProductImage[] }
type Period = '1d' | '7d' | '30d'

const PERIOD_DAYS: Record<Period, number> = { '1d': 1, '7d': 7, '30d': 30 }
const PERIOD_LABELS: Record<Period, string> = { '1d': 'Jour', '7d': 'Semaine', '30d': 'Mois' }

// ── Helpers ────────────────────────────────────────────────────────

function toDateKey(iso: string) { return iso.slice(0, 10) }

function getLevel(count: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0
  if (max === 0) return 1
  const r = count / max
  if (r <= 0.25) return 1; if (r <= 0.5) return 2; if (r <= 0.75) return 3; return 4
}

const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

// ── Period filter bar ──────────────────────────────────────────────

function PeriodFilter({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  return (
    <div className="flex items-center gap-1 bg-surface-raised border border-border-faint rounded-xl p-1">
      {(['1d', '7d', '30d'] as Period[]).map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
            value === p
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-on-surface-subtle hover:text-on-surface hover:bg-surface-sunken',
          )}
        >
          {PERIOD_LABELS[p]}
        </button>
      ))}
    </div>
  )
}

// ── Full-history grid builder (from earliest date to today) ───────

function buildFullGrid(earliest: Date): Date[][] {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  // Start from Sunday of the week containing the earliest date
  const start = new Date(earliest); start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - start.getDay()) // back to Sunday
  const weeks: Date[][] = []
  const cursor = new Date(start)
  while (cursor <= today) {
    const week: Date[] = []
    for (let d = 0; d < 7; d++) { week.push(new Date(cursor)); cursor.setDate(cursor.getDate() + 1) }
    weeks.push(week)
  }
  return weeks
}

// ── Single heatmap grid panel (same structure as ActivityHeatmap on Dashboard) ──

interface HeatmapGridProps {
  counts: Record<string, number>
  label: string
  totalLabel: string
  total: number
  weeks: Date[][]
  colorClass: (level: 0 | 1 | 2 | 3 | 4) => string
  tooltip: (date: Date, count: number) => string
}

function HeatmapGrid({ counts, label, totalLabel, total, weeks, colorClass, tooltip }: HeatmapGridProps) {
  const maxCount = Math.max(...Object.values(counts), 1)

  const monthLabels = useMemo(() => {
    const labels: { label: string; col: number }[] = []
    weeks.forEach((week, col) => {
      const first = week.find(d => d.getDate() <= 7)
      if (first) {
        const prev = col > 0 ? weeks[col - 1][0] : null
        if (!prev || prev.getMonth() !== first.getMonth()) {
          labels.push({ label: MONTH_LABELS[first.getMonth()], col })
        }
      }
    })
    return labels
  }, [weeks])

  return (
    <div className="bg-surface-raised rounded-2xl border border-border-faint shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-on-surface">{label}</p>
        <span className="text-xs text-on-surface-faint">{total} {totalLabel}</span>
      </div>
      <div className="overflow-x-auto">
        <div style={{ minWidth: weeks.length * 13 }}>
          {/* Month labels */}
          <div className="flex mb-1" style={{ paddingLeft: 20 }}>
            {weeks.map((_, col) => {
              const ml = monthLabels.find(m => m.col === col)
              return (
                <div key={col} className="shrink-0" style={{ width: 11, marginRight: 2 }}>
                  {ml && <span className="text-[10px] text-on-surface-faint whitespace-nowrap">{ml.label}</span>}
                </div>
              )
            })}
          </div>
          {/* Grid */}
          <div className="flex gap-[2px]">
            <div className="flex flex-col gap-[2px] mr-1 shrink-0">
              {['', 'Lun', '', 'Mer', '', 'Ven', ''].map((d, i) => (
                <div key={i} className="h-[11px] text-[9px] text-on-surface-faint flex items-center" style={{ width: 16 }}>{d}</div>
              ))}
            </div>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[2px]">
                {week.map((day, di) => {
                  const key = toDateKey(day.toISOString())
                  const count = counts[key] ?? 0
                  const level = getLevel(count, maxCount)
                  const isFuture = day > new Date()
                  const isToday = key === TODAY
                  return (
                    <div
                      key={di}
                      title={isFuture ? '' : tooltip(day, count)}
                      className={cn(
                        'rounded-[2px] shrink-0',
                        isFuture ? 'bg-surface-sunken opacity-20' : colorClass(level),
                        isToday && !isFuture && 'ring-2 ring-offset-1 ring-white/60',
                      )}
                      style={{ width: 11, height: 11 }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
          {/* Legend */}
          <div className="flex items-center gap-1.5 mt-3 justify-end">
            <span className="text-[10px] text-on-surface-faint">Moins</span>
            {([0, 1, 2, 3, 4] as const).map(l => (
              <div key={l} className={cn('rounded-[2px]', colorClass(l))} style={{ width: 11, height: 11 }} />
            ))}
            <span className="text-[10px] text-on-surface-faint">Plus</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Activity heatmaps (full history, filter-independent) ───────────

function CatalogueHeatmap() {
  const { data: rawProducts = [], isLoading } = useAdminProducts()
  const products = rawProducts as AdminProduct[]

  const { addCounts, verifCounts, weeks, totalAdds, totalVerifs } = useMemo(() => {
    const addMap: Record<string, number> = {}
    const verifMap: Record<string, number> = {}

    products.forEach(p => {
      if (p.created_at) {
        const k = toDateKey(p.created_at)
        addMap[k] = (addMap[k] ?? 0) + 1
      }
      if ((p as any).last_checked_at) {
        const k = toDateKey((p as any).last_checked_at)
        verifMap[k] = (verifMap[k] ?? 0) + 1
      }
    })

    const allDates = [
      ...products.map(p => p.created_at).filter(Boolean),
      ...products.map(p => (p as any).last_checked_at).filter(Boolean),
    ] as string[]

    const earliest = allDates.length > 0
      ? new Date(allDates.reduce((a, b) => a < b ? a : b))
      : (() => { const d = new Date(); d.setDate(d.getDate() - 52 * 7); return d })()

    return {
      addCounts: addMap,
      verifCounts: verifMap,
      weeks: buildFullGrid(earliest),
      totalAdds: Object.values(addMap).reduce((s, n) => s + n, 0),
      totalVerifs: Object.values(verifMap).reduce((s, n) => s + n, 0),
    }
  }, [products])

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 gap-5">
        {[0, 1].map(i => (
          <div key={i} className="bg-surface-raised rounded-2xl border border-border-faint shadow-sm p-5 h-40 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 gap-5">
      <HeatmapGrid
        weeks={weeks}
        label="Activité catalogue"
        totalLabel={`ajout${totalAdds !== 1 ? 's' : ''}`}
        total={totalAdds}
        counts={addCounts}
        colorClass={l => ({ 0: 'bg-surface-sunken', 1: 'bg-cyan-200', 2: 'bg-cyan-400', 3: 'bg-cyan-500', 4: 'bg-cyan-700' }[l])}
        tooltip={(date, count) =>
          count === 0
            ? `${date.toLocaleDateString('fr-FR')} — aucun ajout`
            : `${date.toLocaleDateString('fr-FR')} — ${count} produit${count > 1 ? 's' : ''} ajouté${count > 1 ? 's' : ''}`
        }
      />
      <HeatmapGrid
        weeks={weeks}
        label="Activité vérifications"
        totalLabel={`vérif${totalVerifs !== 1 ? 's' : ''}`}
        total={totalVerifs}
        counts={verifCounts}
        colorClass={l => ({ 0: 'bg-surface-sunken', 1: 'bg-amber-200', 2: 'bg-amber-400', 3: 'bg-amber-500', 4: 'bg-amber-700' }[l])}
        tooltip={(date, count) =>
          count === 0
            ? `${date.toLocaleDateString('fr-FR')} — aucune vérification`
            : `${date.toLocaleDateString('fr-FR')} — ${count} produit${count > 1 ? 's' : ''} vérifié${count > 1 ? 's' : ''}`
        }
      />
    </div>
  )
}

// ── Daily posting tracker ──────────────────────────────────────────

function DailyPostingTracker() {
  const { data: rawProducts = [], isLoading } = useAdminProducts()
  const products = rawProducts as AdminProduct[]
  const postedToday = products.filter(p => p.created_at?.slice(0, 10) === TODAY)
  const done = postedToday.length
  const pct = Math.min(100, Math.round((done / DAILY_GOAL) * 100))
  const met = done >= DAILY_GOAL

  return (
    <div className={cn('rounded-2xl border shadow-sm overflow-hidden', met ? 'bg-emerald-500/5 border-emerald-200 dark:border-emerald-800' : done > 0 ? 'bg-amber-400/5 border-amber-200 dark:border-amber-800' : 'bg-surface-raised border-border-faint')}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-faint">
        <div className="flex items-center gap-3">
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', met ? 'bg-emerald-500/15 text-emerald-600' : done > 0 ? 'bg-amber-400/15 text-amber-600' : 'bg-surface-sunken text-on-surface-faint')}>
            <Target className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-on-surface">Objectif publication du jour</p>
            <p className="text-xs text-on-surface-subtle mt-0.5">Minimum {DAILY_GOAL} produits par jour</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className={cn('text-2xl font-bold leading-none', met ? 'text-emerald-600' : done > 0 ? 'text-amber-600' : 'text-on-surface-faint')}>
              {isLoading ? '…' : done}<span className="text-sm font-normal text-on-surface-faint">/{DAILY_GOAL}</span>
            </p>
            <p className="text-[11px] text-on-surface-subtle mt-0.5">
              {isLoading ? '' : met ? 'Objectif atteint ✓' : `${DAILY_GOAL - done} restant${DAILY_GOAL - done > 1 ? 's' : ''}`}
            </p>
          </div>
          <Button asChild size="sm" className="h-8 gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white shrink-0">
            <Link to="/admin/products?action=new"><Plus className="h-3.5 w-3.5" />Ajouter</Link>
          </Button>
        </div>
      </div>

      {/* Progress bar + steps */}
      <div className="px-5 py-3 border-b border-border-faint">
        <div className="flex items-center gap-3 mb-2.5">
          <div className="flex-1 h-2 bg-surface-sunken rounded-full overflow-hidden">
            <div className={cn('h-full rounded-full transition-all duration-500', met ? 'bg-emerald-500' : done > 0 ? 'bg-amber-400' : 'bg-border-subtle')} style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs font-semibold text-on-surface-subtle w-8 text-right">{pct}%</span>
        </div>
        <div className="flex items-center gap-4">
          {Array.from({ length: DAILY_GOAL }).map((_, i) => (
            <div key={i} className="flex items-center gap-1.5">
              {i < done ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> : <Circle className="h-4 w-4 text-border-subtle shrink-0" />}
              <span className={cn('text-xs', i < done ? 'text-on-surface' : 'text-on-surface-faint')}>Produit {i + 1}</span>
            </div>
          ))}
          {done > DAILY_GOAL && <span className="text-xs font-semibold text-emerald-600">+{done - DAILY_GOAL} bonus</span>}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="p-4 space-y-2">{[1, 2].map(i => <div key={i} className="h-12 bg-surface-sunken rounded-xl animate-pulse" />)}</div>
      ) : postedToday.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Package className="h-7 w-7 text-on-surface-faint mb-2" />
          <p className="text-sm text-on-surface-subtle">Aucun produit ajouté aujourd'hui</p>
        </div>
      ) : (
        <div className="divide-y divide-border-faint">
          {postedToday.map((product, i) => {
            const img = product.product_images?.find(x => x.is_primary) ?? product.product_images?.[0]
            return (
              <div key={product.id} className="flex items-center gap-3 px-5 py-2.5 group">
                <span className={cn('text-xs font-bold w-5 shrink-0', i < DAILY_GOAL ? 'text-emerald-500' : 'text-on-surface-faint')}>{i + 1}</span>
                <div className="w-8 h-8 rounded-lg bg-surface-sunken overflow-hidden shrink-0 border border-border-faint">
                  {img ? <img src={getImageSrc(img) ?? ''} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-on-surface-faint">{product.brand?.[0]}</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">{product.name}</p>
                  <p className="text-xs text-on-surface-subtle">{product.brand} · {product.ram}</p>
                </div>
                <p className="text-sm font-semibold text-on-surface shrink-0">{formatPrice(product.price)}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Delivery tracker ──────────────────────────────────────────────

const ADMINS = ['Aymen', 'Adam']
const IG_DAILY_GOAL = 6

function DeliveryTracker() {
  const qc = useQueryClient()
  const { data: deliveries = [], isLoading } = useQuery({
    queryKey: ['deliveries'],
    queryFn: () => adminService.getDeliveries(),
  })

  const pending = (deliveries as Delivery[]).filter(d => d.status === 'pending')
  const deliveredToday = (deliveries as Delivery[]).filter(
    d => d.status === 'delivered' && d.delivered_at?.slice(0, 10) === TODAY,
  )

  const [deliveredBy, setDeliveredBy] = useState<Record<string, string>>({})

  const markDelivered = useMutation({
    mutationFn: ({ id, by }: { id: string; by: string }) => adminService.markDelivered(id, by),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deliveries'] })
      toast({ title: 'Livraison confirmée ✓' })
    },
    onError: () => toast({ title: 'Erreur', variant: 'destructive' }),
  })

  const markFailed = useMutation({
    mutationFn: (id: string) => adminService.markDeliveryFailed(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deliveries'] })
      toast({ title: 'Livraison marquée échouée' })
    },
    onError: () => toast({ title: 'Erreur', variant: 'destructive' }),
  })

  return (
    <div className="bg-surface-raised rounded-2xl border border-border-faint shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-faint">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-cyan-500" />
          <p className="text-sm font-semibold text-on-surface">Livraisons en attente</p>
        </div>
        <div className="flex gap-1.5">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
            {pending.length} en attente
          </span>
          {deliveredToday.length > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              {deliveredToday.length} livrée{deliveredToday.length > 1 ? 's' : ''} auj.
            </span>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="p-4 space-y-2">
          {[1, 2].map(i => <div key={i} className="h-14 bg-surface-sunken rounded-xl animate-pulse" />)}
        </div>
      ) : pending.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <CheckCheck className="h-7 w-7 text-emerald-400 mb-2" />
          <p className="text-sm text-on-surface-subtle">Aucune livraison en attente</p>
        </div>
      ) : (
        <div className="divide-y divide-border-faint">
          {pending.map(d => (
            <div key={d.id} className="px-5 py-3 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate">{d.product_name}</p>
                {d.client_name && <p className="text-xs text-on-surface-subtle">{d.client_name}{d.client_phone ? ` · ${d.client_phone}` : ''}</p>}
                {d.address && <p className="text-xs text-on-surface-faint truncate">{d.address}</p>}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <select
                  value={deliveredBy[d.id] ?? ''}
                  onChange={e => setDeliveredBy(prev => ({ ...prev, [d.id]: e.target.value }))}
                  className="text-xs border border-border-faint rounded-lg px-2 py-1 bg-surface-base text-on-surface h-7"
                >
                  <option value="">Qui ?</option>
                  {ADMINS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <button
                  disabled={!deliveredBy[d.id] || markDelivered.isPending}
                  onClick={() => markDelivered.mutate({ id: d.id, by: deliveredBy[d.id] })}
                  title="Confirmer livraison"
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-emerald-500 hover:bg-emerald-500/10 disabled:opacity-30 transition-colors"
                >
                  <CheckCheck className="h-4 w-4" />
                </button>
                <button
                  disabled={markFailed.isPending}
                  onClick={() => markFailed.mutate(d.id)}
                  title="Marquer échouée"
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Instagram objective tracker ────────────────────────────────────

function InstagramObjective() {
  const { data: rawProducts = [], isLoading } = useAdminProducts()
  const products = rawProducts as AdminProduct[]

  const postedToday = products.filter(p => p.instagram_posted_at?.slice(0, 10) === TODAY)
  const done = postedToday.length
  const met = done >= IG_DAILY_GOAL
  const pct = Math.min(100, Math.round((done / IG_DAILY_GOAL) * 100))

  return (
    <div className={cn(
      'rounded-2xl border shadow-sm overflow-hidden',
      met ? 'bg-pink-500/5 border-pink-500/20' : done > 0 ? 'bg-pink-500/5 border-pink-500/15' : 'bg-surface-raised border-border-faint',
    )}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-faint">
        <div className="flex items-center gap-2">
          <Share2 className="h-4 w-4 text-pink-500" />
          <p className="text-sm font-semibold text-on-surface">Objectif Instagram du jour</p>
        </div>
        <p className={cn('text-2xl font-bold leading-none', met ? 'text-pink-500' : 'text-on-surface-faint')}>
          {isLoading ? '…' : done}<span className="text-sm font-normal text-on-surface-faint">/{IG_DAILY_GOAL}</span>
        </p>
      </div>
      <div className="px-5 py-3">
        <div className="flex-1 h-2 bg-surface-sunken rounded-full overflow-hidden mb-3">
          <div
            className={cn('h-full rounded-full transition-all duration-500', met ? 'bg-pink-500' : 'bg-pink-400')}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {Array.from({ length: IG_DAILY_GOAL }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'flex-1 h-1.5 rounded-full min-w-[16px]',
                i < done ? 'bg-pink-500' : 'bg-surface-sunken',
              )}
            />
          ))}
        </div>
        {!isLoading && (
          <p className="text-xs text-on-surface-subtle mt-2">
            {met ? `Objectif atteint ✓ — ${done - IG_DAILY_GOAL > 0 ? `+${done - IG_DAILY_GOAL} bonus` : 'parfait !'}` : `${IG_DAILY_GOAL - done} post${IG_DAILY_GOAL - done > 1 ? 's' : ''} restant${IG_DAILY_GOAL - done > 1 ? 's' : ''}`}
          </p>
        )}
      </div>
    </div>
  )
}

// ── WhatsApp click stats ───────────────────────────────────────────

function WhatsAppStats({ period }: { period: Period }) {
  const { data: leads = [], isLoading } = useWhatsAppLeads()
  const { data: rawProducts = [] } = useAdminProducts()
  const products = rawProducts as AdminProduct[]

  const days = PERIOD_DAYS[period]
  const since = useMemo(() => { const d = new Date(); d.setDate(d.getDate() - days); return d }, [period])

  const filtered = useMemo(() => leads.filter(l => l.created_at && new Date(l.created_at) >= since), [leads, period])

  // Per-product stats
  const statsByProduct = useMemo(() => {
    const map = new Map<string, { name: string; total: number; today: number; image?: string | null; productId?: string }>()
    for (const lead of filtered) {
      const item = lead.sales_record_items?.[0]
      const productId = item?.product_id ?? null
      const name = item?.product_name ?? lead.lead_title ?? 'Inconnu'
      const key = productId ?? name
      const isToday = lead.created_at?.slice(0, 10) === TODAY
      if (!map.has(key)) map.set(key, { name, total: 0, today: 0, image: item?.image_url ?? lead.image_url, productId: productId ?? undefined })
      const e = map.get(key)!
      e.total++
      if (isToday) e.today++
    }
    return [...map.values()].sort((a, b) => b.total - a.total)
  }, [filtered])

  // Last 7 days histogram
  const last7 = useMemo(() => {
    const days7: { label: string; key: string; count: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const key = toDateKey(d.toISOString())
      days7.push({ label: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }), key, count: 0 })
    }
    for (const lead of leads) {
      const k = lead.created_at?.slice(0, 10)
      const entry = days7.find(d => d.key === k)
      if (entry) entry.count++
    }
    return days7
  }, [leads])

  const maxBar = Math.max(...last7.map(d => d.count), 1)
  const totalPeriod = filtered.length
  const todayCount = filtered.filter(l => l.created_at?.slice(0, 10) === TODAY).length

  return (
    <div className="bg-surface-raised rounded-2xl border border-border-faint shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border-faint">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-on-surface flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-emerald-500" />
            Clics WhatsApp
          </p>
          <div className="flex gap-1.5">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              {todayCount} auj.
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-surface-sunken text-on-surface-subtle border border-border-faint">
              {totalPeriod} total
            </span>
          </div>
        </div>
        <p className="text-xs text-on-surface-subtle mt-0.5">Un clic = client qui a ouvert WhatsApp</p>
      </div>

      {/* 7-day histogram */}
      <div className="px-5 py-4 border-b border-border-faint">
        <p className="text-[11px] font-semibold text-on-surface-faint uppercase tracking-wide mb-3">7 derniers jours</p>
        <div className="flex items-end gap-1.5 h-20">
          {last7.map(day => {
            const pct = Math.round((day.count / maxBar) * 100)
            const isToday = day.key === TODAY
            return (
              <div key={day.key} className="flex-1 flex flex-col items-center gap-1" title={`${day.label} — ${day.count} clic${day.count !== 1 ? 's' : ''}`}>
                <span className={cn('text-[10px] font-semibold', day.count > 0 ? 'text-on-surface' : 'text-on-surface-faint')}>{day.count || ''}</span>
                <div className="w-full flex items-end" style={{ height: 44 }}>
                  <div
                    className={cn('w-full rounded-t-md transition-all', isToday ? 'bg-emerald-500' : 'bg-emerald-400/60')}
                    style={{ height: day.count === 0 ? 3 : `${Math.max(8, pct)}%` }}
                  />
                </div>
                <span className={cn('text-[9px] text-center leading-tight', isToday ? 'text-emerald-600 font-semibold' : 'text-on-surface-faint')}>
                  {day.label.split(' ')[0]}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Per-product ranking */}
      {isLoading ? (
        <div className="p-4 space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-10 bg-surface-sunken rounded-xl animate-pulse" />)}</div>
      ) : statsByProduct.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center px-4">
          <MessageCircle className="h-7 w-7 text-on-surface-faint mb-2" />
          <p className="text-sm text-on-surface-subtle">Aucun clic WhatsApp sur cette période</p>
        </div>
      ) : (
        <div className="divide-y divide-border-faint">
          {statsByProduct.map((stat, i) => {
            const product = products.find(p => p.id === stat.productId)
            const maxClicks = statsByProduct[0].total
            const barPct = Math.round((stat.total / maxClicks) * 100)
            return (
              <div key={i} className="flex items-center gap-2.5 px-5 py-2.5 hover:bg-surface-sunken group transition-colors">
                <span className="text-xs font-bold text-on-surface-faint w-4 shrink-0">{i + 1}</span>
                <div className="w-8 h-8 rounded-lg bg-surface-sunken overflow-hidden shrink-0 border border-border-faint">
                  {stat.image ? <img src={stat.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-on-surface-faint">{stat.name[0]}</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-on-surface truncate">{stat.name}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="flex-1 h-1 bg-surface-sunken rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${barPct}%` }} />
                    </div>
                  </div>
                </div>
                {stat.today > 0 && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:border-emerald-800 shrink-0">
                    +{stat.today}
                  </span>
                )}
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-on-surface">{stat.total}</p>
                </div>
                {product && (
                  <Button asChild variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0">
                    <Link to={`/admin/products?action=edit&id=${product.id}`}><TrendingUp className="h-3 w-3 text-on-surface-faint" /></Link>
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────

export function AdminDailyPage() {
  const [period, setPeriod] = useState<Period>('7d')

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-surface-base min-h-full">
      {/* Header + filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Actions quotidiennes</h1>
          <p className="text-on-surface-subtle mt-0.5">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left — 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          <DailyPostingTracker />
          <DeliveryTracker />
          <CatalogueHeatmap />
          <AdCheckHeatmap />
        </div>

        {/* Right — 1/3 */}
        <div className="space-y-6">
          <InstagramObjective />
          <WhatsAppStats period={period} />
        </div>
      </div>
    </div>
  )
}
