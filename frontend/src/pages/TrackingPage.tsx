import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import apiClient from '../api/client'
import Navbar from '../components/Navbar'
import ModernModal from '../components/ModernModal'

interface TrackingStatus {
  id?: number
  order?: number
  order_number?: string
  status?: string
  status_label?: string
  is_active?: boolean
  message?: string
  driver_name?: string | null
  driver_phone?: string | null
  vehicle_number?: string | null
  current_lat?: number | null
  current_lng?: number | null
  eta_minutes?: number | null
  weight?: string | null
  volume?: string | null
  items_count?: number
  status_history?: Array<{
    status: string
    timestamp: string
    lat?: number | null
    lng?: number | null
  }>
  pickup_address?: string | null
  pickup_date?: string | null
  pickup_time?: string | null
  delivery_address?: string | null
  delivery_date?: string | null
  delivery_time?: string | null
  truck_model?: string | null
  truck_type?: string | null
  trailer_number?: string | null
  driver_email?: string | null
  start_time?: string | null
  note_for_driver?: string | null
  route_points?: Array<{
    address: string
    date?: string
    time?: string
    lat?: number
    lng?: number
  }>
}

interface OrderInfo {
  id: number
  order_number: string
  company_name: string | null
  delivery_address: string
  total_amount: string
  items_count: number
  status?: string
  recipient_name?: string
  recipient_phone?: string
  created_at?: string
}

interface LoadCard {
  id: number
  order_number: string
  status: 'Delivery' | 'Pick-Up' | 'Transfer'
  pickup_date: string
  pickup_time: string
  pickup_address: string
  pickup_city: string
  delivery_date: string
  delivery_time: string
  delivery_address: string
  delivery_city: string
  client_name: string
  client_phone: string
}

