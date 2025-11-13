import { useEffect, useState } from 'react'
import { adminApi } from '../../shared/api'
import { Loader2, Plus, Edit } from 'lucide-react'

interface Procurement {
  id: number
  name: string
  contact_email?: string
  contact_phone?: string
  is_active: boolean
}

export default function AdminProcurement() {
  const [procurements, setProcurements] = useState<Procurement[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    contact_email: '',
    contact_phone: '',
    is_active: true,
  })

  useEffect(() => {
    fetchProcurements()
  }, [])

  const fetchProcurements = async () => {
    try {
      setLoading(true)
      // TODO: Заменить на реальный API endpoint для снабженцев
      // const data = await adminApi.getProcurements()
      // setProcurements(data)
      setProcurements([])
    } catch (err: any) {
      console.error('Ошибка загрузки снабженцев:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      alert('Введите ФИО снабженца')
      return
    }
    try {
      // TODO: Реализовать создание снабженца
      alert('Функция создания снабженца будет реализована')
      setShowModal(false)
      setFormData({ name: '', contact_email: '', contact_phone: '', is_active: true })
      fetchProcurements()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка создания снабженца')
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Управление снабженцами</h1>
        <button
          onClick={() => {
            setEditingId(null)
            setFormData({ name: '', contact_email: '', contact_phone: '', is_active: true })
            setShowModal(true)
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          <span>Добавить снабженца</span>
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-8 text-center text-gray-500">
          <p>Функция управления снабженцами будет реализована в ближайшее время</p>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingId ? 'Редактирование снабженца' : 'Добавление снабженца'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ФИО *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex space-x-2 pt-4">
                <button
                  onClick={handleCreate}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Создать
                </button>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setEditingId(null)
                    setFormData({ name: '', contact_email: '', contact_phone: '', is_active: true })
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

