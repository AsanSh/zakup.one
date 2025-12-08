import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import { useCartStore } from '../store/cartStore'
import apiClient from '../api/client'
import ClientHeader from '../components/ClientHeader'

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
      <ClientHeader activeTab="home" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ paddingTop: '5rem' }}>
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
            <h3 className="text-xl font-bold text-gray-900">Рекомендованные товары</h3>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendedProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="mb-3">
                    <h4 className="font-semibold text-gray-900 mb-1">{product.name}</h4>
                    <p className="text-xs text-gray-500">{product.article}</p>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-500">{product.unit} • {product.origin || 'РФ'}</p>
                      <p className="text-lg font-bold text-gray-900">
                        {Number(product.final_price).toLocaleString('ru-RU')} сом
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    В корзину
                  </button>
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
            <h3 className="text-xl font-bold text-gray-900">Акционные товары</h3>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {promotionalProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow border-2 border-red-200">
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        АКЦИЯ
                      </span>
                      <h4 className="font-semibold text-gray-900">{product.name}</h4>
                    </div>
                    <p className="text-xs text-gray-500">{product.article}</p>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-500">{product.unit} • {product.origin || 'РФ'}</p>
                      <p className="text-lg font-bold text-red-600">
                        {Number(product.final_price).toLocaleString('ru-RU')} сом
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    В корзину
                  </button>
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
    </div>
  )
}

