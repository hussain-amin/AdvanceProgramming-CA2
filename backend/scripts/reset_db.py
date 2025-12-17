from app import create_app
from app.models import db, User

app = create_app()
with app.app_context():
    # Create 5 members
    for i in range(1, 6):
        member = User(name=f'Member {i}', email=f'member{i}@test.com', role='member')
        member.set_password('123')
        db.session.add(member)
    db.session.commit()
    print('Created 5 members:')
    for i in range(1, 6):
        print(f'  - member{i}@test.com / 123')
