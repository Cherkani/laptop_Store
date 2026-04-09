import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '../services/adminService'
import { toast } from '@/hooks/use-toast'

export function useAdminProducts() {
  return useQuery({
    queryKey: ['admin-products'],
    queryFn: () => adminService.getProducts(),
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast({ title: 'Product deleted successfully', variant: 'default' })
    },
    onError: (err: Error) => {
      toast({ title: 'Failed to delete product', description: err.message, variant: 'destructive' })
    },
  })
}

export function useToggleAvailability() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, is_available }: { id: string; is_available: boolean }) =>
      adminService.toggleAvailability(id, is_available),
    onSuccess: (_data, { is_available }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast({
        title: is_available ? 'Produit remis en vente' : 'Produit masqué du catalogue',
        variant: 'default',
      })
    },
    onError: (err: Error) => {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' })
    },
  })
}
