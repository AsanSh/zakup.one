# Следующие шаги после создания приложения

## ✅ Текущий статус:
- Application URL: `zakup.one` ✅
- Application startup file: `wsgi.py` ✅
- Application Entry point: `wsgi:application` ✅

## 📋 Что делать дальше:

### ШАГ 1: Установка зависимостей Python

1. Найдите секцию **"Configuration files"**
2. В поле должно быть указано: `requirements.txt`
3. Нажмите кнопку **"Run Pip Install"** (синяя кнопка с иконкой play)
4. Дождитесь завершения установки (может занять несколько минут)

### ШАГ 2: Добавление Environment Variables

1. Найдите секцию **"Environment variables"**
2. Нажмите кнопку **"+ ADD VARIABLE"**
3. Добавьте следующие переменные по одной:

#### Обязательные переменные:

**1. DATABASE_URL**
- Name: `DATABASE_URL`
- Value: `sqlite:///./zakup.db`

**2. SECRET_KEY**
- Name: `SECRET_KEY`
- Value: `qfM-nNd85eKQRQS34q0TAFkWy2Zsh7-QJUelBkFsFYA`

**3. DEBUG**
- Name: `DEBUG`
- Value: `False`

**4. CORS_ORIGINS**
- Name: `CORS_ORIGINS`
- Value: `["https://www.zakup.one","https://zakup.one","http://www.zakup.one","http://zakup.one"]`

#### Дополнительные переменные (опционально):

**5. API_V1_PREFIX**
- Name: `API_V1_PREFIX`
- Value: `/api/v1`

**6. ALGORITHM**
- Name: `ALGORITHM`
- Value: `HS256`

**7. ACCESS_TOKEN_EXPIRE_MINUTES**
- Name: `ACCESS_TOKEN_EXPIRE_MINUTES`
- Value: `1440`

**8. UPLOAD_DIR**
- Name: `UPLOAD_DIR`
- Value: `./uploads`

**9. MAX_UPLOAD_SIZE**
- Name: `MAX_UPLOAD_SIZE`
- Value: `10485760`

### ШАГ 3: Сохранение настроек

1. После добавления всех переменных
2. Нажмите кнопку **"SAVE"** (синяя кнопка справа вверху)
3. Дождитесь сохранения настроек

### ШАГ 4: Перезапуск приложения

После сохранения приложение должно автоматически перезапуститься. Если нет:
1. Найдите кнопку перезапуска в панели управления
2. Или подождите несколько секунд для автоматического перезапуска

### ШАГ 5: Проверка работы

После перезапуска проверьте:

1. **API Health Check:**
   ```
   https://zakup.one/api/v1/health
   ```
   Должен вернуть: `{"status": "ok"}`

2. **Главная страница:**
   ```
   https://zakup.one
   ```

3. **API Документация:**
   ```
   https://zakup.one/api/docs
   ```

## ⚠️ Важно:

- Убедитесь что `requirements.txt` указан в "Configuration files"
- После установки зависимостей проверьте логи на наличие ошибок
- Если что-то не работает, проверьте логи приложения в панели Spaceship

## 🐛 Если возникли проблемы:

1. Проверьте логи приложения в панели Spaceship
2. Убедитесь что все переменные окружения добавлены правильно
3. Проверьте что зависимости установлены (кнопка "Run Pip Install")
4. Убедитесь что права доступа к файлам установлены правильно



