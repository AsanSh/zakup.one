import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api, Product } from '../api/api'
import { useCartStore } from '../store/cartStore'
import { Plus, Loader2 } from 'lucide-react'

export default function Search() {
  const [searchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set())
  const searchRef = useRef<HTMLDivElement>(null)
  const { addItem, removeItem, items } = useCartStore()
  
  // Синхронизируем selectedProducts с корзиной
  useEffect(() => {
    const cartProductIds = new Set(items.map(item => item.product_id))
    setSelectedProducts(cartProductIds)
  }, [items])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Загружаем результаты при изменении query из URL
  useEffect(() => {
    if (initialQuery && initialQuery !== query) {
      setQuery(initialQuery)
    }
  }, [initialQuery])

  // Загружаем товары при монтировании компонента и при изменении query
  useEffect(() => {
    const searchProducts = async () => {
      setLoading(true)
      try {
        // Если запрос пустой или меньше 2 символов, показываем все товары
        const searchQuery = query.length >= 2 ? query : ""
        const results = await api.searchProducts(searchQuery, 100)
        setProducts(results)
        // Показываем dropdown только если есть запрос >= 2 символов
        if (query.length >= 2) {
          setShowDropdown(true)
        } else {
          setShowDropdown(false)
        }
      } catch (error) {
        console.error('Ошибка поиска:', error)
        setProducts([])
        setShowDropdown(false)
      } finally {
        setLoading(false)
      }
    }

    // Загружаем сразу при монтировании и для пустого запроса
    if (query.length < 2) {
      searchProducts()
    } else {
      // Для поиска с задержкой
      const debounceTimer = setTimeout(searchProducts, 300)
      return () => clearTimeout(debounceTimer)
    }
  }, [query])

  const handleAddToCart = (product: Product) => {
    // Если товар уже в корзине, удаляем его
    if (selectedProducts.has(product.id)) {
      removeItem(product.id)
      const newSelected = new Set(selectedProducts)
      newSelected.delete(product.id)
      setSelectedProducts(newSelected)
    } else {
      // Добавляем товар в корзину
      addItem({
        product_id: product.id,
        name: product.name,
        unit: product.unit || 'шт',
        price: product.price,
      })
      setSelectedProducts(new Set([...selectedProducts, product.id]))
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price) + ' сом'
  }

  // Группируем товары по категориям
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
    <div className="max-w-4xl mx-auto">
      <div ref={searchRef} className="relative mb-6">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Начните вводить название товара..."
            className="block w-full px-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
          {loading && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
            </div>
          )}
        </div>

        {showDropdown && products.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-96 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm"
                style={{ minHeight: '32px' }}
              >
                {/* Название */}
                <div className="flex-1 min-w-0 truncate">
                  <span className="text-gray-900">
                    {product.name}
                  </span>
                </div>
                
                {/* Единица измерения */}
                <div className="text-gray-600 whitespace-nowrap" style={{ minWidth: '50px' }}>
                  {product.unit || 'шт'}
                </div>
                
                {/* Страна производства */}
                <div className="text-gray-500 whitespace-nowrap truncate" style={{ minWidth: '100px', maxWidth: '150px' }}>
                  {product.country || '-'}
                </div>
                
                {/* Стоимость */}
                <div className="text-gray-900 whitespace-nowrap text-right" style={{ minWidth: '90px' }}>
                  {formatPrice(product.price)}
                </div>
                
                {/* Иконка добавления в корзину */}
                <div className="flex justify-end" style={{ minWidth: '36px' }}>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={selectedProducts.has(product.id)}
                    className={`p-1.5 rounded transition-colors ${
                      selectedProducts.has(product.id)
                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                    title={selectedProducts.has(product.id) ? 'Добавлено' : 'Добавить в корзину'}
                  >
                    {selectedProducts.has(product.id) ? (
                      <span className="text-xs">✓</span>
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showDropdown && !loading && query.length >= 2 && products.length === 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-4 text-center text-gray-500">
            Товары не найдены
          </div>
        )}
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      )}

      {!showDropdown && !loading && products.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {query ? `Результаты поиска (${products.length})` : `Товары (${products.length})`}
          </h2>
          
          {/* Список товаров, сгруппированных по категориям */}
          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category} className="bg-white shadow rounded-lg overflow-hidden">
                {/* Заголовок категории */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {category} ({groupedProducts[category].length} {groupedProducts[category].length === 1 ? 'товар' : 'товаров'})
                  </h3>
                </div>
                
                {/* Список товаров в категории - компактный формат, одна строка */}
                <div className="divide-y divide-gray-200">
                  {groupedProducts[category].map((product) => (
                    <div
                      key={product.id}
                      className="px-4 py-1.5 hover:bg-gray-50 transition-colors flex items-center gap-3 text-sm"
                      style={{ minHeight: '32px' }}
                    >
                      {/* Название */}
                      <div className="flex-1 min-w-0 truncate">
                        <span className="text-gray-900">
                          {product.name}
                        </span>
                      </div>
                      
                      {/* Единица измерения */}
                      <div className="text-gray-600 whitespace-nowrap" style={{ minWidth: '50px' }}>
                        {product.unit || 'шт'}
                      </div>
                      
                      {/* Страна производства */}
                      <div className="text-gray-500 whitespace-nowrap truncate" style={{ minWidth: '100px', maxWidth: '150px' }}>
                        {product.country || '-'}
                      </div>
                      
                      {/* Стоимость */}
                      <div className="text-gray-900 whitespace-nowrap text-right" style={{ minWidth: '90px' }}>
                        {formatPrice(product.price)}
                      </div>
                      
                      {/* Кнопка добавления в корзину - только иконка */}
                      <div className="flex justify-end" style={{ minWidth: '36px' }}>
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={selectedProducts.has(product.id)}
                          className={`p-1.5 rounded transition-colors ${
                            selectedProducts.has(product.id)
                              ? 'bg-green-100 text-green-700 cursor-not-allowed'
                              : 'bg-primary-600 text-white hover:bg-primary-700'
                          }`}
                          title={selectedProducts.has(product.id) ? 'Добавлено' : 'Добавить в корзину'}
                        >
                          {selectedProducts.has(product.id) ? (
                            <span className="text-xs">✓</span>
                          ) : (
                            <Plus className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!showDropdown && !loading && products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Товары не найдены</p>
        </div>
      )}
    </div>
  )
}

