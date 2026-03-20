from fastapi import APIRouter
from app.db import get_connection

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.post("/")
def create_customer(customer: dict):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO customers (name, phone, email) VALUES (%s, %s, %s) RETURNING id",
        (customer["name"], customer["phone"], customer["email"])
    )

    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return {"id": new_id}

@router.get("/")
def get_customers():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT * FROM customers")
    rows = cur.fetchall()

    cur.close()
    conn.close()

    return rows