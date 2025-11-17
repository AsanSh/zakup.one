# ✅ Следующие шаги после распаковки frontend/dist

## 📋 Текущий статус:
✅ Frontend распакован: `/home/kdlqemdxxn/zakup.one/frontend/dist/`
- `index.html` ✅
- `assets/` ✅

---

## 🚀 ШАГ 1: Проверьте структуру проекта на сервере

Убедитесь что на сервере есть следующая структура:

```
/home/kdlqemdxxn/zakup.one/
├── app/                    ← Backend приложение
│   ├── __init__.py
│   ├── main.py
│   ├── core/
│   ├── api/
│   ├── models/
│   └── services/
├── frontend/
│   └── dist/               ← ✅ УЖЕ ЕСТЬ (распаковано)
│       ├── index.html
│       └── assets/
├── wsgi.py                 ← Точка входа для Spaceship
├── requirements.txt        ← Зависимости Python
└── .env                    ← Переменные окружения (нужно создать)
```

---

## 📦 ШАГ 2: Загрузите backend файлы (если еще не загружены)

### Что нужно загрузить:

1. **Вся папка `app/`** (со всеми подпапками):
   - `app/__init__.py`
   - `app/main.py`
   - `app/core/`
   - `app/api/`
   - `app/models/`
   - `app/services/`

2. **Файлы в корне проекта:**
   - `wsgi.py` - **ОБЯЗАТЕЛЬНО!**
   - `requirements.txt` - **ОБЯЗАТЕЛЬНО!**
   - `.htaccess` (если есть)

### Как загрузить:

**Через File Manager:**
1. Загрузите папку `app/` в `/home/kdlqemdxxn/zakup.one/`
2. Загрузите `wsgi.py` в `/home/kdlqemdxxn/zakup.one/`
3. Загрузите `requirements.txt` в `/home/kdlqemdxxn/zakup.one/`

**Или через FTP:**
- Используйте FileZilla/WinSCP
- Подключитесь к серверу
- Загрузите файлы

---

## ⚙️ ШАГ 3: Создайте .env файл

В панели File Manager создайте файл `.env` в корне проекта:

**Путь:** `/home/kdlqemdxxn/zakup.one/.env`

**Содержимое:**
```env
# База данных
DATABASE_URL=postgresql://user:password@localhost:5432/zakup_one

# Безопасность
SECRET_KEY=ваш-секретный-ключ-минимум-32-символа-случайные-символы
DEBUG=False

# CORS
CORS_ORIGINS=["https://zakup.one","https://www.zakup.one"]

# Пути
UPLOAD_DIR=/home/kdlqemdxxn/zakup.one/uploads
DOWNLOADS_DIR=/home/kdlqemdxxn/zakup.one/downloads
```

**Важно:** Замените:
- `DATABASE_URL` - на реальные данные вашей БД
- `SECRET_KEY` - на случайную строку (минимум 32 символа)

---

## 📦 ШАГ 4: Установите зависимости Python

### В панели Spaceship:

1. Найдите раздел **"Configuration files"**
2. Убедитесь что в списке есть `requirements.txt`
   - Если нет: добавьте его
3. Нажмите кнопку **"Run Pip Install"**
4. Дождитесь завершения (3-5 минут)

### Или через SSH (если доступен):

```bash
cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
pip install -r requirements.txt
deactivate
```

---

## 🔧 ШАГ 5: Настройте Spaceship

В панели Spaceship найдите настройки Python приложения:

**Application settings:**
- **Application root**: `/home/kdlqemdxxn/zakup.one`
- **Application startup file**: `wsgi.py`
- **Application Entry point**: `application`
- **Python version**: `3.11`

**Сохраните настройки!**

---

## 📁 ШАГ 6: Создайте необходимые папки

Через File Manager или SSH создайте:

```bash
mkdir -p /home/kdlqemdxxn/zakup.one/uploads
mkdir -p /home/kdlqemdxxn/zakup.one/downloads
chmod 777 /home/kdlqemdxxn/zakup.one/uploads
chmod 777 /home/kdlqemdxxn/zakup.one/downloads
```

---

## ✅ ШАГ 7: Проверка работы

### 1. Health check:
Откройте в браузере:
```
https://zakup.one/health
```
**Ожидаемый ответ:** `{"status": "ok", "service": "zakup.one"}`

### 2. API health:
```
https://zakup.one/api/v1/health
```
**Ожидаемый ответ:** `{"status": "ok", "api": "v1"}`

### 3. Frontend:
```
https://zakup.one/
```
**Ожидаемый результат:** Открывается интерфейс приложения

---

## 🐛 Если что-то не работает:

### Ошибка 500?

1. **Проверьте логи** в панели Spaceship
2. **Проверьте что зависимости установлены:**
   - В панели Spaceship → Configuration files → Run Pip Install
3. **Проверьте что `wsgi.py` существует:**
   - Должен быть в `/home/kdlqemdxxn/zakup.one/wsgi.py`
4. **Проверьте настройки Spaceship:**
   - Application root правильный?
   - Entry point: `application`?

### Frontend не загружается?

1. **Проверьте путь в `app/main.py`:**
   - Должен указывать на `frontend/dist`
2. **Проверьте `.htaccess`:**
   - Должен быть настроен для SPA routing

### База данных не подключается?

1. **Проверьте `DATABASE_URL` в `.env`**
2. **Создайте базу данных** через панель Spaceship
3. **Примените миграции:**
   ```bash
   alembic upgrade head
   ```

---

## 📋 Чеклист готовности:

- [ ] Frontend распакован (`frontend/dist/` существует) ✅
- [ ] Backend загружен (`app/` существует)
- [ ] `wsgi.py` загружен
- [ ] `requirements.txt` загружен
- [ ] `.env` файл создан
- [ ] Зависимости установлены (Run Pip Install)
- [ ] Настройки Spaceship правильные
- [ ] Папки `uploads/` и `downloads/` созданы
- [ ] `/health` работает
- [ ] `/api/v1/health` работает
- [ ] Frontend открывается

---

## 🎯 Быстрый чеклист (что делать сейчас):

1. ✅ Frontend распакован - **ГОТОВО**
2. ⏳ Загрузите `app/`, `wsgi.py`, `requirements.txt`
3. ⏳ Создайте `.env` файл
4. ⏳ Установите зависимости (Run Pip Install)
5. ⏳ Настройте Spaceship
6. ⏳ Проверьте работу

---

**Следующий шаг:** Загрузите backend файлы (`app/`, `wsgi.py`, `requirements.txt`) на сервер!

