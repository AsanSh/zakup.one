import { useEffect, useState } from 'react'
import { adminApi } from '../../shared/api'
import { Loader2, Plus, Edit, Tag, Percent } from 'lucide-react'

interface Product {
  id: number
  name: string
  article: string
  price: number
  is_active: boolean
  is_promotional?: boolean
  discount_percent?: number
  promotional_price?: number
}

export default function AdminProductPromotions() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [promoForm, setPromoForm] = useState({
    discount_percent: '',
    promotional_price: '',
    is_promotional: false,
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getProducts(0, 500)
      setProducts(data)
    } catch (err: any) {
      console.error('Ошибка загрузки товаров:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSetPromotion = (product: Product) => {
    setSelectedProduct(product)
    setPromoForm({
      discount_percent: product.discount_percent?.toString() || '',
      promotional_price: product.promotional_price?.toString() || '',
      is_promotional: product.is_promotional || false,
    })
    setShowModal(true)
  }

  const handleSavePromotion = async () => {
    if (!selectedProduct) return

    try {
      // TODO: Реализовать API endpoint для установки акции
      // await adminApi.setProductPromotion(selectedProduct.id, {
      //   discount_percent: promoForm.discount_percent ? parseFloat(promoForm.discount_percent) : undefined,
      //   promotional_price: promoForm.promotional_price ? parseFloat(promoForm.promotional_price) : undefined,
      //   is_promotional: promoForm.is_promotional,
      // })
      
      alert('Функция установки акций будет реализована')
      setShowModal(false)
      fetchProducts()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка установки акции')
    }
  }

  const calculatePromotionalPrice = (price: number, discount: number) => {
    return price * (1 - discount / 100)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Управление товарами</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Tag className="h-4 w-4" />
          <span>Акции и промо-акции</span>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Артикул</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Цена</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Акция</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.id}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.article || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.promotional_price ? (
                    <div>
                      <span className="line-through text-gray-400">{product.price} ₽</span>
                      <span className="ml-2 text-red-600 font-semibold">{product.promotional_price} ₽</span>
                    </div>
                  ) : (
                    <span>{product.price} ₽</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.is_promotional ? (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      <Percent className="h-3 w-3 mr-1" />
                      {product.discount_percent ? `-${product.discount_percent}%` : 'Акция'}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleSetPromotion(product)}
                    className="text-primary-600 hover:text-primary-800"
                    title="Установить акцию"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Установить акцию для: {selectedProduct.name}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Скидка (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={promoForm.discount_percent}
                  onChange={(e) => {
                    const discount = parseFloat(e.target.value) || 0
                    setPromoForm({
                      ...promoForm,
                      discount_percent: e.target.value,
                      promotional_price: discount > 0 
                        ? calculatePromotionalPrice(selectedProduct.price, discount).toFixed(2)
                        : '',
                    })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Цена со скидкой (₽)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={promoForm.promotional_price}
                  onChange={(e) => setPromoForm({ ...promoForm, promotional_price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder={selectedProduct.price.toString()}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_promotional"
                  checked={promoForm.is_promotional}
                  onChange={(e) => setPromoForm({ ...promoForm, is_promotional: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="is_promotional" className="ml-2 block text-sm text-gray-900">
                  Активировать акцию
                </label>
              </div>
              <div className="flex space-x-2 pt-4">
                <button
                  onClick={handleSavePromotion}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Сохранить
                </button>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedProduct(null)
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

