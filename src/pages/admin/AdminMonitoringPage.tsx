import { useMemo, useState } from 'react'
import { MousePointerClick, MessageCircle, ShoppingCart, Eye, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useAdminAnalytics } from '@/features/admin/hooks/useAdminAnalytics'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

type Period = '7d' | '30d' | '90d'
const PERIOD_DAYS: Record<Period, number> = { '7d': 7, '30d': 30, '90d': 90 }
const PERIOD_LABELS: Record<Period, string> = { '7d': '7 jours', '30d': '30 jours', '90d': '90 jours' }

function PeriodFilter({ value, onChange }: { value: Period; onChange: (v: Period) => void }) {
  return (
    <div className="flex items-center gap-1 bg-surface-raised border border-border-faint rounded-xl p-1">
      {(['7d', '30d', '90d'] as Period[]).map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
            value === p ? 'bg-cyan-600 text-white shadow-sm' : 'text-on-surface-subtle hover:text-on-surface hover:bg-surface-sunken',
          )}
        >
          {PERIOD_LABELS[p]}
        </button>
      ))}
    </div>
  )
}

/** Format a YYYY-MM-DD key to a short display label */
function fmtDay(dateKey: string, period: Period): string {
  const d = new Date(dateKey + 'T00:00:00')
  if (period === '7d') return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })
  if (period === '30d') return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

/** Generate all calendar days in a range (inclusive), returns YYYY-MM-DD strings */
function daysInRange(days: number): string[] {
  const result: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    result.push(d.toISOString().slice(0, 10))
  }
  return result
}

interface ChartRow {
  date: string
  label: string
  'Vue produit': number
  WhatsApp: number
  Panier: number
  'Clic carte': number
  total: number
}

const EVENT_SERIES = [
  { key: 'Vue produit',  eventType: 'product_view',       color: '#3b82f6' },
  { key: 'WhatsApp',     eventType: 'whatsapp_click',      color: '#10b981' },
  { key: 'Panier',       eventType: 'add_to_cart',         color: '#f59e0b' },
  { key: 'Clic carte',   eventType: 'product_card_click',  color: '#a855f7' },
] as const

