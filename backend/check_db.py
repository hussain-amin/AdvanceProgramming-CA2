from app import create_app
from app.models import db

app = create_app()
with app.app_context():
    # Check tasks table schema
    result = db.session.execute(db.text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tasks' ORDER BY ordinal_position"))
    print("Tasks table columns:")
    for r in result:
        print(f"  - {r[0]}: {r[1]}")
    
    # Check for primary key constraint
    result = db.session.execute(db.text("""
        SELECT tc.constraint_name, kcu.column_name 
        FROM information_schema.table_constraints tc 
        JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name 
        WHERE tc.table_name = 'tasks' AND tc.constraint_type = 'PRIMARY KEY'
    """))
    print("\nPrimary key columns:")
    for r in result:
        print(f"  - {r[1]}")
