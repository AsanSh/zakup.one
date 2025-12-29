import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import { useCartStore } from '../store/cartStore'
import apiClient from '../api/client'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

interface Product {
  id: number
  name: string
  article: string
  unit: string
  origin?: string
  final_price: number
  is_recommended?: boolean
  is_promotional?: boolean
  category?: {
    id: number
    name: string
  } | null
}

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const { addItem } = useCartStore()
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([])
  const [promotionalProducts, setPromotionalProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      // Загружаем рекомендованные товары
      const recommendedResponse = await apiClient.get('/api/catalog/products/', {
        params: { is_recommended: 'true' }
      })
      const recommended = recommendedResponse.data.results || recommendedResponse.data || []
      setRecommendedProducts(Array.isArray(recommended) ? recommended : [])

      // Загружаем акционные товары
      const promotionalResponse = await apiClient.get('/api/catalog/products/', {
        params: { is_promotional: 'true' }
      })
      const promotional = promotionalResponse.data.results || promotionalResponse.data || []
      setPromotionalProducts(Array.isArray(promotional) ? promotional : [])
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error)
      setRecommendedProducts([])
      setPromotionalProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product: Product) => {
    addItem({
      product_id: product.id,
      name: product.name,
      quantity: 1,
      price: Number(product.final_price),
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab="home" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8 pt-20">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Добро пожаловать, {user?.full_name || user?.email}!
          </h2>
          <p className="text-gray-600">
            Рекомендуемые и акционные товары для вас
          </p>
        </div>

        {/* Рекомендованные товары */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-gray-900">Рекоменд. товары</h3>
              {!loading && (
                <span className="text-sm text-gray-600">
                  Товаров ({recommendedProducts.length})
                </span>
              )}
            </div>
            <button
              onClick={() => navigate('/customer/products')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Смотреть все →
            </button>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Загрузка товаров...</div>
            </div>
          ) : recommendedProducts.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
              {recommendedProducts.slice(0, 10).map((product, index) => (
                <div key={product.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-500 flex-shrink-0">{index + 1}.</span>
                      <div className="flex-1 min-w-0">
                        {/* Мобильная версия с возможностью свайпа */}
                        <div className="lg:hidden overflow-x-auto scrollbar-hide swipeable-name">
                          <h4 className="font-semibold text-gray-900 whitespace-nowrap min-w-max select-none">{product.name}</h4>
                        </div>
                        {/* Десктоп версия */}
                        <h4 className="hidden lg:block font-semibold text-gray-900 truncate">{product.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">{product.article} • {product.unit} • {product.origin || 'РФ'}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sm font-bold text-gray-900">
                          {Number(product.final_price).toLocaleString('ru-RU')} сом
                        </span>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Добавить в корзину"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">Рекомендованные товары отсутствуют</p>
            </div>
          )}
        </section>

        {/* Акционные товары */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-gray-900">Акционные товары</h3>
              {!loading && (
                <span className="text-sm text-gray-600">
                  Товаров ({promotionalProducts.length})
                </span>
              )}
            </div>
            <button
              onClick={() => navigate('/customer/products')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Смотреть все →
            </button>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Загрузка товаров...</div>
            </div>
          ) : promotionalProducts.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
              {promotionalProducts.slice(0, 10).map((product, index) => (
                <div key={product.id} className="p-4 hover:bg-gray-50 transition-colors border-l-4 border-red-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-500 flex-shrink-0">{index + 1}.</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          АКЦИЯ
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* Мобильная версия с возможностью свайпа */}
                        <div className="lg:hidden overflow-x-auto scrollbar-hide swipeable-name">
                          <h4 className="font-semibold text-gray-900 whitespace-nowrap min-w-max select-none">{product.name}</h4>
                        </div>
                        {/* Десктоп версия */}
                        <h4 className="hidden lg:block font-semibold text-gray-900 truncate">{product.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">{product.article} • {product.unit} • {product.origin || 'РФ'}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sm font-bold text-red-600">
                          {Number(product.final_price).toLocaleString('ru-RU')} сом
                        </span>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Добавить в корзину"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">Акционные товары отсутствуют</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}

