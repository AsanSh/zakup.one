import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import OrderActionButton from './OrderActionButton'
import ProductSelectionModal from './ProductSelectionModal'
import { useCartStore } from '../store/cartStore'
import { processExcelFile, processText, processImage, searchProductsByName, ProcessedProduct } from '../utils/orderProcessor'
import apiClient from '../api/client'

export default function CreateOrderModal({
  isOpen,
  onClose,
  onFileUpload,
  onTextInput,
  onPhotoCapture,
}: CreateOrderModalProps) {
  const navigate = useNavigate()
  const { addItem } = useCartStore()
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const [processing, setProcessing] = useState(false)
  const [selectionModal, setSelectionModal] = useState<{
    isOpen: boolean
    productName: string
    quantity: number
    unit?: string
    products: any[]
  }>({
    isOpen: false,
    productName: '',
    quantity: 1,
    products: [],
  })
  const [pendingProducts, setPendingProducts] = useState<ProcessedProduct[]>([])
  const [currentProductIndex, setCurrentProductIndex] = useState(0)
  const [addedItemsCount, setAddedItemsCount] = useState(0)
  const [recognizedText, setRecognizedText] = useState<string>('')
  const [showTextEditor, setShowTextEditor] = useState(false)

  // Focus trap
  useEffect(() => {
    if (!isOpen) return

    // Сохраняем элемент, который был в фокусе до открытия модального окна
    previousFocusRef.current = document.activeElement as HTMLElement

    // Фокусируемся на модальном окне
    const firstFocusable = modalRef.current?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement
    firstFocusable?.focus()

    // Обработка Escape
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    // Обработка Tab для focus trap
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (!focusableElements || focusableElements.length === 0) return

      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('keydown', handleTab)

    // Предотвращаем скролл body при открытом модальном окне
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', handleTab)
      document.body.style.overflow = ''
      
      // Возвращаем фокус на предыдущий элемент
      previousFocusRef.current?.focus()
    }
  }, [isOpen, onClose])

  // Обработка товаров и добавление в корзину
  const processProductsToCart = async (products: ProcessedProduct[]) => {
    console.log('processProductsToCart called with products:', products)
    if (products.length === 0) {
      console.warn('processProductsToCart: products array is empty')
      setProcessing(false)
      alert('Не удалось распознать товары из изображения. Попробуйте еще раз или используйте текстовый ввод.')
      return
    }

    console.log(`Starting to process ${products.length} products`)
    setAddedItemsCount(0)
    setPendingProducts(products)
    setCurrentProductIndex(0)
    await processNextProduct(products, 0)
  }

  const processNextProduct = async (products: ProcessedProduct[], index: number) => {
    console.log(`processNextProduct: processing product ${index + 1} of ${products.length}`)
    
    if (index >= products.length) {
      // Все товары обработаны
      console.log(`All products processed. Added ${addedItemsCount} items to cart`)
      setPendingProducts([])
      setCurrentProductIndex(0)
      setProcessing(false)
      
      if (addedItemsCount === 0) {
        // Ничего не было добавлено
        alert('Товары не найдены в каталоге. Проверьте названия товаров и попробуйте еще раз.')
        onClose()
        return
      }
      
      // Показываем сообщение об успехе
      const message = addedItemsCount === 1 
        ? 'Товар добавлен в корзину'
        : `Добавлено товаров: ${addedItemsCount}`
      console.log(message)
      
      onClose()
      navigate('/cart')
      return
    }

    const product = products[index]
    console.log(`Processing product:`, product)
    setCurrentProductIndex(index)

    // Ищем товары по названию
    console.log(`Searching for products with name: "${product.name}"`)
    try {
      const foundProducts = await searchProductsByName(product.name)
      console.log(`Found ${foundProducts.length} products for "${product.name}"`)

      if (foundProducts.length === 0) {
        // Товар не найден, пропускаем
        console.warn(`Товар "${product.name}" не найден, пропускаем`)
        await processNextProduct(products, index + 1)
      } else if (foundProducts.length === 1) {
        // Найден один товар, добавляем автоматически
        const foundProduct = foundProducts[0]
        const cartItem = {
          product_id: foundProduct.id,
          name: foundProduct.name,
          unit: foundProduct.unit || product.unit || 'шт',
          quantity: product.quantity,
          price: foundProduct.final_price || foundProduct.price || 0,
        }
        console.log('Adding single product to cart:', cartItem)
        addItem(cartItem)
        setAddedItemsCount(prev => prev + 1)
        // Небольшая задержка для плавности
        await new Promise(resolve => setTimeout(resolve, 100))
        await processNextProduct(products, index + 1)
      } else {
        // Найдено несколько товаров, показываем модальное окно выбора
        console.log(`Found ${foundProducts.length} products, showing selection modal`)
        setSelectionModal({
          isOpen: true,
          productName: product.name,
          quantity: product.quantity,
          unit: product.unit,
          products: foundProducts,
        })
      }
    } catch (error) {
      console.error(`Error searching for product "${product.name}":`, error)
      // Продолжаем обработку следующего товара
      await processNextProduct(products, index + 1)
    }
  }

  const handleProductSelected = async (product: any, quantity: number) => {
    const cartItem = {
      product_id: product.id,
      name: product.name,
      unit: product.unit || selectionModal.unit || 'шт',
      quantity: quantity,
      price: product.final_price || product.price || 0,
    }
    console.log('handleProductSelected: adding to cart:', cartItem)
    addItem(cartItem)
    setAddedItemsCount(prev => prev + 1)

    setSelectionModal({ ...selectionModal, isOpen: false })
    // Продолжаем обработку следующего товара
    setTimeout(() => {
      processNextProduct(pendingProducts, currentProductIndex + 1)
    }, 100)
  }

  const handleFileUpload = async (file: File) => {
    console.log('handleFileUpload: received file:', file.name, file.size)
    setProcessing(true)
    try {
      const products = await processExcelFile(file)
      console.log('handleFileUpload: processed products:', products)
      if (onFileUpload) {
        onFileUpload(file)
      }
      
      if (products.length === 0) {
        setProcessing(false)
        alert('Не удалось распознать товары из файла. Проверьте формат файла и попробуйте еще раз.')
        return
      }
      
      await processProductsToCart(products)
    } catch (error: any) {
      console.error('Ошибка обработки файла:', error)
      setProcessing(false)
      const errorMessage = error.response?.data?.message || error.message || 'Неизвестная ошибка'
      alert(`Ошибка при обработке файла: ${errorMessage}. Попробуйте еще раз.`)
    }
  }

  const handlePhotoCapture = async (file: File) => {
    console.log('handlePhotoCapture: received file:', file.name, file.size)
    setProcessing(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await apiClient.post('/api/orders/parse-image/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const data = response.data
      console.log('API response for parse-image:', data)

      if (onPhotoCapture) {
        onPhotoCapture(file)
      }

      // Если API возвращает текст (OCR результат), показываем его для редактирования
      if (data.text || data.ocr_text) {
        const ocrText = data.text || data.ocr_text
        console.log('API вернул текст из OCR, показываем редактор:', ocrText)
        setRecognizedText(ocrText)
        setShowTextEditor(true)
        setProcessing(false)
        return
      }

      // Если API вернул готовые товары, обрабатываем их
      const products = await processImage(file)
      console.log('handlePhotoCapture: processed products:', products)
      
      if (products.length === 0) {
        setProcessing(false)
        alert('Не удалось распознать товары из изображения. Убедитесь, что текст четко виден на фото, или используйте текстовый ввод.')
        return
      }
      
      await processProductsToCart(products)
    } catch (error: any) {
      console.error('Ошибка обработки изображения:', error)
      
      // Если API вернул ошибку, но есть текст в ответе
      if (error.response?.data?.text || error.response?.data?.ocr_text) {
        const ocrText = error.response.data.text || error.response.data.ocr_text
        console.log('Found text in error response, showing editor:', ocrText)
        setRecognizedText(ocrText)
        setShowTextEditor(true)
        setProcessing(false)
        if (onPhotoCapture) {
          onPhotoCapture(file)
        }
        return
      }
      
      setProcessing(false)
      const errorMessage = error.response?.data?.message || error.message || 'Неизвестная ошибка'
      alert(`Ошибка при обработке изображения: ${errorMessage}. Попробуйте еще раз или используйте текстовый ввод.`)
    }
  }

  const handleTextEditorConfirm = async () => {
    if (!recognizedText.trim()) {
      alert('Введите текст товаров')
      return
    }

    setShowTextEditor(false)
    setProcessing(true)
    try {
      const products = await processText(recognizedText)
      console.log('handleTextEditorConfirm: processed products:', products)
      
      if (products.length === 0) {
        setProcessing(false)
        alert('Не удалось распознать товары из текста. Проверьте формат ввода и попробуйте еще раз.')
        return
      }
      
      await processProductsToCart(products)
    } catch (error: any) {
      console.error('Ошибка обработки текста:', error)
      setProcessing(false)
      const errorMessage = error.response?.data?.message || error.message || 'Неизвестная ошибка'
      alert(`Ошибка при обработке текста: ${errorMessage}. Попробуйте еще раз.`)
    }
  }

  const handleTextInput = async () => {
    const text = prompt('Введите наименование товара и количество:\n\nПример:\nРотбанд 30 мешков\nАрматура А12 - 100 м\nПроволока вязальная - 50 кг')
    if (text && text.trim()) {
      console.log('handleTextInput: received text:', text)
      setProcessing(true)
      try {
        const products = await processText(text)
        console.log('handleTextInput: processed products:', products)
        if (onTextInput) {
          onTextInput()
        }
        
        if (products.length === 0) {
          setProcessing(false)
          alert('Не удалось распознать товары из текста. Проверьте формат ввода и попробуйте еще раз.')
          return
        }
        
        await processProductsToCart(products)
      } catch (error: any) {
        console.error('Ошибка обработки текста:', error)
        setProcessing(false)
        const errorMessage = error.response?.data?.message || error.message || 'Неизвестная ошибка'
        alert(`Ошибка при обработке текста: ${errorMessage}. Попробуйте еще раз.`)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 lg:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !processing && !showTextEditor) {
          setShowTextEditor(false)
          setRecognizedText('')
          onClose()
        } else if (e.target === e.currentTarget && processing) {
          if (confirm('Обработка товаров еще не завершена. Вы уверены, что хотите закрыть?')) {
            setProcessing(false)
            setPendingProducts([])
            setCurrentProductIndex(0)
            setAddedItemsCount(0)
            setShowTextEditor(false)
            setRecognizedText('')
            onClose()
          }
        }
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-[800px] max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 border-b border-gray-100 flex-shrink-0">
          <h2
            id="modal-title"
            className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 pr-4"
          >
            Создание заявки
          </h2>
          <button
            onClick={() => {
              if (processing) {
                if (confirm('Обработка товаров еще не завершена. Вы уверены, что хотите закрыть?')) {
                  setProcessing(false)
                  setPendingProducts([])
                  setCurrentProductIndex(0)
                  setAddedItemsCount(0)
                  setShowTextEditor(false)
                  setRecognizedText('')
                  onClose()
                }
              } else {
                setShowTextEditor(false)
                setRecognizedText('')
                onClose()
              }
            }}
            disabled={processing}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#4A6CF7] focus:ring-offset-2 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Закрыть модальное окно"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
          <div className="space-y-4 sm:space-y-5 lg:space-y-6">
            {/* Instruction Block */}
            <div className="p-4 sm:p-5 bg-[#F3F4F6] rounded-xl sm:rounded-2xl border border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                Инструкция
              </h3>
              <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 leading-relaxed break-words whitespace-normal">
                Выберите один из способов создания заявки. Система автоматически
                обработает данные и создаст заявку.
              </p>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm sm:text-base font-medium text-[#4A6CF7] hover:text-[#3B5CE6] transition-colors break-words max-w-full"
              >
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                <span className="break-words">Смотреть видеоинструкцию на YouTube</span>
              </a>
            </div>

            {/* Action Buttons - Wrapped in Frame */}
            <div className="border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 bg-gray-50/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
              {/* Загрузить файл */}
              <OrderActionButton
                icon={
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                }
                label="Загрузить файл"
                description="Excel файл с товарами"
                tooltip="Выберите Excel файл, система сама обработает данные"
                fileInputId="excel-upload-modal"
                accept=".xlsx,.xls"
                onFileChange={handleFileUpload}
              />

              {/* Ввести текст */}
              <OrderActionButton
                icon={
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                }
                label="Ввести текст"
                description="Текстовый формат"
                tooltip="Вставьте список товаров вручную"
                onClick={handleTextInput}
              />

              {/* Сфотографировать */}
              <OrderActionButton
                icon={
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                }
                label="Сфотографировать"
                description="Распознавание текста"
                tooltip="Сделайте фото прайса, система распознает текст"
                fileInputId="image-upload-modal"
                accept="image/*"
                capture="environment"
                onFileChange={handlePhotoCapture}
              />
              </div>
            </div>
          </div>
        </div>

        {/* Processing Indicator */}
        {processing && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
            <div className="text-center px-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A6CF7] mx-auto mb-4"></div>
              <p className="text-gray-700 font-medium">
                Обработка товаров...
              </p>
              {pendingProducts.length > 0 ? (
                <>
                  <p className="text-sm text-gray-500 mt-2">
                    Товар {currentProductIndex + 1} из {pendingProducts.length}
                  </p>
                  {addedItemsCount > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      Добавлено в корзину: {addedItemsCount}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500 mt-2">
                  Распознавание текста...
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Text Editor Modal for OCR Results */}
      {showTextEditor && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              // При клике на backdrop не закрываем, требуем явного действия
            }
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-[600px] max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                Распознанный текст
              </h3>
              <button
                onClick={() => {
                  setShowTextEditor(false)
                  setRecognizedText('')
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Закрыть редактор"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-sm text-gray-600 mb-3">
                Отредактируйте распознанный текст, если необходимо:
              </p>
              <textarea
                value={recognizedText}
                onChange={(e) => setRecognizedText(e.target.value)}
                className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#4A6CF7] focus:border-transparent font-mono text-sm"
                placeholder="Введите товары и количество..."
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                Пример: Ротбанд 10 мешков<br />
                Арматура ф 16 - 34 м
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowTextEditor(false)
                  setRecognizedText('')
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleTextEditorConfirm}
                disabled={!recognizedText.trim()}
                className="px-4 py-2 bg-[#5A46F6] text-white rounded-lg hover:bg-[#4A3CE6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Обработать
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Selection Modal */}
      <ProductSelectionModal
        isOpen={selectionModal.isOpen}
        onClose={() => {
          console.log('ProductSelectionModal closed without selection, skipping product')
          setSelectionModal({ ...selectionModal, isOpen: false })
          // Продолжаем обработку следующего товара даже при отмене
          setTimeout(() => {
            processNextProduct(pendingProducts, currentProductIndex + 1)
          }, 100)
        }}
        productName={selectionModal.productName}
        requestedQuantity={selectionModal.quantity}
        requestedUnit={selectionModal.unit}
        onSelect={handleProductSelected}
      />
    </div>
  )
}

