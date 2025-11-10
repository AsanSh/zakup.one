import axios from 'axios'

const API_URL = '/api/v1'

export interface Product {
  id: number
  name: string
  article?: string
  unit?: string
  price: number
  category?: string
  country?: string
}

export interface Order {
  id: number
  status: string
  delivery_address: string
  tracking_number?: string
  estimated_delivery_date?: string
  created_at: string
}

export interface DeliveryTracking {
  order_id: number
  status: string
  tracking_number?: string
  carrier?: string
  current_location?: string
  destination?: string
  estimated_delivery_date?: string
  shipped_at?: string
  delivered_at?: string
  events: Array<{
    id: number
    status: string
    location?: string
    description?: string
    occurred_at?: string
  }>
}

export const api = {
  // Товары
  searchProducts: async (query: string, limit: number = 20): Promise<Product[]> => {
    const response = await axios.get(`${API_URL}/products/search`, {
      params: { q: query, limit },
    })
    return response.data
  },

  getProduct: async (id: number): Promise<Product> => {
    const response = await axios.get(`${API_URL}/products/${id}`)
    return response.data
  },

  // Заявки
  getOrders: async (): Promise<Order[]> => {
    const response = await axios.get(`${API_URL}/orders`)
    return response.data
  },

  createOrder: async (orderData: {
    items: Array<{ product_id: number; quantity: number }>
    delivery_address: string
    delivery_comment?: string
    delivery_date?: string
    contact_person?: string
    contact_phone?: string
  }): Promise<Order> => {
    const response = await axios.post(`${API_URL}/orders`, orderData)
    return response.data
  },

  // Отслеживание доставки
  getOrderTracking: async (orderId: number): Promise<DeliveryTracking> => {
    const response = await axios.get(`${API_URL}/orders/${orderId}/tracking`)
    return response.data
  },

  // Админ API
  admin: {
    getUsers: async () => {
      const response = await axios.get(`${API_URL}/admin/users`)
      return response.data
    },
    verifyUser: async (userId: number) => {
      const response = await axios.post(`${API_URL}/admin/users/${userId}/verify`)
      return response.data
    },
    activateUser: async (userId: number) => {
      const response = await axios.post(`${API_URL}/admin/users/${userId}/activate`)
      return response.data
    },
    deactivateUser: async (userId: number) => {
      const response = await axios.post(`${API_URL}/admin/users/${userId}/deactivate`)
      return response.data
    },
    getOrders: async () => {
      const response = await axios.get(`${API_URL}/admin/orders`)
      return response.data
    },
    updateOrderStatus: async (orderId: number, status: string, trackingNumber?: string, estimatedDeliveryDate?: string) => {
      const response = await axios.post(`${API_URL}/admin/orders/${orderId}/status`, {
        status,
        tracking_number: trackingNumber,
        estimated_delivery_date: estimatedDeliveryDate,
      })
      return response.data
    },
    getProducts: async (skip: number = 0, limit: number = 100) => {
      const response = await axios.get(`${API_URL}/admin/products`, {
        params: { skip, limit },
      })
      return response.data
    },
    updateProduct: async (productId: number, data: { price?: number; is_active?: boolean; category?: string; country?: string }) => {
      const response = await axios.put(`${API_URL}/admin/products/${productId}`, data)
      return response.data
    },
    getSuppliers: async () => {
      const response = await axios.get(`${API_URL}/admin/suppliers`)
      return response.data
    },
    createSupplier: async (data: { name: string; contact_email?: string; contact_phone?: string }) => {
      const response = await axios.post(`${API_URL}/admin/suppliers`, data)
      return response.data
    },
    importPriceList: async (file: File, supplierId: number, headerRow: number = 7, startRow: number = 8) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('supplier_id', supplierId.toString())
      formData.append('header_row', headerRow.toString())
      formData.append('start_row', startRow.toString())
      const response = await axios.post(`${API_URL}/admin/import-price-list`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    },
    bulkUpdatePrices: async (data: { type: 'percent' | 'fixed'; value: number; category?: string; supplier_id?: number }) => {
      const response = await axios.post(`${API_URL}/admin/products/bulk-update-prices`, data)
      return response.data
    },
    updateSupplier: async (supplierId: number, data: { name: string; contact_email?: string; contact_phone?: string }) => {
      const response = await axios.put(`${API_URL}/admin/suppliers/${supplierId}`, data)
      return response.data
    },
    toggleSupplierActive: async (supplierId: number) => {
      const response = await axios.post(`${API_URL}/admin/suppliers/${supplierId}/toggle-active`)
      return response.data
    },
  },
}

