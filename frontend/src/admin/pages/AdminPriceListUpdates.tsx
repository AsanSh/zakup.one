import { useEffect, useState } from 'react'
import { adminApi } from '../../shared/api'
import { Loader2, Clock, CheckCircle, XCircle, Edit, Play, Pause } from 'lucide-react'

interface PriceListUpdate {
  id: number
  supplier_id: number
  supplier_name: string | null
  download_url: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'manual'
  last_update: string | null
  next_update: string | null
  last_imported_count: number
  last_updated_count: number
  last_error: string | null
  is_active: boolean
}

export default function AdminPriceListUpdates() {
  const [updates, setUpdates] = useState<PriceListUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    frequency: 'manual' as 'daily' | 'weekly' | 'monthly' | 'manual',
    is_active: true,
  })

  useEffect(() => {
    fetchUpdates()
  }, [])

  const fetchUpdates = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getPriceListUpdates()
      // Приводим данные к правильному типу
      setUpdates(data as PriceListUpdate[])
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
    manual: 'Вручную',
  }

  const handleEdit = (update: PriceListUpdate) => {
    setEditingId(update.id)
    setFormData({
      frequency: update.frequency,
      is_active: update.is_active,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!editingId) return
    
    try {
      await adminApi.updatePriceListUpdate(editingId, formData)
      setShowModal(false)
      setEditingId(null)
      fetchUpdates()
      alert('Настройки обновлены')
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка обновления настроек')
    }
  }

  const handleRunNow = async (updateId: number) => {
    if (!confirm('Запустить обновление прайс-листа сейчас?')) {
      return
    }
    
    try {
      const result = await adminApi.runPriceListUpdate(updateId)
      if (result.success) {
        alert(`Обновление завершено!\nДобавлено: ${result.imported || 0}\nОбновлено: ${result.updated || 0}`)
        fetchUpdates()
      } else {
        alert(`Ошибка: ${result.error || 'Неизвестная ошибка'}`)
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка запуска обновления')
    }
  }

  const handleToggleActive = async (update: PriceListUpdate) => {
    try {
      await adminApi.updatePriceListUpdate(update.id, {
        is_active: !update.is_active,
      })
      fetchUpdates()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка изменения статуса')
    }
  }

  const formatDate = (dateString?: string | null) => {
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
          <p className="text-sm text-gray-500 mt-2">
            Настройте расписание автоматического обновления прайс-листов. 
            Добавьте URL для скачивания на странице "Прайс-листы" → "Скачать по URL"
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Поставщик</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Частота</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Последнее обновление</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Следующее</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Результат</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {updates.map((update) => (
              <tr key={update.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {update.supplier_name || `ID: ${update.supplier_id}`}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={update.download_url}>
                  {update.download_url}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{frequencyLabels[update.frequency] || update.frequency}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(update.last_update)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(update.next_update)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {update.last_imported_count > 0 || update.last_updated_count > 0 ? (
                    <div className="text-xs">
                      <div>+{update.last_imported_count}</div>
                      <div>~{update.last_updated_count}</div>
                    </div>
                  ) : (
                    '-'
                  )}
                  {update.last_error && (
                    <div className="text-xs text-red-600 mt-1" title={update.last_error}>
                      Ошибка
                    </div>
                  )}
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
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(update)}
                      className="text-primary-600 hover:text-primary-800"
                      title="Изменить"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRunNow(update.id)}
                      className="text-green-600 hover:text-green-800"
                      title="Запустить сейчас"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(update)}
                      className={update.is_active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}
                      title={update.is_active ? 'Деактивировать' : 'Активировать'}
                    >
                      {update.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && editingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Изменить настройки обновления</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Частота обновления</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="manual">Вручную</option>
                  <option value="daily">Ежедневно</option>
                  <option value="weekly">Еженедельно</option>
                  <option value="monthly">Ежемесячно</option>
                </select>
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Активно</span>
                </label>
              </div>
              <div className="flex space-x-2 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Сохранить
                </button>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setEditingId(null)
                  }}
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

