import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    gmail = Column(String, unique=True, index=True, nullable=False)
    phone_number = Column(String, nullable=False)
    block = Column(String, nullable=False)
    house_number = Column(String, nullable=False)
    role = Column(String, default="member") # "admin" or "member"
    hashed_password = Column(String, nullable=False)

    complaints = relationship("Complaint", back_populates="user")
    votes_cast = relationship("VoteCast", back_populates="user")
    maintenance_bills = relationship("MaintenanceBill", back_populates="user")


class Notice(Base):
    __tablename__ = "notices"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    tag = Column(String, default="announcement") # "urgent", "event", "maintenance", "announcement"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False) # "Plumbing", "Electrical", "Cleanliness", "Security", "Others"
    description = Column(String, nullable=False)
    status = Column(String, default="pending") # "pending", "in_progress", "resolved"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="complaints")


class VotePoll(Base):
    __tablename__ = "vote_polls"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    options = Column(String, nullable=False) # JSON-serialized list of strings, e.g., '["Yes", "No"]'
    closed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    votes = relationship("VoteCast", back_populates="poll", cascade="all, delete-orphan")


class VoteCast(Base):
    __tablename__ = "votes_cast"

    id = Column(Integer, primary_key=True, index=True)
    poll_id = Column(Integer, ForeignKey("vote_polls.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    selected_option = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="votes_cast")
    poll = relationship("VotePoll", back_populates="votes")


class MaintenanceBill(Base):
    __tablename__ = "maintenance_bills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    month = Column(Integer, nullable=False) # 1 to 12
    year = Column(Integer, nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String, default="unpaid") # "paid", "unpaid", "upcoming"
    transaction_id = Column(String, nullable=True)
    payment_date = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="maintenance_bills")
