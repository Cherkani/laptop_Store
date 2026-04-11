import { useMemo, useState, type ChangeEvent } from 'react'
import { ArrowDownCircle, ArrowUpCircle, Scale, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useBalanceEntries, useCreateBalanceEntry } from '@/features/admin/hooks/useCRM'
import { cn, formatPrice } from '@/lib/utils'

export function AdminBalancePage() {
  const { data: entries = [], isLoading } = useBalanceEntries()
  const createEntry = useCreateBalanceEntry()

  const [entryType, setEntryType] = useState<'income' | 'expense' | 'adjustment'>('income')
  const [amount, setAmount] = useState('0')
  const [description, setDescription] = useState('')
  const [occurredAt, setOccurredAt] = useState(() => new Date().toISOString().slice(0, 10))

  const computedEntries = useMemo(() => {
    const sorted = [...entries].sort((a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime())
    let running = 0
    return sorted.map(entry => {
      const signed = entry.entry_type === 'expense' ? -entry.amount : entry.amount
      running += signed
      return { ...entry, computed_balance: running }
    }).sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())
  }, [entries])

  const currentBalance = useMemo(() => {
    const last = computedEntries[0]
    return last?.computed_balance ?? 0
  }, [computedEntries])

  const handleCreate = async () => {
    const amt = Number(amount) || 0
    const signed = entryType === 'expense' ? -amt : amt
    const nextBalance = currentBalance + signed

    await createEntry.mutateAsync({
      entry_type: entryType,
      amount: amt,
      description: description || null,
      occurred_at: `${occurredAt}T00:00:00Z`,
      running_balance: nextBalance,
    })

    setAmount('0')
    setDescription('')
  }

  return (
    <div className="p-6 lg:p-8 bg-surface-base min-h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Trésorerie</h1>
          <p className="text-on-surface-subtle mt-1">Journal de caisse pour rapprocher vos encaissements hors Stripe.</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="bg-surface-raised rounded-lg px-3 py-2 shadow-sm flex items-center gap-2">
            <Wallet className="h-4 w-4 text-emerald-600" />
            <div>
              <p className="text-xs text-on-surface-subtle">Solde courant</p>
              <p className="text-base font-semibold text-on-surface">{formatPrice(currentBalance)}</p>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ajouter une écriture</CardTitle>
          <CardDescription>Income = +, Expense = -, Adjustment = correction manuelle.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <Select value={entryType} onValueChange={v => setEntryType(v as typeof entryType)}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Encaissement</SelectItem>
              <SelectItem value="expense">Décaissement</SelectItem>
              <SelectItem value="adjustment">Ajustement</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="number"
            min="0"
            value={amount}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
            placeholder="Montant"
          />

          <Input
            type="date"
            value={occurredAt}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setOccurredAt(e.target.value)}
          />

          <Textarea
            className="md:col-span-3"
            placeholder="Description / référence"
            value={description}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
          />

          <Button
            className="md:col-span-6"
            onClick={handleCreate}
            disabled={createEntry.isPending || Number(amount) <= 0}
          >
            <Scale className="h-4 w-4 mr-2" />
            Enregistrer (nouveau solde {formatPrice(currentBalance + (entryType === 'expense' ? -(Number(amount) || 0) : Number(amount) || 0))})
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historique caisse</CardTitle>
          <CardDescription>Trié du plus récent au plus ancien.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 rounded bg-surface-raised animate-pulse" />
              ))}
            </div>
          ) : computedEntries.length === 0 ? (
            <p className="text-sm text-on-surface-subtle text-center py-8">Aucune écriture.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-sunken text-xs uppercase text-on-surface-subtle">
                  <tr>
                    <th className="text-left px-3 py-2">Date</th>
                    <th className="text-left px-3 py-2">Type</th>
                    <th className="text-left px-3 py-2">Description</th>
                    <th className="text-left px-3 py-2">Montant</th>
                    <th className="text-left px-3 py-2">Solde après</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {computedEntries.map(entry => (
                    <tr key={entry.id}>
                      <td className="px-3 py-2">{new Date(entry.occurred_at).toLocaleString()}</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-surface-sunken text-on-surface-muted">
                          {entry.entry_type === 'income' ? <ArrowUpCircle className="h-3 w-3 text-emerald-600" /> : null}
                          {entry.entry_type === 'expense' ? <ArrowDownCircle className="h-3 w-3 text-red-500" /> : null}
                          {entry.entry_type === 'adjustment' ? <Scale className="h-3 w-3 text-amber-500" /> : null}
                          {entry.entry_type}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-600 max-w-xs truncate" title={entry.description ?? ''}>
                        {entry.description || '—'}
                      </td>
                      <td
                        className={cn(
                          'px-3 py-2 font-semibold',
                          entry.entry_type === 'expense' ? 'text-red-600' : 'text-emerald-700',
                        )}
                      >
                        {entry.entry_type === 'expense' ? '-' : '+'}
                        {formatPrice(entry.amount)}
                      </td>
                      <td className="px-3 py-2 font-medium">{formatPrice(entry.computed_balance ?? entry.running_balance ?? 0)}</td>
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
