from fastapi import APIRouter
from app.db import get_connection

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.post("/")
def create_job(job: dict):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """INSERT INTO jobs 
        (vehicle_id, issue_description, assigned_mechanic)
        VALUES (%s, %s, %s) RETURNING id""",
        (
            job["vehicle_id"],
            job["issue_description"],
            job["assigned_mechanic"]
        )
    )

    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return {"id": new_id}

@router.get("/")
def get_jobs():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT * FROM jobs")
    rows = cur.fetchall()

    cur.close()
    conn.close()

    return rows