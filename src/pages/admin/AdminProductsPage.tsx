import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AdminProductList } from '@/features/admin/components/AdminProductList'
import { ProductModal } from '@/features/admin/components/ProductModal'

export function AdminProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [modalState, setModalState] = useState<{ open: boolean; productId?: string }>({ open: false })

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

  return (
    <div className="p-6 lg:p-8 bg-surface-base min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Products</h1>
        <p className="text-muted-foreground mt-1">Manage your laptop catalog</p>
      </div>

      <AdminProductList onAdd={openAdd} onEdit={openEdit} />

      <ProductModal
        open={modalState.open}
        productId={modalState.productId}
        onClose={closeModal}
      />
    </div>
  )
}
