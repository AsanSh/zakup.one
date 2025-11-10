import { useEffect, useState } from 'react'
import { api, Order, DeliveryTracking } from '../api/api'
import { Loader2, Package, Truck, MapPin, Calendar, CheckCircle } from 'lucide-react'

const statusLabels: Record<string, string> = {
  new: 'Новая',
  in_progress: 'В обработке',
  collected: 'Собрана',
  shipped: 'Отправлена',
  in_transit: 'В пути',
  delivered: 'Доставлена',
  cancelled: 'Отменена',
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  collected: 'bg-green-100 text-green-800',
  shipped: 'bg-purple-100 text-purple-800',
  in_transit: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
}

const deliveryStatusLabels: Record<string, string> = {
  pending: 'Ожидает отправки',
  shipped: 'Отправлена',
  in_transit: 'В пути',
  out_for_delivery: 'В доставке',
  delivered: 'Доставлена',
  failed: 'Не удалось доставить',
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null)
  const [tracking, setTracking] = useState<DeliveryTracking | null>(null)
  const [loadingTracking, setLoadingTracking] = useState(false)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.getOrders()
        setOrders(data)
      } catch (error) {
        console.error('Ошибка загрузки заявок:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const fetchTracking = async (orderId: number) => {
    if (selectedOrder === orderId && tracking) {
      setSelectedOrder(null)
      setTracking(null)
      return
    }

    setLoadingTracking(true)
    setSelectedOrder(orderId)
    try {
      const data = await api.getOrderTracking(orderId)
      setTracking(data)
    } catch (error) {
      console.error('Ошибка загрузки отслеживания:', error)
      setTracking(null)
    } finally {
      setLoadingTracking(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Заявки отсутствуют
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Создайте первую заявку из корзины
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Мои заявки</h1>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                №
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Адрес доставки
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дата создания
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Отслеживание
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <>
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {order.delivery_address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        statusColors[order.status] || statusColors.new
                      }`}
                    >
                      {statusLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => fetchTracking(order.id)}
                      className="text-primary-600 hover:text-primary-800 flex items-center space-x-1"
                    >
                      <Truck className="h-4 w-4" />
                      <span>Отследить</span>
                    </button>
                  </td>
                </tr>
                {selectedOrder === order.id && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 bg-gray-50">
                      {loadingTracking ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                        </div>
                      ) : tracking && !tracking.error ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Отслеживание доставки
                            </h3>
                            <span
                              className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                                statusColors[tracking.status] || statusColors.new
                              }`}
                            >
                              {deliveryStatusLabels[tracking.status] || tracking.status}
                            </span>
                          </div>

                          {tracking.tracking_number && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Package className="h-4 w-4" />
                              <span>Номер отслеживания: <strong>{tracking.tracking_number}</strong></span>
                            </div>
                          )}

                          {tracking.carrier && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Truck className="h-4 w-4" />
                              <span>Перевозчик: <strong>{tracking.carrier}</strong></span>
                            </div>
                          )}

                          {tracking.current_location && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span>Текущее местоположение: <strong>{tracking.current_location}</strong></span>
                            </div>
                          )}

                          {tracking.destination && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span>Пункт назначения: <strong>{tracking.destination}</strong></span>
                            </div>
                          )}

                          {tracking.estimated_delivery_date && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>Ожидаемая доставка: <strong>{formatDate(tracking.estimated_delivery_date)}</strong></span>
                            </div>
                          )}

                          {tracking.shipped_at && (
                            <div className="flex items-center space-x-2 text-sm text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span>Отправлено: {formatDate(tracking.shipped_at)}</span>
                            </div>
                          )}

                          {tracking.delivered_at && (
                            <div className="flex items-center space-x-2 text-sm text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span>Доставлено: {formatDate(tracking.delivered_at)}</span>
                            </div>
                          )}

                          {tracking.events && tracking.events.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">История событий:</h4>
                              <div className="space-y-2">
                                {tracking.events.map((event) => (
                                  <div key={event.id} className="flex items-start space-x-3 text-sm bg-white p-3 rounded border border-gray-200">
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900">
                                        {deliveryStatusLabels[event.status] || event.status}
                                      </div>
                                      {event.location && (
                                        <div className="text-gray-600 text-xs mt-1">
                                          <MapPin className="h-3 w-3 inline mr-1" />
                                          {event.location}
                                        </div>
                                      )}
                                      {event.description && (
                                        <div className="text-gray-500 text-xs mt-1">{event.description}</div>
                                      )}
                                      {event.occurred_at && (
                                        <div className="text-gray-400 text-xs mt-1">
                                          {formatDate(event.occurred_at)}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          Информация об отслеживании пока недоступна
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
