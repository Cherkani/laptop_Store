import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'
import {
  backofficeService,
  type PaymentDraft,
  type SalesDocumentDraft,
  type SalesDocumentType,
  type SalesRecordDraft,
} from '@/features/admin/services/backofficeService'

export function useSalesRecords() {
  return useQuery({
    queryKey: ['admin-sales-records'],
    queryFn: () => backofficeService.getSalesRecords(),
  })
}

export function useCreateSalesRecord() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (draft: SalesRecordDraft) => backofficeService.createSalesRecord(draft),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-sales-records'] })
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      toast({ title: 'Vente créée' })
    },
    onError: (err: Error) => {
      toast({ title: 'Erreur création vente', description: err.message, variant: 'destructive' })
    },
  })
}

export function useUpdateSalesStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      backofficeService.updateSalesRecordStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-sales-records'] })
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      toast({ title: 'Statut mis à jour' })
    },
    onError: (err: Error) => {
      toast({ title: 'Erreur mise à jour statut', description: err.message, variant: 'destructive' })
    },
  })
}

export function useSalesDocuments(docType?: SalesDocumentType) {
  return useQuery({
    queryKey: ['admin-sales-documents', docType ?? 'all'],
    queryFn: () => backofficeService.getSalesDocuments(docType as SalesDocumentType | undefined),
  })
}

export function useCreateSalesDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (draft: SalesDocumentDraft) => backofficeService.createSalesDocument(draft),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin-sales-documents'] })
      qc.invalidateQueries({ queryKey: ['admin-sales-documents', vars.doc_type] })
      toast({ title: 'Document créé' })
    },
    onError: (err: Error) => {
      toast({ title: 'Erreur création document', description: err.message, variant: 'destructive' })
    },
  })
}

export function usePayments() {
  return useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => backofficeService.getPayments(),
  })
}

export function useCreatePayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (draft: PaymentDraft) => backofficeService.createPayment(draft),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-payments'] })
      toast({ title: 'Paiement enregistré' })
    },
    onError: (err: Error) => {
      toast({ title: 'Erreur paiement', description: err.message, variant: 'destructive' })
    },
  })
}

export function useAppSettings() {
  return useQuery({
    queryKey: ['admin-app-settings'],
    queryFn: () => backofficeService.getAppSettings(),
  })
}

export function useUpsertAppSetting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      key: string
      value?: string | null
      description?: string | null
      json_value?: object
    }) => backofficeService.upsertAppSetting(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-app-settings'] })
      toast({ title: 'Paramètres mis à jour' })
    },
    onError: (err: Error) => {
      toast({ title: 'Erreur paramètres', description: err.message, variant: 'destructive' })
    },
  })
}
