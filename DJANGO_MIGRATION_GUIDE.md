# 🔄 РУКОВОДСТВО ПО МИГРАЦИИ НА DJANGO

## ✅ Что уже сделано

1. ✅ Создана структура Django проекта
2. ✅ Настроены settings.py
3. ✅ Создана модель User
4. ✅ Созданы API endpoints для аутентификации
5. ✅ Настроен JWT
6. ✅ Создан wsgi.py для Django

## 📋 Что нужно доделать

### 1. Создать остальные модели
- [ ] Product, Supplier (apps/products/models.py)
- [ ] Order, OrderItem (apps/orders/models.py)
- [ ] DeliveryTracking, PriceListUpdate и др.

### 2. Создать API endpoints
- [ ] Products API (apps/products/)
- [ ] Orders API (apps/orders/)
- [ ] Admin API (apps/admin_panel/)

### 3. Перенести сервисы
- [ ] price_import.py → Django management commands или сервисы
- [ ] price_list_downloader.py
- [ ] email_service.py → Django email

### 4. Настроить миграции
- [ ] Создать миграции: `python manage.py makemigrations`
- [ ] Применить миграции: `python manage.py migrate`

### 5. Настроить статические файлы
- [ ] Настроить STATIC_ROOT и MEDIA_ROOT
- [ ] Настроить SPA routing

## 🚀 Быстрый старт

### 1. Установить зависимости

```bash
pip install -r requirements_django.txt
```

### 2. Создать миграции

```bash
cd django_project
python manage.py makemigrations
python manage.py migrate
```

### 3. Создать суперадминистратора

```bash
python manage.py createsuperuser
```

### 4. Запустить сервер

```bash
python manage.py runserver
```

## 📝 Отличия от FastAPI

### Аутентификация
- FastAPI: OAuth2PasswordRequestForm
- Django: JWT через djangorestframework-simplejwt

### Модели
- FastAPI: SQLAlchemy
- Django: Django ORM

### API
- FastAPI: Декораторы @router.post()
- Django: ViewSets или APIView

### URL routing
- FastAPI: app.include_router()
- Django: path() в urls.py

## ⚠️ Важно

1. **База данных**: Можно использовать ту же PostgreSQL/SQLite
2. **API endpoints**: Остаются теми же (`/api/v1/...`)
3. **Frontend**: Не требует изменений
4. **JWT токены**: Совместимы с текущим frontend

## 🔧 Настройка для Spaceship

1. Обновить `wsgi.py` в корне проекта (уже создан)
2. Обновить `requirements.txt` на `requirements_django.txt`
3. Запустить миграции на сервере
4. Создать суперадминистратора
