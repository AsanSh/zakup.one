import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import apiClient from '../api/client'
import Navbar from '../components/Navbar'
import CartSummary from '../components/CartSummary'
import Toast from '../components/Toast'

interface Product {
  id: number
  name: string
  article: string
  unit: string
  origin?: string
  price: number
  image_url?: string
  image?: string
  category?: {
    id: number
    name: string
  } | null
}

interface CategoryGroup {
  category: string
  products: Product[]
}

interface ToastState {
  message: string
  type: 'success' | 'error' | 'info'
}

type SortOption = 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc'

// Функция для парсинга названия товара на имя и метки
function parseProductName(name: string): { mainName: string; badges: string[] } {
  const badges: string[] = []
  let mainName = name

  // Ищем код (Код: 123 или просто число в начале/конце)
  const codeMatch = name.match(/(?:Код|код|КОД)[\s:]*(\d+)/i) || name.match(/\b(\d{3,})\b/)
  if (codeMatch) {
    badges.push(`Код: ${codeMatch[1]}`)
    mainName = mainName.replace(/(?:Код|код|КОД)[\s:]*\d+/i, '').replace(/\b\d{3,}\b/, '').trim()
  }

  // Ищем штрихкод (4607...)
  const barcodeMatch = name.match(/\(?(\d{13,})\)?/)
  if (barcodeMatch && barcodeMatch[1].length >= 13) {
    badges.push(`Штрихкод: ${barcodeMatch[1]}`)
    mainName = mainName.replace(/\(?\d{13,}\)?/, '').trim()
  }

  // Ищем параметры (мм, см, кг, л, упак, шт)
  const paramMatch = name.match(/(\d+)\s*(?:мм|см|кг|л|упак|шт|шт\/\d+шт)/i)
  if (paramMatch) {
    badges.push(`Параметры`)
    mainName = mainName.replace(/\d+\s*(?:мм|см|кг|л|упак|шт|шт\/\d+шт)/i, '').trim()
  }

  // Очищаем лишние пробелы и знаки препинания
  mainName = mainName.replace(/\s+/g, ' ').replace(/^[,\s\-]+|[,\s\-]+$/g, '').trim()

  return { mainName: mainName || name, badges }
}

