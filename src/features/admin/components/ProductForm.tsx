import { useEffect, useRef, useState } from 'react'
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
import { formatPrice, getImageSrc } from '@/lib/utils'
import { PRODUCT_CONDITIONS } from '@/lib/constants'
import { parseListing, ParsedListing, ParsedSpec } from '@/features/admin/utils/listingParser'

/** Strip emoji and trademark symbols from a raw listing name */
function cleanName(raw: string): string {
  return raw
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/[®™©]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Ordered section definitions for the description.
 * Each entry: [icon, canonical label, keyword matchers against spec keys]
 * Sections are rendered in this exact order; unknown specs go last.
 */
const DESC_SECTIONS: Array<{ icon: string; label: string; keys: RegExp }> = [
  { icon: '⚡', label: 'Processeur',      keys: /proc[ée]ss|cpu|chip/i },
  { icon: '🧠', label: 'RAM',             keys: /\bram\b|m[eé]moire|memory/i },
  { icon: '💾', label: 'Stockage',        keys: /stock|storage|ssd|hdd|disque|nvme/i },
  { icon: '🎮', label: 'Carte graphique', keys: /graph|gpu|vid[eé]o/i },
  { icon: '🖥️', label: 'Écran',           keys: /[eé]cran|screen|display|dalle/i },
  { icon: '🔋', label: 'Batterie',        keys: /batt[eé]r/i },
  { icon: '📡', label: 'Connectivité',    keys: /wi.?fi|wifi|bluetooth|lan|r[eé]seau|connect/i },
  { icon: '🔌', label: 'Ports',           keys: /\bport[s]?\b|usb|thunderbolt|hdmi|jack/i },
  { icon: '📸', label: 'Webcam',          keys: /webcam|cam[eé]ra|cam\b/i },
  { icon: '🎧', label: 'Audio',           keys: /audio|son\b|speaker|haut.parleur|dolby|dts/i },
  { icon: '⌨️', label: 'Clavier',         keys: /clavier|keyboard/i },
  { icon: '🔐', label: 'Sécurité',        keys: /s[eé]curit|tpm|empreinte|fingerprint|hello|lock/i },
  { icon: '🪟', label: 'Système',         keys: /syst[eè]me|windows|macos|os\b/i },
  { icon: '📦', label: 'État',            keys: /[eé]tat|condition|emballage/i },
]

/** Build a consistent, icon-based description from parsed structured fields + spec lines */
function buildDescription(s: ParsedListing): string {
  // Start with the 5 structured fields as seed entries
  const structured: Array<{ section: typeof DESC_SECTIONS[number]; value: string }> = []
  const push = (_icon: string, label: string, value: string) => {
    const section = DESC_SECTIONS.find(d => d.label === label)!
    structured.push({ section, value })
  }
  if (s.processor)     push('⚡', 'Processeur',      s.processor)
  if (s.ram)           push('🧠', 'RAM',             s.ram)
  if (s.storage)       push('💾', 'Stockage',        s.storage)
  if (s.graphics_card) push('🎮', 'Carte graphique', s.graphics_card)
  if (s.screen_size)   push('🖥️', 'Écran',           s.screen_size)
  if (s.condition)     push('📦', 'État',            s.condition)

  // Collect labels already covered so we don't duplicate from specs
  const usedLabels = new Set(structured.map(e => e.section.label))

  // Extra entries from spec lines, matched to sections by keyword
  const extras: Array<{ section: typeof DESC_SECTIONS[number] | null; key: string; value: string }> = []
  for (const spec of s.specs ?? []) {
    const section = DESC_SECTIONS.find(d => d.keys.test(spec.key))
    if (section && usedLabels.has(section.label)) continue // already have this from structured fields
    if (section) usedLabels.add(section.label)
    extras.push({ section: section ?? null, key: spec.key, value: spec.value })
  }

  // Sort extras by section order index; unknown sections go last
  extras.sort((a, b) => {
    const ia = a.section ? DESC_SECTIONS.indexOf(a.section) : 999
    const ib = b.section ? DESC_SECTIONS.indexOf(b.section) : 999
    return ia - ib
  })

  // Merge: structured entries in section order, extras fill gaps
  const allSectionEntries = [
    ...structured.map(e => ({ section: e.section, label: e.section.label, value: e.value })),
    ...extras.map(e => ({
      section: e.section,
      label: e.section?.label ?? e.key,
      value: e.value,
    })),
  ].sort((a, b) => {
    const ia = a.section ? DESC_SECTIONS.indexOf(a.section) : 999
    const ib = b.section ? DESC_SECTIONS.indexOf(b.section) : 999
    return ia - ib
  })

  return allSectionEntries
    .map(e => `${e.section?.icon ?? '•'} ${e.label} : ${e.value}`)
    .join('\n')
}

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
  condition: string
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
  image_source_url: string
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
  | 'condition'
  | 'description'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  )
}

function getStoragePathFromPublicUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const marker = '/storage/v1/object/public/product-images/'
  const idx = url.indexOf(marker)
  if (idx < 0) return null
  const path = url.slice(idx + marker.length)
  return path || null
}

function normalizeCondition(condition: string | null | undefined): string {
  if (!condition) return 'Neuf'
  if (condition === 'Neuf' || condition === 'Comme neuf') return condition
  if (condition === 'Like New' || condition === 'Excellent' || condition === 'Good' || condition === 'Fair') {
    return 'Comme neuf'
  }
  return 'Neuf'
}

function toFormState(product?: ProductWithImages): FormState {
  return {
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.price?.toString() ?? '',
    condition: normalizeCondition(product?.condition),
    brand: product?.brand ?? '',
    processor: product?.processor ?? '',
    ram: product?.ram ?? '',
    storage: product?.storage ?? '',
    graphics_card: product?.graphics_card ?? '',
    screen_size: product?.screen_size ?? '',
    weight: product?.weight ?? '',
    stock_quantity: product ? (product.stock_quantity?.toString() ?? '0') : '1',
    is_featured: product?.is_featured ?? false,
    category: product?.category ?? 'laptop',
    source_url: (product as any)?.source_url ?? '',
    source_price: (product as any)?.source_price?.toString() ?? '',
    margin_amount: (product as any)?.margin_amount?.toString() ?? '',
    is_available: (product as any)?.is_available ?? true,
    image_source_url: (product as any)?.image_source_url ?? '',
  }
}

function toImagePreviews(product?: ProductWithImages): ImagePreview[] {
  return (
    product?.product_images
      ?.sort((a, b) => a.display_order - b.display_order)
      .map(img => ({
        url: getImageSrc(img),
        id: img.id,
        isPrimary: img.is_primary,
      })) ?? []
  )
}

