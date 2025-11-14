# 🚀 Полное руководство по деплою на Spaceship

## 📋 Стек технологий

- **Frontend**: React + TypeScript + Vite
- **Backend**: FastAPI (Python 3.11)
- **База данных**: PostgreSQL
- **Хостинг**: Spaceship
- **Домен**: zakup.one

---

## ✅ ШАГ 1: Подготовка проекта локально

### 1.1 Сборка Frontend

```bash
cd frontend
npm install
npm run build
```

**Автоматически после сборки:**
- ✅ Создается `frontend/dist/` с собранными файлами
- ✅ Автоматически создается `deploy/frontend/dist/` (копия для деплоя)

**Проверка**: Убедитесь что создалась папка `frontend/dist/` с файлами:
- `index.html`
- `assets/` (с JS и CSS файлами)

**ВАЖНО:** После сборки запустите проверку:
```bash
cd ..
python3 verify_frontend.py
```

Скрипт проверит:
- ✅ Наличие `frontend/dist/`
- ✅ Наличие `index.html`
- ✅ Наличие `assets/` с файлами
- ✅ Конфигурацию в `app/main.py`
- ✅ MIME типы файлов
- ✅ Конфигурацию в `wsgi.py` и `.htaccess`

### 1.2 Проверка Backend

```bash
# Активируйте виртуальное окружение
source venv/bin/activate  # или python -m venv venv

# Установите зависимости
pip install -r requirements.txt

# Проверьте что приложение запускается
python -m uvicorn app.main:app --reload
```

**Проверка**: Откройте `http://localhost:8000/api/v1/health` - должен вернуть `{"status": "ok"}`

### 1.3 Подготовка файлов для деплоя

Убедитесь что у вас есть:
- ✅ `wsgi.py` - точка входа для Spaceship
- ✅ `requirements.txt` - зависимости Python
- ✅ `.env.production.example` - пример переменных окружения
- ✅ `frontend/dist/` - собранный frontend
- ✅ `deploy/frontend/dist/` - автоматически создается после `npm run build`

**ВАЖНО:** После `npm run build` автоматически создается папка `deploy/frontend/dist/` - это готовая копия для деплоя!

---

## 📤 ШАГ 2: Загрузка файлов на сервер

### 2.1 Через FTP (FileZilla, WinSCP и т.д.)

**FTP данные:**
- Host: `ftp.zakup.one` или IP сервера
- Username: `www.zakup.one`
- Password: `ParolJok9@`
- Port: `21`

**Структура на сервере:**
```
/home/kdlqemdxxn/zakup.one/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── core/
│   ├── api/
│   ├── models/
│   └── services/
├── frontend/
│   └── dist/          ← Собранный frontend
├── wsgi.py            ← Точка входа
├── requirements.txt   ← Зависимости
├── .env               ← Переменные окружения (создать на сервере)
├── .htaccess          ← Конфигурация Apache
└── uploads/           ← Папка для загрузок (создать)
```

### 2.2 Что загружать:

**Обязательно:**
- Вся папка `app/` (со всеми подпапками)
- Вся папка `frontend/dist/` (собранный frontend)
- `wsgi.py`
- `requirements.txt`
- `.htaccess` (если есть)

**Не загружать:**
- `node_modules/`
- `venv/`
- `.git/`
- `*.pyc`, `__pycache__/`
- `frontend/src/` (только `dist/`)

---

## ⚙️ ШАГ 3: Настройка на сервере

### 3.1 Создание .env файла

На сервере создайте файл `.env` в корне проекта:

```env
# База данных
DATABASE_URL=postgresql://user:password@localhost:5432/zakup_one

# Безопасность
SECRET_KEY=ваш-секретный-ключ-минимум-32-символа
DEBUG=False

# CORS
CORS_ORIGINS=["https://zakup.one","https://www.zakup.one"]

# Пути
UPLOAD_DIR=/home/kdlqemdxxn/zakup.one/uploads
DOWNLOADS_DIR=/home/kdlqemdxxn/zakup.one/downloads

# Email (если используется)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
```

