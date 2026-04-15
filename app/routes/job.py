from fastapi import APIRouter
from app.db import get_connection
from app.dependencies import get_current_user
from fastapi import Depends

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.post("/")
def create_job(data: dict, user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """INSERT INTO jobs 
        (vehicle_id, issue_description, assigned_mechanic, user_id)
        VALUES (%s, %s, %s, %s) RETURNING id""",
        (
            data["vehicle_id"],   # must exist!
            data["issue_description"],
            data["assigned_mechanic"],
            user_id
        )
    )

    jid = cur.fetchone()[0]

    conn.commit()
    cur.close()
    conn.close()

    return {"id": jid}

@router.get("/")
def get_jobs(user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT j.id, j.issue_description,
               v.make, v.model,
               m.name
        FROM jobs j
        LEFT JOIN vehicles v ON j.vehicle_id = v.id
        LEFT JOIN mechanics m ON j.mechanic_id = m.id
        WHERE j.user_id = %s
        ORDER BY j.id DESC
    """, (user_id,))

    rows = cur.fetchall()

    result = [
        {
            "id": r[0],
            "issue_description": r[1],
            "vehicle_name": f"{r[2]} {r[3]}" if r[2] else "",
            "mechanic_name": r[4]
        }
        for r in rows
    ]

    return result