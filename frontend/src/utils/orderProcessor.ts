import apiClient from '../api/client'
import { parseTextToProducts } from './productParser'
import { useCartStore, CartItem } from '../store/cartStore'

export interface ProcessedProduct {
  name: string
  quantity: number
  unit?: string
  products?: Array<{
    id: number
    name: string
    article: string
    unit: string
    final_price: number
    supplier?: {
      id: number
      name: string
    }
  }>
}

export interface ImageProcessingResult {
  products: ProcessedProduct[]
  ocrText?: string
  needsEditing?: boolean
}

/**
 * Обрабатывает Excel файл и возвращает список товаров
 */
export async function processExcelFile(file: File): Promise<ProcessedProduct[]> {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await apiClient.post('/api/orders/parse-excel/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    // Предполагаем, что API возвращает массив товаров
    // Формат ответа может быть разным, нужно адаптировать под реальный API
    const data = response.data
    console.log('API response for parse-excel:', data)
    
    // Если API возвращает массив товаров напрямую
    if (Array.isArray(data)) {
      const products = data.map((item: any) => ({
        name: item.name || item.product_name || '',
        quantity: item.quantity || 1,
        unit: item.unit || undefined,
        products: item.products || item.matched_products || [],
      }))
      console.log('Parsed products from API (array):', products)
      return products
    }

    // Если API возвращает объект с полем items или products
    if (data.items || data.products) {
      const items = data.items || data.products
      const products = items.map((item: any) => ({
        name: item.name || item.product_name || '',
        quantity: item.quantity || 1,
        unit: item.unit || undefined,
        products: item.products || item.matched_products || [],
      }))
      console.log('Parsed products from API (object):', products)
      return products
    }

    console.warn('API не вернул данные для Excel файла')
    return []
  } catch (error: any) {
    console.error('Ошибка обработки Excel файла:', error)
    console.error('Error details:', error.response?.data || error.message)
    // Не бросаем ошибку, возвращаем пустой массив
    return []
  }
}

/**
 * Обрабатывает текст и возвращает список товаров
 */
export async function processText(text: string): Promise<ProcessedProduct[]> {
  try {
    const response = await apiClient.post('/api/orders/parse-text/', {
      text: text,
    })

    const data = response.data
    console.log('API response for parse-text:', data)

    // Если API возвращает массив товаров напрямую
    if (Array.isArray(data)) {
      const products = data.map((item: any) => ({
        name: item.name || item.product_name || '',
        quantity: item.quantity || 1,
        unit: item.unit || undefined,
        products: item.products || item.matched_products || [],
      }))
      console.log('Parsed products from API (array):', products)
      if (products.length > 0) {
        return products
      }
    }

    // Если API возвращает объект с полем items или products
    if (data.items || data.products) {
      const items = data.items || data.products
      const products = items.map((item: any) => ({
        name: item.name || item.product_name || '',
        quantity: item.quantity || 1,
        unit: item.unit || undefined,
        products: item.products || item.matched_products || [],
      }))
      console.log('Parsed products from API (object):', products)
      if (products.length > 0) {
        return products
      }
    }

    // Если API не возвращает структурированные данные, парсим текст локально
    console.log('API не вернул данные, используем локальный парсинг')
    const parsed = parseTextToProducts(text)
    console.log('Locally parsed products:', parsed)
    return parsed.map(item => ({
      ...item,
      products: [], // Будет заполнено при поиске
    }))
  } catch (error: any) {
    console.error('Ошибка обработки текста:', error)
    console.error('Error details:', error.response?.data || error.message)
    // В случае ошибки парсим текст локально
    console.log('Используем локальный парсинг из-за ошибки API')
    const parsed = parseTextToProducts(text)
    console.log('Locally parsed products (fallback):', parsed)
    return parsed.map(item => ({
      ...item,
      products: [],
    }))
  }
}

/**
 * Обрабатывает изображение и возвращает список товаров
 * Если OCR вернул текст, но парсинг не нашел товары, возвращает пустой массив
 * (текст будет показан в модальном окне для редактирования)
 */
