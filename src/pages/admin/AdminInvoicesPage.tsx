import { AdminDocumentsBoard } from '@/features/admin/components/AdminDocumentsBoard'

export function AdminInvoicesPage() {
  return (
    <AdminDocumentsBoard
      docType="invoice"
      title="Factures"
      description="Gérez les factures issues des ventes validées."
    />
  )
}
