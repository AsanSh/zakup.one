import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import apiClient from '../api/client'
import ClientHeader from '../components/ClientHeader'

export default function CartPage() {
  const navigate = useNavigate()
  const { items, clearCart } = useCartStore()
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [excelFile, setExcelFile] = useState<File | null>(null)
  const [textInput, setTextInput] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setExcelFile(file)
      setSelectedMethod('excel')
    }
  }

  const handleExcelUpload = async () => {
    if (!excelFile) return
    
    try {
      const formData = new FormData()
      formData.append('file', excelFile)
      
      const response = await apiClient.post('/api/orders/parse-excel/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      // Обработка ответа
      console.log('Excel загружен:', response.data)
      alert('Заявка создана из Excel файла')
      clearCart()
    } catch (error) {
      console.error('Ошибка загрузки Excel:', error)
      alert('Ошибка при загрузке файла')
    }
  }

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return
    
    try {
      const response = await apiClient.post('/api/orders/parse-text/', {
        text: textInput,
      })
      
      // Обработка ответа
      console.log('Текст обработан:', response.data)
      alert('Заявка создана из текста')
      setTextInput('')
      clearCart()
    } catch (error) {
      console.error('Ошибка обработки текста:', error)
      alert('Ошибка при обработке текста')
    }
  }

  const handleImageUpload = async () => {
    if (!imageFile) return
    
    try {
      const formData = new FormData()
      formData.append('image', imageFile)
      
      const response = await apiClient.post('/api/orders/parse-image/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      // Обработка ответа
      console.log('Изображение обработано:', response.data)
      alert('Заявка создана из фотографии')
      clearCart()
    } catch (error) {
      console.error('Ошибка обработки изображения:', error)
      alert('Ошибка при обработке изображения')
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setSelectedMethod('image')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientHeader activeTab="cart" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ paddingTop: '5rem' }}>
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Способы создания заявки
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Метод 1: Загрузить Excel */}
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Загрузить номенклатуру
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Загрузите Excel файл с товарами и количеством. Система автоматически определит товары и создаст счет.
              </p>
              <div className="w-full space-y-2">
                <label className="block">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="excel-upload"
                  />
                  <button
                    onClick={() => document.getElementById('excel-upload')?.click()}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Выбрать файл
                  </button>
                </label>
                {excelFile && (
                  <div className="text-xs text-gray-500 mb-2">
                    Выбран: {excelFile.name}
                  </div>
                )}
                {excelFile && (
                  <button
                    onClick={handleExcelUpload}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Загрузить
                  </button>
                )}
                <a
                  href="#"
                  className="block text-center text-sm text-blue-600 hover:text-blue-800"
                  onClick={(e) => {
                    e.preventDefault()
                    // TODO: Реализовать скачивание шаблона
                    alert('Скачивание шаблона будет реализовано')
                  }}
                >
                  Скачать шаблон
                </a>
              </div>
            </div>
          </div>

          {/* Метод 2: Ввести текст */}
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Создать заявку вручную
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Введите наименование товара и количество в текстовом формате.
              </p>
              <div className="w-full space-y-2">
                {selectedMethod === 'text' ? (
                  <>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Например:&#10;Арматура А12 - 100 м&#10;Проволока вязальная - 50 кг"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      rows={4}
                    />
                    <button
                      onClick={handleTextSubmit}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Создать заявку
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMethod(null)
                        setTextInput('')
                      }}
                      className="w-full text-gray-600 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm"
                    >
                      Отмена
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setSelectedMethod('text')}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Ввести текст
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Метод 3: Сфотографировать */}
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Сфотографировать текст
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Сфотографируйте текст на бумаге. Система распознает товары и количество.
              </p>
              <div className="w-full space-y-2">
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <button
                    onClick={() => document.getElementById('image-upload')?.click()}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Сфотографировать
                  </button>
                </label>
                {imageFile && (
                  <>
                    <div className="text-xs text-gray-500 mb-2">
                      Выбрано: {imageFile.name}
                    </div>
                    <button
                      onClick={handleImageUpload}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Обработать
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
