# 🔧 Исправление проблем с установкой зависимостей

## ❌ Проблемы:

1. **В панели Spaceship:** система не может найти `requirements.txt`
2. **В терминале SSH:** команда `pip` не найдена

## ✅ Решения:

### Проблема 1: Путь к requirements.txt в панели

В панели Spaceship в секции **"Configuration files"**:

1. **Удалите** текущую запись `requirements.txt` из списка (если есть)
2. В поле "Add another file and press enter" введите просто:
   ```
   requirements.txt
   ```
   (БЕЗ `./` и БЕЗ `zakup.one/` - просто имя файла!)
3. Нажмите **"+ Add"**
4. Нажмите **"Run Pip Install"**

**Важно:** Если приложение настроено с рабочей директорией `zakup.one`, то система будет искать файл относительно этой директории, поэтому нужно указать просто `requirements.txt`.

### Проблема 2: pip не найден в терминале

В SSH терминале используйте:

```bash
cd zakup.one
python3 -m pip install -r requirements.txt
```

Или:

```bash
cd zakup.one
pip3 install -r requirements.txt
```

### Альтернатива: Проверьте версию Python

```bash
cd zakup.one
python3 --version
which python3
python3 -m pip --version
```

## 📋 Правильная последовательность действий:

### В панели Spaceship:

1. **Configuration files:**
   - Удалите старую запись (если есть)
   - Добавьте: `requirements.txt` (только имя файла!)
   - Нажмите "Run Pip Install"

2. **Environment variables:**
   - Добавьте все необходимые переменные
   - Нажмите "SAVE"

### В SSH терминале (если панель не работает):

```bash
cd zakup.one
python3 -m pip install -r requirements.txt
```

## 🔍 Проверка:

После установки проверьте:

```bash
cd zakup.one
python3 -c "import fastapi; print('FastAPI установлен')"
```

Или через браузер:
- https://zakup.one/health
- https://zakup.one/api/v1/health



