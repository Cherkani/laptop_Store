import { supabase } from '@/lib/supabase'
import type {
  BalanceEntry,
  CashSale,
  Client,
  Company,
  Purchase,
  Supplier,
} from '@/types/database.types'

export type ClientDraft = {
  id?: string
  name: string
  cin?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
}

export type CompanyDraft = {
  id?: string
  name: string
  ice?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
}

export type SupplierDraft = {
  id?: string
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
}

export type CashSaleDraft = {
  client_id?: string | null
  company_id?: string | null
  description?: string | null
  amount_ht: number
  tva?: number
  occurred_at?: string
}

export type BalanceEntryDraft = {
  entry_type: 'income' | 'expense' | 'adjustment'
  description?: string | null
  amount: number
  occurred_at?: string
  running_balance?: number
}

export const crmService = {
  async getClients(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data ?? []) as Client[]
  },

  async upsertClient(payload: ClientDraft): Promise<Client> {
    const row = {
      id: payload.id ?? crypto.randomUUID(),
      name: payload.name,
      cin: payload.cin ?? null,
      email: payload.email ?? null,
      phone: payload.phone ?? null,
      address: payload.address ?? null,
    }

    const { data, error } = await supabase
      .from('clients')
      .upsert(row as never, { onConflict: 'id' })
      .select()
      .single()

    if (error) throw error
    return data as unknown as Client
  },

  async deleteClient(id: string) {
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (error) throw error
  },

  async getCompanies(): Promise<Company[]> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data ?? []) as Company[]
  },

  async upsertCompany(payload: CompanyDraft): Promise<Company> {
    const row = {
      id: payload.id ?? crypto.randomUUID(),
      name: payload.name,
      ice: payload.ice ?? null,
      email: payload.email ?? null,
      phone: payload.phone ?? null,
      address: payload.address ?? null,
    }

    const { data, error } = await supabase
      .from('companies')
      .upsert(row as never, { onConflict: 'id' })
      .select()
      .single()

    if (error) throw error
    return data as unknown as Company
  },

  async deleteCompany(id: string) {
    const { error } = await supabase.from('companies').delete().eq('id', id)
    if (error) throw error
  },

  async getSuppliers(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data ?? []) as Supplier[]
  },

  async upsertSupplier(payload: SupplierDraft): Promise<Supplier> {
    const row = {
      id: payload.id ?? crypto.randomUUID(),
      name: payload.name,
      email: payload.email ?? null,
      phone: payload.phone ?? null,
      address: payload.address ?? null,
    }

    const { data, error } = await supabase
      .from('suppliers')
      .upsert(row as never, { onConflict: 'id' })
      .select()
      .single()

    if (error) throw error
    return data as unknown as Supplier
  },

  async deleteSupplier(id: string) {
    const { error } = await supabase.from('suppliers').delete().eq('id', id)
    if (error) throw error
  },

  async getCashSales(): Promise<CashSale[]> {
    const { data, error } = await supabase
      .from('cash_sales')
      .select('*')
      .order('occurred_at', { ascending: false })

    if (error) throw error
    return (data ?? []) as CashSale[]
  },

  async createCashSale(draft: CashSaleDraft): Promise<CashSale> {
    const amount_ht = draft.amount_ht ?? 0
    const tva = draft.tva ?? 0
    const amount_ttc = amount_ht + tva

    const { data, error } = await supabase
      .from('cash_sales')
      .insert({
        client_id: draft.client_id ?? null,
        company_id: draft.company_id ?? null,
        description: draft.description ?? null,
        amount_ht,
        tva,
        amount_ttc,
        occurred_at: draft.occurred_at ?? new Date().toISOString(),
      } as never)
      .select()
      .single()

    if (error) throw error
    return data as unknown as CashSale
  },

  async getBalanceEntries(): Promise<BalanceEntry[]> {
    const { data, error } = await supabase
      .from('balance_entries')
      .select('*')
      .order('occurred_at', { ascending: false })

    if (error) throw error
    return (data ?? []) as BalanceEntry[]
  },

  async createBalanceEntry(draft: BalanceEntryDraft): Promise<BalanceEntry> {
    const { data, error } = await supabase
      .from('balance_entries')
      .insert({
        entry_type: draft.entry_type,
        description: draft.description ?? null,
        amount: draft.amount,
        running_balance: draft.running_balance ?? 0,
        occurred_at: draft.occurred_at ?? new Date().toISOString(),
      } as never)
      .select()
      .single()

    if (error) throw error
    return data as unknown as BalanceEntry
  },

  async getPurchases(): Promise<Purchase[]> {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .order('purchased_at', { ascending: false })

    if (error) throw error
    return (data ?? []) as Purchase[]
  },
}
