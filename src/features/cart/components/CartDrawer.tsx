import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, ShoppingBag, Trash2, Plus, Minus, Loader2, ArrowRight, Package } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { cn, formatPrice, getImageSrc } from '@/lib/utils'
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

  const cartProducts = items
    .map(item => ({ ...item, product: products.find(p => p.id === item.productId) }))
    .filter(i => i.product)

  const total = cartProducts.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0,
  )

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-[1100] bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 z-[1101] flex h-full w-full max-w-[400px] flex-col border-l border-border-faint bg-surface-base shadow-[-20px_0_60px_rgba(0,0,0,0.6)] transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-faint px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 ring-1 ring-amber-500/25">
              <ShoppingBag className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-none text-on-surface">Panier</h2>
              {items.length > 0 && (
                <p className="mt-0.5 text-[11px] text-on-surface-faint">
                  {items.length} article{items.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={closeCart}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle bg-surface-raised/60 text-on-surface-faint transition hover:bg-white/[0.08] hover:text-on-surface"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-on-surface-faint" />
            </div>
          )}

          {!isLoading && cartProducts.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-5 px-8 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border-faint bg-surface-raised/50">
                <Package className="h-8 w-8 text-on-surface-faint" />
              </div>
              <div>
                <h3 className="text-base font-bold text-on-surface">Votre panier est vide</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-on-surface-faint">
                  Découvrez notre sélection de laptops premium reconditionnés.
                </p>
              </div>
              <Button
                asChild
                onClick={closeCart}
                className="rounded-xl bg-amber-500 px-8 text-sm font-bold text-[#0a0f1a] shadow-lg shadow-amber-500/20 hover:bg-amber-400"
              >
                <Link to="/products">Explorer les laptops</Link>
              </Button>
            </div>
          )}

          {!isLoading && cartProducts.length > 0 && (
            <div className="space-y-1 px-4 py-3">
              {cartProducts.map(({ productId, quantity, product }) => {
                if (!product) return null
                const images =
                  product.product_images?.sort((a, b) => a.display_order - b.display_order) ?? []
                const image = images.find(i => i.is_primary) ?? images[0]
                const imageSrc = getImageSrc(image)

                return (
                  <div
                    key={productId}
                    className="group flex gap-3 rounded-2xl border border-transparent p-3 transition-colors hover:border-border-faint hover:bg-surface-raised/50"
                  >
                    {/* Product image */}
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border-faint bg-gradient-to-br from-surface-overlay to-surface-overlay p-2">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={product.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-xl font-black text-on-surface-faint">
                          {product.brand?.[0]}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-faint">
                        {product.brand}
                      </p>
                      <p className="line-clamp-2 text-sm font-semibold leading-snug text-on-surface">
                        {product.name}
                      </p>
                      <p className="text-sm font-extrabold tracking-tight text-amber-400">
                        {formatPrice(product.price * quantity)}
                      </p>

                      {/* Quantity + remove */}
                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex items-center rounded-lg border border-border-subtle bg-surface-raised/60">
                          <button
                            onClick={() => updateQuantity(productId, quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-l-lg text-on-surface-faint transition hover:bg-muted/50 hover:text-on-surface"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-on-surface">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(productId, quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-r-lg text-on-surface-faint transition hover:bg-muted/50 hover:text-on-surface"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(productId)}
                          className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-on-surface-faint opacity-0 transition hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
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
          <div className="border-t border-border-faint bg-surface-sunken px-5 py-5 space-y-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-on-surface-subtle">Sous-total</span>
              <span className="text-xl font-extrabold tracking-tight text-on-surface">
                {formatPrice(total)}
              </span>
            </div>
            <p className="text-[11px] text-on-surface-faint">
              Livraison et taxes calculées à la validation.
            </p>

            {/* Checkout CTA */}
            <Button className="h-12 w-full rounded-xl bg-amber-500 text-[15px] font-bold text-[#0a0f1a] shadow-lg shadow-amber-500/25 transition-all hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-amber-400/30 active:scale-95">
              Commander
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            {/* Continue shopping */}
            <button
              onClick={closeCart}
              className="w-full rounded-xl border border-border-subtle py-2.5 text-sm font-medium text-on-surface-subtle transition hover:border-border hover:text-on-surface-muted"
            >
              <Link to="/products" className="block w-full">
                Continuer les achats
              </Link>
            </button>
          </div>
        )}
      </div>
    </>
  )
}
