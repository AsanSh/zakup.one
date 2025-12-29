import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/client'
import Navbar from '../components/Navbar'
import ModernModal from '../components/ModernModal'

interface SubscriptionPlan {
  id: number
  plan_type: 'BASIC' | 'STANDARD' | 'VIP'
  name: string
  price: string
  description: string
  max_companies: number
  additional_company_price: string
  delivery_count: number
  installment_available: boolean
  delivery_tracking_available: boolean
  is_active: boolean
}

interface UserSubscription {
  id: number
  plan: SubscriptionPlan
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED'
  start_date: string
  end_date: string
  companies_count: number
  delivery_count_used: number
  installment_active: boolean
  is_active: boolean
  can_add_company: boolean
  has_delivery_available: boolean
}

interface UserCompany {
  id: number
  name: string
  orders_count: number
  installment_available: boolean
}

export default function SubscriptionPage() {
  const navigate = useNavigate()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null)
  const [userCompanies, setUserCompanies] = useState<UserCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'info' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [plansResponse, subscriptionResponse, companiesResponse] = await Promise.all([
        apiClient.get('/api/auth/subscription-plans/').catch((e) => {
          console.error('Ошибка загрузки планов:', e)
          return { data: { results: [] } }
        }),
        apiClient.get('/api/auth/subscriptions/').catch(() => ({ data: { results: [] } })),
        apiClient.get('/api/auth/user-companies/').catch(() => ({ data: { results: [] } }))
      ])
      
      const plansData = plansResponse.data?.results || plansResponse.data || []
      setPlans(Array.isArray(plansData) ? plansData : [])
      
      const subscriptions = subscriptionResponse.data?.results || subscriptionResponse.data || []
      const active = Array.isArray(subscriptions) ? subscriptions.find((s: UserSubscription) => s.is_active) : null
      setCurrentSubscription(active || null)
      
      const companies = companiesResponse.data?.results || companiesResponse.data || []
      setUserCompanies(Array.isArray(companies) ? companies : [])
    } catch (error: any) {
      console.error('Ошибка загрузки данных:', error)
      
      // Извлекаем понятное сообщение об ошибке
      let errorMessage = 'Не удалось загрузить данные'
      
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

  const handleSubscribe = async (planId: number) => {
    try {
      const response = await apiClient.post('/api/auth/subscriptions/', {
        plan_id: planId
      })
      setModal({
        isOpen: true,
        title: 'Успешно',
        message: 'Подписка успешно оформлена!',
        type: 'success'
      })
      loadData()
    } catch (error: any) {
      console.error('Ошибка оформления подписки:', error)
      console.error('Response data:', error.response?.data)
      
      // Извлекаем понятное сообщение об ошибке
      let errorMessage = 'Не удалось оформить подписку'
      
      if (error.response?.data) {
        const data = error.response.data
        
        // Проверяем, не является ли ответ HTML
        if (typeof data === 'string' && (data.includes('<!doctype') || data.includes('<html'))) {
          errorMessage = 'Ошибка сервера. Пожалуйста, попробуйте позже или обратитесь в поддержку.'
        } else if (typeof data === 'object') {
          // Извлекаем сообщение из различных полей ответа
          if (data.plan_id) {
            errorMessage = Array.isArray(data.plan_id) 
              ? data.plan_id[0] 
              : String(data.plan_id)
          } else if (data.detail) {
            // Если detail - это строка, используем её
            if (typeof data.detail === 'string') {
              errorMessage = data.detail
            } else if (Array.isArray(data.detail) && data.detail.length > 0) {
              errorMessage = String(data.detail[0])
            } else {
              errorMessage = String(data.detail)
            }
          } else if (data.non_field_errors) {
            errorMessage = Array.isArray(data.non_field_errors)
              ? data.non_field_errors[0]
              : String(data.non_field_errors)
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
      
      // Убираем технические детали и форматируем сообщение
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
    }
  }

  const getPlanFeatures = (plan: SubscriptionPlan) => {
    const features = []
    features.push(`Доступ к материалам`)
    features.push(`${plan.max_companies} ${plan.max_companies === 1 ? 'компания' : plan.max_companies < 5 ? 'компании' : 'компаний'}`)
    if (plan.additional_company_price && parseFloat(plan.additional_company_price) > 0) {
      features.push(`Доп. компания: +${parseFloat(plan.additional_company_price).toLocaleString('ru-RU')} сом`)
    }
    if (plan.delivery_tracking_available) {
      features.push(`✓ Трекинг доставки`)
    } else {
      features.push(`✗ Трекинг недоступен`)
    }
    if (plan.delivery_count > 0) {
      features.push(`Доставка: ${plan.delivery_count} ${plan.delivery_count === 1 ? 'раз' : 'раза'}`)
    } else if (plan.plan_type === 'VIP') {
      features.push(`Доставка: неограниченно`)
    }
    if (plan.installment_available) {
      features.push(`Рассрочка (после 5 заказов)`)
    } else {
      features.push(`✗ Рассрочка недоступна`)
    }
    return features
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab="orders" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 lg:pb-8 pt-20">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Подписка</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Загрузка...</div>
          </div>
        ) : (
          <>
            {/* Current Subscription */}
            {currentSubscription && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Текущая подписка</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {currentSubscription.plan.name}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    currentSubscription.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {currentSubscription.is_active ? 'Активна' : 'Неактивна'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <div className="text-gray-500">Действует до</div>
                    <div className="font-semibold text-gray-900">{formatDate(currentSubscription.end_date)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Компаний</div>
                    <div className="font-semibold text-gray-900">
                      {userCompanies.length} / {currentSubscription.plan.max_companies}
                      {!currentSubscription.can_add_company && (
                        <span className="ml-2 text-xs text-red-600">(лимит)</span>
                      )}
                    </div>
                  </div>
                  {currentSubscription.plan.delivery_count > 0 && (
                    <div>
                      <div className="text-gray-500">Доставок использовано</div>
                      <div className="font-semibold text-gray-900">
                        {currentSubscription.delivery_count_used} / {currentSubscription.plan.delivery_count}
                      </div>
                    </div>
                  )}
                  {currentSubscription.plan.delivery_tracking_available && (
                    <div>
                      <div className="text-gray-500">Трекинг доставки</div>
                      <div className="font-semibold text-green-600">✓ Доступен</div>
                    </div>
                  )}
                </div>
                
                {/* Companies List */}
                {userCompanies.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Ваши компании:</h3>
                    <div className="space-y-2">
                      {userCompanies.map(company => (
                        <div key={company.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                          <div>
                            <div className="font-medium text-gray-900">{company.name}</div>
                            <div className="text-gray-500">Заказов: {company.orders_count}</div>
                          </div>
                          {company.installment_available && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                              Рассрочка доступна
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Subscription Plans */}
            <div className="flex flex-col md:flex-row gap-6 items-stretch">
              {plans.map((plan) => {
                const isCurrent = currentSubscription?.plan.id === plan.id
                const isBasic = plan.plan_type === 'BASIC'
                const isStandard = plan.plan_type === 'STANDARD'
                const isVip = plan.plan_type === 'VIP'
                
                // Цветовые схемы для каждого плана
                const colorScheme = isBasic
                  ? {
                      border: 'border-blue-500',
                      bg: 'bg-blue-50',
                      text: 'text-blue-900',
                      price: 'text-blue-600',
                      checkmark: 'text-blue-500',
                      button: 'bg-blue-600 hover:bg-blue-700 text-white',
                      badge: 'bg-blue-500 text-white'
                    }
                  : isStandard
                  ? {
                      border: 'border-green-500',
                      bg: 'bg-green-50',
                      text: 'text-green-900',
                      price: 'text-green-600',
                      checkmark: 'text-green-500',
                      button: 'bg-green-600 hover:bg-green-700 text-white',
                      badge: 'bg-green-500 text-white'
                    }
                  : {
                      border: 'border-purple-500',
                      bg: 'bg-purple-50',
                      text: 'text-purple-900',
                      price: 'text-purple-600',
                      checkmark: 'text-purple-500',
                      button: 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white',
                      badge: 'bg-purple-500 text-white'
                    }
                
                return (
                  <div
                    key={plan.id}
                    className={`flex flex-col bg-white rounded-xl shadow-lg border-2 ${colorScheme.border} p-6 relative flex-1 ${
                      isCurrent ? 'ring-2 ring-offset-2 ring-blue-400' : ''
                    }`}
                  >
                    {/* Badge */}
                    {isVip && (
                      <div className={`absolute top-0 right-0 ${colorScheme.badge} px-3 py-1 rounded-bl-xl text-xs font-bold uppercase tracking-wide`}>
                        VIP
                      </div>
                    )}
                    {isCurrent && (
                      <div className="absolute top-0 left-0 bg-blue-500 text-white px-3 py-1 rounded-br-xl text-xs font-semibold">
                        Активна
                      </div>
                    )}
                    
                    {/* Header */}
                    <div className={`${colorScheme.bg} rounded-lg p-4 mb-4 -mx-2`}>
                      <h3 className={`text-2xl font-bold ${colorScheme.text} mb-2`}>{plan.name}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-4xl font-bold ${colorScheme.price}`}>
                          {parseFloat(plan.price).toLocaleString('ru-RU')}
                        </span>
                        <span className={`${colorScheme.text} opacity-70 text-sm`}>сом/мес</span>
                      </div>
                    </div>

                    {/* Description */}
                    {plan.description && (
                      <p className={`text-sm ${colorScheme.text} opacity-80 mb-4`}>{plan.description}</p>
                    )}

                    {/* Features - растягиваем для выравнивания кнопок */}
                    <ul className="space-y-3 mb-6 flex-grow">
                      {getPlanFeatures(plan).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <svg className={`w-5 h-5 ${colorScheme.checkmark} flex-shrink-0 mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className={`text-sm ${colorScheme.text} font-medium`}>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Button - всегда внизу */}
                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isCurrent}
                      className={`w-full py-3.5 px-4 rounded-lg font-bold text-base transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] ${
                        isCurrent
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                          : colorScheme.button
                      }`}
                    >
                      {isCurrent ? 'Активна' : 'Оформить подписку'}
                    </button>
                  </div>
                )
              })}
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

