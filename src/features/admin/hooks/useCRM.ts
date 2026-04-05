import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'
import {
  crmService,
  type BalanceEntryDraft,
  type CashSaleDraft,
  type ClientDraft,
  type CompanyDraft,
  type SupplierDraft,
} from '@/features/admin/services/crmService'

export function useClients() {
  return useQuery({
    queryKey: ['admin-clients'],
    queryFn: () => crmService.getClients(),
  })
}

export function useUpsertClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ClientDraft) => crmService.upsertClient(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-clients'] })
      toast({ title: 'Client enregistré' })
    },
    onError: (err: Error) => {
      toast({ title: 'Erreur client', description: err.message, variant: 'destructive' })
    },
  })
}

export function useDeleteClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => crmService.deleteClient(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-clients'] })
      toast({ title: 'Client supprimé' })
    },
    onError: (err: Error) => {
      toast({ title: 'Erreur suppression', description: err.message, variant: 'destructive' })
    },
  })
}

export function useCompanies() {
  return useQuery({
    queryKey: ['admin-companies'],
    queryFn: () => crmService.getCompanies(),
  })
}

export function useUpsertCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CompanyDraft) => crmService.upsertCompany(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-companies'] })
      toast({ title: 'Entreprise enregistrée' })
    },
    onError: (err: Error) => {
      toast({ title: 'Erreur entreprise', description: err.message, variant: 'destructive' })
    },
  })
}

export function useDeleteCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => crmService.deleteCompany(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-companies'] })
      toast({ title: 'Entreprise supprimée' })
    },
    onError: (err: Error) => {
      toast({ title: 'Erreur suppression', description: err.message, variant: 'destructive' })
    },
  })
}

export function useSuppliers() {
  return useQuery({
    queryKey: ['admin-suppliers'],
    queryFn: () => crmService.getSuppliers(),
  })
}

export function useUpsertSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: SupplierDraft) => crmService.upsertSupplier(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-suppliers'] })
      toast({ title: 'Fournisseur enregistré' })
    },
    onError: (err: Error) => {
      toast({ title: 'Erreur fournisseur', description: err.message, variant: 'destructive' })
    },
  })
}

export function useDeleteSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => crmService.deleteSupplier(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-suppliers'] })
      toast({ title: 'Fournisseur supprimé' })
    },
    onError: (err: Error) => {
      toast({ title: 'Erreur suppression', description: err.message, variant: 'destructive' })
    },
  })
}

export function useCashSales() {
  return useQuery({
    queryKey: ['admin-cash-sales'],
    queryFn: () => crmService.getCashSales(),
  })
}

export function useCreateCashSale() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CashSaleDraft) => crmService.createCashSale(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-cash-sales'] })
      qc.invalidateQueries({ queryKey: ['admin-balance'] })
      toast({ title: 'Vente cash enregistrée' })
    },
    onError: (err: Error) => {
      toast({ title: 'Erreur vente cash', description: err.message, variant: 'destructive' })
    },
  })
}

export function useBalanceEntries() {
  return useQuery({
    queryKey: ['admin-balance'],
    queryFn: () => crmService.getBalanceEntries(),
  })
}

export function useCreateBalanceEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: BalanceEntryDraft) => crmService.createBalanceEntry(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-balance'] })
      toast({ title: 'Écriture comptable ajoutée' })
    },
    onError: (err: Error) => {
      toast({ title: 'Erreur écriture', description: err.message, variant: 'destructive' })
    },
  })
}
