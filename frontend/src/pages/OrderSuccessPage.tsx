import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import Navbar from '../components/Navbar'
import apiClient from '../api/client'

interface Order {
  id: number
  order_number: string
  total_amount: number
  status: string
  created_at: string
}

export default function OrderSuccessPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useUserStore()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadOrder()
    }
  }, [id])

  const loadOrder = async () => {
    try {
      const response = await apiClient.get(`/api/orders/${id}/`)
      setOrder(response.data)
    } catch (error) {
      console.error('Ошибка загрузки заказа:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
          <div className="text-center">Загрузка...</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          {/* Иконка успеха */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Заказ успешно оформлен!
          </h1>

          {order && (
            <div className="space-y-4 mb-8">
              <p className="text-lg text-gray-600">
                Номер заказа: <span className="font-semibold text-gray-900">{order.order_number}</span>
              </p>
              <p className="text-lg text-gray-600">
                Сумма заказа: <span className="font-semibold text-gray-900">
                  {order.total_amount.toLocaleString('ru-RU')} сом
                </span>
              </p>
              <p className="text-sm text-gray-500">
                Дата оформления: {new Date(order.created_at).toLocaleString('ru-RU')}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/orders')}
              className="px-6 py-3 bg-gradient-to-r from-[#4A6CF7] to-[#5A46F6] text-white rounded-lg hover:from-[#3B5CE6] hover:to-[#4A3CE6] transition-all font-medium shadow-lg"
            >
              Мои заявки
            </button>
            <button
              onClick={() => navigate('/customer/products')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Продолжить покупки
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
