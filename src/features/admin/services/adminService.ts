import { supabase } from '@/lib/supabase'
import type { Delivery, Product, ProductImage, Specification } from '@/types/database.types'

export type ProductInsert = {
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
  // Sourcing / dropshipping — admin-only, never shown to customers
  source_url?: string | null
  source_price?: number | null
  margin_amount?: number | null
  is_available?: boolean
  image_source_url?: string | null
}

export type ProductUpdate = Partial<ProductInsert>

export const adminService = {
  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []) as Array<Product & { product_images: ProductImage[] }>
  },

  async createProduct(product: ProductInsert): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(product as never)
      .select()
      .single()
    if (error) throw error
    return data as unknown as Product
  },

  async updateProduct(id: string, product: ProductUpdate): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update({ ...product, updated_at: new Date().toISOString() } as never)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as unknown as Product
  },

  async deleteProduct(id: string) {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
  },

  async toggleAvailability(id: string, is_available: boolean) {
    const { error } = await supabase
      .from('products')
      .update({ is_available, updated_at: new Date().toISOString() } as never)
      .eq('id', id)
    if (error) throw error
  },

  // Mark as checked today (still available) — updates last_checked_at
  async markChecked(id: string) {
    const { error } = await supabase
      .from('products')
      .update({
        last_checked_at: new Date().toISOString(),
        is_available: true,
        availability_note: null,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', id)
    if (error) throw error
  },

  // Mark as sold/gone on the source — hide from catalog (legacy, no reason)
  async markUnavailable(id: string, note?: string) {
    const { error } = await supabase
      .from('products')
      .update({
        is_available: false,
        last_checked_at: new Date().toISOString(),
        availability_note: note ?? 'Vendu chez la source',
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', id)
    if (error) throw error
  },

  // Mark unavailable with a structured reason
  async markUnavailableWithReason(id: string, reason: string, note?: string) {
    const { error } = await supabase
      .from('products')
      .update({
        is_available: false,
        unavailable_reason: reason,
        last_checked_at: new Date().toISOString(),
        availability_note: note ?? null,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', id)
    if (error) throw error
  },

  // Set or unset Instagram posted state
  async setInstagramPosted(id: string, posted: boolean) {
    const { error } = await supabase
      .from('products')
      .update({
        instagram_posted_at: posted ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', id)
    if (error) throw error
  },

  // Bulk mark all given product ids as checked today
  async bulkMarkChecked(ids: string[]) {
    const now = new Date().toISOString()
    const { error } = await supabase
      .from('products')
      .update({
        last_checked_at: now,
        is_available: true,
        availability_note: null,
        updated_at: now,
      } as never)
      .in('id', ids)
    if (error) throw error
  },

  async uploadImage(file: File, productId: string): Promise<string> {
    const ext = file.name.split('.').pop()
    const path = `${productId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(path, file, { cacheControl: '3600', upsert: false })
    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    return data.publicUrl
  },

  async addProductImage(productId: string, imageUrl: string, displayOrder: number, isPrimary: boolean): Promise<ProductImage> {
    const { data, error } = await supabase
      .from('product_images')
      .insert({ product_id: productId, image_url: imageUrl, display_order: displayOrder, is_primary: isPrimary } as never)
      .select()
      .single()
    if (error) throw error
    return data as unknown as ProductImage
  },

  async updateProductImage(imageId: string, patch: { display_order?: number; is_primary?: boolean }) {
    const { error } = await supabase
      .from('product_images')
      .update(patch as never)
      .eq('id', imageId)
    if (error) throw error
  },

  async deleteProductImage(imageId: string, imagePath?: string | null) {
    if (imagePath) {
      await supabase.storage.from('product-images').remove([imagePath])
    }
    const { error } = await supabase.from('product_images').delete().eq('id', imageId)
    if (error) throw error
  },

  // ── Deliveries ────────────────────────────────────────────────

  async getDeliveries(): Promise<Delivery[]> {
    const { data, error } = await supabase
      .from('deliveries')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []) as Delivery[]
  },

  async createDelivery(draft: {
    product_id?: string | null
    product_name: string
    client_name?: string | null
    client_phone?: string | null
    address?: string | null
    notes?: string | null
  }): Promise<Delivery> {
    const { data, error } = await supabase
      .from('deliveries')
      .insert({ ...draft, status: 'pending' } as never)
      .select()
      .single()
    if (error) throw error
    return data as unknown as Delivery
  },

  async markDelivered(id: string, deliveredBy: string): Promise<void> {
    const { error } = await supabase
      .from('deliveries')
      .update({
        status: 'delivered',
        delivered_by: deliveredBy,
        delivered_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', id)
    if (error) throw error
  },

  async markDeliveryFailed(id: string): Promise<void> {
    const { error } = await supabase
      .from('deliveries')
      .update({ status: 'failed', updated_at: new Date().toISOString() } as never)
      .eq('id', id)
    if (error) throw error
  },

  async upsertSpecifications(productId: string, specs: Array<{ key: string; value: string }>) {
    await supabase.from('specifications').delete().eq('product_id', productId)
    if (specs.length > 0) {
      const { error } = await supabase.from('specifications').insert(
        specs.map(s => ({ product_id: productId, spec_key: s.key, spec_value: s.value })) as never
      )
      if (error) throw error
    }
  },

}
