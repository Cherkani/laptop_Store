import { useMemo, useState } from 'react'
import { CheckCircle2, MessageCircle, Plus, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAdminProducts } from '@/features/admin/hooks/useAdminProducts'
import {
  useCreateSalesRecord,
  useSalesRecords,
  useUpdateSalesStatus,
} from '@/features/admin/hooks/useBackoffice'
import { formatPrice } from '@/lib/utils'
import type { Product, ProductImage } from '@/types/database.types'

type AdminProduct = Product & { product_images: ProductImage[] }

function statusClass(status: string) {
  if (status === 'sold') return 'bg-emerald-100 text-emerald-700'
  if (status === 'paid') return 'bg-blue-100 text-blue-700'
  if (status === 'quoted') return 'bg-violet-100 text-violet-700'
  if (status === 'cancelled' || status === 'lost') return 'bg-red-100 text-red-700'
  return 'bg-slate-100 text-slate-700'
}

export function AdminSalesPage() {
  const { data: rawProducts = [] } = useAdminProducts()
  const products = rawProducts as AdminProduct[]

  const { data: records = [], isLoading } = useSalesRecords()
  const createRecord = useCreateSalesRecord()
  const updateStatus = useUpdateSalesStatus()

  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('1')

  const selectedProduct = useMemo(
    () => products.find(p => p.id === productId),
    [products, productId],
  )

  const qty = Math.max(1, Number(quantity) || 1)
  const computedTotal = selectedProduct ? selectedProduct.price * qty : 0

  const handleCreate = async () => {
    if (!selectedProduct) return

    const primaryImage = selectedProduct.product_images?.find(i => i.is_primary) ?? selectedProduct.product_images?.[0]

    await createRecord.mutateAsync({
      client_name: clientName || null,
      client_phone: clientPhone || null,
      client_whatsapp: clientPhone || null,
      source: 'whatsapp',
      lead_title: selectedProduct.name,
      lead_message: `Incoming WhatsApp lead for ${selectedProduct.name}`,
      status: 'new',
      subtotal: computedTotal,
      total: computedTotal,
      image_url: primaryImage?.image_url ?? null,
      product_snapshot: [
        {
          product_id: selectedProduct.id,
          name: selectedProduct.name,
          brand: selectedProduct.brand,
          quantity: qty,
          unit_price: selectedProduct.price,
          image_url: primaryImage?.image_url ?? null,
        },
      ],
      items: [
        {
          product_id: selectedProduct.id,
          product_name: selectedProduct.name,
          image_url: primaryImage?.image_url ?? null,
          quantity: qty,
          unit_price: selectedProduct.price,
        },
      ],
    })

    setClientName('')
    setClientPhone('')
    setProductId('')
    setQuantity('1')
  }

  return (
    <div className="p-6 lg:p-8 bg-slate-50 min-h-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ventes</h1>
        <p className="text-slate-500 mt-1">Suivi des ventes WhatsApp et mise à jour du statut jusqu'à vendu/payé.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ajouter une vente WhatsApp</CardTitle>
          <CardDescription>Créer rapidement une vente manuelle reçue par WhatsApp.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          <Input
            placeholder="Client"
            value={clientName}
            onChange={e => setClientName(e.target.value)}
          />
          <Input
            placeholder="Téléphone"
            value={clientPhone}
            onChange={e => setClientPhone(e.target.value)}
          />

          <Select value={productId} onValueChange={setProductId}>
            <SelectTrigger>
              <SelectValue placeholder="Produit" />
            </SelectTrigger>
            <SelectContent>
              {products.map(product => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name} · {formatPrice(product.price)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
          />

          <Button onClick={handleCreate} disabled={createRecord.isPending || !selectedProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Créer ({formatPrice(computedTotal)})
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{records.length} ventes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 rounded bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : records.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">Aucune vente pour le moment.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="text-left px-3 py-2">Client</th>
                    <th className="text-left px-3 py-2">Article</th>
                    <th className="text-left px-3 py-2">Total</th>
                    <th className="text-left px-3 py-2">Source</th>
                    <th className="text-left px-3 py-2">Statut</th>
                    <th className="text-left px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {records.map(record => (
                    <tr key={record.id}>
                      <td className="px-3 py-2">
                        <p className="font-medium text-slate-900">{record.client_name || 'Client WhatsApp'}</p>
                        <p className="text-xs text-slate-500">{record.client_phone || record.client_whatsapp || '—'}</p>
                      </td>
                      <td className="px-3 py-2">
                        <p className="font-medium text-slate-900">{record.lead_title}</p>
                        <p className="text-xs text-slate-500">{record.sales_record_items?.length || 0} ligne(s)</p>
                      </td>
                      <td className="px-3 py-2 font-semibold">{formatPrice(record.total)}</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 rounded-full px-2 py-1">
                          <MessageCircle className="h-3 w-3" />
                          {record.source}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusClass(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => updateStatus.mutate({ id: record.id, status: 'quoted' })}
                          >
                            Devis
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => updateStatus.mutate({ id: record.id, status: 'sold' })}
                          >
                            <ShoppingBag className="h-3.5 w-3.5 mr-1" />
                            Vendu
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => updateStatus.mutate({ id: record.id, status: 'paid' })}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Payé
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
