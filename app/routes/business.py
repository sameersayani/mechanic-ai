from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.db import get_connection
from app.dependencies import get_current_user
from fastapi import Depends

router = APIRouter(prefix="/business", tags=["Business"])

class BusinessCreate(BaseModel):
    name: str
    address: str
    phone: str
    email: str
    website: str = ""
    is_active: bool = True

@router.post("/")
def create_business(data: BusinessCreate, user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO business (
                name, address, phone, email, website, user_id, is_active
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """, (
            data.name,
            data.address,
            data.phone,
            data.email,
            data.website,
            user_id,
            data.is_active,
        ))

        row = cursor.fetchone()
        conn.commit()

        columns = [desc[0] for desc in cursor.description]
        business = dict(zip(columns, row))

        return business

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()

@router.get("/{business_id}")
def get_business(business_id: int, user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT * FROM business WHERE id = %s AND user_id = %s", (business_id, user_id))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Business not found")

        columns = [desc[0] for desc in cursor.description]
        return dict(zip(columns, row))

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()

@router.get("/")
def list_businesses(user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT * FROM business WHERE user_id = %s", (user_id,))
        rows = cursor.fetchall()

        columns = [desc[0] for desc in cursor.description]
        return [dict(zip(columns, row)) for row in rows]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()