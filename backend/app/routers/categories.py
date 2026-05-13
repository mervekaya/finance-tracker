from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.category import CategoryCreate, CategoryOut
from app.services import category_service

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return category_service.get_categories(user.id, db)


@router.post("", response_model=CategoryOut)
def create_category(data: CategoryCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return category_service.create_category(user.id, data, db)


@router.put("/{cat_id}", response_model=CategoryOut)
def update_category(cat_id: int, data: CategoryCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return category_service.update_category(cat_id, user.id, data, db)


@router.delete("/{cat_id}")
def delete_category(cat_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    category_service.delete_category(cat_id, user.id, db)
    return {"ok": True}
