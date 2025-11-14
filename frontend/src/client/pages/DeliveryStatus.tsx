import { useEffect, useState } from 'react'
import { clientApi } from '../../shared/api'
import type { Order, DeliveryTracking } from '../../shared/types'
import { formatDate } from '../../shared/utils/formatters'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../shared/utils/constants'
import { Loader2, Package, Truck, MapPin, Calendar, CheckCircle, Clock, Navigation } from 'lucide-react'

const deliveryStatusLabels: Record<string, string> = {
  pending: 'Ожидает отправки',
  shipped: 'Отправлена',
  in_transit: 'В пути',
  out_for_delivery: 'В доставке',
  delivered: 'Доставлена',
  failed: 'Не удалось доставить',
}

interface DeliveryStatusOrder extends Order {
  tracking?: DeliveryTracking
  driver_location?: {
    latitude: number
    longitude: number
    last_updated: string
  }
  estimated_arrival?: string
}

export default function DeliveryStatus() {
  const [orders, setOrders] = useState<DeliveryStatusOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null)

  useEffect(() => {
    fetchActiveDeliveries()
    // Обновляем каждые 30 секунд для отслеживания в реальном времени
    const interval = setInterval(fetchActiveDeliveries, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchActiveDeliveries = async () => {
    try {
      setLoading(true)
      const data = await clientApi.getActiveDeliveries()
      setOrders(data)
    } catch (error) {
      console.error('Ошибка загрузки доставок:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    // Формула гаверсинуса для расчета расстояния между двумя точками
    const R = 6371 // Радиус Земли в км
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const calculateETA = (distance: number, avgSpeed: number = 50): string => {
    // Средняя скорость 50 км/ч в городе
    const hours = distance / avgSpeed
    if (hours < 1) {
      return `${Math.round(hours * 60)} минут`
    }
    return `${Math.round(hours * 10) / 10} часов`
  }

  if (loading && orders.length === 0) {
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
          Нет активных доставок
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Заказы, направленные на отправку, будут отображаться здесь
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Статус доставки</h1>
        <p className="text-sm text-gray-600 mt-2">
          Отслеживание заказов в реальном времени
        </p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => {
          const tracking = order.tracking
          const driverLocation = order.driver_location
          const isSelected = selectedOrder === order.id

          // Расчет расстояния и времени прибытия (если есть геолокация)
          let distance = null
          let eta = null
          if (driverLocation && tracking?.destination) {
            // В реальном приложении нужно получить координаты адреса доставки
            // Здесь используем примерные координаты
            const destLat = 42.8746 // Пример координат Бишкека
            const destLon = 74.5698
            distance = calculateDistance(
              driverLocation.latitude,
              driverLocation.longitude,
              destLat,
              destLon
            )
            eta = calculateETA(distance)
          }

          return (
            <div
              key={order.id}
              className="bg-white shadow rounded-lg overflow-hidden border border-gray-200"
            >
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setSelectedOrder(isSelected ? null : order.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Package className="h-8 w-8 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Заказ #{order.id}
                          </h3>
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                              ORDER_STATUS_COLORS[order.status] || ORDER_STATUS_COLORS.new
                            }`}
                          >
                            {ORDER_STATUS_LABELS[order.status] || order.status}
                          </span>
                          {tracking && (
                            <span
                              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                tracking.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                tracking.status === 'in_transit' || tracking.status === 'out_for_delivery' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {deliveryStatusLabels[tracking.status] || tracking.status}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          <MapPin className="h-4 w-4 inline mr-1" />
                          {order.delivery_address}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Создан: {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {driverLocation && (
                      <div className="text-right">
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Navigation className="h-4 w-4 text-primary-600" />
                          <span className="font-medium">В пути</span>
                        </div>
                        {distance !== null && (
                          <div className="text-xs text-gray-500">
                            {distance.toFixed(1)} км
                          </div>
                        )}
                        {eta && (
                          <div className="text-xs text-primary-600 font-medium">
                            ~{eta}
                          </div>
                        )}
                      </div>
                    )}
                    {tracking?.estimated_delivery_date && !driverLocation && (
                      <div className="text-right">
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>Ожидается: {formatDate(tracking.estimated_delivery_date)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {isSelected && tracking && (
                <div className="border-t border-gray-200 bg-gray-50 p-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {tracking.tracking_number && (
                        <div>
                          <p className="text-xs text-gray-500">Номер отслеживания</p>
                          <p className="text-sm font-medium text-gray-900">{tracking.tracking_number}</p>
                        </div>
                      )}
                      {tracking.carrier && (
                        <div>
                          <p className="text-xs text-gray-500">Перевозчик</p>
                          <p className="text-sm font-medium text-gray-900">{tracking.carrier}</p>
                        </div>
                      )}
                      {tracking.current_location && (
                        <div>
                          <p className="text-xs text-gray-500">Текущее местоположение</p>
                          <p className="text-sm font-medium text-gray-900 flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-primary-600" />
                            {tracking.current_location}
                          </p>
                        </div>
                      )}
                      {tracking.destination && (
                        <div>
                          <p className="text-xs text-gray-500">Пункт назначения</p>
                          <p className="text-sm font-medium text-gray-900 flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-green-600" />
                            {tracking.destination}
                          </p>
                        </div>
                      )}
                    </div>

                    {driverLocation && (
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <Navigation className="h-5 w-5 text-primary-600" />
                          <h4 className="font-semibold text-gray-900">Местоположение водителя</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Широта: {driverLocation.latitude.toFixed(6)}</p>
                            <p className="text-gray-600">Долгота: {driverLocation.longitude.toFixed(6)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">
                              Обновлено: {formatDate(driverLocation.last_updated)}
                            </p>
                            {distance !== null && (
                              <p className="text-primary-600 font-medium">
                                Расстояние: {distance.toFixed(1)} км
                              </p>
                            )}
                            {eta && (
                              <p className="text-primary-600 font-medium">
                                Примерное время прибытия: ~{eta}
                              </p>
                            )}
                          </div>
                        </div>
                        {/* Здесь можно добавить карту с маркером водителя */}
                        <div className="mt-4 bg-gray-100 rounded h-48 flex items-center justify-center">
                          <p className="text-gray-500 text-sm">Карта с местоположением водителя</p>
                        </div>
                      </div>
                    )}

                    {tracking.events && tracking.events.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">История событий</h4>
                        <div className="space-y-2">
                          {tracking.events.map((event) => (
                            <div
                              key={event.id}
                              className="flex items-start space-x-3 bg-white p-3 rounded border border-gray-200"
                            >
                              <div className="flex-shrink-0 mt-1">
                                {event.status === 'delivered' ? (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : event.status === 'in_transit' || event.status === 'out_for_delivery' ? (
                                  <Truck className="h-5 w-5 text-blue-600" />
                                ) : (
                                  <Clock className="h-5 w-5 text-yellow-600" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                  {deliveryStatusLabels[event.status] || event.status}
                                </div>
                                {event.location && (
                                  <div className="text-gray-600 text-sm mt-1 flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {event.location}
                                  </div>
                                )}
                                {event.description && (
                                  <div className="text-gray-500 text-sm mt-1">{event.description}</div>
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

                    {order.status === 'delivered' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <p className="text-green-800 font-medium">
                            Заказ доставлен и принят снабженцем
                          </p>
                        </div>
                        {tracking.delivered_at && (
                          <p className="text-green-700 text-sm mt-1">
                            Дата доставки: {formatDate(tracking.delivered_at)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}