export async function processImage(file: File): Promise<ProcessedProduct[]> {
  const formData = new FormData()
  formData.append('image', file)

  try {
    const response = await apiClient.post('/api/orders/parse-image/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    const data = response.data
    console.log('API response for parse-image:', data)

    // Если API возвращает массив товаров напрямую
    if (Array.isArray(data)) {
      const products = data.map((item: any) => ({
        name: item.name || item.product_name || '',
        quantity: item.quantity || 1,
        unit: item.unit || undefined,
        products: item.products || item.matched_products || [],
      }))
      console.log('Parsed products from API (array):', products)
      if (products.length > 0) {
        return products
      }
    }

    // Если API возвращает объект с полем items или products
    if (data.items || data.products) {
      const items = data.items || data.products
      const products = items.map((item: any) => ({
        name: item.name || item.product_name || '',
        quantity: item.quantity || 1,
        unit: item.unit || undefined,
        products: item.products || item.matched_products || [],
      }))
      console.log('Parsed products from API (object):', products)
      if (products.length > 0) {
        return products
      }
    }

    // Если API возвращает текст (OCR результат), парсим его локально
    if (data.text || data.ocr_text) {
      const text = data.text || data.ocr_text
      console.log('API вернул текст из OCR, парсим локально:', text)
      if (text && text.trim()) {
        const parsed = parseTextToProducts(text)
        console.log('Locally parsed products from OCR text:', parsed)
        if (parsed.length > 0) {
          return parsed.map(item => ({
            ...item,
            products: [], // Будет заполнено при поиске
          }))
        } else {
          console.warn('OCR вернул текст, но парсинг не нашел товары:', text)
          // Возвращаем пустой массив, чтобы показать сообщение пользователю
          return []
        }
      } else {
        console.warn('API вернул пустой текст из OCR')
        return []
      }
    }

    console.warn('API не вернул данные для изображения, возвращаем пустой массив')
    return []
  } catch (error: any) {
    console.error('Ошибка обработки изображения:', error)
    console.error('Error details:', error.response?.data || error.message)
    
    // Если API вернул ошибку, но есть текст в ответе, пытаемся его использовать
    if (error.response?.data?.text || error.response?.data?.ocr_text) {
      const text = error.response.data.text || error.response.data.ocr_text
      console.log('Найден текст в ответе об ошибке, парсим:', text)
      if (text && text.trim()) {
        const parsed = parseTextToProducts(text)
        console.log('Parsed products from error response text:', parsed)
        if (parsed.length > 0) {
          return parsed.map(item => ({
            ...item,
            products: [],
          }))
        }
      }
    }
    
    // Если ничего не получилось, возвращаем пустой массив (не бросаем ошибку)
    console.warn('Не удалось обработать изображение, возвращаем пустой массив')
    return []
  }
}

/**
 * Нормализует название для поиска (улучшенная версия)
 */
function normalizeSearchQuery(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    // Удаляем специальные символы, но оставляем буквы, цифры и пробелы
    .replace(/[^\w\sа-яё0-9]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Извлекает ключевые слова из названия для более гибкого поиска
 */
function extractKeywords(name: string): string[] {
  const normalized = normalizeSearchQuery(name)
  const words = normalized.split(/\s+/).filter(w => w.length > 2)
  
  // Если название короткое, возвращаем его целиком
  if (words.length <= 2) {
    return [normalized]
  }
  
  // Возвращаем полное название и первые ключевые слова
  return [normalized, words[0], words.slice(0, 2).join(' ')]
}

/**
 * Ищет товары по названию и возвращает все найденные варианты
 * Использует несколько стратегий поиска для лучших результатов
 */
export async function searchProductsByName(name: string): Promise<any[]> {
  try {
    // Нормализуем название
    const normalizedName = normalizeSearchQuery(name)
    console.log(`Searching products for: "${name}" (normalized: "${normalizedName}")`)
    
    // Стратегия 1: Поиск по полному названию
    let searchUrl = `/api/catalog/search/?q=${encodeURIComponent(normalizedName)}`
    console.log(`Search strategy 1 - full name: ${searchUrl}`)
    let response = await apiClient.get(searchUrl)
    let results = response.data.results || response.data || []
    console.log(`Found ${results.length} products with full name search`)
    
    // Если нашли результаты, возвращаем их
    if (results.length > 0) {
      return results
    }
    
    // Стратегия 2: Поиск по ключевым словам
    const keywords = extractKeywords(name)
    for (const keyword of keywords) {
      if (keyword === normalizedName) continue // Уже искали
      
      searchUrl = `/api/catalog/search/?q=${encodeURIComponent(keyword)}`
      console.log(`Search strategy 2 - keyword: ${searchUrl}`)
      try {
        response = await apiClient.get(searchUrl)
        const keywordResults = response.data.results || response.data || []
        console.log(`Found ${keywordResults.length} products with keyword "${keyword}"`)
        
        if (keywordResults.length > 0) {
          // Объединяем результаты, убирая дубликаты
          const existingIds = new Set(results.map((r: any) => r.id))
          keywordResults.forEach((r: any) => {
            if (!existingIds.has(r.id)) {
              results.push(r)
              existingIds.add(r.id)
            }
          })
        }
      } catch (err) {
        console.warn(`Error searching with keyword "${keyword}":`, err)
      }
    }
    
    // Стратегия 3: Поиск по части названия (если название длинное)
    if (results.length === 0 && normalizedName.length > 5) {
      const firstPart = normalizedName.split(' ')[0]
      if (firstPart.length > 3) {
        searchUrl = `/api/catalog/search/?q=${encodeURIComponent(firstPart)}`
        console.log(`Search strategy 3 - first word: ${searchUrl}`)
        try {
          response = await apiClient.get(searchUrl)
          const partialResults = response.data.results || response.data || []
          console.log(`Found ${partialResults.length} products with partial search`)
          results = partialResults
        } catch (err) {
          console.warn(`Error searching with partial name:`, err)
        }
      }
    }
    
    console.log(`Total found ${results.length} products for "${name}"`)
    return results
  } catch (error: any) {
    console.error('Ошибка поиска товаров:', error)
    console.error('Error details:', error.response?.data || error.message)
    return []
  }
}
