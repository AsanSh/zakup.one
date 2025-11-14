# ✅ Финальное решение для установки зависимостей

## ❌ Проблема со скриптом:

Скрипт `install_dependencies.py` не может быть найден системой, так как Spaceship использует виртуальное окружение и другую структуру путей.

## ✅ РЕШЕНИЕ: Используйте прямое выполнение команды

### ВАРИАНТ 1: Через панель "Configuration files" (САМЫЙ ПРОСТОЙ)

1. В секции **"Configuration files"**
2. Убедитесь что в списке есть: `requirements.txt`
   - Если нет: удалите старую запись
   - В поле "Add another file and press enter" введите: `requirements.txt`
   - Нажмите "+ Add"
3. Нажмите кнопку **"Run Pip Install"**
4. Дождитесь завершения

### ВАРИАНТ 2: Через терминал SSH (НАДЕЖНЫЙ)

Подключитесь к серверу через SSH и выполните:

```bash
cd /home/kdlqemdxxn/zakup.one
ls -la requirements.txt
/home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/pip install -r requirements.txt
```

Или используйте активацию виртуального окружения:

```bash
cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
pip install -r requirements.txt
deactivate
```

### ВАРИАНТ 3: Через панель "Execute python script" с полным путем

В секции **"Execute python script"** введите:

```
/home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/pip install -r /home/kdlqemdxxn/zakup.one/requirements.txt
```

**НО:** Секция "Execute python script" может не поддерживать прямые команды pip.

## 🎯 РЕКОМЕНДАЦИЯ:

**Используйте ВАРИАНТ 1** - через кнопку "Run Pip Install" в панели. Это самый простой и надежный способ.

Если это не работает, используйте **ВАРИАНТ 2** через SSH терминал с полным путем к pip из виртуального окружения.

## 🔍 Проверка после установки:

```bash
/home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/python -c "import fastapi; print('OK')"
```

Или через браузер:
- https://zakup.one/health
- https://zakup.one/api/v1/health



