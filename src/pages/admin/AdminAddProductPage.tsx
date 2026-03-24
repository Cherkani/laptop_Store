import { ProductForm } from '@/features/admin/components/ProductForm'

export function AdminAddProductPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Add New Product</h1>
        <p className="text-muted-foreground mt-1">Fill in the details to add a new laptop to the store</p>
      </div>
      <ProductForm />
    </div>
  )
}
