import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'

interface LocalCartItem {
  productId: string
  quantity: number
}

interface CartState {
  items: LocalCartItem[]
  isOpen: boolean
  addItem: (productId: string, quantity?: number) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => void
  toggleCart: () => void
  closeCart: () => void
  syncWithSupabase: (userId: string) => Promise<void>
  getTotalItems: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: async (productId, quantity = 1) => {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          const { data: existing } = await supabase
            .from('cart_items')
            .select('id, quantity')
            .eq('user_id', session.user.id)
            .eq('product_id', productId)
            .single()

          if (existing) {
            const existingItem = existing as { id: string; quantity: number }
            await supabase
              .from('cart_items')
              .update({ quantity: existingItem.quantity + quantity, updated_at: new Date().toISOString() } as never)
              .eq('id', existingItem.id)
          } else {
            await supabase.from('cart_items').insert({
              user_id: session.user.id,
              product_id: productId,
              quantity,
            } as never)
          }
        }

        set(state => {
          const existing = state.items.find(i => i.productId === productId)
          if (existing) {
            return { items: state.items.map(i => i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i) }
          }
          return { items: [...state.items, { productId, quantity }] }
        })
      },

      removeItem: async (productId) => {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', session.user.id)
            .eq('product_id', productId)
        }

        set(state => ({ items: state.items.filter(i => i.productId !== productId) }))
      },

      updateQuantity: async (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          await supabase
            .from('cart_items')
            .update({ quantity, updated_at: new Date().toISOString() } as never)
            .eq('user_id', session.user.id)
            .eq('product_id', productId)
        }

        set(state => ({ items: state.items.map(i => i.productId === productId ? { ...i, quantity } : i) }))
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set(state => ({ isOpen: !state.isOpen })),

      closeCart: () => set({ isOpen: false }),

      syncWithSupabase: async (userId) => {
        const { data } = await supabase
          .from('cart_items')
          .select('product_id, quantity')
          .eq('user_id', userId)

        if (data) {
          const items = data as Array<{ product_id: string; quantity: number }>
          const localItems = get().items
          const merged = items.map(d => ({ productId: d.product_id, quantity: d.quantity }))

          for (const localItem of localItems) {
            const existing = merged.find(m => m.productId === localItem.productId)
            if (!existing) {
              merged.push(localItem)
              await supabase.from('cart_items').insert({
                user_id: userId,
                product_id: localItem.productId,
                quantity: localItem.quantity,
              } as never)
            }
          }

          set({ items: merged })
        }
      },

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'cart-storage',
      partialize: state => ({ items: state.items }),
    }
  )
)
