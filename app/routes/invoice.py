from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.db import get_connection
from app.dependencies import get_current_user
from fastapi import Depends

router = APIRouter(prefix="/invoices", tags=["Invoices"])


class InvoiceCreate(BaseModel):
    job_id: int
    parts_cost: float
    labor_cost: float
    total_amount: float
    payment_status: str = "unpaid",
    summary: str = ""
    user_id: int


@router.post("/")
def create_invoice(data: InvoiceCreate, user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO invoices (
                job_id, parts_cost, labor_cost,
                total_amount, payment_status, summary, user_id
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """, (
            data.job_id,
            data.parts_cost,
            data.labor_cost,
            data.total_amount,
            data.payment_status,
            data.summary,
            user_id,
        ))

        row = cursor.fetchone()
        conn.commit()

        # Build dict from column names + row values
        columns = [desc[0] for desc in cursor.description]
        invoice = dict(zip(columns, row))

        return invoice

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()


@router.get("/")
def get_invoices(user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT * FROM invoices WHERE user_id=%s ORDER BY id DESC", 
                        (user_id,))
        rows = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]
        return [dict(zip(columns, row)) for row in rows]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()


@router.get("/{invoice_id}")
def get_invoice(invoice_id: int, user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT * FROM invoices WHERE id = %s AND user_id = %s", (invoice_id, user_id))
        row = cursor.fetchone()
        columns = [desc[0] for desc in cursor.description]
        return dict(zip(columns, row))

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()

@router.get("/job/{job_id}")
def get_invoice_by_job(job_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM invoices WHERE job_id = %s", (job_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="No invoice found")
        columns = [desc[0] for desc in cursor.description]
        return dict(zip(columns, row))
    finally:
        cursor.close()
        conn.close()

@router.patch("/{invoice_id}/status")
def update_payment_status(invoice_id: int, data: dict):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE invoices SET payment_status = %s WHERE id = %s RETURNING *",
            (data["payment_status"], invoice_id)
        )
        row = cursor.fetchone()
        conn.commit()
        columns = [desc[0] for desc in cursor.description]
        return dict(zip(columns, row))
    finally:
        cursor.close()
        conn.close()