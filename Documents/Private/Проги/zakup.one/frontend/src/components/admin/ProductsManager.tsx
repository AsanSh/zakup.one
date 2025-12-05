import { useState, useEffect } from 'react'
import apiClient from '../../api/client'

interface Product {
  id: number
  name: string
  article: string
  supplier: { id: number; name: string } | null
  unit: string
  category: { id: number; name: string } | null
  origin: string
  is_active: boolean
  is_recommended: boolean
  is_promotional: boolean
  base_price: number
  markup_percent: number
  final_price: number
}

interface Supplier {
  id: number
  name: string
}

export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    loadProducts()
    loadSuppliers()
  }, [])

  const loadProducts = async (page = 1) => {
    setLoading(true)
    try {
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''
      const orderingParam = sortOrder === 'asc' ? '&ordering=name' : '&ordering=-name'
      const url = `/api/catalog/products-admin/?page=${page}${searchParam}${orderingParam}`
      const res = await apiClient.get(url)
      // Обрабатываем пагинацию
      const productsData = res.data.results || res.data || []
      
      // Дополнительная сортировка на клиенте для гарантии
      const sorted = [...productsData].sort((a, b) => {
        const nameA = a.name.toLowerCase()
        const nameB = b.name.toLowerCase()
        return sortOrder === 'asc' 
          ? nameA.localeCompare(nameB, 'ru')
          : nameB.localeCompare(nameA, 'ru')
      })
      
      if (page === 1) {
        setProducts(sorted)
      } else {
        setProducts(prev => {
          const combined = [...prev, ...sorted]
          return combined.sort((a, b) => {
            const nameA = a.name.toLowerCase()
            const nameB = b.name.toLowerCase()
            return sortOrder === 'asc' 
              ? nameA.localeCompare(nameB, 'ru')
              : nameB.localeCompare(nameA, 'ru')
          })
        })
      }
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Задержка для поиска при вводе
    const timer = setTimeout(() => {
      loadProducts()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, sortOrder])

  const loadSuppliers = async () => {
    try {
      const res = await apiClient.get('/admin/suppliers/')
      setSuppliers(res.data.results || res.data || [])
    } catch (error) {
      console.error('Ошибка загрузки поставщиков:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return
    
    try {
      await apiClient.delete(`/api/catalog/products-admin/${id}/`)
      loadProducts()
    } catch (error) {
      alert('Ошибка при удалении товара')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      article: formData.get('article'),
      supplier_id: formData.get('supplier_id') ? parseInt(formData.get('supplier_id') as string) : null,
      unit: formData.get('unit'),
      origin: formData.get('origin'),
      is_active: formData.get('is_active') === 'on',
      is_recommended: formData.get('is_recommended') === 'on',
      is_promotional: formData.get('is_promotional') === 'on',
      base_price: parseFloat(formData.get('base_price') as string),
      markup_percent: parseFloat(formData.get('markup_percent') as string),
    }

    try {
      if (editingProduct) {
        await apiClient.patch(`/api/catalog/products-admin/${editingProduct.id}/`, data)
      } else {
        await apiClient.post('/catalog/products-admin/', data)
      }
      setShowModal(false)
      setEditingProduct(null)
      loadProducts()
    } catch (error: any) {
      alert(error?.response?.data?.error || 'Ошибка при сохранении товара')
    }
  }

  if (loading) {
    return <div className="text-center py-12">Загрузка...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h3 className="text-xl font-semibold text-gray-900">Товары</h3>
        <div className="flex items-center gap-3 flex-1 min-w-[200px] max-w-md">
          <input
            type="text"
            placeholder="Поиск товаров..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"
              title={sortOrder === 'asc' ? 'По убыванию' : 'По возрастанию'}
            >
              <span>А-Я</span>
              {sortOrder === 'asc' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
            <button
              onClick={() => {
                setEditingProduct(null)
                setShowModal(true)
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium whitespace-nowrap"
            >
              + Добавить товар
            </button>
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Товары не найдены</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm">
          <table className="w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '20%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '18%' }} />
            </colgroup>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Артикул</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Поставщик</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Базовая цена</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Наценка %</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Продажная цена</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Метки</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-2 py-2 text-xs text-gray-900 truncate" title={product.name}>{product.name}</td>
                  <td className="px-2 py-2 text-xs text-gray-600 truncate">{product.article}</td>
                  <td className="px-2 py-2 text-xs text-gray-600 truncate">{product.supplier?.name || '-'}</td>
                  <td className="px-2 py-2 text-xs text-gray-900 whitespace-nowrap">{Number(product.base_price).toLocaleString('ru-RU')} сом</td>
                  <td className="px-2 py-2 text-xs text-gray-600 whitespace-nowrap">{Number(product.markup_percent).toFixed(2)}%</td>
                  <td className="px-2 py-2 text-xs font-semibold text-indigo-600 whitespace-nowrap">
                    {Number(product.final_price).toLocaleString('ru-RU')} сом
                  </td>
                  <td className="px-2 py-2 text-xs">
                    <div className="flex flex-wrap gap-0.5">
                      {product.is_recommended && (
                        <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800 whitespace-nowrap">
                          Рек.
                        </span>
                      )}
                      {product.is_promotional && (
                        <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800 whitespace-nowrap">
                          Акц.
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-2 text-xs">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => {
                          setEditingProduct(product)
                          setShowModal(true)
                        }}
                        className="text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
                        title="Редактировать"
                      >
                        Редакт.
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
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

      {/* Модальное окно */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h4 className="text-base sm:text-lg font-semibold mb-4">
              {editingProduct ? 'Редактировать товар' : 'Добавить товар'}
            </h4>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={editingProduct?.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Артикул *</label>
                  <input
                    type="text"
                    name="article"
                    required
                    defaultValue={editingProduct?.article}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Поставщик</label>
                  <select
                    name="supplier_id"
                    defaultValue={editingProduct?.supplier?.id?.toString() || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Не выбран</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Единица измерения</label>
                  <input
                    type="text"
                    name="unit"
                    defaultValue={editingProduct?.unit || 'шт'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Происхождение</label>
                  <select
                    name="origin"
                    defaultValue={editingProduct?.origin || 'РФ'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="РФ">РФ</option>
                    <option value="Китай">Китай</option>
                    <option value="КР">КР</option>
                    <option value="РК">РК</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Базовая цена *</label>
                  <input
                    type="number"
                    name="base_price"
                    step="0.01"
                    required
                    defaultValue={editingProduct?.base_price || 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Наценка (%) *</label>
                  <input
                    type="number"
                    name="markup_percent"
                    step="0.01"
                    required
                    defaultValue={editingProduct?.markup_percent || 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="col-span-2">
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_active"
                        defaultChecked={editingProduct?.is_active ?? true}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Активен</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_recommended"
                        defaultChecked={editingProduct?.is_recommended ?? false}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Рекомендуемый</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_promotional"
                        defaultChecked={editingProduct?.is_promotional ?? false}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Акционный</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingProduct(null)
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
    </div>
  )
}

