# ✅ Финальное руководство по деплою

## 🔧 Что было исправлено:

1. ✅ **wsgi.py** - улучшена обработка ошибок, правильные пути, создание директорий
2. ✅ **app/core/config.py** - SQLite по умолчанию, добавлен DOWNLOADS_DIR
3. ✅ **app/main.py** - исправлены пути к статическим файлам, добавлен SPA routing
4. ✅ **install_dependencies_fixed.sh** - правильный скрипт установки зависимостей

## 📋 Структура на сервере:

```
/home/kdlqemdxxn/zakup.one/
├── wsgi.py                    ✅ Обновлен
├── requirements.txt           ✅ Обновлен
├── install_dependencies_fixed.sh ✅ Новый скрипт
├── .env                       (настройте переменные окружения)
├── .htaccess                  ✅
├── app/
│   ├── main.py               ✅ Обновлен
│   ├── core/
│   │   └── config.py         ✅ Обновлен
│   ├── api/
│   ├── models/
│   └── services/
├── frontend/
│   └── dist/                 ✅ Собранный frontend
├── uploads/                   (создается автоматически)
└── downloads/                 (создается автоматически)
```

## 🚀 Шаги для завершения деплоя:

### 1. Установка зависимостей

**ВАРИАНТ А: Через панель Spaceship (РЕКОМЕНДУЕТСЯ)**

В секции **"Execute python script"** введите:
```
bash /home/kdlqemdxxn/zakup.one/install_dependencies_fixed.sh
```
Нажмите **"Run Script"**

**ВАРИАНТ Б: Через SSH терминал**

```bash
cd /home/kdlqemdxxn/zakup.one
bash install_dependencies_fixed.sh
```

**ВАРИАНТ В: Через панель "Configuration files"**

1. Убедитесь что в списке есть: `requirements.txt`
2. Нажмите **"Run Pip Install"**

### 2. Настройка переменных окружения

В панели Spaceship в секции **"Environment variables"** добавьте:

| Имя | Значение |
|-----|----------|
| `DATABASE_URL` | `sqlite:///./zakup.db` |
| `SECRET_KEY` | `qfM-nNd85eKQRQS34q0TAFkWy2Zsh7-QJUelBkFsFYA` |
| `DEBUG` | `False` |
| `CORS_ORIGINS` | `["https://www.zakup.one","https://zakup.one","http://www.zakup.one","http://zakup.one"]` |

### 3. Сохранение и перезапуск

1. Нажмите **"SAVE"** в панели Spaceship
2. Дождитесь перезапуска приложения

### 4. Проверка работы

После перезапуска проверьте:

- **Health check:** https://zakup.one/health
- **API Health:** https://zakup.one/api/v1/health
- **Главная страница:** https://zakup.one
- **API Docs:** https://zakup.one/api/docs

## 🔍 Если что-то не работает:

### Проверьте логи в панели Spaceship

Найдите раздел "Logs" или "Application Logs" и проверьте ошибки.

### Типичные проблемы:

1. **"Application initialization failed"**
   - Проверьте что все зависимости установлены
   - Проверьте переменные окружения
   - Проверьте логи для деталей

2. **"Could not open requirements file"**
   - Убедитесь что файл `requirements.txt` в корне проекта
   - Используйте скрипт `install_dependencies_fixed.sh`

3. **"Database connection error"**
   - Проверьте `DATABASE_URL` в переменных окружения
   - Убедитесь что папка доступна для записи (для SQLite)

4. **Frontend не загружается**
   - Проверьте что `frontend/dist/` загружен на сервер
   - Проверьте права доступа к файлам

## ✅ Все файлы обновлены и загружены на сервер!

Теперь нужно только установить зависимости и настроить переменные окружения.



