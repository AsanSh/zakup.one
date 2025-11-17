# 🔧 СОЗДАНИЕ ПОЛЬЗОВАТЕЛЯ НА СЕРВЕРЕ

## ❌ Проблема
Файл `create_superadmin.py` не найден на сервере.

## ✅ Решение

### Вариант 1: Выполнить команду напрямую (РЕКОМЕНДУЕТСЯ)

Скопируйте и выполните эту команду в терминале на сервере:

```bash
cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
python3 << 'EOF'
import sys
from pathlib import Path
sys.path.insert(0, str(Path.cwd()))

# Загружаем .env
from dotenv import load_dotenv
load_dotenv()

from app.core.database import SessionLocal
from app.models.user import User
from app.api.v1.endpoints.auth import get_password_hash

db = SessionLocal()
email = "asannameg@gmail.com"
password = "ParolJok6#"
full_name = "asannameg"

existing_user = db.query(User).filter(User.email == email).first()

if existing_user:
    print("⚠️  Пользователь уже существует! Обновляю...")
    existing_user.hashed_password = get_password_hash(password)
    existing_user.is_admin = True
    existing_user.is_verified = True
    existing_user.is_active = True
    existing_user.full_name = full_name
    existing_user.company = "ZAKUP.ONE"
    db.commit()
    print("✅ Пользователь обновлен!")
else:
    superadmin = User(
        email=email,
        full_name=full_name,
        company="ZAKUP.ONE",
        hashed_password=get_password_hash(password),
        is_admin=True,
        is_verified=True,
        is_active=True
    )
    db.add(superadmin)
    db.commit()
    print("✅ Суперадминистратор создан!")

print(f"\n📋 Данные для входа:")
print(f"   Email: {email}")
print(f"   Пароль: {password}")

db.close()
EOF
```

### Вариант 2: Загрузить файл через FTP

1. Скачайте `create_superadmin.py` из репозитория
2. Загрузите его на сервер в `/home/kdlqemdxxn/zakup.one/`
3. Выполните:
   ```bash
   cd /home/kdlqemdxxn/zakup.one
   source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
   python create_superadmin.py
   ```

### Вариант 3: Использовать "Execute python script" в Spaceship

1. Откройте панель Spaceship
2. Перейдите в "Execute python script"
3. Скопируйте содержимое из `create_user_inline.py`
4. Вставьте и выполните

### Вариант 4: Создать файл на сервере

```bash
cd /home/kdlqemdxxn/zakup.one
cat > create_superadmin.py << 'ENDOFFILE'
#!/usr/bin/env python3
import sys
from pathlib import Path
sys.path.insert(0, str(Path.cwd()))

from dotenv import load_dotenv
load_dotenv()

from app.core.database import SessionLocal
from app.models.user import User
from app.api.v1.endpoints.auth import get_password_hash

db = SessionLocal()
email = "asannameg@gmail.com"
password = "ParolJok6#"
full_name = "asannameg"

existing_user = db.query(User).filter(User.email == email).first()

if existing_user:
    print("⚠️  Обновляю существующего пользователя...")
    existing_user.hashed_password = get_password_hash(password)
    existing_user.is_admin = True
    existing_user.is_verified = True
    existing_user.is_active = True
    existing_user.full_name = full_name
    existing_user.company = "ZAKUP.ONE"
    db.commit()
    print("✅ Обновлен!")
else:
    superadmin = User(
        email=email,
        full_name=full_name,
        company="ZAKUP.ONE",
        hashed_password=get_password_hash(password),
        is_admin=True,
        is_verified=True,
        is_active=True
    )
    db.add(superadmin)
    db.commit()
    print("✅ Создан!")

print(f"\n📋 Email: {email}")
print(f"📋 Пароль: {password}")

db.close()
ENDOFFILE

chmod +x create_superadmin.py
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate
python create_superadmin.py
```

## 🎯 Рекомендация

**Используйте Вариант 1** - это самый быстрый способ, не требует загрузки файлов.

После выполнения вы сможете войти с:
- **Email**: `asannameg@gmail.com`
- **Пароль**: `ParolJok6#`

