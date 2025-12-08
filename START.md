# Инструкция по запуску проекта ZAKUP.ONE

## Требования

- Docker и Docker Compose установлены
- Порты 8000, 5173, 5432, 9200 свободны

## Шаги запуска

### 1. Создайте файл с переменными окружения

```bash
cd infra
cp env/backend.example.env env/backend.env
```

Отредактируйте `env/backend.env` и установите `SECRET_KEY` (можно сгенерировать случайную строку).

### 2. Запустите проект

```bash
cd infra
docker compose up -d --build
```

Или если у вас старая версия Docker:

```bash
docker-compose up -d --build
```

### 3. Выполните миграции и создайте суперпользователя

```bash
# Миграции
docker compose exec backend python manage.py migrate

# Создание суперпользователя
docker compose exec backend python manage.py createsuperuser
```

### 4. Инициализируйте Elasticsearch индекс

```bash
docker compose exec backend python manage.py shell
```

В Python shell:
```python
from apps.search.services import ElasticsearchService
service = ElasticsearchService()
service.create_index()
service.reindex_all()
```

## Адреса для доступа

После успешного запуска:

- **Frontend (React)**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin
- **API документация**: http://localhost:8000/api/ (если настроена)
- **Elasticsearch**: http://localhost:9200

## Полезные команды

```bash
# Просмотр логов
docker compose logs -f

# Остановка
docker compose down

# Пересборка
docker compose up -d --build

# Вход в контейнер backend
docker compose exec backend bash

# Вход в контейнер frontend
docker compose exec frontend sh
```

## Если Docker не установлен

Установите Docker Desktop для macOS:
https://www.docker.com/products/docker-desktop/

После установки перезапустите терминал и повторите команды запуска.


