"""
API эндпоинты для аутентификации
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from passlib.context import CryptContext
import bcrypt
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_PREFIX}/auth/login")


class LoginRequest(BaseModel):
    """Модель запроса логина (JSON)"""
    email: str
    password: str


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    phone: str
    company: str
    password: str


class UserOut(BaseModel):
    """Модель пользователя для ответа"""
    id: int
    email: str
    full_name: str
    phone: Optional[str] = None
    company: Optional[str] = None
    is_verified: bool
    is_admin: bool
    
    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    """Алиас для обратной совместимости"""
    id: int
    email: str
    full_name: str
    phone: Optional[str] = ""
    company: Optional[str] = ""
    is_verified: bool
    is_admin: bool = False
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Модель ответа с токеном"""
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class Token(BaseModel):
    """Алиас для обратной совместимости"""
    access_token: str
    token_type: str
    user: Optional[UserResponse] = None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверка пароля с обработкой длинных паролей"""
    try:
        # Пробуем через passlib
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        try:
            # Если passlib не работает, используем прямой bcrypt
            # Bcrypt ограничивает пароль до 72 байт, поэтому обрезаем если нужно
            password_bytes = plain_password.encode('utf-8')
            if len(password_bytes) > 72:
                password_bytes = password_bytes[:72]
            hashed_bytes = hashed_password.encode('utf-8')
            return bcrypt.checkpw(password_bytes, hashed_bytes)
        except Exception as e:
            print(f"⚠️  Ошибка при проверке пароля: {e}")
            return False


def get_password_hash(password: str) -> str:
    """Хеширование пароля с обработкой длинных паролей"""
    try:
        # Используем passlib, который автоматически обрабатывает длинные пароли
        return pwd_context.hash(password)
    except Exception:
        # Если passlib не работает, используем прямой bcrypt
        # Bcrypt ограничивает пароль до 72 байт, поэтому обрезаем если нужно
        password_bytes = password.encode('utf-8')
        if len(password_bytes) > 72:
            password_bytes = password_bytes[:72]
        hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
        return hashed.decode('utf-8')


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Получить текущего пользователя из JWT токена"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не удалось подтвердить учетные данные",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        user_id: int = payload.get("user_id")
        if email is None or user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user


async def get_current_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Проверить, что текущий пользователь - администратор"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав доступа"
        )
    return current_user


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Получить информацию о текущем пользователе"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone": current_user.phone or "",
        "company": current_user.company or "",
        "is_verified": current_user.is_verified,
        "is_admin": current_user.is_admin
    }


@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Регистрация нового пользователя (снабженца)"""
    # Проверяем, существует ли пользователь
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким email уже существует"
        )
    
    # Создаем нового пользователя (не верифицирован)
    new_user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        phone=user_data.phone,
        company=user_data.company,
        hashed_password=get_password_hash(user_data.password),
        is_verified=False,
        is_active=True
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Отправляем email-уведомление о регистрации
    try:
        from app.services.email_service import send_registration_notification
        await send_registration_notification(
            email=user_data.email,
            full_name=user_data.full_name,
            company=user_data.company
        )
    except Exception as e:
        # Логируем ошибку, но не прерываем регистрацию
        print(f"⚠️  Ошибка отправки email при регистрации: {e}")
    
    return {
        "id": new_user.id,
        "email": new_user.email,
        "full_name": new_user.full_name,
        "phone": new_user.phone or "",
        "company": new_user.company or "",
        "is_verified": new_user.is_verified,
        "is_admin": new_user.is_admin
    }


@router.post("/login", response_model=TokenResponse)
async def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Вход в систему
    
    Принимает JSON:
    {
        "email": "user@example.com",
        "password": "string"
    }
    
    Возвращает:
    {
        "access_token": "<jwt>",
        "token_type": "bearer",
        "user": {
            "id": 1,
            "email": "user@example.com",
            "full_name": "...",
            "is_admin": false
        }
    }
    """
    try:
        # Логируем попытку входа (без пароля)
        logger.info(f"Login attempt for email: {request.email}")
        
        # Находим пользователя по email
        user = db.query(User).filter(User.email == request.email).first()
        
        if user is None:
            logger.warning(f"Login failed: user not found for email: {request.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверный email или пароль"
            )
        
        # Проверяем пароль
        if not verify_password(request.password, user.hashed_password):
            logger.warning(f"Login failed: invalid password for email: {request.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверный email или пароль"
            )
        
        # Проверяем что пользователь активен
        if not user.is_active:
            logger.warning(f"Login failed: inactive account for email: {request.email}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Аккаунт деактивирован"
            )
        
        # Админы могут входить без верификации, обычные пользователи должны быть верифицированы
        if not user.is_admin and not user.is_verified:
            logger.warning(f"Login failed: unverified account for email: {request.email}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Аккаунт не верифицирован администратором"
            )
        
        # Создаем токен
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email, "user_id": user.id},
            expires_delta=access_token_expires
        )
        
        logger.info(f"Login successful for email: {request.email}, user_id: {user.id}")
        
        # Возвращаем ответ в правильном формате
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserOut.model_validate(user)
        )
        
    except HTTPException:
        # Пробрасываем HTTP исключения как есть
        raise
    except Exception as e:
        # Логируем неожиданные ошибки
        logger.error(f"Unexpected error during login for email: {request.email}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Внутренняя ошибка сервера при входе"
        )

