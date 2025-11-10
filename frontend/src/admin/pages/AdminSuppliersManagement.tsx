import { useEffect, useState } from 'react'
import { adminApi } from '../../shared/api'
import { Loader2, Plus, Edit } from 'lucide-react'

interface Supplier {
  id: number
  name: string
  contact_email?: string
  contact_phone?: string
  is_active: boolean
}

export default function AdminSuppliersManagement() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
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
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getSuppliers()
      setSuppliers(data)
    } catch (err: any) {
      console.error('Ошибка загрузки поставщиков:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      alert('Введите название поставщика')
      return
    }
    try {
      await adminApi.createSupplier({
        name: formData.name.trim(),
        contact_email: formData.contact_email?.trim() || undefined,
        contact_phone: formData.contact_phone?.trim() || undefined,
      })
      setShowModal(false)
      setFormData({ name: '', contact_email: '', contact_phone: '', is_active: true })
      fetchSuppliers()
      alert('Поставщик успешно добавлен')
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка создания поставщика')
    }
  }

  const handleUpdate = async () => {
    if (!editingId) return
    if (!formData.name.trim()) {
      alert('Введите название поставщика')
      return
    }
    try {
      await adminApi.updateSupplier(editingId, {
        name: formData.name.trim(),
        contact_email: formData.contact_email?.trim() || undefined,
        contact_phone: formData.contact_phone?.trim() || undefined,
      })
      setShowModal(false)
      setEditingId(null)
      setFormData({ name: '', contact_email: '', contact_phone: '', is_active: true })
      fetchSuppliers()
      alert('Поставщик успешно обновлен')
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка обновления поставщика')
    }
  }

  const handleToggleActive = async (supplierId: number) => {
    try {
      await adminApi.toggleSupplierActive(supplierId)
      fetchSuppliers()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка изменения статуса')
    }
  }

  const handleEdit = (supplier: Supplier) => {
    setEditingId(supplier.id)
    setFormData({
      name: supplier.name,
      contact_email: supplier.contact_email || '',
      contact_phone: supplier.contact_phone || '',
      is_active: supplier.is_active,
    })
    setShowModal(true)
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
          <h1 className="text-3xl font-bold text-gray-900">Управление поставщиками</h1>
          <p className="text-sm text-gray-600 mt-2">
            Добавляйте поставщиков, загружайте их прайс-листы и управляйте товарами. 
            Клиенты (заказчики/снабженцы) регистрируются отдельно и не являются поставщиками.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null)
            setFormData({ name: '', contact_email: '', contact_phone: '', is_active: true })
            setShowModal(true)
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Plus className="h-5 w-5" />
          <span>Добавить поставщика</span>
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Телефон</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {suppliers.map((supplier) => (
              <tr key={supplier.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{supplier.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {supplier.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {supplier.contact_email || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {supplier.contact_phone || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      supplier.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {supplier.is_active ? 'Активен' : 'Неактивен'}
                  </span>
                </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(supplier)}
                        className="text-primary-600 hover:text-primary-800"
                        title="Редактировать"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(supplier.id)}
                        className={`${
                          supplier.is_active
                            ? 'text-red-600 hover:text-red-800'
                            : 'text-green-600 hover:text-green-800'
                        }`}
                        title={supplier.is_active ? 'Деактивировать' : 'Активировать'}
                      >
                        {supplier.is_active ? 'Деакт.' : 'Акт.'}
                      </button>
                    </div>
                  </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingId ? 'Редактирование поставщика' : 'Добавление поставщика'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
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
                  onClick={editingId ? handleUpdate : handleCreate}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  {editingId ? 'Сохранить' : 'Создать'}
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

