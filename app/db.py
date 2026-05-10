import psycopg2
import os

def get_connection():
    # Use a short connect timeout to avoid long blocking on startup when DB is unreachable
    connect_timeout = int(os.getenv("DB_CONNECT_TIMEOUT", "5"))
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        port=os.getenv("DB_PORT", 5432),
        database=os.getenv("DB_NAME", "mechanic_db"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "sameer"),
        connect_timeout=connect_timeout
    )