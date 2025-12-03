# Настройка Google Maps API

## Как получить API ключ:

1. Перейдите на https://console.cloud.google.com/
2. Создайте новый проект или выберите существующий
3. Включите следующие API:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**
4. Перейдите в "Credentials" (Учетные данные)
5. Создайте новый API ключ
6. Ограничьте ключ по домену (для безопасности):
   - HTTP referrers: `localhost:5173/*`, `yourdomain.com/*`

## Установка ключа:

1. Откройте файл `frontend/index.html`
2. Найдите строку:
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places&callback=initMap" async defer></script>
   ```
3. Замените `YOUR_API_KEY` на ваш реальный ключ

## Альтернативный способ (через переменную окружения):

Можно использовать переменную окружения `VITE_GOOGLE_MAPS_API_KEY`:

1. Создайте файл `.env` в папке `frontend/`:
   ```
   VITE_GOOGLE_MAPS_API_KEY=ваш_ключ_здесь
   ```

2. Обновите `index.html` для использования переменной:
   ```html
   <script>
     const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY';
   </script>
   <script src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`} async defer></script>
   ```

## Функции:

- ✅ Автозаполнение адреса (Google Places Autocomplete)
- ✅ Отображение карты с выбранным адресом
- ✅ Маркер на карте для подтверждения адреса
- ✅ Геокодирование адреса в координаты
- ✅ Ограничение поиска по Кыргызстану

## Важно:

- Не коммитьте API ключ в репозиторий
- Используйте ограничения ключа для безопасности
- Для продакшена используйте переменные окружения

