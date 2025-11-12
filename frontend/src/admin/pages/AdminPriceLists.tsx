import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../shared/api'
import { Loader2, Upload, FileSpreadsheet, Settings, DollarSign, Users, Calendar, Download, FileDown, Edit, X } from 'lucide-react'

interface Supplier {
  id: number
  name: string
  contact_email?: string
  contact_phone?: string
  is_active: boolean
}

interface PriceListInfo {
  id: number
  name: string
  contact_email?: string
  contact_phone?: string
  is_active: boolean
  product_count: number
  active_product_count: number
  price_list_updates: Array<{
    id: number
    download_url: string
    file_path?: string | null
    file_name?: string | null
    frequency: string | null
    is_active: boolean
    last_update: string | null
    next_update: string | null
    last_imported_count: number
    last_updated_count: number
    last_error: string | null
  }>
  last_price_list_update: {
    id: number
    download_url: string
    file_path?: string | null
    file_name?: string | null
    frequency: string | null
    is_active: boolean
    last_update: string | null
    next_update: string | null
    last_imported_count: number
    last_updated_count: number
    last_error: string | null
  } | null
}

interface LastUpdateInfo {
  id: number
  supplier: {
    id: number
    name: string
  }
  download_url: string
  frequency: string | null
  is_active: boolean
  last_update: string | null
  next_update: string | null
  last_imported_count: number
  last_updated_count: number
  last_error: string | null
}

