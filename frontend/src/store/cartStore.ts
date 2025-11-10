import { create } from 'zustand'

export interface CartItem {
  product_id: number
  name: string
  unit: string
  price: number
  quantity: number
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (item) => {
    const items = get().items
    const existingItem = items.find((i) => i.product_id === item.product_id)

    if (existingItem) {
      set({
        items: items.map((i) =>
          i.product_id === item.product_id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        ),
      })
    } else {
      set({
        items: [...items, { ...item, quantity: 1 }],
      })
    }
  },

  removeItem: (productId) => {
    set({
      items: get().items.filter((item) => item.product_id !== productId),
    })
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId)
      return
    }

    set({
      items: get().items.map((item) =>
        item.product_id === productId ? { ...item, quantity } : item
      ),
    })
  },

  clearCart: () => {
    set({ items: [] })
  },

  getTotal: () => {
    return get().items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
  },

  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0)
  },
}))

