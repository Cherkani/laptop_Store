import { useEffect, useState, type ChangeEvent } from 'react'
import { Building, NotebookPen, Pencil, ShieldCheck, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCompanies, useDeleteCompany, useUpsertCompany } from '@/features/admin/hooks/useCRM'
import type { Company } from '@/types/database.types'

const emptyForm = { name: '', ice: '', email: '', phone: '', address: '' }

export function AdminCompaniesPage() {
  const { data: companies = [], isLoading } = useCompanies()
  const saveCompany = useUpsertCompany()
  const deleteCompany = useDeleteCompany()

  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState<Company | null>(null)

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        ice: editing.ice ?? '',
        email: editing.email ?? '',
        phone: editing.phone ?? '',
        address: editing.address ?? '',
      })
    } else {
      setForm(emptyForm)
    }
  }, [editing])

  const handleSubmit = async () => {
    if (!form.name.trim()) return
    await saveCompany.mutateAsync({
      id: editing?.id,
      name: form.name.trim(),
      ice: form.ice.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
    })
    setEditing(null)
    setForm(emptyForm)
  }

  const handleDelete = async (company: Company) => {
    const ok = window.confirm(`Supprimer ${company.name} ?`)
    if (!ok) return
    await deleteCompany.mutateAsync(company.id)
  }

  return (
    <div className="p-6 lg:p-8 bg-surface-base min-h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Entreprises</h1>
          <p className="text-on-surface-subtle mt-1">Comptes B2B (ICE, facturation, coordonnées).</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-surface-raised px-3 py-2 rounded-lg shadow-sm">
          <ShieldCheck className="h-4 w-4 text-on-surface-subtle" />
          <span>{companies.length} entreprises</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editing ? 'Modifier une entreprise' : 'Ajouter une entreprise'}</CardTitle>
          <CardDescription>ICE, contacts et adresse.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            placeholder="Raison sociale"
            value={form.name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, name: e.target.value }))}
          />
          <Input
            placeholder="ICE"
            value={form.ice}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, ice: e.target.value }))}
          />
          <Input
            placeholder="Téléphone"
            value={form.phone}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, phone: e.target.value }))}
          />
          <Input
            placeholder="Email"
            value={form.email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, email: e.target.value }))}
          />
          <Textarea
            className="md:col-span-2"
            placeholder="Adresse / note"
            value={form.address}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setForm(f => ({ ...f, address: e.target.value }))}
          />
          <div className="flex gap-2">
            {editing && (
              <Button variant="outline" className="flex-1" onClick={() => setEditing(null)}>
                Annuler
              </Button>
            )}
            <Button className="flex-1" onClick={handleSubmit} disabled={saveCompany.isPending || !form.name.trim()}>
              <NotebookPen className="h-4 w-4 mr-2" />
              {editing ? 'Mettre à jour' : 'Enregistrer'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des entreprises</CardTitle>
          <CardDescription>Triées par création.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 rounded bg-surface-raised animate-pulse" />
              ))}
            </div>
          ) : companies.length === 0 ? (
            <p className="text-sm text-on-surface-subtle text-center py-8">Aucune entreprise.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-sunken text-xs uppercase text-on-surface-subtle">
                  <tr>
                    <th className="text-left px-3 py-2">Raison sociale</th>
                    <th className="text-left px-3 py-2">ICE</th>
                    <th className="text-left px-3 py-2">Téléphone</th>
                    <th className="text-left px-3 py-2">Email</th>
                    <th className="text-left px-3 py-2">Adresse</th>
                    <th className="text-left px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {companies.map(company => (
                    <tr key={company.id}>
                      <td className="px-3 py-2 font-medium text-on-surface">{company.name}</td>
                      <td className="px-3 py-2">{company.ice || '—'}</td>
                      <td className="px-3 py-2">{company.phone || '—'}</td>
                      <td className="px-3 py-2">{company.email || '—'}</td>
                      <td className="px-3 py-2 text-slate-600 max-w-xs truncate" title={company.address ?? ''}>
                        {company.address || '—'}
                      </td>
                      <td className="px-3 py-2 space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => setEditing(company)}>
                          <Pencil className="h-4 w-4 mr-1" /> Éditer
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDelete(company)}>
                          <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                        </Button>
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
