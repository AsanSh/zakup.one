# 🔧 Исправление ошибки 500

## ❌ Проблема:
Сайт возвращает ошибку 500 Internal Server Error

## 🔍 Возможные причины:

1. **Зависимости не установлены** - FastAPI, SQLAlchemy и другие пакеты отсутствуют
2. **Переменные окружения не настроены** - SECRET_KEY, DATABASE_URL и т.д.
3. **База данных не создана** - SQLite файл отсутствует или недоступен
4. **Ошибка импорта модулей** - проблемы с путями или отсутствующими файлами
5. **Права доступа** - папки uploads/downloads недоступны для записи

## ✅ Решение:

### ШАГ 1: Проверьте логи в панели Spaceship

В панели Spaceship найдите раздел **"Logs"** или **"Application Logs"** и посмотрите:
- Какая именно ошибка возникает
- На каком этапе происходит сбой
- Есть ли traceback с деталями

### ШАГ 2: Установите зависимости

Если зависимости не установлены, выполните:

**Через панель Spaceship:**
В секции "Execute python script" введите:
```
bash /home/kdlqemdxxn/zakup.one/install_dependencies_fixed.sh
```

**Или через SSH:**
```bash
cd /home/kdlqemdxxn/zakup.one
bash install_dependencies_fixed.sh
```

### ШАГ 3: Проверьте переменные окружения

В панели Spaceship в секции "Environment variables" убедитесь что есть:

- `DATABASE_URL` = `sqlite:///./zakup.db`
- `SECRET_KEY` = (любая случайная строка)
- `DEBUG` = `False` (или `True` для отладки)
- `CORS_ORIGINS` = `["https://www.zakup.one","https://zakup.one"]`

### ШАГ 4: Создайте базу данных

Если используется SQLite, база данных создастся автоматически при первом запросе.
Убедитесь что папка доступна для записи:

```bash
cd /home/kdlqemdxxn/zakup.one
chmod 777 .
touch zakup.db
chmod 666 zakup.db
```

### ШАГ 5: Проверьте права доступа

```bash
cd /home/kdlqemdxxn/zakup.one
chmod 755 .
chmod 755 app
chmod 777 uploads
chmod 777 downloads
```

### ШАГ 6: Проверьте работу через health endpoints

После исправлений проверьте:

1. **Простой health check:**
   ```
   https://zakup.one/health
   ```
   Должен вернуть: `{"status": "ok", "message": "API is running"}`

2. **API health check:**
   ```
   https://zakup.one/api/v1/health
   ```
   Должен вернуть: `{"status": "ok", "database": "connected"}`

## 🐛 Если ошибка сохраняется:

### Включите DEBUG режим

В переменных окружения установите:
- `DEBUG` = `True`

Это покажет детальный traceback ошибки.

### Проверьте wsgi.py

Убедитесь что `wsgi.py` находится в корне проекта и содержит правильный код.

### Проверьте структуру файлов

Убедитесь что все файлы на месте:
- `wsgi.py` в корне
- `app/` директория с кодом
- `requirements.txt` в корне
- `frontend/dist/` с собранным frontend

## 📞 Если ничего не помогает:

1. Скопируйте полный текст ошибки из логов Spaceship
2. Проверьте что все зависимости установлены: `pip list`
3. Проверьте что Python версия правильная: `python3 --version`
4. Убедитесь что Entry Point указан как `wsgi:application`



