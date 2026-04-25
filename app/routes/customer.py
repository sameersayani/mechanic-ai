from fastapi import APIRouter
from app.db import get_connection
from app.dependencies import get_current_user
from fastapi import Depends
from fastapi import Query

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.post("/")
def create_customer(customer: dict, user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO customers (name, phone, email, user_id) VALUES (%s, %s, %s, %s) RETURNING id",
        (customer["name"], customer["phone"], customer["email"], user_id)
    )

    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return {"id": new_id}

@router.get("/")
def get_customers(
    user_id: int = Depends(get_current_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
):
    offset = (page - 1) * page_size

    conn = get_connection()
    cur = conn.cursor()

    # total count
    cur.execute(
        "SELECT COUNT(*) FROM customers WHERE user_id=%s",
        (user_id,)
    )
    total = cur.fetchone()[0]

    # paginated data
    cur.execute(
        """
        SELECT id, name, phone, email
        FROM customers
        WHERE user_id=%s
        ORDER BY id DESC
        LIMIT %s OFFSET %s
        """,
        (user_id, page_size, offset)
    )

    rows = cur.fetchall()

    result = [
        {
            "id": r[0],
            "name": r[1],
            "phone": r[2],
            "email": r[3],
        }
        for r in rows
    ]

    cur.close()
    conn.close()
    return {
        "data": result,
        "total": total,
        "page": page,
        "page_size": page_size
    }