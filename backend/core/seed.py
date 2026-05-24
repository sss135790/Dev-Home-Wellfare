from sqlalchemy.orm import Session
import bcrypt
from core.database import SessionLocal, Base, engine
import models.models as models
import json
import datetime

def get_password_hash(password):
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def seed_db():
    # Create tables if not exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(models.User).filter_by(username="admin").first():
            print("Database already seeded.")
            return

        print("Seeding database...")

        # 1. Create Users
        admin = models.User(
            username="admin",
            gmail="admin@devhomes.com",
            phone_number="+919876543210",
            block="Admin",
            house_number="HQ",
            role="admin",
            hashed_password=get_password_hash("admin123")
        )
        
        member1 = models.User(
            username="member1",
            gmail="member1@gmail.com",
            phone_number="+919876543211",
            block="Block A",
            house_number="A-102",
            role="member",
            hashed_password=get_password_hash("member123")
        )

        member2 = models.User(
            username="member2",
            gmail="member2@gmail.com",
            phone_number="+919876543212",
            block="Block B",
            house_number="B-304",
            role="member",
            hashed_password=get_password_hash("member123")
        )

        db.add(admin)
        db.add(member1)
        db.add(member2)
        db.flush() # Populate IDs

        # 2. Create Notices
        notice1 = models.Notice(
            title="Annual General Body Meeting",
            content="The AGM will be held on Sunday, June 15th, 2026, at 10:00 AM in the clubhouse. Attendance is mandatory for all block representatives.",
            tag="event",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
        )
        notice2 = models.Notice(
            title="Elevator Maintenance in Block B",
            content="Block B elevator will undergo routine maintenance on May 26th, 2026, between 10:00 AM and 2:00 PM. Please use the stairs during this time.",
            tag="maintenance",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
        )
        notice3 = models.Notice(
            title="Revised Security Protocols",
            content="All delivery personnel must register at the main gate. Residents must approve visitors via the app/intercom. Please report any suspicious activity.",
            tag="urgent",
            created_at=datetime.datetime.utcnow()
        )
        
        db.add(notice1)
        db.add(notice2)
        db.add(notice3)

        # 3. Create Voting Polls
        poll1 = models.VotePoll(
            title="Install Solar Panels on Rooftops",
            description="Should we install solar panels on all block rooftops to reduce common electrical bill charges? Total project budget is $15,000.",
            options=json.dumps(["Yes, absolutely", "No, too expensive", "Need more details"]),
            closed=False
        )
        poll2 = models.VotePoll(
            title="Renovate Children's Playground",
            description="Proposal to upgrade playground swings, add slides, and lay down rubberized safety flooring.",
            options=json.dumps(["Yes", "No"]),
            closed=False
        )

        db.add(poll1)
        db.add(poll2)
        db.flush()

        # Add initial dummy vote to poll1 from member2
        vote_cast = models.VoteCast(
            poll_id=poll1.id,
            user_id=member2.id,
            selected_option="Yes, absolutely"
        )
        db.add(vote_cast)

        # 4. Create Maintenance Bills for year 2026
        # Month 1-3: Paid, Month 4-5: Unpaid, Month 6-12: Upcoming
        for user in [member1, member2]:
            for month in range(1, 13):
                if month in [1, 2, 3]:
                    status = "paid"
                    tx_id = f"TXN20260{month}{user.id}999"
                    pay_date = datetime.datetime(2026, month, 5, 10, 30)
                elif month in [4, 5]:
                    status = "unpaid"
                    tx_id = None
                    pay_date = None
                else:
                    status = "upcoming"
                    tx_id = None
                    pay_date = None

                bill = models.MaintenanceBill(
                    user_id=user.id,
                    month=month,
                    year=2026,
                    amount=1200.0 if user.block == "Block A" else 1500.0,
                    status=status,
                    transaction_id=tx_id,
                    payment_date=pay_date
                )
                db.add(bill)

        # 5. Create basic dummy complaints
        complaint1 = models.Complaint(
            user_id=member1.id,
            title="Water leakage in balcony ceiling",
            category="Plumbing",
            description="There is continuous water dripping from the ceiling of my balcony, likely from the flat above ours.",
            status="pending"
        )
        complaint2 = models.Complaint(
            user_id=member2.id,
            title="Corridor lights flickering on 3rd floor",
            category="Electrical",
            description="Two lights near the elevator lobby on the 3rd floor are blinking constantly.",
            status="resolved"
        )
        db.add(complaint1)
        db.add(complaint2)

        db.commit()
        print("Database seeding completed successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
