# 🔧 ИСПРАВЛЕНИЕ WSGI ДЛЯ DJANGO

## ❌ Ошибки

1. **"No such WSGI script '/home/kdlqemdxxn/zakup.one/wsgi_django.py'"**
   - Файл не найден или неправильный путь

2. **"shutil.Error: Cannot move a directory into itself"**
   - Проблема с путями в настройках Spaceship

## ✅ Решение

### ШАГ 1: Использовать правильный wsgi.py

Я создал `wsgi.py` в корне проекта, который работает с Django.

**Важно**: Файл должен быть в `/home/kdlqemdxxn/zakup.one/wsgi.py` (не `wsgi_django.py`)

### ШАГ 2: Настроить Spaceship

В панели Spaceship для Python приложения:

1. **Application root**: `/home/kdlqemdxxn/zakup.one`
   - ✅ Корень проекта (не django_project)

2. **Startup file**: `wsgi.py`
   - ✅ Файл в корне проекта

3. **Entry point**: `application`
   - ✅ БЕЗ `:` или других символов

4. **Python version**: `3.11`

5. **Status**: `Running`

### ШАГ 3: Проверить структуру на сервере

```bash
cd /home/kdlqemdxxn/zakup.one
ls -la wsgi.py
ls -la django_project/
ls -la django_project/zakup_one/
```

Должно быть:
- `wsgi.py` в корне
- `django_project/` директория
- `django_project/zakup_one/settings.py`

### ШАГ 4: Установить зависимости Django

```bash
cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
pip install -r requirements_django.txt
```

### ШАГ 5: Создать миграции

```bash
cd /home/kdlqemdxxn/zakup.one/django_project
python manage.py makemigrations
python manage.py migrate
```

### ШАГ 6: Создать суперадминистратора

```bash
python manage.py createsuperuser
```

## 🔍 Диагностика

### Проверка 1: wsgi.py существует?

```bash
ls -la /home/kdlqemdxxn/zakup.one/wsgi.py
```

### Проверка 2: django_project существует?

```bash
ls -la /home/kdlqemdxxn/zakup.one/django_project/
```

### Проверка 3: Django установлен?

```bash
python -c "import django; print(django.get_version())"
```

### Проверка 4: Настройки правильные?

В Spaceship проверьте:
- Application root = `/home/kdlqemdxxn/zakup.one` (НЕ `/home/kdlqemdxxn/zakup.one/django_project`)
- Startup file = `wsgi.py`
- Entry point = `application`

## 📋 Чеклист

- [ ] `wsgi.py` в корне проекта (`/home/kdlqemdxxn/zakup.one/wsgi.py`)
- [ ] `django_project/` директория существует
- [ ] `django_project/zakup_one/settings.py` существует
- [ ] Django установлен (`pip install -r requirements_django.txt`)
- [ ] Миграции созданы и применены
- [ ] Spaceship: Application root = `/home/kdlqemdxxn/zakup.one`
- [ ] Spaceship: Startup file = `wsgi.py`
- [ ] Spaceship: Entry point = `application`
- [ ] Spaceship: Status = `Running`

## 🎯 Главное

**Проблема**: Spaceship ищет `wsgi_django.py`, но нужно использовать `wsgi.py` в корне проекта.

**Решение**: 
1. Использовать обновленный `wsgi.py` (уже создан)
2. Настроить Spaceship правильно (Application root = корень проекта)
3. Установить Django зависимости
4. Запустить миграции

После этого Django должен заработать!

