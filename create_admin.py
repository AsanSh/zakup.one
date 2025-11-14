#!/usr/bin/env python3
"""
Скрипт для создания администратора в базе данных
Запуск: python3 create_admin.py
"""
import sys
from pathlib import Path

# Добавляем путь к проекту
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from app.core.database import SessionLocal
from app.models.user import User
from app.api.v1.endpoints.auth import get_password_hash

def create_admin():
    """Создание администратора"""
    db = SessionLocal()
    
    try:
        # Проверяем существует ли уже админ
        admin = db.query(User).filter(User.email == "admin@zakup.one").first()
        
        if admin:
            print("⚠️  Администратор уже существует!")
            print(f"   Email: {admin.email}")
            print(f"   Имя: {admin.full_name}")
            print(f"   Админ: {admin.is_admin}")
            print(f"   Активен: {admin.is_active}")
            print(f"   Верифицирован: {admin.is_verified}")
            
            # Обновляем пароль если нужно
            response = input("\nОбновить пароль? (y/n): ")
            if response.lower() == 'y':
                admin.hashed_password = get_password_hash("admin")
                db.commit()
                print("✅ Пароль обновлен!")
            
            return
        
        # Создаем нового администратора
        admin = User(
            email="admin@zakup.one",
            full_name="Администратор",
            company="ZAKUP.ONE",
            hashed_password=get_password_hash("admin"),
            is_admin=True,
            is_verified=True,
            is_active=True
        )
        
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        print("✅ Администратор создан успешно!")
        print(f"   Email: {admin.email}")
        print(f"   Пароль: admin")
        print(f"   ID: {admin.id}")
        
    except Exception as e:
        print(f"❌ Ошибка при создании администратора: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 50)
    print("🔧 СОЗДАНИЕ АДМИНИСТРАТОРА")
    print("=" * 50)
    print()
    print("Email: admin@zakup.one")
    print("Пароль: admin")
    print()
    
    create_admin()
    
    print()
    print("=" * 50)
    print("✅ ГОТОВО!")
    print("=" * 50)

