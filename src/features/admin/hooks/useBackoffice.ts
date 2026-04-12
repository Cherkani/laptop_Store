import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'
import { backofficeService } from '@/features/admin/services/backofficeService'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/database.types'

export function useAdminProfiles() {
  return useQuery<Profile[]>({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_admin', true)
        .order('full_name')
      if (error) throw error
      return (data ?? []) as Profile[]
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useWhatsAppLeads() {
  return useQuery({
    queryKey: ['admin-whatsapp-leads'],
    queryFn: () => backofficeService.getWhatsAppLeads(),
    staleTime: 60 * 1000,
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
