# 🔍 Проверка правильного пути к проекту

## ❌ Ошибка:
```bash
cd /home/kdlqemdxon/zakup.one
# No such file or directory
```

**Опечатка:** `kdlqemdxon` → должно быть `kdlqemdxxn`

---

## ✅ ПРАВИЛЬНЫЙ ПУТЬ:

```bash
cd /home/kdlqemdxxn/zakup.one
```

**Обратите внимание:** `kdlqemdxxn` (две 'x' в конце)

---

## 🔍 ПРОВЕРКА ПУТИ:

### Шаг 1: Найдите правильный путь

```bash
# Проверьте текущую директорию
pwd

# Найдите директорию zakup.one
find ~ -name "zakup.one" -type d 2>/dev/null

# Или проверьте домашнюю директорию
ls -la ~ | grep zakup
```

### Шаг 2: Проверьте правильный путь

```bash
# Правильный путь (с двумя 'x')
cd /home/kdlqemdxxn/zakup.one

# Проверьте что вы в правильной директории
pwd
ls -la
```

---

## 📋 ПРАВИЛЬНЫЕ КОМАНДЫ:

### Проверка приложения:

```bash
cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
python3 -c "from app.main import app; print('✅ App imported successfully')"
```

### Проверка wsgi.py:

```bash
cd /home/kdlqemdxxn/zakup.one
cat wsgi.py | head -30
```

### Проверка файлов:

```bash
cd /home/kdlqemdxxn/zakup.one
ls -la
ls -la app/
ls -la frontend/dist/
```

---

## ⚠️ ВАЖНО:

**Правильный путь:** `/home/kdlqemdxxn/zakup.one`  
**Неправильный путь:** `/home/kdlqemdxon/zakup.one` (опечатка)

**Обратите внимание на:**
- `kdlqemdxxn` (две 'x' в конце)
- НЕ `kdlqemdxon` (одна 'x')

---

## 🔧 ПРОБЛЕМА С /health:

Если `/health` возвращает HTML вместо JSON:

1. **Проверьте что приложение запущено** в панели Spaceship
2. **Проверьте настройки приложения:**
   - Application root: `/home/kdlqemdxxn/zakup.one`
   - Application startup file: `wsgi.py`
   - Application Entry point: `application`
3. **Перезапустите приложение** в панели Spaceship

---

**ГЛАВНОЕ: Используйте правильный путь `/home/kdlqemdxxn/zakup.one` (с двумя 'x')!**

