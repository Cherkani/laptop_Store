import { useMemo, useState, type ChangeEvent } from 'react'
import { Banknote, Calculator, Coins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCashSales, useClients, useCompanies, useCreateCashSale } from '@/features/admin/hooks/useCRM'
import { formatPrice } from '@/lib/utils'

export function AdminCashSalesPage() {
  const { data: cashSales = [], isLoading } = useCashSales()
  const { data: clients = [] } = useClients()
  const { data: companies = [] } = useCompanies()
  const createCashSale = useCreateCashSale()

  const [counterpartyType, setCounterpartyType] = useState<'none' | 'client' | 'company'>('client')
  const [counterpartyId, setCounterpartyId] = useState('')
  const [description, setDescription] = useState('')
  const [amountHt, setAmountHt] = useState('0')
  const [tva, setTva] = useState('0')
  const [occurredAt, setOccurredAt] = useState(() => new Date().toISOString().slice(0, 10))

  const clientMap = useMemo(() => new Map(clients.map(c => [c.id, c.name])), [clients])
  const companyMap = useMemo(() => new Map(companies.map(c => [c.id, c.name])), [companies])

  const totalTTC = useMemo(() => cashSales.reduce((sum, s) => sum + (s.amount_ttc ?? 0), 0), [cashSales])
  const totalHT = useMemo(() => cashSales.reduce((sum, s) => sum + (s.amount_ht ?? 0), 0), [cashSales])

  const handleCreate = async () => {
    const payload = {
      client_id: counterpartyType === 'client' ? counterpartyId || null : null,
      company_id: counterpartyType === 'company' ? counterpartyId || null : null,
      description: description || null,
      amount_ht: Number(amountHt) || 0,
      tva: Number(tva) || 0,
      occurred_at: `${occurredAt}T00:00:00Z`,
    }

    await createCashSale.mutateAsync(payload)

    setDescription('')
    setAmountHt('0')
    setTva('0')
    setCounterpartyId('')
  }

  const counterpartyLabel = (sale: (typeof cashSales)[number]) => {
    if (sale.client_id) return clientMap.get(sale.client_id) ?? 'Client'
    if (sale.company_id) return companyMap.get(sale.company_id) ?? 'Entreprise'
    return 'Walk-in'
  }

  return (
    <div className="p-6 lg:p-8 bg-surface-base min-h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Ventes cash / hors Stripe</h1>
          <p className="text-on-surface-subtle mt-1">Encaissements immédiats (espèces, TPE, virement direct).</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-surface-raised rounded-lg px-3 py-2 shadow-sm">
            <p className="text-xs text-on-surface-subtle">Total HT</p>
            <p className="text-base font-semibold text-on-surface">{formatPrice(totalHT)}</p>
          </div>
          <div className="bg-surface-raised rounded-lg px-3 py-2 shadow-sm">
            <p className="text-xs text-on-surface-subtle">Total TTC</p>
            <p className="text-base font-semibold text-on-surface">{formatPrice(totalTTC)}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ajouter une vente cash</CardTitle>
          <CardDescription>Associez à un client ou une entreprise si besoin.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <Select value={counterpartyType} onValueChange={v => setCounterpartyType(v as typeof counterpartyType)}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="company">Entreprise</SelectItem>
              <SelectItem value="none">Anonyme</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={counterpartyId}
            onValueChange={setCounterpartyId}
            disabled={counterpartyType === 'none'}
          >
            <SelectTrigger>
              <SelectValue placeholder={counterpartyType === 'company' ? 'Choisir une entreprise' : 'Choisir un client'} />
            </SelectTrigger>
            <SelectContent>
              {(counterpartyType === 'company' ? companies : clients).map(item => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Description"
            value={description}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
            className="md:col-span-2"
          />

          <Input
            type="date"
            value={occurredAt}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setOccurredAt(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              min="0"
              value={amountHt}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setAmountHt(e.target.value)}
              placeholder="Montant HT"
            />
            <Input
              type="number"
              min="0"
              value={tva}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTva(e.target.value)}
              placeholder="TVA (montant)"
            />
          </div>

          <Button
            onClick={handleCreate}
            disabled={createCashSale.isPending || Number(amountHt) <= 0}
            className="md:col-span-6"
          >
            <Coins className="h-4 w-4 mr-2" />
            Enregistrer ({formatPrice((Number(amountHt) || 0) + (Number(tva) || 0))})
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{cashSales.length} vente(s) cash</CardTitle>
          <CardDescription>Historique le plus récent en premier.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 rounded bg-surface-raised animate-pulse" />
              ))}
            </div>
          ) : cashSales.length === 0 ? (
            <p className="text-sm text-on-surface-subtle text-center py-8">Aucune vente cash.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-sunken text-xs uppercase text-on-surface-subtle">
                  <tr>
                    <th className="text-left px-3 py-2">Date</th>
                    <th className="text-left px-3 py-2">Contrepartie</th>
                    <th className="text-left px-3 py-2">Description</th>
                    <th className="text-left px-3 py-2">HT</th>
                    <th className="text-left px-3 py-2">TVA</th>
                    <th className="text-left px-3 py-2">TTC</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {cashSales.map(sale => (
                    <tr key={sale.id}>
                      <td className="px-3 py-2">{new Date(sale.occurred_at).toLocaleDateString()}</td>
                      <td className="px-3 py-2 font-medium text-on-surface">{counterpartyLabel(sale)}</td>
                      <td className="px-3 py-2 text-slate-600 max-w-xs truncate" title={sale.description ?? ''}>
                        {sale.description || '—'}
                      </td>
                      <td className="px-3 py-2">{formatPrice(sale.amount_ht)}</td>
                      <td className="px-3 py-2">{formatPrice(sale.tva)}</td>
                      <td className="px-3 py-2 font-semibold">{formatPrice(sale.amount_ttc)}</td>
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
