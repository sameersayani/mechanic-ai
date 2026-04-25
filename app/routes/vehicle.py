from fastapi import APIRouter, Depends
from fastapi.params import Query
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
def get_vehicles(
    user_id: int = Depends(get_current_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    ):
    offset = (page - 1) * page_size
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT COUNT(*) FROM vehicles WHERE user_id=%s",
        (user_id,)
    )

    total = cur.fetchone()[0]
    
    cur.execute(
        """
        SELECT v.id, v.make, v.model, v.customer_id, c.name
        FROM vehicles v
        INNER JOIN customers c ON v.customer_id = c.id
        WHERE v.user_id=%s
        ORDER BY v.id DESC
        LIMIT %s OFFSET %s
        """,
        (user_id, page_size, offset)
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
    
    return {
        "data": result,
        "total": total,
        "page": page,
        "page_size": page_size
    }