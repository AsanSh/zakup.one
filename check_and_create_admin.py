#!/usr/bin/env python3
"""
Скрипт для проверки и создания админа
"""
import sys
from pathlib import Path

# Добавляем путь к проекту
sys.path.insert(0, str(Path(__file__).parent))

try:
    from app.core.database import SessionLocal
    from app.models.user import User
    from app.api.v1.endpoints.auth import get_password_hash
    from sqlalchemy import text
    
    print("="*60)
    print("ПРОВЕРКА И СОЗДАНИЕ АДМИНА")
    print("="*60)
    
    db = SessionLocal()
    try:
        # Проверяем подключение к БД
        db.execute(text('SELECT 1'))
        print("✅ База данных доступна")
        
        # Проверяем наличие админа
        admin = db.query(User).filter(User.email == "admin@zakup.one").first()
        
        if admin:
            print(f"\n✅ Админ найден:")
            print(f"   - ID: {admin.id}")
            print(f"   - Email: {admin.email}")
            print(f"   - is_admin: {admin.is_admin}")
            print(f"   - is_verified: {admin.is_verified}")
            print(f"   - is_active: {admin.is_active}")
            
            # Проверяем, что все флаги установлены правильно
            if not admin.is_admin or not admin.is_verified or not admin.is_active:
                print("\n⚠️  Флаги админа установлены неправильно, исправляем...")
                admin.is_admin = True
                admin.is_verified = True
                admin.is_active = True
                db.commit()
                print("✅ Флаги исправлены")
        else:
            print("\n❌ Админ не найден, создаем...")
            # Создаем нового админа
            admin = User(
                email="admin@zakup.one",
                full_name="Администратор",
                company="ZAKUP.ONE",
                phone="+996555123456",
                hashed_password=get_password_hash("admin123"),
                is_admin=True,
                is_verified=True,
                is_active=True
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print("✅ Админ создан")
        
        print("\n" + "="*60)
        print("ДАННЫЕ ДЛЯ ВХОДА:")
        print("="*60)
        print("Email:    admin@zakup.one")
        print("Пароль:   admin123")
        print("="*60)
        
    except Exception as e:
        print(f"\n❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()
        
except ImportError as e:
    print(f"❌ Ошибка импорта: {e}")
    print("\nУбедитесь, что:")
    print("1. Виртуальное окружение активировано")
    print("2. Все зависимости установлены: pip install -r requirements.txt")
    sys.exit(1)

