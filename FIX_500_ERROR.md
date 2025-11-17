# 🔧 ИСПРАВЛЕНИЕ 500 INTERNAL SERVER ERROR

## ❌ Проблема
Ошибка 500 при открытии `/login` или других страниц frontend.

## ✅ Решение

### ШАГ 1: Проверить что frontend/dist существует

```bash
cd /home/kdlqemdxxn/zakup.one
ls -la frontend/dist/index.html
```

Если файла нет - нужно собрать frontend:
```bash
cd frontend
npm install
npm run build
```

### ШАГ 2: Обновить urls.py на сервере

Я исправил `django_project/zakup_one/urls.py` для правильной обработки SPA routing.

Скопируйте обновленный файл из репозитория на сервер.

### ШАГ 3: Проверить настройки Django

В `django_project/zakup_one/settings.py` должно быть:

```python
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            BASE_DIR / 'templates',
            BASE_DIR.parent.parent / 'frontend' / 'dist',
        ],
        ...
    },
]
```

### ШАГ 4: Проверить логи Django

В панели Spaceship найдите логи приложения и проверьте:
- Какая именно ошибка происходит?
- Есть ли traceback?

### ШАГ 5: Включить DEBUG для диагностики

В `.env` на сервере:
```env
DEBUG=True
```

Это покажет подробные ошибки.

### ШАГ 6: Проверить права доступа

```bash
chmod 644 /home/kdlqemdxxn/zakup.one/frontend/dist/index.html
chmod 755 /home/kdlqemdxxn/zakup.one/frontend/dist
```

## 🔍 Диагностика

### Проверка 1: Frontend существует?

```bash
ls -la /home/kdlqemdxxn/zakup.one/frontend/dist/index.html
```

### Проверка 2: Django может найти файл?

```bash
cd /home/kdlqemdxxn/zakup.one/django_project
python manage.py shell
```

В shell:
```python
from pathlib import Path
project_root = Path('/home/kdlqemdxxn/zakup.one')
frontend_dist = project_root / 'frontend' / 'dist'
index_path = frontend_dist / 'index.html'
print(f"Exists: {index_path.exists()}")
print(f"Path: {index_path}")
```

### Проверка 3: Логи приложения

В панели Spaceship найдите логи и проверьте traceback ошибки.

## 🆘 Если все еще 500

### Временное решение: Упрощенный serve_frontend

Если проблема в пути к файлу, попробуйте упрощенную версию:

```python
def serve_frontend(request, path=''):
    """Serve frontend index.html for SPA routing"""
    index_path = Path('/home/kdlqemdxxn/zakup.one/frontend/dist/index.html')
    
    if index_path.exists():
        with open(index_path, 'r', encoding='utf-8') as f:
            return HttpResponse(f.read(), content_type='text/html')
    else:
        return JsonResponse({"error": "Frontend not found"}, status=404)
```

## 📋 Чеклист

- [ ] `frontend/dist/index.html` существует
- [ ] `django_project/zakup_one/urls.py` обновлен
- [ ] `django_project/zakup_one/settings.py` настроен правильно
- [ ] DEBUG=True в `.env` для диагностики
- [ ] Логи проверены на наличие ошибок
- [ ] Права доступа правильные

## 🎯 Главное

**500 ошибка обычно означает:**
1. Frontend не собран или не загружен
2. Неправильный путь к `index.html` в urls.py
3. Ошибка в коде Django (проверьте логи)

**После исправления urls.py и проверки frontend должно заработать!**
