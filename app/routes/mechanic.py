from fastapi import APIRouter, Depends
from app.db import get_connection
from app.dependencies import get_current_user

router = APIRouter(prefix="/mechanics", tags=["Mechanics"])


@router.post("/")
def create_mechanic(data: dict, user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """INSERT INTO mechanics (name, phone, user_id)
        VALUES (%s, %s, %s) RETURNING id""",
        (data["name"], data["phone"], user_id)
    )

    mid = cur.fetchone()[0]

    conn.commit()
    cur.close()
    conn.close()

    return {"id": mid}


@router.get("/")
def get_mechanics(user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT id, name FROM mechanics WHERE user_id=%s",
        (user_id,)
    )

    rows = cur.fetchall()

    result = [{"id": r[0], "name": r[1]} for r in rows]

    cur.close()
    conn.close()

    return result