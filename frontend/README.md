# ZAKUP.ONE Frontend

Фронтенд приложение для платформы ZAKUP.ONE

## Технологии

- **React 18** с TypeScript
- **Vite** - сборщик
- **React Router** - маршрутизация
- **Zustand** - управление состоянием
- **Tailwind CSS** - стилизация
- **Axios** - HTTP клиент
- **Lucide React** - иконки

## Установка

```bash
cd frontend
npm install
```

## Запуск

```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:5467

## Сборка для продакшена

```bash
npm run build
```

## Структура проекта

```
frontend/
├── src/
│   ├── api/           # API клиент
│   ├── components/    # Компоненты
│   ├── pages/         # Страницы
│   ├── store/         # Zustand stores
│   ├── App.tsx        # Главный компонент
│   └── main.tsx       # Точка входа
├── public/            # Статические файлы
└── index.html         # HTML шаблон
```

## Основные страницы

- `/login` - Вход в систему
- `/register` - Регистрация
- `/search` - Поиск товаров
- `/cart` - Корзина
- `/orders` - История заявок
- `/orders/create` - Оформление заявки

## API

Фронтенд подключается к бэкенду через прокси (настроен в `vite.config.ts`).

API URL: `http://localhost:8000/api/v1`

