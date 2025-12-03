import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import apiClient from '../api/client'

// Конвертируем единицы измерения в маленькие буквы
const unitMap: Record<string, string> = {
  'M': 'м',
  'КГ': 'кг',
  'Шт': 'шт',
  'ШТ': 'шт',
  'м': 'м',
  'кг': 'кг',
  'шт': 'шт',
}

export default function CartSummary() {
  const navigate = useNavigate()
  const { items, removeItem, updateQuantity, clear, getTotalAmount, getTotalItems } = useCartStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const totalAmount = getTotalAmount()
  const totalItems = getTotalItems()

  const displayUnit = (unit: string) => unitMap[unit] || unit.toLowerCase()

  const handleSubmitOrder = async () => {
    if (items.length === 0) return

    setIsSubmitting(true)
    try {
      // Создаем заявку со всеми товарами
      await apiClient.post('/api/orders/create/', {
        delivery_address: '',
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: String(item.quantity),
        }))
      })

      // Очищаем корзину
      clear()
      
      // Показываем сообщение и переходим к заявкам
      alert('✅ Заявка отправлена!')
      navigate('/orders')
    } catch (error: any) {
      console.error('Ошибка создания заявки:', error)
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          'Ошибка при отправке заявки'
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-200 shadow-2xl z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок корзины */}
        <div className="py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative">
              <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="text-base font-semibold text-gray-900">
                Итого: <span className="text-blue-600">{totalItems}</span> {totalItems === 1 ? 'товар' : totalItems < 5 ? 'товара' : 'товаров'} на сумму <span className="text-blue-600 font-bold text-lg">{totalAmount.toLocaleString('ru-RU')} сом</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(true)
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              Детали
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleSubmitOrder()
              }}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              {isSubmitting ? 'Отправка...' : 'Оформить заявку'}
            </button>
          </div>
        </div>

        {/* Раскрывающийся список товаров */}
        {isExpanded && (
          <div className="border-t border-gray-200 py-4 max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.product_id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-500">
                      {Number(item.price).toLocaleString('ru-RU')} сом × {item.quantity} {displayUnit(item.unit)} = {(item.price * item.quantity).toLocaleString('ru-RU')} сом
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 border border-gray-300 rounded">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="px-2 py-1 text-gray-600 hover:bg-gray-200 transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="px-2 py-1 text-sm text-gray-900 min-w-[3rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="px-2 py-1 text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
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
            <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Итого:</span>
              <span className="text-lg font-bold text-gray-900">{totalAmount.toLocaleString('ru-RU')} сом</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

