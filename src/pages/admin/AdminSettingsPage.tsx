import { useEffect, useMemo, useState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAppSettings, useUpsertAppSetting } from '@/features/admin/hooks/useBackoffice'

const CORE_SETTING_KEYS = [
  {
    key: 'company_name',
    label: 'Nom de la société',
    placeholder: 'TechFiable',
    description: 'Utilisé dans les documents et le backoffice.',
  },
  {
    key: 'company_phone',
    label: 'Téléphone société',
    placeholder: '+212...',
    description: 'Contact visible dans vos échanges clients.',
  },
  {
    key: 'whatsapp_number_primary',
    label: 'Numéro WhatsApp principal',
    placeholder: '212600000000',
    description: 'Format international sans + (utilisé pour wa.me).',
  },
  {
    key: 'whatsapp_number_secondary',
    label: 'Numéro WhatsApp secondaire',
    placeholder: '212611111111',
    description: 'Numéro de secours/alternatif pour votre équipe.',
  },
  {
    key: 'business_hours',
    label: 'Horaires',
    placeholder: 'Lun - Dim · 9h00 - 23h00',
    description: 'Affiché dans l’en-tête et les boutons WhatsApp.',
  },
  {
    key: 'google_webhook_url',
    label: 'Webhook Google',
    placeholder: 'https://script.google.com/macros/s/.../exec',
    description: 'Reçoit automatiquement les leads/articles.',
  },
]

export function AdminSettingsPage() {
  const { data: settings = [], isLoading } = useAppSettings()
  const upsertSetting = useUpsertAppSetting()
  const [draft, setDraft] = useState<Record<string, string>>({})

  const byKey = useMemo(
    () => new Map(settings.map(s => [s.key, s])),
    [settings],
  )

  useEffect(() => {
    const initial: Record<string, string> = {}
    settings.forEach(item => {
      initial[item.key] = item.value || ''
    })
    if (!initial.whatsapp_number_primary && initial.whatsapp_number) {
      initial.whatsapp_number_primary = initial.whatsapp_number
    }
    setDraft(initial)
  }, [settings])

  const handleSave = async (key: string) => {
    const current = byKey.get(key)
    await upsertSetting.mutateAsync({
      key,
      value: draft[key] ?? '',
      description: current?.description ?? null,
      json_value: current?.json_value as object,
    })
  }

  return (
    <div className="p-6 lg:p-8 bg-surface-base min-h-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Paramètres</h1>
        <p className="text-on-surface-subtle mt-1">Configuration de l'instance, WhatsApp et intégration Google.</p>
      </div>

      <div className="grid gap-4">
        {CORE_SETTING_KEYS.map(item => (
          <Card key={item.key}>
            <CardHeader>
              <CardTitle className="text-base">{item.label}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder={item.placeholder}
                value={draft[item.key] ?? ''}
                onChange={e => setDraft(prev => ({ ...prev, [item.key]: e.target.value }))}
                disabled={isLoading || upsertSetting.isPending}
              />
              <Button
                onClick={() => handleSave(item.key)}
                disabled={isLoading || upsertSetting.isPending}
                className="sm:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
