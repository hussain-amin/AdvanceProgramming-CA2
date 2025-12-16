from app import create_app
from app.models import db, User, Project, Task
from datetime import datetime, timedelta

app = create_app()
with app.app_context():
    # Get member IDs (assuming members are IDs 2-6)
    members = User.query.filter_by(role='member').all()
    member_ids = [m.id for m in members]
    
    if len(member_ids) < 5:
        print("Error: Need at least 5 members in database first!")
        exit()
    
    # Project 1: E-Commerce Website
    p1 = Project(
        name="E-Commerce Website Redesign",
        description="Complete overhaul of the company's online store with modern UI, improved checkout flow, and mobile responsiveness.",
        start_date=datetime(2025, 12, 1),
        due_date=datetime(2026, 2, 28),
        priority="high"
    )
    p1.members = members[:3]  # Assign first 3 members
    db.session.add(p1)
    db.session.flush()
    
    tasks_p1 = [
        Task(project_id=p1.id, task_number=1, title="Design new homepage mockups", 
             description="Create wireframes and high-fidelity mockups for the new homepage design including hero section, featured products, and navigation.",
             priority="high", start_date=datetime(2025, 12, 1), due_date=datetime(2025, 12, 15), assigned_to=member_ids[0]),
        Task(project_id=p1.id, task_number=2, title="Implement shopping cart functionality",
             description="Build the shopping cart system with add/remove items, quantity updates, and persistent storage using local storage and database sync.",
             priority="high", start_date=datetime(2025, 12, 10), due_date=datetime(2025, 12, 30), assigned_to=member_ids[1]),
        Task(project_id=p1.id, task_number=3, title="Payment gateway integration",
             description="Integrate Stripe payment gateway for credit card processing. Include error handling and payment confirmation emails.",
             priority="high", start_date=datetime(2026, 1, 1), due_date=datetime(2026, 1, 20), assigned_to=member_ids[2]),
        Task(project_id=p1.id, task_number=4, title="Mobile responsive testing",
             description="Test all pages on various mobile devices and screen sizes. Fix any layout issues and ensure touch-friendly interactions.",
             priority="medium", start_date=datetime(2026, 1, 15), due_date=datetime(2026, 2, 10), assigned_to=member_ids[0]),
        Task(project_id=p1.id, task_number=5, title="Performance optimization",
             description="Optimize images, implement lazy loading, minify CSS/JS, and ensure page load time under 3 seconds.",
             priority="medium", start_date=datetime(2026, 2, 1), due_date=datetime(2026, 2, 20), assigned_to=member_ids[1]),
    ]
    
    # Project 2: Mobile App Development
    p2 = Project(
        name="Fitness Tracker Mobile App",
        description="Native mobile application for iOS and Android to track workouts, nutrition, and health metrics with social features.",
        start_date=datetime(2025, 12, 5),
        due_date=datetime(2026, 3, 31),
        priority="high"
    )
    p2.members = members[1:4]  # Members 2,3,4
    db.session.add(p2)
    db.session.flush()
    
    tasks_p2 = [
        Task(project_id=p2.id, task_number=1, title="User authentication system",
             description="Implement secure login/signup with email verification, password reset, and social login (Google, Apple).",
             priority="high", start_date=datetime(2025, 12, 5), due_date=datetime(2025, 12, 20), assigned_to=member_ids[1]),
        Task(project_id=p2.id, task_number=2, title="Workout logging module",
             description="Create UI and backend for logging exercises, sets, reps, and weights. Include exercise library with 200+ exercises.",
             priority="high", start_date=datetime(2025, 12, 15), due_date=datetime(2026, 1, 15), assigned_to=member_ids[2]),
        Task(project_id=p2.id, task_number=3, title="Progress charts and analytics",
             description="Build interactive charts showing workout history, weight progression, and personal records over time.",
             priority="medium", start_date=datetime(2026, 1, 10), due_date=datetime(2026, 2, 5), assigned_to=member_ids[3]),
        Task(project_id=p2.id, task_number=4, title="Push notification system",
             description="Implement push notifications for workout reminders, achievement unlocks, and social interactions.",
             priority="low", start_date=datetime(2026, 2, 1), due_date=datetime(2026, 2, 28), assigned_to=member_ids[1]),
    ]
    
    # Project 3: Internal HR Portal
    p3 = Project(
        name="Employee HR Self-Service Portal",
        description="Internal web portal for employees to manage leave requests, view payslips, update personal info, and access company policies.",
        start_date=datetime(2025, 12, 10),
        due_date=datetime(2026, 2, 15),
        priority="medium"
    )
    p3.members = [members[0], members[3], members[4]]
    db.session.add(p3)
    db.session.flush()
    
    tasks_p3 = [
        Task(project_id=p3.id, task_number=1, title="Leave request management",
             description="Build leave request form with manager approval workflow, leave balance tracking, and calendar integration.",
             priority="high", start_date=datetime(2025, 12, 10), due_date=datetime(2025, 12, 28), assigned_to=member_ids[0]),
        Task(project_id=p3.id, task_number=2, title="Payslip viewer module",
             description="Secure PDF generation and viewing of monthly payslips with download option. Include year-to-date summaries.",
             priority="high", start_date=datetime(2025, 12, 20), due_date=datetime(2026, 1, 10), assigned_to=member_ids[3]),
        Task(project_id=p3.id, task_number=3, title="Employee directory search",
             description="Searchable employee directory with photos, contact info, department, and reporting structure.",
             priority="medium", start_date=datetime(2026, 1, 5), due_date=datetime(2026, 1, 25), assigned_to=member_ids[4]),
        Task(project_id=p3.id, task_number=4, title="Policy document repository",
             description="Create document management system for company policies with version control and acknowledgment tracking.",
             priority="low", start_date=datetime(2026, 1, 20), due_date=datetime(2026, 2, 10), assigned_to=member_ids[0]),
    ]
    
    # Project 4: Data Analytics Dashboard
    p4 = Project(
        name="Sales Analytics Dashboard",
        description="Real-time business intelligence dashboard showing sales metrics, revenue trends, and customer insights for executive team.",
        start_date=datetime(2025, 12, 15),
        due_date=datetime(2026, 1, 31),
        priority="high"
    )
    p4.members = [members[2], members[4]]
    db.session.add(p4)
    db.session.flush()
    
    tasks_p4 = [
        Task(project_id=p4.id, task_number=1, title="Database ETL pipeline",
             description="Build data extraction from CRM, ERP, and POS systems. Transform and load into analytics data warehouse.",
             priority="high", start_date=datetime(2025, 12, 15), due_date=datetime(2025, 12, 28), assigned_to=member_ids[2]),
        Task(project_id=p4.id, task_number=2, title="Revenue KPI widgets",
             description="Create dashboard widgets for daily/weekly/monthly revenue, growth rates, and comparison to targets.",
             priority="high", start_date=datetime(2025, 12, 22), due_date=datetime(2026, 1, 8), assigned_to=member_ids[4]),
        Task(project_id=p4.id, task_number=3, title="Geographic sales map",
             description="Interactive map visualization showing sales by region with drill-down to city level.",
             priority="medium", start_date=datetime(2026, 1, 5), due_date=datetime(2026, 1, 18), assigned_to=member_ids[2]),
        Task(project_id=p4.id, task_number=4, title="Automated report generation",
             description="Weekly PDF reports auto-generated and emailed to stakeholders with key metrics and insights.",
             priority="medium", start_date=datetime(2026, 1, 12), due_date=datetime(2026, 1, 28), assigned_to=member_ids[4]),
        Task(project_id=p4.id, task_number=5, title="Executive mobile view",
             description="Responsive mobile-friendly version of key dashboard metrics for executives on the go.",
             priority="low", start_date=datetime(2026, 1, 20), due_date=datetime(2026, 1, 31), assigned_to=member_ids[2]),
    ]
    
    # Project 5: Customer Support System
    p5 = Project(
        name="Customer Support Ticketing System",
        description="Helpdesk application for managing customer inquiries with ticket tracking, SLA monitoring, and knowledge base.",
        start_date=datetime(2025, 12, 20),
        due_date=datetime(2026, 3, 15),
        priority="medium"
    )
    p5.members = members  # All 5 members
    db.session.add(p5)
    db.session.flush()
    
    tasks_p5 = [
        Task(project_id=p5.id, task_number=1, title="Ticket submission portal",
             description="Customer-facing form for submitting support tickets with category selection, file attachments, and confirmation emails.",
             priority="high", start_date=datetime(2025, 12, 20), due_date=datetime(2026, 1, 5), assigned_to=member_ids[0]),
        Task(project_id=p5.id, task_number=2, title="Agent ticket queue",
             description="Internal dashboard for support agents to view, claim, and respond to tickets with priority sorting.",
             priority="high", start_date=datetime(2025, 12, 28), due_date=datetime(2026, 1, 18), assigned_to=member_ids[1]),
        Task(project_id=p5.id, task_number=3, title="SLA tracking and alerts",
             description="Monitor response and resolution times against SLA targets. Send alerts for tickets approaching breach.",
             priority="medium", start_date=datetime(2026, 1, 10), due_date=datetime(2026, 2, 1), assigned_to=member_ids[2]),
        Task(project_id=p5.id, task_number=4, title="Knowledge base articles",
             description="Build searchable FAQ and help article system with rich text editor and category organization.",
             priority="medium", start_date=datetime(2026, 1, 25), due_date=datetime(2026, 2, 20), assigned_to=member_ids[3]),
        Task(project_id=p5.id, task_number=5, title="Customer satisfaction surveys",
             description="Post-resolution survey emails with rating system and feedback collection. Dashboard for CSAT scores.",
             priority="low", start_date=datetime(2026, 2, 10), due_date=datetime(2026, 3, 5), assigned_to=member_ids[4]),
    ]
    
    # Add all tasks
    for task in tasks_p1 + tasks_p2 + tasks_p3 + tasks_p4 + tasks_p5:
        db.session.add(task)
    
    db.session.commit()
    
    print("Database seeded successfully!")
    print("\nProjects created:")
    print("  1. E-Commerce Website Redesign (5 tasks)")
    print("  2. Fitness Tracker Mobile App (4 tasks)")
    print("  3. Employee HR Self-Service Portal (4 tasks)")
    print("  4. Sales Analytics Dashboard (5 tasks)")
    print("  5. Customer Support Ticketing System (5 tasks)")
    print("\nTotal: 5 projects, 23 tasks")
