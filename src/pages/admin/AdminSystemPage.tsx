import { BadgeCheck, FileSpreadsheet, MessageCircle, Settings2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppSettings } from '@/features/admin/hooks/useBackoffice'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function AdminSystemPage() {
  const { data: settings = [] } = useAppSettings()

  const settingsMap = new Map(settings.map(s => [s.key, s.value || '']))
  const googleWebhook = settingsMap.get('google_webhook_url')
  const whatsappPrimary = settingsMap.get('whatsapp_number_primary') || settingsMap.get('whatsapp_number') || ''
  const whatsappSecondary = settingsMap.get('whatsapp_number_secondary') || ''

  return (
    <div className="p-6 lg:p-8 bg-surface-base min-h-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Système</h1>
        <p className="text-on-surface-subtle mt-1">Intégrations et automatisations.</p>
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
          <CardContent>
            <div className="rounded-lg border p-3 bg-surface-raised space-y-2">
              <div>
                <p className="text-sm font-medium text-on-surface">Numéro principal</p>
                <p className="text-sm text-on-surface-subtle mt-1">{whatsappPrimary || 'Non configuré'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-on-surface">Numéro secondaire</p>
                <p className="text-sm text-on-surface-subtle mt-1">{whatsappSecondary || 'Non configuré'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-blue-600" />
              Intégration Google
            </CardTitle>
            <CardDescription>Envoi des leads vers Apps Script ou Google Sheets.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border p-3 bg-surface-raised">
              <p className="text-sm font-medium text-on-surface">Webhook URL</p>
              <p className="text-xs text-on-surface-subtle mt-1 break-all">{googleWebhook || 'Non configuré'}</p>
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
          <Button asChild variant="outline"><Link to="/admin/parametres">Configurer paramètres</Link></Button>
        </CardContent>
      </Card>
    </div>
  )
}
