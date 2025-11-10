import { useEffect, useState } from 'react'
import { api } from '../../api/api'
import { Loader2, CheckCircle, XCircle, UserCheck, UserX } from 'lucide-react'

interface User {
  id: number
  email: string
  full_name: string
  phone: string
  company: string
  is_verified: boolean
  is_active: boolean
  is_admin: boolean
  created_at: string
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await api.admin.getUsers()
      setUsers(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка загрузки пользователей')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (userId: number) => {
    try {
      await api.admin.verifyUser(userId)
      fetchUsers()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка верификации')
    }
  }

  const handleActivate = async (userId: number) => {
    try {
      await api.admin.activateUser(userId)
      fetchUsers()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка активации')
    }
  }

  const handleDeactivate = async (userId: number) => {
    try {
      await api.admin.deactivateUser(userId)
      fetchUsers()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка деактивации')
    }
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Управление пользователями</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

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
            {users.map((user) => (
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
                  <div className="flex space-x-2">
                    {!user.is_verified && (
                      <button
                        onClick={() => handleVerify(user.id)}
                        className="text-green-600 hover:text-green-800 flex items-center space-x-1"
                        title="Верифицировать"
                      >
                        <UserCheck className="h-4 w-4" />
                        <span>Верифицировать</span>
                      </button>
                    )}
                    {user.is_active ? (
                      <button
                        onClick={() => handleDeactivate(user.id)}
                        className="text-red-600 hover:text-red-800 flex items-center space-x-1"
                        title="Деактивировать"
                      >
                        <UserX className="h-4 w-4" />
                        <span>Деактивировать</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivate(user.id)}
                        className="text-green-600 hover:text-green-800 flex items-center space-x-1"
                        title="Активировать"
                      >
                        <UserCheck className="h-4 w-4" />
                        <span>Активировать</span>
                      </button>
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

