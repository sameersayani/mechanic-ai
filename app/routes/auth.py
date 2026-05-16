from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, field_validator
from app.db import get_connection
from app.auth import create_token
from passlib.hash import bcrypt

router = APIRouter(prefix="/auth", tags=["Auth"])


# ── Request models with built-in validation ──────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    captcha_input: str
    captcha_answer: str  # The correct answer generated server-side or sent from client

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        if len(v) > 10:
            raise ValueError("Password must be at most 10 characters")
        return v

    @field_validator("captcha_input")
    @classmethod
    def validate_captcha(cls, v, info):
        # Compare captcha_input against captcha_answer (case-insensitive)
        answer = info.data.get("captcha_answer", "")
        if v.strip().lower() != answer.strip().lower():
            raise HTTPException(status_code=400, detail="Captcha does not match")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ── Routes ───────────────────────────────────────────────────────────────────

@router.post("/register")
def register(data: RegisterRequest):
    conn = get_connection()
    cur = conn.cursor()

    try:
        # Check if user already exists with this email
        cur.execute("SELECT id FROM users WHERE email = %s", (data.email,))
        existing = cur.fetchone()
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"User already exists with email {data.email}"
            )

        # Hash and store password (cap at 72 chars — bcrypt limit)
        hashed = bcrypt.hash(data.password[:72])
        cur.execute(
            "INSERT INTO users (email, password) VALUES (%s, %s)",
            (data.email, hashed)
        )
        conn.commit()
        return {"message": "User created successfully"}

    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        conn.close()


@router.post("/login")
def login(data: LoginRequest):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT id, password FROM users WHERE email = %s", (data.email,))
        user = cur.fetchone()

        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        user_id, hashed_pw = user

        if not bcrypt.verify(data.password, hashed_pw):
            raise HTTPException(status_code=401, detail="Invalid password")

        token = create_token({"user_id": user_id})
        return {"token": token}

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        conn.close()