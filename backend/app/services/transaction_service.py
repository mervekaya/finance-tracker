from typing import Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import extract
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate, TransactionUpdate
from app.core.security import to_try


def get_transactions(user_id: int, db: Session, month: Optional[str] = None,
                     type: Optional[str] = None, category_id: Optional[int] = None):
    q = db.query(Transaction).filter(Transaction.user_id == user_id)
    if month:
        year, mon = month.split("-")
        q = q.filter(extract("year", Transaction.date) == int(year),
                     extract("month", Transaction.date) == int(mon))
    if type:
        q = q.filter(Transaction.type == type)
    if category_id:
        q = q.filter(Transaction.category_id == category_id)
    return q.order_by(Transaction.date.desc()).all()


def create_transaction(user_id: int, data: TransactionCreate, db: Session) -> Transaction:
    tx = Transaction(user_id=user_id, amount_try=to_try(data.amount, data.currency), **data.model_dump())
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx


def update_transaction(tx_id: int, user_id: int, data: TransactionUpdate, db: Session) -> Transaction:
    tx = _get_or_404(tx_id, user_id, db)
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(tx, k, v)
    tx.amount_try = to_try(tx.amount, tx.currency)
    db.commit()
    db.refresh(tx)
    return tx


def delete_transaction(tx_id: int, user_id: int, db: Session):
    tx = _get_or_404(tx_id, user_id, db)
    db.delete(tx)
    db.commit()


def _get_or_404(tx_id: int, user_id: int, db: Session) -> Transaction:
    tx = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.user_id == user_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="İşlem bulunamadı")
    return tx
