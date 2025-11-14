# 📋 Environment Variables для Spaceship

## 🔧 Какие переменные окружения добавить в панели Spaceship

В разделе **"Environment variables"** добавьте следующие переменные:

---

## ✅ ОБЯЗАТЕЛЬНЫЕ переменные:

### 1. DATABASE_URL
```
Name: DATABASE_URL
Value: postgresql://user:password@host:port/database
```
**Описание:** URL подключения к базе данных PostgreSQL  
**Пример:** `postgresql://zakup_user:password123@localhost:5432/zakup_db`

### 2. SECRET_KEY
```
Name: SECRET_KEY
Value: ваш-секретный-ключ-для-jwt
```
**Описание:** Секретный ключ для JWT токенов (сгенерируйте случайную строку)  
**Пример:** `your-super-secret-key-change-this-in-production-12345`

### 3. DEBUG
```
Name: DEBUG
Value: False
```
**Описание:** Режим отладки (для production должно быть `False`)

---

## 🔐 РЕКОМЕНДУЕМЫЕ переменные:

### 4. CORS_ORIGINS
```
Name: CORS_ORIGINS
Value: https://zakup.one,https://www.zakup.one
```
**Описание:** Разрешенные домены для CORS  
**Пример:** `https://zakup.one,https://www.zakup.one`

### 5. UPLOAD_DIR
```
Name: UPLOAD_DIR
Value: ./uploads
```
**Описание:** Директория для загруженных файлов

### 6. DOWNLOADS_DIR
```
Name: DOWNLOADS_DIR
Value: ./downloads
```
**Описание:** Директория для скачиваемых файлов

---

## 📧 EMAIL переменные (если используется отправка email):

### 7. MAIL_USERNAME
```
Name: MAIL_USERNAME
Value: ваш-email@gmail.com
```
**Описание:** Email для отправки писем

### 8. MAIL_PASSWORD
```
Name: MAIL_PASSWORD
Value: ваш-пароль-приложения
```
**Описание:** Пароль приложения для email

### 9. MAIL_FROM
```
Name: MAIL_FROM
Value: noreply@zakup.one
```
**Описание:** Email отправителя

### 10. MAIL_SERVER
```
Name: MAIL_SERVER
Value: smtp.gmail.com
```
**Описание:** SMTP сервер

### 11. MAIL_PORT
```
Name: MAIL_PORT
Value: 587
```
**Описание:** Порт SMTP сервера

---

## 📋 МИНИМАЛЬНЫЙ НАБОР (для начала):

Если у вас еще нет базы данных, добавьте минимум:

1. **SECRET_KEY** - обязательно!
2. **DEBUG** - `False` для production
3. **CORS_ORIGINS** - `https://zakup.one,https://www.zakup.one`

Остальные переменные можно добавить позже.

---

## 🔧 Как добавить в панели Spaceship:

1. **Найдите раздел "Environment variables"**
2. **Нажмите "ADD VARIABLE"**
3. **Введите Name** (например: `SECRET_KEY`)
4. **Введите Value** (например: `your-secret-key`)
5. **Нажмите кнопку сохранения** (обычно галочка или Enter)
6. **Повторите для каждой переменной**

---

## 🔐 Генерация SECRET_KEY:

Для генерации безопасного SECRET_KEY выполните:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

Или используйте онлайн генератор случайных строк.

---

## ✅ После добавления переменных:

1. **Нажмите SAVE** в настройках приложения
2. **Нажмите RESTART** приложения
3. **Проверьте что приложение запустилось**

---

## 📝 Пример заполнения:

```
Name: SECRET_KEY
Value: dGhpc2lzYXZlcnlzZWNyZXRrZXljaGFuZ2V0aGlz

Name: DEBUG
Value: False

Name: CORS_ORIGINS
Value: https://zakup.one,https://www.zakup.one

Name: DATABASE_URL
Value: postgresql://user:pass@localhost:5432/zakup_db
```

---

**ВАЖНО: SECRET_KEY должен быть уникальным и секретным! Не используйте примеры из документации!**

