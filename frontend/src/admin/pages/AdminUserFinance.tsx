/**
 * Страница управления финансовой информацией пользователя
 * Доступна только администраторам
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adminApi } from '../../shared/api'
import type { User } from '../../shared/types'
import { formatPrice } from '../../shared/utils/formatters'
import { Loader2, Save, ArrowLeft, DollarSign, CreditCard } from 'lucide-react'

export default function AdminUserFinance() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Финансовые данные
  const [financialData, setFinancialData] = useState({
    deposit_name: '',
    deposit_valuation: 0,
    credit_limit: 0,
    credit_term: 30,
  })

  useEffect(() => {
    if (userId) {
      fetchUserData()
    }
  }, [userId])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      // TODO: Заменить на реальный API endpoint для получения финансовой информации пользователя
      // const userData = await adminApi.getUserFinance(parseInt(userId!))
      
      // Временные данные для демонстрации
      const users = await adminApi.getUsers()
      const foundUser = users.find(u => u.id === parseInt(userId!))
      
      if (foundUser) {
        setUser(foundUser)
        // В реальном приложении эти данные будут загружаться с сервера
        setFinancialData({
          deposit_name: 'Недвижимость, г. Бишкек, ул. Чуй, д. 123',
          deposit_valuation: 100000,
          credit_limit: 50000,
          credit_term: 30,
        })
      } else {
        setError('Пользователь не найден')
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')
      
      // TODO: Заменить на реальный API endpoint для сохранения финансовой информации
      // await adminApi.updateUserFinance(parseInt(userId!), financialData)
      
      // Временная имитация сохранения
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setSuccess('Финансовая информация успешно обновлена')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка сохранения данных')
    } finally {
      setSaving(false)
    }
  }

  const handleCreditLimitChange = (value: number) => {
    setFinancialData({
      ...financialData,
      credit_limit: value,
    })
  }

  const handleDepositValuationChange = (value: number) => {
    const newValuation = value
    const newCreditLimit = Math.floor(newValuation * 0.5) // 50% от оценочной стоимости
    setFinancialData({
      ...financialData,
      deposit_valuation: newValuation,
      credit_limit: newCreditLimit,
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Пользователь не найден'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Заголовок */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/users')}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к списку пользователей
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          Финансовая информация пользователя
        </h1>
        <p className="text-sm text-gray-600 mt-2">
          {user.full_name} ({user.email})
        </p>
      </div>

      {/* Сообщения об ошибках и успехе */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm">{success}</p>
        </div>
      )}

      {/* Финансовый раздел */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-600" />
            Финансовая информация
          </h2>
        </div>
        <div className="p-6 space-y-6">
          {/* Залог клиента */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
              Залог клиента
            </h3>
            
            {/* Наименование залога (только просмотр) */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Наименование залога
              </label>
              <div className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                {financialData.deposit_name || 'Не указано'}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Наименование залога устанавливается клиентом в его профиле
              </p>
            </div>

            {/* Оценочная стоимость, лимит и срок рассрочки - редактируемые поля */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              {/* Оценочная стоимость */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Оценочная стоимость (сом)
                </label>
                <input
                  type="number"
                  value={financialData.deposit_valuation}
                  onChange={(e) => handleDepositValuationChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0"
                  min="0"
                  step="1000"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Введите оценочную стоимость залога
                </p>
              </div>

              {/* Лимит на рассрочку */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Лимит на рассрочку (сом)
                </label>
                <input
                  type="number"
                  value={financialData.credit_limit}
                  onChange={(e) => handleCreditLimitChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0"
                  min="0"
                  step="1000"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Автоматически рассчитывается как 50% от оценочной стоимости
                </p>
              </div>

              {/* Срок рассрочки */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Срок рассрочки (дней)
                </label>
                <input
                  type="number"
                  value={financialData.credit_term}
                  onChange={(e) => setFinancialData({ ...financialData, credit_term: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="30"
                  min="1"
                  step="1"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Укажите срок рассрочки в днях
                </p>
              </div>
            </div>

            {/* Предварительный просмотр */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Предварительный просмотр</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between bg-green-50 rounded-lg px-4 py-3 border border-green-200 h-16">
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-600">Оценочная стоимость</p>
                  </div>
                  <p className="text-xl font-bold text-green-700 whitespace-nowrap ml-4">
                    {formatPrice(financialData.deposit_valuation)}
                  </p>
                </div>
                <div className="flex items-center justify-between bg-primary-50 rounded-lg px-4 py-3 border border-primary-200 h-16">
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-600">Лимит на рассрочку</p>
                  </div>
                  <p className="text-xl font-bold text-primary-700 whitespace-nowrap ml-4">
                    {formatPrice(financialData.credit_limit)}
                  </p>
                </div>
                <div className="flex items-center justify-between bg-blue-50 rounded-lg px-4 py-3 border border-blue-200 h-16">
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-600">Срок рассрочки</p>
                  </div>
                  <p className="text-xl font-bold text-blue-700 whitespace-nowrap ml-4">
                    {financialData.credit_term} дней
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Кнопка сохранения */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Сохранить изменения
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

