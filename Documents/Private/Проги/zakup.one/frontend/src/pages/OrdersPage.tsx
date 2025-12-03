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

  useEffect(() => {
    loadOrders()
    
    // Обновляем при фокусе на окне
    const handleFocus = () => {
      loadOrders()
    }
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const loadOrders = async () => {
    try {
      const response = await apiClient.get('/api/orders/')
      setOrders(response.data.results || response.data || [])
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error)
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

      // Включаем существующие товары
      updateData.items = editingOrder.items.map(item => ({
        id: item.id,
        product_id: item.product.id,
        quantity: String(item.quantity),
      }))

      await apiClient.put(`/api/orders/${editingOrder.id}/`, updateData)
      
      // Обновляем список заявок
      await loadOrders()
      setEditingOrder(null)
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
            {orders.map((order) => {
              const isExpanded = expandedOrders.has(order.id)
              const displayUnit = (unit: string) => unitMap[unit] || unit.toLowerCase()

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
                          <span className="text-lg font-bold text-gray-900">#{order.id}</span>
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditClick(order)
                            }}
                            className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            Редактировать
                          </button>
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
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Редактирование заявки #{editingOrder.id}</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
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

              {/* Список товаров (только просмотр) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Товары в заявке
                </label>
                <div className="bg-gray-50 rounded-md border border-gray-200 p-3">
                  <ul className="space-y-2">
                    {editingOrder.items.map((item) => (
                      <li key={item.id} className="text-sm text-gray-600">
                        {item.product.name} - {Number(item.quantity).toLocaleString('ru-RU')} {displayUnit(item.product.unit)} × {Number(item.price).toLocaleString('ru-RU')} сом = {Number(item.total_price).toLocaleString('ru-RU')} сом
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Для изменения товаров используйте страницу "Товары" и добавьте новые товары в заявку
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
