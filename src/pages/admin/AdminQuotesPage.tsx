import { AdminDocumentsBoard } from '@/features/admin/components/AdminDocumentsBoard'

export function AdminQuotesPage() {
  return (
    <AdminDocumentsBoard
      docType="quote"
      title="Devis"
      description="Créez et suivez les devis envoyés aux clients WhatsApp."
    />
  )
}
