# 📋 Пошаговая инструкция: Шаги 1, 2, 3

## 🎯 ШАГ 1: Загрузите backend файлы на сервер

### Вариант A: Через File Manager (панель Spaceship)

1. **Откройте панель Spaceship**
   - Зайдите на сайт хостинга Spaceship
   - Войдите в панель управления

2. **Откройте File Manager**
   - Найдите раздел "File Manager" или "Файловый менеджер"
   - Перейдите в директорию: `/home/kdlqemdxxn/zakup.one/`

3. **Загрузите ZIP файл**
   - Нажмите кнопку "Upload" или "Загрузить"
   - Выберите файл `backend-files.zip` с вашего компьютера
   - Дождитесь завершения загрузки

4. **Распакуйте архив**
   - Найдите файл `backend-files.zip` в списке файлов
   - Кликните правой кнопкой мыши (или выберите в меню)
   - Выберите "Extract" или "Распаковать"
   - Убедитесь что распаковка идет в текущую директорию (`/home/kdlqemdxxn/zakup.one/`)

5. **Проверьте результат**
   - Должны появиться:
     - Папка `app/`
     - Файл `wsgi.py`
     - Файл `requirements.txt`
     - Файл `.htaccess`

### Вариант B: Через FTP (FileZilla, WinSCP)

1. **Подключитесь к серверу**
   - Host: `ftp.zakup.one` или IP сервера
   - Username: `www.zakup.one`
   - Password: `ParolJok9@`
   - Port: `21`

2. **Перейдите в директорию**
   - Перейдите в `/home/kdlqemdxxn/zakup.one/`

3. **Загрузите ZIP файл**
   - Перетащите `backend-files.zip` из локальной папки в удаленную
   - Дождитесь завершения загрузки

4. **Распакуйте через SSH или панель**
   - Через SSH: `cd /home/kdlqemdxxn/zakup.one && unzip backend-files.zip`
   - Или через File Manager: выберите файл → Extract

---

## ⚙️ ШАГ 2: Создайте .env файл

### Способ 1: Через File Manager (РЕКОМЕНДУЕТСЯ)

1. **Откройте File Manager**
   - Перейдите в `/home/kdlqemdxxn/zakup.one/`

2. **Создайте новый файл**
   - Нажмите кнопку "New File" или "Создать файл"
   - Имя файла: `.env` (с точкой в начале!)

3. **Откройте файл для редактирования**
   - Кликните на файл `.env`
   - Выберите "Edit" или "Редактировать"

4. **Вставьте содержимое:**
```env
# База данных
DATABASE_URL=postgresql://user:password@localhost:5432/zakup_one

# Безопасность
SECRET_KEY=ваш-секретный-ключ-минимум-32-символа-случайные-символы
DEBUG=False

# CORS
CORS_ORIGINS=["https://zakup.one","https://www.zakup.one"]

# Пути
UPLOAD_DIR=/home/kdlqemdxxn/zakup.one/uploads
DOWNLOADS_DIR=/home/kdlqemdxxn/zakup.one/downloads
```

5. **ВАЖНО: Замените значения:**
   - `DATABASE_URL` - на реальные данные вашей БД PostgreSQL
     - Формат: `postgresql://username:password@host:port/database`
     - Пример: `postgresql://zakup_user:mypassword@localhost:5432/zakup_one`
   - `SECRET_KEY` - на случайную строку (минимум 32 символа)
     - Можно сгенерировать: `openssl rand -hex 32`
     - Или использовать онлайн генератор

6. **Сохраните файл**
   - Нажмите "Save" или "Сохранить"

### Способ 2: Через SSH (если доступен)

```bash
cd /home/kdlqemdxxn/zakup.one
nano .env
```

Вставьте содержимое выше, замените значения, сохраните (Ctrl+O, Enter, Ctrl+X)

### Способ 3: Создать локально и загрузить

1. **Создайте файл `.env` на вашем компьютере**
   - Скопируйте содержимое выше
   - Сохраните как `.env`

2. **Загрузите через File Manager или FTP**
   - В директорию `/home/kdlqemdxxn/zakup.one/`

---

## 📦 ШАГ 3: Установите зависимости Python

### Способ 1: Через панель Spaceship (САМЫЙ ПРОСТОЙ)

1. **Откройте панель Spaceship**
   - Зайдите в панель управления

2. **Найдите раздел "Configuration files"**
   - Может называться "Файлы конфигурации" или "Python Configuration"

3. **Добавьте requirements.txt**
   - Если `requirements.txt` уже в списке - отлично!
   - Если нет:
     - В поле "Add another file" введите: `requirements.txt`
     - Нажмите "+ Add" или "Добавить"

4. **Установите зависимости**
   - Найдите кнопку **"Run Pip Install"** или **"Установить зависимости"**
   - Нажмите на неё
   - Дождитесь завершения (3-5 минут)
   - Вы увидите процесс установки в логах

5. **Проверьте результат**
   - Должно быть сообщение об успешной установке
   - Или список установленных пакетов

### Способ 2: Через SSH (если доступен)

```bash
# Перейдите в директорию проекта
cd /home/kdlqemdxxn/zakup.one

# Активируйте виртуальное окружение
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate

# Установите зависимости
pip install -r requirements.txt

# Деактивируйте окружение
deactivate
```

### Способ 3: Через терминал в панели

1. **Найдите раздел "Terminal" или "SSH Terminal"**
2. **Выполните команды:**
```bash
cd /home/kdlqemdxxn/zakup.one
/home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/pip install -r requirements.txt
```

---

## ✅ Проверка после выполнения шагов 1-3

### Проверьте структуру файлов:

В File Manager должно быть:
```
/home/kdlqemdxxn/zakup.one/
├── app/                    ← ✅ Должна быть
│   ├── __init__.py
│   ├── main.py
│   ├── core/
│   ├── api/
│   ├── models/
│   └── services/
├── frontend/
│   └── dist/               ← ✅ Уже есть
│       ├── index.html
│       └── assets/
├── wsgi.py                 ← ✅ Должен быть
├── requirements.txt        ← ✅ Должен быть
├── .env                    ← ✅ Должен быть (ШАГ 2)
└── .htaccess               ← ✅ Должен быть
```

### Проверьте что зависимости установлены:

В панели Spaceship:
- Configuration files → `requirements.txt` → должен быть в списке
- Должно быть сообщение об успешной установке

---

## 🆘 Если что-то не работает:

### Проблема: Не могу найти File Manager
- Ищите разделы: "Files", "File Manager", "Файлы", "Файловый менеджер"
- Или используйте FTP (FileZilla)

### Проблема: Не могу создать .env файл
- Убедитесь что имя файла начинается с точки: `.env` (не `env`)
- Попробуйте создать через SSH или загрузить готовый файл

### Проблема: Run Pip Install не работает
- Проверьте что `requirements.txt` существует
- Проверьте что он добавлен в Configuration files
- Попробуйте через SSH (если доступен)

### Проблема: Ошибка при установке зависимостей
- Проверьте логи в панели Spaceship
- Убедитесь что Python версия правильная (3.11)
- Попробуйте установить через SSH для детальных ошибок

---

## 📞 Следующие шаги:

После выполнения шагов 1-3:
- ✅ ШАГ 4: Настройте Spaceship (см. NEXT_STEPS_AFTER_UNZIP.md)
- ✅ ШАГ 5: Создайте папки uploads и downloads
- ✅ ШАГ 6: Проверьте работу приложения

**Готово! Приступайте к шагу 1! 🚀**

