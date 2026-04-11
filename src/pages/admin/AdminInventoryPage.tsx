import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Edit, Check, X, AlertTriangle, Package, TrendingUp, Loader2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { StockBadge, StockQuantity } from '@/components/shared/StockBadge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAdminProducts } from '@/features/admin/hooks/useAdminProducts'
import { adminService } from '@/features/admin/services/adminService'
import { AdCheckHeatmap } from '@/features/admin/components/AdCheckHeatmap'
import { formatPrice, getImageSrc } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import type { Product, ProductImage } from '@/types/database.types'

type AdminProduct = Product & { product_images: ProductImage[] }
type StockFilter = 'all' | 'out' | 'low' | 'healthy'

function InlineStockEditor({ product, onDone }: { product: AdminProduct; onDone: () => void }) {
  const queryClient = useQueryClient()
  const [value, setValue] = useState(String(product.stock_quantity))
  const [isLoading, setIsLoading] = useState(false)

  const save = async () => {
    const qty = parseInt(value)
    if (isNaN(qty) || qty < 0) {
      toast({ title: 'Entrez un nombre valide (0 ou plus)', variant: 'destructive' })
      return
    }
    setIsLoading(true)
    try {
      await adminService.updateProduct(product.id, { stock_quantity: qty })
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast({ title: 'Stock mis à jour', description: `${product.name} → ${qty} unité(s)` })
      onDone()
    } catch {
      toast({ title: 'Échec de la mise à jour', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min="0"
        value={value}
        onChange={e => setValue(e.target.value)}
        className="h-8 w-20 text-sm"
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') onDone() }}
        autoFocus
      />
      <Button size="icon" className="h-8 w-8" onClick={save} disabled={isLoading}>
        {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
      </Button>
      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onDone}>
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

export function AdminInventoryPage() {
  const { data: rawProducts = [], isLoading } = useAdminProducts()
  const products = rawProducts as AdminProduct[]
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<StockFilter>('all')
  const [editingId, setEditingId] = useState<string | null>(null)

  const outOfStock  = products.filter(p => p.stock_quantity === 0)
  const lowStock    = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5)
  const healthyStock = products.filter(p => p.stock_quantity > 5)

  const filtered = products
    .filter(p => {
      if (filter === 'out')     return p.stock_quantity === 0
      if (filter === 'low')     return p.stock_quantity > 0 && p.stock_quantity <= 5
      if (filter === 'healthy') return p.stock_quantity > 5
      return true
    })
    .filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <div className="p-6 lg:p-8 space-y-8 bg-surface-base min-h-full">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Gestion du stock</h1>
        <p className="text-on-surface-subtle mt-1">Modifiez les quantités directement sans quitter cette page</p>
      </div>

      {/* Ad check heatmap — sourced products only */}
      <AdCheckHeatmap />

      {/* Stock overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setFilter(filter === 'out' ? 'all' : 'out')}
          className={`rounded-xl border p-4 text-left transition-all hover:shadow-md ${
            filter === 'out'
              ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              : 'bg-surface-raised border-border-faint'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-red-50 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-sm font-medium text-on-surface">Rupture de stock</span>
          </div>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{isLoading ? '…' : outOfStock.length}</p>
          <p className="text-xs text-on-surface-subtle mt-1">produit(s) à réapprovisionner</p>
        </button>

        <button
          onClick={() => setFilter(filter === 'low' ? 'all' : 'low')}
          className={`rounded-xl border p-4 text-left transition-all hover:shadow-md ${
            filter === 'low'
              ? 'ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
              : 'bg-surface-raised border-border-faint'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-sm font-medium text-on-surface">Stock faible</span>
          </div>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{isLoading ? '…' : lowStock.length}</p>
          <p className="text-xs text-on-surface-subtle mt-1">produit(s) avec 5 unités ou moins</p>
        </button>

        <button
          onClick={() => setFilter(filter === 'healthy' ? 'all' : 'healthy')}
          className={`rounded-xl border p-4 text-left transition-all hover:shadow-md ${
            filter === 'healthy'
              ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
              : 'bg-surface-raised border-border-faint'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-sm font-medium text-on-surface">Stock sain</span>
          </div>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{isLoading ? '…' : healthyStock.length}</p>
          <p className="text-xs text-on-surface-subtle mt-1">produit(s) bien approvisionnés</p>
        </button>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-faint" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un produit…"
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={v => setFilter(v as StockFilter)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tous les produits" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les produits</SelectItem>
            <SelectItem value="out">Rupture de stock</SelectItem>
            <SelectItem value="low">Stock faible</SelectItem>
            <SelectItem value="healthy">Stock sain</SelectItem>
          </SelectContent>
        </Select>
        {filter !== 'all' && (
          <Button variant="ghost" size="sm" onClick={() => setFilter('all')} className="shrink-0">
            <X className="h-4 w-4 mr-1" /> Réinitialiser
          </Button>
        )}
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {filtered.length} produit{filtered.length !== 1 ? 's' : ''}
            {filter !== 'all' && ` · ${filter === 'out' ? 'Rupture' : filter === 'low' ? 'Stock faible' : 'Stock sain'}`}
          </CardTitle>
          <CardDescription>Cliquez sur l'icône crayon pour modifier la quantité directement</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading
            ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-14 bg-surface-sunken rounded animate-pulse" />
                ))}
              </div>
            )
            : filtered.length === 0
            ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <Package className="h-10 w-10 text-on-surface-faint mb-3" />
                <p className="text-sm font-medium text-on-surface">Aucun produit trouvé</p>
                <p className="text-xs text-on-surface-subtle mt-1">Modifiez votre recherche ou le filtre</p>
              </div>
            )
            : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface-sunken text-xs uppercase tracking-wide text-on-surface-subtle">
                    <tr>
                      <th className="text-left px-6 py-3">Produit</th>
                      <th className="text-left px-4 py-3">Marque</th>
                      <th className="text-left px-4 py-3">Prix</th>
                      <th className="text-left px-4 py-3">Stock</th>
                      <th className="text-left px-4 py-3">Valeur</th>
                      <th className="text-left px-4 py-3">Statut</th>
                      <th className="text-right px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-faint">
                    {filtered.map(product => {
                      const img = product.product_images?.find(x => x.is_primary) ?? product.product_images?.[0]
                      const isEditing = editingId === product.id
                      return (
                        <tr
                          key={product.id}
                          className={`transition-colors ${
                            isEditing
                              ? 'bg-blue-50/50 dark:bg-blue-900/10'
                              : 'hover:bg-surface-sunken'
                          }`}
                        >
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-surface-sunken overflow-hidden shrink-0">
                                {img && (
                                  <img
                                    src={getImageSrc(img) ?? ''}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-on-surface truncate max-w-[180px]">{product.name}</p>
                                <p className="text-xs text-on-surface-subtle">{product.processor} · {product.ram}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-on-surface-subtle">{product.brand}</td>
                          <td className="px-4 py-3 font-semibold text-on-surface">{formatPrice(product.price)}</td>
                          <td className="px-4 py-3">
                            {isEditing ? (
                              <InlineStockEditor product={product} onDone={() => setEditingId(null)} />
                            ) : (
                              <StockQuantity quantity={product.stock_quantity} />
                            )}
                          </td>
                          <td className="px-4 py-3 text-on-surface-subtle text-sm">
                            {formatPrice(product.price * product.stock_quantity)}
                          </td>
                          <td className="px-4 py-3">
                            <StockBadge quantity={product.stock_quantity} />
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex items-center justify-end gap-1">
                              {!isEditing && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  title="Modifier la quantité"
                                  onClick={() => setEditingId(product.id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
                                <Link to={`/admin/products/${product.id}/edit`}>Modifier</Link>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
          }
        </CardContent>
      </Card>
    </div>
  )
}
