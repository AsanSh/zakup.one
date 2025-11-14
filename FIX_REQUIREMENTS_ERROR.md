# 🔧 Исправление ошибки с requirements.txt

## ❌ Ошибка:
```
ERROR: Could not open requirements file: [Errno 2] No such file or directory: 'zakup.one/requirements.txt'
```

## 🔍 Причина:
Система ищет файл по пути `zakup.one/requirements.txt`, но приложение запускается из папки `zakup.one`, поэтому нужно указать относительный путь.

## ✅ Решение:

### Вариант 1: Исправить путь в списке файлов

1. **Удалите** текущую запись `requirements.txt` из списка (нажмите "Delete" рядом с файлом)
2. В поле "Add another file and press enter" введите: **`./requirements.txt`**
3. Нажмите кнопку **"+ Add"**
4. Нажмите **"Run Pip Install"**

### Вариант 2: Использовать секцию "Execute python script"

Если вариант 1 не работает, используйте секцию **"Execute python script"**:

1. В поле "Enter the path to the script file" введите:
   ```
   pip install -r requirements.txt
   ```
2. Нажмите кнопку **"Run Script"**

### Вариант 3: Установить через терминал (если доступен)

Если в панели Spaceship есть терминал или SSH доступ:

```bash
cd zakup.one
pip install -r requirements.txt
```

## 📝 Проверка после установки:

После успешной установки проверьте:
- https://zakup.one/health
- https://zakup.one/api/v1/health



