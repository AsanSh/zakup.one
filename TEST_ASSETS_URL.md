# 🔍 Проверка доступности статических файлов

## ✅ Файлы на сервере найдены!

Из вашего вывода видно:
- ✅ `index-CHy6TYul.css` (30,398 байт) - CSS файл
- ✅ `index-CPKm4tFN.js` (83,224 байт) - главный JS файл
- ✅ `vendor-CT2VWNm-.js` (162,860 байт) - vendor JS файл
- ✅ Всего 38 файлов в `assets/`

---

## 🧪 ТЕСТ 1: Проверьте доступность через URL

### Откройте в браузере:

1. **CSS файл:**
   ```
   https://zakup.one/assets/index-CHy6TYul.css
   ```
   
   **Ожидаемый результат:**
   - ✅ Показывает **CSS код** (текст с селекторами типа `.class { ... }`)
   - ❌ Если показывает **HTML** → проблема с `.htaccess` или FastAPI
   - ❌ Если показывает **404** → файл не найден

2. **JS файл:**
   ```
   https://zakup.one/assets/index-CPKm4tFN.js
   ```
   
   **Ожидаемый результат:**
   - ✅ Показывает **JavaScript код** (текст с `import`, `export`, функциями)
   - ❌ Если показывает **HTML** → проблема с `.htaccess` или FastAPI
   - ❌ Если показывает **404** → файл не найден

3. **Vendor JS:**
   ```
   https://zakup.one/assets/vendor-CT2VWNm-.js
   ```
   
   **Ожидаемый результат:**
   - ✅ Показывает **JavaScript код**
   - ❌ Если показывает **HTML** → проблема

---

## 🔧 Если файлы возвращают HTML вместо CSS/JS:

### Проблема: `.htaccess` не обрабатывает `/assets/` правильно

**Решение:**

1. **Проверьте `.htaccess` на сервере:**
   ```bash
   cat /home/kdlqemdxxn/zakup.one/.htaccess | grep -A 5 "assets"
   ```

2. **Убедитесь что правило для assets ПЕРВОЕ:**
   ```apache
   # Должно быть ПЕРВЫМ (до других правил)
   RewriteCond %{REQUEST_URI} ^/assets/ [NC]
   RewriteCond %{DOCUMENT_ROOT}/frontend/dist%{REQUEST_URI} -f
   RewriteRule ^assets/(.*)$ /frontend/dist/assets/$1 [L]
   ```

3. **Проверьте MIME типы:**
   ```apache
   <IfModule mod_mime.c>
       AddType text/css .css
       AddType application/javascript .js
   </IfModule>
   ```

---

## 🧪 ТЕСТ 2: Проверьте через curl

На сервере выполните:

```bash
# Проверка CSS
curl -I https://zakup.one/assets/index-CHy6TYul.css

# Должно быть:
# Content-Type: text/css
# Если Content-Type: text/html → проблема!
```

```bash
# Проверка JS
curl -I https://zakup.one/assets/index-CPKm4tFN.js

# Должно быть:
# Content-Type: application/javascript
# Если Content-Type: text/html → проблема!
```

---

## 🔧 Если Content-Type неправильный:

### Вариант 1: Обновите .htaccess

Загрузите исправленный `.htaccess` на сервер (см. `URGENT_FIX_STATIC_FILES.md`)

### Вариант 2: Проверьте что Apache обрабатывает файлы

```bash
# Проверьте что файлы доступны напрямую
ls -la /home/kdlqemdxxn/zakup.one/frontend/dist/assets/index-CHy6TYul.css

# Проверьте права доступа
chmod 644 /home/kdlqemdxxn/zakup.one/frontend/dist/assets/*
```

### Вариант 3: Проверьте DOCUMENT_ROOT

Возможно `DOCUMENT_ROOT` в `.htaccess` неправильный. Попробуйте использовать полный путь:

```apache
# Вместо %{DOCUMENT_ROOT}/frontend/dist
# Используйте:
RewriteCond /home/kdlqemdxxn/zakup.one/frontend/dist%{REQUEST_URI} -f
```

---

## 🧪 ТЕСТ 3: Проверьте что FastAPI видит файлы

На сервере выполните:

```bash
cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
python3 -c "
from pathlib import Path
project_root = Path('/home/kdlqemdxxn/zakup.one')
frontend_dist = project_root / 'frontend' / 'dist'
frontend_assets = frontend_dist / 'assets'
print(f'frontend_dist: {frontend_dist}')
print(f'Существует: {frontend_dist.exists()}')
print(f'frontend_assets: {frontend_assets}')
print(f'Существует: {frontend_assets.exists()}')
if frontend_assets.exists():
    files = list(frontend_assets.glob('*.css'))
    print(f'CSS файлов: {len(files)}')
    if files:
        print(f'Первый CSS: {files[0]}')
"
```

---

## 📋 Чеклист диагностики:

- [ ] Файлы существуют на сервере ✅ (проверено)
- [ ] URL `https://zakup.one/assets/index-CHy6TYul.css` показывает CSS код
- [ ] URL `https://zakup.one/assets/index-CPKm4tFN.js` показывает JS код
- [ ] Content-Type правильный (проверить через curl)
- [ ] `.htaccess` правильно настроен
- [ ] FastAPI видит файлы (проверить через Python)

---

## 🎯 Следующий шаг:

**Откройте в браузере:**
```
https://zakup.one/assets/index-CHy6TYul.css
```

И скажите что показывает:
- ✅ CSS код → все работает!
- ❌ HTML страница → нужно исправить `.htaccess`
- ❌ 404 ошибка → файл не найден (но мы знаем что он есть!)

