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
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  // Состояние для анимации добавления товара
  const [animatingProduct, setAnimatingProduct] = useState<number | null>(null)

  useEffect(() => {
    loadProducts(1, true)
  }, [])

  // Infinite scroll
  useEffect(() => {
    if (searchQuery.trim()) return // Не загружаем при поиске
    
    const handleScroll = () => {
      if (loadingMore || !hasMore) return
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      
      // Загружаем следующую страницу, когда пользователь прокрутил на 80% страницы
      if (scrollTop + windowHeight >= documentHeight * 0.8) {
        loadMoreProducts()
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingMore, hasMore, searchQuery, currentPage])

  const loadProducts = async (page = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true)
        setProducts([])
        setCurrentPage(1)
        setHasMore(true)
      }
      
      const response = await apiClient.get(`/catalog/products/?page=${page}`)
      const productsData = response.data.results || response.data || []
      const nextPage = response.data.next
      
      // Сохраняем общее количество товаров
      if (response.data.count !== undefined) {
        setTotalCount(response.data.count)
      }
      
      // Сортируем товары по алфавиту
      const sortedProducts = [...productsData].sort((a, b) => {
        const nameA = a.name.toLowerCase()
        const nameB = b.name.toLowerCase()
        return sortOrder === 'asc' 
          ? nameA.localeCompare(nameB, 'ru')
          : nameB.localeCompare(nameA, 'ru')
      })
      
      if (reset) {
        setProducts(sortedProducts)
      } else {
        setProducts(prev => {
          const combined = [...prev, ...sortedProducts]
          // Сортируем все товары после добавления
          return combined.sort((a, b) => {
            const nameA = a.name.toLowerCase()
            const nameB = b.name.toLowerCase()
            return sortOrder === 'asc' 
              ? nameA.localeCompare(nameB, 'ru')
              : nameB.localeCompare(nameA, 'ru')
          })
        })
      }
      
      setHasMore(!!nextPage)
      setCurrentPage(page)
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }
  
  // Перезагружаем товары при изменении сортировки
  useEffect(() => {
    if (products.length > 0) {
      const sorted = [...products].sort((a, b) => {
        const nameA = a.name.toLowerCase()
        const nameB = b.name.toLowerCase()
        return sortOrder === 'asc' 
          ? nameA.localeCompare(nameB, 'ru')
          : nameB.localeCompare(nameA, 'ru')
      })
      setProducts(sorted)
    }
  }, [sortOrder])

  const loadMoreProducts = async () => {
    if (loadingMore || !hasMore) return
    
    setLoadingMore(true)
    const nextPage = currentPage + 1
    await loadProducts(nextPage, false)
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      try {
        setLoading(true)
        const response = await apiClient.get(`/catalog/search/?q=${encodeURIComponent(query)}`)
        setProducts(response.data.results || [])
        setHasMore(false) // При поиске не загружаем больше
      } catch (error) {
        console.error('Ошибка поиска:', error)
      } finally {
        setLoading(false)
      }
    } else {
      loadProducts(1, true)
    }
  }

  const handleAddToCart = (product: Product) => {
    // Добавляем товар в корзину сразу с количеством 1 (НЕ создаем заявку сразу!)
    const cartItem = {
      product_id: product.id,
      name: product.name,
      unit: product.unit,
      quantity: 1,
      price: Number(product.final_price),
    }
    
    addItem(cartItem)
    console.log('Товар добавлен в корзину:', cartItem)
    
    // Запускаем анимацию
    setAnimatingProduct(product.id)
    setTimeout(() => {
      setAnimatingProduct(null)
    }, 1000)
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
            {/* Products Count and Sort */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-lg font-bold text-gray-900">
                Товары ({totalCount > 0 ? totalCount : products.length})
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Сортировка:</span>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"
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
              </div>
            </div>

            {/* Products by Category */}
            {groupedProducts.map((group, idx) => (
              <div key={idx} className="mb-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  {group.category} ({group.products.length} товаров)
                </h3>
                <div className="bg-white rounded-lg overflow-hidden border border-gray-200 overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed', width: '100%' }}>
                      <colgroup>
                        <col className="w-[35%] sm:w-[40%]" />
                        <col className="w-[10%] sm:w-[12%]" />
                        <col className="w-[15%] sm:w-[18%]" />
                        <col className="w-[20%] sm:w-[20%]" />
                        <col className="w-[20%] sm:w-[10%]" />
                      </colgroup>
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 sm:px-3 py-1 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Название
                        </th>
                        <th className="px-1 sm:px-2 py-1 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Единица
                        </th>
                        <th className="px-1 sm:px-2 py-1 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Происхождение
                        </th>
                        <th className="px-1 sm:px-2 py-1 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Цена
                        </th>
                        <th className="px-1 sm:px-2 py-1 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Действие
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {group.products.map((product) => {
                        const displayUnit = unitMap[product.unit] || product.unit.toLowerCase()
                        
                        return (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-2 sm:px-3 py-1 text-[11px] sm:text-sm font-medium text-gray-900 truncate" title={product.name}>
                              {product.name}
                            </td>
                            <td className="px-1 sm:px-2 py-1 text-[11px] sm:text-sm text-gray-500 whitespace-nowrap">
                              {displayUnit}
                            </td>
                            <td className="px-1 sm:px-2 py-1 text-[11px] sm:text-sm text-gray-500 whitespace-nowrap">
                              {product.origin || 'РФ'}
                            </td>
                            <td className="px-1 sm:px-2 py-1 text-[11px] sm:text-sm font-medium text-gray-900 whitespace-nowrap">
                              {Number(product.final_price).toLocaleString('ru-RU')} сом
                            </td>
                            <td className="px-1 sm:px-2 py-1 text-center">
                              <button
                                onClick={() => handleAddToCart(product)}
                                className={`inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all ${
                                  animatingProduct === product.id ? 'animate-pulse scale-110' : ''
                                }`}
                                title="Добавить в корзину"
                              >
                                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  </div>
                </div>
              </div>
            ))}

            {products.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-gray-500">Товары не найдены</div>
              </div>
            )}
            
            {/* Индикатор загрузки при скролле */}
            {loadingMore && (
              <div className="text-center py-4">
                <div className="text-gray-500 text-sm">Загрузка товаров...</div>
              </div>
            )}
            
            {/* Сообщение, если больше нет товаров */}
            {!hasMore && products.length > 0 && !searchQuery && (
              <div className="text-center py-4">
                <div className="text-gray-500 text-sm">Все товары загружены</div>
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

