import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/client'
import Navbar from '../components/Navbar'
import ModernModal from '../components/ModernModal'

interface OrderItem {
  id: number
  product: {
    id: number
    name: string
    article: string
    unit: string
  }
  quantity: string
  price: string
}

interface Order {
  id: number
  order_number: string
  status: string
  created_at: string
  recipient_name: string
  recipient_phone: string
  delivery_address: string
  delivery_date: string | null
  comment: string
  payment_type: string
  invoice_number: string | null
  total_amount: string
  items: OrderItem[]
  company_name?: string
  company_inn?: string
}

const statusLabels: Record<string, string> = {
  NEW: 'Новая',
  PAID: 'Оплачена',
  IN_PROGRESS: 'В обработке',
  COLLECTED: 'Собрана',
  IN_DELIVERY: 'В доставке',
  DELIVERED: 'Доставлена',
  PROBLEMATIC: 'Проблемная',
  CANCELLED: 'Отменена',
  DEBT: 'Долг',
}

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  PAID: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COLLECTED: 'bg-purple-100 text-purple-800',
  IN_DELIVERY: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-gray-100 text-gray-800',
  PROBLEMATIC: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-300 text-gray-800',
  DEBT: 'bg-red-200 text-red-900',
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [hasTrackingAccess, setHasTrackingAccess] = useState(false)
  const [modal, setModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'info' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  })

  useEffect(() => {
    loadOrders()
    loadSubscriptionInfo()
  }, [])
  
  const loadSubscriptionInfo = async () => {
    try {
      const response = await apiClient.get('/api/auth/subscriptions/')
      const subscriptions = response.data.results || response.data || []
      const active = subscriptions.find((s: any) => s.is_active)
      if (active && active.plan) {
        // Трекинг доступен только для Стандарт и VIP
        setHasTrackingAccess(active.plan.delivery_tracking_available || false)
      }
    } catch (error) {
      console.error('Ошибка загрузки подписки:', error)
      setHasTrackingAccess(false)
    }
  }

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/api/orders/')
      const ordersData = response.data.results || response.data || []
      setOrders(Array.isArray(ordersData) ? ordersData : [])
    } catch (error: any) {
      console.error('Ошибка загрузки заказов:', error)
      
      // Извлекаем понятное сообщение об ошибке
      let errorMessage = 'Не удалось загрузить заказы'
      
      if (error.response?.data) {
        const data = error.response.data
        
        if (typeof data === 'object') {
          if (data.detail) {
            errorMessage = typeof data.detail === 'string' ? data.detail : String(data.detail)
          } else if (data.error) {
            errorMessage = typeof data.error === 'string' ? data.error : String(data.error)
          } else if (data.message) {
            errorMessage = typeof data.message === 'string' ? data.message : String(data.message)
          }
        } else if (typeof data === 'string') {
          errorMessage = data
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      // Убираем технические детали
      errorMessage = errorMessage
        .replace(/\{/g, '')
        .replace(/\}/g, '')
        .replace(/"/g, '')
        .replace(/detail:/gi, '')
        .replace(/error:/gi, '')
        .trim()
      
      setModal({
        isOpen: true,
        title: 'Ошибка загрузки',
        message: errorMessage,
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    total: orders.length,
    new: orders.filter(o => o.status === 'NEW').length,
    paid: orders.filter(o => o.status === 'PAID').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
    inProgress: orders.filter(o => o.status === 'IN_PROGRESS' || o.status === 'COLLECTED' || o.status === 'IN_DELIVERY').length,
    withInvoice: orders.filter(o => o.invoice_number).length,
    totalAmount: orders.reduce((sum, o) => sum + parseFloat(o.total_amount || '0'), 0),
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab="orders" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 lg:pb-8 pt-20">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Мои заявки</h1>

        {/* Statistics - Mobile Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
            <div className="text-xs sm:text-sm text-gray-500 mb-1">Всего</div>
            <div className="text-lg sm:text-xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
            <div className="text-xs sm:text-sm text-gray-500 mb-1">Новые</div>
            <div className="text-lg sm:text-xl font-bold text-blue-600">{stats.new}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
            <div className="text-xs sm:text-sm text-gray-500 mb-1">Оплачено</div>
            <div className="text-lg sm:text-xl font-bold text-green-600">{stats.paid}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
            <div className="text-xs sm:text-sm text-gray-500 mb-1">Доставлено</div>
            <div className="text-lg sm:text-xl font-bold text-gray-600">{stats.delivered}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
            <div className="text-xs sm:text-sm text-gray-500 mb-1">В работе</div>
            <div className="text-lg sm:text-xl font-bold text-yellow-600">{stats.inProgress}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 col-span-2 sm:col-span-1">
            <div className="text-xs sm:text-sm text-gray-500 mb-1">Со счетом</div>
            <div className="text-lg sm:text-xl font-bold text-purple-600">{stats.withInvoice}</div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Загрузка заказов...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Заявок пока нет</h2>
            <p className="text-gray-500 mb-6">Создайте первую заявку из корзины</p>
            <button
              onClick={() => navigate('/customer/products')}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Перейти к товарам
            </button>
          </div>
        ) : (
          <>
            {/* Mobile View - Cards */}
            <div className="lg:hidden space-y-3">
              {orders.map((order, orderIdx) => {
                const isExpanded = selectedOrder?.id === order.id
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-sm"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-200">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <button
                            onClick={() => navigate(`/tracking/${order.id}`)}
                            className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline break-words"
                          >
                            №{order.order_number || order.id}
                          </button>
                          {hasTrackingAccess ? (
                            <span className="text-xs text-green-600 flex-shrink-0" title="Трекинг доступен">📍</span>
                          ) : (
                            <span className="text-xs text-gray-400 flex-shrink-0" title="Трекинг недоступен (требуется тариф Стандарт или VIP)">🔒</span>
                          )}
                          <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full flex-shrink-0 ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                            {statusLabels[order.status] || order.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {formatDate(order.created_at)}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className="text-base font-bold text-gray-900 whitespace-nowrap">
                          {parseFloat(order.total_amount || '0').toLocaleString('ru-RU')} сом
                        </div>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className="min-w-0">
                        <div className="text-gray-500 text-[10px] mb-0.5">Получатель</div>
                        <div className="font-medium text-gray-900 truncate" title={order.recipient_name || ''}>
                          {order.recipient_name || '-'}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-gray-500 text-[10px] mb-0.5">Email</div>
                        <div className="font-medium text-gray-900 truncate" title={order.recipient_phone || ''}>
                          {order.recipient_phone || '-'}
                        </div>
                      </div>
                      <div className="col-span-2 min-w-0">
                        <div className="text-gray-500 text-[10px] mb-0.5">Адрес</div>
                        <div className="font-medium text-gray-900 break-words">{order.delivery_address || '-'}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-[10px] mb-0.5">Дата</div>
                        <div className="font-medium text-gray-900 whitespace-nowrap">
                          {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('ru-RU') : '-'}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-gray-500 text-[10px] mb-0.5">Оплата</div>
                        <div className="font-medium text-gray-900 truncate">
                          {order.payment_type === 'with_invoice' ? 'Со счетом' : 'Без счета'}
                        </div>
                        {order.invoice_number && (
                          <div className="text-[10px] text-gray-500 mt-0.5 truncate" title={order.invoice_number}>
                            №{order.invoice_number}
                          </div>
                        )}
                      </div>
                      {order.comment && (
                        <div className="col-span-2 min-w-0">
                          <div className="text-gray-500 text-[10px] mb-0.5">Комментарий</div>
                          <div className="font-medium text-gray-900 break-words">{order.comment}</div>
                        </div>
                      )}
                    </div>

                    {/* Items Toggle */}
                    <button
                      onClick={() => setSelectedOrder(isExpanded ? null : order)}
                      className="w-full flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-xs font-medium text-gray-700">
                        Товары ({order.items.length})
                      </span>
                      <svg
                        className={`w-4 h-4 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Expanded Items */}
                    {isExpanded && (
                      <div className="mt-3 space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="bg-gray-50 rounded-lg p-2">
                            <div className="font-medium text-xs text-gray-900 mb-1">{item.product.name}</div>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-gray-500">{item.product.article}</span>
                              <div className="text-right">
                                <div className="font-medium text-gray-900">
                                  {parseFloat(item.quantity).toLocaleString('ru-RU')} {item.product.unit}
                                </div>
                                <div className="text-gray-500">
                                  {parseFloat(item.price).toLocaleString('ru-RU')} сом
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden lg:block bg-white rounded-lg overflow-hidden border border-gray-200 overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Заявка
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Получатель
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Адрес
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Дата
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Комментарий
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Товары
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Email
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Оплата
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Сумма
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order, orderIdx) => {
                      const isEven = orderIdx % 2 === 0
                      const isExpanded = selectedOrder?.id === order.id

                      return (
                        <>
                          <tr key={order.id} className={`${isEven ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50/50 transition-colors`}>
                            <td className="px-3 py-2 text-sm">
                              <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => navigate(`/tracking/${order.id}`)}
                                className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                №{order.order_number || order.id}
                              </button>
                              {hasTrackingAccess ? (
                                <span className="text-xs text-green-600" title="Трекинг доступен">📍</span>
                              ) : (
                                <span className="text-xs text-gray-400" title="Трекинг недоступен (требуется тариф Стандарт или VIP)">🔒</span>
                              )}
                            </div>
                                <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                                  {statusLabels[order.status] || order.status}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {formatDate(order.created_at)}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900">
                              {order.recipient_name || '-'}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 max-w-[150px]">
                              <div className="truncate" title={order.delivery_address}>
                                {order.delivery_address || '-'}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">
                              {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('ru-RU') : '-'}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900 max-w-[120px]">
                              <div className="truncate" title={order.comment || ''}>
                                {order.comment || '-'}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-sm">
                              <button
                                onClick={() => setSelectedOrder(isExpanded ? null : order)}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                              >
                                <span>{order.items.length} {order.items.length === 1 ? 'товар' : order.items.length < 5 ? 'товара' : 'товаров'}</span>
                                <svg
                                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900">
                              <div className="truncate max-w-[150px]" title={order.recipient_phone}>
                                {order.recipient_phone || '-'}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900">
                              {order.payment_type === 'with_invoice' ? 'Со счетом' : 'Без счета'}
                              {order.invoice_number && (
                                <div className="text-xs text-gray-500 mt-0.5">
                                  №{order.invoice_number}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2 text-sm font-bold text-gray-900 whitespace-nowrap">
                              {parseFloat(order.total_amount || '0').toLocaleString('ru-RU')} сом
                            </td>
                          </tr>
                          {/* Expanded Items Row */}
                          {isExpanded && (
                            <tr className={`${isEven ? 'bg-white' : 'bg-gray-50'}`}>
                              <td colSpan={9} className="px-3 py-3">
                                <div className="bg-gray-100 rounded-lg p-3">
                                  <div className="text-xs font-semibold text-gray-700 mb-2">Товары:</div>
                                  <div className="space-y-1.5">
                                    {order.items.map((item) => (
                                      <div key={item.id} className="flex items-center justify-between text-xs bg-white rounded p-2">
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium text-gray-900 truncate">{item.product.name}</div>
                                          <div className="text-gray-500">{item.product.article}</div>
                                        </div>
                                        <div className="text-right ml-2">
                                          <div className="font-medium text-gray-900">
                                            {parseFloat(item.quantity).toLocaleString('ru-RU')} {item.product.unit}
                                          </div>
                                          <div className="text-gray-500">
                                            {parseFloat(item.price).toLocaleString('ru-RU')} сом
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      <ModernModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  )
}