**Как создать через File Manager:**
1. Зайдите в панель Spaceship
2. Откройте File Manager
3. Перейдите в `/home/kdlqemdxxn/zakup.one/`
4. Создайте новый файл `.env`
5. Вставьте содержимое выше (замените на свои значения)

### 3.2 Создание необходимых папок

```bash
# Через SSH или File Manager создайте:
mkdir -p uploads
mkdir -p downloads
chmod 777 uploads
chmod 777 downloads
```

---

## 📦 ШАГ 4: Установка зависимостей Python

### Вариант A: Через панель Spaceship (РЕКОМЕНДУЕТСЯ)

1. Зайдите в панель Spaceship
2. Найдите раздел **"Configuration files"**
3. Убедитесь что в списке есть `requirements.txt`
   - Если нет: добавьте его
4. Нажмите кнопку **"Run Pip Install"**
5. Дождитесь завершения (может занять 3-5 минут)

### Вариант B: Через SSH

```bash
cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
pip install -r requirements.txt
deactivate
```

### Вариант C: Через Python скрипт

Создайте файл `install_deps.py` на сервере:

```python
#!/usr/bin/env python3
import subprocess
import sys
import os

os.chdir('/home/kdlqemdxxn/zakup.one')
venv_pip = '/home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/pip'

result = subprocess.run(
    [venv_pip, 'install', '-r', 'requirements.txt'],
    capture_output=True,
    text=True
)

print(result.stdout)
if result.stderr:
    print("Errors:", result.stderr, file=sys.stderr)
sys.exit(result.returncode)
```

Затем в панели Spaceship в разделе "Execute python script" укажите путь: `install_deps.py`

---

## 🔧 ШАГ 5: Настройка Spaceship

### 5.1 Настройки Python приложения

В панели Spaceship найдите настройки Python приложения:

**Application settings:**
- **Application root**: `/home/kdlqemdxxn/zakup.one`
- **Application startup file**: `wsgi.py`
- **Application Entry point**: `application`
- **Python version**: `3.11`

### 5.2 Настройка переменных окружения

В панели Spaceship найдите раздел "Environment Variables" и добавьте:

```
DEBUG=False
SECRET_KEY=ваш-секретный-ключ
DATABASE_URL=postgresql://user:password@localhost:5432/zakup_one
CORS_ORIGINS=["https://zakup.one","https://www.zakup.one"]
```

**Или** используйте файл `.env` (см. шаг 3.1)

### 5.3 Настройка .htaccess

Убедитесь что файл `.htaccess` существует и содержит:

```apache
# Разрешить доступ к статическим файлам
<FilesMatch "\.(ico|txt|xml|json|png|jpg|jpeg|gif|css|js|woff|woff2|ttf|eot|svg)$">
    Order allow,deny
    Allow from all
</FilesMatch>

# Прокси для API
RewriteEngine On
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ /wsgi.py/$1 [L]

# SPA routing - отдаем index.html для всех остальных запросов
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /frontend/dist/index.html [L]
```

---

## 🗄️ ШАГ 6: Настройка базы данных

### 6.1 Создание базы данных

Через панель Spaceship или SSH:

```sql
CREATE DATABASE zakup_one;
CREATE USER zakup_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE zakup_one TO zakup_user;
```

### 6.2 Обновление DATABASE_URL в .env

```env
DATABASE_URL=postgresql://zakup_user:your_password@localhost:5432/zakup_one
```

### 6.3 Применение миграций

```bash
cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
alembic upgrade head
deactivate
```

---

## ✅ ШАГ 7: Проверка и тестирование

### 7.1 Проверка health endpoints

Откройте в браузере:

1. **Backend health:**
   ```
   https://zakup.one/health
   ```
   Ожидаемый ответ: `{"status": "ok", "service": "zakup.one"}`

2. **API health:**
   ```
   https://zakup.one/api/v1/health
   ```
   Ожидаемый ответ: `{"status": "ok", "api": "v1"}`

3. **Frontend:**
   ```
   https://zakup.one/
   ```
   Должен открыться интерфейс приложения

### 7.2 Проверка логов

