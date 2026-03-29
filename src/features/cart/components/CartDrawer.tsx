import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, ShoppingBag, Trash2, Plus, Minus, Loader2, ArrowRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
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
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full w-full max-w-[420px] z-50 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1d1d1f] flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-[#1d1d1f] text-lg leading-none">Cart</h2>
              {items.length > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeCart}
            className="rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-400" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
            </div>
          )}

          {!isLoading && cartProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-8">
              <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center">
                <ShoppingBag className="h-8 w-8 text-gray-300" />
              </div>
              <div>
                <h3 className="font-bold text-[#1d1d1f] text-lg">Your cart is empty</h3>
                <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">
                  Discover our collection of premium laptops and find your perfect match.
                </p>
              </div>
              <Button
                asChild
                onClick={closeCart}
                className="rounded-full px-8 h-11 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
              >
                <Link to="/products">Browse Laptops</Link>
              </Button>
            </div>
          )}

          {!isLoading && cartProducts.length > 0 && (
            <div className="px-6 py-4 space-y-1">
              {cartProducts.map(({ productId, quantity, product }) => {
                if (!product) return null
                const images = product.product_images?.sort((a, b) => a.display_order - b.display_order) ?? []
                const image = images.find(i => i.is_primary) ?? images[0]

                return (
                  <div
                    key={productId}
                    className="flex gap-4 p-3 rounded-2xl hover:bg-gray-50/80 transition-colors group"
                  >
                    {/* Image */}
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden shrink-0 border border-gray-100 p-2">
                      {image ? (
                        <img
                          src={image.image_url}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-lg font-bold text-gray-300">{product.brand?.[0]}</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        {product.brand}
                      </p>
                      <p className="text-sm font-semibold text-[#1d1d1f] leading-snug mt-0.5 line-clamp-2">
                        {product.name}
                      </p>
                      <p className="text-sm font-bold text-[#1d1d1f] mt-1.5">
                        {formatPrice(product.price * quantity)}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        {/* Quantity controls */}
                        <div className="flex items-center bg-gray-50 rounded-full border border-gray-200">
                          <button
                            onClick={() => updateQuantity(productId, quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                          >
                            <Minus className="h-3 w-3 text-gray-500" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-[#1d1d1f]">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(productId, quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                          >
                            <Plus className="h-3 w-3 text-gray-500" />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(productId)}
                          className="ml-auto w-7 h-7 flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
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
          <div className="border-t border-gray-100 px-6 py-5 space-y-4 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Subtotal</span>
              <span className="text-xl font-bold text-[#1d1d1f] tracking-tight">
                {formatPrice(total)}
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Shipping and taxes calculated at checkout.
            </p>

            <Button
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-[15px] font-semibold shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/25 transition-all"
            >
              Checkout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              className="w-full h-10 rounded-xl text-sm text-gray-500 hover:text-[#1d1d1f]"
              onClick={closeCart}
              asChild
            >
              <Link to="/products">Continue Shopping</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
