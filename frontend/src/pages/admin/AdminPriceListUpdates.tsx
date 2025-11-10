import { useEffect, useState } from 'react'
import { api } from '../../api/api'
import { Loader2, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react'

interface PriceListUpdate {
  id: number
  supplier_id: number
  supplier_name: string
  frequency: 'daily' | 'weekly' | 'monthly'
  last_update?: string
  next_update?: string
  is_active: boolean
}

export default function AdminPriceListUpdates() {
  const [updates, setUpdates] = useState<PriceListUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    supplier_id: '',
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    is_active: true,
  })

  useEffect(() => {
    fetchUpdates()
  }, [])

  const fetchUpdates = async () => {
    try {
      setLoading(true)
      // TODO: Добавить API endpoint для получения расписания обновлений
      // const data = await api.admin.getPriceListUpdates()
      // setUpdates(data)
      
      // Временные данные для демонстрации
      const suppliers = await api.admin.getSuppliers()
      setUpdates(
        suppliers.map((s: any) => ({
          id: s.id,
          supplier_id: s.id,
          supplier_name: s.name,
          frequency: 'weekly' as const,
          last_update: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          next_update: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: true,
        }))
      )
    } catch (err: any) {
      console.error('Ошибка загрузки расписания:', err)
    } finally {
      setLoading(false)
    }
  }

  const frequencyLabels: Record<string, string> = {
    daily: 'Ежедневно',
    weekly: 'Еженедельно',
    monthly: 'Ежемесячно',
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Обновление прайс-листов</h1>
          <p className="text-sm text-gray-500 mt-2">Настройте расписание автоматического обновления прайс-листов</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Calendar className="h-5 w-5" />
          <span>Добавить расписание</span>
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Поставщик</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Частота обновления</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Последнее обновление</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Следующее обновление</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {updates.map((update) => (
              <tr key={update.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {update.supplier_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{frequencyLabels[update.frequency]}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(update.last_update)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(update.next_update)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                      update.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {update.is_active ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Активно
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Неактивно
                      </>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button className="text-primary-600 hover:text-primary-800">Изменить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Добавить расписание обновления</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Поставщик</label>
                <select
                  value={formData.supplier_id}
                  onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Выберите поставщика</option>
                  {/* TODO: Загрузить список поставщиков */}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Частота обновления</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="daily">Ежедневно</option>
                  <option value="weekly">Еженедельно</option>
                  <option value="monthly">Ежемесячно</option>
                </select>
              </div>
              <div className="flex space-x-2 pt-4">
                <button
                  onClick={() => {
                    // TODO: Сохранить расписание
                    setShowModal(false)
                  }}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Сохранить
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

