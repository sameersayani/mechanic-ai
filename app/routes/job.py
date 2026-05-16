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
    # Allow updating issue_description, status, vehicle_id, and mechanic_id
    for key in ["issue_description", "status", "vehicle_id", "mechanic_id"]:
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

@router.delete("/{job_id}/")
def delete_job(job_id: int, user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    # Step 1: Delete linked invoice first (FK constraint)
    cur.execute(
        "DELETE FROM invoices WHERE job_id = %s AND user_id = %s",
        (job_id, user_id)
    )

    # Step 2: Now safe to delete the job
    cur.execute(
        "DELETE FROM jobs WHERE id = %s AND user_id = %s",
        (job_id, user_id)
    )

    conn.commit()
    cur.close()
    conn.close()

    return {"message": "Job deleted successfully"}

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

@router.get("/{job_id}/")
def get_job(job_id: int, user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT j.id, j.issue_description, j.status,
        c.id AS customer_id, j.vehicle_id, v.customer_id, j.mechanic_id,
                v.make, v.model, m.name AS mechanic_name, c.name AS customer_name
        FROM jobs j
        LEFT JOIN vehicles v ON j.vehicle_id = v.id
        LEFT JOIN mechanics m ON j.mechanic_id = m.id
        LEFT JOIN customers c ON v.customer_id = c.id
        WHERE j.id = %s AND j.user_id = %s
    """, (job_id, user_id))

    row = cur.fetchone()

    if not row:
        return {"error": "Job not found"}

    # Map columns to names for clarity
    job = {
        "id": row[0],
        "issue": row[1],
        "status": row[2],
        "customer_id": row[3],
        "vehicle_id": row[4],
        "job_customer_id": row[5],
        "mechanic_id": row[6],
        "vehicle_make": row[7],
        "vehicle_model": row[8],
        "mechanic_name": row[9],
        "customer_name": row[10]
    }

    return job