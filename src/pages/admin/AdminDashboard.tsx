import { Link } from 'react-router-dom'
import { Package, Plus, Star, Tag, ArrowRight, Edit, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAdminProducts } from '@/features/admin/hooks/useAdminProducts'
import { formatPrice } from '@/lib/utils'
import type { Product, ProductImage } from '@/types/database.types'

type AdminProduct = Product & { product_images: ProductImage[] }

export function AdminDashboard() {
  const { data: rawProducts = [], isLoading } = useAdminProducts()
  const products = rawProducts as AdminProduct[]

  const totalProducts = products.length
  const totalStock   = products.reduce((s, p) => s + p.stock_quantity, 0)
  const featured     = products.filter(p => p.is_featured).length
  const avgPrice     = totalProducts > 0
    ? products.reduce((s, p) => s + p.price, 0) / totalProducts
    : 0

  const brandMap = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.brand] = (acc[p.brand] ?? 0) + 1
    return acc
  }, {})
  const topBrands    = Object.entries(brandMap).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const maxBrandCount = topBrands[0]?.[1] ?? 1

  const stats = [
    { label: 'Total Products', value: isLoading ? null : totalProducts,              icon: Package, accent: 'blue'   },
    { label: 'Units in Stock',  value: isLoading ? null : totalStock,                icon: Tag,     accent: 'emerald'},
    { label: 'Featured',        value: isLoading ? null : featured,                  icon: Star,    accent: 'amber'  },
    { label: 'Average Price',   value: isLoading ? null : formatPrice(avgPrice),     icon: BarChart3, accent: 'purple'},
  ]

  const accentClasses: Record<string, { icon: string; dot: string; bar: string }> = {
    blue:    { icon: 'text-blue-600 bg-blue-50',    dot: 'bg-blue-500',    bar: 'bg-blue-500'    },
    emerald: { icon: 'text-emerald-600 bg-emerald-50', dot: 'bg-emerald-500', bar: 'bg-emerald-500' },
    amber:   { icon: 'text-amber-600 bg-amber-50',  dot: 'bg-amber-500',   bar: 'bg-amber-500'   },
    purple:  { icon: 'text-purple-600 bg-purple-50', dot: 'bg-purple-500', bar: 'bg-purple-500'  },
  }

  const recentProducts = [...products]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 7)

  return (
    <div className="p-6 lg:p-8 space-y-7 bg-slate-50 min-h-full">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Your store overview</p>
        </div>
        <Button asChild size="sm">
          <Link to="/admin/products?action=new">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => {
          const cls = accentClasses[stat.accent]
          return (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stat.label}</p>
                    {isLoading
                      ? <div className="mt-2 h-7 w-20 bg-slate-100 rounded animate-pulse" />
                      : <p className="mt-1.5 text-2xl font-bold text-slate-900 truncate">{stat.value}</p>
                    }
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cls.icon}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main content area */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Catalog table — 2/3 width */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between py-4 px-5 border-b">
            <CardTitle className="text-sm font-semibold text-slate-900">Recent Products</CardTitle>
            <Button variant="ghost" size="sm" asChild className="h-7 text-xs text-slate-500 hover:text-slate-900">
              <Link to="/admin/products">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-5 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-11 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
                  <Package className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-700">No products yet</p>
                <p className="text-xs text-slate-400 mt-1">Add your first laptop to get started</p>
                <Button asChild size="sm" className="mt-4">
                  <Link to="/admin/products?action=new">
                    <Plus className="h-4 w-4 mr-1.5" /> Add Product
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentProducts.map(product => {
                  const img = product.product_images?.find(x => x.is_primary) ?? product.product_images?.[0]
                  const stockColor =
                    product.stock_quantity === 0 ? 'text-red-500'
                    : product.stock_quantity <= 5 ? 'text-amber-500'
                    : 'text-slate-700'
                  return (
                    <div key={product.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 group transition-colors">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        {img
                          ? <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{product.name}</p>
                        <p className="text-xs text-slate-400">{product.brand} · {product.processor}</p>
                      </div>
                      <div className="text-right shrink-0 hidden sm:block">
                        <p className="text-sm font-semibold text-slate-900">{formatPrice(product.price)}</p>
                        <p className={`text-xs font-medium ${stockColor}`}>
                          {product.stock_quantity === 0 ? 'Out of stock' : `${product.stock_quantity} in stock`}
                        </p>
                      </div>
                      {product.is_featured && (
                        <Badge className="text-[10px] h-5 hidden sm:flex">Featured</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        asChild
                      >
                        <Link to={`/admin/products?action=edit&id=${product.id}`}>
                          <Edit className="h-3.5 w-3.5 text-slate-500" />
                        </Link>
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Brand breakdown — 1/3 width */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="py-4 px-5 border-b">
            <CardTitle className="text-sm font-semibold text-slate-900">By Brand</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="h-3 bg-slate-100 rounded w-24 animate-pulse" />
                    <div className="h-2 bg-slate-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : topBrands.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No data yet</p>
            ) : (
              <div className="space-y-4">
                {topBrands.map(([brand, count], i) => {
                  const barColors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500']
                  return (
                    <div key={brand}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-slate-700">{brand}</span>
                        <span className="text-xs text-slate-400">
                          {count} · {totalProducts > 0 ? Math.round((count / totalProducts) * 100) : 0}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${barColors[i % barColors.length]} rounded-full transition-all duration-700`}
                          style={{ width: `${(count / maxBrandCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
