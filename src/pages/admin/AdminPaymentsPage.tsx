import { useMemo, useState } from 'react'
import { CreditCard, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  useCreatePayment,
  usePayments,
  useSalesDocuments,
  useSalesRecords,
} from '@/features/admin/hooks/useBackoffice'
import { formatPrice } from '@/lib/utils'

const PAYMENT_METHODS = ['cash', 'card', 'bank_transfer', 'mobile_money']

function statusClass(status: string) {
  if (status === 'received') return 'bg-emerald-100 text-emerald-700'
  if (status === 'pending') return 'bg-amber-100 text-amber-700'
  if (status === 'failed') return 'bg-red-100 text-red-700'
  if (status === 'refunded') return 'bg-slate-100 text-slate-700'
  return 'bg-slate-100 text-slate-700'
}

export function AdminPaymentsPage() {
  const { data: payments = [], isLoading } = usePayments()
  const { data: sales = [] } = useSalesRecords()
  const { data: invoices = [] } = useSalesDocuments('invoice')
  const createPayment = useCreatePayment()

  const [salesRecordId, setSalesRecordId] = useState('')
  const [salesDocumentId, setSalesDocumentId] = useState('')
  const [amount, setAmount] = useState('0')
  const [method, setMethod] = useState('cash')
  const [reference, setReference] = useState('')

  const saleLookup = useMemo(
    () => new Map(sales.map(s => [s.id, s])),
    [sales],
  )

  const handleCreate = async () => {
    await createPayment.mutateAsync({
      sales_record_id: salesRecordId || null,
      sales_document_id: salesDocumentId || null,
      amount: Number(amount) || 0,
      method,
      status: 'received',
      reference: reference || null,
    })

    setAmount('0')
    setReference('')
  }

  return (
    <div className="p-6 lg:p-8 bg-slate-50 min-h-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Paiements</h1>
        <p className="text-slate-500 mt-1">Suivi des règlements et rapprochement vente/facture.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enregistrer un paiement</CardTitle>
          <CardDescription>Associez le paiement à une vente ou à une facture.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <Select value={salesRecordId} onValueChange={setSalesRecordId}>
            <SelectTrigger>
              <SelectValue placeholder="Vente (optionnel)" />
            </SelectTrigger>
            <SelectContent>
              {sales.map(s => (
                <SelectItem key={s.id} value={s.id}>
                  {s.client_name || s.client_phone || 'Client'} · {s.lead_title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={salesDocumentId} onValueChange={setSalesDocumentId}>
            <SelectTrigger>
              <SelectValue placeholder="Facture (optionnel)" />
            </SelectTrigger>
            <SelectContent>
              {invoices.map(doc => (
                <SelectItem key={doc.id} value={doc.id}>
                  {doc.doc_number || doc.id.slice(0, 8)} · {formatPrice(doc.amount_total)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="number"
            min="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="Montant"
          />

          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Méthode" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map(pm => (
                <SelectItem key={pm} value={pm}>{pm}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            value={reference}
            onChange={e => setReference(e.target.value)}
            placeholder="Référence (optionnel)"
          />

          <Button onClick={handleCreate} disabled={createPayment.isPending || Number(amount) <= 0}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{payments.length} paiement(s)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 rounded bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">Aucun paiement pour le moment.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="text-left px-3 py-2">Date</th>
                    <th className="text-left px-3 py-2">Vente</th>
                    <th className="text-left px-3 py-2">Référence</th>
                    <th className="text-left px-3 py-2">Méthode</th>
                    <th className="text-left px-3 py-2">Montant</th>
                    <th className="text-left px-3 py-2">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payments.map(payment => (
                    <tr key={payment.id}>
                      <td className="px-3 py-2">{new Date(payment.created_at).toLocaleDateString()}</td>
                      <td className="px-3 py-2">
                        {payment.sales_record_id
                          ? (saleLookup.get(payment.sales_record_id)?.lead_title || payment.sales_record_id.slice(0, 8))
                          : '—'}
                      </td>
                      <td className="px-3 py-2">{payment.reference || '—'}</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs bg-slate-100 text-slate-700">
                          <CreditCard className="h-3 w-3" />
                          {payment.method}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-semibold">{formatPrice(payment.amount)}</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusClass(payment.status)}`}>
                          {payment.status}
                        </span>
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
