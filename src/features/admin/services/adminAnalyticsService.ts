import { supabase } from '@/lib/supabase'
import type { AnalyticsEvent } from '@/types/database.types'

export const adminAnalyticsService = {
  async getEvents(days: number): Promise<AnalyticsEvent[]> {
    const since = new Date()
    since.setDate(since.getDate() - days)

    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data ?? []) as AnalyticsEvent[]
  },
}
