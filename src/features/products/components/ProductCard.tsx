import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Cpu, MemoryStick, HardDrive, MessageCircle, Star, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn, formatPrice } from '@/lib/utils'
import type { ProductWithImages } from '@/types/database.types'
import { useCartStore } from '@/store/cartStore'
import { toast } from '@/hooks/use-toast'

interface ProductCardProps {
  product: ProductWithImages
}

const CONDITION_STYLES: Record<string, { label: string; className: string; tone: 'recond' | 'new' }>= {
  'Like New': { label: 'Reconditionné+', className: 'bg-orange-50 text-orange-700 border-orange-100', tone: 'recond' },
  Excellent: { label: 'Reconditionné', className: 'bg-orange-50 text-orange-700 border-orange-100', tone: 'recond' },
  Good: { label: 'Reconditionné', className: 'bg-orange-50 text-orange-700 border-orange-100', tone: 'recond' },
  Fair: { label: 'Reconditionné', className: 'bg-orange-50 text-orange-700 border-orange-100', tone: 'recond' },
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const addItem = useCartStore(s => s.addItem)

  const images =
    product.product_images?.sort((a, b) => a.display_order - b.display_order) ??
    []
  const primaryImage = images.find(i => i.is_primary) ?? images[0]
  const secondaryImage = images[1]

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsAdding(true)
    try {
      await addItem(product.id, 1)
      toast({ title: 'Added to cart', description: product.name })
    } catch {
      toast({ title: 'Failed to add to cart', variant: 'destructive' })
    } finally {
      setIsAdding(false)
    }
  }

  const isOutOfStock = product.stock_quantity === 0
  const condition = product.condition
  const conditionStyle = condition ? CONDITION_STYLES[condition] : null

  // Savings calculation
  const savings =
    product.original_price && product.original_price > product.price
      ? Math.round(
          ((product.original_price - product.price) / product.original_price) *
            100,
        )
      : null

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="glass-card relative h-full overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_38px_rgb(15,23,42,0.16)]">
        {/* Image area */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#f8fbff] via-[#f4f8ff] to-[#eef5ff] p-6">
          {primaryImage ? (
            <>
              <img
                src={primaryImage.image_url}
                alt={product.name}
                className={cn(
                  'w-full h-full object-contain transition-all duration-700 group-hover:scale-105',
                  isHovered && secondaryImage ? 'opacity-0' : 'opacity-100',
                )}
                loading="lazy"
              />
              {secondaryImage && (
                <img
                  src={secondaryImage.image_url}
                  alt={product.name}
                  className={cn(
                    'absolute inset-6 w-[calc(100%-3rem)] h-[calc(100%-3rem)] object-contain transition-all duration-700',
                    isHovered
                      ? 'opacity-100 scale-105'
                      : 'opacity-0 scale-100',
                  )}
                  loading="lazy"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-20 h-14 rounded-xl bg-gray-200/60 flex items-center justify-center">
                <span className="text-2xl font-black text-gray-300">
                  {product.brand?.[0]}
                </span>
              </div>
            </div>
          )}

          {/* Top badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5">
            {conditionStyle && (
              <Badge className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${conditionStyle.className}`}>
                {conditionStyle.label}
              </Badge>
            )}
            {!conditionStyle && (
              <Badge className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500 text-white">
                Neuf
              </Badge>
            )}
            {product.is_featured && (
              <Badge className="bg-[#0f5dcf] hover:bg-[#0f5dcf] text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm">
                Coup de cœur
              </Badge>
            )}
          </div>

          {savings !== null && (
            <div className="absolute top-4 right-4">
              <span className="text-[11px] font-bold text-white bg-[#e63946] rounded-full px-2.5 py-1 shadow-sm">
                -{savings}%
              </span>
            </div>
          )}

          {/* Quick add button */}
          <div
            className={cn(
              'absolute bottom-4 right-4 transition-all duration-300',
              isHovered
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-3',
            )}
          >
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAdding}
              className="rounded-full shadow-lg bg-[#0f5dcf] hover:bg-[#0a4dad] text-white px-4 h-9 text-xs font-semibold"
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
              {isAdding ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </div>

        {/* Content */}
          <div className="p-5 space-y-3">
          {/* Brand + Name + Condition */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] font-semibold text-[#617084] uppercase tracking-wider">
                {product.brand}
              </p>
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="h-3 w-3 fill-amber-400" />
                <span className="text-[11px] font-semibold">4.8</span>
              </div>
            </div>
            <h3 className="font-semibold text-[15px] text-[#1d1d1f] leading-snug mt-0.5 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
              {product.name}
            </h3>
          </div>

          {/* Spec pills */}
          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-gray-50 rounded-full px-2.5 py-1 border border-gray-100">
              <Cpu className="h-2.5 w-2.5" />
              {product.processor}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-gray-50 rounded-full px-2.5 py-1 border border-gray-100">
              <MemoryStick className="h-2.5 w-2.5" />
              {product.ram}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-gray-50 rounded-full px-2.5 py-1 border border-gray-100">
              <HardDrive className="h-2.5 w-2.5" />
              {product.storage}
            </span>
          </div>

          {/* Price row */}
          <div className="flex items-end justify-between pt-1">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-[#e63946] tracking-tight">
                  {formatPrice(product.price)}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(product.original_price)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400">TVA incluse · Paiement en 3x</p>
            </div>
            {product.screen_size && (
              <span className="text-[11px] font-medium text-gray-400 bg-gray-50 rounded-full px-2 py-0.5">
                {product.screen_size}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAdding}
              className="rounded-full bg-[#0f5dcf] hover:bg-[#0a4dad] text-white px-4 h-9 text-xs font-semibold"
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
              {isAdding ? 'Ajout...' : 'Ajouter'}
            </Button>
            <a
              href="https://wa.me/212612345678"
              onClick={e => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-600 hover:text-emerald-700"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>

        {/* Hover view button */}
        <div className={cn(
          'pointer-events-none absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/45 to-transparent opacity-0 transition-opacity duration-300',
          isHovered && 'opacity-100'
        )}>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-[#0f172a] shadow-lg">
            <Eye className="h-4 w-4" /> Voir le produit
          </span>
        </div>
      </div>
    </Link>
  )
}
