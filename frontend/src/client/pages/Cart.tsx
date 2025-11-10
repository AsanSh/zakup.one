import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import type { CartItem } from '../../shared/types'
import { clientApi } from '../../shared/api'
import { formatPrice } from '../../shared/utils/formatters'
import { Trash2, Plus, Minus, Upload, FileText, Camera, X, Loader2 } from 'lucide-react'

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, getTotal, addItem } = useCartStore()
  const [showManualModal, setShowManualModal] = useState(false)
  const [manualText, setManualText] = useState('')
  const [processingManual, setProcessingManual] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price) + ' сом'
  }

  // Скачать шаблон Excel (CSV формат)
  const downloadTemplate = () => {
    const csvContent = `Наименование товара,Количество,Единица измерения
Арматура А18,10,м
Проволока вязальная,5,кг
Цемент М500,20,мешок`

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'шаблон_номенклатуры.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Обработка загрузки файла
  const handleFileUpload = async (file: File) => {
    setUploadingFile(true)
    try {
      // Здесь будет обработка файла через API
      // Пока просто показываем сообщение
      alert(`Файл "${file.name}" загружен. Обработка файла будет реализована через API.`)
    } catch (error) {
      alert('Ошибка при обработке файла. Попробуйте снова.')
    } finally {
      setUploadingFile(false)
    }
  }

  // Обработка текстового ввода
  const handleManualSubmit = async () => {
    if (!manualText.trim()) {
      alert('Введите текст с товарами')
      return
    }

    setProcessingManual(true)
    try {
      // Парсим текст: формат "Товар - количество единица" или "Товар количество единица"
      const lines = manualText.split('\n').filter(line => line.trim())
      const products: Array<{ name: string; quantity: number; unit: string }> = []

      for (const line of lines) {
        // Пытаемся найти паттерн: название - количество единица
        const match1 = line.match(/^(.+?)\s*[-–]\s*(\d+(?:[.,]\d+)?)\s*(.+?)$/i)
        // Или: название количество единица
        const match2 = line.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)\s+(.+?)$/i)

        if (match1) {
          const [, name, qty, unit] = match1
          products.push({
            name: name.trim(),
            quantity: parseFloat(qty.replace(',', '.')),
            unit: unit.trim() || 'шт',
          })
        } else if (match2) {
          const [, name, qty, unit] = match2
          products.push({
            name: name.trim(),
            quantity: parseFloat(qty.replace(',', '.')),
            unit: unit.trim() || 'шт',
          })
        }
      }

      if (products.length === 0) {
        alert('Не удалось распознать товары. Используйте формат:\nТовар - 10 шт\nили\nТовар 10 шт')
        setProcessingManual(false)
        return
      }

      // Ищем товары в базе и добавляем в корзину
      let foundCount = 0
      for (const product of products) {
        try {
          const searchResults = await clientApi.searchProducts(product.name, 5)
          if (searchResults.length > 0) {
            // Берем первый найденный товар
            const foundProduct = searchResults[0]
            addItem({
              product_id: foundProduct.id,
              name: foundProduct.name,
              unit: foundProduct.unit || product.unit,
              price: foundProduct.price,
            })
            // Обновляем количество если нужно
            if (product.quantity > 1) {
              for (let i = 1; i < product.quantity; i++) {
                addItem({
                  product_id: foundProduct.id,
                  name: foundProduct.name,
                  unit: foundProduct.unit || product.unit,
                  price: foundProduct.price,
                })
              }
            }
            foundCount++
          }
        } catch (error) {
          console.error(`Ошибка поиска товара "${product.name}":`, error)
        }
      }

      if (foundCount > 0) {
        alert(`Добавлено товаров: ${foundCount} из ${products.length}`)
        setShowManualModal(false)
        setManualText('')
      } else {
        alert('Не найдено ни одного товара. Проверьте названия товаров.')
      }
    } catch (error) {
      alert('Ошибка при обработке текста. Попробуйте снова.')
    } finally {
      setProcessingManual(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Способы создания заявки - вверху */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">
          Способы создания заявки
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Загрузить номенклатуру */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col" style={{ minHeight: '320px' }}>
            <div className="flex flex-col items-center text-center flex-1">
              <div className="bg-primary-100 rounded-full p-4 mb-4">
                <Upload className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Загрузить номенклатуру
              </h3>
              <p className="text-sm text-gray-500 mb-4 flex-1">
                Загрузите Excel файл с товарами и количеством. Система автоматически определит товары и создаст счет.
              </p>
              <div className="w-full mt-auto" style={{ marginTop: 'auto' }}>
                <button
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = '.xlsx,.xls,.csv'
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) {
                        handleFileUpload(file)
                      }
                    }
                    input.click()
                  }}
                  disabled={uploadingFile}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  style={{ height: '40px' }}
                >
                  {uploadingFile ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Обработка...
                    </>
                  ) : (
                    'Выбрать файл'
                  )}
                </button>
                <button
                  onClick={downloadTemplate}
                  className="w-full text-sm text-primary-600 hover:text-primary-700 py-1 mt-2"
                  style={{ height: '32px' }}
                >
                  Скачать шаблон
                </button>
              </div>
            </div>
          </div>

          {/* Создать заявку вручную */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col" style={{ minHeight: '320px' }}>
            <div className="flex flex-col items-center text-center flex-1">
              <div className="bg-primary-100 rounded-full p-4 mb-4">
                <FileText className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Создать заявку вручную
              </h3>
              <p className="text-sm text-gray-500 mb-4 flex-1">
                Введите наименование товара и количество в текстовом формате.
              </p>
              <div className="w-full mt-auto" style={{ marginTop: 'auto' }}>
                <button
                  onClick={() => setShowManualModal(true)}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                  style={{ height: '40px' }}
                >
                  Ввести текст
                </button>
                <div style={{ height: '32px' }}></div>
              </div>
            </div>
          </div>

          {/* Сфотографировать текст */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col" style={{ minHeight: '320px' }}>
            <div className="flex flex-col items-center text-center flex-1">
              <div className="bg-primary-100 rounded-full p-4 mb-4">
                <Camera className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Сфотографировать текст
              </h3>
              <p className="text-sm text-gray-500 mb-4 flex-1">
                Сфотографируйте текст на бумаге. Система распознает товары и количество.
              </p>
              <div className="w-full mt-auto" style={{ marginTop: 'auto' }}>
                <button
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = 'image/*'
                    input.capture = 'environment'
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) {
                        // TODO: Обработка фотографии и OCR
                        alert(`Фотография ${file.name} будет обработана. Функция в разработке.`)
                      }
                    }
                    input.click()
                  }}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                  style={{ height: '40px' }}
                >
                  Сфотографировать
                </button>
                <div style={{ height: '32px' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {items.length > 0 && (
        <>
          <div className="mb-8 mt-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Сборка заявки</h1>
            <button
              onClick={clearCart}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Очистить корзину
            </button>
          </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-200">
          {items.map((item) => (
            <CartItemRow
              key={item.product_id}
              item={item}
              onRemove={removeItem}
              onUpdateQuantity={updateQuantity}
            />
          ))}
        </div>

        <div className="bg-gray-50 px-6 py-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-900">Итого:</span>
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(getTotal())}
            </span>
          </div>
        </div>
      </div>

          <div className="mt-6 flex justify-end">
            <Link
              to="/orders/create"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Оформить заявку
            </Link>
          </div>
        </>
      )}

      {/* Модальное окно для создания заявки вручную */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Создать заявку вручную</h2>
              <button
                onClick={() => {
                  setShowManualModal(false)
                  setManualText('')
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label htmlFor="manual-text" className="block text-sm font-medium text-gray-700 mb-2">
                  Введите товары в формате:
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-3 text-sm text-gray-600">
                  <p className="mb-1">Примеры:</p>
                  <p>Арматура А18 - 10 м</p>
                  <p>Проволока вязальная - 5 кг</p>
                  <p>Цемент М500 20 мешок</p>
                </div>
                <textarea
                  id="manual-text"
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder="Введите товары, каждый с новой строки..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  rows={10}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowManualModal(false)
                    setManualText('')
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleManualSubmit}
                  disabled={processingManual || !manualText.trim()}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {processingManual ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Обработка...
                    </>
                  ) : (
                    'Добавить товары'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CartItemRow({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: CartItem
  onRemove: (productId: number) => void
  onUpdateQuantity: (productId: number, quantity: number) => void
}) {

  return (
    <div className="px-4 py-1.5 flex items-center gap-3 text-sm hover:bg-gray-50 transition-colors" style={{ minHeight: '32px' }}>
      {/* Название */}
      <div className="flex-1 min-w-0 truncate">
        <span className="text-gray-900">
          {item.name}
        </span>
      </div>
      
      {/* Единица измерения */}
      <div className="text-gray-600 whitespace-nowrap" style={{ minWidth: '50px' }}>
        {item.unit}
      </div>
      
      {/* Количество с кнопками */}
      <div className="flex items-center space-x-2" style={{ minWidth: '100px' }}>
        <button
          onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
          className="p-1 rounded-md hover:bg-gray-100"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-8 text-center text-gray-900">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
          className="p-1 rounded-md hover:bg-gray-100"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      
      {/* Цена за единицу */}
      <div className="text-gray-500 whitespace-nowrap text-right" style={{ minWidth: '90px' }}>
        {formatPrice(item.price)}
      </div>
      
      {/* Общая цена */}
      <div className="text-gray-900 whitespace-nowrap text-right" style={{ minWidth: '90px' }}>
        {formatPrice(item.price * item.quantity)}
      </div>
      
      {/* Иконка удаления */}
      <div className="flex justify-end" style={{ minWidth: '36px' }}>
        <button
          onClick={() => onRemove(item.product_id)}
          className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

