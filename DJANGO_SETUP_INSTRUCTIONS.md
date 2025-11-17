# 🚀 ИНСТРУКЦИЯ ПО НАСТРОЙКЕ DJANGO ПРОЕКТА

## ✅ Что сделано

1. ✅ Создана структура Django проекта
2. ✅ Перенесены все модели из SQLAlchemy в Django ORM
3. ✅ Настроен Django REST Framework
4. ✅ Созданы API endpoints (auth, products, orders, admin)
5. ✅ Настроена аутентификация с JWT
6. ✅ Обновлен wsgi.py для Django
7. ✅ Создан requirements_django.txt

## 📋 Следующие шаги

### 1. Установить зависимости

```bash
cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
pip install -r requirements_django.txt
```

### 2. Создать миграции

```bash
python manage.py makemigrations
```

### 3. Применить миграции

```bash
python manage.py migrate
```

### 4. Создать суперпользователя

```bash
python manage.py createsuperuser
```

Или используйте скрипт:
```bash
python manage.py shell
```

```python
from users.models import User
user = User.objects.create_superuser(
    email='asannameg@gmail.com',
    password='ParolJok6#',
    full_name='asannameg',
    company='ZAKUP.ONE'
)
```

### 5. Обновить настройки Spaceship

В панели Spaceship:
- **Startup file**: `zakup_one/wsgi.py` (или `wsgi.py` если в корне)
- **Entry point**: `application`
- **Python version**: `3.11`

### 6. Обновить .htaccess

`.htaccess` должен проксировать `/api/*` к Django. Текущий `.htaccess` должен работать, но можно упростить:

```apache
RewriteEngine On
Options -Indexes

# API к Django
RewriteCond %{REQUEST_URI} ^/api/ [NC]
RewriteRule ^(.*)$ wsgi.py [E=REQUEST_URI:$1,L,QSA]

# Статика
RewriteCond %{REQUEST_URI} ^/assets/(.*)$ [NC]
RewriteCond %{DOCUMENT_ROOT}/frontend/dist/assets/%1 -f
RewriteRule ^assets/(.*)$ /frontend/dist/assets/$1 [L]

# SPA routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteCond %{REQUEST_URI} !^/assets/
RewriteRule ^(.*)$ /frontend/dist/index.html [L]
```

## 🔄 Миграция данных (если нужно)

Если у вас уже есть данные в базе:

1. Экспортируйте данные из старой БД
2. Импортируйте в новую Django БД
3. Или используйте `python manage.py loaddata` если есть фикстуры

## ⚠️ Важные замечания

1. **API endpoints остаются теми же** - frontend не требует изменений
2. **База данных** - нужно создать новые миграции или мигрировать данные
3. **Файлы загрузок** - путь может измениться (теперь `media/` вместо `uploads/`)
4. **Импорт прайс-листов** - нужно перенести логику из `app/services/price_import.py`

## 🧪 Тестирование

```bash
# Запустить сервер разработки
python manage.py runserver

# Проверить API
curl http://localhost:8000/api/v1/health
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=asannameg@gmail.com&password=ParolJok6#"
```

## 📝 TODO (что нужно доделать)

- [ ] Перенести логику импорта прайс-листов из `app/services/price_import.py`
- [ ] Перенести логику скачивания прайс-листов из `app/services/price_list_downloader.py`
- [ ] Настроить email отправку через Django
- [ ] Добавить все остальные admin endpoints
- [ ] Протестировать все API endpoints

