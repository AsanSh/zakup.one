# Рефакторинг проекта - Новая структура

## ✅ Выполнено

### 1. Реструктуризация проекта
Проект разделен на четкие модули:
- `src/admin/` - Админская часть
- `src/client/` - Клиентская часть
- `src/shared/` - Общие компоненты, типы, API, утилиты

### 2. Типизация TypeScript
- Созданы централизованные типы в `shared/types/index.ts`
- Все типы (`User`, `Product`, `Order`, `Supplier`, `CartItem`, и т.д.) определены в одном месте
- Удалены дублирующиеся интерфейсы из компонентов

### 3. API клиенты
- `shared/api/clientApi.ts` - API для клиентской части
- `shared/api/adminApi.ts` - API для админ-панели
- `shared/api/authApi.ts` - API для аутентификации
- Все API методы типизированы

### 4. Layout компоненты
- `client/components/ClientLayout.tsx` - Layout для клиентской части
- `admin/components/AdminLayout.tsx` - Layout для админ-панели с сайдбаром

### 5. Утилиты
- `shared/utils/formatters.ts` - Форматирование цен, дат
- `shared/utils/constants.ts` - Константы (статусы, цвета, метки)

### 6. Защищенные роуты
- `ProtectedRoute` - требует аутентификации
- `AdminRoute` - требует аутентификации и прав администратора

## 📁 Новая структура

```
src/
├── admin/                    # Админская часть
│   ├── components/
│   │   └── AdminLayout.tsx   # Layout с сайдбаром
│   ├── pages/                 # Страницы админ-панели
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminUsers.tsx
│   │   ├── AdminOrders.tsx
│   │   ├── AdminProducts.tsx
│   │   └── ...
│   ├── hooks/                 # Хуки для админки
│   └── utils/                 # Утилиты для админки
│
├── client/                    # Клиентская часть
│   ├── components/
│   │   └── ClientLayout.tsx   # Layout для клиентов
│   ├── pages/                 # Страницы клиентов
│   │   ├── Catalog.tsx        # (было Search.tsx)
│   │   ├── Cart.tsx
│   │   ├── OrderHistory.tsx  # (было Orders.tsx)
│   │   ├── OrderCreate.tsx
│   │   └── Profile.tsx
│   ├── hooks/                 # Хуки для клиентов
│   └── utils/                 # Утилиты для клиентов
│
├── shared/                    # Общие компоненты
│   ├── api/
│   │   ├── clientApi.ts       # API клиент для клиентов
│   │   ├── adminApi.ts        # API клиент для админов
│   │   ├── authApi.ts         # API для аутентификации
│   │   └── index.ts           # Экспорт всех API
│   ├── components/
│   │   ├── Login.tsx          # Компонент входа
│   │   └── Register.tsx       # Компонент регистрации
│   ├── types/
│   │   └── index.ts           # Все типы TypeScript
│   └── utils/
│       ├── constants.ts       # Константы
│       └── formatters.ts      # Форматирование
│
├── store/                     # Zustand stores
│   ├── authStore.ts
│   └── cartStore.ts
│
└── App.tsx                    # Главный роутер
```

## 🔄 Миграция импортов

### Старые импорты → Новые

**API:**
```typescript
// Старое
import { api } from '../api/api'
await api.searchProducts(...)
await api.admin.getUsers()

// Новое
import { clientApi, adminApi } from '../../shared/api'
await clientApi.searchProducts(...)
await adminApi.getUsers()
```

**Типы:**
```typescript
// Старое
interface Product { ... }

// Новое
import type { Product } from '../../shared/types'
```

**Утилиты:**
```typescript
// Старое
const formatPrice = (price: number) => { ... }

// Новое
import { formatPrice } from '../../shared/utils/formatters'
```

**Константы:**
```typescript
// Старое
const statusLabels = { ... }

// Новое
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../shared/utils/constants'
```

## 🚀 Преимущества новой структуры

1. **Четкое разделение** - админ и клиент изолированы
2. **Переиспользование** - общие компоненты в `shared/`
3. **Типизация** - все типы в одном месте
4. **Масштабируемость** - легко добавлять новые модули
5. **Поддерживаемость** - понятная структура

## 📝 Следующие шаги

1. ✅ Реструктуризация - выполнено
2. ✅ Типизация - выполнено
3. ✅ Layout компоненты - выполнено
4. ⏳ Обновление всех импортов в admin страницах - в процессе
5. ⏳ Обновление всех импортов в client страницах - в процессе
6. ⏳ Удаление старого `api/api.ts` - после обновления всех импортов
7. ⏳ Добавление loading states - в планах
8. ⏳ Оптимизация API endpoints на backend - в планах

