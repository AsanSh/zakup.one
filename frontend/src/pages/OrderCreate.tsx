import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { api } from '../api/api'
import { CheckCircle, AlertCircle } from 'lucide-react'

export default function OrderCreate() {
  const { items, getTotal, clearCart } = useCartStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    delivery_address: '',
    delivery_comment: '',
    delivery_date: '',
    contact_person: '',
    contact_phone: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.createOrder({
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        delivery_address: formData.delivery_address,
        delivery_comment: formData.delivery_comment,
        delivery_date: formData.delivery_date || undefined,
        contact_person: formData.contact_person,
        contact_phone: formData.contact_phone,
      })

      setSuccess(true)
      clearCart()
      setTimeout(() => {
        navigate('/orders')
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка создания заявки')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KGS',
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">
          Заявка успешно создана!
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Перенаправление на страницу заявок...
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Оформление заявки
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white shadow rounded-lg p-6 space-y-6">
              <div>
                <label
                  htmlFor="delivery_address"
                  className="block text-sm font-medium text-gray-700"
                >
                  Адрес доставки *
                </label>
                <input
                  type="text"
                  name="delivery_address"
                  id="delivery_address"
                  required
                  value={formData.delivery_address}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="delivery_date"
                  className="block text-sm font-medium text-gray-700"
                >
                  Желаемая дата доставки
                </label>
                <input
                  type="date"
                  name="delivery_date"
                  id="delivery_date"
                  value={formData.delivery_date}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="contact_person"
                  className="block text-sm font-medium text-gray-700"
                >
                  Контактное лицо на объекте
                </label>
                <input
                  type="text"
                  name="contact_person"
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="contact_phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Контактный телефон
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="delivery_comment"
                  className="block text-sm font-medium text-gray-700"
                >
                  Комментарий
                </label>
                <textarea
                  name="delivery_comment"
                  id="delivery_comment"
                  rows={4}
                  value={formData.delivery_comment}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Создание заявки...' : 'Создать заявку'}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6 sticky top-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Состав заявки
            </h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.product_id} className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-900">{item.name}</span>
                    <span className="text-gray-600">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                  <div className="text-gray-500">
                    {formatPrice(item.price)} × {item.quantity}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between text-lg font-medium">
                <span>Итого:</span>
                <span>{formatPrice(getTotal())}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

