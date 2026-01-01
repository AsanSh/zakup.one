import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import apiClient from '../api/client'
import Navbar from '../components/Navbar'
import ModernModal from '../components/ModernModal'
import ConfirmCancelSubscriptionModal from '../components/ConfirmCancelSubscriptionModal'
import CompanyFormModal from '../components/CompanyFormModal'
import InviteUserModal from '../components/InviteUserModal'
import { useUserStore } from '../store/userStore'

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
  inn: string
  bank: string
  account: string
  legal_address: string
  orders_count: number
  installment_available: boolean
  is_default: boolean
  is_new: boolean
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null)
  const [userCompanies, setUserCompanies] = useState<UserCompany[]>([])
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showCompanyModal, setShowCompanyModal] = useState(false)
  const [editingCompany, setEditingCompany] = useState<UserCompany | null>(null)
  const [savingCompany, setSavingCompany] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviting, setInviting] = useState(false)
  const location = useLocation()
  const [modal, setModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'info' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  })

  useEffect(() => {
    loadData()
    
    // Слушаем событие для открытия модалки приглашения из UserMenu
    const handleOpenInviteModal = () => {
      setShowInviteModal(true)
    }
    window.addEventListener('openInviteModal', handleOpenInviteModal)
    
    return () => {
      window.removeEventListener('openInviteModal', handleOpenInviteModal)
    }
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [plansResponse, subscriptionResponse, companiesResponse] = await Promise.all([
        apiClient.get('/api/auth/subscription-plans/').catch(() => ({ data: { results: [] } })),
        apiClient.get('/api/auth/subscriptions/').catch(() => ({ data: { results: [] } })),
        apiClient.get('/api/auth/user-companies/').catch(() => ({ data: { results: [] } }))
      ])
      
      const plansData = plansResponse.data?.results || plansResponse.data || []
      setAvailablePlans(Array.isArray(plansData) ? plansData : [])
      
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

  const handleCancelSubscription = () => {
    if (!currentSubscription) return
    setShowCancelModal(true)
  }

  const handleSwitchToPlan = async (planId: number) => {
    try {
      setCancelling(true)
      
      // Проверяем, что план существует
      const plan = availablePlans.find(p => p.id === planId)
      if (!plan) {
        setModal({
          isOpen: true,
          title: 'Ошибка',
          message: 'Выбранный тариф не найден. Пожалуйста, обновите страницу и попробуйте снова.',
          type: 'error'
        })
        return
      }
      
      // Сначала отменяем текущую подписку, если она есть
      if (currentSubscription && currentSubscription.is_active) {
        try {
          await apiClient.post(`/api/auth/subscriptions/${currentSubscription.id}/cancel/`)
        } catch (cancelError: any) {
          console.error('Ошибка при отмене текущей подписки:', cancelError)
          // Продолжаем, даже если отмена не удалась (может быть уже отменена)
        }
      }
      
      // Небольшая задержка перед созданием новой подписки
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Затем создаем новую подписку
      const response = await apiClient.post('/api/auth/subscriptions/', { plan_id: planId })
      
      setModal({
        isOpen: true,
        title: 'Тариф изменен',
        message: `Вы успешно перешли на тариф "${plan.name}". Подписка активирована.`,
        type: 'success'
      })
      
      // Обновляем данные
      await loadData()
    } catch (error: any) {
      console.error('Ошибка переключения тарифа:', error)
      
      let errorMessage = 'Не удалось переключить тариф'
      
      // Проверяем статус ошибки
      if (error.response?.status === 404) {
        errorMessage = 'Страница не найдена. Пожалуйста, обновите страницу и попробуйте снова.'
      } else if (error.response?.status === 409) {
        errorMessage = 'У вас уже есть активная подписка. Пожалуйста, сначала отмените текущую подписку.'
      } else if (error.response?.data) {
        const data = error.response.data
        
        // Проверяем, не является ли ответ HTML
        if (typeof data === 'string' && (data.includes('<!doctype') || data.includes('<html') || data.includes('Not Found'))) {
          errorMessage = 'Сервер вернул ошибку. Пожалуйста, обновите страницу и попробуйте снова.'
        } else if (typeof data === 'object') {
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
      
      // Убираем технические детали и HTML теги
      errorMessage = errorMessage
        .replace(/<[^>]*>/g, '') // Удаляем HTML теги
        .replace(/<!doctype[^>]*>/gi, '')
        .replace(/<html[^>]*>/gi, '')
        .replace(/<head[^>]*>.*?<\/head>/gis, '')
        .replace(/<body[^>]*>/gi, '')
        .replace(/<\/body>/gi, '')
        .replace(/<\/html>/gi, '')
        .replace(/Not Found/gi, 'Страница не найдена')
        .replace(/The requested resource was not found on this server/gi, 'Запрашиваемый ресурс не найден на сервере')
        .replace(/\{/g, '')
        .replace(/\}/g, '')
        .replace(/"/g, '')
        .replace(/detail:/gi, '')
        .replace(/error:/gi, '')
        .replace(/\s+/g, ' ') // Убираем множественные пробелы
        .trim()
      
      // Если после очистки сообщение пустое или содержит только технические детали, используем общее сообщение
      if (!errorMessage || errorMessage.length < 5) {
        if (error.response?.status === 404) {
          errorMessage = 'Страница не найдена. Пожалуйста, обновите страницу и попробуйте снова.'
        } else {
          errorMessage = 'Произошла ошибка при переключении тарифа. Пожалуйста, попробуйте позже.'
        }
      }
      
      setModal({
        isOpen: true,
        title: 'Ошибка',
        message: errorMessage,
        type: 'error'
      })
    } finally {
      setCancelling(false)
    }
  }

  const confirmCancelSubscription = async () => {
    if (!currentSubscription) return

    try {
      setCancelling(true)
      const response = await apiClient.post(`/api/auth/subscriptions/${currentSubscription.id}/cancel/`)
      
      setModal({
        isOpen: true,
        title: 'Подписка отменена',
        message: 'Ваша подписка успешно отменена. Доступ к функциям тарифа будет действовать до окончания оплаченного периода.',
        type: 'success'
      })
      
      // Обновляем данные
      await loadData()
    } catch (error: any) {
      console.error('Ошибка отмены подписки:', error)
      console.error('Error response:', error.response)
      
      // Извлекаем понятное сообщение об ошибке
      let errorMessage = 'Не удалось отменить подписку'
      
      // Проверяем статус ошибки
      if (error.response?.status === 404) {
        errorMessage = 'Подписка не найдена. Возможно, она уже была отменена.'
      } else if (error.response?.status === 400) {
        errorMessage = 'Подписка уже неактивна или не может быть отменена.'
      } else if (error.response?.status === 403) {
        errorMessage = 'У вас нет доступа к этой подписке.'
      } else if (error.response?.status === 500) {
        errorMessage = 'Ошибка сервера. Пожалуйста, попробуйте позже или обратитесь в поддержку.'
      } else if (error.response?.data) {
        const data = error.response.data
        
        // Проверяем, не является ли ответ HTML
        if (typeof data === 'string' && (data.includes('<!doctype') || data.includes('<html') || data.includes('Not Found'))) {
          errorMessage = 'Ошибка сервера. Пожалуйста, обновите страницу и попробуйте снова.'
        } else if (typeof data === 'object') {
          if (data.error) {
            errorMessage = typeof data.error === 'string' ? data.error : String(data.error)
          } else if (data.detail) {
            errorMessage = typeof data.detail === 'string' ? data.detail : String(data.detail)
          } else if (data.message) {
            errorMessage = typeof data.message === 'string' ? data.message : String(data.message)
          }
        } else if (typeof data === 'string') {
          errorMessage = data
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      // Убираем технические детали и HTML теги
      errorMessage = errorMessage
        .replace(/<[^>]*>/g, '') // Удаляем HTML теги
        .replace(/<!doctype[^>]*>/gi, '')
        .replace(/<html[^>]*>/gi, '')
        .replace(/<head[^>]*>.*?<\/head>/gis, '')
        .replace(/<body[^>]*>/gi, '')
        .replace(/<\/body>/gi, '')
        .replace(/<\/html>/gi, '')
        .replace(/Not Found/gi, 'Не найдено')
        .replace(/The requested resource was not found on this server/gi, 'Запрашиваемый ресурс не найден на сервере')
        .replace(/\{/g, '')
        .replace(/\}/g, '')
        .replace(/"/g, '')
        .replace(/detail:/gi, '')
        .replace(/error:/gi, '')
        .replace(/\s+/g, ' ') // Убираем множественные пробелы
        .trim()
      
      setModal({
        isOpen: true,
        title: 'Ошибка',
        message: errorMessage,
        type: 'error'
      })
    } finally {
      setCancelling(false)
    }
  }

  const handleAddCompany = () => {
    // Проверяем лимит компаний по подписке
    if (currentSubscription) {
      const maxCompanies = currentSubscription.plan.max_companies
      if (userCompanies.length >= maxCompanies) {
        setModal({
          isOpen: true,
          title: 'Лимит компаний',
          message: `Вы достигли лимита компаний по вашему тарифу (${maxCompanies}). Для добавления новой компании необходимо оплатить ${currentSubscription.plan.additional_company_price} сом.`,
          type: 'error'
        })
        return
      }
    }
    setEditingCompany(null)
    setShowCompanyModal(true)
  }

  const handleEditCompany = (company: UserCompany) => {
    setEditingCompany(company)
    setShowCompanyModal(true)
  }

  const handleDeleteCompany = async (companyId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту компанию?')) {
      return
    }

    try {
      await apiClient.delete(`/api/auth/user-companies/${companyId}/`)
      setModal({
        isOpen: true,
        title: 'Успешно',
        message: 'Компания успешно удалена.',
        type: 'success'
      })
      await loadData()
    } catch (error: any) {
      console.error('Ошибка удаления компании:', error)
      let errorMessage = 'Не удалось удалить компанию'
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail
      }
      setModal({
        isOpen: true,
        title: 'Ошибка',
        message: errorMessage,
        type: 'error'
      })
    }
  }

  const handleSaveCompany = async (formData: {
    name: string
    inn: string
    bank: string
    account: string
    legal_address: string
    is_default: boolean
  }) => {
    try {
      setSavingCompany(true)
      
      if (editingCompany) {
        // Редактирование существующей компании
        await apiClient.patch(`/api/auth/user-companies/${editingCompany.id}/`, formData)
        setModal({
          isOpen: true,
          title: 'Успешно',
          message: 'Компания успешно обновлена.',
          type: 'success'
        })
      } else {
        // Создание новой компании
        await apiClient.post('/api/auth/user-companies/', formData)
        setModal({
          isOpen: true,
          title: 'Успешно',
          message: 'Компания успешно добавлена.',
          type: 'success'
        })
      }
      
      setShowCompanyModal(false)
      setEditingCompany(null)
      await loadData()
    } catch (error: any) {
      console.error('Ошибка сохранения компании:', error)
      let errorMessage = 'Не удалось сохранить компанию'
      
      if (error.response?.data) {
        const data = error.response.data
        if (typeof data === 'object') {
          if (data.detail) {
            errorMessage = typeof data.detail === 'string' ? data.detail : String(data.detail)
          } else if (data.error) {
            errorMessage = typeof data.error === 'string' ? data.error : String(data.error)
          } else if (data.non_field_errors) {
            errorMessage = Array.isArray(data.non_field_errors) 
              ? data.non_field_errors[0] 
              : String(data.non_field_errors)
          } else {
            // Собираем ошибки полей
            const fieldErrors = Object.entries(data)
              .map(([key, value]: [string, any]) => {
                const fieldName = key === 'name' ? 'Название' : 
                                 key === 'inn' ? 'ИНН' :
                                 key === 'bank' ? 'Банк' :
                                 key === 'account' ? 'Счет' :
                                 key === 'legal_address' ? 'Адрес' : key
                const errorText = Array.isArray(value) ? value[0] : String(value)
                return `${fieldName}: ${errorText}`
              })
              .join(', ')
            if (fieldErrors) {
              errorMessage = fieldErrors
            }
          }
        } else if (typeof data === 'string') {
          errorMessage = data
        }
      }
      
      setModal({
        isOpen: true,
        title: 'Ошибка',
        message: errorMessage,
        type: 'error'
      })
    } finally {
      setSavingCompany(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const getPlanTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'BASIC': 'Базовый',
      'STANDARD': 'Стандарт',
      'VIP': 'VIP'
    }
    return labels[type] || type
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'ACTIVE': 'Активна',
      'EXPIRED': 'Истекла',
      'CANCELLED': 'Отменена'
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'ACTIVE': 'bg-green-100 text-green-800',
      'EXPIRED': 'bg-gray-100 text-gray-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-32 pb-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  const handleInviteUser = async (email: string, role: string) => {
    try {
      setInviting(true)
      await apiClient.post('/api/auth/invite-user/', { email, role })
      setModal({
        isOpen: true,
        title: 'Успешно',
        message: `Приглашение отправлено на ${email}`,
        type: 'success'
      })
    } catch (error: any) {
      console.error('Ошибка приглашения пользователя:', error)
      let errorMessage = 'Не удалось отправить приглашение'
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail
      } else if (error.response?.data?.email) {
        errorMessage = Array.isArray(error.response.data.email) 
          ? error.response.data.email[0] 
          : error.response.data.email
      }
      throw new Error(errorMessage)
    } finally {
      setInviting(false)
    }
  }

  const menuItems = [
    {
      id: 'profile',
      label: 'Профиль',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      path: '/profile',
      onClick: () => navigate('/profile')
    },
    {
      id: 'notifications',
      label: 'Уведомления',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      path: '/profile/notifications',
      onClick: () => navigate('/profile/notifications')
    },
    {
      id: 'subscription',
      label: 'Подписка',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      path: '/subscription',
      onClick: () => navigate('/subscription')
    },
    {
      id: 'instructions',
      label: 'Инструкции',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      path: '/profile/instructions',
      onClick: () => navigate('/profile/instructions')
    },
    {
      id: 'faq',
      label: 'FAQ',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      path: '/profile/faq',
      onClick: () => navigate('/profile/faq')
    },
    {
      id: 'invite',
      label: 'Добавить пользователя',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      onClick: () => setShowInviteModal(true)
    }
  ]

  const currentPath = location.pathname
  const activeItem = menuItems.find(item => item.path === currentPath) || menuItems[0]

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Menu */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24">
                {/* User Info */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="text-sm font-semibold text-gray-900 mb-1">Пользователь</div>
                  <div className="text-xs text-gray-500 mb-2">{user?.role === 'ADMIN' ? 'Администратор' : 'Клиент'}</div>
                  <div className="text-sm text-gray-900">{user?.email || '-'}</div>
                </div>

                {/* Menu Items */}
                <nav className="space-y-1">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={item.onClick}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        activeItem.id === item.id
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className={activeItem.id === item.id ? 'text-gray-900' : 'text-gray-500'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Профиль</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-2">
                  Управление подпиской и данными аккаунта
                </p>
              </div>

          {/* User Info Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Информация о пользователе</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Имя</div>
                <div className="text-base font-medium text-gray-900 mt-1">
                  {user?.full_name || 'Не указано'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <div className="text-base font-medium text-gray-900 mt-1">
                  {user?.email || '-'}
                </div>
              </div>
              {user?.role && (
                <div>
                  <div className="text-sm text-gray-500">Роль</div>
                  <div className="text-base font-medium text-gray-900 mt-1">
                    {user.role === 'ADMIN' ? 'Администратор' : 'Клиент'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Subscription Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Подписка</h2>
              {currentSubscription && currentSubscription.is_active && (
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelling ? 'Отмена...' : 'Отменить подписку'}
                </button>
              )}
            </div>

            {currentSubscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Тариф</div>
                    <div className="text-lg font-semibold text-gray-900 mt-1">
                      {getPlanTypeLabel(currentSubscription.plan.plan_type)}
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(currentSubscription.status)}`}>
                    {getStatusLabel(currentSubscription.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <div className="text-sm text-gray-500">Дата начала</div>
                    <div className="text-base font-medium text-gray-900 mt-1">
                      {formatDate(currentSubscription.start_date)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Дата окончания</div>
                    <div className="text-base font-medium text-gray-900 mt-1">
                      {formatDate(currentSubscription.end_date)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Компаний</div>
                    <div className="text-base font-medium text-gray-900 mt-1">
                      {currentSubscription.companies_count} / {currentSubscription.plan.max_companies}
                    </div>
                  </div>
                  {currentSubscription.plan.delivery_count > 0 && (
                    <div>
                      <div className="text-sm text-gray-500">Доставки</div>
                      <div className="text-base font-medium text-gray-900 mt-1">
                        {currentSubscription.delivery_count_used} / {currentSubscription.plan.delivery_count}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-900 mb-2">Возможности тарифа:</div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      {currentSubscription.plan.delivery_tracking_available ? (
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span>Трекинг доставки</span>
                    </li>
                    <li className="flex items-center gap-2">
                      {currentSubscription.plan.installment_available ? (
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span>Рассрочка</span>
                    </li>
                  </ul>
                </div>

                {currentSubscription.is_active && (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => navigate('/subscription')}
                      className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Изменить тариф
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-600 mb-4">У вас нет активной подписки</p>
                <button
                  onClick={() => navigate('/subscription')}
                  className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Оформить подписку
                </button>
              </div>
            )}
          </div>

          {/* Companies Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Мои компании</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  {userCompanies.length} {userCompanies.length === 1 ? 'компания' : 'компаний'}
                </span>
                <button
                  onClick={handleAddCompany}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Добавить
                </button>
              </div>
            </div>

            {userCompanies.length > 0 ? (
              <div className="space-y-3">
                {userCompanies.map((company) => (
                  <div
                    key={company.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-base font-semibold text-gray-900 truncate">
                            {company.name}
                          </h3>
                          {company.is_default && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              По умолчанию
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>ИНН: {company.inn}</div>
                          {company.bank && <div>Банк: {company.bank}</div>}
                          {company.account && <div>Счет: {company.account}</div>}
                          {company.legal_address && (
                            <div className="text-xs text-gray-500">Адрес: {company.legal_address}</div>
                          )}
                          <div className="text-xs text-gray-500 mt-2">
                            Заказов: {company.orders_count}
                            {company.installment_available && (
                              <span className="ml-2 text-green-600">• Рассрочка доступна</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                        <button
                          onClick={() => handleEditCompany(company)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Редактировать"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteCompany(company.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Удалить"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="text-gray-600 mb-4">У вас пока нет сохраненных компаний</p>
                <p className="text-sm text-gray-500 mb-4">
                  Добавьте компанию для автоматической генерации счета на оплату при оформлении заказов
                </p>
                <button
                  onClick={handleAddCompany}
                  className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Добавить компанию
                </button>
              </div>
            )}
          </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ModernModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
      
      <ConfirmCancelSubscriptionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancelSubscription}
        onSwitchToPlan={handleSwitchToPlan}
        currentPlanType={currentSubscription?.plan.plan_type}
        availablePlans={availablePlans}
      />
      
      <CompanyFormModal
        isOpen={showCompanyModal}
        onClose={() => {
          setShowCompanyModal(false)
          setEditingCompany(null)
        }}
        onSubmit={handleSaveCompany}
        initialData={editingCompany ? {
          name: editingCompany.name,
          inn: editingCompany.inn,
          bank: editingCompany.bank || '',
          account: editingCompany.account || '',
          legal_address: editingCompany.legal_address || '',
          is_default: editingCompany.is_default
        } : null}
        loading={savingCompany}
      />

      <InviteUserModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInviteUser}
        loading={inviting}
      />
    </>
  )
}