export function AdminMonitoringPage() {
  const [period, setPeriod] = useState<Period>('30d')
  const { data: events = [], isLoading } = useAdminAnalytics(PERIOD_DAYS[period])

  const { stats, chartData } = useMemo(() => {
    const byType: Record<string, number> = {}
    const productViews = new Map<string, { name: string; count: number }>()
    const whatsapp = new Map<string, { name: string; count: number }>()

    const allDays = daysInRange(PERIOD_DAYS[period])
    const dayBuckets: Record<string, Record<string, number>> = {}
    for (const d of allDays) dayBuckets[d] = {}

    for (const e of events) {
      byType[e.event_type] = (byType[e.event_type] ?? 0) + 1

      const day = e.created_at.slice(0, 10)
      if (dayBuckets[day]) {
        dayBuckets[day][e.event_type] = (dayBuckets[day][e.event_type] ?? 0) + 1
      }

      if (e.event_type === 'product_view') {
        const key = e.product_id ?? e.product_name ?? 'unknown'
        const name = e.product_name ?? 'Produit inconnu'
        productViews.set(key, { name, count: (productViews.get(key)?.count ?? 0) + 1 })
      }
      if (e.event_type === 'whatsapp_click') {
        const key = e.product_id ?? e.product_name ?? 'unknown'
        const name = e.product_name ?? 'Produit inconnu'
        whatsapp.set(key, { name, count: (whatsapp.get(key)?.count ?? 0) + 1 })
      }
    }

    // Build per-day rows
    let rows: ChartRow[] = allDays.map(d => {
      const b = dayBuckets[d]
      const pv = b['product_view'] ?? 0
      const wa = b['whatsapp_click'] ?? 0
      const ac = b['add_to_cart'] ?? 0
      const pc = b['product_card_click'] ?? 0
      return {
        date: d,
        label: fmtDay(d, period),
        'Vue produit': pv,
        WhatsApp: wa,
        Panier: ac,
        'Clic carte': pc,
        total: pv + wa + ac + pc,
      }
    })

    // For 90d, collapse into weeks
    if (period === '90d') {
      const weeks: ChartRow[] = []
      for (let i = 0; i < rows.length; i += 7) {
        const chunk = rows.slice(i, i + 7)
        weeks.push({
          date: chunk[0].date,
          label: chunk[0].label,
          'Vue produit': chunk.reduce((s, r) => s + r['Vue produit'], 0),
          WhatsApp:      chunk.reduce((s, r) => s + r.WhatsApp, 0),
          Panier:        chunk.reduce((s, r) => s + r.Panier, 0),
          'Clic carte':  chunk.reduce((s, r) => s + r['Clic carte'], 0),
          total:         chunk.reduce((s, r) => s + r.total, 0),
        })
      }
      rows = weeks
    }

    return {
      stats: {
        total: events.length,
        views: byType.product_view ?? 0,
        whatsapp: byType.whatsapp_click ?? 0,
        addToCart: byType.add_to_cart ?? 0,
        productCardClicks: byType.product_card_click ?? 0,
        topViews: [...productViews.values()].sort((a, b) => b.count - a.count).slice(0, 10),
        topWhatsApp: [...whatsapp.values()].sort((a, b) => b.count - a.count).slice(0, 10),
      },
      chartData: rows,
    }
  }, [events, period])

  return (
    <div className="p-6 lg:p-8 bg-surface-base min-h-full space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Monitoring</h1>
          <p className="text-on-surface-subtle mt-1">Suivi des clics et des produits les plus consultés.</p>
        </div>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Événements',    value: stats.total,             icon: BarChart3,         color: 'text-cyan-500',    bg: 'bg-cyan-500/10' },
          { label: 'Vues produit',  value: stats.views,             icon: Eye,               color: 'text-blue-500',    bg: 'bg-blue-500/10' },
          { label: 'Clics WhatsApp',value: stats.whatsapp,          icon: MessageCircle,     color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Ajouts panier', value: stats.addToCart,         icon: ShoppingCart,      color: 'text-amber-500',   bg: 'bg-amber-500/10' },
          { label: 'Clics cartes',  value: stats.productCardClicks, icon: MousePointerClick, color: 'text-purple-500',  bg: 'bg-purple-500/10' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-on-surface-faint uppercase tracking-wide">{s.label}</p>
                  <p className="text-2xl font-bold text-on-surface mt-1">{isLoading ? '…' : s.value}</p>
                </div>
                <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bar chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Activité par {period === '90d' ? 'semaine' : 'jour'}
          </CardTitle>
          <CardDescription>
            Événements sur les {PERIOD_LABELS[period]}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-64 bg-surface-sunken animate-pulse rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} barSize={period === '90d' ? 22 : period === '7d' ? 40 : 14} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.12)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  tickLine={false}
                  axisLine={false}
                  interval={period === '30d' ? 4 : 0}
                  className="text-on-surface-faint"
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  tickLine={false}
                  axisLine={false}
                  width={28}
                  className="text-on-surface-faint"
                />
                <Tooltip
                  cursor={{ fill: 'rgba(128,128,128,0.06)', radius: 4 }}
                  contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid rgba(128,128,128,0.15)',
                    backgroundColor: 'var(--color-surface-raised, #fff)',
                    fontSize: 12,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                  }}
                  labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                />
                <Legend
                  iconType="square"
                  iconSize={10}
                  wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                />
                {EVENT_SERIES.map(s => (
                  <Bar
                    key={s.key}
                    dataKey={s.key}
                    stackId="a"
                    fill={s.color}
                    radius={s.key === 'Clic carte' ? [4, 4, 0, 0] : undefined}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Top products */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Produits les plus visités</CardTitle>
            <CardDescription>Basé sur les vues de pages produit ({PERIOD_LABELS[period]}).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <div className="h-24 bg-surface-sunken animate-pulse rounded" />
            ) : stats.topViews.length === 0 ? (
              <p className="text-sm text-on-surface-subtle">Aucune donnée</p>
            ) : (
              stats.topViews.map((item, i) => {
                const max = stats.topViews[0].count
                const pct = Math.round((item.count / max) * 100)
                return (
                  <div key={`${item.name}-${i}`} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-on-surface truncate pr-3">
                        <span className="text-on-surface-faint mr-1.5 text-xs">#{i + 1}</span>
                        {item.name}
                      </p>
                      <span className="text-sm font-bold text-on-surface shrink-0">{item.count}</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-sunken rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Produits les plus cliqués WhatsApp</CardTitle>
            <CardDescription>Basé sur les clics du bouton WhatsApp ({PERIOD_LABELS[period]}).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <div className="h-24 bg-surface-sunken animate-pulse rounded" />
            ) : stats.topWhatsApp.length === 0 ? (
              <p className="text-sm text-on-surface-subtle">Aucune donnée</p>
            ) : (
              stats.topWhatsApp.map((item, i) => {
                const max = stats.topWhatsApp[0].count
                const pct = Math.round((item.count / max) * 100)
                return (
                  <div key={`${item.name}-${i}`} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-on-surface truncate pr-3">
                        <span className="text-on-surface-faint mr-1.5 text-xs">#{i + 1}</span>
                        {item.name}
                      </p>
                      <span className="text-sm font-bold text-on-surface shrink-0">{item.count}</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-sunken rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
