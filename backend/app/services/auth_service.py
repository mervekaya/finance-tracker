from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.category import Category
from app.schemas.auth import UserRegister, UserLogin
from app.core.security import hash_password, verify_password, create_access_token

DEFAULT_CATEGORIES = [
    {"name": "Maaş",             "type": "income",  "color": "#22c55e", "icon": "💼"},
    {"name": "Freelance",        "type": "income",  "color": "#3b82f6", "icon": "💻"},
    {"name": "Yatırım Getirisi", "type": "income",  "color": "#a855f7", "icon": "📈"},
    {"name": "Diğer Gelir",      "type": "income",  "color": "#06b6d4", "icon": "💰"},
    {"name": "Kira",             "type": "expense", "color": "#ef4444", "icon": "🏠"},
    {"name": "Market",           "type": "expense", "color": "#f97316", "icon": "🛒"},
    {"name": "Ulaşım",           "type": "expense", "color": "#eab308", "icon": "🚗"},
    {"name": "Faturalar",        "type": "expense", "color": "#ec4899", "icon": "📄"},
    {"name": "Sağlık",           "type": "expense", "color": "#14b8a6", "icon": "🏥"},
    {"name": "Eğlence",          "type": "expense", "color": "#8b5cf6", "icon": "🎬"},
    {"name": "Yemek",            "type": "expense", "color": "#f59e0b", "icon": "🍽️"},
    {"name": "Diğer Gider",      "type": "expense", "color": "#6b7280", "icon": "📦"},
]


def register_user(data: UserRegister, db: Session) -> str:
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Bu email zaten kayıtlı")

    user = User(email=data.email, name=data.name, hashed_password=hash_password(data.password))
    db.add(user)
    db.flush()

    for cat in DEFAULT_CATEGORIES:
        db.add(Category(user_id=user.id, **cat))

    db.commit()
    db.refresh(user)
    return create_access_token(user.id)


def login_user(data: UserLogin, db: Session) -> str:
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email veya şifre hatalı")
    return create_access_token(user.id)
