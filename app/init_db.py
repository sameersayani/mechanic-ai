from app.db import get_connection

def init_db():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        phone VARCHAR(20),
        email VARCHAR(100)
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS vehicles (
        id SERIAL PRIMARY KEY,
        customer_id INT REFERENCES customers(id),
        car_number VARCHAR(20),
        model VARCHAR(50),
        brand VARCHAR(50),
        last_service_date DATE
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        vehicle_id INT REFERENCES vehicles(id),
        issue_description TEXT,
        status VARCHAR(20) DEFAULT 'Pending',
        assigned_mechanic VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        job_id INT REFERENCES jobs(id),
        parts_cost NUMERIC,
        labor_cost NUMERIC,
        total_amount NUMERIC,
        payment_status VARCHAR(20)
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS parts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        price NUMERIC,
        stock_quantity INT
    );
    """)

    conn.commit()
    cur.close()
    conn.close()