from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.db import get_connection
from app.dependencies import get_current_user
from fastapi import Depends
from fastapi.responses import StreamingResponse
import io
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

router = APIRouter(prefix="/invoices", tags=["Invoices"])


class InvoiceCreate(BaseModel):
    job_id: int
    parts_cost: float
    labor_cost: float
    total_amount: float
    payment_status: str = "unpaid"
    summary: str = ""
    business_id: int | None = None
    vat_rate: float | None = None
    vat_amount: float | None = None
    currency: str | None = None
    user_id: int


@router.post("/")
def create_invoice(data: InvoiceCreate, user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        # Ensure vat_amount is calculated when vat_rate provided but vat_amount missing
        parts = float(data.parts_cost or 0)
        labor = float(data.labor_cost or 0)
        subtotal = parts + labor
        vat_rate = float(data.vat_rate) if data.vat_rate is not None else 0.0

        if data.vat_amount is None or float(data.vat_amount or 0) == 0.0:
            vat_amount = round(subtotal * (vat_rate / 100.0), 2) if vat_rate else 0.0
        else:
            vat_amount = float(data.vat_amount)

        # If total_amount not supplied or appears to be just subtotal, compute with VAT
        if data.total_amount is None or float(data.total_amount or 0) == 0.0:
            total_amount = round(subtotal + vat_amount, 2)
        else:
            total_amount = float(data.total_amount)

        cursor.execute("""
            INSERT INTO invoices (
                job_id, parts_cost, labor_cost,
                total_amount, payment_status, summary, business_id, vat_rate, vat_amount, currency, user_id
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            data.job_id,
            parts,
            labor,
            total_amount,
            data.payment_status,
            data.summary,
            data.business_id,
            vat_rate,
            vat_amount,
            data.currency,
            user_id,
        ))

        new_id = cursor.fetchone()[0]
        conn.commit()

        # Return enriched invoice including business name
        cursor.execute("""
            SELECT i.*, b.name AS business_name
            FROM invoices i
            LEFT JOIN public.business b ON i.business_id = b.id
            WHERE i.id = %s
        """, (new_id,))
        row = cursor.fetchone()
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
        cursor.execute("""
            SELECT i.*, b.name AS business_name
            FROM invoices i
            LEFT JOIN public.business b ON i.business_id = b.id
            WHERE i.user_id=%s
            ORDER BY i.id DESC
        """, (user_id,))
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
        cursor.execute("""
            SELECT i.*, b.name AS business_name
            FROM invoices i
            LEFT JOIN public.business b ON i.business_id = b.id
            WHERE i.id = %s AND i.user_id = %s
        """, (invoice_id, user_id))
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
        cursor.execute("""
            SELECT i.*, b.name AS business_name
            FROM invoices i
            LEFT JOIN public.business b ON i.business_id = b.id
            WHERE i.job_id = %s
        """, (job_id,))
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


@router.get("/{invoice_id}/pdf")
def get_invoice_pdf(invoice_id: int, user_id: int = Depends(get_current_user)):
    """Generate a PDF for the invoice and return it as application/pdf."""
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT i.id, i.job_id, i.parts_cost, i.labor_cost, i.total_amount, i.payment_status, i.summary,
                   i.business_id, b.name AS business_name, i.vat_rate, i.vat_amount, i.currency
            FROM invoices i
            LEFT JOIN public.business b ON i.business_id = b.id
            WHERE i.id = %s AND i.user_id = %s
        """, (invoice_id, user_id))

        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Invoice not found")

        inv = {
            "id": row[0],
            "job_id": row[1],
            "parts_cost": float(row[2] or 0),
            "labor_cost": float(row[3] or 0),
            "total_amount": float(row[4] or 0),
            "payment_status": row[5],
            "summary": row[6] or "",
            "business_id": row[7],
            "business_name": row[8] or "",
            "vat_rate": float(row[9] or 10),
            "vat_amount": float(row[10] or 10),
            "currency": row[11] or "AUD"
        }

        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter

        # Header
        p.setFont("Helvetica-Bold", 16)
        p.drawString(40, height - 50, f"Invoice #{inv['id']}")
        p.setFont("Helvetica", 10)
        p.drawString(40, height - 70, f"Business: {inv['business_name']}")
        p.drawString(40, height - 85, f"Job ID: {inv['job_id']}")
        p.drawString(40, height - 100, f"Status: {inv['payment_status']}")

        # Summary
        y = height - 130
        if inv['summary']:
            p.setFont("Helvetica-Bold", 12)
            p.drawString(40, y, "Summary")
            y -= 16
            p.setFont("Helvetica", 10)
            for line in inv['summary'].split('\n'):
                p.drawString(40, y, line[:100])
                y -= 14

        # Charges — show parts, labour, subtotal, VAT, and total with currency
        y -= 6
        p.setFont("Helvetica-Bold", 12)
        p.drawString(40, y, "Charges")
        y -= 18
        p.setFont("Helvetica", 10)
        currency = inv.get('currency') or 'AUD'
        def fmt(amount):
            return f"{currency} {amount:,.2f}"

        p.drawString(40, y, "Parts Cost:")
        p.drawRightString(520, y, fmt(inv['parts_cost']))
        y -= 14
        p.drawString(40, y, "Labour Cost:")
        p.drawRightString(520, y, fmt(inv['labor_cost']))
        y -= 14
        subtotal = inv['parts_cost'] + inv['labor_cost']
        p.drawString(40, y, "Subtotal:")
        p.drawRightString(520, y, fmt(subtotal))
        y -= 14
        p.drawString(40, y, f"VAT ({inv.get('vat_rate', 0)}%):")
        p.drawRightString(520, y, fmt(inv.get('vat_amount', 0)))
        y -= 16
        p.setFont("Helvetica-Bold", 11)
        p.drawString(40, y, "Total:")
        p.drawRightString(520, y, fmt(inv['total_amount']))

        p.showPage()
        p.save()

        buffer.seek(0)
        return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=invoice_{inv['id']}.pdf"})
    finally:
        cur.close()
        conn.close()