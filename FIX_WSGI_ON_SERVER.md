# 🔧 ИСПРАВЛЕНИЕ wsgi.py НА СЕРВЕРЕ

## ✅ Хорошая новость
Запросы **ДОХОДЯТ** до Python приложения! Но используется простой тестовый код вместо FastAPI.

## ❌ Проблема
В `wsgi.py` на сервере находится простой тестовый код:
```python
def application(environ, start_response):
    start_response('200 OK', [('Content-Type', 'text/plain')])
    return ['It works!']
```

Вместо правильного импорта FastAPI приложения.

## ✅ Решение: Обновить wsgi.py на сервере

### Вариант 1: Заменить файл через FTP/File Manager

1. Скачайте правильный `wsgi.py` из репозитория GitHub
2. Загрузите его на сервер в `/home/kdlqemdxxn/zakup.one/wsgi.py`
3. Замените существующий файл

### Вариант 2: Создать правильный wsgi.py на сервере

Выполните на сервере:

```bash
cd /home/kdlqemdxxn/zakup.one
cat > wsgi.py << 'ENDOFFILE'
"""
WSGI entry point for Spaceship hosting
Улучшенная версия для production
"""
import os
import sys
from pathlib import Path

# Определяем корневую директорию проекта
project_root = Path(__file__).parent.absolute()

# Добавляем корневую директорию в Python path
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

# Меняем рабочую директорию на корень проекта
os.chdir(str(project_root))

# Попытка активировать virtualenv (если существует)
activate_this = '/home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate_this.py'
if os.path.exists(activate_this):
    try:
        with open(activate_this) as f:
            exec(f.read(), {'__file__': activate_this})
    except Exception:
        # Если не удалось активировать, продолжаем без этого
        pass

# Загружаем переменные окружения из .env файла
env_file = project_root / '.env'
if env_file.exists():
    try:
        from dotenv import load_dotenv
        load_dotenv(str(env_file))
    except ImportError:
        # dotenv не установлен, пропускаем
        pass

# Создаем необходимые директории если их нет
uploads_dir = project_root / 'uploads'
downloads_dir = project_root / 'downloads'
for dir_path in [uploads_dir, downloads_dir]:
    try:
        dir_path.mkdir(exist_ok=True)
        # Устанавливаем права доступа (если возможно)
        os.chmod(str(dir_path), 0o777)
    except Exception:
        pass

# Импортируем приложение
try:
    from app.main import app
    application = app
except Exception as e:
    # Если импорт не удался, создаем простое приложение для отладки
    import traceback
    from fastapi import FastAPI, Request
    from fastapi.responses import JSONResponse
    
    error_app = FastAPI(title="ZAKUP.ONE - Error")
    
    @error_app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        debug_mode = os.getenv("DEBUG", "False").lower() == "true"
        return JSONResponse(
            status_code=500,
            content={
                "error": "Application initialization failed",
                "message": str(exc),
                "type": type(exc).__name__,
                "path": str(project_root),
                "env_exists": env_file.exists(),
                "traceback": traceback.format_exc() if debug_mode else "Enable DEBUG=true to see traceback"
            }
        )
    
    @error_app.get("/{path:path}")
    async def error_handler(path: str):
        debug_mode = os.getenv("DEBUG", "False").lower() == "true"
        return {
            "error": "Application initialization failed",
            "message": str(e),
            "type": type(e).__name__,
            "path": str(project_root),
            "env_exists": env_file.exists(),
            "traceback": traceback.format_exc() if debug_mode else "Enable DEBUG=true to see traceback"
        }
    
    application = error_app
ENDOFFILE

chmod 755 wsgi.py
```

### Вариант 3: Проверить текущий wsgi.py

Сначала посмотрите, что там сейчас:

```bash
cd /home/kdlqemdxxn/zakup.one
cat wsgi.py
```

Если там простой тестовый код - замените его на правильный (Вариант 2).

## 🔄 После обновления wsgi.py

### 1. Перезапустите приложение в Spaceship

1. Откройте панель Spaceship
2. Найдите ваше Python приложение
3. Нажмите **STOP**
4. Подождите 5 секунд
5. Нажмите **START** или **RESTART**
6. Подождите 10-15 секунд

### 2. Проверьте работу

```bash
curl https://zakup.one/api/v1/health
```

**Ожидаемый результат:**
```json
{"status":"ok","database":"connected"}
```

**Если ошибка импорта:**
- Проверьте что все зависимости установлены: `pip install -r requirements.txt`
- Проверьте что файл `app/main.py` существует
- Проверьте логи приложения в Spaceship

## 🔍 Диагностика

### Проверка 1: wsgi.py правильный?

```bash
cd /home/kdlqemdxxn/zakup.one
cat wsgi.py | grep -E "(from app.main import app|application = app)"
```

Должно показать:
```python
from app.main import app
application = app
```

### Проверка 2: app/main.py существует?

```bash
ls -la /home/kdlqemdxxn/zakup.one/app/main.py
```

### Проверка 3: Зависимости установлены?

```bash
cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
pip list | grep fastapi
```

Должно показать установленный fastapi.

### Проверка 4: Логи приложения

В панели Spaceship найдите логи приложения и проверьте:
- Есть ли ошибки при импорте `app`?
- Есть ли ошибки подключения к базе данных?

## 📋 Чеклист

- [ ] `wsgi.py` содержит `from app.main import app`
- [ ] `wsgi.py` содержит `application = app`
- [ ] Файл `app/main.py` существует
- [ ] Зависимости установлены (`pip install -r requirements.txt`)
- [ ] Приложение перезапущено в Spaceship
- [ ] `curl https://zakup.one/api/v1/health` возвращает JSON

## 🎯 Главное

**Проблема решена на 90%!** Запросы доходят до Python, нужно только заменить тестовый `wsgi.py` на правильный с импортом FastAPI.

После замены `wsgi.py` и перезапуска приложения все должно заработать!