export default function AdminPriceLists() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [priceListsInfo, setPriceListsInfo] = useState<PriceListInfo[]>([])
  const [lastUpdate, setLastUpdate] = useState<LastUpdateInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [showSupplierModal, setShowSupplierModal] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<PriceListInfo | null>(null)
  const [supplierStats, setSupplierStats] = useState<any>(null)
  const [loadingStats, setLoadingStats] = useState(false)
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
    fetchPriceListsInfo()
    fetchLastUpdate()
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

  const fetchPriceListsInfo = async () => {
    try {
      const data = await adminApi.getSuppliersPriceLists()
      setPriceListsInfo(data)
    } catch (err: any) {
      console.error('Ошибка загрузки информации о прайс-листах:', err)
      // Ошибка 401 обрабатывается в axios interceptor
      if (err.response?.status === 401) {
        return
      }
    }
  }

  const fetchLastUpdate = async () => {
    try {
      const data = await adminApi.getLastPriceListUpdate()
      if (data.last_update) {
        setLastUpdate(data.last_update)
      }
    } catch (err: any) {
      console.error('Ошибка загрузки последнего обновления:', err)
      // Ошибка 401 обрабатывается в axios interceptor
      if (err.response?.status === 401) {
        return
      }
    }
  }

  const fetchSupplierStats = async (supplierId: number) => {
    try {
      setLoadingStats(true)
      const stats = await adminApi.getSupplierStats(supplierId)
      setSupplierStats(stats)
    } catch (err: any) {
      console.error('Ошибка загрузки статистики поставщика:', err)
      if (err.response?.status === 401) {
        return
      }
      alert('Ошибка загрузки статистики: ' + (err.response?.data?.detail || err.message))
    } finally {
      setLoadingStats(false)
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
      console.error('Ошибка загрузки прайс-листа:', err)
      
      if (err.response?.status === 401) {
        alert('Сессия истекла. Пожалуйста, войдите заново.')
        localStorage.removeItem('auth-storage')
        window.location.href = '/login'
        return
      }
      
      const errorMessage = err.response?.data?.detail || err.message || 'Ошибка загрузки прайс-листа'
      // Убираем неправильное сообщение о базе данных для ошибок аутентификации
      if (errorMessage.includes('База данных недоступна') && err.response?.status === 401) {
        alert('Сессия истекла. Пожалуйста, войдите заново.')
        localStorage.removeItem('auth-storage')
        window.location.href = '/login'
      } else {
        alert(errorMessage)
      }
    } finally {
      setUploading(false)
    }
  }

  const handleDownloadAndImport = async () => {
    if (!downloadForm.supplier_id || !downloadForm.file) {
      alert('Выберите поставщика и файл для загрузки')
      return
    }

    try {
      setUploading(true)
      const result = await adminApi.importPriceList(
        downloadForm.file,
        parseInt(downloadForm.supplier_id),
        parseInt(downloadForm.header_row),
        parseInt(downloadForm.start_row)
      )
      alert(`Прайс-лист успешно загружен и импортирован!\nДобавлено: ${result.imported}`)
      setShowDownloadModal(false)
      setDownloadForm({
        supplier_id: '',
        file: null,
        header_row: '7',
        start_row: '8',
      })
    } catch (err: any) {
      console.error('Ошибка загрузки и импорта:', err)
      
      if (err.response?.status === 401) {
        alert('Сессия истекла. Пожалуйста, войдите заново.')
        localStorage.removeItem('auth-storage')
        window.location.href = '/login'
        return
      }
      
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Ошибка загрузки и импорта прайс-листа'
      // Убираем неправильное сообщение о базе данных для ошибок аутентификации
      if (errorMessage.includes('База данных недоступна') && err.response?.status === 401) {
        alert('Сессия истекла. Пожалуйста, войдите заново.')
        localStorage.removeItem('auth-storage')
        window.location.href = '/login'
      } else {
        alert(`Ошибка: ${errorMessage}`)
      }
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

      {/* Последний загруженный прайс-лист */}
      {lastUpdate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Download className="h-5 w-5 mr-2 text-blue-600" />
            Последний загруженный прайс-лист
          </h2>
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Поставщик:</span> {lastUpdate.supplier.name}
            </p>
            {lastUpdate.last_update && (
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Дата загрузки:</span>{' '}
                {new Date(lastUpdate.last_update).toLocaleString('ru-RU')}
              </p>
            )}
            <p className="text-sm text-gray-700">
              <span className="font-semibold">URL:</span> {lastUpdate.download_url}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Импортировано:</span> {lastUpdate.last_imported_count} товаров
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Обновлено:</span> {lastUpdate.last_updated_count} товаров
            </p>
            {lastUpdate.frequency && (
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Частота обновления:</span> {
                  lastUpdate.frequency === 'daily' ? 'Ежедневно' :
                  lastUpdate.frequency === 'weekly' ? 'Еженедельно' :
                  lastUpdate.frequency === 'monthly' ? 'Ежемесячно' :
                  'Вручную'
                }
              </p>
            )}
          </div>
        </div>
      )}

      {/* Прайс-листы всех поставщиков - табличный формат */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Прайс-листы всех поставщиков</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Наименование</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Телефон</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Кол-во товаров</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Последний прайс-лист</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {priceListsInfo.length > 0 ? (
                priceListsInfo.map((info) => (
                  <tr
                    key={info.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedSupplier(info)
                      setShowSupplierModal(true)
                      fetchSupplierStats(info.id)
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{info.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{info.contact_email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{info.contact_phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {info.product_count} ({info.active_product_count} активных)
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {info.last_price_list_update ? (
                          <div>
                            <div className="font-medium text-gray-900">
                              {info.last_price_list_update.file_name || 'Прайс-лист'}
                            </div>
                            {info.last_price_list_update.last_update && (
                              <div className="text-xs text-gray-500">
                                {new Date(info.last_price_list_update.last_update).toLocaleDateString('ru-RU')}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Не загружался</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          info.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {info.is_active ? 'Активен' : 'Неактивен'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedSupplier(info)
                          setShowSupplierModal(true)
                          fetchSupplierStats(info.id)
                        }}
                        className="text-primary-600 hover:text-primary-900 flex items-center gap-1"
                      >
                        <Edit className="h-4 w-4" />
                        Редактировать
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Нет информации о прайс-листах
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
      {/* Модальное окно со статистикой поставщика */}
      {showSupplierModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">Статистика поставщика: {selectedSupplier.name}</h2>
              <button
                onClick={() => {
                  setShowSupplierModal(false)
                  setSelectedSupplier(null)
                  setSupplierStats(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              {loadingStats ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                </div>
              ) : supplierStats ? (
                <div className="space-y-6">
                  {/* Основная информация */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedSupplier.contact_email || '-'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Телефон</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedSupplier.contact_phone || '-'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Товаров в базе</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedSupplier.product_count} ({selectedSupplier.active_product_count} активных)
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Статус</p>
                      <p className="text-lg font-semibold">
                        <span className={selectedSupplier.is_active ? 'text-green-600' : 'text-red-600'}>
                          {selectedSupplier.is_active ? 'Активен' : 'Неактивен'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Статистика по продажам */}
                  {supplierStats.sales_stats && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Статистика по продажам</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Всего заказов</p>
                          <p className="text-2xl font-bold text-gray-900">{supplierStats.sales_stats.total_orders || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Общая сумма</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {supplierStats.sales_stats.total_revenue ? 
                              new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'KGS', minimumFractionDigits: 0 }).format(supplierStats.sales_stats.total_revenue) : 
                              '0 сом'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Проданных товаров</p>
                          <p className="text-2xl font-bold text-gray-900">{supplierStats.sales_stats.total_items_sold || 0}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* История загрузки прайс-листов */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">История загрузки прайс-листов</h3>
                    {selectedSupplier.price_list_updates.length > 0 ? (
                      <div className="space-y-2">
                        {selectedSupplier.price_list_updates.map((update, idx) => (
                          <div
                            key={update.id || idx}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {update.file_name || update.download_url || 'Прайс-лист'}
                              </p>
                              {update.last_update && (
                                <p className="text-xs text-gray-500">
                                  {new Date(update.last_update).toLocaleString('ru-RU')}
                                </p>
                              )}
                              <div className="flex gap-4 mt-1 text-xs text-gray-600">
                                {update.last_imported_count > 0 && (
                                  <span>Импортировано: {update.last_imported_count}</span>
                                )}
                                {update.last_updated_count > 0 && (
                                  <span>Обновлено: {update.last_updated_count}</span>
                                )}
                              </div>
                            </div>
                            {update.file_path && (
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  try {
                                    await adminApi.downloadPriceListFile(update.id || null, update.file_path || undefined)
                                  } catch (err: any) {
                                    alert('Ошибка скачивания файла: ' + (err.response?.data?.detail || err.message))
                                  }
                                }}
                                className="ml-3 px-3 py-1.5 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 flex items-center gap-1"
                              >
                                <FileDown className="h-4 w-4" />
                                Скачать
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Прайс-листы еще не загружались</p>
                    )}
                  </div>

                  {/* Топ товаров */}
                  {supplierStats.top_products && supplierStats.top_products.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Топ продаваемых товаров</h3>
                      <div className="space-y-2">
                        {supplierStats.top_products.map((product: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{product.name}</p>
                              <p className="text-xs text-gray-500">Продано: {product.quantity_sold} шт.</p>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">
                              {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'KGS', minimumFractionDigits: 0 }).format(product.total_revenue || 0)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Загрузка статистики...</p>
              )}
            </div>
          </div>
        </div>
      )}

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

