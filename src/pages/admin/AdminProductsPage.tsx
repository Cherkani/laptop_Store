import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Box, Eye, EyeOff, TriangleAlert } from 'lucide-react'
import { AdminProductList } from '@/features/admin/components/AdminProductList'
import { ProductModal } from '@/features/admin/components/ProductModal'
import { useAdminProducts } from '@/features/admin/hooks/useAdminProducts'

export function AdminProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [modalState, setModalState] = useState<{ open: boolean; productId?: string }>({ open: false })
  const { data: products = [] } = useAdminProducts()

  // Support opening modal via URL: /admin/products?action=new or ?action=edit&id=xxx
  useEffect(() => {
    const action = searchParams.get('action')
    const id = searchParams.get('id')
    if (action === 'new') {
      setModalState({ open: true })
    } else if (action === 'edit' && id) {
      setModalState({ open: true, productId: id })
    }
  }, [])

  const openAdd = () => {
    setModalState({ open: true })
  }

  const openEdit = (productId: string) => {
    setModalState({ open: true, productId })
  }

  const closeModal = () => {
    setModalState({ open: false, productId: undefined })
    // Clear action from URL if it was there
    if (searchParams.get('action')) {
      setSearchParams({}, { replace: true })
    }
  }

  const total = products.length
  const visible = products.filter(p => (p as { is_available?: boolean }).is_available !== false).length
  const hidden = products.filter(p => (p as { is_available?: boolean }).is_available === false).length
  const lowStock = products.filter(
    p => (p as { is_available?: boolean }).is_available !== false && p.stock_quantity <= 3,
  ).length

  return (
    <div className="p-6 lg:p-8 bg-surface-base min-h-full space-y-8">
      <div className="rounded-2xl border border-border-faint bg-surface-raised p-5 lg:p-6">
        <h1 className="text-2xl font-bold text-on-surface">Gestion produits</h1>
        <p className="text-on-surface-subtle mt-1">Catalogue, visibilité et pilotage du stock dans une seule interface.</p>
        <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-xl border border-border-faint bg-surface-base px-4 py-3">
            <p className="text-xs text-on-surface-faint uppercase tracking-wide">Total</p>
            <p className="mt-1 text-lg font-bold text-on-surface flex items-center gap-2"><Box className="h-4 w-4 text-cyan-500" />{total}</p>
          </div>
          <div className="rounded-xl border border-border-faint bg-surface-base px-4 py-3">
            <p className="text-xs text-on-surface-faint uppercase tracking-wide">Visibles</p>
            <p className="mt-1 text-lg font-bold text-emerald-600 flex items-center gap-2"><Eye className="h-4 w-4" />{visible}</p>
          </div>
          <div className="rounded-xl border border-border-faint bg-surface-base px-4 py-3">
            <p className="text-xs text-on-surface-faint uppercase tracking-wide">Masqués</p>
            <p className="mt-1 text-lg font-bold text-red-500 flex items-center gap-2"><EyeOff className="h-4 w-4" />{hidden}</p>
          </div>
          <div className="rounded-xl border border-border-faint bg-surface-base px-4 py-3">
            <p className="text-xs text-on-surface-faint uppercase tracking-wide">Stock faible</p>
            <p className="mt-1 text-lg font-bold text-amber-500 flex items-center gap-2"><TriangleAlert className="h-4 w-4" />{lowStock}</p>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-border-faint bg-surface-raised p-4 lg:p-5 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-on-surface">Catalogue produits</h2>
          <p className="text-sm text-on-surface-subtle">Gestion des fiches, prix, marge, visibilité et actions rapides.</p>
        </div>
        <AdminProductList onAdd={openAdd} onEdit={openEdit} />
      </section>

      <ProductModal
        open={modalState.open}
        productId={modalState.productId}
        onClose={closeModal}
      />
    </div>
  )
}
