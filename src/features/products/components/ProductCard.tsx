import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Cpu, MemoryStick, HardDrive } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn, formatPrice } from '@/lib/utils'
import type { ProductWithImages } from '@/types/database.types'
import { useCartStore } from '@/store/cartStore'
import { toast } from '@/hooks/use-toast'

interface ProductCardProps {
  product: ProductWithImages
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const addItem = useCartStore(s => s.addItem)

  const images = product.product_images?.sort((a, b) => a.display_order - b.display_order) ?? []
  const primaryImage = images.find(i => i.is_primary) ?? images[0]
  const secondaryImage = images[1]

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsAdding(true)
    try {
      await addItem(product.id, 1)
      toast({ title: 'Added to cart', description: product.name, variant: 'default' })
    } catch {
      toast({ title: 'Failed to add to cart', variant: 'destructive' })
    } finally {
      setIsAdding(false)
    }
  }

  const isOutOfStock = product.stock_quantity === 0

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="rounded-xl border bg-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
          {primaryImage ? (
            <>
              <img
                src={primaryImage.image_url}
                alt={product.name}
                className={cn(
                  'w-full h-full object-cover transition-opacity duration-500',
                  isHovered && secondaryImage ? 'opacity-0' : 'opacity-100'
                )}
                loading="lazy"
              />
              {secondaryImage && (
                <img
                  src={secondaryImage.image_url}
                  alt={product.name}
                  className={cn(
                    'absolute inset-0 w-full h-full object-cover transition-opacity duration-500',
                    isHovered ? 'opacity-100' : 'opacity-0'
                  )}
                  loading="lazy"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <svg className="w-16 h-16 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.is_featured && (
              <Badge className="text-xs">Featured</Badge>
            )}
            {isOutOfStock && (
              <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
            )}
            {!isOutOfStock && product.stock_quantity <= 5 && (
              <Badge variant="warning" className="text-xs">Low Stock</Badge>
            )}
          </div>

          {/* Add to cart button */}
          <div className={cn(
            'absolute bottom-3 right-3 transition-all duration-300',
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          )}>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAdding}
              className="shadow-lg"
            >
              <ShoppingCart className="h-4 w-4" />
              {isAdding ? 'Adding...' : 'Add to Cart'}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{product.brand}</p>
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 mt-0.5 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </div>

          {/* Key specs */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Cpu className="h-3 w-3" />
              {product.processor}
            </span>
            <span className="flex items-center gap-1">
              <MemoryStick className="h-3 w-3" />
              {product.ram}
            </span>
            <span className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              {product.storage}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-lg font-bold text-slate-900">{formatPrice(product.price)}</span>
            {product.screen_size && (
              <span className="text-xs text-muted-foreground">{product.screen_size}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
