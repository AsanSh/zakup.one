import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../shared/api'
import { Loader2, Upload, FileSpreadsheet, Settings, DollarSign, Users, Calendar, Download } from 'lucide-react'

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
  const [error, setError] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    supplier_id: '',
    header_row: '7',
    start_row: '8',
    file: null as File | null,
  })
  const [downloadForm, setDownloadForm] = useState({
    supplier_id: '',
    download_url: '',
    frequency: 'manual',
    header_row: '7',
    start_row: '8',
  })

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await adminApi.getSuppliers()
      setSuppliers(data)
    } catch (err: any) {
      console.error('Ошибка загрузки поставщиков:', err)
      const errorMessage = err.response?.data?.detail || err.message || 'Ошибка загрузки поставщиков'
      setError(errorMessage)
      // Показываем пустой список при ошибке, чтобы не блокировать интерфейс
      setSuppliers([])
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
      await adminApi.importPriceList(
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

  const handleDownloadAndImport = async () => {
    if (!downloadForm.supplier_id || !downloadForm.download_url) {
      alert('Выберите поставщика и укажите URL для скачивания')
      return
    }

    try {
      setUploading(true)
      const result = await adminApi.downloadAndImportPriceList(
        parseInt(downloadForm.supplier_id),
        downloadForm.download_url,
        downloadForm.frequency,
        parseInt(downloadForm.header_row),
        parseInt(downloadForm.start_row)
      )
      alert(`Прайс-лист успешно скачан и импортирован!\nДобавлено: ${result.imported}\nОбновлено: ${result.updated}`)
      setShowDownloadModal(false)
      setDownloadForm({
        supplier_id: '',
        download_url: '',
        frequency: 'manual',
        header_row: '7',
        start_row: '8',
      })
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка скачивания и импорта прайс-листа')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600 mb-4" />
        <p className="text-gray-600">Загрузка поставщиков...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Прайс-листы</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowDownloadModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Download className="h-5 w-5" />
            <span>Скачать по URL</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <Upload className="h-5 w-5" />
            <span>Загрузить файл</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => {
                setError('')
                fetchSuppliers()
              }}
              className="text-red-700 hover:text-red-900 underline text-sm"
            >
              Повторить
            </button>
          </div>
        </div>
      )}

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

      {/* Модальное окно для скачивания по URL */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Скачать прайс-лист по URL</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Поставщик *
                </label>
                <select
                  value={downloadForm.supplier_id}
                  onChange={(e) => setDownloadForm({ ...downloadForm, supplier_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
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
                  URL для скачивания *
                </label>
                <input
                  type="url"
                  value={downloadForm.download_url}
                  onChange={(e) => setDownloadForm({ ...downloadForm, download_url: e.target.value })}
                  placeholder="https://stroydvor.kg/wp-content/uploads/прайс-лист.xlsx"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Пример: https://stroydvor.kg/wp-content/uploads/прайс-лист-10.11.25-.xlsx
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Частота обновления
                </label>
                <select
                  value={downloadForm.frequency}
                  onChange={(e) => setDownloadForm({ ...downloadForm, frequency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="manual">Вручную</option>
                  <option value="daily">Ежедневно</option>
                  <option value="weekly">Еженедельно</option>
                  <option value="monthly">Ежемесячно</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Система будет автоматически скачивать и обновлять прайс-лист по расписанию
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Строка заголовка
                  </label>
                  <input
                    type="number"
                    value={downloadForm.header_row}
                    onChange={(e) => setDownloadForm({ ...downloadForm, header_row: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Строка начала данных
                  </label>
                  <input
                    type="number"
                    value={downloadForm.start_row}
                    onChange={(e) => setDownloadForm({ ...downloadForm, start_row: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="flex space-x-2 pt-4">
                <button
                  onClick={handleDownloadAndImport}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Скачивание и импорт...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Скачать и импортировать
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowDownloadModal(false)
                    setDownloadForm({
                      supplier_id: '',
                      download_url: '',
                      frequency: 'manual',
                      header_row: '7',
                      start_row: '8',
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

