from fastapi import APIRouter
from fastapi.params import Query
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
        (vehicle_id, issue_description, mechanic_id, user_id)
        VALUES (%s, %s, %s, %s) RETURNING id""",
        (
            data["vehicle_id"],   # must exist!
            data["issue_description"],
            data["mechanic_id"],
            user_id
        )
    )

    jid = cur.fetchone()[0]

    conn.commit()
    cur.close()
    conn.close()

    return {"id": jid}

@router.put("/{job_id}/")
def update_job(job_id: int, data: dict, user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    # Build dynamic SET clause
    set_clauses = []
    values = []
    for key in ["issue_description", "status", "assigned_mechanic"]:
        if key in data:
            set_clauses.append(f"{key} = %s")
            values.append(data[key])

    if not set_clauses:
        return {"error": "No valid fields to update"}

    values.append(job_id)
    values.append(user_id)

    query = f"UPDATE jobs SET {', '.join(set_clauses)} WHERE id = %s AND user_id = %s"
    cur.execute(query, tuple(values))

    conn.commit()
    cur.close()
    conn.close()

    return {"message": "Job updated successfully"}

@router.get("/pending/")
def getPendingJobs(
    user_id: int = Depends(get_current_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100)):
    offset = (page - 1) * page_size

    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT COUNT(*) FROM jobs WHERE user_id=%s AND status='Pending'",
        (user_id,)
    )

    total = cur.fetchone()[0]

    cur.execute("""
        SELECT j.id, j.issue_description,
               v.make, v.model,
               m.name, j.status
        FROM jobs j
        LEFT JOIN vehicles v ON j.vehicle_id = v.id
        LEFT JOIN mechanics m ON j.mechanic_id = m.id
        LEFT JOIN customers c ON v.customer_id = c.id
        WHERE j.user_id = %s AND (
            j.status = 'Pending'
        )
        ORDER BY j.id DESC
        LIMIT %s OFFSET %s
                
    """, (user_id, page_size, offset))

    rows = cur.fetchall()

    result = [
        {
            "id": r[0],
            "issue": r[1],
            "vehicle_name": f"{r[2]} {r[3]}" if r[2] else "",
            "mechanic_name": r[4],
            "status": r[5] if len(r) > 5 else "Pending"
        }
        for r in rows
    ]

    return {"data": result, "total": total}



@router.get("/")
def get_jobs(
    user_id: int = Depends(get_current_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100)):
    offset = (page - 1) * page_size

    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT COUNT(*) FROM jobs WHERE user_id=%s",
        (user_id,)
    )

    total = cur.fetchone()[0]

    cur.execute("""
        SELECT j.id, j.issue_description,
               v.make, v.model,
               m.name, j.status
        FROM jobs j
        LEFT JOIN vehicles v ON j.vehicle_id = v.id
        LEFT JOIN mechanics m ON j.mechanic_id = m.id
        LEFT JOIN customers c ON v.customer_id = c.id
        WHERE j.user_id = %s
        ORDER BY j.id DESC
        LIMIT %s OFFSET %s
    """, (user_id, page_size, offset))

    rows = cur.fetchall()

    result = [
        {
            "id": r[0],
            "issue": r[1],
            "vehicle_name": f"{r[2]} {r[3]}" if r[2] else "",
            "mechanic_name": r[4],
            "status": r[5] if len(r) > 5 else "Pending"
        }
        for r in rows
    ]

    return {"data": result, "total": total}