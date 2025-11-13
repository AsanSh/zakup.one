/**
 * API клиент для клиентской части
 */
import apiClient from './axiosConfig'
import type { Product, Order, OrderCreateData, DeliveryTracking } from '../types'

export const clientApi = {
  // Товары
  searchProducts: async (query: string, limit: number = 20): Promise<Product[]> => {
    const response = await apiClient.get(`/products/search`, {
      params: { q: query, limit },
    })
    return response.data
  },

  getProduct: async (id: number): Promise<Product> => {
    const response = await apiClient.get(`/products/${id}`)
    return response.data
  },

  // Заявки
  getOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get(`/orders`)
    return response.data
  },

  createOrder: async (orderData: OrderCreateData): Promise<Order> => {
    const response = await apiClient.post(`/orders`, orderData)
    return response.data
  },

  // Отслеживание доставки
  getOrderTracking: async (orderId: number): Promise<DeliveryTracking> => {
    const response = await apiClient.get(`/orders/${orderId}/tracking`)
    return response.data
  },

  // Активные доставки (со статусом shipped и выше)
  getActiveDeliveries: async (): Promise<Array<Order & { tracking?: DeliveryTracking; driver_location?: { latitude: number; longitude: number; last_updated: string }; estimated_arrival?: string }>> => {
    const response = await apiClient.get(`/orders/active-deliveries`)
    return response.data
  },
}

