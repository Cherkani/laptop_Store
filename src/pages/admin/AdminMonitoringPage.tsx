import { useMemo, useState } from 'react'
import { MousePointerClick, MessageCircle, ShoppingCart, Eye, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useAdminAnalytics } from '@/features/admin/hooks/useAdminAnalytics'

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

export function AdminMonitoringPage() {
  const [period, setPeriod] = useState<Period>('30d')
  const { data: events = [], isLoading } = useAdminAnalytics(PERIOD_DAYS[period])

  const stats = useMemo(() => {
    const byType: Record<string, number> = {}
    const productViews = new Map<string, { name: string; count: number }>()
    const whatsapp = new Map<string, { name: string; count: number }>()

    for (const e of events) {
      byType[e.event_type] = (byType[e.event_type] ?? 0) + 1

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

    const topViews = [...productViews.values()].sort((a, b) => b.count - a.count).slice(0, 10)
    const topWhatsApp = [...whatsapp.values()].sort((a, b) => b.count - a.count).slice(0, 10)

    return {
      total: events.length,
      views: byType.product_view ?? 0,
      whatsapp: byType.whatsapp_click ?? 0,
      addToCart: byType.add_to_cart ?? 0,
      productCardClicks: byType.product_card_click ?? 0,
      topViews,
      topWhatsApp,
    }
  }, [events])

  return (
    <div className="p-6 lg:p-8 bg-surface-base min-h-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Monitoring</h1>
          <p className="text-on-surface-subtle mt-1">Suivi des clics et des produits les plus consultés.</p>
        </div>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Événements', value: stats.total, icon: BarChart3, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
          { label: 'Vues produit', value: stats.views, icon: Eye, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Clics WhatsApp', value: stats.whatsapp, icon: MessageCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Ajouts panier', value: stats.addToCart, icon: ShoppingCart, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Clics cartes', value: stats.productCardClicks, icon: MousePointerClick, color: 'text-purple-500', bg: 'bg-purple-500/10' },
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
              stats.topViews.map((item, i) => (
                <div key={`${item.name}-${i}`} className="flex items-center justify-between border border-border-faint rounded-lg px-3 py-2">
                  <p className="text-sm text-on-surface truncate pr-3"><span className="text-on-surface-faint mr-2">#{i + 1}</span>{item.name}</p>
                  <span className="text-sm font-bold text-on-surface">{item.count}</span>
                </div>
              ))
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
              stats.topWhatsApp.map((item, i) => (
                <div key={`${item.name}-${i}`} className="flex items-center justify-between border border-border-faint rounded-lg px-3 py-2">
                  <p className="text-sm text-on-surface truncate pr-3"><span className="text-on-surface-faint mr-2">#{i + 1}</span>{item.name}</p>
                  <span className="text-sm font-bold text-on-surface">{item.count}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
