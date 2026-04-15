from fastapi import APIRouter
from app.db import get_connection
from app.dependencies import get_current_user
from fastapi import Depends

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
def get_customers(user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT * FROM customers WHERE user_id = %s", (user_id,))
    rows = cur.fetchall()

    cur.close()
    conn.close()

    return rows