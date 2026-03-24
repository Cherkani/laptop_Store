import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, Minus, Plus, Cpu, MemoryStick, HardDrive, Monitor, Weight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useProduct } from '@/features/products/hooks/useProducts'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: product, isLoading, error } = useProduct(id)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const { addItem, toggleCart } = useCartStore()

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-12 animate-pulse">
          <div className="space-y-4">
            <div className="aspect-[4/3] bg-slate-100 rounded-xl" />
            <div className="flex gap-2">
              {[1,2,3].map(i => <div key={i} className="w-20 h-20 bg-slate-100 rounded-lg" />)}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-8 bg-slate-100 rounded w-3/4" />
            <div className="h-6 bg-slate-100 rounded w-1/4" />
            <div className="h-24 bg-slate-100 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Product not found</h2>
        <Button asChild className="mt-4"><Link to="/products">Back to Laptops</Link></Button>
      </div>
    )
  }

  const images = product.product_images?.sort((a, b) => a.display_order - b.display_order) ?? []
  const isOutOfStock = product.stock_quantity === 0

  const handleAddToCart = async () => {
    setIsAdding(true)
    try {
      await addItem(product.id, quantity)
      toast({ title: 'Added to cart', description: `${quantity}x ${product.name}`, variant: 'default' })
      toggleCart()
    } catch {
      toast({ title: 'Failed to add to cart', variant: 'destructive' })
    } finally {
      setIsAdding(false)
    }
  }

  const specs = [
    { icon: Cpu, label: 'Processor', value: product.processor },
    { icon: MemoryStick, label: 'RAM', value: product.ram },
    { icon: HardDrive, label: 'Storage', value: product.storage },
    { icon: Monitor, label: 'Screen', value: `${product.screen_size} Display` },
    { icon: Weight, label: 'Weight', value: product.weight ?? 'N/A' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-foreground transition-colors">Laptops</Link>
        <span>/</span>
        <span className="text-foreground truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-50 border">
            {images[selectedImage] ? (
              <img
                src={images[selectedImage].image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <svg className="w-24 h-24 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-colors ${
                    selectedImage === i ? 'border-blue-600' : 'border-transparent'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{product.brand}</Badge>
              {product.is_featured && <Badge>Featured</Badge>}
              {isOutOfStock ? (
                <Badge variant="destructive">Out of Stock</Badge>
              ) : product.stock_quantity <= 5 ? (
                <Badge variant="warning">Only {product.stock_quantity} left</Badge>
              ) : (
                <Badge variant="success">In Stock</Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">{product.name}</h1>
          </div>

          <div className="text-3xl font-extrabold text-slate-900">{formatPrice(product.price)}</div>

          {product.description && (
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          )}

          <Separator />

          {/* Quick specs */}
          <div className="grid grid-cols-2 gap-3">
            {specs.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                <Icon className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium text-slate-900 leading-tight">{value}</p>
                </div>
              </div>
            ))}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
              <Monitor className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Graphics</p>
                <p className="text-sm font-medium text-slate-900 leading-tight">{product.graphics_card}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Quantity + Add to cart */}
          {!isOutOfStock && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-900">Quantity</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}
                    disabled={quantity >= product.stock_quantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">{product.stock_quantity} available</span>
              </div>
              <Button
                size="lg"
                className="w-full"
                onClick={handleAddToCart}
                disabled={isAdding}
              >
                {isAdding ? (
                  'Adding...'
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart — {formatPrice(product.price * quantity)}
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Perks */}
          <div className="space-y-2 pt-2">
            {['Free shipping on this order', '30-day return policy', '2-year manufacturer warranty'].map(perk => (
              <div key={perk} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                {perk}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional specs */}
      {product.specifications && product.specifications.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Technical Specifications</h2>
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {product.specifications.map((spec, i) => (
                  <tr key={spec.id} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                    <td className="px-6 py-3 font-medium text-slate-700 w-1/3">{spec.spec_key}</td>
                    <td className="px-6 py-3 text-slate-600">{spec.spec_value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Back link */}
      <div className="mt-12">
        <Button variant="outline" asChild>
          <Link to="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Laptops
          </Link>
        </Button>
      </div>
    </div>
  )
}