В панели Spaceship найдите раздел "Logs" и проверьте:
- Нет ли ошибок при запуске
- Правильно ли импортируется приложение
- Подключается ли к базе данных

---

## 🐛 ШАГ 8: Устранение проблем

### Проблема: 500 Internal Server Error

**Причины:**
1. Не установлены зависимости → Установите через "Run Pip Install"
2. Ошибка в `wsgi.py` → Проверьте логи
3. Неправильный путь к приложению → Проверьте настройки в панели
4. Ошибка импорта → Проверьте что все файлы загружены

**Решение:**
```bash
# Проверьте импорт вручную
cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
python -c "from app.main import app; print('OK')"
```

### Проблема: Frontend не загружается

**Причины:**
1. `frontend/dist/` не загружен → Загрузите папку
2. Неправильный `.htaccess` → Проверьте правила
3. Неправильные пути в `app/main.py` → Проверьте конфигурацию

**Решение:**
- Убедитесь что `frontend/dist/index.html` существует
- Проверьте что в `app/main.py` правильный путь к `frontend/dist`

### Проблема: База данных не подключается

**Причины:**
1. Неправильный `DATABASE_URL` → Проверьте `.env`
2. База данных не создана → Создайте через панель
3. Неправильные права доступа → Проверьте пользователя БД

**Решение:**
```bash
# Проверьте подключение
python -c "from app.core.database import engine; print('OK')"
```

### Проблема: Статические файлы не загружаются

**Причины:**
1. Неправильный путь в `app/main.py` → Проверьте конфигурацию
2. Неправильный `.htaccess` → Проверьте правила для статики

**Решение:**
- Убедитесь что `app/main.py` правильно монтирует `/assets`
- Проверьте что файлы в `frontend/dist/assets/` доступны

---

## 🚀 ШАГ 9: Финальная проверка

### Чеклист:

- [ ] Frontend собран (`frontend/dist/` существует)
- [ ] Все файлы загружены на сервер
- [ ] `.env` файл создан с правильными значениями
- [ ] Зависимости установлены (`pip install -r requirements.txt`)
- [ ] База данных создана и настроена
- [ ] Миграции применены (`alembic upgrade head`)
- [ ] Настройки Spaceship правильные
- [ ] `/health` возвращает `{"status": "ok"}`
- [ ] `/api/v1/health` возвращает `{"status": "ok"}`
- [ ] Frontend открывается в браузере
- [ ] API endpoints работают

---

## 📝 Дополнительные ресурсы

### Упрощенная версия для тестирования

Если полная версия не работает, используйте упрощенную:

1. Загрузите `app/main_simple.py` → переименуйте в `app/main.py`
2. Загрузите `wsgi_simple.py` → переименуйте в `wsgi.py`
3. Загрузите `requirements_simple.txt` → переименуйте в `requirements.txt`
4. Установите зависимости (всего 4 пакета)

Подробнее: см. `SIMPLE_DEPLOYMENT.md`

### Автоматическое развертывание

Используйте `deploy_simple.php` для автоматического развертывания:

1. Загрузите `deploy_simple.php` на сервер
2. Откройте `https://zakup.one/deploy_simple.php`
3. Нажмите "Автоматическое развертывание"

---

## 🎯 Быстрый старт (TL;DR)

```bash
# 1. Локально: соберите frontend
cd frontend && npm run build

# 2. Загрузите на сервер через FTP:
# - app/
# - frontend/dist/
# - wsgi.py
# - requirements.txt

# 3. В панели Spaceship:
# - Добавьте requirements.txt в "Configuration files"
# - Нажмите "Run Pip Install"
# - Настройте Python app: root=/home/kdlqemdxxn/zakup.one, entry=wsgi:application

# 4. Создайте .env файл на сервере

# 5. Проверьте: https://zakup.one/health
```

---

## 📞 Поддержка

Если что-то не работает:

1. Проверьте логи в панели Spaceship
2. Проверьте что все файлы загружены
3. Проверьте что зависимости установлены
4. Используйте упрощенную версию для тестирования
5. Обратитесь в поддержку Spaceship

---

**Удачи с деплоем! 🚀**

