from app.db import get_connection
def init_db():
    try:
        conn = get_connection()
    except Exception as e:
        # Fail fast but don't block application startup; log the error.
        print(f"init_db: could not connect to database: {e}")
        return

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
        make VARCHAR(50),
        model VARCHAR(50),
        user_id INT REFERENCES users(id),
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

    cur.execute("""
    CREATE TABLE IF NOT EXISTS mechanics (
        id SERIAL PRIMARY KEY,
        name TEXT,
        phone TEXT,
        user_id INT
    );
    """)

    cur.execute("ALTER TABLE customers ADD COLUMN IF NOT EXISTS user_id INT;")
    cur.execute("ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS user_id INT;")
    cur.execute("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS user_id INT;")
    cur.execute("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS user_id INT;")
    cur.execute("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS business_id INT REFERENCES business(id);")
    cur.execute("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS vat_rate NUMERIC;")
    cur.execute("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS vat_amount NUMERIC;")
    cur.execute("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS currency VARCHAR(10);")
    cur.execute("ALTER TABLE jobs DROP COLUMN IF EXISTS assigned_mechanic;")
    cur.execute("ALTER TABLE jobs ADD COLUMN IF NOT EXISTS mechanic_id INT REFERENCES mechanics(id);")
    cur.execute("ALTER TABLE mechanics ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;")

    cur.execute("""
    CREATE TABLE IF NOT EXISTS public.business
    (
        id SERIAL,
        name TEXT NOT NULL,
        address TEXT,
        phone TEXT NOT NULL,
        email TEXT,
        website TEXT,
        user_id INT,
        is_active boolean DEFAULT true,
        CONSTRAINT business_pkey PRIMARY KEY (id, name)
    );
    """)

    conn.commit()
    cur.close()
    conn.close()