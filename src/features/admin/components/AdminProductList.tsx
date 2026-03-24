import { useState } from 'react'
import { Pencil, Trash2, Plus, Search, Loader2, PackageOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { useAdminProducts, useDeleteProduct } from '../hooks/useAdminProducts'
import { formatPrice } from '@/lib/utils'
import type { Product, ProductImage } from '@/types/database.types'

type ProductWithImages = Product & { product_images: ProductImage[] }

interface AdminProductListProps {
  onAdd: () => void
  onEdit: (productId: string) => void
}

export function AdminProductList({ onAdd, onEdit }: AdminProductListProps) {
  const { data: products = [], isLoading } = useAdminProducts()
  const deleteProduct = useDeleteProduct()
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<ProductWithImages | null>(null)

  const filtered = (products as ProductWithImages[]).filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="pl-9"
          />
        </div>
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border bg-white">
          <PackageOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-slate-900">
            {search ? 'No results found' : 'No products yet'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {search ? 'Try a different search term' : 'Add your first laptop to get started'}
          </p>
          {!search && (
            <Button className="mt-4" onClick={onAdd}>
              <Plus className="h-4 w-4 mr-2" /> Add Product
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-3">Product</th>
                  <th className="text-left px-4 py-3">Brand</th>
                  <th className="text-left px-4 py-3">Price</th>
                  <th className="text-left px-4 py-3">Stock</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(product => {
                  const images = product.product_images?.sort((a, b) => a.display_order - b.display_order) ?? []
                  const image = images.find(i => i.is_primary) ?? images[0]
                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-slate-100 overflow-hidden shrink-0 border">
                            {image
                              ? <img src={image.image_url} alt={product.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 text-lg">□</div>
                            }
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 line-clamp-1">{product.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{product.processor} · {product.ram} · {product.storage}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">{product.brand}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">{formatPrice(product.price)}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-sm font-bold ${
                          product.stock_quantity === 0 ? 'text-red-500'
                          : product.stock_quantity <= 5 ? 'text-amber-500'
                          : 'text-emerald-600'
                        }`}>
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1 flex-wrap">
                          {product.is_featured && <Badge className="text-xs">Featured</Badge>}
                          {product.stock_quantity === 0
                            ? <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                            : product.stock_quantity <= 5
                            ? <Badge variant="warning" className="text-xs">Low Stock</Badge>
                            : <Badge variant="success" className="text-xs">Active</Badge>
                          }
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 text-slate-600 hover:text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => onEdit(product.id)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setDeleteTarget(product as ProductWithImages)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 bg-slate-50 border-t text-xs text-muted-foreground">
            Showing {filtered.length} of {products.length} products
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong className="text-slate-900">{deleteTarget?.name}</strong>?
              This will also remove all images and specifications. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={deleteProduct.isPending}
              onClick={() => {
                if (deleteTarget) deleteProduct.mutate(deleteTarget.id)
                setDeleteTarget(null)
              }}
            >
              {deleteProduct.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Deleting...</> : 'Delete Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
