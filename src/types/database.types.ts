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
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
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
          image_url: string
          display_order: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          image_url: string
          display_order?: number
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          image_url?: string
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
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type ProductImage = Database['public']['Tables']['product_images']['Row']
export type Specification = Database['public']['Tables']['specifications']['Row']
export type CartItem = Database['public']['Tables']['cart_items']['Row']

export type ProductWithImages = Product & {
  product_images: ProductImage[]
  specifications?: Specification[]
}

export type CartItemWithProduct = CartItem & {
  products: ProductWithImages
}
