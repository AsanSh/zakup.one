# ZAKUP.ONE

B2B платформа для снабженцев строительных компаний.

## Структура проекта

- `backend/` - Django + DRF API
- `frontend/` - React + TypeScript + Vite + Tailwind
- `infra/` - Docker конфигурация

## Запуск проекта

1. Скопируйте примеры env файлов:
```bash
cp infra/env/backend.example.env infra/env/backend.env
```

2. Запустите через Docker Compose:
```bash
cd infra
docker-compose up --build
```

3. Создайте суперпользователя:
```bash
docker-compose exec backend python manage.py createsuperuser
```

4. Откройте в браузере:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Admin панель: http://localhost:8000/admin

## Разработка

См. `RULES_ZAKUP_ONE.md` для детальных правил работы с проектом.



