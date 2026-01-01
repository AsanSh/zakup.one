import { useState, useEffect, useRef } from 'react'

interface YandexAddressInputProps {
  value: string
  onChange: (address: string) => void
  onLocationChange?: (lat: number, lng: number) => void
  placeholder?: string
  className?: string
  error?: string
}

interface SuggestItem {
  value: string
  data: {
    name: string
    description: string
    geo_lat?: string
    geo_lon?: string
  }
}

export default function YandexAddressInput({
  value,
  onChange,
  onLocationChange,
  placeholder = 'Начните вводить адрес...',
  className = '',
  error
}: YandexAddressInputProps) {
  const [suggestions, setSuggestions] = useState<SuggestItem[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Закрываем подсказки при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Функция для получения подсказок от Яндекс Suggest API
  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLoading(true)
    try {
      // Всегда добавляем "Бишкек, Кыргызстан" для лучших результатов
      let searchQuery = query.trim()
      const lowerQuery = searchQuery.toLowerCase()
      
      // Если в запросе нет упоминания Бишкека, добавляем его
      if (!lowerQuery.includes('бишкек') && !lowerQuery.includes('bishkek') && !lowerQuery.includes('bish')) {
        searchQuery = `Бишкек, Кыргызстан, ${searchQuery}`
      } else if (!lowerQuery.includes('кыргызстан') && !lowerQuery.includes('kyrgyzstan') && !lowerQuery.includes('kg')) {
        // Если есть Бишкек, но нет Кыргызстана, добавляем
        if (lowerQuery.startsWith('бишкек') || lowerQuery.startsWith('bishkek')) {
          searchQuery = `Бишкек, Кыргызстан, ${searchQuery.replace(/^бишкек[, ]*/i, '').replace(/^bishkek[, ]*/i, '')}`
        } else {
          searchQuery = `Бишкек, Кыргызстан, ${searchQuery}`
        }
      }
      
      // Сначала пробуем Geocoder API (более надежный для адресов)
      await fetchSuggestionsViaGeocoder(searchQuery)
      
      // Также пробуем Suggest API параллельно для дополнительных результатов
      try {
        const suggestResponse = await fetch(
          `https://suggest-maps.yandex.ru/v1/suggest?apikey=81614ef6-1f7f-4808-ad6a-7866dca2a480&text=${encodeURIComponent(searchQuery)}&lang=ru_RU&results=10&type=address`
        )

        if (suggestResponse.ok) {
          const suggestData = await suggestResponse.json()
          if (suggestData.results && Array.isArray(suggestData.results) && suggestData.results.length > 0) {
            // Объединяем результаты с Geocoder
            setSuggestions(prev => {
              const combined = [...prev, ...suggestData.results]
              // Удаляем дубликаты по значению
              const unique = combined.filter((item, index, self) => 
                index === self.findIndex(t => t.value === item.value)
              )
              return unique.slice(0, 10)
            })
            setShowSuggestions(true)
          }
        }
      } catch (suggestError) {
        console.log('Suggest API не доступен, используем только Geocoder')
      }
    } catch (error) {
      console.error('Ошибка получения подсказок:', error)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Альтернативный метод через Geocoder API
  const fetchSuggestionsViaGeocoder = async (query: string) => {
    try {
      // Улучшенный запрос для Бишкека
      let searchQuery = query.trim()
      const lowerQuery = searchQuery.toLowerCase()
      
      if (!lowerQuery.includes('бишкек') && !lowerQuery.includes('bishkek')) {
        searchQuery = `Бишкек, Кыргызстан, ${searchQuery}`
      } else if (!lowerQuery.includes('кыргызстан') && !lowerQuery.includes('kyrgyzstan')) {
        searchQuery = `Бишкек, Кыргызстан, ${searchQuery.replace(/^бишкек[, ]*/i, '').replace(/^bishkek[, ]*/i, '')}`
      }
      
      const response = await fetch(
        `https://geocode-maps.yandex.ru/1.x/?apikey=81614ef6-1f7f-4808-ad6a-7866dca2a480&geocode=${encodeURIComponent(searchQuery)}&format=json&lang=ru_RU&results=10&kind=street,house,locality`
      )

      if (!response.ok) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      const data = await response.json()
      
      if (
        data.response &&
        data.response.GeoObjectCollection &&
        data.response.GeoObjectCollection.featureMember
      ) {
        const suggestions = data.response.GeoObjectCollection.featureMember.map((item: any) => {
          const geoObject = item.GeoObject
          const metaData = geoObject.metaDataProperty?.GeocoderMetaData || {}
          const name = geoObject.name || ''
          const description = metaData.text || geoObject.description || ''
          const pos = geoObject.Point?.pos?.split(' ') || []
          
          // Форматируем адрес: если description содержит полный адрес, используем его
          let fullAddress = description || name
          if (description && description.includes('Бишкек')) {
            fullAddress = description
          } else if (name && description) {
            fullAddress = `${name}, ${description}`
          }
          
          return {
            value: fullAddress,
            data: {
              name: name,
              description: description,
              geo_lat: pos[1] || undefined,
              geo_lon: pos[0] || undefined,
            }
          }
        }).filter((item: any) => item.value && item.value.trim().length > 0)
        
        if (suggestions.length > 0) {
          setSuggestions(suggestions)
          setShowSuggestions(true)
        } else {
          setSuggestions([])
          setShowSuggestions(false)
        }
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    } catch (error) {
      console.error('Ошибка получения подсказок через Geocoder:', error)
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  // Обработчик изменения текста с debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    // Очищаем предыдущий таймаут
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Устанавливаем новый таймаут для запроса подсказок
    timeoutRef.current = setTimeout(() => {
      fetchSuggestions(newValue)
    }, 300) // Задержка 300мс для уменьшения количества запросов
  }

  // Обработчик выбора подсказки
  const handleSelectSuggestion = async (item: SuggestItem) => {
    const address = item.value
    onChange(address)
    setShowSuggestions(false)
    setSuggestions([])

    // Если есть координаты, вызываем callback
    if (item.data.geo_lat && item.data.geo_lon && onLocationChange) {
      const lat = parseFloat(item.data.geo_lat)
      const lng = parseFloat(item.data.geo_lon)
      onLocationChange(lat, lng)
    } else {
      // Если координат нет, пытаемся геокодировать адрес
      geocodeAddress(address)
    }
  }

  // Функция для геокодирования адреса
  const geocodeAddress = async (address: string) => {
    if (!onLocationChange) return

    try {
      // Используем Яндекс Геокодер API
      const response = await fetch(
        `https://geocode-maps.yandex.ru/1.x/?apikey=81614ef6-1f7f-4808-ad6a-7866dca2a480&geocode=${encodeURIComponent(address)}&format=json&lang=ru_RU`
      )

      if (!response.ok) {
        throw new Error('Ошибка геокодирования')
      }

      const data = await response.json()
      
      if (
        data.response &&
        data.response.GeoObjectCollection &&
        data.response.GeoObjectCollection.featureMember &&
        data.response.GeoObjectCollection.featureMember.length > 0
      ) {
        const geoObject = data.response.GeoObjectCollection.featureMember[0].GeoObject
        const pos = geoObject.Point.pos.split(' ')
        const lng = parseFloat(pos[0])
        const lat = parseFloat(pos[1])
        onLocationChange(lat, lng)
      }
    } catch (error) {
      console.error('Ошибка геокодирования:', error)
    }
  }

  // Обработчик фокуса
  const handleFocus = () => {
    if (value && suggestions.length > 0) {
      setShowSuggestions(true)
    } else if (value && value.length >= 3) {
      fetchSuggestions(value)
    }
  }

  // Обработчик клавиатуры
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false)
    } else if (e.key === 'ArrowDown' && suggestions.length > 0) {
      e.preventDefault()
      const firstSuggestion = suggestionsRef.current?.querySelector('button') as HTMLElement
      if (firstSuggestion) {
        firstSuggestion.focus()
      }
    }
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
      />
      
      {/* Индикатор загрузки */}
      {isLoading && (
        <div className="absolute right-3 top-2.5">
          <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}

      {/* Список подсказок */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectSuggestion(item)}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors"
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  const next = e.currentTarget.nextElementSibling as HTMLElement
                  if (next) next.focus()
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  const prev = e.currentTarget.previousElementSibling as HTMLElement
                  if (prev) prev.focus()
                  else inputRef.current?.focus()
                } else if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSelectSuggestion(item)
                }
              }}
            >
              <div className="font-medium text-gray-900 text-sm">{item.data.name}</div>
              {item.data.description && (
                <div className="text-xs text-gray-500 mt-0.5">{item.data.description}</div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Сообщение об ошибке */}
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}

      {/* Подсказка */}
      {!error && (
        <p className="mt-1 text-xs text-gray-500">
          Начните вводить адрес, и система предложит варианты
        </p>
      )}
    </div>
  )
}


