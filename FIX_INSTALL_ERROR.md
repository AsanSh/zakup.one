# 🔧 Исправление ошибки установки

## ❌ Ошибка:
```
can't open file '/home/kdlqemdxxn/zakup.one/https://zakup.one/install.php'
```

## 🐛 Проблема:
Вы указали **URL** (`https://zakup.one/install.php`) вместо **пути к файлу** на сервере.

---

## ✅ ПРАВИЛЬНОЕ РЕШЕНИЕ: Используйте "Run Pip Install"

### Для установки зависимостей НЕ нужно использовать "Execute python script"!

**Правильный способ:**

1. **В панели Spaceship найдите раздел "Configuration files"**
   - Может называться "Файлы конфигурации" или "Python Configuration"

2. **Убедитесь что `requirements.txt` в списке**
   - Если нет: добавьте его в поле "Add another file"

3. **Нажмите кнопку "Run Pip Install"**
   - Это автоматически установит все зависимости из `requirements.txt`
   - Не нужно указывать никакие пути!

4. **Дождитесь завершения** (3-5 минут)

---

## 🔄 Альтернатива: Если нужно использовать "Execute python script"

### ❌ НЕПРАВИЛЬНО:
```
https://zakup.one/install.php
```

### ✅ ПРАВИЛЬНО:
```
/home/kdlqemdxxn/zakup.one/install_deps.py
```

**НО:** Для установки зависимостей лучше использовать "Run Pip Install"!

---

## 📋 Пошаговая инструкция через "Run Pip Install"

### Шаг 1: Найдите раздел "Configuration files"

В панели Spaceship ищите:
- "Configuration files"
- "Файлы конфигурации"
- "Python Configuration"
- "Dependencies"

### Шаг 2: Добавьте requirements.txt

1. В списке файлов должен быть `requirements.txt`
2. Если нет:
   - В поле "Add another file" или "Добавить файл" введите: `requirements.txt`
   - Нажмите "+ Add" или "Добавить"

### Шаг 3: Установите зависимости

1. Найдите кнопку **"Run Pip Install"** или **"Установить зависимости"**
2. Нажмите на неё
3. Дождитесь завершения установки
4. Вы увидите процесс в логах

### Шаг 4: Проверьте результат

Должно быть сообщение:
- ✅ "Successfully installed" или "Успешно установлено"
- ✅ Список установленных пакетов
- ✅ Или просто отсутствие ошибок

---

## 🆘 Если "Run Pip Install" не работает

### Вариант 1: Через SSH (если доступен)

```bash
cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
pip install -r requirements.txt
deactivate
```

### Вариант 2: Через терминал в панели

1. Найдите раздел "Terminal" или "SSH Terminal"
2. Выполните:
```bash
cd /home/kdlqemdxxn/zakup.one
/home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/pip install -r requirements.txt
```

### Вариант 3: Создайте Python скрипт для установки

Если все-таки нужно использовать "Execute python script":

1. **Создайте файл `install_deps.py` на сервере:**

Через File Manager создайте файл `/home/kdlqemdxxn/zakup.one/install_deps.py`:

```python
#!/usr/bin/env python3
import subprocess
import sys
import os

# Переходим в директорию проекта
os.chdir('/home/kdlqemdxxn/zakup.one')

# Путь к pip в виртуальном окружении
venv_pip = '/home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/pip'

# Устанавливаем зависимости
result = subprocess.run(
    [venv_pip, 'install', '-r', 'requirements.txt'],
    capture_output=True,
    text=True
)

print(result.stdout)
if result.stderr:
    print("Errors:", result.stderr, file=sys.stderr)
sys.exit(result.returncode)
```

2. **В "Execute python script" укажите:**
```
/home/kdlqemdxxn/zakup.one/install_deps.py
```

**НО:** Это сложнее чем "Run Pip Install"!

---

## ✅ РЕКОМЕНДАЦИЯ:

**Используйте "Run Pip Install"** - это самый простой и надежный способ!

Не нужно:
- ❌ Указывать пути к файлам
- ❌ Создавать дополнительные скрипты
- ❌ Использовать "Execute python script"

Просто:
- ✅ Добавьте `requirements.txt` в Configuration files
- ✅ Нажмите "Run Pip Install"
- ✅ Готово!

---

## 📋 Чеклист:

- [ ] Нашел раздел "Configuration files"
- [ ] `requirements.txt` добавлен в список
- [ ] Нажал "Run Pip Install"
- [ ] Дождался завершения установки
- [ ] Проверил что нет ошибок

---

**Главное: Используйте "Run Pip Install", а не "Execute python script"! 🚀**

