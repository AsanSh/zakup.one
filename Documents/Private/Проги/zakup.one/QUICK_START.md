# Быстрый старт ZAKUP.ONE

## Адреса приложения:

1. **Frontend (React)**: http://localhost:5173
   - Это основной интерфейс приложения
   - Здесь вы видите страницы входа, каталог товаров, корзину и т.д.

2. **Backend API**: http://localhost:8000
   - Это JSON API (то, что вы видите сейчас)
   - Используется для работы frontend

3. **Django Admin**: http://localhost:8000/admin
   - Админ-панель для управления данными
   - Логин: admin@zakup.one
   - Пароль: admin123

## Команды для работы:

### Переход в директорию проекта:
```bash
cd /Users/asanshirgebaev/Documents/Private/Проги/zakup.one/infra
```

### Просмотр статуса:
```bash
docker compose ps
```

### Перезапуск frontend:
```bash
docker compose restart frontend
```

### Перезапуск всего проекта:
```bash
docker compose down
docker compose up -d
```

### Просмотр логов:
```bash
docker compose logs frontend --tail 50
docker compose logs backend --tail 50
```

## Важно:

- **Frontend** работает на порту **5173** (http://localhost:5173)
- **Backend** работает на порту **8000** (http://localhost:8000)
- Все команды docker compose нужно выполнять из директории `/Users/asanshirgebaev/Documents/Private/Проги/zakup.one/infra`

## Если дизайн не обновляется:

1. Откройте http://localhost:5173 (НЕ localhost:8000!)
2. Нажмите Cmd+Shift+R (жесткая перезагрузка)
3. Или очистите кеш браузера через DevTools (F12)


