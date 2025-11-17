# 🚨 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Spaceship не выполняет Python

## ❌ Проблема
Запрос возвращает **код файла `wsgi.py`** как текст вместо выполнения.

**Это означает:** Spaceship не настроен как Python приложение или `.htaccess` мешает.

## ✅ Решение: 3 варианта

### ВАРИАНТ 1: Создать/Настроить Python приложение в Spaceship (РЕКОМЕНДУЕТСЯ)

#### Шаг 1: Проверить есть ли Python приложение

В панели Spaceship:
1. Откройте настройки домена `zakup.one`
2. Найдите раздел **"Python Applications"** или **"Applications"**
3. Проверьте есть ли приложение для этого домена

#### Шаг 2: Если приложения НЕТ - создать

1. Нажмите **"Create Application"** или **"Add Python App"**
2. Заполните:
   - **Application Name**: `zakup.one` (или любое имя)
   - **Application Type**: `Python` ⚠️ **КРИТИЧНО!**
   - **Application root**: `/home/kdlqemdxxn/zakup.one`
   - **Startup file**: `wsgi.py`
   - **Entry point**: `application` (БЕЗ `:`)
   - **Python version**: `3.11`
3. Сохраните
4. Запустите приложение (Status = `Running`)

#### Шаг 3: Если приложение ЕСТЬ - проверить настройки

1. Откройте настройки существующего приложения
2. Проверьте:
   - **Application Type**: Должно быть `Python` (не `Static`, не `PHP`)
   - **Entry point**: Должно быть `application` (не `wsgi:application`)
   - **Startup file**: Должно быть `wsgi.py`
3. Если что-то неправильно - исправьте и сохраните
4. Перезапустите приложение

### ВАРИАНТ 2: Упростить .htaccess (если Spaceship сам обрабатывает Python)

Если Spaceship правильно настроен как Python приложение, возможно `.htaccess` мешает.

Попробуйте **временно** упростить `.htaccess`:

```bash
cd /home/kdlqemdxxn/zakup.one
cp .htaccess .htaccess.backup
cat > .htaccess << 'ENDOFFILE'
# Упрощенная версия для Spaceship Python
RewriteEngine On
Options -Indexes

# Статика
RewriteCond %{REQUEST_URI} ^/assets/(.*)$ [NC]
RewriteCond %{DOCUMENT_ROOT}/frontend/dist/assets/%1 -f
RewriteRule ^assets/(.*)$ /frontend/dist/assets/$1 [L]

# SPA routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteCond %{REQUEST_URI} !^/assets/
RewriteRule ^(.*)$ /frontend/dist/index.html [L]
ENDOFFILE
```

**ВАЖНО**: Убрали правило для `/api/*` - пусть Spaceship сам обрабатывает через Python приложение.

После этого:
1. Перезапустите приложение в Spaceship
2. Проверьте: `curl https://zakup.one/api/v1/health`

Если заработало - значит проблема была в `.htaccess`.

### ВАРИАНТ 3: Проверить что Spaceship видит wsgi.py

```bash
cd /home/kdlqemdxxn/zakup.one
ls -la wsgi.py
```

Должно быть:
```
-rwxr-xr-x 1 kdlqemdxxn kdlqemdxxn ... wsgi.py
```

Если нет прав на выполнение:
```bash
chmod 755 wsgi.py
```

## 🔍 Диагностика

### Проверка 1: Есть ли Python приложение?

В панели Spaceship:
- Откройте настройки домена
- Найдите раздел "Python Applications"
- Есть ли там приложение для `zakup.one`?

**Если НЕТ** - создайте (Вариант 1, Шаг 2)

### Проверка 2: Правильный ли тип?

В настройках приложения:
- **Application Type** должен быть `Python`
- Если `Static` или `PHP` - измените на `Python`

### Проверка 3: Правильный ли Entry point?

В настройках приложения:
- **Entry point** должен быть `application`
- НЕ `wsgi:application`
- НЕ `wsgi.application`
- НЕ пустое поле

### Проверка 4: .htaccess не мешает?

Попробуйте временно переименовать `.htaccess`:

```bash
cd /home/kdlqemdxxn/zakup.one
mv .htaccess .htaccess.disabled
```

Затем проверьте:
```bash
curl https://zakup.one/api/v1/health
```

Если заработало - проблема в `.htaccess`. Используйте упрощенную версию (Вариант 2).

Если не заработало - проблема в настройках Spaceship (Вариант 1).

## 📋 Чеклист

- [ ] **Spaceship**: Python приложение создано для домена
- [ ] **Spaceship**: Application Type = `Python`
- [ ] **Spaceship**: Entry point = `application` (БЕЗ `:`)
- [ ] **Spaceship**: Startup file = `wsgi.py`
- [ ] **Spaceship**: Application root = `/home/kdlqemdxxn/zakup.one`
- [ ] **Spaceship**: Status = `Running`
- [ ] **wsgi.py**: Права `755` (`chmod 755 wsgi.py`)
- [ ] **.htaccess**: Не мешает (или упрощен)

## 🎯 Главное

**Если запрос возвращает код файла - Spaceship не выполняет Python!**

**Причины:**
1. ❌ Python приложение не создано
2. ❌ Application Type не `Python`
3. ❌ Entry point неправильный
4. ❌ `.htaccess` мешает

**Решение:**
1. ✅ Создайте/настройте Python приложение в Spaceship
2. ✅ Убедитесь что Type = `Python` и Entry point = `application`
3. ✅ Упростите `.htaccess` если нужно

## 🆘 Если ничего не помогает

Попробуйте создать приложение заново:

1. Удалите старое Python приложение (если есть)
2. Создайте новое с нуля:
   - Type: `Python`
   - Root: `/home/kdlqemdxxn/zakup.one`
   - Startup: `wsgi.py`
   - Entry: `application`
3. Запустите
4. Проверьте

После правильной настройки Spaceship должен выполнять `wsgi.py`, а не отдавать его как файл!

