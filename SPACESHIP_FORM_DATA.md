# Данные для заполнения формы создания приложения в Spaceship

## 📋 Заполнение формы "CREATE APPLICATION"

### 1. Python version
**Значение:** `3.11.13` (уже выбрано) ✅

### 2. Application root
**Значение:** `zakup.one` (уже заполнено) ✅

### 3. Application URL
**Значение:** Выберите или создайте домен `www.zakup.one` или `zakup.one`

Если нужно создать новый домен:
- Нажмите на выпадающий список
- Выберите "Add new domain" или создайте `www.zakup.one`

### 4. Application startup file
**Значение:** `wsgi.py`

Или оставьте пустым, если система автоматически найдет файл.

### 5. Application Entry point ⚠️ ВАЖНО!
**Значение:** `wsgi:application`

Это самое важное поле! Без этого приложение не запустится.

---

## 🔧 Environment Variables (Переменные окружения)

Нажмите "+ ADD VARIABLE" и добавьте следующие переменные:

### Обязательные переменные:

1. **DATABASE_URL**
   - Значение: `sqlite:///./zakup.db`

2. **SECRET_KEY**
   - Значение: (скопируйте из .env файла на сервере)
   - Или сгенерируйте новый: используйте длинную случайную строку

3. **DEBUG**
   - Значение: `False`

4. **API_V1_PREFIX**
   - Значение: `/api/v1`

5. **CORS_ORIGINS**
   - Значение: `["https://www.zakup.one","https://zakup.one","http://www.zakup.one","http://zakup.one"]`

### Дополнительные переменные (опционально):

6. **ALGORITHM**
   - Значение: `HS256`

7. **ACCESS_TOKEN_EXPIRE_MINUTES**
   - Значение: `1440`

8. **UPLOAD_DIR**
   - Значение: `./uploads`

9. **MAX_UPLOAD_SIZE**
   - Значение: `10485760`

10. **MAIL_FROM**
    - Значение: `noreply@zakup.one`

11. **MAIL_FROM_NAME**
    - Значение: `ZAKUP.ONE`

---

## ✅ После заполнения:

1. Нажмите кнопку **"CREATE"**
2. Дождитесь создания приложения
3. Перезапустите приложение (если нужно)
4. Проверьте работу: https://www.zakup.one/api/v1/health

---

## 📝 Краткая инструкция:

**Основные поля:**
- Application root: `zakup.one`
- Application startup file: `wsgi.py`
- **Application Entry point: `wsgi:application`** ⚠️

**Минимальные переменные окружения:**
- DATABASE_URL: `sqlite:///./zakup.db`
- SECRET_KEY: (из .env файла)
- DEBUG: `False`
- CORS_ORIGINS: `["https://www.zakup.one","https://zakup.one"]`



