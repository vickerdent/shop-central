from email.message import EmailMessage
import os, ssl, smtplib
from dotenv import load_dotenv

load_dotenv()

# Define the callback that specifies the sequence of operations to perform inside the transactions.
# customer_name, amount_paid, reference_no
def payment_callback(session, customer_name, transaction_doc, slugs_list=None, quants_list=None, debtor_doc=None):
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
    if slugs_list and quants_list:
        for index, slug in enumerate(slugs_list):
            print(slugs_list)
            print(quants_list)
            print(quants_list[index])
            products_collection.update_one({"slug": slug},
                                        {"$inc": {"singles_stock": -int(float(quants_list[index]))}},
                                        session=session)
    
    # Delete cart from collection
    staff_carts_collection.delete_one({"name_of_buyer": customer_name, 
                                       "staff_id": transaction_doc["staff_id"]}, session=session)

    # Get reference to debtor collections, if variable is supplied and apply operation
    if debtor_doc:
        debtors_collection = session.client.JDS.debtors
        debtors_collection.update_one({"phone_no.number": debtor_doc["phone_no"][0]["number"]},
                                      {"$set": debtor_doc}, upsert=True)
        
        debtor_records_collection = session.client.JDS.debtor_records
        debtor_records_collection.insert_one({"txn_date": transaction_doc["checkout_date"], "buyer_id": transaction_doc["buyer_id"],
                                              "txn_type": transaction_doc["txn_type"], "txn_reference": transaction_doc["reference_no"],
                                              "txn_amount": transaction_doc["total_amount"], "amount_paid": transaction_doc["amount_paid"],
                                              "balance": debtor_doc["amount_owed"]})

    # Add new transaction to transactions collection
    transactions_collection.insert_one(transaction_doc, session=session)

    return

def standardize_phone(d_phone_number: str):
    """
    Function to standardize phone numbers as
    10 digits, for use with country codes
    """
    if len(d_phone_number) == 11:
        processed_phone = d_phone_number[1:]
    else:
        processed_phone = d_phone_number

    return processed_phone

def correct_book_id(name) -> str:
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

def strip_id(id_num: str) -> str:
    """Eliminates spaces, dashes, colons and periods
    from id variable"""

    the_index = 0
    new_input = id_num.strip()
    d_id = ""
    while the_index < len(new_input):
        if new_input[the_index] in [' ', "-", ":", "."]:
            the_index += 1
            continue
        d_id += new_input[the_index]
        the_index += 1
    return d_id

humans = ("Male", "Female")

def send_email_resetpassword(subject, body, receiver: str):
    email_sender = os.getenv("EMAIL_SENDER")
    email_password = os.getenv("EMAIL_PASSWORD")

    msg = EmailMessage()
    msg["From"]  = email_sender
    msg["To"] = receiver
    msg["Subject"] = subject
    msg.set_content(body)

    context = ssl.create_default_context()

    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as smtp:
        smtp.login(email_sender, email_password)
        smtp.sendmail(email_sender, receiver, msg.as_string())