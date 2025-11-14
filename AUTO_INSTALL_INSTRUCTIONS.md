# ✅ Автоматическая установка зависимостей

## 🔧 Что было сделано:

1. ✅ Загружен `requirements.txt` на сервер
2. ✅ Создан скрипт `install_remote.sh` для автоматической установки
3. ✅ Скрипт загружен на сервер с правами на выполнение

## 📋 Варианты установки:

### ВАРИАНТ 1: Через панель Spaceship (РЕКОМЕНДУЕТСЯ)

В панели Spaceship в секции **"Execute python script"**:

1. В поле "Enter the path to the script file" введите:
   ```
   bash /home/kdlqemdxxn/zakup.one/install_remote.sh
   ```
2. Нажмите **"Run Script"**

### ВАРИАНТ 2: Через SSH терминал

Если у вас есть SSH доступ, выполните:

```bash
cd /home/kdlqemdxxn/zakup.one
bash install_remote.sh
```

### ВАРИАНТ 3: Через панель "Configuration files"

1. В секции **"Configuration files"**
2. Убедитесь что в списке есть: `requirements.txt`
3. Нажмите **"Run Pip Install"**

## 🔍 Проверка после установки:

```bash
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
python -c "import fastapi; print('FastAPI installed')"
deactivate
```

Или через браузер:
- https://zakup.one/health
- https://zakup.one/api/v1/health



