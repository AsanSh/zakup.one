import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../../shared/api'
import type { User } from '../../shared/types'
import { Loader2, CheckCircle, XCircle, UserCheck, UserX, DollarSign } from 'lucide-react'

// User type imported from shared/types

export default function AdminUsers() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [pendingUsers, setPendingUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending')

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingUsers()
    } else {
      fetchUsers()
    }
  }, [activeTab])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getUsers()
      setUsers(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка загрузки пользователей')
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingUsers = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getPendingUsers()
      setPendingUsers(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка загрузки заявок на регистрацию')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (userId: number) => {
    try {
      await adminApi.verifyUser(userId)
      if (activeTab === 'pending') {
        fetchPendingUsers()
      } else {
        fetchUsers()
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка верификации')
    }
  }

  const handleActivate = async (userId: number) => {
    try {
      await adminApi.activateUser(userId)
      if (activeTab === 'pending') {
        fetchPendingUsers()
      } else {
        fetchUsers()
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка активации')
    }
  }

  const handleDeactivate = async (userId: number) => {
    try {
      await adminApi.deactivateUser(userId)
      if (activeTab === 'pending') {
        fetchPendingUsers()
      } else {
        fetchUsers()
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка деактивации')
    }
  }

  const handleReject = async (userId: number) => {
    const reason = prompt('Отклонить заявку на регистрацию? Пользователь будет деактивирован.\n\nУкажите причину отклонения (необязательно):')
    if (reason === null) {
      return // Пользователь отменил
    }
    try {
      await adminApi.rejectUser(userId, reason || undefined)
      fetchPendingUsers()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка отклонения заявки')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const displayUsers = activeTab === 'pending' ? pendingUsers : users

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Управление пользователями</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Вкладки */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            На одобрении ({pendingUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Все клиенты ({users.length})
          </button>
        </nav>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ФИО</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Компания</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.full_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.company}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1">
                    {user.is_verified ? (
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
                    {user.is_active ? (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        Активен
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Деактивирован
                      </span>
                    )}
                    {user.is_admin && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        Админ
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex flex-wrap gap-2">
                    {activeTab === 'all' && (
                      <button
                        onClick={() => navigate(`/admin/users/${user.id}/finance`)}
                        className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                        title="Управление финансами"
                      >
                        <DollarSign className="h-4 w-4" />
                        <span>Финансы</span>
                      </button>
                    )}
                    {activeTab === 'pending' && !user.is_verified && (
                      <>
                        <button
                          onClick={() => handleVerify(user.id)}
                          className="text-green-600 hover:text-green-800 flex items-center space-x-1 px-2 py-1 rounded hover:bg-green-50 transition-colors"
                          title="Одобрить заявку"
                        >
                          <UserCheck className="h-4 w-4" />
                          <span>Одобрить</span>
                        </button>
                        <button
                          onClick={() => handleReject(user.id)}
                          className="text-red-600 hover:text-red-800 flex items-center space-x-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                          title="Отклонить заявку"
                        >
                          <UserX className="h-4 w-4" />
                          <span>Отклонить</span>
                        </button>
                      </>
                    )}
                    {activeTab === 'all' && (
                      <>
                        {!user.is_verified && (
                          <button
                            onClick={() => handleVerify(user.id)}
                            className="text-green-600 hover:text-green-800 flex items-center space-x-1 px-2 py-1 rounded hover:bg-green-50 transition-colors"
                            title="Верифицировать"
                          >
                            <UserCheck className="h-4 w-4" />
                            <span>Верифицировать</span>
                          </button>
                        )}
                        {user.is_active ? (
                          <button
                            onClick={() => handleDeactivate(user.id)}
                            className="text-red-600 hover:text-red-800 flex items-center space-x-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                            title="Деактивировать"
                          >
                            <UserX className="h-4 w-4" />
                            <span>Деактивировать</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(user.id)}
                            className="text-green-600 hover:text-green-800 flex items-center space-x-1 px-2 py-1 rounded hover:bg-green-50 transition-colors"
                            title="Активировать"
                          >
                            <UserCheck className="h-4 w-4" />
                            <span>Активировать</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

