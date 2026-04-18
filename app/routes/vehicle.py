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
        "SELECT v.id, v.make, v.model, v.customer_id, c.name FROM vehicles v INNER JOIN customers c ON v.customer_id = c.id WHERE v.user_id=%s",
        (user_id,)
    )

    rows = cur.fetchall()
    result = [
        {
            "id": r[0],
            "make": r[1],
            "model": r[2],
            "customer_id": r[3],
            "customer_name": r[4]
        }
        for r in rows
    ]

    cur.close()
    conn.close()

    return result