import { AdminDocumentsBoard } from '@/features/admin/components/AdminDocumentsBoard'

export function AdminDeliveryNotesPage() {
  return (
    <AdminDocumentsBoard
      docType="delivery_note"
      title="Bons de livraison"
      description="Préparez les bons de livraison liés aux commandes confirmées."
    />
  )
}
