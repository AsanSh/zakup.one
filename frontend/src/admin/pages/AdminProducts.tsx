import { useEffect, useState } from 'react'
import { adminApi } from '../../shared/api'
import type { Product } from '../../shared/types'
import { formatPrice, formatProductCount } from '../../shared/utils/formatters'
import { Loader2, Edit, Save, X, Search } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useDebounce } from '../../shared/hooks/useDebounce'

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])  // Все товары без фильтрации
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingMarkupId, setEditingMarkupId] = useState<number | null>(null)  // ID товара, у которого редактируется надбавка
  const [editForm, setEditForm] = useState<Partial<Product>>({})
  const [markupValue, setMarkupValue] = useState<string>('')  // Значение надбавки при редактировании
  const { token, init } = useAuthStore()
  
  // Debounce поискового запроса
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Убеждаемся, что токен инициализирован
  useEffect(() => {
    if (!token) {
      console.log('Токен не найден, инициализируем...')
      init()
    }
  }, [token, init])

  useEffect(() => {
    if (token) {
      fetchProducts()
    } else {
      console.warn('Токен отсутствует, ожидаем инициализации...')
      // Попробуем еще раз через небольшую задержку
      const timer = setTimeout(() => {
        if (useAuthStore.getState().token) {
          fetchProducts()
        } else {
          setLoading(false)
          alert('Требуется вход в систему')
        }
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [token])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      console.log('Начинаем загрузку товаров...')
      // Загружаем все товары (лимит 10000)
      const data = await adminApi.getProducts(0, 10000)
      console.log('Загружено товаров:', data.length)
      if (data.length > 0) {
        console.log('Первые товары:', data.slice(0, 3).map(p => p.name))
      }
      setAllProducts(data)
      setProducts(data)
    } catch (err: any) {
      console.error('Ошибка загрузки товаров:', err)
      console.error('Статус ответа:', err.response?.status)
      console.error('Детали ошибки:', err.response?.data)
      
      // Ошибка 401 обрабатывается в axios interceptor, не показываем alert
      if (err.response?.status === 401) {
        // axios interceptor уже перенаправит на логин
        return
      } else {
        const errorMessage = err.response?.data?.detail || err.message || 'Неизвестная ошибка'
        // Убираем технические детали из сообщения для пользователя
        let userMessage = errorMessage
        if (errorMessage.includes('401') || errorMessage.includes('учетные данные')) {
          userMessage = 'Сессия истекла. Пожалуйста, войдите заново.'
          localStorage.removeItem('auth-storage')
          window.location.href = '/login'
          return
        }
        console.error('Полная ошибка:', errorMessage)
        alert('Ошибка загрузки товаров: ' + userMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingId(product.id)
    setEditForm({
      price: product.price,
      is_active: product.is_active,
      category: product.category,
      country: product.country,
    })
  }

  const handleEditMarkup = (product: Product) => {
    setEditingMarkupId(product.id)
    setMarkupValue((product.markup || 0).toString())
  }

  const handleSaveMarkup = async (productId: number) => {
    try {
      const markup = parseFloat(markupValue) || 0
      await adminApi.updateProduct(productId, { markup })
      setEditingMarkupId(null)
      setMarkupValue('')
      fetchProducts()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка обновления надбавки')
    }
  }

  const handleSave = async (productId: number) => {
    try {
      await adminApi.updateProduct(productId, editForm)
      setEditingId(null)
      setEditForm({})
      fetchProducts()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка обновления товара')
    }
  }

  // Фильтрация товаров по поисковому запросу
  useEffect(() => {
    if (!debouncedSearchQuery.trim()) {
      setProducts(allProducts)
      return
    }

    const query = debouncedSearchQuery.toLowerCase()
    const filtered = allProducts.filter(product => 
      product.name.toLowerCase().includes(query) ||
      (product.category && product.category.toLowerCase().includes(query)) ||
      (product.supplier_name && product.supplier_name.toLowerCase().includes(query))
    )
    setProducts(filtered)
  }, [debouncedSearchQuery, allProducts])


  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  // Группировка товаров по категориям
  const groupedProducts = products.reduce((acc, product) => {
    const category = product.category || 'Разное'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(product)
    return acc
  }, {} as Record<string, Product[]>)

  const categories = Object.keys(groupedProducts).sort()

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Товары</h1>
            <p className="text-sm text-gray-600 mt-2">
              Всего товаров: <span className="font-semibold text-gray-900">
                {searchQuery ? `${products.length} из ${allProducts.length}` : products.length}
              </span>
            </p>
          </div>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск товаров..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              {loading && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Компактное отображение как у клиентов, но с колонкой Поставщик */}
      <div className="space-y-8">
        {categories.map((category) => (
          <div key={category} className="bg-white shadow rounded-lg overflow-hidden">
            {/* Заголовок категории */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {category} ({groupedProducts[category].length} {formatProductCount(groupedProducts[category].length)})
              </h3>
            </div>
            
            {/* Заголовки колонок */}
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center gap-3 text-xs font-semibold text-gray-700">
              <div className="flex-1 min-w-0">Название</div>
              <div className="whitespace-nowrap" style={{ minWidth: '60px' }}>Кол-во</div>
              <div className="whitespace-nowrap truncate" style={{ minWidth: '100px', maxWidth: '150px' }}>Производитель</div>
              <div className="whitespace-nowrap truncate" style={{ minWidth: '120px', maxWidth: '180px' }}>Поставщик</div>
              <div className="whitespace-nowrap text-right" style={{ minWidth: '100px' }}>Закуп.цена</div>
              <div className="whitespace-nowrap text-right" style={{ minWidth: '100px' }}>Надбавка</div>
              <div className="whitespace-nowrap text-right" style={{ minWidth: '100px' }}>Прод.цена</div>
              <div className="flex justify-end" style={{ minWidth: '36px' }}></div>
            </div>
            
            {/* Список товаров - компактный формат */}
            <div className="divide-y divide-gray-200">
              {groupedProducts[category].map((product) => (
                <div
                  key={product.id}
                  className="px-4 py-1.5 hover:bg-gray-50 transition-colors flex items-center gap-3 text-sm"
                  style={{ minHeight: '32px' }}
                >
                  {/* Название */}
                  <div className="flex-1 min-w-0 truncate">
                    <span className="text-gray-900">{product.name}</span>
                  </div>
                  
                  {/* Единица измерения (Кол-во) */}
                  <div className="text-gray-600 whitespace-nowrap" style={{ minWidth: '60px' }}>
                    {product.unit || 'шт'}
                  </div>
                  
                  {/* Страна производства (Производитель) */}
                  <div className="text-gray-500 whitespace-nowrap truncate" style={{ minWidth: '100px', maxWidth: '150px' }}>
                    {product.country || '-'}
                  </div>
                  
                  {/* Поставщик */}
                  <div className="text-gray-600 whitespace-nowrap truncate" style={{ minWidth: '120px', maxWidth: '180px' }}>
                    {product.supplier_name || '-'}
                  </div>
                  
                  {/* Закупочная цена */}
                  <div className="text-gray-700 whitespace-nowrap text-right" style={{ minWidth: '100px' }}>
                    {formatPrice(product.purchase_price || product.price)}
                  </div>
                  
                  {/* Надбавка (редактируемая) */}
                  <div className="text-gray-900 whitespace-nowrap text-right" style={{ minWidth: '100px' }}>
                    {editingMarkupId === product.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={markupValue}
                          onChange={(e) => setMarkupValue(e.target.value)}
                          className="w-16 px-1.5 py-0.5 border border-gray-300 rounded text-xs"
                          step="0.01"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveMarkup(product.id)
                            } else if (e.key === 'Escape') {
                              setEditingMarkupId(null)
                              setMarkupValue('')
                            }
                          }}
                        />
                        <button
                          onClick={() => handleSaveMarkup(product.id)}
                          className="p-0.5 bg-green-100 text-green-700 rounded hover:bg-green-200"
                          title="Сохранить"
                        >
                          <Save className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingMarkupId(null)
                            setMarkupValue('')
                          }}
                          className="p-0.5 bg-red-100 text-red-700 rounded hover:bg-red-200"
                          title="Отмена"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <span 
                        className="cursor-pointer hover:text-primary-600 hover:underline"
                        onClick={() => handleEditMarkup(product)}
                        title="Нажмите для редактирования надбавки"
                      >
                        {formatPrice(product.markup || 0)}
                      </span>
                    )}
                  </div>
                  
                  {/* Продажная цена */}
                  <div className="text-gray-900 whitespace-nowrap text-right font-semibold" style={{ minWidth: '100px' }}>
                    {formatPrice(product.price)}
                  </div>
                  
                  {/* Кнопка редактирования */}
                  <div className="flex justify-end" style={{ minWidth: '36px' }}>
                    {editingId === product.id ? (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleSave(product.id)}
                          className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200"
                          title="Сохранить"
                        >
                          <Save className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null)
                            setEditForm({})
                          }}
                          className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200"
                          title="Отмена"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-1.5 bg-primary-600 text-white rounded hover:bg-primary-700"
                        title="Редактировать"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Модальное окно для редактирования */}
      {editingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Редактирование товара</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Цена (сом)</label>
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
                <input
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Страна производства</label>
                <input
                  type="text"
                  value={editForm.country}
                  onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="КР, РК, РФ, Китай..."
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.is_active}
                    onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                    className="rounded mr-2"
                  />
                  <span className="text-sm text-gray-700">Товар активен</span>
                </label>
              </div>
              <div className="flex space-x-2 pt-4">
                <button
                  onClick={() => {
                    if (editingId) handleSave(editingId)
                  }}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Сохранить
                </button>
                <button
                  onClick={() => {
                    setEditingId(null)
                    setEditForm({})
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

