import { useState, useRef } from 'react'
import { Upload, X, Plus, Trash2, Loader2, GripVertical, ExternalLink, Lock, Wand2, ShieldCheck } from 'lucide-react'
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
import { parseListing, ParsedListing, ParsedSpec } from '@/features/admin/utils/listingParser'

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

type SpecField = ParsedSpec

type FormState = {
  name: string
  description: string
  price: string
  brand: string
  processor: string
  ram: string
  storage: string
  graphics_card: string
  screen_size: string
  weight: string
  stock_quantity: string
  is_featured: boolean
  category: string
  source_url: string
  source_price: string
  margin_amount: string
  is_available: boolean
}

type SuggestionField =
  | 'name'
  | 'price'
  | 'brand'
  | 'processor'
  | 'ram'
  | 'storage'
  | 'graphics_card'
  | 'screen_size'
  | 'description'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  )
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [draftSuggestions, setDraftSuggestions] = useState<ParsedListing>({})
  const [applyEmptyOnly, setApplyEmptyOnly] = useState(true)

  const [formData, setFormData] = useState<FormState>({
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
    // Sourcing
    source_url: (product as any)?.source_url ?? '',
    source_price: (product as any)?.source_price?.toString() ?? '',
    margin_amount: (product as any)?.margin_amount?.toString() ?? '',
    is_available: (product as any)?.is_available ?? true,
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

  const update = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setFormData(p => ({ ...p, [key]: val }))

  const canonicalizeProcessor = (val: string): string | undefined => {
    const v = val.toLowerCase()
    if (v.includes('ryzen 9')) return 'AMD Ryzen 9'
    if (v.includes('ryzen 7')) return 'AMD Ryzen 7'
    if (v.includes('ryzen 5')) return 'AMD Ryzen 5'
    if (v.includes('core ultra') || v.includes('ultra')) {
      if (v.includes('9')) return 'Intel Core i9'
      if (v.includes('7')) return 'Intel Core i7'
      if (v.includes('5')) return 'Intel Core i5'
    }
    if (v.includes('i9')) return 'Intel Core i9'
    if (v.includes('i7')) return 'Intel Core i7'
    if (v.includes('i5')) return 'Intel Core i5'
    if (v.includes('i3')) return 'Intel Core i3'
    if (v.includes('m4')) return 'Apple M4'
    if (v.includes('m3')) return 'Apple M3'
    if (v.includes('m2')) return 'Apple M2'
    if (v.includes('m1')) return 'Apple M1'
    return undefined
  }

  const applySuggestions = () => {
    if (!Object.keys(draftSuggestions).length) return
    const next = { ...formData }
    const fields: SuggestionField[] = ['name','price','brand','processor','ram','storage','graphics_card','screen_size','description']
    for (const key of fields) {
      const val = (draftSuggestions as any)[key]
      if (val === undefined || val === null || val === '') continue
      const shouldApply = applyEmptyOnly ? !next[key] : true
      if (shouldApply) {
        if (key === 'processor') {
          next[key] = canonicalizeProcessor(String(val)) ?? String(val)
        } else {
          next[key] = String(val)
        }
      }
    }
    setFormData(next)
    if (draftSuggestions.specs && draftSuggestions.specs.length > 0 && (!applyEmptyOnly || specs.length === 0)) {
      setSpecs(prev => prev.length ? prev : draftSuggestions.specs!)
    }
    toast({ title: 'Champs préremplis depuis le texte' })
  }

  const handlePasteParse = () => {
    const suggestions = parseListing(pasteText)
    setDraftSuggestions(suggestions)
    toast({ title: 'Analyse terminée', description: 'Vérifiez puis appliquez les valeurs proposées.' })
  }

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

  const parseNumber = (val: string | null | undefined) => {
    if (!val) return null
    const cleaned = val.replace(',', '.')
    const n = Number(cleaned)
    return Number.isFinite(n) ? n : null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const parsedPrice = parseNumber(formData.price)
      const parsedSourcePrice = parseNumber(formData.source_price)
      const parsedMargin = parseNumber(formData.margin_amount)

      const productData = {
        name: formData.name,
        description: formData.description || null,
        price: parsedPrice ?? 0,
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
        // Sourcing
        source_url: formData.source_url || null,
        source_price: parsedSourcePrice,
        margin_amount: parsedMargin,
        is_available: formData.is_available,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Basic Information</h3>

        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Wand2 className="h-4 w-4" /> Coller une annonce pour pré-remplir
          </div>
          <textarea
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono min-h-[110px] resize-y"
            placeholder="Collez ici une annonce (texte brut, bullet points, prix, specs...)"
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
          />
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={handlePasteParse} disabled={!pasteText.trim()}>
              <Wand2 className="h-4 w-4 mr-1" /> Générer des propositions
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={applySuggestions} disabled={!Object.keys(draftSuggestions).length}>
              Appliquer aux champs
            </Button>
            <label className="flex items-center gap-2 text-xs text-slate-600 ml-auto">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-input accent-blue-600"
                checked={applyEmptyOnly}
                onChange={e => setApplyEmptyOnly(e.target.checked)}
              />
              <span>Ne remplacer que les champs vides</span>
            </label>
          </div>
          {Object.keys(draftSuggestions).length > 0 && (
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-700">
              {(['name','price','brand','processor','ram','storage','graphics_card','screen_size'] as const).map(key => (
                (draftSuggestions as any)[key] && (
                  <div key={key} className="bg-white border rounded-lg px-3 py-2 shadow-sm">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold capitalize">{key.replace('_',' ')}</p>
                      {((applyEmptyOnly && !(formData as any)[key]) || !applyEmptyOnly) && (
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-slate-600 break-words">{(draftSuggestions as any)[key]}</p>
                  </div>
                )
              ))}
              {draftSuggestions.specs && draftSuggestions.specs.length > 0 && (
                <div className="col-span-2 bg-white border rounded-lg px-3 py-2 shadow-sm">
                  <p className="font-semibold">Specs détectées ({draftSuggestions.specs.length})</p>
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    {draftSuggestions.specs.slice(0,5).map((s, i) => (
                      <li key={i} className="text-slate-600">{s.key && <span className="font-medium">{s.key}: </span>}{s.value}</li>
                    ))}
                    {draftSuggestions.specs.length > 5 && <li className="text-slate-500">... et {draftSuggestions.specs.length - 5} autres</li>}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <Field label="Product Name">
          <Input
            value={formData.name}
            onChange={e => update('name', e.target.value)}
            placeholder="e.g. MacBook Pro 16-inch M4 Pro"
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
          <Field label="Price (MAD)">
            <Input
              type="text"
              inputMode="decimal"
              defaultValue={formData.price}
              onChange={e => update('price', e.target.value)}
              placeholder="9999"
            />
          </Field>
          <Field label="Stock Quantity">
            <Input
              type="number" min="0"
              value={formData.stock_quantity}
              onChange={e => update('stock_quantity', e.target.value)}
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
          <Field label="Brand">
            <Select value={formData.brand} onValueChange={v => update('brand', v)}>
              <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
              <SelectContent>{BRANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Processor">
            <Select value={formData.processor} onValueChange={v => update('processor', v)}>
              <SelectTrigger><SelectValue placeholder="Select processor" /></SelectTrigger>
              <SelectContent>{PROCESSORS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="RAM">
            <Select value={formData.ram} onValueChange={v => update('ram', v)}>
              <SelectTrigger><SelectValue placeholder="Select RAM" /></SelectTrigger>
              <SelectContent>{RAM_OPTIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Storage">
            <Select value={formData.storage} onValueChange={v => update('storage', v)}>
              <SelectTrigger><SelectValue placeholder="Select storage" /></SelectTrigger>
              <SelectContent>{STORAGE_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Graphics Card">
            <Select value={formData.graphics_card} onValueChange={v => update('graphics_card', v)}>
              <SelectTrigger><SelectValue placeholder="Select GPU" /></SelectTrigger>
              <SelectContent>{GRAPHICS_OPTIONS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Screen Size">
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

      <Separator />

      {/* Sourcing / Dropshipping — admin only, never shown to customers */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Sourcing <span className="normal-case font-normal text-slate-400 tracking-normal">(privé — jamais visible par les clients)</span>
          </h3>
        </div>

        {/* Availability toggle — most important control */}
        <div className={`flex items-center justify-between gap-3 p-4 rounded-xl border-2 transition-colors ${
          formData.is_available
            ? 'border-emerald-200 bg-emerald-50'
            : 'border-red-200 bg-red-50'
        }`}>
          <div>
            <p className={`text-sm font-semibold ${formData.is_available ? 'text-emerald-800' : 'text-red-800'}`}>
              {formData.is_available ? 'Disponible — visible sur le site' : 'Indisponible — masqué du catalogue'}
            </p>
            <p className={`text-xs mt-0.5 ${formData.is_available ? 'text-emerald-600' : 'text-red-500'}`}>
              {formData.is_available
                ? 'Le produit apparaît dans le catalogue public.'
                : 'Le store source a vendu ce produit. Il est masqué et exclu des stats de ventes.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => update('is_available', !formData.is_available)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
              formData.is_available ? 'bg-emerald-500' : 'bg-red-400'
            }`}
            role="switch"
            aria-checked={formData.is_available}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transform transition-transform ${
                formData.is_available ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Source store URL */}
        <Field label="URL du store source">
          <div className="relative">
            <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="url"
              value={formData.source_url}
              onChange={e => update('source_url', e.target.value)}
              placeholder="https://jumia.ma/produit/..."
              className="pl-9 font-mono text-sm"
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">Lien vers l'annonce originale. Jamais affiché aux clients.</p>
        </Field>

        {/* Price breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Prix d'achat (MAD)">
            <Input
              type="text"
              inputMode="decimal"
              defaultValue={formData.source_price}
              onChange={e => update('source_price', e.target.value)}
              placeholder="ex: 3200"
            />
          </Field>
          <Field label="Marge ajoutée (MAD)">
            <Input
              type="text"
              inputMode="decimal"
              defaultValue={formData.margin_amount}
              onChange={e => update('margin_amount', e.target.value)}
              placeholder="ex: 500"
            />
          </Field>
        </div>

        {/* Auto-computed selling price hint */}
        {(() => {
          const sp = parseNumber(formData.source_price)
          const ma = parseNumber(formData.margin_amount)
          return Number.isFinite(sp) && Number.isFinite(ma)
        })() && (
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-100 px-4 py-2.5 text-sm">
            <span className="text-blue-600 font-medium">Prix de vente suggéré :</span>
            <span className="font-bold text-blue-800">
              {((parseNumber(formData.source_price) ?? 0) + (parseNumber(formData.margin_amount) ?? 0)).toLocaleString('fr-MA')} MAD
            </span>
            <span className="text-blue-400 text-xs ml-auto">
              {(parseNumber(formData.source_price) ?? 0).toLocaleString('fr-MA')} + {(parseNumber(formData.margin_amount) ?? 0).toLocaleString('fr-MA')}
            </span>
          </div>
        )}
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
