from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict
from datetime import datetime

# OTP Schema
class OTPRequest(BaseModel):
    email: str

class OTPVerify(BaseModel):
    phone_number: str
    code: str

# User Schemas
class UserBase(BaseModel):
    username: str
    gmail: EmailStr
    phone_number: str
    block: str
    house_number: str
    role: str # "admin" | "member"

class UserCreate(UserBase):
    password: str
    otp: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str
    role: str
    otp: Optional[str] = None

class UserOut(UserBase):
    id: int

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# Notice Schemas
class NoticeCreate(BaseModel):
    title: str
    content: str
    tag: str # "urgent" | "event" | "maintenance" | "announcement"

class NoticeOut(NoticeCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Complaint Schemas
class ComplaintCreate(BaseModel):
    title: str
    category: str # "Plumbing" | "Electrical" | "Cleanliness" | "Security" | "Others"
    description: str

class ComplaintStatusUpdate(BaseModel):
    status: str # "pending" | "in_progress" | "resolved"

class ComplaintOut(BaseModel):
    id: int
    title: str
    category: str
    description: str
    status: str
    created_at: datetime
    user_id: int
    user: UserOut

    class Config:
        from_attributes = True

# Vote Poll Schemas
class VotePollCreate(BaseModel):
    title: str
    description: str
    options: List[str]

class VoteCastCreate(BaseModel):
    selected_option: str

class VoteCastOut(BaseModel):
    id: int
    poll_id: int
    user_id: int
    selected_option: str
    created_at: datetime

    class Config:
        from_attributes = True

class VotePollOut(BaseModel):
    id: int
    title: str
    description: str
    options: List[str] # Parsed options
    closed: bool
    created_at: datetime
    results: Dict[str, int] # Count of votes per option
    has_voted: bool # Check if the requesting user has voted
    voted_option: Optional[str] = None # Which option they selected

    class Config:
        from_attributes = True

# Maintenance Bill Schemas
class MaintenanceBillOut(BaseModel):
    id: int
    user_id: int
    month: int
    year: int
    amount: float
    status: str # "paid" | "unpaid" | "upcoming"
    transaction_id: Optional[str] = None
    payment_date: Optional[datetime] = None

    class Config:
        from_attributes = True

class PaymentRequest(BaseModel):
    card_number: str
    expiry: str
    cvv: str
    cardholder_name: str
