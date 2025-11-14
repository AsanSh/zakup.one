# 📋 Пошаговая инструкция для панели Spaceship

## ШАГ 1: Добавление requirements.txt

В секции **"Configuration files"**:

1. Найдите поле с текстом: **"Add another file and press enter"**
2. **Введите в это поле:** `requirements.txt`
3. Нажмите кнопку **"+ Add"** (синяя кнопка справа) или нажмите **Enter**

После этого `requirements.txt` должен появиться в списке файлов.

## ШАГ 2: Установка зависимостей

1. После того как `requirements.txt` появится в списке
2. Нажмите кнопку **"Run Pip Install"** (синяя кнопка с иконкой ▶️)
3. Дождитесь завершения установки (2-5 минут)
4. Проверьте что нет ошибок в выводе

## ШАГ 3: Добавление переменных окружения

В секции **"Environment variables"**:

Нажмите **"+ ADD VARIABLE"** и добавьте по одной:

| Имя переменной | Значение |
|---------------|----------|
| `DATABASE_URL` | `sqlite:///./zakup.db` |
| `SECRET_KEY` | `qfM-nNd85eKQRQS34q0TAFkWy2Zsh7-QJUelBkFsFYA` |
| `DEBUG` | `False` |
| `CORS_ORIGINS` | `["https://www.zakup.one","https://zakup.one","http://www.zakup.one","http://zakup.one"]` |

## ШАГ 4: Сохранение

1. После добавления всех переменных
2. Нажмите кнопку **"SAVE"** (синяя кнопка справа вверху)
3. Дождитесь сохранения и перезапуска приложения

## ✅ Проверка

После сохранения проверьте:
- https://zakup.one/health
- https://zakup.one/api/v1/health

## ⚠️ Важно

- Файл `requirements.txt` уже загружен на сервер в папку `zakup.one`
- Просто укажите его имя в поле: `requirements.txt` (без пути!)
- Не указывайте полный путь типа `/zakup.one/requirements.txt` - только имя файла!



