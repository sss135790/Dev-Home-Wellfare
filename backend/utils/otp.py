import random
import datetime
from core.config import (
    EMAIL
)

# temporary in-memory storage
otp_store = {}

def generate_otp():

    return f"{random.randint(100000, 999999)}"

def save_otp(email: str, otp: str):

    expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=5)

    otp_store[email] = {
        "code": otp,
        "expiry": expiry
    }

def verify_otp(email: str, user_otp: str):

    otp_record = otp_store.get(EMAIL)

    if not otp_record:
        return False, "OTP not found"

    if otp_record["expiry"] < datetime.datetime.utcnow():
        return False, "OTP expired"

    if otp_record["code"] != user_otp.strip():
        return False, "Invalid OTP"

    otp_store.pop(email, None)

    return True, "OTP verified"