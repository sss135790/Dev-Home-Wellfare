import smtplib

from email.mime.text import MIMEText

from core.config import EMAIL, PASSWORD

def send_otp_email(receiver_email: str, otp: str):

    msg = MIMEText(f"Your OTP code for Dev Home Wellfare Society ADMIN login is: {otp}")

    msg["Subject"] = "OTP Verification"
    msg["From"] = EMAIL
    msg["To"] = EMAIL

    server = smtplib.SMTP("smtp.gmail.com", 587)

    server.starttls()

    server.login(EMAIL, PASSWORD)

    server.sendmail(
        EMAIL,
        EMAIL,
        msg.as_string()
    )

    server.quit()