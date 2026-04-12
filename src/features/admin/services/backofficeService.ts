import { supabase } from '@/lib/supabase'
import type { AppSetting, SalesRecordWithItems } from '@/types/database.types'

export const backofficeService = {
  async getWhatsAppLeads(): Promise<SalesRecordWithItems[]> {
    const { data, error } = await supabase
      .from('sales_records')
      .select('*, sales_record_items(*)')
      .eq('source', 'whatsapp')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data ?? []) as SalesRecordWithItems[]
  },

  async getAppSettings(): Promise<AppSetting[]> {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .order('key')

    if (error) throw error
    return (data ?? []) as AppSetting[]
  },

  async upsertAppSetting(params: {
    key: string
    value?: string | null
    description?: string | null
    json_value?: object
  }): Promise<AppSetting> {
    const { data, error } = await supabase
      .from('app_settings')
      .upsert(
        {
          key: params.key,
          value: params.value ?? null,
          description: params.description ?? null,
          json_value: params.json_value ?? {},
        } as never,
        { onConflict: 'key' },
      )
      .select()
      .single()

    if (error) throw error
    return data as unknown as AppSetting
  },
}
