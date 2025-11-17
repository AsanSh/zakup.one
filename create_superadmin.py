#!/usr/bin/env python3
"""
Скрипт для создания суперадминистратора в базе данных
Запуск: python3 create_superadmin.py
"""
import sys
from pathlib import Path

# Добавляем путь к проекту
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from app.core.database import SessionLocal
from app.models.user import User
from app.api.v1.endpoints.auth import get_password_hash

def create_superadmin():
    """Создание суперадминистратора"""
    db = SessionLocal()
    
    try:
        email = "asannameg@gmail.com"
        password = "ParolJok6#"
        full_name = "asannameg"
        
        # Проверяем существует ли уже пользователь
        existing_user = db.query(User).filter(User.email == email).first()
        
        if existing_user:
            print("⚠️  Пользователь уже существует!")
            print(f"   Email: {existing_user.email}")
            print(f"   Имя: {existing_user.full_name}")
            print(f"   Админ: {existing_user.is_admin}")
            print(f"   Активен: {existing_user.is_active}")
            print(f"   Верифицирован: {existing_user.is_verified}")
            
            # Обновляем пользователя до суперадмина
            response = input("\nОбновить до суперадмина? (y/n): ")
            if response.lower() == 'y':
                existing_user.hashed_password = get_password_hash(password)
                existing_user.is_admin = True
                existing_user.is_verified = True
                existing_user.is_active = True
                existing_user.full_name = full_name
                db.commit()
                print("✅ Пользователь обновлен до суперадмина!")
                print(f"   Email: {existing_user.email}")
                print(f"   Пароль: {password}")
                print(f"   Админ: {existing_user.is_admin}")
            return
        
        # Создаем нового суперадминистратора
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
        db.refresh(superadmin)
        
        print("✅ Суперадминистратор создан успешно!")
        print(f"   Email: {superadmin.email}")
        print(f"   Логин: {superadmin.email}")
        print(f"   Пароль: {password}")
        print(f"   Имя: {superadmin.full_name}")
        print(f"   ID: {superadmin.id}")
        print(f"   Админ: {superadmin.is_admin}")
        print(f"   Верифицирован: {superadmin.is_verified}")
        print(f"   Активен: {superadmin.is_active}")
        
    except Exception as e:
        print(f"❌ Ошибка при создании суперадминистратора: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 50)
    print("🔧 СОЗДАНИЕ СУПЕРАДМИНИСТРАТОРА")
    print("=" * 50)
    print()
    print("Email: asannameg@gmail.com")
    print("Логин: asannameg@gmail.com (используется email)")
    print("Пароль: ParolJok6#")
    print()
    
    create_superadmin()
    
    print()
    print("=" * 50)
    print("✅ ГОТОВО!")
    print("=" * 50)
    print()
    print("📋 Данные для входа:")
    print("   Email: asannameg@gmail.com")
    print("   Пароль: ParolJok6#")

