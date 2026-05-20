import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const getPrimaryImage = (product) => {
  if (!product?.images?.length) return null
  const primary = product.images.find((img) => img.is_primary)
  return (primary || product.images[0])?.url || null
}

const buildLine = (product, variant, quantity) => ({
  productId: product.id,
  variantId: variant.id,
  name: product.name,
  slug: product.slug,
  categorySlug: product.category?.slug || null,
  price: Number(product.base_price) + Number(variant.price_modifier || 0),
  quantity,
  image: getPrimaryImage(product),
  color: variant.color || null,
  storage: variant.storage || null,
  stock: typeof variant.stock === 'number' ? variant.stock : 999,
})

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, variant, quantity = 1) => {
        if (!product || !variant) return
        const items = get().items
        const idx = items.findIndex(
          (it) => it.productId === product.id && it.variantId === variant.id
        )
        const stockLimit = typeof variant.stock === 'number' ? variant.stock : 999

        if (idx > -1) {
          const existing = items[idx]
          const newQty = Math.min(existing.quantity + quantity, stockLimit)
          const next = [...items]
          next[idx] = { ...existing, quantity: newQty, stock: stockLimit }
          set({ items: next })
        } else {
          const cappedQty = Math.min(Math.max(1, quantity), stockLimit)
          set({ items: [...items, buildLine(product, variant, cappedQty)] })
        }
      },

      removeItem: (productId, variantId) => {
        set({
          items: get().items.filter(
            (it) => !(it.productId === productId && it.variantId === variantId)
          ),
        })
      },

      updateQuantity: (productId, variantId, quantity) => {
        set({
          items: get().items.map((it) => {
            if (it.productId !== productId || it.variantId !== variantId) return it
            const max = typeof it.stock === 'number' ? it.stock : 999
            const clamped = Math.min(Math.max(1, quantity), max)
            return { ...it, quantity: clamped }
          }),
        })
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotalItems: () =>
        get().items.reduce((sum, it) => sum + it.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce((sum, it) => sum + it.price * it.quantity, 0),

      getItemCount: () => get().items.length,
    }),
    {
      name: 'zenitech-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
)