function toSpecs(product?: ProductWithImages): SpecField[] {
  return product?.specifications?.map(s => ({ key: s.spec_key, value: s.spec_value })) ?? []
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [draftSuggestions, setDraftSuggestions] = useState<ParsedListing>({})
  const [applyEmptyOnly, setApplyEmptyOnly] = useState(true)

  const [formData, setFormData] = useState<FormState>(() => toFormState(product))

  const [images, setImages] = useState<ImagePreview[]>(() => toImagePreviews(product))

  const [specs, setSpecs] = useState<SpecField[]>(() => toSpecs(product))

  useEffect(() => {
    setFormData(toFormState(product))
    setImages(toImagePreviews(product))
    setSpecs(toSpecs(product))
    setDraftSuggestions({})
    setPasteText('')
  }, [product?.id])

  const update = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setFormData(p => ({ ...p, [key]: val }))

  const canonicalizeProcessor = (val: string): string | undefined => {
    const v = val.toLowerCase()
    if (v.includes('core ultra')) {
      if (v.includes('ultra 9')) return 'Intel Core Ultra 9'
      if (v.includes('ultra 7')) return 'Intel Core Ultra 7'
      if (v.includes('ultra 5')) return 'Intel Core Ultra 5'
    }
    if (v.includes('ryzen 9')) return 'AMD Ryzen 9'
    if (v.includes('ryzen 7')) return 'AMD Ryzen 7'
    if (v.includes('ryzen 5')) return 'AMD Ryzen 5'
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
    const fields: SuggestionField[] = ['price','brand','processor','ram','storage','graphics_card','screen_size']
    for (const key of fields) {
      const val = (draftSuggestions as any)[key]
      if (val === undefined || val === null || val === '') continue
      const currentVal = (next as any)[key]
      const shouldApply = applyEmptyOnly ? !currentVal : true
      if (shouldApply) {
        if (key === 'processor') {
          (next as any)[key] = canonicalizeProcessor(String(val)) ?? String(val)
        } else {
          (next as any)[key] = String(val)
        }
      }
    }
    // Condition — always apply if detected, because the default 'Neuf' is never truly "empty"
    if (draftSuggestions.condition) {
      if (!applyEmptyOnly || next.condition === 'Neuf') {
        next.condition = draftSuggestions.condition
      }
    }
    // Name — strip raw emoji/symbols then prepend consistent 💻
    if (draftSuggestions.name && (!applyEmptyOnly || !next.name)) {
      const cleaned = cleanName(draftSuggestions.name)
      next.name = cleaned ? `💻 ${cleaned}` : next.name
    }
    // Description — build with consistent icons using the already-resolved next values
    if (!applyEmptyOnly || !next.description) {
      const resolvedSuggestions = {
        ...draftSuggestions,
        processor: next.processor || draftSuggestions.processor,
        ram:           next.ram       || draftSuggestions.ram,
        storage:       next.storage   || draftSuggestions.storage,
        graphics_card: next.graphics_card || draftSuggestions.graphics_card,
        screen_size:   next.screen_size   || draftSuggestions.screen_size,
        condition:     next.condition || draftSuggestions.condition,
      }
      const desc = buildDescription(resolvedSuggestions)
      if (desc) next.description = desc
    }
    setFormData(next)
    if (draftSuggestions.specs && draftSuggestions.specs.length > 0) {
      if (!applyEmptyOnly || specs.length === 0) {
        setSpecs(applyEmptyOnly ? draftSuggestions.specs! : prev => [...prev, ...draftSuggestions.specs!])
      }
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
    const cleaned = val.trim().replace(/\s+/g, '').replace(',', '.')
    const n = Number(cleaned)
    return Number.isFinite(n) ? n : null
  }

  const parsedPrice = parseNumber(formData.price)
  const parsedSourcePrice = parseNumber(formData.source_price)
  const parsedMarginAmount = parseNumber(formData.margin_amount)
  const previewImage = images.find(img => img.isPrimary)?.url ?? images[0]?.url ?? null
  const previewSpecs = [formData.processor, formData.ram, formData.storage].filter(Boolean).join(' · ')

  const marginConfig =
    formData.condition === 'Comme neuf'
      ? { minPct: 0.12, maxPct: 0.25 }
      : { minPct: 0.08, maxPct: 0.15 }

  const pricingGuidance = (() => {
    if (!parsedSourcePrice || parsedSourcePrice <= 0) return null
    const minMargin = Math.round(parsedSourcePrice * marginConfig.minPct)
    const maxMargin = Math.round(parsedSourcePrice * marginConfig.maxPct)
    const minSellPrice = parsedSourcePrice + minMargin
    const maxSellPrice = parsedSourcePrice + maxMargin
    const currentMargin =
      parsedMarginAmount !== null
        ? parsedMarginAmount
        : parsedPrice !== null
          ? parsedPrice - parsedSourcePrice
          : null
    let status: 'low' | 'ok' | 'high' | 'unknown' = 'unknown'
    if (currentMargin !== null) {
      if (currentMargin < minMargin) status = 'low'
      else if (currentMargin > maxMargin) status = 'high'
      else status = 'ok'
    }
    return { minMargin, maxMargin, minSellPrice, maxSellPrice, currentMargin, status }
  })()

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
        condition: formData.condition || 'Neuf',
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
        image_source_url: formData.image_source_url || null,
      }

      let savedProduct: { id: string }
      if (product) {
        savedProduct = await adminService.updateProduct(product.id, productData)
      } else {
        savedProduct = await adminService.createProduct(productData)
      }

      if (product) {
        const original = product.product_images ?? []
        const originalById = new Map(original.map(img => [img.id, img]))
        const keptIds = new Set(images.filter(img => img.id).map(img => img.id as string))
        const removed = original.filter(img => !keptIds.has(img.id))

        for (const img of removed) {
          const path = getStoragePathFromPublicUrl(img.image_url)
          await adminService.deleteProductImage(img.id, path)
        }

        for (const [index, img] of images.entries()) {
          if (!img.id) continue
          const old = originalById.get(img.id)
          if (!old) continue
          if (old.display_order !== index || old.is_primary !== img.isPrimary) {
            await adminService.updateProductImage(img.id, { display_order: index, is_primary: img.isPrimary })
          }
        }
      }

      for (const [index, img] of images.entries()) {
        if (!img.file) continue
        const url = await adminService.uploadImage(img.file, savedProduct.id)
        await adminService.addProductImage(savedProduct.id, url, index, img.isPrimary)
      }

      await adminService.upsertSpecifications(savedProduct.id, specs.filter(s => s.key && s.value))

      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['admin-product', savedProduct.id] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product', savedProduct.id] })

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
              {(['name','price','brand','processor','ram','storage','graphics_card','screen_size','condition'] as const).map(key => (
                (draftSuggestions as any)[key] && (
                  <div key={key} className="bg-white border rounded-lg px-3 py-2 shadow-sm">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold capitalize">{key.replace(/_/g,' ')}</p>
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
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base select-none pointer-events-none">💻</span>
            <Input
              value={formData.name.replace(/^💻\s*/, '')}
              onChange={e => update('name', e.target.value ? `💻 ${e.target.value.replace(/^💻\s*/, '')}` : '')}
              placeholder="Dell Precision 7670 — Station de travail mobile"
              className="pl-9"
            />
          </div>
        </Field>
        <Field label="Description">
          <textarea
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
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
              value={formData.price}
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
        <Field label="État">
          <Select value={formData.condition} onValueChange={v => update('condition', v)}>
            <SelectTrigger className="max-w-xs">
              <SelectValue placeholder="Choisir un état" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_CONDITIONS.map(condition => (
                <SelectItem key={condition} value={condition}>
                  {condition}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
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
            <Input
              list="processor-options"
              value={formData.processor}
              onChange={e => update('processor', e.target.value)}
              placeholder="e.g. Intel Core Ultra 7 155H"
            />
          </Field>
          <Field label="RAM">
            <Input
              list="ram-options"
              value={formData.ram}
              onChange={e => update('ram', e.target.value)}
              placeholder="e.g. 16GB"
            />
          </Field>
          <Field label="Storage">
            <Input
              list="storage-options"
              value={formData.storage}
              onChange={e => update('storage', e.target.value)}
              placeholder="e.g. 512GB SSD"
            />
          </Field>
          <Field label="Graphics Card">
            <Input
              list="gpu-options"
              value={formData.graphics_card}
              onChange={e => update('graphics_card', e.target.value)}
              placeholder="e.g. NVIDIA RTX 5050"
            />
          </Field>
          <Field label="Screen Size">
            <Input
              list="screen-size-options"
              value={formData.screen_size}
              onChange={e => update('screen_size', e.target.value)}
              placeholder="e.g. 18&quot;"
            />
          </Field>
        </div>
        <datalist id="processor-options">
          {PROCESSORS.map(p => <option key={p} value={p} />)}
        </datalist>
        <datalist id="ram-options">
          {RAM_OPTIONS.map(r => <option key={r} value={r} />)}
        </datalist>
        <datalist id="storage-options">
          {STORAGE_OPTIONS.map(s => <option key={s} value={s} />)}
        </datalist>
        <datalist id="gpu-options">
          {GRAPHICS_OPTIONS.map(g => <option key={g} value={g} />)}
        </datalist>
        <datalist id="screen-size-options">
          {SCREEN_SIZES.map(s => <option key={s} value={s} />)}
        </datalist>
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

        {/* Image source URL */}
        <Field label="Source de l'image (admin uniquement)">
          <div className="relative">
            <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="url"
              value={formData.image_source_url}
              onChange={e => update('image_source_url', e.target.value)}
              placeholder="https://..."
              className="pl-9 font-mono text-sm"
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">D'où provient l'image du produit. Jamais affiché aux clients.</p>
        </Field>

        {/* Price breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Prix d'achat (MAD)">
            <Input
              type="text"
              inputMode="decimal"
              value={formData.source_price}
              onChange={e => update('source_price', e.target.value)}
              placeholder="ex: 3200"
            />
          </Field>
          <Field label="Marge ajoutée (MAD)">
            <Input
              type="text"
              inputMode="decimal"
              value={formData.margin_amount}
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

        {pricingGuidance && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm font-semibold text-amber-900">
              Guidance marge ({formData.condition})
            </p>
            <p className="mt-1 text-xs text-amber-800">
              Marge conseillée: {pricingGuidance.minMargin.toLocaleString('fr-MA')} à {pricingGuidance.maxMargin.toLocaleString('fr-MA')} MAD
              {' · '}
              Prix conseillé: {pricingGuidance.minSellPrice.toLocaleString('fr-MA')} à {pricingGuidance.maxSellPrice.toLocaleString('fr-MA')} MAD
            </p>
            {pricingGuidance.currentMargin !== null && (
              <p
                className={`mt-2 text-xs font-medium ${
                  pricingGuidance.status === 'ok'
                    ? 'text-emerald-700'
                    : pricingGuidance.status === 'low'
                      ? 'text-red-700'
                      : pricingGuidance.status === 'high'
                        ? 'text-orange-700'
                        : 'text-amber-800'
                }`}
              >
                Marge actuelle: {pricingGuidance.currentMargin.toLocaleString('fr-MA')} MAD
                {pricingGuidance.status === 'ok' && ' (dans la plage conseillée)'}
                {pricingGuidance.status === 'low' && ' (en dessous de la plage conseillée)'}
                {pricingGuidance.status === 'high' && ' (au-dessus de la plage conseillée)'}
              </p>
            )}
          </div>
        )}
      </div>

      <Separator />

      {/* Preview card before publish */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Preview avant publication</h3>
        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-raised shadow-sm">
          <div className="grid gap-0 sm:grid-cols-[180px_1fr]">
            <div className="aspect-square sm:aspect-auto sm:h-full bg-slate-100">
              {previewImage ? (
                <img src={previewImage} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">No image</div>
              )}
            </div>
            <div className="space-y-2 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                  {formData.brand || 'Marque'}
                </span>
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                  formData.condition === 'Comme neuf'
                    ? 'border-orange-200 bg-orange-50 text-orange-700'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                }`}>
                  {formData.condition || 'Neuf'}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900">{formData.name || 'Nom du produit'}</p>
              <p className="text-xs text-slate-500">{previewSpecs || 'Processeur · RAM · Stockage'}</p>
              <p className="text-lg font-extrabold text-slate-900">
                {parsedPrice !== null ? formatPrice(parsedPrice) : 'Prix non défini'}
              </p>
              {formData.description && (
                <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                  {formData.description}
                </p>
              )}
            </div>
          </div>
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
