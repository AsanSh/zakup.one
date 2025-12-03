# GLOBAL RULES FOR CURSOR FOR PROJECT "ZAKUP.ONE"

## 0. Общие принципы работы ИИ в Cursor

1. **Никаких лишних файлов.**
   - НЕ создавать новый файл при каждой ошибке.
   - При исправлении ошибки сначала анализировать существующий файл и **минимально править его**.
   - Создавать новый файл только если:
     - это новая фича, которой ещё нет;
     - или я (пользователь) прямо попросил создать новый файл / модуль.

2. **Не трогать корень проекта без крайней необходимости.**
   - Структура репозитория задаётся один раз (см. ниже) и потом только дорабатывается.
   - Не создавать новые проекты Django / React в корне, если они уже есть.
   - Не менять структуру на своё усмотрение, только по прямому запросу пользователя.

3. **Правки поверх существующего кода.**
   - Если нужно исправить логику — править код в существующем файле (функция, класс, компонент).
   - НЕ создавать `*_fixed.py`, `*_new.tsx`, `*_v2.*` и подобные файлы.
   - Делать дифф как можно меньше: только нужные изменения.

4. **Docker-first.**
   - Проект должен запускаться через `docker-compose up` без дополнительных ручных шагов.
   - Все зависимости (PostgreSQL, Elasticsearch, backend, frontend) поднимаются через Docker.
   - Локальный запуск без Docker — второстепенный (по желанию).

5. **Комментарии и объяснения.**
   - Код писать чистый, самодокументируемый.
   - При сложной логике добавлять короткие комментарии.
   - В ответах в чате объяснять, какие файлы созданы/изменены и как запускать.

---

## 1. Архитектура проекта

Проект делим на три основных блока:

- `backend/` — Django + DRF (API, бизнес-логика).
- `frontend/` — React + TypeScript + Zustand + Tailwind CSS (UI, ЛК клиента и админ-панель).
- `infra/` — `docker-compose.yml`, Dockerfile'ы, env-файлы, миграции данных, скрипты деплоя.

Стек:

- **Backend**: Python 3 + Django + Django REST Framework.
- **DB**: PostgreSQL.
- **Search**: Elasticsearch (для умного поиска с автодополнением).
- **Frontend**: React + TypeScript + Vite (или Next.js, но по умолчанию Vite) + Zustand + Tailwind CSS.
- **OCR**: Tesseract.js (первый этап — просто заглушка / интерфейс; реальную интеграцию можно доработать позже).
- **Парсинг Excel**: `pandas` или `openpyxl`/`xlsxwriter` (зависит от удобства).

---

## 2. Структура репозитория

Создать такую структуру:

```
zakup.one/
backend/
  manage.py
  pyproject.toml / requirements.txt
  zakup_backend/ # основной django-проект
    settings.py
    urls.py
    asgi.py / wsgi.py
  apps/
    users/ # пользователи, компании, роли
    suppliers/ # поставщики, прайс-листы
    catalog/ # товары, категории, цены
    orders/ # корзина, заявки, статусы
    search/ # интеграция с Elasticsearch
frontend/
  src/
    app/
    pages/
    components/
    features/
    store/
infra/
  docker-compose.yml
  backend.Dockerfile
  frontend.Dockerfile
  env/
    backend.example.env
    db.example.env
    search.example.env
```

**ВАЖНО:**  
Если структура уже создана — **НЕ ПЕРЕСОБИРАТЬ** её заново, а дорабатывать существующие файлы.

---

## 3. Модели и домен (Django)

### 3.1. Общие сущности

Создать модели (упрощённо, без лишней детализации):

- `users.User`
  - email (уникальный, логин)
  - full_name
  - role (`ADMIN`, `CLIENT`)
  - company (FK -> `users.Company`, nullable)
  - is_active, is_staff, is_superuser

- `users.Company`
  - name
  - phone
  - inn/optional fields
  - approved (bool) — подтверждена ли компания админом (после регистрации).

- `suppliers.Supplier`
  - name
  - internal_code
  - is_active

- `suppliers.PriceList`
  - supplier (FK -> Supplier)
  - file (путь к загруженному файлу)
  - uploaded_at
  - status (`NEW`, `PROCESSED`, `FAILED`)
  - log (текст, что пошло не так)

- `catalog.Category`
  - name
  - parent (FK -> self, nullable)

- `catalog.Product`
  - name
  - article
  - unit (строка: шт, м, кг, м3 и т.п.)
  - category (FK -> Category)
  - is_active
  - base_price (цена поставщика)
  - markup_percent (наценка админа)
  - final_price (продажная цена для клиента) — обновляется при пересчёте.

- `orders.Order`
  - client (FK -> User)
  - company (FK -> Company)
  - status (`NEW`, `IN_PROGRESS`, `COLLECTED`, `DELIVERED`)
  - delivery_address
  - delivery_date (желаемая)
  - comment
  - created_at, updated_at

- `orders.OrderItem`
  - order (FK -> Order)
  - product (FK -> Product)
  - quantity
  - price (фиксированная цена на момент заявки)
  - total_price

**Скрытие поставщика:**  
Информация о поставщике **НЕ** должна попадать в сериализаторы/эндпоинты для клиентов.

---

## 4. API (DRF)

Организовать API с префиксом `/api/`:

- Auth:
  - `POST /api/auth/login/` — логин по email/пароль (JWT или simple token).
  - `POST /api/auth/register/` — регистрация компании/снабженца (создаётся заявка в статусе pending, доступ только после одобрения админом).

