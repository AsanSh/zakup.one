/**
 * Утилиты для парсинга товаров из различных источников
 */

export interface ParsedProduct {
  name: string
  quantity: number
  unit?: string
}

/**
 * Исправляет частые ошибки OCR в рукописном тексте
 * Более консервативный подход - исправляем только явные ошибки
 */
function fixOCRErrors(text: string): string {
  return text
    // Нормализуем пробелы сначала
    .replace(/\s+/g, ' ')
    // Исправляем только явные ошибки в числах (когда цифра стоит рядом с цифрой)
    .replace(/(\d)[Чч](\d)/g, '$14$2') // Ч между цифрами = 4
    .replace(/(\d)[Оо](\d)/g, '$10$2') // О между цифрами = 0
    .replace(/(\d)[Зз](\d)/g, '$13$2') // З между цифрами = 3
    // Исправляем единицы измерения (нормализуем)
    .replace(/\bм\b/gi, 'м')
    .replace(/\bмешков?\b/gi, 'мешков')
    .replace(/\bмеш\b/gi, 'мешков')
    .replace(/\bкг\b/gi, 'кг')
    .replace(/\bшт\b/gi, 'шт')
    .replace(/\bштук\b/gi, 'шт')
    .replace(/\bт\b/gi, 'т')
    .replace(/\bтонн\b/gi, 'т')
    // Убираем лишние пробелы
    .trim()
}

/**
 * Парсит текст и извлекает названия товаров и количество
 * Примеры форматов:
 * - "Ротбанд 30 мешков"
 * - "Арматура А12 - 100 м"
 * - "Проволока вязальная - 50 кг"
 * - "арматура ф 16 34м" (рукописный текст)
 * - "ротбанд 10 мешков" (рукописный текст)
 */
