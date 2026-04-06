export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          id: string
          name: string
          cin: string | null
          email: string | null
          phone: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          cin?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          cin?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          id: string
          name: string
          ice: string | null
          email: string | null
          phone: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          ice?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          ice?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          original_price: number | null
          condition: string | null
          os: string | null
          brand: string
          processor: string
          ram: string
          storage: string
          graphics_card: string
          screen_size: string
          weight: string | null
          stock_quantity: number
          is_featured: boolean
          category: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          original_price?: number | null
          condition?: string | null
          os?: string | null
          brand: string
          processor: string
          ram: string
          storage: string
          graphics_card: string
          screen_size: string
          weight?: string | null
          stock_quantity?: number
          is_featured?: boolean
          category?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          original_price?: number | null
          condition?: string | null
          os?: string | null
          brand?: string
          processor?: string
          ram?: string
          storage?: string
          graphics_card?: string
          screen_size?: string
          weight?: string | null
          stock_quantity?: number
          is_featured?: boolean
          category?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          image_url: string | null
          image_data: string | null
          image_mime: string | null
          display_order: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          image_url?: string | null
          image_data?: string | null
          image_mime?: string | null
          display_order?: number
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          image_url?: string | null
          image_data?: string | null
          image_mime?: string | null
          display_order?: number
          is_primary?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      specifications: {
        Row: {
          id: string
          product_id: string
          spec_key: string
          spec_value: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          spec_key: string
          spec_value: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          spec_key?: string
          spec_value?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "specifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      purchases: {
        Row: {
          id: string
          product_id: string
          supplier_id: string | null
          qty: number
          unit_price: number
          additional_expenses: number
          total_spent: number
          purchase_price_per_unit: number
          purchased_at: string
          has_invoice: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          supplier_id?: string | null
          qty: number
          unit_price?: number
          additional_expenses?: number
          total_spent?: number
          purchase_price_per_unit?: number
          purchased_at?: string
          has_invoice?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          supplier_id?: string | null
          qty?: number
          unit_price?: number
          additional_expenses?: number
          total_spent?: number
          purchase_price_per_unit?: number
          purchased_at?: string
          has_invoice?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          }
        ]
      }
      balance_entries: {
        Row: {
          id: string
          entry_type: string
          description: string | null
          amount: number
          running_balance: number
          occurred_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          entry_type: string
          description?: string | null
          amount: number
          running_balance?: number
          occurred_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          entry_type?: string
          description?: string | null
          amount?: number
          running_balance?: number
          occurred_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      cash_sales: {
        Row: {
          id: string
          client_id: string | null
          company_id: string | null
          description: string | null
          amount_ht: number
          tva: number
          amount_ttc: number
          occurred_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id?: string | null
          company_id?: string | null
          description?: string | null
          amount_ht?: number
          tva?: number
          amount_ttc?: number
          occurred_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string | null
          company_id?: string | null
          description?: string | null
          amount_ht?: number
          tva?: number
          amount_ttc?: number
          occurred_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_sales_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_sales_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
      sales_records: {
        Row: {
          id: string
          client_name: string | null
          client_phone: string | null
          client_whatsapp: string | null
          client_id: string | null
          company_id: string | null
          source: string
          lead_title: string
          lead_message: string | null
          status: string
          currency: string
          subtotal: number
          total: number
          product_snapshot: Json
          image_url: string | null
          external_google_id: string | null
          external_payload: Json
          notes: string | null
          stock_deducted: boolean
          sold_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_name?: string | null
          client_phone?: string | null
          client_whatsapp?: string | null
          client_id?: string | null
          company_id?: string | null
          source?: string
          lead_title?: string
          lead_message?: string | null
          status?: string
          currency?: string
          subtotal?: number
          total?: number
          product_snapshot?: Json
          image_url?: string | null
          external_google_id?: string | null
          external_payload?: Json
          notes?: string | null
          stock_deducted?: boolean
          sold_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_name?: string | null
          client_phone?: string | null
          client_whatsapp?: string | null
          client_id?: string | null
          company_id?: string | null
          source?: string
          lead_title?: string
          lead_message?: string | null
          status?: string
          currency?: string
          subtotal?: number
          total?: number
          product_snapshot?: Json
          image_url?: string | null
          external_google_id?: string | null
          external_payload?: Json
          notes?: string | null
          stock_deducted?: boolean
          sold_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_records_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
      sales_record_items: {
        Row: {
          id: string
          sales_record_id: string
          product_id: string | null
          product_name: string
          image_url: string | null
          quantity: number
          unit_price: number
          line_total: number
          details: Json
          created_at: string
        }
        Insert: {
          id?: string
          sales_record_id: string
          product_id?: string | null
          product_name: string
          image_url?: string | null
          quantity?: number
          unit_price?: number
          details?: Json
          created_at?: string
        }
        Update: {
          id?: string
          sales_record_id?: string
          product_id?: string | null
          product_name?: string
          image_url?: string | null
          quantity?: number
          unit_price?: number
          details?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_record_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_record_items_sales_record_id_fkey"
            columns: ["sales_record_id"]
            isOneToOne: false
            referencedRelation: "sales_records"
            referencedColumns: ["id"]
          }
        ]
      }
      sales_documents: {
        Row: {
          id: string
          sales_record_id: string
          doc_type: string
          doc_number: string | null
          title: string
          issue_date: string
          due_date: string | null
          status: string
          amount_total: number
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sales_record_id: string
          doc_type: string
          doc_number?: string | null
          title?: string
          issue_date?: string
          due_date?: string | null
          status?: string
          amount_total?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sales_record_id?: string
          doc_type?: string
          doc_number?: string | null
          title?: string
          issue_date?: string
          due_date?: string | null
          status?: string
          amount_total?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_documents_sales_record_id_fkey"
            columns: ["sales_record_id"]
            isOneToOne: false
            referencedRelation: "sales_records"
            referencedColumns: ["id"]
          }
        ]
      }
      payments: {
        Row: {
          id: string
          sales_record_id: string | null
          sales_document_id: string | null
          amount: number
          method: string
          status: string
          reference: string | null
          paid_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sales_record_id?: string | null
          sales_document_id?: string | null
          amount?: number
          method?: string
          status?: string
          reference?: string | null
          paid_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sales_record_id?: string | null
          sales_document_id?: string | null
          amount?: number
          method?: string
          status?: string
          reference?: string | null
          paid_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_sales_document_id_fkey"
            columns: ["sales_document_id"]
            isOneToOne: false
            referencedRelation: "sales_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_sales_record_id_fkey"
            columns: ["sales_record_id"]
            isOneToOne: false
            referencedRelation: "sales_records"
            referencedColumns: ["id"]
          }
        ]
      }
      app_settings: {
        Row: {
          key: string
          value: string | null
          json_value: Json
          description: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          key: string
          value?: string | null
          json_value?: Json
          description?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          key?: string
          value?: string | null
          json_value?: Json
          description?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Client = Database['public']['Tables']['clients']['Row']
export type Company = Database['public']['Tables']['companies']['Row']
export type Supplier = Database['public']['Tables']['suppliers']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type ProductImage = Database['public']['Tables']['product_images']['Row']
export type Specification = Database['public']['Tables']['specifications']['Row']
export type Purchase = Database['public']['Tables']['purchases']['Row']
export type BalanceEntry = Database['public']['Tables']['balance_entries']['Row']
export type CashSale = Database['public']['Tables']['cash_sales']['Row']
export type CartItem = Database['public']['Tables']['cart_items']['Row']
export type SalesRecord = Database['public']['Tables']['sales_records']['Row']
export type SalesRecordItem = Database['public']['Tables']['sales_record_items']['Row']
export type SalesDocument = Database['public']['Tables']['sales_documents']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type AppSetting = Database['public']['Tables']['app_settings']['Row']

export type ProductWithImages = Product & {
  product_images: ProductImage[]
  specifications?: Specification[]
}

export type CartItemWithProduct = CartItem & {
  products: ProductWithImages
}

export type SalesRecordWithItems = SalesRecord & {
  sales_record_items: SalesRecordItem[]
}
