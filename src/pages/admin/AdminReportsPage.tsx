import { useState } from 'react'
import { BarChart3, Package, Tag, TrendingUp, TrendingDown, Layers, Star, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAdminProducts } from '@/features/admin/hooks/useAdminProducts'
import { formatPrice } from '@/lib/utils'
import type { Product, ProductImage } from '@/types/database.types'

type AdminProduct = Product & { product_images: ProductImage[] }

function StatRow({ label, value, sub, color = 'text-slate-900' }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div>
        <span className="text-sm text-slate-700">{label}</span>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
      <span className={`text-sm font-bold ${color}`}>{value}</span>
    </div>
  )
}

function BarRow({ label, value, max, color = 'bg-blue-500', sub }: { label: string; value: number; max: number; color?: string; sub?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-700 truncate max-w-[60%]">{label}</span>
        <span className="text-xs text-muted-foreground">{sub ?? value}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function exportCSV(products: AdminProduct[]) {
  const header = ['Name', 'Brand', 'Processor', 'RAM', 'Storage', 'Graphics', 'Screen', 'Price (MAD)', 'Stock', 'Featured']
  const rows = products.map(p => [
    `"${p.name}"`, p.brand, p.processor, p.ram, p.storage, p.graphics_card, p.screen_size,
    p.price, p.stock_quantity, p.is_featured ? 'Yes' : 'No'
  ])
  const csv = [header, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `laptopstore-inventory-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function AdminReportsPage() {
  const { data: rawProducts = [], isLoading } = useAdminProducts()
  const products = rawProducts as AdminProduct[]

  // Summary stats
  const totalProducts = products.length
  const totalStock = products.reduce((s, p) => s + p.stock_quantity, 0)
  const inventoryValue = products.reduce((s, p) => s + p.price * p.stock_quantity, 0)
  const avgPrice = totalProducts > 0 ? products.reduce((s, p) => s + p.price, 0) / totalProducts : 0
  const minPrice = totalProducts > 0 ? Math.min(...products.map(p => p.price)) : 0
  const maxPrice = totalProducts > 0 ? Math.max(...products.map(p => p.price)) : 0
  const featuredCount = products.filter(p => p.is_featured).length
  const outOfStockCount = products.filter(p => p.stock_quantity === 0).length
  const lowStockCount = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5).length
  const healthyCount = products.filter(p => p.stock_quantity > 5).length

  // Brand analytics
  const brandStats = Object.entries(
    products.reduce<Record<string, { count: number; totalValue: number; totalStock: number }>>((acc, p) => {
      if (!acc[p.brand]) acc[p.brand] = { count: 0, totalValue: 0, totalStock: 0 }
      acc[p.brand].count++
      acc[p.brand].totalValue += p.price * p.stock_quantity
      acc[p.brand].totalStock += p.stock_quantity
      return acc
    }, {})
  ).sort((a, b) => b[1].count - a[1].count)
  const maxBrandCount = brandStats[0]?.[1].count ?? 1

  // Processor analytics
  const processorStats = Object.entries(
    products.reduce<Record<string, number>>((acc, p) => { acc[p.processor] = (acc[p.processor] ?? 0) + 1; return acc }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const maxProcCount = processorStats[0]?.[1] ?? 1

  // RAM analytics
  const ramStats = Object.entries(
    products.reduce<Record<string, number>>((acc, p) => { acc[p.ram] = (acc[p.ram] ?? 0) + 1; return acc }, {})
  ).sort((a, b) => b[1] - a[1])
  const maxRamCount = ramStats[0]?.[1] ?? 1

  // Storage analytics
  const storageStats = Object.entries(
    products.reduce<Record<string, number>>((acc, p) => { acc[p.storage] = (acc[p.storage] ?? 0) + 1; return acc }, {})
  ).sort((a, b) => b[1] - a[1])
  const maxStorageCount = storageStats[0]?.[1] ?? 1

  // Price tiers
  const budget = products.filter(p => p.price < 5000)
  const mid = products.filter(p => p.price >= 5000 && p.price < 15000)
  const premium = products.filter(p => p.price >= 15000)

  // Top & bottom products
  const sortedByPrice = [...products].sort((a, b) => b.price - a.price)
  const top5 = sortedByPrice.slice(0, 5)
  const bottom5 = sortedByPrice.slice(-5).reverse()

  // Highest stock
  const topStock = [...products].sort((a, b) => b.stock_quantity - a.stock_quantity).slice(0, 5)

  const Skeleton = () => (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-8 bg-slate-100 rounded" />)}
    </div>
  )

  return (
    <div className="p-6 lg:p-8 space-y-8 bg-slate-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Inventory insights and product performance</p>
        </div>
        <Button variant="outline" onClick={() => exportCSV(products)} disabled={isLoading || products.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: totalProducts, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Stock Units', value: totalStock, icon: Layers, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Inventory Value', value: formatPrice(inventoryValue), icon: Tag, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Featured', value: featuredCount, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{isLoading ? '...' : s.value}</p>
                </div>
                <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pricing + Stock Health */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pricing Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pricing Summary</CardTitle>
            <CardDescription>Price range and averages across catalog</CardDescription>
          </CardHeader>
          <CardContent className="divide-y">
            {isLoading ? <Skeleton /> : (
              <>
                <StatRow label="Average Price" value={formatPrice(avgPrice)} />
                <StatRow label="Lowest Price" value={formatPrice(minPrice)} color="text-emerald-600" />
                <StatRow label="Highest Price" value={formatPrice(maxPrice)} color="text-red-600" />
                <StatRow label="Budget (< 5,000 MAD)" value={`${budget.length} products`} sub={`${totalProducts > 0 ? Math.round(budget.length / totalProducts * 100) : 0}% of catalog`} />
                <StatRow label="Mid-range (5k–15k MAD)" value={`${mid.length} products`} sub={`${totalProducts > 0 ? Math.round(mid.length / totalProducts * 100) : 0}% of catalog`} />
                <StatRow label="Premium (> 15,000 MAD)" value={`${premium.length} products`} sub={`${totalProducts > 0 ? Math.round(premium.length / totalProducts * 100) : 0}% of catalog`} />
              </>
            )}
          </CardContent>
        </Card>

        {/* Stock Health */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stock Health</CardTitle>
            <CardDescription>Inventory status across all products</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? <Skeleton /> : (
              <>
                {[
                  { label: 'Healthy (> 5 units)', count: healthyCount, color: 'bg-emerald-500', badge: 'success' as const },
                  { label: 'Low Stock (1–5 units)', count: lowStockCount, color: 'bg-amber-500', badge: 'warning' as const },
                  { label: 'Out of Stock (0 units)', count: outOfStockCount, color: 'bg-red-500', badge: 'destructive' as const },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${s.color} shrink-0`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-700">{s.label}</span>
                        <Badge variant={s.badge} className="text-xs">{s.count}</Badge>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full">
                        <div className={`h-full ${s.color} rounded-full`} style={{ width: totalProducts > 0 ? `${(s.count / totalProducts) * 100}%` : '0%' }} />
                      </div>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Stock availability rate</span>
                  <span className="font-bold text-slate-900">
                    {totalProducts > 0 ? Math.round(((totalProducts - outOfStockCount) / totalProducts) * 100) : 0}%
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Brand Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Brand Analytics</CardTitle>
          <CardDescription>Product count and inventory value by brand</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton /> : brandStats.length === 0
            ? <p className="text-sm text-muted-foreground text-center py-8">No products yet</p>
            : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase tracking-wide text-slate-500 bg-slate-50">
                    <tr>
                      <th className="text-left px-4 py-2.5">Brand</th>
                      <th className="text-left px-4 py-2.5">Products</th>
                      <th className="text-left px-4 py-2.5">Units in Stock</th>
                      <th className="text-left px-4 py-2.5">Inventory Value</th>
                      <th className="text-left px-4 py-2.5">Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {brandStats.map(([brand, s]) => (
                      <tr key={brand} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{brand}</td>
                        <td className="px-4 py-3 text-muted-foreground">{s.count}</td>
                        <td className="px-4 py-3 text-muted-foreground">{s.totalStock}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900">{formatPrice(s.totalValue)}</td>
                        <td className="px-4 py-3 w-40">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(s.count / maxBrandCount) * 100}%` }} />
                            </div>
                            <span className="text-xs text-muted-foreground w-7">{Math.round((s.count / totalProducts) * 100)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </CardContent>
      </Card>

      {/* Specs breakdown */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Processor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By Processor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? <Skeleton /> : processorStats.map(([proc, count]) => (
              <BarRow key={proc} label={proc} value={count} max={maxProcCount} color="bg-indigo-500" sub={`${count} product${count !== 1 ? 's' : ''}`} />
            ))}
          </CardContent>
        </Card>

        {/* RAM */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By RAM</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? <Skeleton /> : ramStats.map(([ram, count]) => (
              <BarRow key={ram} label={ram} value={count} max={maxRamCount} color="bg-cyan-500" sub={`${count} product${count !== 1 ? 's' : ''}`} />
            ))}
          </CardContent>
        </Card>

        {/* Storage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By Storage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? <Skeleton /> : storageStats.map(([storage, count]) => (
              <BarRow key={storage} label={storage} value={count} max={maxStorageCount} color="bg-violet-500" sub={`${count} product${count !== 1 ? 's' : ''}`} />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top & Bottom by price + Top stock */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Most expensive */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              Most Expensive
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {isLoading ? <Skeleton /> : top5.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 py-2.5">
                <span className="text-xs font-bold text-muted-foreground w-4">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.brand}</p>
                </div>
                <span className="text-sm font-bold text-slate-900 shrink-0">{formatPrice(p.price)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Most affordable */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-emerald-500" />
              Most Affordable
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {isLoading ? <Skeleton /> : bottom5.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 py-2.5">
                <span className="text-xs font-bold text-muted-foreground w-4">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.brand}</p>
                </div>
                <span className="text-sm font-bold text-emerald-600 shrink-0">{formatPrice(p.price)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Highest stock */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-500" />
              Highest Stock
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {isLoading ? <Skeleton /> : topStock.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 py-2.5">
                <span className="text-xs font-bold text-muted-foreground w-4">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.brand}</p>
                </div>
                <Badge variant="success" className="text-xs shrink-0">{p.stock_quantity} units</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Full inventory table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Full Inventory</CardTitle>
            <CardDescription>All {totalProducts} products with complete details</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => exportCSV(products)} disabled={products.length === 0}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading
            ? <div className="p-6"><Skeleton /></div>
            : products.length === 0
            ? <p className="text-sm text-center text-muted-foreground py-10">No products in inventory</p>
            : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide">
                    <tr>
                      {['Name', 'Brand', 'Processor', 'RAM', 'Storage', 'Price', 'Stock', 'Value', 'Status'].map(h => (
                        <th key={h} className="text-left px-4 py-2.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-medium text-slate-900 max-w-[160px] truncate">{p.name}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{p.brand}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{p.processor}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{p.ram}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{p.storage}</td>
                        <td className="px-4 py-2.5 font-semibold text-slate-900">{formatPrice(p.price)}</td>
                        <td className="px-4 py-2.5">
                          <span className={`font-bold ${p.stock_quantity === 0 ? 'text-red-500' : p.stock_quantity <= 5 ? 'text-amber-500' : 'text-emerald-600'}`}>
                            {p.stock_quantity}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-700">{formatPrice(p.price * p.stock_quantity)}</td>
                        <td className="px-4 py-2.5">
                          {p.stock_quantity === 0
                            ? <Badge variant="destructive" className="text-xs">Out</Badge>
                            : p.stock_quantity <= 5
                            ? <Badge variant="warning" className="text-xs">Low</Badge>
                            : <Badge variant="success" className="text-xs">OK</Badge>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </CardContent>
      </Card>
    </div>
  )
}
