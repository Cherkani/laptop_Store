import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, ShoppingBag, Trash2, Plus, Minus, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn, formatPrice } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { supabase } from '@/lib/supabase'
import type { ProductWithImages } from '@/types/database.types'

function useCartProducts(productIds: string[]) {
  return useQuery({
    queryKey: ['cart-products', productIds],
    queryFn: async () => {
      if (productIds.length === 0) return []
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*)')
        .in('id', productIds)
      if (error) throw error
      return (data as ProductWithImages[]) ?? []
    },
    enabled: productIds.length > 0,
  })
}

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore()
  const productIds = items.map(i => i.productId)
  const { data: products = [], isLoading } = useCartProducts(productIds)

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const cartProducts = items.map(item => ({
    ...item,
    product: products.find(p => p.id === item.productId),
  })).filter(i => i.product)

  const total = cartProducts.reduce((sum, item) => sum + (item.product?.price ?? 0) * item.quantity, 0)

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full w-full max-w-md z-50 bg-background shadow-2xl flex flex-col transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart
            {items.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">({items.length} items)</span>
            )}
          </h2>
          <Button variant="ghost" size="icon" onClick={closeCart}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && cartProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <ShoppingBag className="h-8 w-8 text-slate-400" />
              </div>
              <div>
                <h3 className="font-semibold">Your cart is empty</h3>
                <p className="text-sm text-muted-foreground mt-1">Browse our laptops to find your perfect match</p>
              </div>
              <Button asChild onClick={closeCart}>
                <Link to="/products">Browse Laptops</Link>
              </Button>
            </div>
          )}

          {!isLoading && cartProducts.length > 0 && (
            <div className="space-y-4">
              {cartProducts.map(({ productId, quantity, product }) => {
                if (!product) return null
                const images = product.product_images?.sort((a, b) => a.display_order - b.display_order) ?? []
                const image = images.find(i => i.is_primary) ?? images[0]

                return (
                  <div key={productId} className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg bg-slate-50 overflow-hidden shrink-0">
                      {image ? (
                        <img src={image.image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-100" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{product.brand}</p>
                      <p className="text-sm font-medium line-clamp-2 leading-snug">{product.name}</p>
                      <p className="text-sm font-bold text-slate-900 mt-1">{formatPrice(product.price)}</p>

                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(productId, quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-6 text-center">{quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(productId, quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive ml-auto"
                          onClick={() => removeItem(productId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartProducts.length > 0 && (
          <div className="border-t px-6 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-bold text-lg">{formatPrice(total)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Shipping and taxes calculated at checkout</p>
            <Separator />
            <Button className="w-full" size="lg">
              Proceed to Checkout
            </Button>
            <Button variant="outline" className="w-full" onClick={closeCart} asChild>
              <Link to="/products">Continue Shopping</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
