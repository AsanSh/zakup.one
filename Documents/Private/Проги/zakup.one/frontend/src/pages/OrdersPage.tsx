import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/client'
import ClientHeader from '../components/ClientHeader'

interface OrderItem {
  id: number
  product: {
    id: number
    name: string
    unit: string
  }
  quantity: number
  price: number
  total_price: number
}

interface Order {
  id: number
  order_number?: string
  status: string
  delivery_address: string
  delivery_date: string | null
  comment: string
  created_at: string
  updated_at: string
  total_amount: number
  items: OrderItem[]
}

const statusLabels: Record<string, string> = {
  NEW: 'Новая',
  IN_PROGRESS: 'В обработке',
  COLLECTED: 'Собрана',
  DELIVERED: 'Доставлена',
}

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COLLECTED: 'bg-green-100 text-green-800',
  DELIVERED: 'bg-gray-100 text-gray-800',
}

// Конвертируем единицы измерения в маленькие буквы
const unitMap: Record<string, string> = {
  'M': 'м',
  'КГ': 'кг',
  'Шт': 'шт',
  'ШТ': 'шт',
  'м': 'м',
  'кг': 'кг',
  'шт': 'шт',
}

// Функция для конвертации единиц измерения
const displayUnit = (unit: string) => unitMap[unit] || unit.toLowerCase()

