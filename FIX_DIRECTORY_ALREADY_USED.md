# 🔧 Исправление: "Specified directory already used"

## ❌ Ошибка:
```
Error: Specified directory already used by '/home/kdlqemdxxn/zakup.one'
```

**Это означает:**
- Директория `/home/kdlqemdxxn/zakup.one` уже используется другим приложением
- Нужно либо удалить старое приложение, либо использовать его

---

## ✅ РЕШЕНИЕ:

### Вариант 1: Используйте существующее приложение (РЕКОМЕНДУЕТСЯ)

1. **Не создавайте новое приложение**
2. **Найдите существующее приложение** в списке приложений
3. **Откройте его для редактирования**
4. **Исправьте настройки:**
   - Application root: `/home/kdlqemdxxn/zakup.one` (уже правильно)
   - Application URL: `zakup.one`
   - Application startup file: `wsgi.py`
   - Application Entry point: `application` (не `wsgi:application`)
   - Python version: `3.11.13`
5. **Нажмите SAVE**
6. **Нажмите RESTART**

### Вариант 2: Удалите старое приложение и создайте новое

**ВНИМАНИЕ:** Это удалит старое приложение!

1. **Найдите старое приложение** в списке приложений
2. **Откройте его**
3. **Нажмите DESTROY** (удалить)
4. **Подтвердите удаление**
5. **Создайте новое приложение:**
   - Application root: `/home/kdlqemdxxn/zakup.one`
   - Application URL: `zakup.one`
   - Application startup file: `wsgi.py`
   - Application Entry point: `application`
   - Python version: `3.11.13`
6. **Нажмите SAVE**

---

## 🔍 Как найти существующее приложение:

1. **В панели Spaceship найдите раздел "WEB APPLICATIONS"**
2. **Просмотрите список всех приложений**
3. **Найдите приложение которое использует `/home/kdlqemdxxn/zakup.one`**
4. **Откройте его для редактирования**

---

## 📋 Правильные настройки для существующего приложения:

- **Application root:** `/home/kdlqemdxxn/zakup.one` ✅
- **Application URL:** `zakup.one`
- **Application startup file:** `wsgi.py`
- **Application Entry point:** `application` (ВАЖНО: без `wsgi:`)
- **Python version:** `3.11.13`

---

## ✅ После исправления:

1. **Нажмите SAVE**
2. **Нажмите RESTART** (если приложение запущено)
3. **Проверьте статус:**
   - Должна быть кнопка "STOP APP" (значит запущено)
4. **Проверьте через curl:**
   ```bash
   curl https://zakup.one/health
   ```
   Должен вернуть JSON

---

**ГЛАВНОЕ: Используйте существующее приложение, не создавайте новое!**

