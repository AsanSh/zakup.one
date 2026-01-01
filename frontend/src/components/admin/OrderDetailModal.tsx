import { useState, useEffect } from 'react'
import apiClient from '../../api/client'
import YandexAddressInput from '../YandexAddressInput'

interface Order {
  id: number
  order_number: string
  client: { email: string; full_name: string }
  status: string
  total_amount: number
  created_at: string
  delivery_address: string
  recipient_name: string
  recipient_phone: string
  items: Array<{ product: { name: string }; quantity: number; price: number }>
}

interface Tracking {
  id: number
  status: string
  driver_name: string | null
  driver_phone: string | null
  vehicle_number: string | null
  pickup_address: string | null
  pickup_lat: number | null
  pickup_lng: number | null
  current_lat: number | null
  current_lng: number | null
  eta_minutes: number | null
  is_active: boolean
}

interface OrderDetailModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

const ORDER_STATUSES = {
  'NEW': 'Новая',
  'PAID': 'Оплачена',
  'IN_PROGRESS': 'В обработке',
  'COLLECTED': 'Собрана',
  'IN_DELIVERY': 'В доставке',
  'DELIVERED': 'Доставлена',
  'PROBLEMATIC': 'Проблемная',
  'CANCELLED': 'Отменена',
}

const TRACKING_STATUSES = {
  'WAITING_FOR_DRIVER': 'Ожидание водителя',
  'DRIVER_ASSIGNED': 'Водитель назначен',
  'WAITING_FOR_LOADING': 'Ожидает погрузки',
  'ON_THE_WAY_TO_PICKUP': 'Едет к складу',
  'ARRIVED_AT_PICKUP': 'Прибыл на склад',
  'LOADED': 'Загружен',
  'ON_THE_WAY_TO_DESTINATION': 'В пути к получателю',
  'DELIVERED_PENDING_CONFIRM': 'Доставлен (ожидает подтверждения)',
  'COMPLETED': 'Завершён',
}

const ORDER_STATUS_TO_TRACKING = {
  'IN_PROGRESS': 'WAITING_FOR_LOADING',
  'COLLECTED': 'WAITING_FOR_LOADING',
}

