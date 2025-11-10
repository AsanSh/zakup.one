# Тестирование авторизации - Упрощенная версия

## 🧪 Для тестирования авторизации

Создана упрощенная версия для отладки проблем с авторизацией.

## 📋 Файлы для тестирования

1. **`frontend/src/shared/components/SimpleLogin.tsx`** - Упрощенная форма логина
2. **`frontend/src/App.simple.tsx`** - Упрощенная версия App.tsx
3. **`frontend/src/main.simple.tsx`** - Упрощенная версия main.tsx

## 🚀 Как использовать

### Вариант 1: Временно заменить файлы

```bash
cd frontend/src

# Создайте резервные копии
cp App.tsx App.original.tsx
cp main.tsx main.original.tsx

# Замените на упрощенные версии
cp App.simple.tsx App.tsx
cp main.simple.tsx main.tsx
```

### Вариант 2: Изменить импорты вручную

В `main.tsx` замените:
```typescript
import App from './App.simple.tsx'
```

## 🔍 Что проверять

### 1. Консоль браузера (F12 → Console)

После попытки входа должны появиться логи:
- `🔍 Trying to login with: { email, password }`
- `✅ Login successful, user: {...}`
- `🔄 Redirecting to /admin` или `/search`

### 2. Вкладка Network (F12 → Network)

Проверьте запрос `/api/v1/auth/login`:
- **Status:** должен быть `200 OK`
- **Request Headers:** должны содержать `Content-Type: application/x-www-form-urlencoded`
- **Response:** должен содержать `access_token` и `user`

### 3. LocalStorage (F12 → Application → Local Storage)

После успешного входа должен появиться ключ `auth-storage` с данными:
```json
{
  "state": {
    "token": "...",
    "isAuthenticated": true,
    "user": {
      "id": 1,
      "email": "admin@zakup.one",
      "is_admin": true,
      ...
    }
  }
}
```

## 🧪 Тестовая кнопка

В форме логина есть кнопка **"🧪 Тест: Войти как админ (без API)"**, которая:
- Обходит API запрос
- Создает тестового пользователя в localStorage
- Позволяет проверить работу роутинга без backend

## 🔧 Отладка

### Проверка данных в консоли

Нажмите кнопку **"🔍 Проверить данные в консоли"** - она выведет:
- Содержимое localStorage
- Состояние authStore
- Текущего пользователя

### Очистка данных

Нажмите кнопку **"🗑️ Очистить LocalStorage"** для полной очистки и перезагрузки страницы.

## 📝 Команды для проверки

### В консоли браузера (F12):

```javascript
// Проверить localStorage
console.log('LocalStorage:', localStorage)
console.log('Auth Storage:', localStorage.getItem('auth-storage'))

// Проверить authStore
import { useAuthStore } from './store/authStore'
console.log('Auth Store:', useAuthStore.getState())

// Очистить все
localStorage.clear()
location.reload()
```

## ✅ После успешного тестирования

1. Верните оригинальные файлы:
   ```bash
   cp App.original.tsx App.tsx
   cp main.original.tsx main.tsx
   ```

2. Или удалите `.simple.tsx` файлы если они больше не нужны

## 🐛 Возможные проблемы

### Проблема: "API недоступен"
**Решение:** Используйте кнопку "🧪 Тест: Войти как админ (без API)"

### Проблема: "Не происходит редирект"
**Решение:** 
1. Проверьте консоль на ошибки
2. Проверьте localStorage
3. Попробуйте очистить localStorage и войти снова

### Проблема: "Пользователь не определяется как админ"
**Решение:**
1. Проверьте `user.is_admin` в консоли
2. Убедитесь, что в базе данных пользователь имеет `is_admin = true`

## 📊 Ожидаемое поведение

1. ✅ Вход с `admin@zakup.one` / `admin123` → редирект на `/admin`
2. ✅ Вход с обычным пользователем → редирект на `/search`
3. ✅ После входа данные сохраняются в localStorage
4. ✅ После перезагрузки страницы пользователь остается авторизованным
5. ✅ Выход очищает localStorage и редиректит на `/login`