export default function OrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set())
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [editForm, setEditForm] = useState({
    delivery_address: '',
    delivery_date: '',
    comment: '',
  })
  const [removedItems, setRemovedItems] = useState<Set<number>>(new Set())

  useEffect(() => {
    loadOrders()
    
    // Обновляем при фокусе на окне
    const handleFocus = () => {
      loadOrders()
    }
    window.addEventListener('focus', handleFocus)
    
    // Обновляем при возврате на страницу (через visibility API)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadOrders()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])
  
  // Обновляем заявки при монтировании компонента (если пользователь перешел с другой страницы)
  useEffect(() => {
    // Загружаем сразу при монтировании
    loadOrders()
    
    // И еще раз через небольшую задержку для гарантии
    const timer = setTimeout(() => {
      loadOrders()
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      console.log('Начинаем загрузку заявок...')
      const response = await apiClient.get('/orders/')
      console.log('Полный ответ API:', response)
      console.log('Данные ответа:', response.data)
      console.log('Тип данных:', typeof response.data)
      console.log('Есть results?', 'results' in response.data)
      console.log('Есть count?', 'count' in response.data)
      
      // Обрабатываем разные форматы ответа
      let ordersData = []
      if (response.data && Array.isArray(response.data)) {
        ordersData = response.data
      } else if (response.data && response.data.results && Array.isArray(response.data.results)) {
        ordersData = response.data.results
      } else if (response.data && typeof response.data === 'object') {
        // Если это объект, но не массив, пробуем найти данные
        ordersData = []
      }
      
      console.log('Обработанные данные заявок:', ordersData)
      console.log('Количество заявок:', ordersData.length)
      
      setOrders(ordersData)
    } catch (error: any) {
      console.error('Ошибка загрузки заявок:', error)
      console.error('Статус ошибки:', error?.response?.status)
      console.error('Детали ошибки:', error?.response?.data)
      console.error('Заголовки запроса:', error?.config?.headers)
      setOrders([]) // Устанавливаем пустой массив при ошибке
    } finally {
      setLoading(false)
    }
  }

  const toggleOrder = (orderId: number) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(orderId)) {
        newSet.delete(orderId)
      } else {
        newSet.add(orderId)
      }
      return newSet
    })
  }

  const handleEditClick = (order: Order) => {
    setEditingOrder(order)
    setEditForm({
      delivery_address: order.delivery_address || '',
      delivery_date: order.delivery_date ? order.delivery_date.split('T')[0] : '',
      comment: order.comment || '',
    })
    setRemovedItems(new Set()) // Сбрасываем список удаленных товаров
  }

  const handleRemoveItem = (itemId: number) => {
    setRemovedItems(prev => {
      const newSet = new Set(prev)
      newSet.add(itemId)
      return newSet
    })
  }

  const handleSaveEdit = async () => {
    if (!editingOrder) return

    try {
      // Подготавливаем данные для обновления
      const updateData: any = {
        delivery_address: editForm.delivery_address,
        comment: editForm.comment,
      }

      if (editForm.delivery_date) {
        updateData.delivery_date = editForm.delivery_date
      }

      // Включаем только товары, которые не были удалены
      updateData.items = editingOrder.items
        .filter(item => !removedItems.has(item.id))
        .map(item => ({
          id: item.id,
          product_id: item.product.id,
          quantity: String(item.quantity),
        }))

      await apiClient.put(`/api/orders/${editingOrder.id}/`, updateData)
      
      // Обновляем список заявок
      await loadOrders()
      setEditingOrder(null)
      setRemovedItems(new Set())
      alert('Заявка успешно обновлена')
    } catch (error: any) {
      console.error('Ошибка обновления заявки:', error)
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          'Ошибка при обновлении заявки'
      alert(errorMessage)
    }
  }

  const handleCancelEdit = () => {
    setEditingOrder(null)
    setEditForm({
      delivery_address: '',
      delivery_date: '',
      comment: '',
    })
    setRemovedItems(new Set())
  }

  const handleDeleteOrder = async (orderId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту заявку? Это действие нельзя отменить.')) {
      return
    }

    try {
      // Используем стандартный REST endpoint для удаления
      await apiClient.delete(`/api/orders/${orderId}/`)
      await loadOrders()
      alert('Заявка успешно удалена')
    } catch (error: any) {
      console.error('Ошибка удаления заявки:', error)
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          error?.response?.data?.error ||
                          'Ошибка при удалении заявки'
      alert(errorMessage)
    }
  }

  const formatOrderNumber = (order: Order) => {
    // Если есть order_number, используем его
    if (order.order_number) {
      return order.order_number
    }
    // Fallback для старых заявок без order_number - генерируем из даты и id
    const date = new Date(order.created_at)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)
    const dateStr = `${day}${month}${year}` // ДДММГГ
    return `O${dateStr}-${order.id}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientHeader activeTab="orders" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" style={{ paddingTop: '5rem' }}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Мои заявки</h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Загрузка заявок...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">У вас пока нет заявок</p>
            <button
              onClick={() => navigate('/customer/products')}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Перейти к товарам
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {Array.isArray(orders) && orders.map((order) => {
              const isExpanded = expandedOrders.has(order.id)

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => toggleOrder(order.id)}
                >
                  {/* Заголовок заявки */}
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-shrink-0">
                          <span className="text-lg font-bold text-gray-900">{formatOrderNumber(order)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-sm text-gray-500">
                              {new Date(order.created_at).toLocaleDateString('ru-RU', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                              {statusLabels[order.status] || order.status}
                            </span>
                            <span className="text-sm text-gray-600">
                              {order.items.length} {order.items.length === 1 ? 'товар' : order.items.length < 5 ? 'товара' : 'товаров'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {Number(order.total_amount).toLocaleString('ru-RU')} сом
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditClick(order)
                              }}
                              className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              Редактировать
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteOrder(order.id)
                              }}
                              className="px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                            >
                              Удалить
                            </button>
                          </div>
                          <svg
                            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Раскрывающаяся детальная информация */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                      <div className="space-y-4">
                        {/* Адрес доставки */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Адрес доставки:</h4>
                          <p className="text-sm text-gray-600">{order.delivery_address || 'Не указан'}</p>
                        </div>

                        {/* Дата доставки */}
                        {order.delivery_date && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Желаемая дата доставки:</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(order.delivery_date).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                        )}

                        {/* Комментарий */}
                        {order.comment && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Комментарий:</h4>
                            <p className="text-sm text-gray-600">{order.comment}</p>
                          </div>
                        )}

                        {/* Список товаров */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Товары:</h4>
                          <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Товар</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Количество</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Цена</th>
                                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Сумма</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {order.items.map((item) => (
                                  <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 text-sm text-gray-900">{item.product.name}</td>
                                    <td className="px-4 py-2 text-sm text-gray-600">
                                      {Number(item.quantity).toLocaleString('ru-RU')} {displayUnit(item.product.unit)}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-600">
                                      {Number(item.price).toLocaleString('ru-RU')} сом
                                    </td>
                                    <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                                      {Number(item.total_price).toLocaleString('ru-RU')} сом
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className="bg-gray-50">
                                <tr>
                                  <td colSpan={3} className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                                    Итого:
                                  </td>
                                  <td className="px-4 py-2 text-sm font-bold text-gray-900 text-right">
                                    {Number(order.total_amount).toLocaleString('ru-RU')} сом
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Модальное окно редактирования */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Редактирование заявки {formatOrderNumber(editingOrder)}</h3>
            </div>
            <div className="px-4 sm:px-6 py-4 space-y-4">
              {/* Адрес доставки */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Адрес доставки
                </label>
                <textarea
                  value={editForm.delivery_address}
                  onChange={(e) => setEditForm({ ...editForm, delivery_address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  rows={3}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Дата доставки */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Желаемая дата доставки
                </label>
                <input
                  type="date"
                  value={editForm.delivery_date}
                  onChange={(e) => setEditForm({ ...editForm, delivery_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Комментарий */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Комментарий
                </label>
                <textarea
                  value={editForm.comment}
                  onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  rows={3}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Список товаров с возможностью удаления */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Товары в заявке
                </label>
                <div className="bg-gray-50 rounded-md border border-gray-200 p-3">
                  {editingOrder.items.filter(item => !removedItems.has(item.id)).length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Все товары удалены. Добавьте товары на странице "Товары".
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {editingOrder.items
                        .filter(item => !removedItems.has(item.id))
                        .map((item) => (
                          <li key={item.id} className="flex items-center justify-between py-2 px-3 bg-white rounded-md border border-gray-200">
                            <span className="text-sm text-gray-600 flex-1">
                              {item.product.name} - {Number(item.quantity).toLocaleString('ru-RU')} {displayUnit(item.product.unit)} × {Number(item.price).toLocaleString('ru-RU')} сом = {Number(item.total_price).toLocaleString('ru-RU')} сом
                            </span>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="ml-3 p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                              title="Удалить товар"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Для добавления новых товаров используйте страницу "Товары"
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
