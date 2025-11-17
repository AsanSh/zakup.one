# 🚨 ИСПРАВЛЕНИЕ: wsgi.py возвращается как текст

## ❌ Проблема
Запрос к `/api/v1/health` возвращает **код файла `wsgi.py`** вместо выполнения.

Это означает, что:
- Spaceship не настроен как Python приложение
- Или `.htaccess` неправильно проксирует запросы

## ✅ Решение: 2 шага

### ШАГ 1: Проверить настройки Spaceship (КРИТИЧНО!)

В панели Spaceship для домена `zakup.one`:

1. **Откройте настройки Python приложения**
2. **Убедитесь что:**

   - **Application Type**: `Python` (не `Static` или `PHP`)
   
   - **Application root**: `/home/kdlqemdxxn/zakup.one`
     - ✅ Должен быть полный путь
   
   - **Startup file**: `wsgi.py`
     - ✅ Файл, который запускает приложение
   
   - **Entry point**: `application`
     - ⚠️ **КРИТИЧНО**: Должно быть `application` (БЕЗ `:`)
     - ❌ НЕ `wsgi:application`
     - ❌ НЕ `wsgi.application`
     - ✅ ТОЛЬКО `application`
   
   - **Python version**: `3.11`
     - ✅ Версия Python
   
   - **Status**: `Running`
     - ✅ Приложение должно быть запущено

3. **Если приложение не создано:**
   - Создайте новое Python приложение
   - Укажите все параметры выше
   - Сохраните и запустите

4. **Если приложение существует, но не работает:**
   - Проверьте что Type = `Python`
   - Проверьте Entry point = `application`
   - Перезапустите приложение

### ШАГ 2: Проверить .htaccess

Убедитесь что `.htaccess` **НЕ** отдает файлы напрямую.

Правило должно быть:
```apache
RewriteCond %{REQUEST_URI} ^/api/ [NC]
RewriteRule ^(.*)$ wsgi.py [E=REQUEST_URI:$1,L,QSA]
```

**НЕ должно быть:**
```apache
# НЕПРАВИЛЬНО - отдает файл как текст
RewriteRule ^wsgi.py$ wsgi.py [L]
```

### ШАГ 3: Проверить права доступа

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

### Проверка 1: Тип приложения в Spaceship

В панели Spaceship проверьте:
- **Application Type** должен быть `Python`
- Если `Static` или `PHP` - измените на `Python`

### Проверка 2: Entry point

В панели Spaceship:
- **Entry point** должен быть `application`
- НЕ `wsgi:application`
- НЕ `wsgi.application`
- НЕ пустое поле

### Проверка 3: .htaccess не конфликтует

```bash
cd /home/kdlqemdxxn/zakup.one
cat .htaccess | grep -i wsgi
```

Не должно быть правил, которые отдают `wsgi.py` как файл.

### Проверка 4: Логи приложения

В панели Spaceship найдите логи и проверьте:
- Есть ли ошибки при запуске?
- Импортируется ли `app` правильно?

## 🆘 Если все еще не работает

### Альтернативное решение: Удалить .htaccess правило для API

Если Spaceship правильно настроен как Python приложение, возможно `.htaccess` мешает.

Попробуйте временно закомментировать правило для API:

```apache
# Временно закомментировано для теста
# RewriteCond %{REQUEST_URI} ^/api/ [NC]
# RewriteRule ^(.*)$ wsgi.py [E=REQUEST_URI:$1,L,QSA]
```

Если после этого API заработает - значит проблема в `.htaccess`.

### Проверка через прямой доступ

Попробуйте:
```bash
curl https://zakup.one/wsgi.py
```

Если возвращает код - значит Spaceship не настроен как Python приложение.

## 📋 Чеклист

- [ ] **Spaceship**: Application Type = `Python`
- [ ] **Spaceship**: Application root = `/home/kdlqemdxxn/zakup.one`
- [ ] **Spaceship**: Startup file = `wsgi.py`
- [ ] **Spaceship**: Entry point = `application` (БЕЗ `:`)
- [ ] **Spaceship**: Status = `Running`
- [ ] **wsgi.py**: Права `755` (`chmod 755 wsgi.py`)
- [ ] **.htaccess**: Правило для `/api/*` → `wsgi.py` (не отдает файл)

## 🎯 Главное

**Проблема в настройках Spaceship!**

Если запрос возвращает код файла - значит Spaceship не настроен как Python приложение или Entry point неправильный.

**Проверьте первым делом:**
1. Application Type = `Python`
2. Entry point = `application` (без `:`)

После исправления этих настроек все должно заработать!

