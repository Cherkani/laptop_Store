import { useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useAdminProduct } from '@/features/admin/hooks/useAdminProducts'
import { ProductForm } from './ProductForm'
import type { ProductWithImages } from '@/types/database.types'

interface ProductModalProps {
  open: boolean
  productId?: string       // if provided → edit mode
  onClose: () => void
}

export function ProductModal({ open, productId, onClose }: ProductModalProps) {
  const isEdit = !!productId
  const { data: product, isLoading } = useAdminProduct(productId)

  // Prevent body scroll while open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet panel from right */}
      <div className="fixed right-0 top-0 h-full z-50 w-full max-w-2xl bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isEdit ? 'Update the details below' : 'Fill in the details to add a laptop to the store'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-slate-600" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isEdit && isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isEdit && !product ? (
            <div className="text-center py-20 text-muted-foreground">
              Product not found.
            </div>
          ) : (
            <ProductForm
              key={productId ?? 'new-product'}
              product={isEdit ? (product as ProductWithImages) : undefined}
              onSuccess={onClose}
              onCancel={onClose}
            />
          )}
        </div>
      </div>
    </>
  )
}
