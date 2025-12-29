import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useUserStore } from '../store/userStore'
import apiClient from '../api/client'
import Navbar from '../components/Navbar'
import CheckoutForm, { CheckoutFormData } from '../components/CheckoutForm'
import ModernModal from '../components/ModernModal'

const unitMap: Record<string, string> = {
  'M': 'м',
  'КГ': 'кг',
  'Шт': 'шт',
  'ШТ': 'шт',
  'м': 'м',
  'кг': 'кг',
  'шт': 'шт',
}

export default function CartPage() {
  const navigate = useNavigate()
  const { items, removeItem, updateQuantity, getTotalAmount, getTotalItems, clear } = useCartStore()
  const { user } = useUserStore()
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'info' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  })

  const totalAmount = getTotalAmount()
  const totalItems = getTotalItems()

  const displayUnit = (unit: string) => unitMap[unit] || unit.toLowerCase()

  const handleCheckout = async (formData: CheckoutFormData) => {
    if (items.length === 0) {
      setModal({
        isOpen: true,
        title: 'Корзина пуста',
        message: 'Добавьте товары в корзину перед оформлением заказа.',
        type: 'info'
      })
      return
    }

    setLoading(true)
    try {
      const orderData = {
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: String(item.quantity),
        })),
        recipient_name: formData.recipient_name,
        recipient_phone: formData.recipient_phone,
        delivery_address: formData.delivery_address,
        delivery_date: formData.delivery_date || null,
        comment: formData.comment || '',
        payment_type: formData.payment_type,
        ...(formData.user_company_id && {
          user_company_id: formData.user_company_id,
        }),
        ...(formData.payment_type === 'with_invoice' && {
          company_name: formData.company_name,
          company_inn: formData.company_inn,
          company_bank: formData.company_bank,
          company_account: formData.company_account,
          company_legal_address: formData.company_legal_address,
        }),
        ...(formData.installment && {
          installment: formData.installment,
        }),
      }

      const response = await apiClient.post('/api/orders/', orderData)

      clear()

      setModal({
        isOpen: true,
        title: 'Заявка создана!',
        message: `Ваша заявка №${response.data.order_number || response.data.id} успешно создана.`,
        type: 'success'
      })

      setTimeout(() => {
        setModal({ ...modal, isOpen: false })
        navigate('/orders', { replace: true })
      }, 1500)
    } catch (error: any) {
      console.error('Ошибка оформления заказа:', error)
      
      // Извлекаем понятное сообщение об ошибке
      let errorMsg = 'Ошибка оформления заказа'
      
      if (error.response?.data) {
        const data = error.response.data
        
        if (typeof data === 'object') {
          if (data.detail) {
            errorMsg = typeof data.detail === 'string' ? data.detail : String(data.detail)
          } else if (data.error) {
            errorMsg = typeof data.error === 'string' ? data.error : String(data.error)
          } else if (data.message) {
            errorMsg = typeof data.message === 'string' ? data.message : String(data.message)
          } else {
            // Если нет стандартных полей, собираем первое доступное сообщение
            const firstError = Object.values(data).find((val: any) => 
              typeof val === 'string' || (Array.isArray(val) && val.length > 0)
            )
            if (firstError) {
              errorMsg = Array.isArray(firstError) ? firstError[0] : String(firstError)
            }
          }
        } else if (typeof data === 'string') {
          errorMsg = data
        }
      } else if (error.message) {
        errorMsg = error.message
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
    } finally {
      setLoading(false)
    }
  }

  const defaultFormValues: Partial<CheckoutFormData> = {
    recipient_name: user?.full_name || '',
    recipient_phone: user?.email || '',
    delivery_address: '',
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar activeTab="cart" />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8 pt-20">
          <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Корзина пуста</h2>
            <p className="text-gray-500 mb-6">Добавьте товары в корзину для оформления заказа</p>
            <button
              onClick={() => navigate('/customer/products')}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Перейти к товарам
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab="cart" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 lg:pb-8 pt-20">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Оформление заявки</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Cart Items - Left Column (2/3 on desktop) */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                Товары в корзине ({totalItems})
              </h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.product_id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1 min-w-0 w-full sm:w-auto">
                      <h3 className="font-medium text-sm sm:text-base text-gray-900 mb-1.5 line-clamp-2 break-words">
                        {item.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600 mb-2">
                        <span>{Number(item.price).toLocaleString('ru-RU')} сом</span>
                        <span>×</span>
                        <span>{item.quantity} {displayUnit(item.unit)}</span>
                      </div>
                      <div className="text-sm sm:text-base font-semibold text-gray-900">
                        {(item.price * item.quantity).toLocaleString('ru-RU')} сом
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto justify-end sm:justify-start">
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-1 border border-gray-300 rounded-lg bg-white">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors rounded-l-lg"
                          disabled={item.quantity <= 1}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="px-3 py-1.5 text-sm font-medium text-gray-900 min-w-[2.5rem] text-center border-x border-gray-300">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors rounded-r-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                      {/* Delete Button */}
                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Удалить"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="text-base sm:text-lg font-semibold text-gray-700">Итого:</span>
                <span className="text-xl sm:text-2xl font-bold text-gray-900">
                  {totalAmount.toLocaleString('ru-RU')} сом
                </span>
              </div>
            </div>
          </div>

          {/* Checkout Form - Right Column (1/3 on desktop) */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 lg:sticky lg:top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <CheckoutForm onSubmit={handleCheckout} loading={loading} defaultValues={defaultFormValues} />
            </div>
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

