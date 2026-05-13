from __future__ import annotations
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.transaction import TransactionCreate, TransactionUpdate, TransactionOut
from app.services import transaction_service

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("", response_model=List[TransactionOut])
def list_transactions(
    month: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    return transaction_service.get_transactions(user.id, db, month, type, category_id)


@router.post("", response_model=TransactionOut)
def create_transaction(data: TransactionCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return transaction_service.create_transaction(user.id, data, db)


@router.put("/{tx_id}", response_model=TransactionOut)
def update_transaction(tx_id: int, data: TransactionUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return transaction_service.update_transaction(tx_id, user.id, data, db)


@router.delete("/{tx_id}")
def delete_transaction(tx_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    transaction_service.delete_transaction(tx_id, user.id, db)
    return {"ok": True}
