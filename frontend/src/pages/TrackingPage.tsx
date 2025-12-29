import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import apiClient from '../api/client'
import Navbar from '../components/Navbar'
import ModernModal from '../components/ModernModal'

interface TrackingStatus {
  id?: number
  order?: number
  order_number?: string
  status?: 'ACCEPTED' | 'COLLECTED' | 'IN_TRANSIT' | 'ON_THE_WAY' | 'DELIVERED'
  status_label?: string
  weight?: string | null
  volume?: string | null
  items_count?: number
  status_history?: Array<{
    status: string
    old_status: string
    timestamp: string
    operator: string | null
  }>
  updated_at?: string
  created_at?: string
  locked?: boolean
  reason?: string
}

interface OrderInfo {
  order_number: string
  company_name: string | null
  delivery_address: string
  total_amount: string
  items_count: number
  status?: string
}

const statusSteps = [
  { key: 'ACCEPTED', label: 'Заказ принят', icon: '✓' },
  { key: 'COLLECTED', label: 'Собран', icon: '📦' },
  { key: 'IN_TRANSIT', label: 'Передан в доставку', icon: '🚚' },
  { key: 'ON_THE_WAY', label: 'В пути', icon: '📍' },
  { key: 'DELIVERED', label: 'Доставлен', icon: '✅' },
]

