import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/api'
import { Loader2, Upload, Plus, FileSpreadsheet, Settings, DollarSign, Users, Calendar } from 'lucide-react'

interface Supplier {
  id: number
  name: string
  contact_email?: string
  contact_phone?: string
  is_active: boolean
}

export default function AdminPriceLists() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    supplier_id: '',
    header_row: '7',
    start_row: '8',
    file: null as File | null,
  })

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      const data = await api.admin.getSuppliers()
      setSuppliers(data)
    } catch (err: any) {
      console.error('Ошибка загрузки поставщиков:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async () => {
    if (!uploadForm.file || !uploadForm.supplier_id) {
      alert('Выберите файл и поставщика')
      return
    }

    try {
      setUploading(true)
      await api.admin.importPriceList(
        uploadForm.file,
        parseInt(uploadForm.supplier_id),
        parseInt(uploadForm.header_row),
        parseInt(uploadForm.start_row)
      )
      alert('Прайс-лист успешно загружен!')
      setShowUploadModal(false)
      setUploadForm({
        supplier_id: '',
        header_row: '7',
        start_row: '8',
        file: null,
      })
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка загрузки прайс-листа')
    } finally {
      setUploading(false)
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
        <h1 className="text-3xl font-bold text-gray-900">Прайс-листы</h1>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Upload className="h-5 w-5" />
          <span>Загрузить прайс-лист</span>
        </button>
      </div>

      {/* Меню "Управление" */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2 text-primary-600" />
          Управление
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/price-lists/management/updates"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="h-5 w-5 text-primary-600" />
            <div>
              <div className="text-sm font-medium text-gray-900">Обновление прайс-листов</div>
              <div className="text-xs text-gray-500">Расписание обновлений</div>
            </div>
          </Link>
          <Link
            to="/admin/price-lists/management/prices"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <DollarSign className="h-5 w-5 text-primary-600" />
            <div>
              <div className="text-sm font-medium text-gray-900">Управление ценами</div>
              <div className="text-xs text-gray-500">Массовое изменение цен</div>
            </div>
          </Link>
          <Link
            to="/admin/price-lists/management/counterparties"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="h-5 w-5 text-primary-600" />
            <div>
              <div className="text-sm font-medium text-gray-900">Управление контрагентами</div>
              <div className="text-xs text-gray-500">Доступ и права</div>
            </div>
          </Link>
          <Link
            to="/admin/price-lists/management/suppliers"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileSpreadsheet className="h-5 w-5 text-primary-600" />
            <div>
              <div className="text-sm font-medium text-gray-900">Управление поставщиками</div>
              <div className="text-xs text-gray-500">Настройки поставщиков</div>
            </div>
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Поставщики</h2>
        <div className="space-y-4">
          {suppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div>
                <h3 className="text-lg font-medium text-gray-900">{supplier.name}</h3>
                {supplier.contact_email && (
                  <p className="text-sm text-gray-600">{supplier.contact_email}</p>
                )}
                {supplier.contact_phone && (
                  <p className="text-sm text-gray-600">{supplier.contact_phone}</p>
                )}
              </div>
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  supplier.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {supplier.is_active ? 'Активен' : 'Неактивен'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Загрузка прайс-листа</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Поставщик
                </label>
                <select
                  value={uploadForm.supplier_id}
                  onChange={(e) => setUploadForm({ ...uploadForm, supplier_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Выберите поставщика</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Файл (Excel)
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) =>
                    setUploadForm({
                      ...uploadForm,
                      file: e.target.files?.[0] || null,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Строка заголовка
                  </label>
                  <input
                    type="number"
                    value={uploadForm.header_row}
                    onChange={(e) => setUploadForm({ ...uploadForm, header_row: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Строка начала данных
                  </label>
                  <input
                    type="number"
                    value={uploadForm.start_row}
                    onChange={(e) => setUploadForm({ ...uploadForm, start_row: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="flex space-x-2 pt-4">
                <button
                  onClick={handleFileUpload}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {uploading ? 'Загрузка...' : 'Загрузить'}
                </button>
                <button
                  onClick={() => {
                    setShowUploadModal(false)
                    setUploadForm({
                      supplier_id: '',
                      header_row: '7',
                      start_row: '8',
                      file: null,
                    })
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

