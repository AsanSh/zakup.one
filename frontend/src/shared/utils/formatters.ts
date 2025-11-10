/**
 * Утилиты для форматирования данных
 */

/**
 * Форматирование цены
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price) + ' сом'
}

/**
 * Форматирование даты
 */
export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'N/A'
  }
}

/**
 * Форматирование даты (короткий формат)
 */
export const formatDateShort = (dateString: string | undefined | null): string => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  } catch {
    return 'N/A'
  }
}

/**
 * Форматирование числа товаров
 */
export const formatProductCount = (count: number): string => {
  if (count === 1) return 'товар'
  if (count >= 2 && count <= 4) return 'товара'
  return 'товаров'
}

