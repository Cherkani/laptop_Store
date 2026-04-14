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
import { trackEvent } from '@/features/analytics/services/eventTrackingService'

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
      void trackEvent({
        eventType: 'add_to_cart',
        productId: product.id,
        productName: product.name,
        metadata: { source: 'product_card', quantity: 1 },
      })
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
  const inlineSpecs = [product.processor, product.ram, product.storage].filter(Boolean).join(' · ')

  useEffect(() => {
    let cancelled = false
    const loadWhatsapp = async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', ['whatsapp_number_primary', 'whatsapp_number_secondary', 'whatsapp_number'])

      if (cancelled || error || !data) return
      const map = new Map(data.map(item => [item.key, item.value || '']))
      const resolvedWhatsapp =
        map.get('whatsapp_number_primary') ||
        map.get('whatsapp_number') ||
        map.get('whatsapp_number_secondary') ||
        ''
      if (!resolvedWhatsapp) return
      const digits = String(resolvedWhatsapp).replace(/\D/g, '')
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

      const result = await sendWhatsAppLead({ product, quantity: 1, productUrl })
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
      onClick={() => {
        void trackEvent({
          eventType: 'product_card_click',
          productId: product.id,
          productName: product.name,
          metadata: { source: 'product_grid' },
        })
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface-raised shadow-[0_2px_16px_hsl(var(--foreground)/0.06)] transition-all duration-250 hover:-translate-y-[5px] hover:shadow-[0_14px_36px_hsl(var(--foreground)/0.11)]">

        {/* Image area */}
        <div className="relative aspect-square overflow-hidden bg-surface-sunken">
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
            <span className="absolute right-3 top-3 rounded-full bg-red-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
              -{savings}%
            </span>
          )}
        </div>

        {/* Card content */}
        <div className="flex flex-1 flex-col gap-3 p-4">
          {/* Brand + rating */}
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-faint">
              {product.brand}
            </p>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.35)]" />
              <span className="text-[11px] font-semibold text-amber-500">4.8</span>
            </div>
          </div>

          {/* Name */}
          <h3 className="line-clamp-2 text-sm font-bold leading-snug tracking-[-0.01em] text-on-surface transition-colors duration-200 group-hover:text-amber-500">
            {product.name}
          </h3>

          {/* Specs */}
          <p className="line-clamp-1 text-[11px] text-on-surface-faint">
            {inlineSpecs || 'Configuration à préciser'}
          </p>

          {/* Price */}
          <div className="mt-auto pt-1">
            <div className="flex items-baseline gap-2">
              <span className="num text-xl font-extrabold tracking-[-0.02em] text-on-surface">
                {formatPrice(product.price)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="num text-xs text-on-surface-faint line-through">
                  {formatPrice(product.original_price)}
                </span>
              )}
            </div>
          </div>

          {/* Screen size */}
          {product.screen_size && (
            <span className="w-fit rounded-full border border-border-subtle bg-surface-sunken px-2.5 py-0.5 text-[11px] font-medium text-on-surface-subtle">
              {product.screen_size}
            </span>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAdding}
              className="flex-1 rounded-xl bg-amber-500 text-xs font-bold text-on-primary shadow-md shadow-amber-500/20 hover:bg-amber-400 disabled:opacity-50"
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

        </div>
      </div>

    </Link>
  )
}
