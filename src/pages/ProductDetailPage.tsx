import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, ShoppingCart, Minus, Plus, Cpu, MemoryStick, HardDrive,
  Monitor, Weight, Check, Truck, RotateCcw, Shield, ChevronRight,
  Tag, Star, MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useProduct } from '@/features/products/hooks/useProducts'
import { useCartStore } from '@/store/cartStore'
import { formatPrice, getImageSrc } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { sendWhatsAppLead } from '@/features/products/services/leadCaptureService'
import { useI18n } from '@/contexts/i18n'

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: product, isLoading, error } = useProduct(id)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [isOrderingOnWhatsApp, setIsOrderingOnWhatsApp] = useState(false)
  const { addItem, toggleCart } = useCartStore()
  const { t } = useI18n()

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-16 animate-pulse">
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-3xl" />
            <div className="flex gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-20 h-20 bg-gray-100 rounded-2xl" />
              ))}
            </div>
          </div>
          <div className="space-y-6 pt-4">
            <div className="h-4 bg-gray-100 rounded-full w-24" />
            <div className="h-10 bg-gray-100 rounded-xl w-3/4" />
            <div className="h-8 bg-gray-100 rounded-xl w-1/3" />
            <div className="h-20 bg-gray-100 rounded-xl" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-20 bg-gray-100 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Monitor className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-[#1d1d1f] dark:text-slate-100">{t('product.notFoundTitle')}</h2>
        <p className="text-gray-500 mt-2">
          {t('product.notFoundDesc')}
        </p>
        <Button asChild className="mt-6 rounded-full px-8">
          <Link to="/products">{t('product.browseAll')}</Link>
        </Button>
      </div>
    )
  }

  const images =
    product.product_images?.sort(
      (a, b) => a.display_order - b.display_order,
    ) ?? []
  const isOutOfStock = product.stock_quantity === 0

  const handleAddToCart = async () => {
    setIsAdding(true)
    try {
      await addItem(product.id, quantity)
      toast({
        title: t('toast.addedToCart'),
        description: `${quantity}x ${product.name}`,
      })
      toggleCart()
    } catch {
      toast({ title: 'Failed to add to cart', variant: 'destructive' })
    } finally {
      setIsAdding(false)
    }
  }

  const handleWhatsAppOrder = async () => {
    setIsOrderingOnWhatsApp(true)
    const result = await sendWhatsAppLead({
      product,
      quantity,
    })

    if (result.persisted) {
      toast({
        title: t('toast.whatsappOpened'),
        description: result.googleSynced
          ? t('toast.leadSynced')
          : t('toast.leadSavedOnly'),
      })
    } else {
      toast({
        title: t('toast.whatsappSaveFail'),
        description: result.errorMessage || t('toast.runMigration'),
        variant: 'destructive',
      })
    }
    setIsOrderingOnWhatsApp(false)
  }

  const specs = [
    { icon: Cpu, label: 'Processor', value: product.processor },
    { icon: MemoryStick, label: 'Memory', value: product.ram },
    { icon: HardDrive, label: 'Storage', value: product.storage },
    { icon: Monitor, label: 'Display', value: `${product.screen_size}` },
    { icon: Tag, label: 'Graphics', value: product.graphics_card },
    ...(product.weight
      ? [{ icon: Weight, label: 'Weight', value: product.weight }]
      : []),
  ]

  const perks = [
    { icon: Truck, text: t('product.perk.shipping') },
    { icon: RotateCcw, text: t('product.perk.returns') },
    { icon: Shield, text: t('product.perk.warranty') },
  ]

  const savings =
    product.original_price && product.original_price > product.price
      ? Math.round(
          ((product.original_price - product.price) / product.original_price) * 100,
        )
      : null

  const CONDITION_STYLES: Record<string, { label: string; color: string; bg: string }> = {
    'Like New': { label: 'Like New', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
    Excellent: { label: 'Excellent', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-100' },
    Good: { label: 'Good', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100' },
    Fair: { label: 'Fair', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' },
  }
  const conditionStyle = product.condition ? CONDITION_STYLES[product.condition] : null

  return (
    <div className="bg-white dark:bg-slate-950">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <nav className="flex items-center gap-1.5 text-sm text-gray-400">
          <Link
            to="/"
            className="hover:text-gray-600 transition-colors"
          >
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            to="/products"
            className="hover:text-gray-600 transition-colors"
          >
            Laptops
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-600 truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* ── Image gallery ── */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100 p-8 lg:p-12">
              {getImageSrc(images[selectedImage]) ? (
                <img
                  src={getImageSrc(images[selectedImage])!}
                  alt={product.name}
                  className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-16 bg-gray-200/60 rounded-2xl mx-auto flex items-center justify-center mb-3">
                      <span className="text-3xl font-black text-gray-300">
                        {product.brand?.[0]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{product.brand}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all duration-300 bg-gray-50 p-2 ${
                      selectedImage === i
                        ? 'border-blue-600 shadow-md shadow-blue-100'
                        : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    {getImageSrc(img) ? (
                      <img
                        src={getImageSrc(img)!}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        No image
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product info ── */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            {/* Brand + badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="secondary"
                className="rounded-full px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-600"
              >
                {product.brand}
              </Badge>
              {conditionStyle && (
                <Badge className={`rounded-full px-3 py-1 text-xs font-semibold border ${conditionStyle.bg} ${conditionStyle.color} hover:${conditionStyle.bg}`}>
                  <Star className="w-2.5 h-2.5 mr-1 fill-current" />
                  {conditionStyle.label}
                </Badge>
              )}
              {product.is_featured && (
                <Badge className="rounded-full px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-50">
                  Featured
                </Badge>
              )}
              {isOutOfStock ? (
                <Badge
                  variant="destructive"
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                >
                  Out of Stock
                </Badge>
              ) : product.stock_quantity <= 3 ? (
                <Badge className="rounded-full px-3 py-1 text-xs font-semibold bg-amber-50 text-amber-600 hover:bg-amber-50">
                  Only {product.stock_quantity} left
                </Badge>
              ) : (
                <Badge className="rounded-full px-3 py-1 text-xs font-semibold bg-emerald-50 text-emerald-600 hover:bg-emerald-50">
                  In Stock
                </Badge>
              )}
            </div>

            {/* Name */}
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1d1d1f] leading-tight tracking-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-4xl font-extrabold text-[#e63946] tracking-tight">
                  {formatPrice(product.price)}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-2xl font-medium text-gray-400 line-through">
                    {formatPrice(product.original_price)}
                  </span>
                )}
                {savings !== null && (
                  <span className="text-sm font-bold text-white bg-red-500 rounded-full px-3 py-1">
                    Vous économisez {savings}%
                  </span>
                )}
              </div>
              {product.original_price && product.original_price > product.price && (
                <p className="text-sm text-gray-500">
                  Vous gagnez {formatPrice(product.original_price - product.price)} par rapport au prix neuf.
                </p>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-gray-500 leading-relaxed text-[15px]">
                {product.description}
              </p>
            )}

            <Separator className="bg-gray-100" />

            {/* Spec cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {specs.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      {label}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#1d1d1f] leading-snug">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <Separator className="bg-gray-100" />

            {/* Quantity + Add to cart */}
            {!isOutOfStock && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-[#1d1d1f] dark:text-slate-100">
                    {t('product.quantity')}
                  </span>
                  <div className="flex items-center bg-gray-50 rounded-full border border-gray-200">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full hover:bg-gray-200"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <span className="w-10 text-center text-sm font-bold">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full hover:bg-gray-200"
                      onClick={() =>
                        setQuantity(q =>
                          Math.min(product.stock_quantity, q + 1),
                        )
                      }
                      disabled={quantity >= product.stock_quantity}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <span className="text-xs text-gray-400">
                    {product.stock_quantity} {t('product.available')}
                  </span>
                </div>

                <Button
                  size="lg"
                  className="w-full rounded-2xl h-14 text-base font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:shadow-xl hover:shadow-blue-600/25"
                  onClick={handleAddToCart}
                  disabled={isAdding}
                >
                  {isAdding ? (
                    t('product.adding')
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      {t('product.addToCart')} — {formatPrice(product.price * quantity)}
                    </>
                  )}
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="w-full rounded-2xl h-12 text-sm font-semibold border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  onClick={handleWhatsAppOrder}
                  disabled={isOrderingOnWhatsApp}
                >
                  {isOrderingOnWhatsApp ? (
                    t('product.whatsappOpening')
                  ) : (
                    <>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      {t('product.whatsappOrder')}
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Perks */}
            <div className="flex flex-col gap-3 pt-2">
              {perks.map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 text-sm text-gray-500"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-emerald-500" />
                  </div>
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Technical Specs Table */}
        {product.specifications && product.specifications.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-[#1d1d1f] dark:text-slate-100 mb-8">
              {t('product.techSpecs')}
            </h2>
            <div className="rounded-3xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {product.specifications.map((spec, i) => (
                    <tr
                      key={spec.id}
                      className={
                        i % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'
                      }
                    >
                      <td className="px-8 py-4 font-semibold text-gray-500 w-1/3">
                        {spec.spec_key}
                      </td>
                      <td className="px-8 py-4 text-[#1d1d1f]">
                        {spec.spec_value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="mt-16 pb-8">
          <Button
            variant="outline"
            asChild
            className="rounded-full px-6"
          >
            <Link to="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('product.backAll')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
