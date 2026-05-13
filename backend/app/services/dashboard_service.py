from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import extract
from app.models.transaction import Transaction
from app.schemas.dashboard import DashboardSummary, MonthlySummary, CategoryBreakdown


def get_summary(user_id: int, year: int, db: Session) -> DashboardSummary:
    txs = (
        db.query(Transaction)
        .filter(Transaction.user_id == user_id, extract("year", Transaction.date) == year)
        .all()
    )

    monthly_map = {f"{year}-{m:02d}": {"income": 0.0, "expense": 0.0} for m in range(1, 13)}
    for tx in txs:
        key = f"{tx.date.year}-{tx.date.month:02d}"
        monthly_map[key][tx.type] += tx.amount_try

    monthly = [
        MonthlySummary(month=k, income=round(v["income"], 2),
                       expense=round(v["expense"], 2), net=round(v["income"] - v["expense"], 2))
        for k, v in monthly_map.items()
    ]

    cat_map: dict = {}
    total_expense = sum(tx.amount_try for tx in txs if tx.type == "expense")

    for tx in txs:
        if tx.type != "expense":
            continue
        name = tx.category.name if tx.category else "Diğer"
        if name not in cat_map:
            cat_map[name] = {
                "icon": tx.category.icon if tx.category else "📦",
                "color": tx.category.color if tx.category else "#6b7280",
                "amount": 0.0,
            }
        cat_map[name]["amount"] += tx.amount_try

    category_breakdown = [
        CategoryBreakdown(
            category=name, icon=v["icon"], color=v["color"],
            amount=round(v["amount"], 2),
            percentage=round(v["amount"] / total_expense * 100, 1) if total_expense else 0,
        )
        for name, v in sorted(cat_map.items(), key=lambda x: -x[1]["amount"])
    ]

    total_income = round(sum(tx.amount_try for tx in txs if tx.type == "income"), 2)
    total_expense = round(total_expense, 2)

    return DashboardSummary(
        total_income=total_income, total_expense=total_expense,
        net=round(total_income - total_expense, 2),
        monthly=monthly, category_breakdown=category_breakdown,
    )
