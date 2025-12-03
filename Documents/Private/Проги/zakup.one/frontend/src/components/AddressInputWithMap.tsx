import { useEffect, useRef, useState } from 'react'

interface AddressInputWithMapProps {
  value: string
  onChange: (address: string) => void
  onLocationChange?: (lat: number, lng: number) => void
}

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export default function AddressInputWithMap({ value, onChange, onLocationChange }: AddressInputWithMapProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const autocompleteRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [mapError, setMapError] = useState<string | null>(null)

  useEffect(() => {
    let attempts = 0
    const maxAttempts = 50 // 5 секунд максимум
    let timeoutId: NodeJS.Timeout | null = null

    // Проверяем, загружена ли Google Maps API
    const checkGoogleMaps = () => {
      attempts++
      
      // Проверяем наличие ошибки загрузки
      if ((window as any).googleMapsError) {
        setMapError('Google Maps API не загружен. Пожалуйста, проверьте настройки API ключа в index.html')
        setMapLoaded(false)
        return
      }
      
      if (window.google && window.google.maps && window.google.maps.places) {
        setMapLoaded(true)
        setMapError(null)
        initializeMap()
      } else if (attempts < maxAttempts) {
        // Проверяем каждые 100мс
        timeoutId = setTimeout(checkGoogleMaps, 100)
      } else {
        // Если не загрузилось за 5 секунд, показываем ошибку
        setMapError('Google Maps API не загружен. Убедитесь, что API ключ установлен в index.html')
        setMapLoaded(false)
      }
    }

    // Начинаем проверку через небольшую задержку
    timeoutId = setTimeout(checkGoogleMaps, 500)
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  const initializeMap = () => {
    if (!inputRef.current || !mapRef.current || !window.google) return

    // Инициализируем карту (центр по умолчанию - Бишкек, Кыргызстан)
    const defaultCenter = { lat: 42.8746, lng: 74.5698 }
    
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
    })

    // Инициализируем Places Autocomplete
    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'kg' }, // Ограничение для Кыргызстана
    })

    // Обработчик выбора адреса
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace()
      
      if (!place.geometry || !place.geometry.location) {
        console.error('Место не найдено')
        return
      }

      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      }

      const address = place.formatted_address || place.name || value

      // Обновляем адрес
      onChange(address)

      // Обновляем карту
      mapInstanceRef.current.setCenter(location)
      mapInstanceRef.current.setZoom(16)

      // Удаляем старый маркер
      if (markerRef.current) {
        markerRef.current.setMap(null)
      }

      // Создаем новый маркер
      markerRef.current = new window.google.maps.Marker({
        position: location,
        map: mapInstanceRef.current,
        title: address,
        animation: window.google.maps.Animation.DROP,
      })

      setSelectedLocation(location)
      
      // Вызываем callback с координатами
      if (onLocationChange) {
        onLocationChange(location.lat, location.lng)
      }
    })

    // Если есть значение, пытаемся найти его на карте
    if (value) {
      geocodeAddress(value)
    }
  }

  const geocodeAddress = (address: string) => {
    if (!window.google || !window.google.maps) return

    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ address }, (results: any[], status: string) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location
        const lat = location.lat()
        const lng = location.lng()

        mapInstanceRef.current.setCenter({ lat, lng })
        mapInstanceRef.current.setZoom(16)

        if (markerRef.current) {
          markerRef.current.setMap(null)
        }

        markerRef.current = new window.google.maps.Marker({
          position: { lat, lng },
          map: mapInstanceRef.current,
          title: address,
        })

        setSelectedLocation({ lat, lng })
        
        if (onLocationChange) {
          onLocationChange(lat, lng)
        }
      }
    })
  }

  // Обновляем карту при изменении значения (если пользователь вводит вручную)
  useEffect(() => {
    if (value && mapLoaded && !selectedLocation) {
      const timeoutId = setTimeout(() => {
        geocodeAddress(value)
      }, 1000) // Задержка для избежания слишком частых запросов

      return () => clearTimeout(timeoutId)
    }
  }, [value, mapLoaded])

  return (
    <div className="space-y-3">
      {/* Поле ввода с автозаполнением */}
      <div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Начните вводить адрес..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          onClick={(e) => e.stopPropagation()}
        />
        <p className="text-xs text-gray-500 mt-1">
          {mapError 
            ? 'Введите адрес вручную (Google Maps недоступен)' 
            : 'Начните вводить адрес, и система предложит варианты'}
        </p>
      </div>

      {/* Карта или сообщение об ошибке */}
      <div className="relative">
        {mapError ? (
          <div className="h-64 bg-gray-50 rounded-md border border-gray-200 flex flex-col items-center justify-center p-4">
            <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-gray-600 text-center mb-1">{mapError}</p>
            <p className="text-xs text-gray-500 text-center">
              Вы можете ввести адрес вручную в поле выше
            </p>
          </div>
        ) : !mapLoaded ? (
          <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
            <div className="text-gray-500 text-sm">Загрузка карты...</div>
          </div>
        ) : (
          <>
            <div
              ref={mapRef}
              className="w-full h-64 rounded-md border border-gray-300"
            />
            {selectedLocation && (
              <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Адрес подтвержден на карте
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

