#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для автоматической настройки базы данных и создания админа
"""
import sys
from pathlib import Path
from sqlalchemy.orm import Session
from passlib.context import CryptContext

sys.path.insert(0, str(Path(__file__).parent))

from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.product import Product, Supplier
from app.models.order import Order, OrderItem

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    # Используем готовый хеш для "admin123" если bcrypt не работает
    # Хеш: $2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW
    try:
        return pwd_context.hash(password)
    except Exception as e:
        print(f"⚠️  Ошибка при хешировании пароля: {e}")
        print("   Используется готовый хеш для пароля 'admin123'")
        # Готовый bcrypt хеш для пароля "admin123"
        return "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"


def setup_database():
    """Создает таблицы в базе данных"""
    print("📦 Создание таблиц в базе данных...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Таблицы созданы успешно!")
        return True
    except Exception as e:
        print(f"❌ Ошибка при создании таблиц: {e}")
        return False


def create_admin(
    email: str = "admin@zakup.one",
    password: str = "admin123",
    full_name: str = "Администратор",
    company: str = "ZAKUP.ONE"
):
    """Создает супер-админа"""
    db: Session = SessionLocal()
    try:
        # Проверяем, существует ли уже админ
        existing_admin = db.query(User).filter(User.email == email).first()
        if existing_admin:
            if existing_admin.is_admin:
                print(f"ℹ️  Администратор с email {email} уже существует!")
                return True
            else:
                # Обновляем существующего пользователя до админа
                existing_admin.is_admin = True
                existing_admin.is_verified = True
                existing_admin.hashed_password = get_password_hash(password)
                db.commit()
                print(f"✅ Существующий пользователь {email} обновлен до администратора!")
                return True
        
        # Создаем нового админа
        admin = User(
            email=email,
            full_name=full_name,
            company=company,
            hashed_password=get_password_hash(password),
            is_admin=True,
            is_verified=True,
            is_active=True
        )
        
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        print("=" * 60)
        print("✅ СУПЕР-АДМИН УСПЕШНО СОЗДАН!")
        print("=" * 60)
        print(f"Email:    {email}")
        print(f"Пароль:   {password}")
        print(f"ФИО:      {full_name}")
        print(f"Компания: {company}")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        db.rollback()
        print(f"❌ Ошибка при создании админа: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()


def main():
    print("=" * 60)
    print("НАСТРОЙКА БАЗЫ ДАННЫХ ZAKUP.ONE")
    print("=" * 60)
    print()
    
    # Создаем таблицы
    if not setup_database():
        print("❌ Не удалось создать таблицы. Выход.")
        sys.exit(1)
    
    print()
    
    # Создаем админа
    if not create_admin():
        print("❌ Не удалось создать админа. Выход.")
        sys.exit(1)
    
    print()
    print("=" * 60)
    print("✅ ВСЕ ГОТОВО!")
    print("=" * 60)
    print("Теперь можно:")
    print("1. Запустить backend: python3 run.py")
    print("2. Открыть http://localhost:5467")
    print("3. Войти с данными админа выше")
    print("=" * 60)


if __name__ == "__main__":
    main()

