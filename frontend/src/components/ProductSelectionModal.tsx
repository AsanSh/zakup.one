import { useState, useEffect } from 'react'
import apiClient from '../api/client'
import { useCartStore, CartItem } from '../store/cartStore'

interface Product {
  id: number
  name: string
  article?: string
  unit: string
  final_price?: number
  price?: number
  supplier?: {
    id: number
    name: string
  }
}

interface ProductSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  productName: string
  requestedQuantity: number
  requestedUnit?: string
  onSelect: (product: Product, quantity: number) => void
}

export default function ProductSelectionModal({
  isOpen,
  onClose,
  productName,
  requestedQuantity,
  requestedUnit,
  onSelect,
}: ProductSelectionModalProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(requestedQuantity)

  useEffect(() => {
    if (isOpen && productName) {
      searchProducts(productName)
    }
  }, [isOpen, productName])

  const searchProducts = async (query: string) => {
    setLoading(true)
    try {
      const response = await apiClient.get(`/api/catalog/search/?q=${encodeURIComponent(query)}`)
      const foundProducts = response.data.results || response.data || []
      setProducts(Array.isArray(foundProducts) ? foundProducts : [])
      
      // Если найден только один товар, выбираем его автоматически
      if (foundProducts.length === 1) {
        setSelectedProduct(foundProducts[0])
      }
    } catch (error) {
      console.error('Ошибка поиска товаров:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = () => {
    if (selectedProduct && quantity > 0) {
      onSelect(selectedProduct, quantity)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Выберите товар
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Найдено несколько вариантов для "{productName}"
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Закрыть"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Поиск товаров...</div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Товары не найдены</p>
              <p className="text-sm text-gray-400">
                Попробуйте изменить название товара или добавьте его вручную
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedProduct?.id === product.id
                      ? 'border-[#4A6CF7] bg-[#EEF2FF]'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {product.article && (
                          <span>Артикул: {product.article}</span>
                        )}
                        <span>Ед.: {product.unit}</span>
                        {product.supplier && (
                          <span>Поставщик: {product.supplier.name}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-gray-900">
                        {(product.final_price || product.price || 0).toLocaleString('ru-RU')} сом
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity Input */}
          {selectedProduct && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Количество
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A6CF7]"
                />
                <span className="text-sm text-gray-600">
                  {selectedProduct.unit}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedProduct || quantity <= 0}
            className="px-6 py-2 bg-[#4A6CF7] text-white rounded-lg hover:bg-[#3B5CE6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Добавить в корзину
          </button>
        </div>
      </div>
    </div>
  )
}
