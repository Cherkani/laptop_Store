import { useState, useRef } from 'react'
import { Upload, X, Plus, Trash2, Loader2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { adminService } from '../services/adminService'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'
import { BRANDS, PROCESSORS, RAM_OPTIONS, STORAGE_OPTIONS, GRAPHICS_OPTIONS, SCREEN_SIZES } from '@/features/products/types'
import type { ProductWithImages } from '@/types/database.types'
import { getImageSrc } from '@/lib/utils'

interface ProductFormProps {
  product?: ProductWithImages
  onSuccess?: () => void
  onCancel?: () => void
}

interface ImagePreview {
  file?: File
  url: string | null
  id?: string
  isPrimary: boolean
}

interface SpecField {
  key: string
  value: string
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.price?.toString() ?? '',
    brand: product?.brand ?? '',
    processor: product?.processor ?? '',
    ram: product?.ram ?? '',
    storage: product?.storage ?? '',
    graphics_card: product?.graphics_card ?? '',
    screen_size: product?.screen_size ?? '',
    weight: product?.weight ?? '',
    stock_quantity: product?.stock_quantity?.toString() ?? '0',
    is_featured: product?.is_featured ?? false,
    category: product?.category ?? 'laptop',
  })

  const [images, setImages] = useState<ImagePreview[]>(
    product?.product_images?.sort((a, b) => a.display_order - b.display_order).map(img => ({
      url: getImageSrc(img),
      id: img.id,
      isPrimary: img.is_primary,
    })) ?? []
  )

  const [specs, setSpecs] = useState<SpecField[]>(
    product?.specifications?.map(s => ({ key: s.spec_key, value: s.spec_value })) ?? []
  )

  const update = (key: string, val: string | boolean) =>
    setFormData(p => ({ ...p, [key]: val }))

  const handleImageFiles = (files: FileList | null) => {
    if (!files) return
    const newImages: ImagePreview[] = Array.from(files).map((file, i) => ({
      file,
      url: URL.createObjectURL(file),
      isPrimary: images.length === 0 && i === 0,
    }))
    setImages(prev => [...prev, ...newImages])
  }

  const removeImage = (index: number) => {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== index)
      if (prev[index].isPrimary && next.length > 0) next[0].isPrimary = true
      return next
    })
  }

  const setPrimary = (index: number) =>
    setImages(prev => prev.map((img, i) => ({ ...img, isPrimary: i === index })))

  const addSpec = () => setSpecs(prev => [...prev, { key: '', value: '' }])
  const removeSpec = (i: number) => setSpecs(prev => prev.filter((_, idx) => idx !== i))
  const updateSpec = (i: number, field: 'key' | 'value', value: string) =>
    setSpecs(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.price || !formData.brand || !formData.processor || !formData.ram || !formData.storage || !formData.graphics_card || !formData.screen_size) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)
    try {
      const productData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        brand: formData.brand,
        processor: formData.processor,
        ram: formData.ram,
        storage: formData.storage,
        graphics_card: formData.graphics_card,
        screen_size: formData.screen_size,
        weight: formData.weight || null,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        is_featured: formData.is_featured,
        category: formData.category,
      }

      let savedProduct: { id: string }
      if (product) {
        savedProduct = await adminService.updateProduct(product.id, productData)
      } else {
        savedProduct = await adminService.createProduct(productData)
      }

      let displayOrder = images.filter(i => i.id).length
      for (const img of images.filter(i => i.file)) {
        const url = await adminService.uploadImage(img.file!, savedProduct.id)
        await adminService.addProductImage(savedProduct.id, url, displayOrder++, img.isPrimary)
      }

      await adminService.upsertSpecifications(savedProduct.id, specs.filter(s => s.key && s.value))

      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })

      toast({ title: product ? 'Product updated!' : 'Product created!', variant: 'default' })
      onSuccess?.()
    } catch (err) {
      toast({ title: 'Failed to save product', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
    <div className="space-y-1.5">
      <Label className="text-sm">
        {label}{required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Basic Information</h3>
        <Field label="Product Name" required>
          <Input
            value={formData.name}
            onChange={e => update('name', e.target.value)}
            placeholder="e.g. MacBook Pro 16-inch M4 Pro"
            required
          />
        </Field>
        <Field label="Description">
          <textarea
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            value={formData.description}
            onChange={e => update('description', e.target.value)}
            placeholder="Describe the laptop..."
            rows={3}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (MAD)" required>
            <Input
              type="number" min="0" step="0.01"
              value={formData.price}
              onChange={e => update('price', e.target.value)}
              placeholder="9999"
              required
            />
          </Field>
          <Field label="Stock Quantity" required>
            <Input
              type="number" min="0"
              value={formData.stock_quantity}
              onChange={e => update('stock_quantity', e.target.value)}
              required
            />
          </Field>
        </div>
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
          <input
            type="checkbox"
            id="is_featured"
            checked={formData.is_featured}
            onChange={e => update('is_featured', e.target.checked)}
            className="w-4 h-4 rounded border-input accent-blue-600"
          />
          <Label htmlFor="is_featured" className="cursor-pointer text-sm font-medium">
            Mark as Featured Product
            <span className="block text-xs text-muted-foreground font-normal">Shown on landing page and marked with a badge</span>
          </Label>
        </div>
      </div>

      <Separator />

      {/* Specifications */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Laptop Specifications</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Brand" required>
            <Select value={formData.brand} onValueChange={v => update('brand', v)}>
              <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
              <SelectContent>{BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Processor" required>
            <Select value={formData.processor} onValueChange={v => update('processor', v)}>
              <SelectTrigger><SelectValue placeholder="Select processor" /></SelectTrigger>
              <SelectContent>{PROCESSORS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="RAM" required>
            <Select value={formData.ram} onValueChange={v => update('ram', v)}>
              <SelectTrigger><SelectValue placeholder="Select RAM" /></SelectTrigger>
              <SelectContent>{RAM_OPTIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Storage" required>
            <Select value={formData.storage} onValueChange={v => update('storage', v)}>
              <SelectTrigger><SelectValue placeholder="Select storage" /></SelectTrigger>
              <SelectContent>{STORAGE_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Graphics Card" required>
            <Select value={formData.graphics_card} onValueChange={v => update('graphics_card', v)}>
              <SelectTrigger><SelectValue placeholder="Select GPU" /></SelectTrigger>
              <SelectContent>{GRAPHICS_OPTIONS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Screen Size" required>
            <Select value={formData.screen_size} onValueChange={v => update('screen_size', v)}>
              <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
              <SelectContent>{SCREEN_SIZES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
        </div>
        <Field label="Weight">
          <Input
            value={formData.weight}
            onChange={e => update('weight', e.target.value)}
            placeholder="e.g. 1.6 kg"
            className="max-w-xs"
          />
        </Field>
      </div>

      <Separator />

      {/* Images */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Product Images</h3>
        <div
          className="border-2 border-dashed border-muted rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDrop={e => { e.preventDefault(); handleImageFiles(e.dataTransfer.files) }}
          onDragOver={e => e.preventDefault()}
        >
          <Upload className="h-7 w-7 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm font-medium text-slate-900">Drop images here or click to upload</p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP up to 5MB each</p>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleImageFiles(e.target.files)} />
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative group">
                <div className={`aspect-square rounded-lg overflow-hidden border-2 ${img.isPrimary ? 'border-blue-600' : 'border-transparent'}`}>
                  {img.url ? (
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">No image</div>
                  )}
                </div>
                {img.isPrimary && (
                  <span className="absolute bottom-1 left-1 bg-blue-600 text-on-surface text-[10px] px-1 rounded leading-tight">Primary</span>
                )}
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!img.isPrimary && (
                    <button type="button" onClick={() => setPrimary(i)} className="w-5 h-5 bg-blue-600 rounded text-on-surface text-xs flex items-center justify-center" title="Set primary">★</button>
                  )}
                  <button type="button" onClick={() => removeImage(i)} className="w-5 h-5 bg-red-500 rounded text-on-surface flex items-center justify-center">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Extra Specs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Additional Specs</h3>
          <Button type="button" variant="outline" size="sm" onClick={addSpec}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        {specs.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-3">
            Add extra specs like battery life, ports, OS, etc.
          </p>
        )}
        <div className="space-y-2">
          {specs.map((spec, i) => (
            <div key={i} className="flex gap-2 items-center">
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input value={spec.key} onChange={e => updateSpec(i, 'key', e.target.value)} placeholder="e.g. Battery Life" className="w-2/5" />
              <Input value={spec.value} onChange={e => updateSpec(i, 'value', e.target.value)} placeholder="e.g. Up to 22 hours" className="flex-1" />
              <Button type="button" variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => removeSpec(i)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting} className="flex-1 sm:flex-none">
          {isSubmitting
            ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Saving...</>
            : product ? 'Update Product' : 'Create Product'
          }
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