export default function TrackingPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const [tracking, setTracking] = useState<TrackingStatus | null>(null)
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'info' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  })

  useEffect(() => {
    if (orderId) {
      loadTracking()
    }
  }, [orderId])

  const loadTracking = async () => {
    try {
      setLoading(true)
      
      // Загружаем заказ
      let orderData
      try {
        const orderResponse = await apiClient.get(`/api/orders/${orderId}/`)
        orderData = orderResponse.data
      } catch (error: any) {
        console.error('Ошибка загрузки заказа:', error)
        let errorMessage = 'Заказ не найден'
        if (error.response?.data) {
          const data = error.response.data
          if (typeof data === 'object' && data.detail) {
            errorMessage = typeof data.detail === 'string' ? data.detail : String(data.detail)
          } else if (typeof data === 'string') {
            errorMessage = data
          }
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
          title: 'Ошибка',
          message: errorMessage,
          type: 'error'
        })
        setLoading(false)
        return
      }
      
      // Загружаем трекинг (API проверит подписку и вернет locked состояние если недоступно)
      let trackingData = null
      try {
        const trackingResponse = await apiClient.get(`/api/orders/tracking/?order=${orderId}`)
        // API может вернуть объект напрямую или в results
        if (trackingResponse.data.results && Array.isArray(trackingResponse.data.results)) {
          trackingData = trackingResponse.data.results[0] || trackingResponse.data.results
        } else {
          trackingData = trackingResponse.data
        }
      } catch (error: any) {
        console.error('Ошибка загрузки трекинга:', error)
        // Если ошибка 403 или locked - показываем locked состояние
        if (error.response?.status === 403 || error.response?.data?.locked) {
          trackingData = error.response.data || { 
            locked: true, 
            reason: 'Трекинг недоступен для вашего тарифа' 
          }
        } else {
          // Другие ошибки - показываем модалку
          let errorMsg = 'Не удалось загрузить трекинг'
          if (error.response?.data) {
            const data = error.response.data
            if (typeof data === 'object' && data.detail) {
              errorMsg = typeof data.detail === 'string' ? data.detail : String(data.detail)
            } else if (typeof data === 'string') {
              errorMsg = data
            }
          }
          
          // Убираем технические детали
          errorMsg = errorMsg
            .replace(/\{/g, '')
            .replace(/\}/g, '')
            .replace(/"/g, '')
            .replace(/detail:/gi, '')
            .replace(/error:/gi, '')
            .trim()
          
          setModal({
            isOpen: true,
            title: 'Ошибка',
            message: errorMsg,
            type: 'error'
          })
        }
      }
      
      // Если trackingData имеет locked=true, устанавливаем его
      if (trackingData && trackingData.locked === true) {
        setTracking(trackingData)
      } else {
        setTracking(trackingData)
      }
      
      // Устанавливаем информацию о заказе (всегда, даже если трекинг locked)
      setOrderInfo({
        order_number: orderData.order_number || `#${orderId}`,
        company_name: orderData.company_name || null,
        delivery_address: orderData.delivery_address || 'Не указан',
        total_amount: orderData.total_amount || '0',
        items_count: orderData.items?.length || 0,
        status: orderData.status
      })
    } catch (error: any) {
      console.error('Ошибка загрузки данных:', error)
      
      // Извлекаем понятное сообщение об ошибке
      let errorMessage = 'Не удалось загрузить данные трекинга'
      
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
        title: 'Ошибка',
        message: errorMessage,
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIndex = (status: string) => {
    return statusSteps.findIndex(step => step.key === status)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar activeTab="orders" />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 lg:pb-8 pt-20">
          <div className="text-center py-12">
            <div className="text-gray-500">Загрузка...</div>
          </div>
        </main>
      </div>
    )
  }

  if (!orderInfo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar activeTab="orders" />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 lg:pb-8 pt-20">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Заказ не найден</h2>
            <p className="text-gray-500 mb-6">Не удалось загрузить информацию о заказе</p>
            <button
              onClick={() => navigate('/orders')}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Вернуться к заявкам
            </button>
          </div>
        </main>
      </div>
    )
  }

  // Проверяем locked состояние из API (зависит от подписки, а не от оплаты)
  const isLocked = tracking?.locked === true
  const lockReason = tracking?.reason || 'Трекинг доступен только для тарифов Стандарт и VIP'

  if (isLocked) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar activeTab="orders" />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 lg:pb-8 pt-20">
          <button
            onClick={() => navigate('/orders')}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Назад к заявкам</span>
          </button>

          {/* Order Info Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Номер заказа</div>
                <div className="text-lg font-bold text-gray-900">{orderInfo.order_number}</div>
              </div>
              {orderInfo.company_name && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Компания</div>
                  <div className="text-lg font-semibold text-gray-900">{orderInfo.company_name}</div>
                </div>
              )}
            </div>
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">Адрес доставки</div>
              <div className="text-base font-medium text-gray-900">{orderInfo.delivery_address}</div>
            </div>
          </div>

          {/* Трекинг недоступен */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 sm:p-6 text-center">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-yellow-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Трекинг недоступен</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 break-words">
              {lockReason}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 break-words">
              После оплаты вы сможете отслеживать статус доставки вашего заказа в реальном времени.
            </p>
          </div>
        </main>
      </div>
    )
  }

  const currentStatusIndex = getStatusIndex(tracking.status)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab="orders" />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 lg:pb-8 pt-20">
        <button
          onClick={() => navigate('/orders')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Назад к заявкам</span>
        </button>

          {/* Order Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs sm:text-sm text-gray-500 mb-1">Номер заказа</div>
              <div className="text-base sm:text-lg font-bold text-gray-900 break-words">{orderInfo.order_number}</div>
            </div>
            {orderInfo.company_name && (
              <div>
                <div className="text-xs sm:text-sm text-gray-500 mb-1">Компания</div>
                <div className="text-base sm:text-lg font-semibold text-gray-900 break-words truncate" title={orderInfo.company_name}>
                  {orderInfo.company_name}
                </div>
              </div>
            )}
          </div>
          <div className="mb-4">
            <div className="text-xs sm:text-sm text-gray-500 mb-1">Адрес доставки</div>
            <div className="text-sm sm:text-base font-medium text-gray-900 break-words">{orderInfo.delivery_address}</div>
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm">
            <div>
              <span className="text-gray-500">Сумма: </span>
              <span className="font-bold text-gray-900">{parseFloat(orderInfo.total_amount || '0').toLocaleString('ru-RU')} сом</span>
            </div>
            <div>
              <span className="text-gray-500">Позиций: </span>
              <span className="font-semibold text-gray-900">{orderInfo.items_count || 0}</span>
            </div>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Статус доставки</h2>
          
          {/* Vertical Timeline */}
          <div className="relative">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStatusIndex
              const isCurrent = index === currentStatusIndex
              
              return (
                <div key={step.key} className="relative flex items-start gap-3 sm:gap-4 pb-6 sm:pb-8 last:pb-0">
                  {/* Timeline Line */}
                  {index < statusSteps.length - 1 && (
                    <div className={`absolute left-4 sm:left-5 top-10 sm:top-12 w-0.5 h-full ${
                      isCompleted ? 'bg-blue-500' : 'bg-gray-200'
                    }`} />
                  )}
                  
                  {/* Status Icon */}
                  <div className={`relative z-10 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex-shrink-0 ${
                    isCompleted
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    <span className="text-sm sm:text-lg">{step.icon}</span>
                  </div>
                  
                  {/* Status Info */}
                  <div className="flex-1 pt-0.5 sm:pt-1 min-w-0">
                    <div className={`text-sm sm:text-base font-semibold break-words ${
                      isCompleted ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </div>
                    {isCurrent && (
                      <div className="text-xs sm:text-sm text-blue-600 mt-1 font-medium">Текущий статус</div>
                    )}
                    {isCompleted && tracking?.status_history && tracking.status_history.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {(() => {
                          const historyItem = tracking.status_history
                            .slice()
                            .reverse()
                            .find((h: any) => h.status === step.key)
                          return historyItem ? formatDate(historyItem.timestamp) : ''
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Cargo Info */}
        {tracking && (tracking.weight || tracking.volume) && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Информация о грузе</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {tracking.weight && (
                <div>
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">Вес</div>
                  <div className="text-base sm:text-lg font-semibold text-gray-900">{parseFloat(tracking.weight).toLocaleString('ru-RU')} кг</div>
                </div>
              )}
              {tracking.volume && (
                <div>
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">Объем</div>
                  <div className="text-base sm:text-lg font-semibold text-gray-900">{parseFloat(tracking.volume).toLocaleString('ru-RU')} м³</div>
                </div>
              )}
              <div>
                <div className="text-xs sm:text-sm text-gray-500 mb-1">Позиций</div>
                <div className="text-base sm:text-lg font-semibold text-gray-900">{tracking.items_count || 0}</div>
              </div>
            </div>
          </div>
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