export function parseTextToProducts(text: string): ParsedProduct[] {
  // Исправляем ошибки OCR
  const fixedText = fixOCRErrors(text)
  console.log('Original text:', text)
  console.log('Fixed text:', fixedText)
  
  const lines = fixedText.split('\n').filter(line => line.trim())
  const products: ParsedProduct[] = []

  // Единицы измерения для поиска
  const units = ['мешков', 'мешок', 'меш', 'кг', 'кг', 'м', 'метр', 'метров', 'шт', 'штук', 'штука', 'т', 'тонн', 'тонна', 'л', 'литр', 'литров']

  for (const line of lines) {
    let trimmed = line.trim()
    if (!trimmed) continue

    // Удаляем лишние символы в начале и конце
    trimmed = trimmed.replace(/^[^\wа-яё]+|[^\wа-яё\s]+$/gi, '').trim()
    if (!trimmed) continue

    // Паттерны для парсинга (улучшенные для рукописного текста)
    // 1. "Товар - количество единица" или "Товар количество единица"
    const pattern1 = /^(.+?)\s*[-–—]\s*(\d+(?:[.,]\d+)?)\s*([а-яА-Яa-zA-Z]+)?$/i
    // 2. "Товар количество единица" (без дефиса, более гибкий) - например "арматура ф 16 34м"
    const pattern2 = /^(.+?)\s+(\d+(?:[.,]?\d*)?)\s*([а-яА-Яa-zA-Z]+)?$/i
    // 3. "Товар количество" (без единицы) - например "ротбанд 10"
    const pattern3 = /^(.+?)\s+(\d+(?:[.,]?\d*)?)$/i
    // 4. "Товар" (только название, количество = 1)
    const pattern4 = /^(.+)$/i

    // Сначала пытаемся найти паттерн с единицей измерения в конце строки
    // Например: "арматура ф 16 34м" или "ротбанд 10 мешков"
    // Ищем единицу измерения в конце строки
    const unitAtEndMatch = trimmed.match(/\s*(\d+(?:[.,]?\d*)?)\s*([а-яА-Яa-zA-Z]+)$/i)
    
    if (unitAtEndMatch) {
      // Нашли число и единицу в конце
      const quantityStr = unitAtEndMatch[1]?.replace(',', '.') || '1'
      const quantity = parseFloat(quantityStr)
      let unit = unitAtEndMatch[2]?.trim().toLowerCase()
      
      // Название - все что до последнего числа и единицы
      const name = trimmed.substring(0, trimmed.lastIndexOf(unitAtEndMatch[0])).trim()
      
      // Нормализуем единицу
      if (unit) {
        if (unit.includes('меш')) unit = 'мешков'
        else if (unit.includes('кг') || unit.includes('килог')) unit = 'кг'
        else if (unit === 'м' || (unit.includes('м') && !unit.includes('меш'))) unit = 'м'
        else if (unit.includes('шт') || unit.includes('штук')) unit = 'шт'
        else if (unit === 'т' || (unit.includes('т') && !unit.includes('меш'))) unit = 'т'
      }
      
      if (name) {
        products.push({
          name: name.replace(/[^\w\sа-яё\-]/gi, ' ').replace(/\s+/g, ' ').trim(),
          quantity: isNaN(quantity) ? 1 : quantity,
          unit: unit || undefined,
        })
      }
    } else {
      // Стандартные паттерны
      const unitAtEndPattern = /^(.+?)\s+(\d+(?:[.,]?\d*)?)\s*([а-яА-Яa-zA-Z]+)$/i
      let match = trimmed.match(pattern1) || trimmed.match(pattern2) || trimmed.match(unitAtEndPattern) || trimmed.match(pattern3)
      
      if (match) {
        let name = match[1].trim()
        // Очищаем название от лишних символов, но сохраняем важные части
        name = name.replace(/[^\w\sа-яё\-]/gi, ' ').replace(/\s+/g, ' ').trim()
        
        const quantityStr = match[2]?.replace(',', '.') || '1'
        const quantity = parseFloat(quantityStr)
        let unit = match[3]?.trim().toLowerCase()
        
        // Если единица не найдена в группе, пытаемся найти её в строке
        if (!unit) {
          for (const u of units) {
            if (trimmed.toLowerCase().includes(u)) {
              unit = u
              break
            }
          }
        }
        
        // Нормализуем единицу
        if (unit) {
          if (unit.includes('меш')) unit = 'мешков'
          else if (unit.includes('кг') || unit.includes('килог')) unit = 'кг'
          else if (unit === 'м' || (unit.includes('м') && !unit.includes('меш'))) unit = 'м'
          else if (unit.includes('шт') || unit.includes('штук')) unit = 'шт'
          else if (unit === 'т' || (unit.includes('т') && !unit.includes('меш'))) unit = 'т'
        }
        
        if (name) {
          products.push({
            name,
            quantity: isNaN(quantity) ? 1 : quantity,
            unit: unit || undefined,
          })
        }
      } else {
        // Если не удалось распарсить стандартными паттернами, пытаемся найти число в строке
        // Ищем все числа в строке
        const allNumbers = trimmed.match(/\d+(?:[.,]\d+)?/g)
        if (allNumbers && allNumbers.length > 0) {
          // Берем последнее число как количество (обычно количество идет в конце)
          const lastNumber = allNumbers[allNumbers.length - 1]
          const quantity = parseFloat(lastNumber.replace(',', '.'))
          
          // Ищем единицу измерения после последнего числа
          let unit: string | undefined
          const afterLastNumber = trimmed.substring(trimmed.lastIndexOf(lastNumber) + lastNumber.length).trim()
          for (const u of units) {
            if (afterLastNumber.toLowerCase().includes(u)) {
              unit = u
              break
            }
          }
          
          // Нормализуем единицу
          if (unit) {
            if (unit.includes('меш')) unit = 'мешков'
            else if (unit.includes('кг') || unit.includes('килог')) unit = 'кг'
            else if (unit === 'м' || (unit.includes('м') && !unit.includes('меш'))) unit = 'м'
            else if (unit.includes('шт') || unit.includes('штук')) unit = 'шт'
            else if (unit === 'т' || (unit.includes('т') && !unit.includes('меш'))) unit = 'т'
          }
          
          // Удаляем последнее число и единицу из названия
          let name = trimmed
          if (unit) {
            name = name.replace(new RegExp(`\\s*${lastNumber}\\s*${unit}`, 'i'), '').trim()
          } else {
            name = name.replace(new RegExp(`\\s*${lastNumber}`, 'g'), '').trim()
          }
          
          // Если в названии остались другие числа, оставляем их (это часть названия товара)
          name = name.replace(/[^\w\sа-яё\-]/gi, ' ').replace(/\s+/g, ' ').trim()
          
          if (name) {
            products.push({
              name,
              quantity: isNaN(quantity) ? 1 : quantity,
              unit: unit || undefined,
            })
          }
        } else {
          // Если не удалось распарсить, добавляем как есть с количеством 1
          const simpleMatch = trimmed.match(pattern4)
          if (simpleMatch) {
            const name = simpleMatch[1].trim().replace(/[^\w\sа-яё\-]/gi, ' ').replace(/\s+/g, ' ').trim()
            if (name) {
              products.push({
                name,
                quantity: 1,
              })
            }
          }
        }
      }
    }
  }

  console.log('Parsed products:', products)
  return products
}

/**
 * Нормализует название товара для поиска
 */
export function normalizeProductName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\sа-яё]/gi, '')
}
