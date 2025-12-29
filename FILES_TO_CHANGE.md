# ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ

## Основные файлы:

1. **/opt/zakup/frontend/src/components/Toast.tsx** (новый)
   - Компонент для toast-уведомлений

2. **/opt/zakup/frontend/src/pages/ProductsPage.tsx** (изменение)
   - Полная переработка страницы товаров:
     - Sticky header таблицы
     - Улучшенный поиск с debounce
     - Dropdown сортировки
     - Разделение названия на имя и метки
     - Состояния loading/empty/error
     - Адаптивность

## Вспомогательные компоненты (если понадобятся):

3. **/opt/zakup/frontend/src/components/SortDropdown.tsx** (новый, опционально)
   - Dropdown для сортировки

4. **/opt/zakup/frontend/src/components/ProductBadges.tsx** (новый, опционально)
   - Компонент для отображения меток товара

