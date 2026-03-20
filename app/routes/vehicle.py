from fastapi import APIRouter
from app.db import get_connection

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])

@router.post("/")
def create_vehicle(vehicle: dict):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """INSERT INTO vehicles 
        (customer_id, car_number, model, brand, last_service_date)
        VALUES (%s, %s, %s, %s, %s) RETURNING id""",
        (
            vehicle["customer_id"],
            vehicle["car_number"],
            vehicle["model"],
            vehicle["brand"],
            vehicle["last_service_date"]
        )
    )

    new_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return {"id": new_id}