- Admin:
  - `GET/POST /api/admin/suppliers/`
  - `POST /api/admin/pricelists/upload/` — загрузка XLSX.
  - `POST /api/admin/pricelists/:id/process/` — парсинг файла и обновление каталога.
  - `POST /api/admin/products/bulk-pricing/` — массовое изменение цен и наценок.
  - `GET/PUT /api/admin/orders/` — просмотр/смена статусов заявок.
  - `GET/PUT /api/admin/clients/` — управление снабженцами.

- Client:
  - `GET /api/catalog/search/?q=` — умный поиск (интеграция с Elasticsearch).
  - `GET /api/catalog/products/` — список товаров (с пагинацией, фильтрами).
  - `POST /api/orders/` — создание заявки (из корзины).
  - `GET /api/orders/` — история заявок клиента.
  - `POST /api/orders/parse-text/` — Способ 2 (текстовый ввод, простой NLP).
  - `POST /api/orders/parse-excel/` — Способ 3 (Excel).
  - `POST /api/orders/parse-image/` — Способ 3 (фото + OCR, пока можно сделать заглушку и вернуть 501 или тестовый ответ).

---

## 5. Поиск (Elasticsearch)

- Сервис `search` в backend:
  - Индексация продуктов (`id, name, article, final_price, unit, category`).
  - Эндпоинт для автодополнения:
    - `GET /api/catalog/search/?q=` — возвращает первые N позиций.
  - Важно обеспечить задержку ответа `< 200–300 мс` при нормальном объёме.

**Cursor:**  
Настроить:
- фоновую команду для индексации (management command или signal при сохранении товара);
- отдельный модуль/файл `backend/apps/search/services.py`.

---

## 6. Frontend

### 6.1. Общие требования

- Язык интерфейса: **русский**.
- Дизайн: минималистичный, приоритет — удобство работы с таблицами на десктопе.
- Адаптивность: корректное отображение на ноутбуке / планшете, мобильная версия упрощённая.

### 6.2. Структура

В `frontend/src`:

- `app/` — корневой layout, маршрутизация (React Router).
- `pages/`
  - `LoginPage`
  - `RegisterPage`
  - `ClientDashboard`
  - `AdminDashboard`
  - `ProductsPage`
  - `OrdersPage`
  - `AdminOrdersPage`
  - `PriceUploadPage`
- `components/`
  - `SearchBar` (с автодополнением)
  - `ProductTable`
  - `Cart`
  - `OrderForm`
  - `FileUpload`
- `store/`
  - Zustand-стейт: userStore, cartStore, ordersStore, uiStore.

### 6.3. Функции клиентской части

- В верхней части — глобальный поиск с автодополнением:
  - при вводе показывать выпадающий список (название, единица измерения, цена, чекбокс).
  - возможность добавлять в корзину прямо из выпадающего списка.

- Страница корзины:
  - список товаров,
  - изменение количества,
  - удаление,
  - переход к оформлению заявки.

- Оформление заявки:
  - поля: объект доставки (адрес), дата, контактное лицо, комментарий, файл для прикрепления.

- История заявок:
  - таблица с колонками: номер, дата, статус, сумма.

- Админ-панель:
  - раздел "Прайс-листы" — загрузка XLSX, запуск обработки.
  - раздел "Товары" — список, фильтры, массовое изменение наценок.
  - раздел "Клиенты" — заявки на регистрацию, одобрить/отклонить.
  - раздел "Заявки" — изменение статуса (`Новая`, `В обработке`, `Собрана`, `Доставлена`).

---

## 7. Docker и запуск

Создать `docker-compose.yml` со службами:

- `backend` — Django + gunicorn/uvicorn.
- `frontend` — React dev-server (на dev-этапе).
- `db` — PostgreSQL.
- `search` — Elasticsearch.
- (по желанию) `nginx` — для прод-сборки.

**Cursor, обязательные задачи:**

1. Написать `backend.Dockerfile`:
   - установить зависимости, 
   - скопировать проект,
   - пробросить `CMD` для `gunicorn`/`uvicorn`.

2. Написать `frontend.Dockerfile`:
   - node:lts образ,
   - установка deps,
   - `npm run dev` для разработки или `npm run build` + serve для прод.

3. В `docker-compose.yml`:
   - Прописать сети, env-файлы, зависимости (`depends_on`).
   - Сделать так, чтобы команда `docker-compose up`:
     - поднимала БД и Elasticsearch;
     - мигрировала базу (`python manage.py migrate` через `command` или `entrypoint`);
     - стартовала backend и frontend.

---

## 8. Обработка ошибок и доработка

1. При возникновении ошибок:
   - НЕ СОЗДАВАТЬ новые проекты / директории.
   - НЕ СОЗДАВАТЬ отдельные файлы "fix_*".
   - Сначала проанализировать лог, потом внести точечные правки.

2. Всегда:
   - описывать в ответе, какие файлы были изменены;
   - давать команду для запуска/перезапуска (например, `docker-compose up --build backend`).

3. Тесты:
   - начать с простых unit-тестов для критичных частей:
     - парсинг Excel,
     - массовое обновление цен,
     - базовый поиск.

---

## 9. Приоритеты реализации

Реализовывать поэтапно:

1. Базовый каркас:
   - структура репозитория,
   - Docker,
   - базовые модели и миграции,
   - минимальный API для auth и каталога.

2. Умный поиск + корзина + заказ (Способ 1 — классический).

3. Загрузка прайсов и массовое управление ценами.

4. История заявок и статусы.

5. Способ 2 (текстовый ввод) — сначала простое разбор строки без ML.

6. Способ 3 (Excel и фото) — сначала Excel, затем OCR.



