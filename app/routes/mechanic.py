from fastapi import APIRouter, Depends
from fastapi.params import Query
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
def get_mechanics(
    user_id: int = Depends(get_current_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),):
    offset = (page - 1) * page_size

    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
    "SELECT COUNT(*) FROM vehicles WHERE user_id=%s",
    (user_id,)
    )

    total = cur.fetchone()[0]
    cur.execute(
        "SELECT id, name, phone, user_id FROM mechanics WHERE user_id=%s LIMIT %s OFFSET %s",
        (user_id, page_size, offset)
    )

    rows = cur.fetchall()

    result = [
        {
            "id": r[0],
            "name": r[1],
            "phone": r[2],
            "user_id": r[3]
        }
        for r in rows
    ]

    cur.close()
    conn.close()

    return {"data": result, "total": total}