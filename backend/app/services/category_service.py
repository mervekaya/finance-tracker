from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.category import Category
from app.schemas.category import CategoryCreate


def get_categories(user_id: int, db: Session):
    return db.query(Category).filter(Category.user_id == user_id).all()


def create_category(user_id: int, data: CategoryCreate, db: Session) -> Category:
    cat = Category(user_id=user_id, **data.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


def update_category(cat_id: int, user_id: int, data: CategoryCreate, db: Session) -> Category:
    cat = _get_or_404(cat_id, user_id, db)
    for k, v in data.model_dump().items():
        setattr(cat, k, v)
    db.commit()
    db.refresh(cat)
    return cat


def delete_category(cat_id: int, user_id: int, db: Session):
    cat = _get_or_404(cat_id, user_id, db)
    db.delete(cat)
    db.commit()


def _get_or_404(cat_id: int, user_id: int, db: Session) -> Category:
    cat = db.query(Category).filter(Category.id == cat_id, Category.user_id == user_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Kategori bulunamadı")
    return cat
