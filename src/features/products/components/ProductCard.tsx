import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, MessageCircle, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn, formatPrice, getImageSrc } from '@/lib/utils'
import type { ProductWithImages } from '@/types/database.types'
import { useCartStore } from '@/store/cartStore'
import { toast } from '@/hooks/use-toast'
import { WHATSAPP_URL, CONDITION_STYLES } from '@/lib/constants'
import { supabase } from '@/lib/supabase'
import { sendWhatsAppLead } from '@/features/products/services/leadCaptureService'

interface ProductCardProps {
  product: ProductWithImages
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [whatsappHref, setWhatsappHref] = useState(WHATSAPP_URL)
  const addItem = useCartStore(s => s.addItem)

  const images =
    product.product_images?.sort((a, b) => a.display_order - b.display_order) ?? []
  const primaryImage = images.find(i => i.is_primary) ?? images[0]
  const secondaryImage = images[1]
  const primarySrc = getImageSrc(primaryImage)
  const secondarySrc = getImageSrc(secondaryImage)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsAdding(true)
    try {
      await addItem(product.id, 1)
      toast({ title: 'Ajouté au panier', description: product.name })
    } catch {
      toast({ title: 'Erreur lors de l\'ajout', variant: 'destructive' })
    } finally {
      setIsAdding(false)
    }
  }

  const isOutOfStock = product.stock_quantity === 0
  const conditionStyle = product.condition ? CONDITION_STYLES[product.condition] : null

  const savings =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : null

  useEffect(() => {
    let cancelled = false
    const loadWhatsapp = async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'whatsapp_number')
        .maybeSingle()

      if (cancelled || error || !data?.value) return
      const digits = String(data.value).replace(/\D/g, '')
      if (!digits) return
      setWhatsappHref(`https://wa.me/${digits}`)
    }
    loadWhatsapp()
    return () => {
      cancelled = true
    }
  }, [])

  const handleWhatsAppClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isSending) return
    setIsSending(true)
    try {
      const productUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/products/${product.id}`
          : `/products/${product.id}`

      const result = await sendWhatsAppLead({
        product,
        quantity: 1,
        productUrl,
      })

      const url = result.whatsappUrl || whatsappHref
      window.open(url, '_blank', 'noreferrer')
    } catch {
      toast({ title: 'Impossible d\'ouvrir WhatsApp', variant: 'destructive' })
      window.open(whatsappHref, '_blank', 'noreferrer')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-white via-white to-[#f7f9fc] shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-[6px] hover:shadow-[0_16px_40px_rgba(15,23,42,0.12)] dark:border-slate-800 dark:from-[#0f172a] dark:via-[#0b1220] dark:to-[#070b14] dark:shadow-[0_10px_30px_rgba(0,0,0,0.65)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.8)]">

        {/* Image area */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#f2f5fb] via-white to-[#eef3ff] dark:from-[#121a2b] dark:via-[#0d1422] dark:to-[#0a0f1c]">
          {primarySrc ? (
            <>
              <img
                src={primarySrc}
                alt={product.name}
                className={cn(
                  'h-full w-full object-cover object-[50%_35%] transition-all duration-700 scale-[1.15] group-hover:scale-[1.22]',
                  isHovered && secondaryImage ? 'opacity-0' : 'opacity-100',
                )}
                loading="lazy"
              />
              {secondarySrc && (
                <img
                  src={secondarySrc}
                  alt={product.name}
                  className={cn(
                    'absolute inset-0 h-full w-full object-cover object-[50%_35%] transition-all duration-700 scale-[1.1]',
                    isHovered ? 'opacity-100 scale-[1.2]' : 'opacity-0 scale-100',
                  )}
                  loading="lazy"
                />
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-4xl font-black text-on-surface-faint">{product.brand?.[0]}</span>
            </div>
          )}

        {/* Simple tags top-right */}
        <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
          <Badge
            className={cn(
              'border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] shadow-sm backdrop-blur',
              conditionStyle?.className ??
                'bg-white/0 text-emerald-600 border-emerald-500/15 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20',
            )}
          >
            {conditionStyle ? conditionStyle.label : 'Neuf'}
          </Badge>
          {product.is_featured && (
            <Badge className="border border-sky-500/25 bg-sky-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-sky-600 shadow-sm backdrop-blur">
              Coup de cœur
            </Badge>
          )}
        </div>

          {/* Discount badge top-right */}
          {savings !== null && (
            <span className="absolute right-3 top-3 rounded-full bg-red-500/90 px-2 py-0.5 text-[11px] font-bold text-on-surface">
              -{savings}%
            </span>
          )}
        </div>

        {/* Card content */}
        <div className="flex flex-1 flex-col gap-3 p-4">
          {/* Brand + rating */}
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-faint dark:text-slate-400">
              {product.brand}
            </p>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.35)]" />
              <span className="text-[11px] font-semibold text-amber-500">4.8</span>
            </div>
          </div>

          {/* Name */}
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-on-surface transition-colors duration-200 group-hover:text-amber-500 dark:text-slate-100">
            {product.name}
          </h3>

          {/* Specs */}
          <p className="line-clamp-1 text-[11px] text-on-surface-faint dark:text-slate-400">
            {product.processor} · {product.ram} · {product.storage}
          </p>

          {/* Price */}
          <div className="mt-auto pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold tracking-tight text-on-surface dark:text-slate-50">
                {formatPrice(product.price)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-xs text-on-surface-faint line-through dark:text-slate-500">
                  {formatPrice(product.original_price)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-on-surface-faint dark:text-slate-400">TVA incluse · Paiement en 3x</p>
          </div>

          {/* Screen size */}
          {product.screen_size && (
            <span className="w-fit rounded-full border border-border-subtle bg-surface-raised/60 px-2.5 py-0.5 text-[11px] font-medium text-on-surface-faint dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
              {product.screen_size}
            </span>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAdding}
              className="flex-1 rounded-xl bg-amber-500 text-xs font-bold text-[#0a0f1a] shadow-md shadow-amber-500/20 hover:bg-amber-400 disabled:opacity-50"
            >
              <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
              {isAdding ? 'Ajout...' : 'Ajouter'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleWhatsAppClick}
              disabled={isSending}
              className="flex items-center gap-1 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-400 transition hover:bg-emerald-500/15 hover:text-emerald-300"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              {isSending ? '...' : 'WhatsApp'}
            </Button>
          </div>

          {/* Voir le produit - shows on hover */}
          <div
            className={cn(
              'overflow-hidden transition-all duration-300',
              isHovered ? 'max-h-10 opacity-100' : 'max-h-0 opacity-0',
            )}
          >
            <div className="flex items-center justify-center rounded-xl border border-border-subtle bg-surface-raised/60 py-2 text-xs font-semibold text-on-surface-subtle">
              Voir le produit →
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
