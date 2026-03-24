import { useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { ProductForm } from '@/features/admin/components/ProductForm'
import { useProduct } from '@/features/products/hooks/useProducts'

export function AdminEditProductPage() {
  const { id } = useParams<{ id: string }>()
  const { data: product, isLoading, error } = useProduct(id)

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-900">Product not found</h1>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Edit Product</h1>
        <p className="text-muted-foreground mt-1">{product.name}</p>
      </div>
      <ProductForm product={product} />
    </div>
  )
}
