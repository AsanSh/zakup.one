import { useState, useEffect } from 'react'
import apiClient from '../../api/client'

interface Supplier {
  id: number
  name: string
  internal_code: string
  contact_person: string
  phone: string
  email: string
  address: string
  website: string
  default_parsing_method: string
  parsing_config: any
  is_active: boolean
  price_lists_count: number
}

interface PriceList {
  id: number
  supplier: Supplier
  file: string
  parsing_method: string
  parsing_config: any
  uploaded_at: string
  processed_at: string | null
  status: string
  log: string
  products_count: number
}

export default function SuppliersManager() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [priceLists, setPriceLists] = useState<PriceList[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPriceListModal, setShowPriceListModal] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [priceListError, setPriceListError] = useState<string | null>(null)
  const [processingPriceLists, setProcessingPriceLists] = useState<Set<number>>(new Set())

  useEffect(() => {
    loadSuppliers()
  }, [])

  // Polling для обновления статуса обработки прайс-листов
  useEffect(() => {
    if (!selectedSupplier || processingPriceLists.size === 0) return

    const interval = setInterval(() => {
      loadPriceLists(selectedSupplier.id)
      
      // Проверяем, завершилась ли обработка всех прайс-листов
      const allProcessed = priceLists.every(pl => 
        pl.status !== 'PROCESSING' || !processingPriceLists.has(pl.id)
      )
      
      // Если все обработаны, очищаем список обрабатываемых
      if (allProcessed && processingPriceLists.size > 0) {
        setProcessingPriceLists(new Set())
      }
    }, 2000) // Обновляем каждые 2 секунды

    return () => clearInterval(interval)
  }, [selectedSupplier, processingPriceLists, priceLists])

  const loadSuppliers = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get('/api/admin/suppliers/')
      setSuppliers(res.data.results || res.data || [])
    } catch (error) {
      console.error('Ошибка загрузки поставщиков:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPriceLists = async (supplierId: number) => {
    try {
      const res = await apiClient.get(`/api/admin/pricelists/?supplier_id=${supplierId}`)
      const lists = res.data.results || res.data || []
      setPriceLists(lists)
      
      // Обновляем список обрабатываемых прайс-листов
      const processingIds = new Set<number>()
      lists.forEach((pl: PriceList) => {
        if (pl.status === 'PROCESSING') {
          processingIds.add(pl.id)
        }
      })
      setProcessingPriceLists(processingIds)
    } catch (error) {
      console.error('Ошибка загрузки прайс-листов:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этого поставщика?')) return
    
    try {
      await apiClient.delete(`/api/admin/suppliers/${id}/`)
      loadSuppliers()
    } catch (error) {
      alert('Ошибка при удалении поставщика')
    }
  }

  const handleSubmitSupplier = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    // Собираем данные, преобразуя пустые строки в null для необязательных полей
    const getValue = (value: FormDataEntryValue | null) => {
      const str = value?.toString().trim() || ''
      return str === '' ? null : str
    }

    const data: any = {
      name: formData.get('name')?.toString().trim(),
      internal_code: formData.get('internal_code')?.toString().trim(),
      contact_person: getValue(formData.get('contact_person')),
      phone: getValue(formData.get('phone')),
      email: getValue(formData.get('email')),
      address: getValue(formData.get('address')),
      website: getValue(formData.get('website')),
      default_parsing_method: formData.get('default_parsing_method') || 'EXCEL',
      is_active: formData.get('is_active') === 'on',
    }

    try {
      if (editingSupplier) {
        await apiClient.patch(`/api/admin/suppliers/${editingSupplier.id}/`, data)
      } else {
        await apiClient.post('/api/admin/suppliers/', data)
      }
      setShowAddModal(false)
      setEditingSupplier(null)
      loadSuppliers()
    } catch (error: any) {
      console.error('Ошибка сохранения поставщика:', error)
      
      // Формируем детальное сообщение об ошибке
      let errorMsg = 'Ошибка при сохранении поставщика'
      
      if (error?.response?.data) {
        const errorData = error.response.data
        
        // Если есть общее сообщение об ошибке
        if (errorData.error) {
          errorMsg = errorData.error
        }
        // Если есть ошибки валидации по полям
        else if (typeof errorData === 'object') {
          const fieldErrors: string[] = []
          Object.keys(errorData).forEach((key) => {
            const fieldError = errorData[key]
            if (Array.isArray(fieldError)) {
              fieldErrors.push(`${key}: ${fieldError.join(', ')}`)
            } else if (typeof fieldError === 'string') {
              fieldErrors.push(`${key}: ${fieldError}`)
            } else if (typeof fieldError === 'object') {
              fieldErrors.push(`${key}: ${JSON.stringify(fieldError)}`)
            }
          })
          if (fieldErrors.length > 0) {
            errorMsg = fieldErrors.join('\n')
          }
        }
        // Если есть detail
        else if (errorData.detail) {
          errorMsg = errorData.detail
        }
      }
      
      setErrorMessage(errorMsg)
    }
  }

  const handleUploadPriceList = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPriceListError(null)
    const formData = new FormData(e.currentTarget)
    const file = formData.get('file') as File
    
    if (!file || !selectedSupplier) {
      setPriceListError('Файл и поставщик обязательны')
      return
    }

    const uploadData = new FormData()
    uploadData.append('file', file)
    uploadData.append('supplier_id', selectedSupplier.id.toString())
    uploadData.append('parsing_method', formData.get('parsing_method') as string)

    try {
      const response = await apiClient.post('/api/admin/pricelists/upload/', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      // Добавляем в список обрабатываемых прайс-листов
      if (response.data && response.data.status === 'PROCESSING') {
        setProcessingPriceLists(prev => new Set(prev).add(response.data.id))
      }
      
      setPriceListError(null)
      loadPriceLists(selectedSupplier.id)
      loadSuppliers()
      
      // Закрываем модальное окно после успешной загрузки
      setShowPriceListModal(false)
      setSelectedSupplier(null)
    } catch (error: any) {
      console.error('Ошибка загрузки прайс-листа:', error)
      
      // Формируем детальное сообщение об ошибке
      let errorMsg = 'Ошибка при загрузке прайс-листа'
      
      if (error?.response?.data) {
        const errorData = error.response.data
        
        // Если есть общее сообщение об ошибке
        if (errorData.error) {
          errorMsg = errorData.error
        }
        // Если есть ошибки валидации по полям
        else if (typeof errorData === 'object') {
          const fieldErrors: string[] = []
          Object.keys(errorData).forEach((key) => {
            const fieldError = errorData[key]
            if (Array.isArray(fieldError)) {
              fieldErrors.push(`${key}: ${fieldError.join(', ')}`)
            } else if (typeof fieldError === 'string') {
              fieldErrors.push(`${key}: ${fieldError}`)
            } else if (typeof fieldError === 'object') {
              fieldErrors.push(`${key}: ${JSON.stringify(fieldError)}`)
            }
          })
          if (fieldErrors.length > 0) {
            errorMsg = fieldErrors.join('\n')
          }
        }
        // Если есть detail
        else if (errorData.detail) {
          errorMsg = errorData.detail
        }
        // Если метод не разрешен
        else if (error.response.status === 405) {
          errorMsg = 'Метод не разрешен. Пожалуйста, обновите страницу и попробуйте снова.'
        }
      } else if (error?.message) {
        errorMsg = error.message
      }
      
      setPriceListError(errorMsg)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Загрузка...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Поставщики</h3>
        <button
          onClick={() => {
            setEditingSupplier(null)
            setShowAddModal(true)
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
        >
          + Добавить поставщика
        </button>
      </div>

      {suppliers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Поставщики не найдены</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm">
          <table className="w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '20%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '26%' }} />
            </colgroup>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Код</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Контакты</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Прайс-листов</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-2 py-2 text-xs text-gray-900 truncate" title={supplier.name}>{supplier.name}</td>
                  <td className="px-2 py-2 text-xs text-gray-600 truncate">{supplier.internal_code}</td>
                  <td className="px-2 py-2 text-xs text-gray-600">
                    {supplier.phone && <div className="truncate" title={supplier.phone}>{supplier.phone}</div>}
                    {supplier.email && <div className="truncate text-xs" title={supplier.email}>{supplier.email}</div>}
                  </td>
                  <td className="px-2 py-2 text-xs text-gray-600 whitespace-nowrap">{supplier.price_lists_count || 0}</td>
                  <td className="px-2 py-2 text-xs">
                    <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${
                      supplier.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {supplier.is_active ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-xs">
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => {
                          setEditingSupplier(supplier)
                          setShowAddModal(true)
                        }}
                        className="text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
                        title="Редактировать"
                      >
                        Редакт.
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSupplier(supplier)
                          setShowPriceListModal(true)
                          loadPriceLists(supplier.id)
                        }}
                        className="text-blue-600 hover:text-blue-800 whitespace-nowrap"
                        title="Прайс-лист"
                      >
                        Прайс-лист
                      </button>
                      <button
                        onClick={() => handleDelete(supplier.id)}
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
      )}

      {/* Модальное окно добавления/редактирования поставщика */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h4 className="text-base sm:text-lg font-semibold mb-4">
              {editingSupplier ? 'Редактировать поставщика' : 'Добавить поставщика'}
            </h4>
            <form onSubmit={handleSubmitSupplier}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={editingSupplier?.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Внутренний код *</label>
                  <input
                    type="text"
                    name="internal_code"
                    required
                    defaultValue={editingSupplier?.internal_code}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Контактное лицо</label>
                  <input
                    type="text"
                    name="contact_person"
                    defaultValue={editingSupplier?.contact_person}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                  <input
                    type="text"
                    name="phone"
                    defaultValue={editingSupplier?.phone}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingSupplier?.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Веб-сайт</label>
                  <input
                    type="url"
                    name="website"
                    defaultValue={editingSupplier?.website}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
                  <textarea
                    name="address"
                    defaultValue={editingSupplier?.address}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Метод парсинга</label>
                  <select
                    name="default_parsing_method"
                    defaultValue={editingSupplier?.default_parsing_method || 'EXCEL'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="EXCEL">Excel парсинг</option>
                    <option value="CSV">CSV парсинг</option>
                    <option value="PDF">PDF парсинг</option>
                    <option value="WEB_SCRAPING">Веб-скрапинг</option>
                    <option value="API">API интеграция</option>
                    <option value="MANUAL">Ручной ввод</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    defaultChecked={editingSupplier?.is_active ?? true}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Активен</label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingSupplier(null)
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

      {/* Модальное окно загрузки прайс-листа */}
      {showPriceListModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">Прайс-листы: {selectedSupplier.name}</h4>
              <button
                onClick={() => {
                  setShowPriceListModal(false)
                  setSelectedSupplier(null)
                  setPriceListError(null)
                }}
                className="text-gray-400 hover:text-gray-600"
                title="Закрыть"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {priceListError && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-800 whitespace-pre-line">{priceListError}</div>
              </div>
            )}
            
            <form onSubmit={handleUploadPriceList} className="mb-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Файл прайс-листа *</label>
                <input
                  type="file"
                  name="file"
                  required
                  accept=".xlsx,.xls,.csv,.pdf"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Метод парсинга</label>
                <select
                  name="parsing_method"
                  defaultValue={selectedSupplier.default_parsing_method}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="EXCEL">Excel парсинг</option>
                  <option value="CSV">CSV парсинг</option>
                  <option value="PDF">PDF парсинг</option>
                  <option value="WEB_SCRAPING">Веб-скрапинг</option>
                  <option value="API">API интеграция</option>
                  <option value="MANUAL">Ручной ввод</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPriceListModal(false)
                    setSelectedSupplier(null)
                    setPriceListError(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Загрузить
                </button>
              </div>
            </form>

            {/* Список прайс-листов */}
            <div className="border-t pt-4">
              <h5 className="font-medium mb-2">Загруженные прайс-листы:</h5>
              {priceLists.length === 0 ? (
                <p className="text-sm text-gray-500">Прайс-листы не загружены</p>
              ) : (
                <div className="space-y-2">
                  {priceLists.map((pl) => {
                    const isProcessing = pl.status === 'PROCESSING'
                    const statusLabels: Record<string, string> = {
                      'NEW': 'Новый',
                      'PROCESSING': 'Обрабатывается',
                      'PROCESSED': 'Обработан',
                      'FAILED': 'Ошибка'
                    }
                    const statusColors: Record<string, string> = {
                      'NEW': 'bg-gray-100 text-gray-800',
                      'PROCESSING': 'bg-yellow-100 text-yellow-800',
                      'PROCESSED': 'bg-green-100 text-green-800',
                      'FAILED': 'bg-red-100 text-red-800'
                    }
                    
                    return (
                      <div key={pl.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="text-sm font-medium">{new Date(pl.uploaded_at).toLocaleDateString('ru-RU')}</div>
                            {isProcessing && (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className={`px-2 py-0.5 rounded-full font-medium ${statusColors[pl.status] || statusColors['NEW']}`}>
                              {statusLabels[pl.status] || pl.status}
                            </span>
                            <span className="text-gray-500">Товаров: {pl.products_count}</span>
                            {pl.processed_at && (
                              <span className="text-gray-400">
                                Обработан: {new Date(pl.processed_at).toLocaleString('ru-RU')}
                              </span>
                            )}
                          </div>
                          {pl.status === 'FAILED' && pl.log && (
                            <div className="mt-1 text-xs text-red-600">
                              Ошибка: {pl.log}
                            </div>
                          )}
                          {pl.status === 'PROCESSED' && pl.products_count > 0 && (
                            <div className="mt-2">
                              <button
                                onClick={() => {
                                  setShowPriceListModal(false)
                                  setSelectedSupplier(null)
                                  setPriceListError(null)
                                }}
                                className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                Закрыть окно
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          {pl.status === 'PROCESSED' && (
                            <button
                              onClick={async () => {
                                try {
                                  await apiClient.post(`/api/admin/pricelists/${pl.id}/process/`)
                                  setProcessingPriceLists(prev => new Set(prev).add(pl.id))
                                  loadPriceLists(selectedSupplier.id)
                                } catch (error) {
                                  alert('Ошибка при повторной обработке прайс-листа')
                                }
                              }}
                              className="text-sm text-blue-600 hover:text-blue-800"
                              title="Повторно обработать"
                            >
                              Повторить
                            </button>
                          )}
                          {pl.status === 'FAILED' && (
                            <button
                              onClick={async () => {
                                try {
                                  await apiClient.post(`/api/admin/pricelists/${pl.id}/process/`)
                                  setProcessingPriceLists(prev => new Set(prev).add(pl.id))
                                  loadPriceLists(selectedSupplier.id)
                                } catch (error) {
                                  alert('Ошибка при обработке прайс-листа')
                                }
                              }}
                              className="text-sm text-blue-600 hover:text-blue-800"
                              title="Попробовать снова"
                            >
                              Повторить
                            </button>
                          )}
                          <a
                            href={pl.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:text-indigo-800"
                          >
                            Скачать
                          </a>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно ошибки */}
      {errorMessage && (
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

