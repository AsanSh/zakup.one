import { create } from 'zustand'
import apiClient from '../api/client'

export interface OrderItem {
  id: number
  product: {
    id: number
    name: string
    article: string
    unit: string
  }
  quantity: number
  price: number
  total_price: number
}

export interface Order {
  id: number
  order_number: string
  status: string
  payment_type: 'without_invoice' | 'with_invoice'
  recipient_name: string
  recipient_phone: string
  delivery_address: string
  delivery_date: string | null
  comment: string
  company_name?: string
  company_inn?: string
  company_bank?: string
  company_account?: string
  company_legal_address?: string
  invoice_number?: string
  created_at: string
  updated_at: string
  total_amount: number
  items: OrderItem[]
}

interface OrdersStore {
  orders: Order[]
  loading: boolean
  error: string | null
  fetchOrders: (filters?: any) => Promise<void>
  getOrder: (id: number) => Promise<Order | null>
  clearOrders: () => void
}

export const useOrdersStore = create<OrdersStore>((set, get) => ({
  orders: [],
  loading: false,
  error: null,

  fetchOrders: async (filters = {}) => {
    set({ loading: true, error: null })
    try {
      const params = new URLSearchParams()
      
      // Добавляем фильтры в параметры запроса
      if (filters.status) {
        params.append('status', filters.status)
      }
      if (filters.dateRange && filters.dateRange !== 'all') {
        const now = new Date()
        let startDate: Date
        
        switch (filters.dateRange) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            break
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            break
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1)
            break
          case 'custom':
            if (filters.startDate) {
              params.append('start_date', filters.startDate)
            }
            if (filters.endDate) {
              params.append('end_date', filters.endDate)
            }
            break
        }
        
        if (filters.dateRange !== 'custom' && startDate) {
          params.append('start_date', startDate.toISOString().split('T')[0])
        }
      }
      
      const response = await apiClient.get(`/api/orders/?${params.toString()}`)
      set({ orders: response.data.results || response.data || [], loading: false })
    } catch (error: any) {
      console.error('Ошибка загрузки заказов:', error)
      set({ error: error.response?.data?.detail || 'Ошибка загрузки заказов', loading: false })
    }
  },

  getOrder: async (id: number) => {
    try {
      const response = await apiClient.get(`/api/orders/${id}/`)
      return response.data
    } catch (error: any) {
      console.error('Ошибка загрузки заказа:', error)
      set({ error: error.response?.data?.detail || 'Ошибка загрузки заказа' })
      return null
    }
  },

  clearOrders: () => {
    set({ orders: [], error: null })
  },
}))
