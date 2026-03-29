import { supabase } from '@/lib/supabase'
import type {
  AppSetting,
  Payment,
  SalesDocument,
  SalesRecord,
  SalesRecordItem,
  SalesRecordWithItems,
} from '@/types/database.types'

export type SalesRecordStatus =
  | 'new'
  | 'qualified'
  | 'quoted'
  | 'invoiced'
  | 'delivery'
  | 'sold'
  | 'paid'
  | 'cancelled'
  | 'lost'

export type SalesDocumentType = 'quote' | 'invoice' | 'delivery_note'
export type PaymentStatus = 'pending' | 'received' | 'failed' | 'refunded'

export type SalesRecordItemDraft = {
  product_id?: string | null
  product_name: string
  image_url?: string | null
  quantity: number
  unit_price: number
}

export type SalesRecordDraft = {
  id?: string
  client_name?: string | null
  client_phone?: string | null
  client_whatsapp?: string | null
  source?: string
  lead_title: string
  lead_message?: string | null
  status?: SalesRecordStatus
  currency?: string
  subtotal?: number
  total?: number
  product_snapshot?: unknown[]
  image_url?: string | null
  notes?: string | null
  items?: SalesRecordItemDraft[]
}

export type SalesDocumentDraft = {
  sales_record_id: string
  doc_type: SalesDocumentType
  doc_number?: string | null
  title?: string
  issue_date?: string
  due_date?: string | null
  status?: string
  amount_total?: number
}

export type PaymentDraft = {
  sales_record_id?: string | null
  sales_document_id?: string | null
  amount: number
  method?: string
  status?: PaymentStatus
  reference?: string | null
  notes?: string | null
  paid_at?: string | null
}

export const backofficeService = {
  async getSalesRecords(): Promise<SalesRecordWithItems[]> {
    const { data, error } = await supabase
      .from('sales_records')
      .select('*, sales_record_items(*)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data ?? []) as SalesRecordWithItems[]
  },

  async createSalesRecord(draft: SalesRecordDraft): Promise<SalesRecord> {
    const id = draft.id ?? crypto.randomUUID()
    const row = {
      id,
      client_name: draft.client_name ?? null,
      client_phone: draft.client_phone ?? null,
      client_whatsapp: draft.client_whatsapp ?? draft.client_phone ?? null,
      source: draft.source ?? 'manual',
      lead_title: draft.lead_title,
      lead_message: draft.lead_message ?? null,
      status: draft.status ?? 'new',
      currency: draft.currency ?? 'MAD',
      subtotal: draft.subtotal ?? 0,
      total: draft.total ?? 0,
      product_snapshot: draft.product_snapshot ?? [],
      image_url: draft.image_url ?? null,
      notes: draft.notes ?? null,
    }

    const { data, error } = await supabase
      .from('sales_records')
      .insert(row as never)
      .select()
      .single()

    if (error) throw error

    if (draft.items && draft.items.length > 0) {
      const items = draft.items.map(item => ({
        sales_record_id: id,
        product_id: item.product_id ?? null,
        product_name: item.product_name,
        image_url: item.image_url ?? null,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }))

      const { error: itemsError } = await supabase
        .from('sales_record_items')
        .insert(items as never)

      if (itemsError) throw itemsError
    }

    return data as unknown as SalesRecord
  },

  async updateSalesRecordStatus(id: string, status: string): Promise<SalesRecord> {
    const { data, error } = await supabase
      .from('sales_records')
      .update({ status } as never)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as unknown as SalesRecord
  },

  async getSalesDocuments(docType?: 'quote' | 'invoice' | 'delivery_note'): Promise<SalesDocument[]> {
    let query = supabase
      .from('sales_documents')
      .select('*')
      .order('created_at', { ascending: false })

    if (docType) {
      query = query.eq('doc_type', docType)
    }

    const { data, error } = await query
    if (error) throw error
    return (data ?? []) as SalesDocument[]
  },

  async createSalesDocument(draft: SalesDocumentDraft): Promise<SalesDocument> {
    const { data, error } = await supabase
      .from('sales_documents')
      .insert({
        sales_record_id: draft.sales_record_id,
        doc_type: draft.doc_type,
        doc_number: draft.doc_number ?? null,
        title: draft.title ?? `${draft.doc_type.toUpperCase()} ${new Date().toLocaleDateString()}`,
        issue_date: draft.issue_date ?? new Date().toISOString().slice(0, 10),
        due_date: draft.due_date ?? null,
        status: draft.status ?? 'draft',
        amount_total: draft.amount_total ?? 0,
      } as never)
      .select()
      .single()

    if (error) throw error
    return data as unknown as SalesDocument
  },

  async getPayments(): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data ?? []) as Payment[]
  },

  async createPayment(draft: PaymentDraft): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        sales_record_id: draft.sales_record_id ?? null,
        sales_document_id: draft.sales_document_id ?? null,
        amount: draft.amount,
        method: draft.method ?? 'cash',
        status: draft.status ?? 'received',
        reference: draft.reference ?? null,
        notes: draft.notes ?? null,
        paid_at: draft.paid_at ?? new Date().toISOString(),
      } as never)
      .select()
      .single()

    if (error) throw error
    return data as unknown as Payment
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

export type SalesRecordRow = SalesRecord
export type SalesRecordItemRow = SalesRecordItem
