import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { NotebookPen, Pencil, Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useClients, useDeleteClient, useUpsertClient } from '@/features/admin/hooks/useCRM'
import type { Client } from '@/types/database.types'

const emptyForm = { name: '', cin: '', email: '', phone: '', address: '' }

export function AdminClientsPage() {
  const { data: clients = [], isLoading } = useClients()
  const saveClient = useUpsertClient()
  const deleteClient = useDeleteClient()

  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState<Client | null>(null)

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        cin: editing.cin ?? '',
        email: editing.email ?? '',
        phone: editing.phone ?? '',
        address: editing.address ?? '',
      })
    } else {
      setForm(emptyForm)
    }
  }, [editing])

  const totalUniquePhones = useMemo(() => new Set(clients.map(c => c.phone ?? '')).size, [clients])

  const handleSubmit = async () => {
    if (!form.name.trim()) return
    await saveClient.mutateAsync({
      id: editing?.id,
      name: form.name.trim(),
      cin: form.cin.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
    })
    setEditing(null)
    setForm(emptyForm)
  }

  const handleDelete = async (client: Client) => {
    const ok = window.confirm(`Supprimer ${client.name} ?`)
    if (!ok) return
    await deleteClient.mutateAsync(client.id)
  }

  return (
    <div className="p-6 lg:p-8 bg-slate-50 min-h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
          <p className="text-slate-500 mt-1">Annuaire client pour vos ventes hors-stripe.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-3 py-2 rounded-lg shadow-sm">
          <Users className="h-4 w-4 text-slate-500" />
          <span>{clients.length} clients</span>
          <span className="text-slate-400">·</span>
          <span>{totalUniquePhones} numéros</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editing ? 'Modifier un client' : 'Ajouter un client'}</CardTitle>
          <CardDescription>Identité, contact et notes rapides.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            placeholder="Nom complet"
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
          <Input
            placeholder="CIN (optionnel)"
            value={form.cin}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, cin: e.target.value }))}
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
            <Button className="flex-1" onClick={handleSubmit} disabled={saveClient.isPending || !form.name.trim()}>
              <NotebookPen className="h-4 w-4 mr-2" />
              {editing ? 'Mettre à jour' : 'Enregistrer'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des clients</CardTitle>
          <CardDescription>Triés par création.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 rounded bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : clients.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">Aucun client enregistré.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="text-left px-3 py-2">Nom</th>
                    <th className="text-left px-3 py-2">Téléphone</th>
                    <th className="text-left px-3 py-2">Email</th>
                    <th className="text-left px-3 py-2">Adresse / notes</th>
                    <th className="text-left px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {clients.map(client => (
                    <tr key={client.id}>
                      <td className="px-3 py-2 font-medium text-slate-900">
                        {client.name}
                        {client.cin ? <span className="text-xs text-slate-500 ml-2">CIN {client.cin}</span> : null}
                      </td>
                      <td className="px-3 py-2">{client.phone || '—'}</td>
                      <td className="px-3 py-2">{client.email || '—'}</td>
                      <td className="px-3 py-2 text-slate-600 max-w-xs truncate" title={client.address ?? ''}>
                        {client.address || '—'}
                      </td>
                      <td className="px-3 py-2 space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => setEditing(client)}>
                          <Pencil className="h-4 w-4 mr-1" /> Éditer
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDelete(client)}>
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
