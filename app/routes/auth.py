from fastapi import APIRouter
from app.db import get_connection
from app.auth import create_token
from passlib.hash import bcrypt

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register")
def register(data: dict):
    conn = get_connection()
    cur = conn.cursor()

    password = data["password"][:72]
    hashed = bcrypt.hash(password)

    cur.execute(
        "INSERT INTO users (email, password) VALUES (%s, %s)",
        (data["email"], hashed)
    )

    conn.commit()
    cur.close()
    conn.close()

    return {"message": "User created"}

@router.post("/login")
def login(data: dict):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT id, password FROM users WHERE email=%s", (data["email"],))
    user = cur.fetchone()

    cur.close()
    conn.close()

    if not user:
        return {"error": "User not found"}

    user_id, hashed_pw = user

    if not bcrypt.verify(data["password"], hashed_pw):
        return {"error": "Invalid password"}

    token = create_token({"user_id": user_id})

    return {"token": token}