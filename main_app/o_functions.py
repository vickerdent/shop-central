from email.message import EmailMessage
import os, ssl, smtplib
from dotenv import load_dotenv

load_dotenv()
from utils import security_guard

# Define the callback that specifies the sequence of operations to perform inside the transactions.
# customer_name, amount_paid, reference_no
def payment_callback(session, customer_name, transaction_doc, slugs_list, quants_list, debtor_doc=None):
    """
    Callback function that specifies the sequence of 
    operations to perform inside a transaction
    affecting multiple documents and/or collections.
    """
    # Get reference to staff carts collection
    staff_carts_collection = session.client.JDS.staff_carts

    # Get reference to transactions collection
    transactions_collection = session.client.JDS.transactions

    # Get reference to products collection
    products_collection = session.client.JDS.products

    # Update all products respectively in cart at checkout
    for index, slug in enumerate(slugs_list):
        products_collection.update_one({"slug": slug},
                                       {"$inc": {"singles_stock": -int(quants_list[index])}},
                                       session=session)
    
    # Delete cart from collection
    staff_carts_collection.delete_one({"name_of_buyer": customer_name, 
                                       "staff_id": transaction_doc["staff_id"]}, session=session)

    # Get reference to debtor collection, if variable is supplied and apply operation
    if debtor_doc:
        debtors_collection = session.client.JDS.debtors
        debtors_collection.update_one({"phone_no.number": debtor_doc["phone_no"][0]["number"]},
                                      {debtor_doc}, upsert=True)

    # Add new transaction to transactions collection
    transactions_collection.insert_one(transaction_doc, session=session)

    return


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