/**
 * API клиент для админ-панели
 */
import apiClient from './axiosConfig'
import type {
  User,
  Product,
  Order,
  Supplier,
  ProductUpdateData,
  BulkPriceUpdateData,
  SupplierCreateData,
  OrderStatusUpdateData,
} from '../types'

export const adminApi = {
  // Пользователи
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get(`/admin/users`)
    return response.data
  },

  verifyUser: async (userId: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`/admin/users/${userId}/verify`)
    return response.data
  },

  activateUser: async (userId: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`/admin/users/${userId}/activate`)
    return response.data
  },

  deactivateUser: async (userId: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`/admin/users/${userId}/deactivate`)
    return response.data
  },

  // Заявки
  getOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get(`/admin/orders`)
    return response.data
  },

  updateOrderStatus: async (
    orderId: number,
    data: OrderStatusUpdateData
  ): Promise<{ success: boolean; status: string }> => {
    const response = await apiClient.post(`/admin/orders/${orderId}/status`, data)
    return response.data
  },

  // Товары
  getProducts: async (skip: number = 0, limit: number = 100): Promise<Product[]> => {
    const response = await apiClient.get(`/admin/products`, {
      params: { skip, limit },
    })
    return response.data
  },

  updateProduct: async (productId: number, data: ProductUpdateData): Promise<Product> => {
    const response = await apiClient.put(`/admin/products/${productId}`, data)
    return response.data
  },

  bulkUpdatePrices: async (data: BulkPriceUpdateData): Promise<{
    success: boolean
    message: string
    updated_count: number
  }> => {
    const response = await apiClient.post(`/admin/products/bulk-update-prices`, data)
    return response.data
  },

  // Поставщики
  getSuppliers: async (): Promise<Supplier[]> => {
    const response = await apiClient.get(`/admin/suppliers`)
    return response.data
  },

  createSupplier: async (data: SupplierCreateData): Promise<Supplier> => {
    const response = await apiClient.post(`/admin/suppliers`, data)
    return response.data
  },

  updateSupplier: async (supplierId: number, data: SupplierCreateData): Promise<Supplier> => {
    const response = await apiClient.put(`/admin/suppliers/${supplierId}`, data)
    return response.data
  },

  toggleSupplierActive: async (supplierId: number): Promise<{
    success: boolean
    is_active: boolean
  }> => {
    const response = await apiClient.post(`/admin/suppliers/${supplierId}/toggle-active`)
    return response.data
  },

  // Импорт прайс-листов
  importPriceList: async (
    file: File,
    supplierId: number,
    headerRow: number = 7,
    startRow: number = 8
  ): Promise<{ success: boolean; imported: number }> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('supplier_id', supplierId.toString())
    formData.append('header_row', headerRow.toString())
    formData.append('start_row', startRow.toString())
    const response = await apiClient.post(`/admin/import-price-list`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Статистика
  getStats: async (): Promise<{
    orders_by_status: Record<string, number>
    new_users_this_month: number
    total_turnover: number
    total_products: number
    orders_by_day: Array<{ date: string; count: number }>
    recent_orders: Array<{
      id: number
      user_name: string | null
      status: string
      created_at: string | null
      items_count: number
    }>
  }> => {
    const response = await apiClient.get(`/admin/stats`)
    return response.data
  },

  // Пользователи на модерации
  getPendingUsers: async (): Promise<User[]> => {
    const response = await apiClient.get(`/admin/users/pending`)
    return response.data
  },

  // Отклонить пользователя
  rejectUser: async (userId: number, reason?: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`/admin/users/${userId}/reject`, { reason: reason || null })
    return response.data
  },

  // Статистика по заявкам
  getOrdersStats: async (): Promise<{
    orders_by_status: Record<string, number>
    orders_this_month: number
    total_orders: number
  }> => {
    const response = await apiClient.get(`/admin/orders/stats`)
    return response.data
  },

  // Скачать и импортировать прайс-лист по URL
  downloadAndImportPriceList: async (
    supplierId: number,
    downloadUrl: string,
    frequency: string = 'manual',
    headerRow: number = 7,
    startRow: number = 8
  ): Promise<{
    success: boolean
    imported: number
    updated: number
    total_processed: number
    update_id: number
  }> => {
    const response = await apiClient.post(`/admin/price-lists/download-and-import`, {
      supplier_id: supplierId,
      download_url: downloadUrl,
      frequency,
      header_row: headerRow,
      start_row: startRow,
    })
    return response.data
  },

  // Получить список автоматических обновлений прайс-листов
  getPriceListUpdates: async (): Promise<Array<{
    id: number
    supplier_id: number
    supplier_name: string | null
    download_url: string
    frequency: string
    is_active: boolean
    last_update: string | null
    next_update: string | null
    last_imported_count: number
    last_updated_count: number
    last_error: string | null
  }>> => {
    const response = await apiClient.get(`/admin/price-lists/updates`)
    return response.data
  },

  // Обновить настройки автоматического обновления
  updatePriceListUpdate: async (
    updateId: number,
    data: {
      frequency?: string
      is_active?: boolean
      header_row?: number
      start_row?: number
    }
  ): Promise<{ success: boolean; update: any }> => {
    const response = await apiClient.put(`/admin/price-lists/updates/${updateId}`, data)
    return response.data
  },

  // Запустить обновление прайс-листа вручную
  runPriceListUpdate: async (updateId: number): Promise<{
    success: boolean
    imported?: number
    updated?: number
    total_processed?: number
    error?: string
  }> => {
    const response = await apiClient.post(`/admin/price-lists/updates/${updateId}/run`)
    return response.data
  },
}