export default function TrackingPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const [loads, setLoads] = useState<LoadCard[]>([])
  const [selectedLoad, setSelectedLoad] = useState<LoadCard | null>(null)
  const [tracking, setTracking] = useState<TrackingStatus | null>(null)
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'info' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  })
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    loadAllLoads()
  }, [orderId])

  // Автоматически выбираем первый груз после загрузки, если нет orderId
  useEffect(() => {
    if (!orderId && loads.length > 0 && !selectedLoad) {
      setSelectedLoad(loads[0])
      loadTracking(loads[0].id.toString())
    } else if (orderId) {
      const load = loads.find(l => l.id === parseInt(orderId))
      if (load && load.id !== selectedLoad?.id) {
        setSelectedLoad(load)
        loadTracking(orderId)
      }
    }
  }, [loads, orderId])

  // Инициализация Яндекс карты
  useEffect(() => {
    if (!selectedLoad || !mapRef.current) return

    const initMap = () => {
      // Проверяем, загружена ли библиотека Яндекс карт
      if (typeof window === 'undefined' || !(window as any).ymaps) {
        // Ждем загрузки библиотеки
        const checkYmaps = setInterval(() => {
          if ((window as any).ymaps) {
            clearInterval(checkYmaps)
            createMap()
          }
        }, 100)
        setTimeout(() => {
          clearInterval(checkYmaps)
        }, 10000) // Таймаут 10 секунд
        return
      }
      createMap()
    }

    const createMap = () => {
      const ymaps = (window as any).ymaps
      
      if (!ymaps) {
        console.error('Яндекс карты не загружены')
        return
      }

      // Очищаем предыдущую карту
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.destroy()
        } catch (e) {
          // Игнорируем ошибки при уничтожении
        }
      }

      ymaps.ready(() => {
        try {
          // Создаем карту
          const map = new ymaps.Map(mapRef.current, {
            center: [74.5698, 42.8746], // Координаты Бишкека по умолчанию
            zoom: 10,
            controls: ['zoomControl', 'typeSelector', 'fullscreenControl']
          })

          // Получаем координаты точек маршрута
          const routePoints = getRoutePoints()
          const coordinates: number[][] = []
          const placemarks: any[] = []

          // Функция для геокодирования адреса
          const geocodeAddress = (address: string, index: number, callback: (coords: number[]) => void) => {
            ymaps.geocode(address).then((res: any) => {
              const firstGeoObject = res.geoObjects.get(0)
              if (firstGeoObject) {
                const coords = firstGeoObject.geometry.getCoordinates()
                callback(coords)
              } else {
                // Используем дефолтные координаты для Бишкека
                const defaultCoords = [74.5698 + (index * 0.1), 42.8746 + (index * 0.1)]
                callback(defaultCoords)
              }
            }).catch(() => {
              // Используем дефолтные координаты при ошибке
              const defaultCoords = [74.5698 + (index * 0.1), 42.8746 + (index * 0.1)]
              callback(defaultCoords)
            })
          }

          // Геокодируем все адреса
          let geocodeCount = 0
          const allCoords: number[][] = []

          routePoints.forEach((point, index) => {
            geocodeAddress(point.address, index, (coords) => {
              allCoords[index] = coords
              coordinates.push(coords)

              // Добавляем маркер
              const placemark = new ymaps.Placemark(
                coords,
                {
                  balloonContent: point.address,
                  iconCaption: point.address
                },
                {
                  preset: index === 0 ? 'islands#blueCircleDotIcon' : 'islands#grayCircleDotIcon',
                  draggable: false
                }
              )

              map.geoObjects.add(placemark)
              placemarks.push(placemark)
              geocodeCount++

              // Если все адреса геокодированы, устанавливаем границы карты
              if (geocodeCount === routePoints.length) {
                // Если есть координаты водителя, добавляем маркер
                if (tracking?.current_lat && tracking?.current_lng) {
                  const driverCoords = [tracking.current_lng, tracking.current_lat]
                  const driverPlacemark = new ymaps.Placemark(
                    driverCoords,
                    {
                      balloonContent: 'Текущее местоположение водителя',
                      iconCaption: 'Водитель'
                    },
                    {
                      preset: 'islands#greenCircleDotIcon',
                      draggable: false
                    }
                  )

                  map.geoObjects.add(driverPlacemark)
                  coordinates.push(driverCoords)
                }

                // Устанавливаем видимую область карты
                if (coordinates.length > 0) {
                  map.setBounds(map.geoObjects.getBounds(), {
                    checkZoomRange: true,
                    duration: 500
                  })
                }
              }
            })
          })

          // Если нет точек маршрута, но есть координаты водителя
          if (routePoints.length === 0 && tracking?.current_lat && tracking?.current_lng) {
            const driverCoords = [tracking.current_lng, tracking.current_lat]
            const driverPlacemark = new ymaps.Placemark(
              driverCoords,
              {
                balloonContent: 'Текущее местоположение водителя',
                iconCaption: 'Водитель'
              },
              {
                preset: 'islands#greenCircleDotIcon',
                draggable: false
              }
            )

            map.geoObjects.add(driverPlacemark)
            map.setCenter(driverCoords, 15)
          }

          mapInstanceRef.current = map
        } catch (error) {
          console.error('Ошибка инициализации карты:', error)
        }
      })
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.destroy()
        } catch (error) {
          console.error('Ошибка при уничтожении карты:', error)
        }
        mapInstanceRef.current = null
      }
    }
  }, [selectedLoad, tracking])

  const loadAllLoads = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/api/orders/')
      const ordersData = response.data.results || response.data || []
      const orders = Array.isArray(ordersData) ? ordersData : []
      
      // Преобразуем заказы в LoadCard формат
      const loadsData: LoadCard[] = orders
        .filter((order: any) => {
          // Показываем только оплаченные заказы или заказы в доставке
          return ['PAID', 'IN_PROGRESS', 'COLLECTED', 'IN_DELIVERY', 'DELIVERED'].includes(order.status)
        })
        .map((order: any) => {
          // Определяем статус на основе статуса заказа
          let loadStatus: 'Delivery' | 'Pick-Up' | 'Transfer' = 'Delivery'
          if (order.status === 'COLLECTED') {
            loadStatus = 'Pick-Up'
          } else if (order.status === 'IN_DELIVERY') {
            loadStatus = 'Transfer'
          }
          
          // Парсим адрес доставки
          const deliveryParts = (order.delivery_address || '').split(',')
          const deliveryCity = deliveryParts.length > 1 ? deliveryParts[deliveryParts.length - 1].trim() : ''
          const deliveryAddress = deliveryParts[0] || order.delivery_address || ''
          
          // Используем адрес склада как pickup (если есть) или дефолтный
          const pickupAddress = 'Склад поставщика'
          const pickupCity = 'Бишкек'
          
          // Даты
          const deliveryDate = order.delivery_date 
            ? new Date(order.delivery_date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
            : new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
          const pickupDate = new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
          
          return {
            id: order.id,
            order_number: order.order_number || `#${order.id}`,
            status: loadStatus,
            pickup_date: pickupDate,
            pickup_time: '8:00 AM',
            pickup_address: pickupAddress,
            pickup_city: pickupCity,
            delivery_date: deliveryDate,
            delivery_time: '12:00 PM',
            delivery_address: deliveryAddress,
            delivery_city: deliveryCity,
            client_name: order.recipient_name || order.company_name || 'Клиент',
            client_phone: order.recipient_phone || '+996 XXX XXX XXX'
          }
        })
      
      setLoads(loadsData)
      
      // Если есть orderId, выбираем соответствующий груз
      if (orderId) {
        const load = loadsData.find(l => l.id === parseInt(orderId))
        if (load) {
          setSelectedLoad(load)
          loadTracking(load.id.toString())
        } else if (loadsData.length > 0) {
          setSelectedLoad(loadsData[0])
          loadTracking(loadsData[0].id.toString())
        }
      } else if (loadsData.length > 0) {
        setSelectedLoad(loadsData[0])
        loadTracking(loadsData[0].id.toString())
      }
    } catch (error: any) {
      console.error('Ошибка загрузки грузов:', error)
      setModal({
        isOpen: true,
        title: 'Ошибка',
        message: 'Не удалось загрузить список заявок',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadTracking = async (id: string) => {
    try {
      setLoading(true)
      
      // Загружаем заказ
      let orderData
      try {
        const orderResponse = await apiClient.get(`/api/orders/${id}/`)
        orderData = orderResponse.data
        setOrderInfo({
          id: orderData.id,
          order_number: orderData.order_number || `#${id}`,
          company_name: orderData.company_name || null,
          delivery_address: orderData.delivery_address || 'Не указан',
          total_amount: orderData.total_amount || '0',
          items_count: orderData.items?.length || 0,
          status: orderData.status,
          recipient_name: orderData.recipient_name,
          recipient_phone: orderData.recipient_phone,
          created_at: orderData.created_at
        })
      } catch (error: any) {
        console.error('Ошибка загрузки заказа:', error)
        setLoading(false)
        return
      }
      
      // Загружаем трекинг
      let trackingData = null
      try {
        // Пробуем получить трекинг через фильтр по order
        const trackingResponse = await apiClient.get(`/api/orders/tracking/`, {
          params: { order: id }
        })
        // Если это список, берем первый элемент
        if (Array.isArray(trackingResponse.data)) {
          trackingData = trackingResponse.data.length > 0 ? trackingResponse.data[0] : null
        } else if (trackingResponse.data.results && Array.isArray(trackingResponse.data.results)) {
          trackingData = trackingResponse.data.results.length > 0 ? trackingResponse.data.results[0] : null
        } else {
          trackingData = trackingResponse.data
        }
        setTracking(trackingData)
      } catch (error: any) {
        // Если трекинг не найден (404), это нормально - значит трекинг еще не создан
        if (error.response?.status !== 404) {
          console.error('Ошибка загрузки трекинга:', error)
        }
      }
    } catch (error: any) {
      console.error('Ошибка загрузки данных:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadSelect = (load: LoadCard) => {
    setSelectedLoad(load)
    navigate(`/tracking/${load.id}`)
    loadTracking(load.id.toString())
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivery':
        return 'bg-green-100 text-green-800'
      case 'Pick-Up':
        return 'bg-blue-100 text-blue-800'
      case 'Transfer':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const formatTime = (dateString: string) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  // Генерируем точки маршрута для карты
  const getRoutePoints = () => {
    if (!selectedLoad && !tracking) return []
    
    const points = []
    
    // Точка отправления
    if (selectedLoad) {
      points.push({
        address: `${selectedLoad.pickup_address}, ${selectedLoad.pickup_city}`,
        date: selectedLoad.pickup_date,
        time: selectedLoad.pickup_time
      })
    }
    
    // Точка доставки
    if (selectedLoad) {
      points.push({
        address: `${selectedLoad.delivery_address}, ${selectedLoad.delivery_city}`,
        date: selectedLoad.delivery_date,
        time: selectedLoad.delivery_time
      })
    }
    
    // Если есть дополнительные точки из tracking
    if (tracking?.route_points && tracking.route_points.length > 0) {
      points.push(...tracking.route_points)
    }
    
    return points
  }

  if (loading && loads.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar activeTab="tracking" />
        <main className="pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="text-gray-500">Загрузка...</div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const routePoints = getRoutePoints()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab="tracking" />
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Левая колонка - Список грузов */}
            <div className="space-y-4">
              {/* Заголовок и поиск */}
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Трекинг доставок</h1>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search"
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Кнопка Add Load */}
              <button className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Load</span>
              </button>

              {/* Список грузов */}
              <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto">
                {loads.map((load) => {
                  const isSelected = selectedLoad?.id === load.id
                  return (
                    <div
                      key={load.id}
                      onClick={() => handleLoadSelect(load)}
                      className={`bg-white rounded-lg border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? 'border-blue-500 shadow-md' : 'border-gray-200'
                      }`}
                    >
                      {/* Заголовок карточки */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-900">#{load.order_number}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(load.status)}`}>
                            {load.status === 'Delivery' ? 'Доставка' : load.status === 'Pick-Up' ? 'Забор' : 'Транзит'}
                          </span>
                        </div>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>

                      {/* Маршрут */}
                      <div className="space-y-3">
                        {/* Отправление */}
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center mt-1">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <div className="w-0.5 h-12 bg-gray-300 mt-1"></div>
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-gray-500">{load.pickup_date}</div>
                            <div className="text-xs text-gray-500 mb-1">{load.pickup_time}</div>
                            <div className="text-sm font-medium text-gray-900">{load.pickup_city}</div>
                            <div className="text-xs text-gray-600">{load.pickup_address}</div>
                          </div>
                        </div>

                        {/* Доставка */}
                        <div className="flex items-start gap-3">
                          <div className="w-3 h-3 bg-gray-400 rounded-full mt-1"></div>
                          <div className="flex-1">
                            <div className="text-xs text-gray-500">{load.delivery_date}</div>
                            <div className="text-xs text-gray-500 mb-1">{load.delivery_time}</div>
                            <div className="text-sm font-medium text-gray-900">{load.delivery_city}</div>
                            <div className="text-xs text-gray-600">{load.delivery_address}</div>
                          </div>
                        </div>
                      </div>

                      {/* Информация о клиенте */}
                      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{load.client_name}</div>
                            <div className="text-xs text-gray-500">Клиент</div>
                          </div>
                        </div>
                        <a href={`tel:${load.client_phone}`} className="p-2 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>

              {loads.length === 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <p className="text-gray-500">Нет активных грузов для отслеживания</p>
                </div>
              )}
            </div>

            {/* Правая колонка - Детали выбранного груза */}
            {selectedLoad && (
              <div className="space-y-4">
                {/* MAP OVERVIEW */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">MAP OVERVIEW</h2>
                  <div className="relative bg-gray-100 rounded-lg h-64 mb-3 overflow-hidden">
                    {/* Яндекс карта */}
                    <div 
                      ref={mapRef}
                      className="w-full h-full"
                      style={{ minHeight: '256px' }}
                    />
                    {/* Fallback если карта не загрузилась */}
                    {!mapInstanceRef.current && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="text-center">
                          <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          <p className="text-sm text-gray-500">Загрузка карты...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ROUTE DETAILS */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">ROUTE DETAILS</h2>
                  <div className="space-y-2">
                    {routePoints.map((point, index) => (
                      <div key={index} className="flex items-start gap-3 text-sm">
                        <span className="font-semibold text-gray-700 w-6">{index + 1}.</span>
                        <div className="flex-1">
                          <div className="text-gray-900">{point.address}</div>
                          {point.date && (
                            <div className="text-xs text-gray-500">{point.date} {point.time}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* TRUCK */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">TRUCK</h2>
                    <button className="p-1.5 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{tracking?.vehicle_number || 'Не назначен'}</div>
                      <div className="text-xs text-gray-500">Грузовик</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Номер грузовика: </span>
                      <span className="text-gray-900">{tracking?.vehicle_number || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Тип грузовика: </span>
                      <span className="text-gray-900">{tracking?.truck_type || 'Не указан'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Номер прицепа: </span>
                      <span className="text-gray-900">{tracking?.trailer_number || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* DRIVER */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">DRIVER</h2>
                    <button className="p-1.5 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{tracking?.driver_name || 'Нет данных'}</div>
                      <div className="text-xs text-gray-500">Водитель</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Телефон: </span>
                      <span className="text-gray-900">{tracking?.driver_phone || 'Нет данных'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Email: </span>
                      <span className="text-gray-900">{tracking?.driver_email || 'Нет данных'}</span>
                    </div>
                  </div>
                </div>

                {/* END LOCATION */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">END LOCATION</h2>
                    <button className="p-1.5 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{selectedLoad.delivery_city}</div>
                      <div className="text-sm text-gray-600">{selectedLoad.delivery_address}</div>
                    </div>
                  </div>
                </div>

                {/* START TIME */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">START TIME</h2>
                    <button className="p-1.5 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {tracking?.start_time 
                          ? formatDate(tracking.start_time) + ', ' + formatTime(tracking.start_time) 
                          : selectedLoad.pickup_date && selectedLoad.pickup_time
                          ? selectedLoad.pickup_date + ', ' + selectedLoad.pickup_time
                          : 'Нет данных'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* NOTE FOR DRIVER */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">NOTE FOR DRIVER:</h2>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {tracking?.note_for_driver || orderInfo?.comment || 'Нет данных'}
                  </p>
                </div>
              </div>
            )}

            {!selectedLoad && (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-500">Выберите груз для просмотра деталей</p>
              </div>
            )}
          </div>
        </div>
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