export default function ProductsPage() {
  const [searchParams] = useSearchParams()
  const { addItem, getTotalItems } = useCartStore()
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [sortOption, setSortOption] = useState<SortOption>('name_asc')
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const sortDropdownRef = useRef<HTMLDivElement>(null)

  // Debounce для поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Закрытие dropdown при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Загрузка товаров
  const loadProducts = useCallback(async (page = 1, reset = false, query = '') => {
    try {
      if (reset) {
        setLoading(true)
        setError(null)
        setProducts([])
        setCurrentPage(1)
        setHasMore(true)
      }

      const url = query.trim()
        ? `/api/catalog/search/?q=${encodeURIComponent(query)}&page=${page}`
        : `/api/catalog/products/?page=${page}`

      setSearchLoading(query.trim().length > 0)
      const response = await apiClient.get(url)
      const productsData = response.data.results || response.data || []
      const nextPage = response.data.next

      if (response.data.count !== undefined) {
        setTotalCount(response.data.count)
      }

      // Сортировка
      const sortedProducts = sortProducts([...productsData], sortOption)

      if (reset) {
        setProducts(sortedProducts)
      } else {
        setProducts(prev => sortProducts([...prev, ...sortedProducts], sortOption))
      }

      setHasMore(!!nextPage)
      setCurrentPage(page)
    } catch (err: any) {
      console.error('Ошибка загрузки товаров:', err)
      setError(err.response?.data?.detail || 'Не удалось загрузить товары. Попробуйте обновить страницу.')
      setProducts([])
    } finally {
      setLoading(false)
      setLoadingMore(false)
      setSearchLoading(false)
    }
  }, [sortOption])

  // Функция сортировки
  const sortProducts = (items: Product[], option: SortOption): Product[] => {
    return [...items].sort((a, b) => {
      switch (option) {
        case 'name_asc':
          return a.name.toLowerCase().localeCompare(b.name.toLowerCase(), 'ru')
        case 'name_desc':
          return b.name.toLowerCase().localeCompare(a.name.toLowerCase(), 'ru')
        case 'price_asc':
          return Number(a.price) - Number(b.price)
        case 'price_desc':
          return Number(b.price) - Number(a.price)
        default:
          return 0
      }
    })
  }

  // Эффект для загрузки при изменении debouncedQuery
  useEffect(() => {
    if (debouncedQuery !== searchQuery) return

    if (debouncedQuery.trim()) {
      loadProducts(1, true, debouncedQuery)
    } else {
      loadProducts(1, true)
    }
  }, [debouncedQuery, loadProducts])

  // Эффект для сортировки существующих товаров
  useEffect(() => {
    if (products.length > 0) {
      setProducts(sortProducts([...products], sortOption))
    }
  }, [sortOption])

  // Эффект для начальной загрузки
  useEffect(() => {
    const searchParam = searchParams.get('search')
    if (searchParam) {
      setSearchQuery(searchParam)
      setDebouncedQuery(searchParam)
    } else {
      loadProducts(1, true)
    }
  }, [])

  // Infinite scroll
  useEffect(() => {
    if (searchQuery.trim() || loadingMore || !hasMore) return

    const handleScroll = () => {
      if (loadingMore || !hasMore) return

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      if (scrollTop + windowHeight >= documentHeight * 0.8) {
        loadMoreProducts()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loadingMore, hasMore, searchQuery, currentPage])

  const loadMoreProducts = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    const nextPage = currentPage + 1
    await loadProducts(nextPage, false, debouncedQuery)
  }

  const handleAddToCart = (product: Product) => {
    const cartItem = {
      product_id: product.id,
      name: product.name,
      unit: product.unit,
      quantity: 1,
      price: Number(product.price),
    }

    addItem(cartItem)
    const totalItems = getTotalItems()
    setToast({
      message: `Добавлено: ${product.name.substring(0, 30)}${product.name.length > 30 ? '...' : ''} • В корзине: ${totalItems} ${totalItems === 1 ? 'позиция' : totalItems < 5 ? 'позиции' : 'позиций'}`,
      type: 'success'
    })
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setDebouncedQuery('')
    loadProducts(1, true)
  }

  const handleRetry = () => {
    setError(null)
    loadProducts(1, true, debouncedQuery)
  }

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

  const sortLabels: Record<SortOption, string> = {
    name_asc: 'По названию (А-Я)',
    name_desc: 'По названию (Я-А)',
    price_asc: 'Цена ↑',
    price_desc: 'Цена ↓',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab="products" />
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pb-24 lg:pb-8 pt-20">
        {/* Search Bar - Sticky */}
        <div className="sticky top-20 z-20 bg-gray-50 py-3 mb-4 -mx-3 sm:-mx-4 lg:-mx-8 px-3 sm:px-4 lg:px-8 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Начните вводить название товара..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-20 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Очистить поиск"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            {searchLoading && (
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            Можно искать по названию, коду, артикулу, штрихкоду
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 mb-1">{error}</p>
                <button
                  onClick={handleRetry}
                  className="text-sm text-red-600 hover:text-red-800 underline"
                >
                  Повторить
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !error ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="animate-pulse">
                  <div className="h-12 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Header with controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
                {searchQuery.trim() ? 'Результаты поиска' : 'Товары'} ({totalCount > 0 ? totalCount : products.length})
              </h2>
              {/* Sort Dropdown */}
              <div className="relative" ref={sortDropdownRef}>
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 bg-white"
                >
                  <span>{sortLabels[sortOption]}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showSortDropdown && (
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                    <div className="py-1">
                      {(['name_asc', 'name_desc', 'price_asc', 'price_desc'] as SortOption[]).map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setSortOption(option)
                            setShowSortDropdown(false)
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                            sortOption === option ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                          }`}
                        >
                          {sortLabels[option]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Products Display */}
            {groupedProducts.length > 0 ? (
              groupedProducts.map((group, idx) => (
                <div key={idx} className="mb-5">
                  {/* Category Header */}
                  <h3 className="text-sm font-semibold text-blue-600 mb-3 px-2 py-1.5 bg-blue-50 rounded-md border-l-4 border-blue-600">
                    {group.category} ({group.products.length} товаров)
                  </h3>
                  
                  {/* Products Table - List View */}
                  <div className="bg-white rounded-lg border border-gray-200 -mx-4 sm:mx-0 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '600px' }}>
                      <colgroup>
                        <col className="w-[10%] sm:w-[8%]" />
                        <col className="w-[20%] sm:w-[20%]" />
                        <col className="w-[70%] sm:w-[72%]" />
                      </colgroup>
                      <thead className="bg-white border-b-2 border-gray-300">
                        <tr>
                          <th className="px-1 sm:px-2 py-1.5 text-center text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap bg-white">
                            Действие
                          </th>
                          <th className="px-1 sm:px-2 py-1.5 text-left text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap bg-white">
                            Цена
                          </th>
                          <th className="px-2 sm:px-3 py-1.5 text-left text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap bg-white">
                            Название
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                          {group.products.map((product, productIdx) => {
                            const isEven = productIdx % 2 === 0
                            const { mainName, badges } = parseProductName(product.name)

                            return (
                              <tr 
                                key={product.id} 
                                className={`${isEven ? 'bg-white' : 'bg-gray-100'} hover:bg-blue-50/50 transition-colors cursor-pointer`}
                              >
                                <td className="px-1 sm:px-2 py-1.5 text-center">
                                  <button
                                    onClick={() => handleAddToCart(product)}
                                    className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all shadow-sm"
                                    title="Добавить в корзину"
                                  >
                                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                    </svg>
                                  </button>
                                </td>
                                <td className="px-1 sm:px-2 py-1.5 text-[12px] sm:text-sm font-semibold text-gray-900 whitespace-nowrap tabular-nums">
                                  {Number(product.price).toLocaleString('ru-RU')} сом
                                </td>
                                <td className="px-2 sm:px-3 py-1.5 text-[12px] sm:text-sm font-normal text-gray-800 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium text-gray-900 truncate min-w-0 flex-1" title={product.name}>
                                      {mainName}
                                    </span>
                                    {badges.length > 0 && (
                                      <div className="flex items-center gap-1 flex-shrink-0 flex-wrap">
                                        {badges.slice(0, 2).map((badge, badgeIdx) => (
                                          <span
                                            key={badgeIdx}
                                            className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded whitespace-nowrap"
                                          >
                                            {badge}
                                          </span>
                                        ))}
                                        {badges.length > 2 && (
                                          <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded">
                                            +{badges.length - 2}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            ) : !loading && !error ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ничего не найдено</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {searchQuery.trim() ? 'Попробуйте изменить поисковый запрос' : 'Товары не найдены'}
                </p>
                {searchQuery.trim() && (
                  <button
                    onClick={clearSearch}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Сбросить фильтры
                  </button>
                )}
              </div>
            ) : null}

            {loadingMore && (
              <div className="text-center py-4">
                <div className="text-gray-500 text-sm">Загрузка товаров...</div>
              </div>
            )}

            {!hasMore && products.length > 0 && !searchQuery && (
              <div className="text-center py-4">
                <div className="text-gray-500 text-sm">Все товары загружены</div>
              </div>
            )}
          </>
        )}
      </main>

      <CartSummary />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
