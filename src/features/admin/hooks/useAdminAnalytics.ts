import { useQuery } from '@tanstack/react-query'
import { adminAnalyticsService } from '@/features/admin/services/adminAnalyticsService'

export function useAdminAnalytics(days: number) {
  return useQuery({
    queryKey: ['admin-analytics', days],
    queryFn: () => adminAnalyticsService.getEvents(days),
  })
}
