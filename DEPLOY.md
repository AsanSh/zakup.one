# Инструкция по деплою на Spaceship

## Подготовка к деплою

### 1. Сборка Frontend

```bash
cd frontend
npm install
npm run build
```

Собранные файлы будут в `frontend/dist/`

### 2. Настройка Backend

Убедитесь, что все зависимости установлены:
```bash
pip install -r requirements.txt
```

### 3. Настройка базы данных

Если используется SQLite, файл `zakup.db` должен быть загружен на сервер.
Если используется PostgreSQL, настройте `DATABASE_URL` в `.env.production`

## Загрузка на Spaceship через FTP

### FTP данные:
- **Host:** ftp.spaceship.ru (или другой хост Spaceship)
- **Username:** www.zakup.one
- **Password:** ParolJok9@
- **Port:** 21 (обычно)

### Структура файлов на сервере:

```
/
├── .htaccess
├── wsgi.py
├── .env (скопируйте из .env.production и настройте)
├── requirements.txt
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── core/
│   ├── api/
│   ├── models/
│   └── services/
├── frontend/
│   └── dist/  (собранные файлы frontend)
├── uploads/  (создать папку для загрузок)
└── zakup.db  (если используется SQLite)
```

### Шаги загрузки:

1. **Подключитесь через FTP клиент** (FileZilla, Cyberduck и т.д.)

2. **Загрузите файлы:**
   - Все файлы из корня проекта (кроме venv, node_modules, .git)
   - Папку `app/` полностью
   - Папку `frontend/dist/` (собранные файлы)
   - Файлы `.htaccess`, `wsgi.py`, `requirements.txt`
   - Файл `.env.production` как `.env` (и настройте его)

3. **Создайте необходимые папки:**
   - `uploads/` - для загрузки прайс-листов
   - `downloads/` - если используется

4. **Настройте права доступа:**
   - Папки: 755
   - Файлы: 644
   - `uploads/`: 777 (для записи файлов)

## Настройка домена

### В панели управления Spaceship:

1. Зайдите в настройки домена
2. Добавьте домен `www.zakup.one` или `zakup.one`
3. Настройте DNS записи (если нужно):
   - A запись: IP адрес сервера Spaceship
   - CNAME для www: основной домен

### Настройка Python на Spaceship:

1. В панели управления выберите Python приложение
2. Укажите точку входа: `wsgi:application`
3. Установите зависимости: `pip install -r requirements.txt`
4. Настройте переменные окружения из `.env`

## Проверка после деплоя

1. Проверьте доступность сайта: `https://www.zakup.one`
2. Проверьте API: `https://www.zakup.one/api/v1/health`
3. Проверьте загрузку файлов (создайте папку uploads с правами 777)

## Важные замечания

- **SECRET_KEY**: Обязательно измените в `.env` на случайную строку!
- **База данных**: Если используете SQLite, убедитесь что файл доступен для записи
- **CORS**: Настройте `CORS_ORIGINS` в `.env` для вашего домена
- **HTTPS**: После настройки SSL, раскомментируйте правила HTTPS в `.htaccess`

## Обновление сайта

При обновлении:
1. Соберите frontend: `cd frontend && npm run build`
2. Загрузите обновленные файлы через FTP
3. Перезапустите приложение в панели Spaceship (если нужно)



