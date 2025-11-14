# ⚡ Быстрый деплой - Шпаргалка

## 🎯 Ваш стек:
- **Frontend**: React + TypeScript + Vite
- **Backend**: FastAPI (Python 3.11)
- **База данных**: PostgreSQL
- **Хостинг**: Spaceship
- **Домен**: zakup.one

---

## 📋 Чеклист деплоя (5 минут)

### ✅ Локально (1 минута)
```bash
cd frontend
npm run build
```

### ✅ Загрузка на сервер (2 минуты)
**FTP:**
- Host: `ftp.zakup.one`
- User: `www.zakup.one`
- Pass: `ParolJok9@`

**Загрузить:**
- `app/` (вся папка)
- `frontend/dist/` (вся папка)
- `wsgi.py`
- `requirements.txt`

### ✅ На сервере (2 минуты)

**1. Создайте `.env`:**
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/zakup_one
SECRET_KEY=ваш-секретный-ключ-32-символа
DEBUG=False
CORS_ORIGINS=["https://zakup.one","https://www.zakup.one"]
```

**2. В панели Spaceship:**
- Configuration files → Добавьте `requirements.txt` → **Run Pip Install**
- Python settings:
  - Root: `/home/kdlqemdxxn/zakup.one`
  - Entry: `wsgi:application`
  - File: `wsgi.py`

**3. Создайте папки:**
```bash
mkdir -p uploads downloads
chmod 777 uploads downloads
```

### ✅ Проверка
```
https://zakup.one/health          → {"status": "ok"}
https://zakup.one/api/v1/health    → {"status": "ok"}
https://zakup.one/                 → Frontend
```

---

## 🐛 Если не работает:

### Ошибка 500?
1. Проверьте логи в панели Spaceship
2. Убедитесь что зависимости установлены
3. Проверьте что `wsgi.py` существует

### Frontend не загружается?
1. Проверьте что `frontend/dist/index.html` существует
2. Проверьте `.htaccess`

### База данных не подключается?
1. Проверьте `DATABASE_URL` в `.env`
2. Создайте базу данных через панель

---

## 🚀 Альтернатива: Упрощенная версия

Если не работает, используйте упрощенную версию:

1. Загрузите `app/main_simple.py` → `app/main.py`
2. Загрузите `wsgi_simple.py` → `wsgi.py`
3. Загрузите `requirements_simple.txt` → `requirements.txt`
4. Установите зависимости (4 пакета вместо 20+)

---

## 📖 Полное руководство

См. `DEPLOYMENT_GUIDE.md` для детальных инструкций.