export default function OrderDetailModal({ order, isOpen, onClose, onUpdate }: OrderDetailModalProps) {
  const [tracking, setTracking] = useState<Tracking | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Форма управления
  const [orderStatus, setOrderStatus] = useState('')
  const [trackingStatus, setTrackingStatus] = useState('')
  const [driverName, setDriverName] = useState('')
  const [driverPhone, setDriverPhone] = useState('')
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [pickupAddress, setPickupAddress] = useState('')
  const [pickupLat, setPickupLat] = useState<number | null>(null)
  const [pickupLng, setPickupLng] = useState<number | null>(null)
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryLat, setDeliveryLat] = useState<number | null>(null)
  const [deliveryLng, setDeliveryLng] = useState<number | null>(null)

  useEffect(() => {
    if (isOpen && order) {
      loadOrderDetails()
    }
  }, [isOpen, order])

  // Функция для геокодирования адреса доставки
  const geocodeDeliveryAddress = async (address: string) => {
    if (!address || address.trim().length === 0) return
    
    try {
      // Добавляем "Бишкек, Кыргызстан" если не указано
      let searchAddress = address.trim()
      const lowerAddr = searchAddress.toLowerCase()
      if (!lowerAddr.includes('бишкек') && !lowerAddr.includes('bishkek')) {
        searchAddress = `Бишкек, Кыргызстан, ${searchAddress}`
      }
      
      const response = await fetch(
        `https://geocode-maps.yandex.ru/1.x/?apikey=81614ef6-1f7f-4808-ad6a-7866dca2a480&geocode=${encodeURIComponent(searchAddress)}&format=json&lang=ru_RU`
      )

      if (response.ok) {
        const data = await response.json()
        if (
          data.response &&
          data.response.GeoObjectCollection &&
          data.response.GeoObjectCollection.featureMember &&
          data.response.GeoObjectCollection.featureMember.length > 0
        ) {
          const geoObject = data.response.GeoObjectCollection.featureMember[0].GeoObject
          const pos = geoObject.Point?.pos?.split(' ') || []
          if (pos.length >= 2) {
            const lng = parseFloat(pos[0])
            const lat = parseFloat(pos[1])
            setDeliveryLat(lat)
            setDeliveryLng(lng)
            console.log('Адрес доставки геокодирован:', lat, lng)
          }
        }
      }
    } catch (error) {
      console.error('Ошибка геокодирования адреса доставки:', error)
    }
  }

  // Функция для геокодирования адреса погрузки
  const geocodePickupAddress = async (address: string) => {
    if (!address || address.trim().length === 0) return
    
    try {
      // Добавляем "Бишкек, Кыргызстан" если не указано
      let searchAddress = address.trim()
      const lowerAddr = searchAddress.toLowerCase()
      if (!lowerAddr.includes('бишкек') && !lowerAddr.includes('bishkek')) {
        searchAddress = `Бишкек, Кыргызстан, ${searchAddress}`
      }
      
      const response = await fetch(
        `https://geocode-maps.yandex.ru/1.x/?apikey=81614ef6-1f7f-4808-ad6a-7866dca2a480&geocode=${encodeURIComponent(searchAddress)}&format=json&lang=ru_RU`
      )

      if (response.ok) {
        const data = await response.json()
        if (
          data.response &&
          data.response.GeoObjectCollection &&
          data.response.GeoObjectCollection.featureMember &&
          data.response.GeoObjectCollection.featureMember.length > 0
        ) {
          const geoObject = data.response.GeoObjectCollection.featureMember[0].GeoObject
          const pos = geoObject.Point?.pos?.split(' ') || []
          if (pos.length >= 2) {
            const lng = parseFloat(pos[0])
            const lat = parseFloat(pos[1])
            setPickupLat(lat)
            setPickupLng(lng)
            console.log('Адрес погрузки геокодирован:', lat, lng)
          }
        }
      }
    } catch (error) {
      console.error('Ошибка геокодирования адреса погрузки:', error)
    }
  }

  const loadOrderDetails = async () => {
    if (!order) return
    
    setLoading(true)
    setError(null)
    try {
      // Загружаем детали заявки
      const orderRes = await apiClient.get(`/api/orders/${order.id}/`)
      const orderData = orderRes.data
      setOrderStatus(orderData.status)
      const deliveryAddr = orderData.delivery_address || ''
      setDeliveryAddress(deliveryAddr)

      // Автоматически геокодируем адрес доставки при загрузке
      if (deliveryAddr && deliveryAddr.trim().length > 0) {
        geocodeDeliveryAddress(deliveryAddr)
      }

      // Загружаем трекинг
      try {
        const trackingRes = await apiClient.get(`/api/orders/tracking/?order=${order.id}`)
        const trackingData = trackingRes.data
        if (trackingData && !Array.isArray(trackingData)) {
          setTracking(trackingData)
          setTrackingStatus(trackingData.status || 'WAITING_FOR_DRIVER')
          setDriverName(trackingData.driver_name || '')
          setDriverPhone(trackingData.driver_phone || '')
          setVehicleNumber(trackingData.vehicle_number || '')
          const pickupAddr = trackingData.pickup_address || ''
          setPickupAddress(pickupAddr)
          setPickupLat(trackingData.pickup_lat || null)
          setPickupLng(trackingData.pickup_lng || null)
          
          // Если адрес погрузки есть, но координат нет, геокодируем
          if (pickupAddr && pickupAddr.trim().length > 0 && !trackingData.pickup_lat && !trackingData.pickup_lng) {
            geocodePickupAddress(pickupAddr)
          }
        }
      } catch (e) {
        console.log('Трекинг не найден, будет создан при сохранении')
      }
    } catch (error: any) {
      console.error('Ошибка загрузки деталей:', error)
      setError(error?.response?.data?.error || 'Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!order) return

    setSaving(true)
    setError(null)

    try {
      // Обновляем статус заявки и адрес доставки
      const orderUpdateData: any = {}
      if (orderStatus !== order.status) {
        orderUpdateData.status = orderStatus
      }
      if (deliveryAddress !== order.delivery_address) {
        orderUpdateData.delivery_address = deliveryAddress
      }
      
      if (Object.keys(orderUpdateData).length > 0) {
        await apiClient.patch(`/api/orders/${order.id}/`, orderUpdateData)
      }

      // Получаем или создаем трекинг через GET (метод list автоматически создаст если не существует)
      let trackingToUpdate = tracking
      
      if (!trackingToUpdate || !trackingToUpdate.id) {
        try {
          // GET запрос автоматически создаст трекинг если его нет (см. метод list в DeliveryTrackingViewSet)
          const getRes = await apiClient.get(`/api/orders/tracking/?order=${order.id}`)
          if (getRes.data && !Array.isArray(getRes.data) && getRes.data.id) {
            trackingToUpdate = getRes.data
            setTracking(trackingToUpdate)
          } else {
            throw new Error('Трекинг не был получен или создан')
          }
        } catch (getError: any) {
          console.error('Ошибка получения/создания трекинга:', getError)
          const errorMsg = getError?.response?.data?.error || 
                         getError?.response?.data?.detail ||
                         getError?.message ||
                         'Не удалось получить или создать трекинг'
          throw new Error(errorMsg)
        }
      }
      
      // Обновляем трекинг
      if (trackingToUpdate && trackingToUpdate.id) {
        try {
          // Пробуем через update_status endpoint
          await apiClient.patch(`/api/orders/tracking/${trackingToUpdate.id}/update_status/`, {
            status: trackingStatus,
            driver_name: driverName || '',
            driver_phone: driverPhone || '',
            vehicle_number: vehicleNumber || '',
            pickup_address: pickupAddress || '',
            pickup_lat: pickupLat,
            pickup_lng: pickupLng,
          })
        } catch (updateError: any) {
          console.log('update_status не сработал, пробуем обычный PATCH:', updateError?.response?.data)
          // Если не работает update_status, пробуем обычный PATCH
          try {
            await apiClient.patch(`/api/orders/tracking/${trackingToUpdate.id}/`, {
              status: trackingStatus,
              driver_name: driverName || '',
              driver_phone: driverPhone || '',
              vehicle_number: vehicleNumber || '',
              pickup_address: pickupAddress || '',
              pickup_lat: pickupLat,
              pickup_lng: pickupLng,
            })
          } catch (patchError: any) {
            console.error('Ошибка обновления трекинга:', patchError)
            throw new Error(patchError?.response?.data?.error || patchError?.response?.data?.detail || 'Ошибка обновления трекинга')
          }
        }
      } else {
        throw new Error('Не удалось получить ID трекинга для обновления')
      }

      onUpdate()
      onClose()
    } catch (error: any) {
      console.error('Ошибка сохранения:', error)
      const errorMessage = error?.message || error?.response?.data?.error || error?.response?.data?.detail || 'Ошибка сохранения данных'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handlePickupLocationChange = (lat: number, lng: number) => {
    setPickupLat(lat)
    setPickupLng(lng)
  }

  if (!isOpen || !order) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Управление заявкой</h3>
            <p className="text-sm text-gray-600 mt-1">#{order.order_number || order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-600">Загрузка...</p>
            </div>
          ) : (
            <>
              {/* Информация о заявке */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Информация о заявке</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Клиент:</span>
                    <p className="font-medium text-gray-900">{order.client.full_name || order.client.email}</p>
                    <p className="text-gray-500 text-xs">{order.client.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Получатель:</span>
                    <p className="font-medium text-gray-900">{order.recipient_name}</p>
                    <p className="text-gray-500 text-xs">{order.recipient_phone}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Адрес доставки:</span>
                    <p className="font-medium text-gray-900">{deliveryAddress || order.delivery_address}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Сумма:</span>
                    <p className="font-medium text-indigo-600 text-lg">
                      {Number(order.total_amount || 0).toLocaleString('ru-RU')} сом
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Дата создания:</span>
                    <p className="font-medium text-gray-900">
                      {new Date(order.created_at).toLocaleString('ru-RU')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Статус заявки */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Статус заявки
                </label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {Object.entries(ORDER_STATUSES).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Адрес доставки (редактируемый) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Адрес доставки
                </label>
                <YandexAddressInput
                  value={deliveryAddress}
                  onChange={(address) => {
                    setDeliveryAddress(address)
                    // Автоматически геокодируем при изменении
                    if (address && address.trim().length > 3) {
                      setTimeout(() => geocodeDeliveryAddress(address), 500)
                    }
                  }}
                  onLocationChange={(lat, lng) => {
                    setDeliveryLat(lat)
                    setDeliveryLng(lng)
                  }}
                  placeholder="Введите адрес доставки"
                />
                {deliveryLat && deliveryLng && (
                  <p className="mt-2 text-xs text-green-600">
                    ✓ Координаты определены: {deliveryLat.toFixed(6)}, {deliveryLng.toFixed(6)}
                  </p>
                )}
              </div>

              {/* Управление доставкой */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Управление доставкой</h4>
                
                {/* Статус трекинга */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Статус доставки
                  </label>
                  <select
                    value={trackingStatus}
                    onChange={(e) => setTrackingStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {Object.entries(TRACKING_STATUSES).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Информация о водителе */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Имя водителя
                    </label>
                    <input
                      type="text"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      placeholder="Введите имя водителя"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Телефон водителя
                    </label>
                    <input
                      type="tel"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      placeholder="+996 XXX XXX XXX"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Номер автомобиля
                    </label>
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      placeholder="01KG123AB"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Адрес погрузки */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Адрес погрузки <span className="text-red-500">*</span>
                  </label>
                  <YandexAddressInput
                    value={pickupAddress}
                    onChange={(address) => setPickupAddress(address)}
                    onLocationChange={handlePickupLocationChange}
                    placeholder="Введите адрес погрузки для трекинга"
                  />
                  {pickupLat && pickupLng && (
                    <p className="mt-2 text-xs text-green-600">
                      ✓ Координаты определены: {pickupLat.toFixed(6)}, {pickupLng.toFixed(6)}
                    </p>
                  )}
                </div>

                {/* Подсказки по статусам */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Рекомендации:</strong>
                  </p>
                  <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
                    <li>При статусе "Ожидает погрузки" обязательно укажите адрес погрузки</li>
                    <li>После назначения водителя через Telegram статус автоматически изменится</li>
                    <li>Адрес погрузки необходим для построения маршрута в трекинге</li>
                    <li>Статус "В процессе ожидания погрузки" устанавливается после сборки заказа</li>
                  </ul>
                </div>
              </div>

              {/* Товары в заявке */}
              {order.items && order.items.length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Товары в заявке</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.product?.name || 'Товар'}</p>
                          <p className="text-xs text-gray-500">Количество: {item.quantity} {item.product?.unit || 'шт'}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {Number(item.price || 0).toLocaleString('ru-RU')} сом
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </div>
      </div>
    </div>
  )
}

