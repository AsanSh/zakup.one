"""
Настройка подключения к базе данных
"""
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Настройка engine в зависимости от типа БД
if settings.DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},  # Для SQLite
        echo=settings.DEBUG
    )
else:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        echo=settings.DEBUG
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency для получения сессии БД"""
    db = SessionLocal()
    try:
        # Проверяем подключение (только для PostgreSQL)
        if not settings.DATABASE_URL.startswith("sqlite"):
            db.execute(text("SELECT 1"))
        yield db
    except Exception as e:
        db.rollback()
        from fastapi import HTTPException, status
        # Проверяем, является ли это ошибкой подключения к БД
        error_str = str(e).lower()
        if 'authentication' in error_str or 'password' in error_str or 'credential' in error_str:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Ошибка подключения к базе данных: неверные учетные данные. Проверьте DATABASE_URL в настройках."
            )
        elif 'connection' in error_str or 'refused' in error_str or 'timeout' in error_str:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"База данных недоступна: не удалось подключиться. Убедитесь, что PostgreSQL запущен."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Ошибка базы данных: {str(e)}"
            )
    finally:
        db.close()

