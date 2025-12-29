import { create } from 'zustand'

export interface CartItem {
  product_id: number
  name: string
  article?: string
  unit: string
  quantity: number
  price: number
  image_url?: string
  supplier?: {
    id: number
    name: string
  }
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

export const useCartStore = create<CartStore>((set, get) => {
  // Загружаем корзину из localStorage при инициализации
  const loadFromStorage = (): CartItem[] => {
    try {
      const stored = localStorage.getItem('zakup-cart-storage')
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed.items || []
      }
    } catch (error) {
      console.error('Ошибка загрузки корзины из localStorage:', error)
    }
    return []
  }

  // Сохраняем корзину в localStorage
  const saveToStorage = (items: CartItem[]) => {
    try {
      localStorage.setItem('zakup-cart-storage', JSON.stringify({ items }))
    } catch (error) {
      console.error('Ошибка сохранения корзины в localStorage:', error)
    }
  }

  return {
    items: loadFromStorage(),
    addItem: (item) => {
      set((state) => {
        const existing = state.items.find(i => i.product_id === item.product_id)
        let newItems: CartItem[]
        if (existing) {
          newItems = state.items.map(i =>
            i.product_id === item.product_id
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          )
        } else {
          newItems = [...state.items, item]
        }
        saveToStorage(newItems)
        return { items: newItems }
      })
    },
    removeItem: (productId) => {
      set((state) => {
        const newItems = state.items.filter(i => i.product_id !== productId)
        saveToStorage(newItems)
        return { items: newItems }
      })
    },
    updateQuantity: (productId, quantity) => {
      set((state) => {
        const newItems = state.items.map(i =>
          i.product_id === productId ? { ...i, quantity: Math.max(1, quantity) } : i
        )
        saveToStorage(newItems)
        return { items: newItems }
      })
    },
    clear: () => {
      saveToStorage([])
      set({ items: [] })
    },
    getTotalAmount: () => {
      const items = get().items
      return items.reduce((total, item) => total + (item.price * item.quantity), 0)
    },
    getTotalItems: () => {
      const items = get().items
      return items.reduce((total, item) => total + item.quantity, 0)
    },
  }
})



