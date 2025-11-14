# 📦 Установка зависимостей - Полное руководство

## ✅ Файл requirements.txt на сервере!

Файл находится в `/zakup.one/requirements.txt` на сервере.

## 🔧 Варианты установки:

### ВАРИАНТ 1: Через панель Spaceship (РЕКОМЕНДУЕТСЯ)

#### Способ 1.1: Использовать "Run Pip Install"

1. В секции **"Configuration files"**
2. Убедитесь что в списке есть `requirements.txt`
   - Если нет: добавьте через поле "Add another file and press enter"
   - Введите: `requirements.txt` (только имя файла, без путей!)
3. Нажмите кнопку **"Run Pip Install"**
4. Дождитесь завершения

#### Способ 1.2: Использовать скрипт install_dependencies.py

1. В секции **"Execute python script"**
2. В поле "Enter the path to the script file" введите:
   ```
   install_dependencies.py
   ```
3. Нажмите кнопку **"Run Script"**

### ВАРИАНТ 2: Через SSH терминал

Выполните в терминале:

```bash
# Перейдите в директорию проекта
cd zakup.one

# Проверьте что файл есть
ls -la requirements.txt

# Убедитесь что вы в правильной директории
pwd

# Установите зависимости
python3 -m pip install -r requirements.txt
```

Если `python3 -m pip` не работает:

```bash
# Установите pip для python3
python3 -m ensurepip --upgrade

# Попробуйте снова
python3 -m pip install -r requirements.txt
```

### ВАРИАНТ 3: Использовать готовый скрипт

В терминале:

```bash
cd zakup.one
python3 install_dependencies.py
```

## 🔍 Диагностика проблем:

### Если файл не найден:

```bash
cd zakup.one
pwd
ls -la requirements.txt
ls -la | grep requirements
```

### Если pip не найден:

```bash
which python3
python3 --version
python3 -m pip --version
python3 -m ensurepip --upgrade
```

### Если установка не работает:

1. Проверьте права доступа:
   ```bash
   chmod 644 requirements.txt
   ```

2. Попробуйте установить по одной зависимости:
   ```bash
   python3 -m pip install fastapi
   ```

## ✅ Проверка после установки:

```bash
python3 -c "import fastapi; print('FastAPI установлен')"
python3 -c "import uvicorn; print('Uvicorn установлен')"
```

Или через браузер:
- https://zakup.one/health
- https://zakup.one/api/v1/health

## 📝 Примечания:

- Файл `requirements.txt` уже на сервере в `/zakup.one/`
- Скрипт `install_dependencies.py` загружен на сервер
- Используйте `python3 -m pip` вместо просто `pip`



