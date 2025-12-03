import { create } from 'zustand'

export interface CartItem {
  product_id: number
  name: string
  unit: string
  quantity: number
  price: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clear: () => void
  getTotalAmount: () => number
  getTotalItems: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (item) => set((state) => {
    const existing = state.items.find(i => i.product_id === item.product_id)
    if (existing) {
      return {
        items: state.items.map(i =>
          i.product_id === item.product_id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      }
    }
    return { items: [...state.items, item] }
  }),
  removeItem: (productId) => set((state) => ({
    items: state.items.filter(i => i.product_id !== productId)
  })),
  updateQuantity: (productId, quantity) => set((state) => ({
    items: state.items.map(i =>
      i.product_id === productId ? { ...i, quantity: Math.max(1, quantity) } : i
    )
  })),
  clear: () => set({ items: [] }),
  getTotalAmount: () => {
    const items = get().items
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  },
  getTotalItems: () => {
    const items = get().items
    return items.reduce((total, item) => total + item.quantity, 0)
  },
}))



