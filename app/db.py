import psycopg2
import os
from urllib.parse import urlparse


def get_connection():
    # Use a short connect timeout to avoid long blocking on startup when DB is unreachable
    connect_timeout = int(os.getenv("DB_CONNECT_TIMEOUT", "5"))

    # Prefer a single DATABASE_URL when provided (Render sets a DATABASE_URL for managed DBs)
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        parsed = urlparse(database_url)
        return psycopg2.connect(
            host=parsed.hostname,
            port=parsed.port or 5432,
            database=(parsed.path or "").lstrip("/"),
            user=parsed.username,
            password=parsed.password,
            connect_timeout=connect_timeout,
        )

    # Fall back to individual environment variables with sensible defaults
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        port=int(os.getenv("DB_PORT", 5432)),
        database=os.getenv("DB_NAME", "mechanic_db"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "sameer"),
        connect_timeout=connect_timeout,
    )