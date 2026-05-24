import random

from core.redis import redis_client

OTP_EXPIRY = 300  # 5 minutes

def generate_otp():

    return f"{random.randint(100000, 999999)}"

def save_otp(email: str, otp: str):

    redis_client.setex(
        f"otp:{email}",
        OTP_EXPIRY,
        otp
    )

def verify_otp(email: str, user_otp: str):

    stored_otp = redis_client.get(
        f"otp:{email}"
    )
    print(stored_otp)

    if not stored_otp:
        return False, "OTP expired or not found"

    if stored_otp != user_otp:
        return False, "Invalid OTP"

    return True, "OTP verified"