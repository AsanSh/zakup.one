# 🔧 Исправление проблем в терминале

## ❌ Проблемы:

1. `pip` и `pip3` не найдены
2. `python3 -m pip` не может найти `requirements.txt`

## ✅ Решение:

### ШАГ 1: Проверьте где вы находитесь и есть ли файл

```bash
pwd
ls -la requirements.txt
ls -la | grep requirements
```

### ШАГ 2: Если файл не найден, проверьте правильную директорию

```bash
# Проверьте структуру
ls -la

# Если файла нет, возможно он в другой директории
find ~ -name "requirements.txt" 2>/dev/null
```

### ШАГ 3: Установка зависимостей

Если файл найден, используйте:

```bash
cd zakup.one
python3 -m pip install -r requirements.txt
```

Если `python3 -m pip` не работает, попробуйте найти Python:

```bash
which python3
python3 --version

# Попробуйте установить pip для python3
python3 -m ensurepip --upgrade
python3 -m pip install -r requirements.txt
```

### ШАГ 4: Альтернатива - через панель Spaceship

Если терминал не работает, используйте панель Spaceship:

1. В секции **"Configuration files"**
2. Удалите старую запись (если есть)
3. Добавьте: `requirements.txt` (только имя файла)
4. Нажмите **"Run Pip Install"**

## 🔍 Диагностика:

Выполните эти команды для диагностики:

```bash
cd zakup.one
pwd
ls -la requirements.txt
python3 --version
which python3
python3 -m pip --version
```



