import { useEffect, useState, type ChangeEvent } from 'react'
import { Building2, NotebookPen, Pencil, Receipt, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useDeleteSupplier, useSuppliers, useUpsertSupplier } from '@/features/admin/hooks/useCRM'
import type { Supplier } from '@/types/database.types'

const emptyForm = { name: '', email: '', phone: '', address: '' }

export function AdminSuppliersPage() {
  const { data: suppliers = [], isLoading } = useSuppliers()
  const saveSupplier = useUpsertSupplier()
  const deleteSupplier = useDeleteSupplier()

  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState<Supplier | null>(null)

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
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
    await saveSupplier.mutateAsync({
      id: editing?.id,
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
    })
    setEditing(null)
    setForm(emptyForm)
  }

  const handleDelete = async (supplier: Supplier) => {
    const ok = window.confirm(`Supprimer ${supplier.name} ?`)
    if (!ok) return
    await deleteSupplier.mutateAsync(supplier.id)
  }

  return (
    <div className="p-6 lg:p-8 bg-slate-50 min-h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fournisseurs</h1>
          <p className="text-slate-500 mt-1">Suivez vos fournisseurs et contacts d'achat.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-3 py-2 rounded-lg shadow-sm">
          <Building2 className="h-4 w-4 text-slate-500" />
          <span>{suppliers.length} fournisseurs</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editing ? 'Modifier un fournisseur' : 'Ajouter un fournisseur'}</CardTitle>
          <CardDescription>Contacts achats + adresse livraison.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            placeholder="Nom de l'entreprise"
            value={form.name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, name: e.target.value }))}
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
            placeholder="Adresse / notes"
            value={form.address}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setForm(f => ({ ...f, address: e.target.value }))}
          />
          <div className="flex gap-2">
            {editing && (
              <Button variant="outline" className="flex-1" onClick={() => setEditing(null)}>
                Annuler
              </Button>
            )}
            <Button className="flex-1" onClick={handleSubmit} disabled={saveSupplier.isPending || !form.name.trim()}>
              <NotebookPen className="h-4 w-4 mr-2" />
              {editing ? 'Mettre à jour' : 'Enregistrer'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des fournisseurs</CardTitle>
          <CardDescription>Triés par création.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 rounded bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : suppliers.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">Aucun fournisseur.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="text-left px-3 py-2">Nom</th>
                    <th className="text-left px-3 py-2">Téléphone</th>
                    <th className="text-left px-3 py-2">Email</th>
                    <th className="text-left px-3 py-2">Adresse</th>
                    <th className="text-left px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {suppliers.map(supplier => (
                    <tr key={supplier.id}>
                      <td className="px-3 py-2 font-medium text-slate-900">{supplier.name}</td>
                      <td className="px-3 py-2">{supplier.phone || '—'}</td>
                      <td className="px-3 py-2">{supplier.email || '—'}</td>
                      <td className="px-3 py-2 text-slate-600 max-w-xs truncate" title={supplier.address ?? ''}>
                        {supplier.address || '—'}
                      </td>
                      <td className="px-3 py-2 space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => setEditing(supplier)}>
                          <Pencil className="h-4 w-4 mr-1" /> Éditer
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDelete(supplier)}>
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
