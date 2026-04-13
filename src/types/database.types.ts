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
          display_name: string | null
          avatar_url: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          display_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          display_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
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
          instagram_posted_at: string | null
          unavailable_reason: string | null
          created_by: string | null
          updated_by: string | null
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
          instagram_posted_at?: string | null
          unavailable_reason?: string | null
          created_by?: string | null
          updated_by?: string | null
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
          instagram_posted_at?: string | null
          unavailable_reason?: string | null
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      deliveries: {
        Row: {
          id: string
          product_id: string | null
          product_name: string
          client_name: string | null
          client_phone: string | null
          address: string | null
          notes: string | null
          status: 'pending' | 'delivered' | 'failed'
          delivered_by: string | null
          delivered_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id?: string | null
          product_name: string
          client_name?: string | null
          client_phone?: string | null
          address?: string | null
          notes?: string | null
          status?: 'pending' | 'delivered' | 'failed'
          delivered_by?: string | null
          delivered_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string | null
          product_name?: string
          client_name?: string | null
          client_phone?: string | null
          address?: string | null
          notes?: string | null
          status?: 'pending' | 'delivered' | 'failed'
          delivered_by?: string | null
          delivered_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
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
      sales_records: {
        Row: {
          id: string
          client_name: string | null
          client_phone: string | null
          client_whatsapp: string | null
          source: string
          lead_title: string
          lead_message: string | null
          status: string
          currency: string
          subtotal: number
          total: number
          product_snapshot: Json
          image_url: string | null
          external_payload: Json
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_name?: string | null
          client_phone?: string | null
          client_whatsapp?: string | null
          source?: string
          lead_title?: string
          lead_message?: string | null
          status?: string
          currency?: string
          subtotal?: number
          total?: number
          product_snapshot?: Json
          image_url?: string | null
          external_payload?: Json
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_name?: string | null
          client_phone?: string | null
          client_whatsapp?: string | null
          source?: string
          lead_title?: string
          lead_message?: string | null
          status?: string
          currency?: string
          subtotal?: number
          total?: number
          product_snapshot?: Json
          image_url?: string | null
          external_payload?: Json
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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
      analytics_events: {
        Row: {
          id: string
          event_type: string
          product_id: string | null
          product_name: string | null
          page_path: string | null
          session_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          event_type: string
          product_id?: string | null
          product_name?: string | null
          page_path?: string | null
          session_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          event_type?: string
          product_id?: string | null
          product_name?: string | null
          page_path?: string | null
          session_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
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
export type Delivery = Database['public']['Tables']['deliveries']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type ProductImage = Database['public']['Tables']['product_images']['Row']
export type Specification = Database['public']['Tables']['specifications']['Row']
export type CartItem = Database['public']['Tables']['cart_items']['Row']
export type SalesRecord = Database['public']['Tables']['sales_records']['Row']
export type SalesRecordItem = Database['public']['Tables']['sales_record_items']['Row']
export type AppSetting = Database['public']['Tables']['app_settings']['Row']
export type AnalyticsEvent = Database['public']['Tables']['analytics_events']['Row']

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
