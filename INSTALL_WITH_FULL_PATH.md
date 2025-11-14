# 🔧 Установка зависимостей с полным путем

## ❌ Проблема:

Даже с полным путем к pip система не может найти `requirements.txt`.

## ✅ РЕШЕНИЕ: Используйте полный путь к файлу!

### В SSH терминале выполните:

```bash
# Перейдите в правильную директорию
cd /home/kdlqemdxxn/zakup.one

# Проверьте что файл есть
ls -la requirements.txt
pwd

# Установите с полным путем к файлу
/home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/pip install -r /home/kdlqemdxxn/zakup.one/requirements.txt
```

### Или с активацией виртуального окружения:

```bash
cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
pip install -r /home/kdlqemdxxn/zakup.one/requirements.txt
deactivate
```

## 🔍 Диагностика:

Если все еще не работает, проверьте:

```bash
# Проверьте где вы находитесь
pwd

# Проверьте что файл существует
ls -la /home/kdlqemdxxn/zakup.one/requirements.txt

# Проверьте содержимое директории
ls -la /home/kdlqemdxxn/zakup.one/ | grep requirements

# Проверьте права доступа
stat /home/kdlqemdxxn/zakup.one/requirements.txt
```

## 💡 Альтернатива: Через панель Spaceship

Если терминал не работает, попробуйте через панель:

1. В секции **"Configuration files"**
2. Убедитесь что в списке есть: `requirements.txt`
3. Нажмите **"Run Pip Install"**

Панель должна автоматически использовать правильные пути.



