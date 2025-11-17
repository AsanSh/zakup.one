#!/bin/bash
# Скопируйте и выполните эту команду на сервере

cd /home/kdlqemdxxn/zakup.one
source /home/kdlqemdxxn/virtualenv/zakup.one/3.11/bin/activate

python3 << 'EOF'
import sys
from pathlib import Path
sys.path.insert(0, str(Path.cwd()))

# Загружаем .env
try:
    from dotenv import load_dotenv
    load_dotenv()
except:
    pass

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

