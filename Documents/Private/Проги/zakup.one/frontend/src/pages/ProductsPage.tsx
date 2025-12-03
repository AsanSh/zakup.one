import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import { useCartStore } from '../store/cartStore'
import apiClient from '../api/client'
import ClientHeader from '../components/ClientHeader'
import CartSummary from '../components/CartSummary'

interface Product {
  id: number
  name: string
  article: string
  unit: string
  origin?: string
  final_price: number
  category?: {
    id: number
    name: string
  } | null
}

interface CategoryGroup {
  category: string | null
  products: Product[]
}

// Конвертируем единицы измерения в маленькие буквы
const unitMap: Record<string, string> = {
  'M': 'м',
  'КГ': 'кг',
  'Шт': 'шт',
  'ШТ': 'шт',
  'м': 'м',
  'кг': 'кг',
  'шт': 'шт',
}

export default function ProductsPage() {
  const navigate = useNavigate()
  const { addItem } = useCartStore()
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  // Состояние для активных полей ввода количества (productId -> quantity)
  const [activeInputs, setActiveInputs] = useState<Record<number, number>>({})
  // Состояние для анимации добавления товара
  const [animatingProduct, setAnimatingProduct] = useState<number | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await apiClient.get('/api/catalog/products/')
      setProducts(response.data.results || response.data || [])
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      try {
        const response = await apiClient.get(`/api/catalog/search/?q=${encodeURIComponent(query)}`)
        setProducts(response.data.results || [])
      } catch (error) {
        console.error('Ошибка поиска:', error)
      }
    } else {
      loadProducts()
    }
  }

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    // Добавляем товар в корзину
    addItem({
      product_id: product.id,
      name: product.name,
      unit: product.unit,
      quantity: quantity,
      price: Number(product.final_price),
    })
    
    // Запускаем анимацию
    setAnimatingProduct(product.id)
    setTimeout(() => {
      setAnimatingProduct(null)
    }, 1000)
    
    // Закрываем поле ввода
    setActiveInputs(prev => {
      const newState = { ...prev }
      delete newState[product.id]
      return newState
    })
  }

  const handlePlusClick = (product: Product) => {
    // Активируем поле ввода для этого товара
    setActiveInputs(prev => ({
      ...prev,
      [product.id]: 1
    }))
  }

  const handleQuantityChange = (productId: number, delta: number) => {
    setActiveInputs(prev => {
      const current = prev[productId] || 1
      const newQuantity = Math.max(1, current + delta)
      return {
        ...prev,
        [productId]: newQuantity
      }
    })
  }

  const handleQuantityInputChange = (productId: number, value: string) => {
    const numValue = parseInt(value) || 1
    setActiveInputs(prev => ({
      ...prev,
      [productId]: Math.max(1, numValue)
    }))
  }

  // Группируем товары по категориям
  const groupedProducts: CategoryGroup[] = products.reduce((acc, product) => {
    const categoryName = product.category?.name || 'Без категории'
    const existingGroup = acc.find(g => g.category === categoryName)
    
    if (existingGroup) {
      existingGroup.products.push(product)
    } else {
      acc.push({ category: categoryName, products: [product] })
    }
    
    return acc
  }, [] as CategoryGroup[])

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientHeader activeTab="products" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24" style={{ paddingTop: '5rem' }}>
        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Начните вводить название товара...."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Загрузка товаров...</div>
          </div>
        ) : (
          <>
            {/* Products Count */}
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Товары ({products.length})
            </h2>

            {/* Products by Category */}
            {groupedProducts.map((group, idx) => (
              <div key={idx} className="mb-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  {group.category} ({group.products.length} товаров)
                </h3>
                <div className="bg-white rounded-lg overflow-hidden border border-gray-200 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed', width: '100%' }}>
                    <colgroup>
                      <col style={{ width: '35%' }} />
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '18%' }} />
                      <col style={{ width: '20%' }} />
                      <col style={{ width: '15%' }} />
                    </colgroup>
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Название
                        </th>
                        <th className="px-4 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Единица
                        </th>
                        <th className="px-4 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Происхождение
                        </th>
                        <th className="px-4 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Цена
                        </th>
                        <th className="px-4 py-1.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Действие
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {group.products.map((product) => {
                        const displayUnit = unitMap[product.unit] || product.unit.toLowerCase()
                        const isActive = activeInputs.hasOwnProperty(product.id)
                        const quantity = activeInputs[product.id] || 1
                        
                        return (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-4 py-1.5 text-sm font-medium text-gray-900 truncate">
                              {product.name}
                            </td>
                            <td className="px-4 py-1.5 text-sm text-gray-500">
                              {displayUnit}
                            </td>
                            <td className="px-4 py-1.5 text-sm text-gray-500">
                              {product.origin || 'РФ'}
                            </td>
                            <td className="px-4 py-1.5 text-sm font-medium text-gray-900">
                              {Number(product.final_price).toLocaleString('ru-RU')} сом
                            </td>
                            <td className="px-4 py-1.5 text-center">
                              {isActive ? (
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => handleQuantityChange(product.id, -1)}
                                    className="inline-flex items-center justify-center w-6 h-6 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none transition-colors"
                                    title="Уменьшить"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                                    </svg>
                                  </button>
                                  <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => handleQuantityInputChange(product.id, e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleAddToCart(product, quantity)
                                      }
                                    }}
                                    className="w-12 h-6 text-center text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleQuantityChange(product.id, 1)}
                                    className="inline-flex items-center justify-center w-6 h-6 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none transition-colors"
                                    title="Увеличить"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleAddToCart(product, quantity)}
                                    className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none transition-colors ml-1"
                                    title="Добавить"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handlePlusClick(product)}
                                  className={`inline-flex items-center justify-center w-7 h-7 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all ${
                                    animatingProduct === product.id ? 'animate-pulse scale-110' : ''
                                  }`}
                                  title="Добавить в корзину"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                  </svg>
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {products.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500">Товары не найдены</div>
              </div>
            )}
          </>
        )}
      </main>
      
      {/* Корзина снизу */}
      <CartSummary />
      
      {/* Анимация добавления товара */}
      {animatingProduct && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 animate-fade-in-out">
            <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium">Товар добавлен в корзину!</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes fade-in-out {
          0% { opacity: 0; transform: translate(-50%, -20px); }
          20% { opacity: 1; transform: translate(-50%, 0); }
          80% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -20px); }
        }
        .animate-fade-in-out {
          animation: fade-in-out 1s ease-in-out;
        }
      `}</style>
    </div>
  )
}

