# 📊 Анализ использования frontend/dist в проекте

## 🔍 Найденные места использования frontend/dist:

### 1. **app/main.py** (ОСНОВНОЙ ФАЙЛ)
```python
project_root = Path(__file__).parent.parent  # /path/to/zakup.one
frontend_dist = project_root / "frontend" / "dist"  # /path/to/zakup.one/frontend/dist
frontend_assets = frontend_dist / "assets"  # /path/to/zakup.one/frontend/dist/assets

# Монтирование статических файлов
app.mount("/assets", StaticFiles(directory=str(frontend_assets)), name="assets")

# Отдача index.html
if frontend_dist.exists() and (frontend_dist / "index.html").exists():
    return FileResponse(str(frontend_dist / "index.html"))
```

**✅ ПРОВЕРКА:**
- ✅ Путь правильный: `project_root / "frontend" / "dist"`
- ✅ Assets монтируются: `frontend_dist / "assets"`
- ✅ StaticFiles использует правильный путь

---

### 2. **wsgi.py** (WSGI ENTRY POINT)
```python
project_root = Path(__file__).parent.absolute()  # /home/kdlqemdxxn/zakup.one
os.chdir(str(project_root))
# Импортирует app.main, который сам определяет пути
```

**✅ ПРОВЕРКА:**
- ✅ `project_root` определяется правильно
- ✅ Рабочая директория меняется на корень проекта
- ✅ Импортирует `app.main`, который использует относительные пути

---

### 3. **.htaccess** (APACHE CONFIGURATION)
```apache
# Статические файлы из frontend/dist/assets
RewriteCond %{REQUEST_URI} ^/assets/ [NC]
RewriteCond %{DOCUMENT_ROOT}/frontend/dist%{REQUEST_URI} -f
RewriteRule ^assets/(.*)$ /frontend/dist/assets/$1 [L]

# SPA routing
RewriteRule ^(.*)$ /frontend/dist/index.html [L]
```

**✅ ПРОВЕРКА:**
- ✅ Обрабатывает `/assets/` из `/frontend/dist/assets/`
- ✅ SPA routing использует `/frontend/dist/index.html`
- ✅ MIME типы настроены

---

### 4. **app/main_simple.py** (УПРОЩЕННАЯ ВЕРСИЯ)
```python
frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
if (frontend_dist / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")))
```

**✅ ПРОВЕРКА:**
- ✅ Использует тот же путь что и main.py
- ✅ Правильно монтирует assets

---

### 5. **vite.config.ts** (FRONTEND BUILD CONFIG)
```typescript
build: {
  outDir: 'dist',        // → frontend/dist/
  assetsDir: 'assets',  // → frontend/dist/assets/
  base: '/',            // Базовый путь для продакшена
}
```

**✅ ПРОВЕРКА:**
- ✅ Собирает в `frontend/dist/`
- ✅ Assets в `frontend/dist/assets/`
- ✅ Базовый путь `/` (правильно)

---

## 📋 ИТОГОВАЯ СТРУКТУРА ПУТЕЙ:

### Локально:
```
/Users/.../webscrp/
├── app/
│   └── main.py          → использует: ../frontend/dist
├── frontend/
│   └── dist/            ← Собранный frontend
│       ├── index.html
│       └── assets/
└── wsgi.py              → использует: ./frontend/dist
```

### На сервере:
```
/home/kdlqemdxxn/zakup.one/
├── app/
│   └── main.py          → использует: ../frontend/dist
├── frontend/
│   └── dist/            ← Собранный frontend (ДОЛЖЕН БЫТЬ!)
│       ├── index.html
│       └── assets/
└── wsgi.py              → использует: ./frontend/dist
```

---

## ✅ ВСЕ ПУТИ ПРАВИЛЬНЫЕ!

Все файлы используют **относительные пути** от корня проекта:
- `project_root / "frontend" / "dist"` ✅
- `frontend_dist / "assets"` ✅

Это означает что структура должна быть одинаковой локально и на сервере.

---

## 🚨 КРИТИЧЕСКАЯ ПРОВЕРКА:

### На сервере должно быть:
```
/home/kdlqemdxxn/zakup.one/frontend/dist/
├── index.html
└── assets/
    ├── index-CHy6TYul.css
    ├── index-CPKm4tFN.js
    └── vendor-CT2VWNm-.js
```

### Проверка через URL:
```
https://zakup.one/assets/index-CHy6TYul.css
```
**Должен показать CSS код, а не HTML!**

---

## 🔧 Скрипт проверки:

Запустите:
```bash
python3 verify_frontend.py
```

Или для проверки на сервере:
```bash
python3 verify_frontend.py --server-path /home/kdlqemdxxn/zakup.one
```

---

## 📦 Автоматическое создание deploy:

После `npm run build` автоматически создается:
```
deploy/
└── frontend/
    └── dist/  ← Копия frontend/dist/
```

Это упрощает деплой - можно загрузить всю папку `deploy/` на сервер.

