from fastapi import APIRouter, Depends
from app.db import get_connection
from app.dependencies import get_current_user

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])

@router.post("/")
def create_vehicle(data: dict, user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """INSERT INTO vehicles (customer_id, make, model, user_id)
        VALUES (%s, %s, %s, %s) RETURNING id""",
        (data["customer_id"], data["make"], data["model"], user_id)
    )

    vid = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return {"id": vid}


@router.get("/")
def get_vehicles(user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT id, make, model, customer_id FROM vehicles WHERE user_id=%s",
        (user_id,)
    )

    rows = cur.fetchall()

    cur.close()
    conn.close()

    return rows