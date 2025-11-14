# 🔍 Проверка frontend/dist на сервере

## ✅ Локально все готово!

Проверка показала:
- ✅ `frontend/dist/` существует
- ✅ `index.html` найден
- ✅ `assets/` с 38 JS файлами и 1 CSS файлом

---

## 🚨 КРИТИЧЕСКАЯ ПРОВЕРКА НА СЕРВЕРЕ

### Шаг 1: Проверьте структуру на сервере

**Через SSH или File Manager:**

```bash
cd /home/kdlqemdxxn/zakup.one/frontend
ls -la
```

**Должно быть:**
```
dist/
├── index.html
└── assets/
    ├── index-CHy6TYul.css
    ├── index-CPKm4tFN.js
    ├── vendor-CT2VWNm-.js
    └── ... (другие файлы)
```

### Шаг 2: Проверьте URL напрямую

Откройте в браузере:

```
https://zakup.one/assets/index-CHy6TYul.css
```

**Ожидаемый результат:**
- ✅ Должен показать **CSS код** (текст с селекторами)
- ❌ Если показывает **HTML** → файл не найден или неправильный путь
- ❌ Если показывает **404** → файл не существует

### Шаг 3: Проверьте директорию assets

Откройте в браузере:

```
https://zakup.one/assets/
```

**Ожидаемый результат:**
- ✅ **403 Forbidden** или **404 Not Found** (нормально, директории не должны быть доступны)
- ❌ Если показывает **HTML страницу** → неправильная конфигурация

---

## 🔧 Если файлы не найдены на сервере

### Вариант 1: Загрузите через File Manager

1. **Откройте File Manager** в панели Spaceship
2. **Перейдите в** `/home/kdlqemdxxn/zakup.one/frontend/`
3. **Проверьте есть ли папка `dist/`**
4. **Если нет** - загрузите `frontend-dist.zip` и распакуйте

### Вариант 2: Загрузите через FTP

1. **Подключитесь через FTP** (FileZilla, WinSCP)
2. **Перейдите в** `/home/kdlqemdxxn/zakup.one/frontend/`
3. **Загрузите папку `dist/`** полностью

### Вариант 3: Проверьте путь в конфигурации

Убедитесь что в `app/main.py` путь правильный:

```python
project_root = Path(__file__).parent.parent  # /home/kdlqemdxxn/zakup.one
frontend_dist = project_root / "frontend" / "dist"  # /home/kdlqemdxxn/zakup.one/frontend/dist
frontend_assets = frontend_dist / "assets"  # /home/kdlqemdxxn/zakup.one/frontend/dist/assets
```

---

## 📋 Чеклист проверки на сервере

- [ ] Папка `/home/kdlqemdxxn/zakup.one/frontend/dist/` существует
- [ ] Файл `/home/kdlqemdxxn/zakup.one/frontend/dist/index.html` существует
- [ ] Папка `/home/kdlqemdxxn/zakup.one/frontend/dist/assets/` существует
- [ ] В `assets/` есть файлы `.js` и `.css`
- [ ] URL `https://zakup.one/assets/index-CHy6TYul.css` показывает CSS код
- [ ] URL `https://zakup.one/assets/index-CPKm4tFN.js` показывает JS код
- [ ] `.htaccess` правильно настроен
- [ ] FastAPI монтирует `/assets` правильно

---

## 🆘 Если все еще не работает

### Проверьте логи

В панели Spaceship найдите логи и проверьте:
- Ошибки при загрузке статических файлов
- Ошибки в `wsgi.py`
- Ошибки в `app/main.py`

### Проверьте права доступа

```bash
chmod -R 755 /home/kdlqemdxxn/zakup.one/frontend/dist
chmod 644 /home/kdlqemdxxn/zakup.one/frontend/dist/index.html
chmod 644 /home/kdlqemdxxn/zakup.one/frontend/dist/assets/*
```

---

## ✅ После исправления

1. **Очистите кеш браузера** (`Ctrl+Shift+R`)
2. **Обновите страницу**
3. **Проверьте консоль** - не должно быть ошибок MIME типов
4. **Frontend должен отображаться правильно**

