import { useEffect, useState } from 'react'
import { adminApi } from '../../shared/api'
import type { Product } from '../../shared/types'
import { formatPrice, formatProductCount } from '../../shared/utils/formatters'
import { Loader2, Edit, Save, X } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Partial<Product>>({})
  const { token, init } = useAuthStore()

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
      const data = await adminApi.getProducts(0, 200)
      console.log('Загружено товаров:', data.length)
      if (data.length > 0) {
        console.log('Первые товары:', data.slice(0, 3).map(p => p.name))
      }
      setProducts(data)
    } catch (err: any) {
      console.error('Ошибка загрузки товаров:', err)
      console.error('Статус ответа:', err.response?.status)
      console.error('Детали ошибки:', err.response?.data)
      
      if (err.response?.status === 401) {
        alert('Сессия истекла. Пожалуйста, войдите заново.')
        // Очищаем localStorage и перенаправляем на логин
        localStorage.removeItem('auth-storage')
        window.location.href = '/login'
      } else {
        const errorMessage = err.response?.data?.detail || err.message || 'Неизвестная ошибка'
        console.error('Полная ошибка:', errorMessage)
        alert('Ошибка загрузки товаров: ' + errorMessage)
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Товары</h1>

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
                  
                  {/* Единица измерения */}
                  <div className="text-gray-600 whitespace-nowrap" style={{ minWidth: '50px' }}>
                    {product.unit || 'шт'}
                  </div>
                  
                  {/* Страна производства */}
                  <div className="text-gray-500 whitespace-nowrap truncate" style={{ minWidth: '100px', maxWidth: '150px' }}>
                    {product.country || '-'}
                  </div>
                  
                  {/* Поставщик (только для админа) */}
                  <div className="text-gray-600 whitespace-nowrap truncate" style={{ minWidth: '120px', maxWidth: '180px' }}>
                    {product.supplier_name || '-'}
                  </div>
                  
                  {/* Стоимость */}
                  <div className="text-gray-900 whitespace-nowrap text-right" style={{ minWidth: '90px' }}>
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

