# 🔧 Исправление ошибки requirements.txt

## ❌ Ошибка:
```
ERROR: Could not open requirements file: [Errno 2] No such file or directory: 'zakup.one/requierements.txt'
```

**Проблемы:**
1. **Опечатка в имени файла:** `requierements.txt` → должно быть `requirements.txt`
2. **Неправильный путь:** `zakup.one/requierements.txt` → должно быть просто `requirements.txt`

---

## ✅ РЕШЕНИЕ:

### ШАГ 1: Исправьте имя файла в настройках Spaceship

1. **В разделе "Configuration files"** найдите `requierements.txt`
2. **Нажмите "Delete"** (удалить неправильный файл)
3. **Нажмите "Add"**
4. **Введите правильное имя:** `requirements.txt`
5. **Нажмите Enter или кнопку добавления**

### ШАГ 2: Проверьте что файл существует на сервере

```bash
# На сервере
ls -la /home/kdlqemdxxn/zakup.one/requirements.txt
```

**Если файл не существует:**
- Загрузите `requirements.txt` на сервер
- Или создайте его через File Manager

### ШАГ 3: Установите зависимости

1. **В разделе "Configuration files"**
2. **Нажмите "Run Pip Install"** рядом с `requirements.txt`
3. **Дождитесь завершения установки**

---

## 📋 Правильное имя файла:

```
requirements.txt
```

**НЕ:**
- ❌ `requierements.txt` (опечатка)
- ❌ `requirement.txt` (без 's')
- ❌ `requierements.txt` (опечатка)

**ДА:**
- ✅ `requirements.txt` (правильно)

---

## 🔍 Проверка на сервере:

```bash
# Проверьте что файл существует
ls -la /home/kdlqemdxxn/zakup.one/requirements.txt

# Проверьте содержимое
head -5 /home/kdlqemdxxn/zakup.one/requirements.txt
```

---

## ✅ После исправления:

1. **Удалите неправильный файл** (`requierements.txt`)
2. **Добавьте правильный** (`requirements.txt`)
3. **Нажмите "Run Pip Install"**
4. **Дождитесь завершения установки**
5. **Проверьте что зависимости установлены**

---

**ГЛАВНОЕ: Исправьте опечатку - должно быть `requirements.txt`, а не `requierements.txt`!**

