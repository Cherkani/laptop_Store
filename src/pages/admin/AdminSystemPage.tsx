import { Link } from 'react-router-dom'
import { BadgeCheck, FileSpreadsheet, MessageCircle, Settings2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppSettings, usePayments, useSalesDocuments, useSalesRecords } from '@/features/admin/hooks/useBackoffice'

export function AdminSystemPage() {
  const { data: sales = [] } = useSalesRecords()
  const { data: docs = [] } = useSalesDocuments()
  const { data: payments = [] } = usePayments()
  const { data: settings = [] } = useAppSettings()

  const sold = sales.filter(s => s.status === 'sold').length
  const paid = sales.filter(s => s.status === 'paid').length
  const whatsappLeads = sales.filter(s => s.source === 'whatsapp').length
  const pendingPayments = payments.filter(p => p.status === 'pending').length

  const settingsMap = new Map(settings.map(s => [s.key, s.value || '']))
  const googleWebhook = settingsMap.get('google_webhook_url')
  const whatsappNumber = settingsMap.get('whatsapp_number')

  const cards = [
    { label: 'Leads WhatsApp', value: whatsappLeads, hint: 'Entrées client provenant de WhatsApp' },
    { label: 'Ventes marquées vendues', value: sold, hint: 'Pipeline commercial validé' },
    { label: 'Ventes payées', value: paid, hint: 'Transactions finalisées' },
    { label: 'Documents générés', value: docs.length, hint: 'Devis, factures, bons de livraison' },
  ]

  return (
    <div className="p-6 lg:p-8 bg-surface-base min-h-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Système</h1>
        <p className="text-on-surface-subtle mt-1">Vue globale des modules, intégrations et automatisations.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => (
          <Card key={card.label}>
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wide text-on-surface-subtle">{card.label}</p>
              <p className="text-2xl font-bold text-on-surface mt-2">{card.value}</p>
              <p className="text-xs text-on-surface-subtle mt-1">{card.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-emerald-600" />
              Intégration WhatsApp
            </CardTitle>
            <CardDescription>Canal principal de contact client.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border p-3 bg-surface-raised">
              <p className="text-sm font-medium text-on-surface">Numéro configuré</p>
              <p className="text-sm text-slate-600 mt-1">{whatsappNumber || 'Non configuré'}</p>
            </div>
            <div className="rounded-lg border p-3 bg-surface-raised">
              <p className="text-sm font-medium text-on-surface">Paiements en attente</p>
              <p className="text-sm text-slate-600 mt-1">{pendingPayments}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-blue-600" />
              Intégration Google
            </CardTitle>
            <CardDescription>Envoi des leads/articles vers Apps Script ou Google Sheets.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border p-3 bg-surface-raised">
              <p className="text-sm font-medium text-on-surface">Webhook URL</p>
              <p className="text-xs text-slate-600 mt-1 break-all">{googleWebhook || 'Non configuré'}</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs bg-surface-sunken text-on-surface-muted">
              <BadgeCheck className="h-3.5 w-3.5" />
              Configurez l'URL dans Paramètres pour activer la synchronisation.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Actions rapides
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="outline"><Link to="/admin/ventes">Ouvrir Ventes</Link></Button>
          <Button asChild variant="outline"><Link to="/admin/devis">Créer un devis</Link></Button>
          <Button asChild variant="outline"><Link to="/admin/factures">Voir factures</Link></Button>
          <Button asChild variant="outline"><Link to="/admin/parametres">Configurer système</Link></Button>
        </CardContent>
      </Card>
    </div>
  )
}
