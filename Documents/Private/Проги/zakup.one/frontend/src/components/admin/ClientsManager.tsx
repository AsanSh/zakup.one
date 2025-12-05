import { useState, useEffect } from 'react'
import apiClient from '../../api/client'

interface Client {
  id: number
  email: string
  full_name: string
  role: string
  is_active: boolean
  company: {
    id: number
    name: string
    phone: string
    inn: string
    approved: boolean
  } | null
}

interface Company {
  id: number
  name: string
  phone: string
  email: string
  inn: string
  address: string
  contact_person: string
  approved: boolean
  users_count: number
}

export default function ClientsManager() {
  const [clients, setClients] = useState<Client[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'users' | 'companies'>('users')
  const [showCompanyModal, setShowCompanyModal] = useState(false)
  const [showUserEditModal, setShowUserEditModal] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [editingUser, setEditingUser] = useState<Client | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (activeTab === 'users') {
      loadClients()
    } else {
      loadCompanies()
    }
  }, [activeTab])

  const loadClients = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get('/auth/users/')
      setClients(res.data.results || res.data || [])
    } catch (error) {
      console.error('Ошибка загрузки клиентов:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCompanies = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get('/auth/companies/')
      setCompanies(res.data.results || res.data || [])
    } catch (error) {
      console.error('Ошибка загрузки компаний:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveCompany = async (companyId: number, approved: boolean, reason?: string) => {
    try {
      await apiClient.post(`/auth/companies/${companyId}/approve/`, {
        approved,
        rejection_reason: reason || ''
      })
      loadCompanies()
      loadClients() // Обновляем список пользователей, так как статус компании изменился
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.error || 'Ошибка при изменении статуса компании')
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return
    
    try {
      await apiClient.delete(`/auth/users/${userId}/`)
      loadClients()
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.error || 'Ошибка при удалении пользователя')
    }
  }

  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingUser) return

    setErrorMessage(null)
    const formData = new FormData(e.currentTarget)
    const data: any = {
      email: formData.get('email'),
      full_name: formData.get('full_name'),
      role: formData.get('role'),
      is_active: formData.get('is_active') === 'on',
    }

    const password = formData.get('password')?.toString().trim()
    if (password) {
      data.password = password
    }

    try {
      await apiClient.patch(`/auth/users/${editingUser.id}/`, data)
      setShowUserEditModal(false)
      setEditingUser(null)
      loadClients()
    } catch (error: any) {
      const errorData = error?.response?.data
      let errorMsg = 'Ошибка при сохранении пользователя'
      
      if (errorData) {
        if (errorData.error) {
          errorMsg = errorData.error
        } else if (typeof errorData === 'object') {
          const fieldErrors: string[] = []
          Object.keys(errorData).forEach((key) => {
            const fieldError = errorData[key]
            if (Array.isArray(fieldError)) {
              fieldErrors.push(`${key}: ${fieldError.join(', ')}`)
            } else if (typeof fieldError === 'string') {
              fieldErrors.push(`${key}: ${fieldError}`)
            }
          })
          if (fieldErrors.length > 0) {
            errorMsg = fieldErrors.join('\n')
          }
        } else if (errorData.detail) {
          errorMsg = errorData.detail
        }
      }
      
      setErrorMessage(errorMsg)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Загрузка...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Клиенты</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Пользователи
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'companies'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Компании
          </button>
        </div>
      </div>

      {activeTab === 'users' ? (
        <div className="bg-white rounded-lg shadow-sm">
          <table className="w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '22%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '26%' }} />
            </colgroup>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Имя</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Роль</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Компания</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-2 py-2 text-xs text-gray-900 truncate" title={client.email}>{client.email}</td>
                  <td className="px-2 py-2 text-xs text-gray-600 truncate">{client.full_name || '-'}</td>
                  <td className="px-2 py-2 text-xs text-gray-600 whitespace-nowrap">{client.role}</td>
                  <td className="px-2 py-2 text-xs">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-gray-600 truncate">{client.company?.name || '-'}</span>
                      {client.company && !client.company.approved && (
                        <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 whitespace-nowrap">
                          На рассмотр.
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-2 text-xs">
                    <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${
                      client.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {client.is_active ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-xs">
                    <div className="flex gap-1 flex-wrap">
                      <button
                        onClick={() => {
                          setEditingUser(client)
                          setShowUserEditModal(true)
                          setErrorMessage(null)
                        }}
                        className="text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
                        title="Редактировать"
                      >
                        Редакт.
                      </button>
                      {client.company && !client.company.approved && (
                        <>
                          <button
                            onClick={() => handleApproveCompany(client.company!.id, true)}
                            className="text-green-600 hover:text-green-800 whitespace-nowrap"
                            title="Одобрить компанию"
                          >
                            Одобрить
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Причина отклонения:')
                              if (reason !== null) {
                                handleApproveCompany(client.company!.id, false, reason)
                              }
                            }}
                            className="text-red-600 hover:text-red-800 whitespace-nowrap"
                            title="Отклонить компанию"
                          >
                            Отклонить
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteUser(client.id)}
                        className="text-red-600 hover:text-red-800 whitespace-nowrap"
                        title="Удалить"
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          {companies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Компании не найдены</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm">
              <table className="w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '22%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '24%' }} />
                </colgroup>
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">ИНН</th>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Телефон</th>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Пользователей</th>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {companies.map((company) => (
                    <tr key={company.id} className="hover:bg-gray-50">
                      <td className="px-2 py-2 text-xs text-gray-900 truncate" title={company.name}>{company.name}</td>
                      <td className="px-2 py-2 text-xs text-gray-600 truncate">{company.inn || '-'}</td>
                      <td className="px-2 py-2 text-xs text-gray-600 truncate">{company.phone || '-'}</td>
                      <td className="px-2 py-2 text-xs text-gray-600 whitespace-nowrap">{company.users_count || 0}</td>
                      <td className="px-2 py-2 text-xs">
                        <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${
                          company.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {company.approved ? 'Одобрена' : 'На рассмотр.'}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-xs">
                        <div className="flex gap-1 flex-wrap">
                          {!company.approved && (
                            <>
                              <button
                                onClick={() => handleApproveCompany(company.id, true)}
                                className="text-green-600 hover:text-green-800 whitespace-nowrap"
                                title="Одобрить"
                              >
                                Одобрить
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('Причина отклонения:')
                                  if (reason !== null) {
                                    handleApproveCompany(company.id, false, reason)
                                  }
                                }}
                                className="text-red-600 hover:text-red-800 whitespace-nowrap"
                                title="Отклонить"
                              >
                                Отклонить
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => {
                              setSelectedCompany(company)
                              setShowCompanyModal(true)
                            }}
                            className="text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
                            title="Детали"
                          >
                            Детали
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Модальное окно редактирования пользователя */}
      {showUserEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h4 className="text-base sm:text-lg font-semibold mb-4">Редактировать пользователя</h4>
            
            {errorMessage && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-800 whitespace-pre-line">{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleUpdateUser}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    defaultValue={editingUser.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Полное имя</label>
                  <input
                    type="text"
                    name="full_name"
                    defaultValue={editingUser.full_name || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Роль *</label>
                  <select
                    name="role"
                    required
                    defaultValue={editingUser.role}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="CLIENT">Клиент</option>
                    <option value="ADMIN">Администратор</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Новый пароль (оставьте пустым, чтобы не менять)</label>
                  <input
                    type="password"
                    name="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Оставьте пустым, чтобы не менять"
                  />
                </div>
                <div className="col-span-2 flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    defaultChecked={editingUser.is_active}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Активен</label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserEditModal(false)
                    setEditingUser(null)
                    setErrorMessage(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно деталей компании */}
      {showCompanyModal && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h4 className="text-lg font-semibold mb-4">Детали компании: {selectedCompany.name}</h4>
            <div className="space-y-2 text-sm">
              <div><strong>ИНН:</strong> {selectedCompany.inn || '-'}</div>
              <div><strong>Телефон:</strong> {selectedCompany.phone || '-'}</div>
              <div><strong>Email:</strong> {selectedCompany.email || '-'}</div>
              <div><strong>Адрес:</strong> {selectedCompany.address || '-'}</div>
              <div><strong>Контактное лицо:</strong> {selectedCompany.contact_person || '-'}</div>
              <div><strong>Пользователей:</strong> {selectedCompany.users_count || 0}</div>
              <div><strong>Статус:</strong> {selectedCompany.approved ? 'Одобрена' : 'На рассмотрении'}</div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setShowCompanyModal(false)
                  setSelectedCompany(null)
                }}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно ошибки */}
      {errorMessage && !showUserEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
            <h4 className="text-lg font-semibold text-red-600 mb-4">Ошибка</h4>
            <div className="mb-4">
              <p className="text-sm text-gray-700 whitespace-pre-line">{errorMessage}</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setErrorMessage(null)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
