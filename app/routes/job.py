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

    cur.execute("SELECT * FROM jobs WHERE user_id = %s", (user_id,))
    rows = cur.fetchall()

    cur.close()
    conn.close()

    return rows