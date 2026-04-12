import { useState } from 'react'
import { Pencil, Trash2, Plus, Search, Loader2, PackageOpen, ExternalLink, EyeOff, Eye, LayoutGrid, LayoutList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { useAdminProducts, useDeleteProduct, useToggleAvailability } from '../hooks/useAdminProducts'
import { useAdminProfiles } from '../hooks/useBackoffice'
import { formatPrice, getImageSrc } from '@/lib/utils'
import { StockBadge } from '@/components/shared/StockBadge'
import type { Product, ProductImage, Profile } from '@/types/database.types'

type ProductWithImages = Product & {
  product_images: ProductImage[]
  source_url?: string | null
  source_price?: number | null
  margin_amount?: number | null
  is_available?: boolean
  created_by?: string | null
}

function AuthorChip({ userId, profiles }: { userId: string | null | undefined; profiles: Profile[] }) {
  if (!userId) return null
  const profile = profiles.find(p => p.id === userId)
  if (!profile) return null
  const name = profile.display_name ?? profile.full_name ?? '?'
  const initials = name.slice(0, 2).toUpperCase()
  const colors: Record<string, string> = {
    Aymen: 'bg-cyan-100 text-cyan-700',
    Adam:  'bg-violet-100 text-violet-700',
  }
  const colorClass = colors[name] ?? 'bg-slate-100 text-slate-600'
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${colorClass}`}>
      <span className="w-3.5 h-3.5 rounded-full bg-current/20 flex items-center justify-center text-[9px] font-bold leading-none">
        {initials}
      </span>
      {name}
    </span>
  )
}

interface AdminProductListProps {
  onAdd: () => void
  onEdit: (productId: string) => void
}

export function AdminProductList({ onAdd, onEdit }: AdminProductListProps) {
  const { data: products = [], isLoading } = useAdminProducts()
  const { data: profiles = [] } = useAdminProfiles()
  const deleteProduct = useDeleteProduct()
  const toggleAvailability = useToggleAvailability()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'available' | 'unavailable'>('all')
  const [view, setView] = useState<'list' | 'grid'>('list')
  const [deleteTarget, setDeleteTarget] = useState<ProductWithImages | null>(null)

  const filtered = (products as ProductWithImages[]).filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
    const isAvail = p.is_available !== false
    if (filter === 'available') return matchesSearch && isAvail
    if (filter === 'unavailable') return matchesSearch && !isAvail
    return matchesSearch
  })

  const availableCount   = (products as ProductWithImages[]).filter(p => p.is_available !== false).length
  const unavailableCount = (products as ProductWithImages[]).filter(p => p.is_available === false).length

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Marque, nom..."
              className="pl-9 h-9 bg-white"
            />
          </div>
          {/* Filter tabs */}
          <div className="flex rounded-lg border bg-white overflow-hidden text-xs font-medium shadow-sm">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 transition-colors ${filter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Tous ({products.length})
            </button>
            <button
              onClick={() => setFilter('available')}
              className={`px-3 py-1.5 transition-colors border-x ${filter === 'available' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Dispo ({availableCount})
            </button>
            <button
              onClick={() => setFilter('unavailable')}
              className={`px-3 py-1.5 transition-colors ${filter === 'unavailable' ? 'bg-red-500 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Masqués ({unavailableCount})
            </button>
          </div>
          {/* View toggle */}
          <div className="flex rounded-lg border bg-white overflow-hidden shadow-sm">
            <button
              onClick={() => setView('list')}
              className={`px-2.5 py-1.5 transition-colors ${view === 'list' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('grid')}
              className={`px-2.5 py-1.5 transition-colors border-l ${view === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
        <Button onClick={onAdd} className="shrink-0 bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un produit
        </Button>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border bg-white">
          <PackageOpen className="h-12 w-12 text-slate-200 mb-4" />
          <h3 className="font-semibold text-slate-700">
            {search ? 'Aucun résultat' : filter === 'unavailable' ? 'Aucun produit masqué' : 'Catalogue vide'}
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {search ? 'Essayez un autre terme' : 'Ajoutez votre premier laptop'}
          </p>
          {!search && filter === 'all' && (
            <Button className="mt-4 bg-cyan-600 hover:bg-cyan-500" onClick={onAdd}>
              <Plus className="h-4 w-4 mr-2" /> Ajouter
            </Button>
          )}
        </div>
      ) : view === 'list' ? (
        /* ── LIST VIEW ── */
        <div className="rounded-2xl border overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-400 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Produit</th>
                  <th className="text-left px-4 py-3 font-semibold">Marque</th>
                  <th className="text-left px-4 py-3 font-semibold">Prix vente</th>
                  <th className="text-left px-4 py-3 font-semibold">Marge</th>
                  <th className="text-left px-4 py-3 font-semibold">Stock</th>
                  <th className="text-left px-4 py-3 font-semibold">Statut</th>
                  <th className="text-right px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(product => {
                  const images = product.product_images?.sort((a, b) => a.display_order - b.display_order) ?? []
                  const image = images.find(i => i.is_primary) ?? images[0]
                  const isAvailable = product.is_available !== false
                  const hasMargin = product.source_price != null && product.margin_amount != null
                  return (
                    <tr
                      key={product.id}
                      className={`transition-colors group ${isAvailable ? 'hover:bg-slate-50/60' : 'bg-red-50/30 hover:bg-red-50/50'}`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 relative">
                            {image
                              ? <img src={getImageSrc(image) ?? ''} alt={product.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300 text-lg">□</div>
                            }
                            {!isAvailable && (
                              <div className="absolute inset-0 bg-red-400/30 flex items-center justify-center">
                                <EyeOff className="h-4 w-4 text-red-600" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-slate-900 line-clamp-1 text-sm">{product.name}</p>
                              {product.source_url && (
                                <a
                                  href={product.source_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  className="text-blue-300 hover:text-blue-500 shrink-0"
                                  title="Store source"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <p className="text-xs text-slate-400">{product.processor} · {product.ram} · {product.storage}</p>
                              <AuthorChip userId={product.created_by} profiles={profiles} />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-slate-600 font-medium">{product.brand}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-bold text-slate-900">{formatPrice(product.price)}</span>
                        {product.source_price != null && (
                          <p className="text-[11px] text-slate-400">Achat: {formatPrice(product.source_price)}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {hasMargin ? (
                          <span className="text-sm font-semibold text-emerald-600">+{formatPrice(product.margin_amount!)}</span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-sm font-bold ${
                          product.stock_quantity === 0 ? 'text-red-500'
                          : product.stock_quantity <= 3 ? 'text-amber-500'
                          : 'text-emerald-600'
                        }`}>
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1 flex-wrap">
                          {isAvailable
                            ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">● Visible</span>
                            : <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-600">● Masqué</span>
                          }
                          {product.is_featured && <Badge className="text-[10px] h-5 bg-amber-100 text-amber-700 hover:bg-amber-100">⭐</Badge>}
                          <StockBadge quantity={product.stock_quantity} />
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => toggleAvailability.mutate({ id: product.id, is_available: !isAvailable })}
                            disabled={toggleAvailability.isPending}
                            title={isAvailable ? 'Masquer du catalogue' : 'Remettre en vente'}
                            className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                              isAvailable
                                ? 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                                : 'text-emerald-500 hover:bg-emerald-50'
                            }`}
                          >
                            {isAvailable ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            onClick={() => onEdit(product.id)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Éditer
                          </Button>
                          <button
                            onClick={() => setDeleteTarget(product)}
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-red-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-2.5 bg-slate-50 border-t text-xs text-slate-400">
            {filtered.length} produit{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''} sur {products.length}
          </div>
        </div>
      ) : (
        /* ── GRID VIEW ── */
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(product => {
            const images = product.product_images?.sort((a, b) => a.display_order - b.display_order) ?? []
            const image = images.find(i => i.is_primary) ?? images[0]
            const isAvailable = product.is_available !== false
            const hasMargin = product.source_price != null && product.margin_amount != null
            return (
              <div
                key={product.id}
                className={`group relative bg-white rounded-2xl border overflow-hidden shadow-sm transition-shadow hover:shadow-md ${!isAvailable ? 'opacity-60' : ''}`}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  {image
                    ? <img src={getImageSrc(image) ?? ''} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full flex items-center justify-center text-slate-300 text-3xl">□</div>
                  }
                  {!isAvailable && (
                    <div className="absolute inset-0 bg-red-900/30 flex items-center justify-center">
                      <EyeOff className="h-8 w-8 text-white/80" />
                    </div>
                  )}
                  {product.is_featured && (
                    <span className="absolute top-2 left-2 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">⭐ Featured</span>
                  )}
                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(product.id)}
                      className="h-9 w-9 rounded-xl bg-white flex items-center justify-center text-slate-700 hover:bg-amber-400 transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleAvailability.mutate({ id: product.id, is_available: !isAvailable })}
                      className={`h-9 w-9 rounded-xl bg-white flex items-center justify-center transition-colors ${isAvailable ? 'text-slate-700 hover:bg-red-400 hover:text-white' : 'text-emerald-600 hover:bg-emerald-400 hover:text-white'}`}
                    >
                      {isAvailable ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => setDeleteTarget(product)}
                      className="h-9 w-9 rounded-xl bg-white flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {/* Info */}
                <div className="p-3.5">
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <p className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">{product.name}</p>
                    {product.source_url && (
                      <a href={product.source_url} target="_blank" rel="noreferrer" className="text-blue-300 hover:text-blue-500 mt-0.5 shrink-0">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{product.ram} · {product.storage}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{formatPrice(product.price)}</p>
                      {hasMargin && (
                        <p className="text-[11px] text-emerald-600">+{formatPrice(product.margin_amount!)} marge</p>
                      )}
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      product.stock_quantity === 0 ? 'bg-red-100 text-red-600'
                      : product.stock_quantity <= 3 ? 'bg-amber-100 text-amber-600'
                      : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {product.stock_quantity === 0 ? 'Rupture' : `${product.stock_quantity} unités`}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Supprimer le produit</DialogTitle>
            <DialogDescription>
              Supprimer <strong className="text-slate-900">{deleteTarget?.name}</strong> ? Cette action supprimera aussi toutes les images et spécifications. Irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Annuler</Button>
            <Button
              variant="destructive"
              disabled={deleteProduct.isPending}
              onClick={() => {
                if (deleteTarget) deleteProduct.mutate(deleteTarget.id)
                setDeleteTarget(null)
              }}
            >
              {deleteProduct.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Suppression...</> : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
