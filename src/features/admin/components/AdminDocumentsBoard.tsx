import { useMemo, useState } from 'react'
import { FilePlus2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  useCreateSalesDocument,
  useSalesDocuments,
  useSalesRecords,
} from '@/features/admin/hooks/useBackoffice'
import type { SalesDocumentType } from '@/features/admin/services/backofficeService'
import { formatPrice } from '@/lib/utils'

function statusBadge(status: string) {
  if (status === 'paid') return 'bg-emerald-100 text-emerald-700'
  if (status === 'sent') return 'bg-blue-100 text-blue-700'
  if (status === 'validated') return 'bg-violet-100 text-violet-700'
  if (status === 'cancelled') return 'bg-red-100 text-red-700'
  return 'bg-slate-100 text-slate-700'
}

export function AdminDocumentsBoard({
  docType,
  title,
  description,
}: {
  docType: SalesDocumentType
  title: string
  description: string
}) {
  const { data: docs = [], isLoading } = useSalesDocuments(docType)
  const { data: sales = [] } = useSalesRecords()
  const createDoc = useCreateSalesDocument()

  const [salesRecordId, setSalesRecordId] = useState('')
  const [amount, setAmount] = useState('0')
  const [docNumber, setDocNumber] = useState('')

  const selectableSales = useMemo(
    () => sales.filter(s => s.status !== 'cancelled' && s.status !== 'lost'),
    [sales],
  )

  const handleCreate = async () => {
    if (!salesRecordId) return

    await createDoc.mutateAsync({
      sales_record_id: salesRecordId,
      doc_type: docType,
      amount_total: Number(amount) || 0,
      doc_number: docNumber || null,
      status: 'draft',
    })

    setAmount('0')
    setDocNumber('')
  }

  return (
    <div className="p-6 lg:p-8 bg-slate-50 min-h-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-slate-500 mt-1">{description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nouveau document</CardTitle>
          <CardDescription>Créer rapidement un document depuis une vente existante</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Select value={salesRecordId} onValueChange={setSalesRecordId}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir une vente" />
            </SelectTrigger>
            <SelectContent>
              {selectableSales.map(s => (
                <SelectItem key={s.id} value={s.id}>
                  {(s.client_name || s.client_phone || 'Client inconnu')} · {s.lead_title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Numéro (optionnel)"
            value={docNumber}
            onChange={e => setDocNumber(e.target.value)}
          />

          <Input
            type="number"
            min="0"
            placeholder="Montant"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />

          <Button onClick={handleCreate} disabled={createDoc.isPending || !salesRecordId}>
            <FilePlus2 className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{docs.length} document(s)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 rounded bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : docs.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">Aucun document pour le moment.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-slate-500 bg-slate-50">
                  <tr>
                    <th className="text-left px-3 py-2">Numéro</th>
                    <th className="text-left px-3 py-2">Titre</th>
                    <th className="text-left px-3 py-2">Date</th>
                    <th className="text-left px-3 py-2">Montant</th>
                    <th className="text-left px-3 py-2">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {docs.map(doc => (
                    <tr key={doc.id}>
                      <td className="px-3 py-2">{doc.doc_number || '—'}</td>
                      <td className="px-3 py-2">{doc.title || doc.doc_type}</td>
                      <td className="px-3 py-2">{doc.issue_date}</td>
                      <td className="px-3 py-2 font-semibold">{formatPrice(doc.amount_total)}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(doc.status)}`}>
                          {doc.status}
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
