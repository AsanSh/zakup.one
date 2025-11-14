# ✅ Правильная установка зависимостей

## ❌ Проблема:

Секция "Execute python script" ожидает **Python скрипт**, а не bash команду!

## ✅ РЕШЕНИЕ:

### ВАРИАНТ 1: Использовать Python скрипт (РЕКОМЕНДУЕТСЯ)

В панели Spaceship в секции **"Execute python script"** введите:

```
install_deps.py
```

Или с полным путем:

```
/home/kdlqemdxxn/zakup.one/install_deps.py
```

Нажмите **"Run Script"**

### ВАРИАНТ 2: Через панель "Configuration files"

1. В секции **"Configuration files"**
2. Убедитесь что в списке есть: `requirements.txt`
   - Если нет: удалите старую запись
   - В поле "Add another file and press enter" введите: `requirements.txt`
   - Нажмите "+ Add"
3. Нажмите кнопку **"Run Pip Install"**

### ВАРИАНТ 3: Через SSH терминал

Если у вас есть SSH доступ:

```bash
cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
pip install -r requirements.txt
deactivate
```

## 📋 Что делает install_deps.py:

1. ✅ Проверяет наличие `requirements.txt`
2. ✅ Использует правильный pip из виртуального окружения
3. ✅ Обновляет pip до последней версии
4. ✅ Устанавливает все зависимости из `requirements.txt`
5. ✅ Проверяет установку основных пакетов (FastAPI, Uvicorn, SQLAlchemy)

## 🔍 После установки проверьте:

1. **Health check:**
   ```
   https://zakup.one/health
   ```
   Должен вернуть: `{"status": "ok", "message": "API is running"}`

2. **API Health:**
   ```
   https://zakup.one/api/v1/health
   ```
   Должен вернуть: `{"status": "ok", "database": "connected"}`

## ⚠️ Важно:

- Файл `install_deps.py` уже загружен на сервер
- Используйте **ВАРИАНТ 1** - просто введите `install_deps.py` в поле "Execute python script"
- Не используйте `bash` команды в секции "Execute python script"!



