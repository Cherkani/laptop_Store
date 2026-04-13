import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Package, Plus, Star, ArrowRight, Edit,
  AlertTriangle, EyeOff, TrendingUp, Layers,
  ExternalLink, MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAdminProducts } from '@/features/admin/hooks/useAdminProducts'
import { useWhatsAppLeads } from '@/features/admin/hooks/useBackoffice'
import { ActivityHeatmap } from '@/features/admin/components/ActivityHeatmap'
import { AdCheckHeatmap } from '@/features/admin/components/AdCheckHeatmap'
import { useToggleAvailability } from '@/features/admin/hooks/useAdminProducts'
import { formatPrice, getImageSrc } from '@/lib/utils'
import type { Product, ProductImage } from '@/types/database.types'

type AdminProduct = Product & {
  product_images: ProductImage[]
  source_url?: string | null
  source_price?: number | null
  margin_amount?: number | null
  is_available?: boolean
}

type Period = '1d' | '7d' | '30d'
const PERIOD_DAYS: Record<Period, number> = { '1d': 1, '7d': 7, '30d': 30 }
const PERIOD_LABELS: Record<Period, string> = { '1d': 'Jour', '7d': 'Semaine', '30d': 'Mois' }

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

export function AdminDashboard() {
  const [period, setPeriod] = useState<Period>('7d')
  const { data: rawProducts = [], isLoading } = useAdminProducts()
  const { data: leads = [] } = useWhatsAppLeads()
  const toggleAvailability = useToggleAvailability()
  const products = rawProducts as AdminProduct[]

  const since = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() - PERIOD_DAYS[period]); return d
  }, [period])

  const available   = products.filter(p => p.is_available !== false)
  const unavailable = products.filter(p => p.is_available === false)
  const outOfStock  = available.filter(p => p.stock_quantity === 0)
  const lowStock    = available.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 3)
  const featured    = available.filter(p => p.is_featured)

  // Sourcing stats
  const sourcedProducts = products.filter(p => p.source_price != null && p.margin_amount != null)
  const totalMargin = sourcedProducts.reduce((s, p) => s + (p.margin_amount ?? 0), 0)

  // Period-scoped products
  const periodProducts = available.filter(p => p.created_at && new Date(p.created_at) >= since)

  // Period-scoped WhatsApp leads
  const periodLeads = useMemo(
    () => leads.filter(l => l.created_at && new Date(l.created_at) >= since),
    [leads, since],
  )

  const recentProducts = [...available]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)

  const quickActions = [
    { label: 'Nouveau produit', icon: Plus, to: '/admin/products?action=new', color: 'bg-cyan-500 hover:bg-cyan-400' },
    { label: 'Vérification', icon: TrendingUp, to: '/admin/daily', color: 'bg-emerald-500 hover:bg-emerald-400' },
    { label: 'Stock', icon: Layers, to: '/admin/inventory', color: 'bg-blue-500 hover:bg-blue-400' },
    { label: 'Catalogue', icon: Package, to: '/admin/products', color: 'bg-on-surface hover:opacity-90' },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-surface-base min-h-full">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-on-surface">Vue d'ensemble</h1>
          <p className="text-sm text-on-surface-faint mt-0.5">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PeriodFilter value={period} onChange={setPeriod} />
          <Button asChild size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm">
            <Link to="/admin/products?action=new">
              <Plus className="h-4 w-4 mr-1.5" />
              Ajouter
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Alerts row — only shown when relevant ── */}
      {!isLoading && (outOfStock.length > 0 || unavailable.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-3">
          {outOfStock.length > 0 && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-800">
                  {outOfStock.length} produit{outOfStock.length > 1 ? 's' : ''} en rupture de stock
                </p>
                <p className="text-xs text-amber-600 mt-0.5 line-clamp-1">
                  {outOfStock.slice(0, 3).map(p => p.name).join(', ')}
                  {outOfStock.length > 3 ? ` +${outOfStock.length - 3}` : ''}
                </p>
              </div>
              <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-amber-700 hover:bg-amber-100 shrink-0">
                <Link to="/admin/inventory">Gérer</Link>
              </Button>
            </div>
          )}
          {unavailable.length > 0 && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
              <EyeOff className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-800">
                  {unavailable.length} produit{unavailable.length > 1 ? 's' : ''} masqué{unavailable.length > 1 ? 's' : ''} du catalogue
                </p>
                <p className="text-xs text-red-400 mt-0.5">Source vendue — à remettre en vente ou supprimer</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-red-600 hover:bg-red-100 shrink-0">
                <Link to="/admin/products">Voir</Link>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── Period stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'Produits actifs',
            value: isLoading ? null : available.length,
            sub: `${featured.length} en vedette`,
            icon: Package,
            light: 'bg-blue-500/10 text-blue-500',
          },
          {
            label: `Ajoutés (${PERIOD_LABELS[period].toLowerCase()})`,
            value: isLoading ? null : periodProducts.length,
            sub: `sur ${available.length} au total`,
            icon: TrendingUp,
            light: 'bg-cyan-500/10 text-cyan-500',
          },
          {
            label: `Clics WhatsApp (${PERIOD_LABELS[period].toLowerCase()})`,
            value: isLoading ? null : periodLeads.length,
            sub: periodLeads.length > 0 ? 'leads captés' : 'aucun clic',
            icon: MessageCircle,
            light: 'bg-emerald-500/10 text-emerald-500',
          },
          {
            label: 'Prix moyen',
            value: isLoading ? null : available.length > 0
              ? formatPrice(available.reduce((s, p) => s + p.price, 0) / available.length)
              : '—',
            sub: `sur ${available.length} produits`,
            icon: Star,
            light: 'bg-amber-500/10 text-amber-500',
          },
        ].map(stat => (
          <div key={stat.label} className="bg-surface-raised rounded-2xl border border-border-faint shadow-sm p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-on-surface-faint uppercase tracking-wide">{stat.label}</p>
                {isLoading
                  ? <div className="mt-2 h-7 w-16 bg-surface-sunken rounded animate-pulse" />
                  : <p className="mt-1.5 text-2xl font-bold text-on-surface truncate">{stat.value}</p>
                }
                {!isLoading && <p className="text-xs text-on-surface-faint mt-0.5">{stat.sub}</p>}
              </div>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${stat.light}`}>
                <stat.icon className="h-4.5 w-4.5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Vérification quotidienne des annonces sources ── */}
      <AdCheckHeatmap />

      {/* ── Activity heatmaps ── */}
      <ActivityHeatmap />

      {/* ── Main grid ── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Recent products — 2/3 */}
        <div className="lg:col-span-2 bg-surface-raised rounded-2xl border border-border-faint shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-faint">
            <p className="text-sm font-semibold text-on-surface">Produits récents</p>
            <Button variant="ghost" size="sm" asChild className="h-7 text-xs text-on-surface-faint hover:text-on-surface">
              <Link to="/admin/products">Voir tout <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </div>
          {isLoading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-surface-sunken rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="h-10 w-10 text-on-surface-faint mb-3" />
              <p className="text-sm font-medium text-on-surface-subtle">Aucun produit</p>
              <Button asChild size="sm" className="mt-4">
                <Link to="/admin/products?action=new"><Plus className="h-4 w-4 mr-1.5" />Ajouter</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border-faint">
              {recentProducts.map(product => {
                const img = product.product_images?.find(x => x.is_primary) ?? product.product_images?.[0]
                const isNew = product.created_at && new Date(product.created_at) >= since
                return (
                  <div key={product.id} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-sunken group transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-surface-sunken overflow-hidden shrink-0 border border-border-faint">
                      {img
                        ? <img src={getImageSrc(img) ?? ''} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-on-surface truncate">{product.name}</p>
                        {isNew && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 border border-cyan-200 shrink-0">
                            Nouveau
                          </span>
                        )}
                        {product.source_url && (
                          <a href={product.source_url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="text-brand-blue hover:opacity-70 shrink-0">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-on-surface-faint">{product.brand} · {product.ram} · {product.storage}</p>
                    </div>
                    <div className="text-right shrink-0 hidden sm:block">
                      <p className="text-sm font-semibold text-on-surface">{formatPrice(product.price)}</p>
                      {product.source_price != null && product.margin_amount != null && (
                        <p className="text-xs text-emerald-600">+{formatPrice(product.margin_amount)}</p>
                      )}
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full hidden sm:inline-flex ${
                      product.stock_quantity === 0
                        ? 'bg-red-500/10 text-red-500'
                        : product.stock_quantity <= 3
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-emerald-500/10 text-emerald-600'
                    }`}>
                      {product.stock_quantity === 0 ? 'Rupture' : `${product.stock_quantity} unités`}
                    </span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                      <Link to={`/admin/products?action=edit&id=${product.id}`}>
                        <Edit className="h-3.5 w-3.5 text-on-surface-faint" />
                      </Link>
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* Quick actions */}
          <div className="bg-surface-raised rounded-2xl border border-border-faint shadow-sm p-5">
            <p className="text-sm font-semibold text-on-surface mb-3">Actions rapides</p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map(action => (
                <Link
                  key={action.to}
                  to={action.to}
                  className={`flex flex-col items-center gap-2 rounded-xl px-3 py-3.5 text-white text-xs font-semibold text-center transition-all hover:-translate-y-0.5 shadow-sm ${action.color}`}
                >
                  <action.icon className="h-5 w-5" />
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Period WhatsApp top products */}
          {periodLeads.length > 0 && (() => {
            const map = new Map<string, { name: string; count: number }>()
            for (const lead of periodLeads) {
              const item = lead.sales_record_items?.[0]
              const name = item?.product_name ?? lead.lead_title ?? 'Inconnu'
              const key = item?.product_id ?? name
              map.set(key, { name, count: (map.get(key)?.count ?? 0) + 1 })
            }
            const ranked = [...map.values()].sort((a, b) => b.count - a.count).slice(0, 5)
            const max = ranked[0]?.count ?? 1
            return (
              <div className="bg-surface-raised rounded-2xl border border-border-faint shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-border-faint flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-emerald-500" />
                  <p className="text-sm font-semibold text-on-surface">Top clics WhatsApp</p>
                  <span className="ml-auto text-xs text-on-surface-faint">{PERIOD_LABELS[period]}</span>
                </div>
                <div className="divide-y divide-border-faint">
                  {ranked.map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 px-5 py-2.5">
                      <span className="text-xs font-bold text-on-surface-faint w-4 shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-on-surface truncate">{item.name}</p>
                        <div className="mt-1 h-1 bg-surface-sunken rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.round((item.count / max) * 100)}%` }} />
                        </div>
                      </div>
                      <span className="text-sm font-bold text-on-surface shrink-0">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Masqués — sourcing watchlist */}
          {!isLoading && unavailable.length > 0 && (
            <div className="bg-surface-raised rounded-2xl border border-red-500/20 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-red-500/10">
                <p className="text-sm font-semibold text-red-500 flex items-center gap-2">
                  <EyeOff className="h-4 w-4" /> Masqués ({unavailable.length})
                </p>
              </div>
              <div className="divide-y divide-border-faint">
                {unavailable.slice(0, 5).map(product => (
                  <div key={product.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-sunken group">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-on-surface-subtle truncate">{product.name}</p>
                      <p className="text-[11px] text-on-surface-faint">{formatPrice(product.price)}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {product.source_url && (
                        <a href={product.source_url} target="_blank" rel="noreferrer" className="h-6 w-6 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue hover:opacity-70">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      <button
                        onClick={() => toggleAvailability.mutate({ id: product.id, is_available: true })}
                        className="h-6 w-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 hover:text-emerald-400"
                        title="Remettre en vente"
                      >
                        ✓
                      </button>
                    </div>
                  </div>
                ))}
                {unavailable.length > 5 && (
                  <div className="px-4 py-2.5 text-xs text-on-surface-faint text-center">
                    +{unavailable.length - 5} autres — <Link to="/admin/products" className="text-brand-blue hover:underline">voir tout</Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Low stock watchlist */}
          {!isLoading && lowStock.length > 0 && (
            <div className="bg-surface-raised rounded-2xl border border-amber-500/20 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-amber-500/10">
                <p className="text-sm font-semibold text-amber-500 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Faible stock ({lowStock.length})
                </p>
              </div>
              <div className="divide-y divide-border-faint">
                {lowStock.slice(0, 5).map(product => (
                  <div key={product.id} className="flex items-center justify-between px-4 py-2.5">
                    <p className="text-xs font-medium text-on-surface-subtle truncate flex-1 min-w-0 mr-2">{product.name}</p>
                    <span className="text-xs font-bold text-amber-500 shrink-0">{product.stock_quantity} restant{product.stock_quantity > 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-border-faint">
                <Link to="/admin/inventory" className="text-xs text-brand-blue hover:underline flex items-center gap-1">
                  Gérer le stock <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
