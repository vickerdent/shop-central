from email.message import EmailMessage
import os, ssl, smtplib
from dotenv import load_dotenv

load_dotenv()
from utils import security_guard

def correct_id(name) -> str:
    """ Used to introduce correct
        IDs for books and other content"""
    the_index = 0
    new_input = str(name).strip()
    d_id = new_input[the_index]
    while the_index < len(new_input):
        if new_input[the_index] == ' ':
            the_index += 1
            d_id += new_input[the_index]
            continue
        the_index += 1
    return d_id

humans = ("Male", "Female")

def send_email_resetpassword(subject, body, receiver: str):
    email_sender = security_guard.get_secret("EMAIL_SENDER").secret_value
    email_password = security_guard.get_secret("EMAIL_PASSWORD").secret_value

    msg = EmailMessage()
    msg["From"]  = email_sender
    msg["To"] = receiver
    msg["Subject"] = subject
    msg.set_content(body)

    context = ssl.create_default_context()

    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as smtp:
        smtp.login(email_sender, email_password)
        smtp.sendmail(email_sender, receiver, msg.as_string())