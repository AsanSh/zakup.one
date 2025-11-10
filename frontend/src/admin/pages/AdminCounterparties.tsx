import { useEffect, useState } from 'react'
import { api } from '../../api/api'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

interface Counterparty {
  id: number
  email: string
  full_name: string
  company: string
  is_verified: boolean
  is_active: boolean
  access_level: 'full' | 'limited' | 'restricted'
  created_at: string
}

export default function AdminCounterparties() {
  const [counterparties, setCounterparties] = useState<Counterparty[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<number | null>(null)
  const [accessForm, setAccessForm] = useState({
    access_level: 'full' as 'full' | 'limited' | 'restricted',
  })

  useEffect(() => {
    fetchCounterparties()
  }, [])

  const fetchCounterparties = async () => {
    try {
      setLoading(true)
      const users = await api.admin.getUsers()
      // Преобразуем пользователей в контрагентов
      setCounterparties(
        users.map((u: any) => ({
          ...u,
          access_level: u.is_verified ? 'full' : 'restricted',
        }))
      )
    } catch (err: any) {
      console.error('Ошибка загрузки контрагентов:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAccessUpdate = async (userId: number) => {
    try {
      // TODO: Реализовать обновление уровня доступа через API
      if (accessForm.access_level === 'full') {
        await api.admin.verifyUser(userId)
        await api.admin.activateUser(userId)
      } else if (accessForm.access_level === 'restricted') {
        await api.admin.deactivateUser(userId)
      }
      setSelectedUser(null)
      fetchCounterparties()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка обновления доступа')
    }
  }

  const accessLevelLabels: Record<string, string> = {
    full: 'Полный доступ',
    limited: 'Ограниченный доступ',
    restricted: 'Ограничен',
  }

  const accessLevelColors: Record<string, string> = {
    full: 'bg-green-100 text-green-800',
    limited: 'bg-yellow-100 text-yellow-800',
    restricted: 'bg-red-100 text-red-800',
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Управление контрагентами</h1>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Контрагент</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Компания</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Уровень доступа</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {counterparties.map((counterparty) => (
              <>
                <tr key={counterparty.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div>
                      <div className="font-medium text-gray-900">{counterparty.full_name}</div>
                      <div className="text-gray-500">{counterparty.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {counterparty.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        accessLevelColors[counterparty.access_level] || accessLevelColors.restricted
                      }`}
                    >
                      {accessLevelLabels[counterparty.access_level] || 'Ограничен'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      {counterparty.is_verified ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Верифицирован
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          <XCircle className="h-3 w-3 mr-1" />
                          Не верифицирован
                        </span>
                      )}
                      {counterparty.is_active ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Активен
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Деактивирован
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => {
                        setSelectedUser(counterparty.id)
                        setAccessForm({
                          access_level: counterparty.access_level,
                        })
                      }}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      Изменить доступ
                    </button>
                  </td>
                </tr>
                {selectedUser === counterparty.id && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 bg-gray-50">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Изменение уровня доступа для {counterparty.full_name}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Уровень доступа
                            </label>
                            <select
                              value={accessForm.access_level}
                              onChange={(e) => setAccessForm({ access_level: e.target.value as any })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                              <option value="full">Полный доступ</option>
                              <option value="limited">Ограниченный доступ</option>
                              <option value="restricted">Ограничен</option>
                            </select>
                          </div>
                          <div className="flex items-end">
                            <div className="w-full space-y-2">
                              <button
                                onClick={() => handleAccessUpdate(counterparty.id)}
                                className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                              >
                                Сохранить
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(null)
                                  setAccessForm({ access_level: 'full' })
                                }}
                                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                              >
                                Отмена
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                          <p className="font-medium mb-2">Описание уровней доступа:</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li><strong>Полный доступ:</strong> Верифицирован, может создавать заявки, видеть все товары</li>
                            <li><strong>Ограниченный доступ:</strong> Может видеть товары, но с ограничениями</li>
                            <li><strong>Ограничен:</strong> Доступ заблокирован, требуется верификация</li>
                          </ul>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

