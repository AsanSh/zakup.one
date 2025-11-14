# ✅ Правильная команда для установки зависимостей

## 🔍 Проблема:

Система не может найти `requirements.txt` даже когда вы в правильной директории.

## ✅ РЕШЕНИЕ: Используйте полный абсолютный путь!

### Выполните в SSH терминале:

```bash
# Сначала проверьте где находится файл
cd /home/kdlqemdxxn/zakup.one
pwd
ls -la requirements.txt

# Если файл есть, установите с полным путем
/home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/pip install -r /home/kdlqemdxxn/zakup.one/requirements.txt
```

### Или используйте переменную окружения:

```bash
cd /home/kdlqemdxxn/zakup.one
REQUIREMENTS_FILE="/home/kdlqemdxxn/zakup.one/requirements.txt"
/home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/pip install -r "$REQUIREMENTS_FILE"
```

### С активацией виртуального окружения:

```bash
cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
pip install -r /home/kdlqemdxxn/zakup.one/requirements.txt
deactivate
```

## 🔍 Если файл все еще не найден:

Проверьте реальное расположение:

```bash
# Найдите файл
find /home/kdlqemdxxn -name "requirements.txt" 2>/dev/null

# Проверьте структуру директории
ls -la /home/kdlqemdxxn/
ls -la /home/kdlqemdxxn/zakup.one/
```

## 💡 Альтернатива: Через панель Spaceship

Если терминал не работает, используйте панель:

1. **Configuration files** → добавьте `requirements.txt`
2. Нажмите **"Run Pip Install"**

Панель должна автоматически использовать правильные пути.



