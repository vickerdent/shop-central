import pymongo, os, ssl, smtplib, random
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
# from datetime import datetime, timedelta
from email.message import EmailMessage
load_dotenv()

#Get database connection
uri = os.getenv("MONGODB_URI")

client = pymongo.MongoClient(uri, server_api=ServerApi('1'))

database = client["JDS"]

user_collection = database["the_users"]
new_accounts_collection = database["new_accounts"]
products_collection = database["products"]
staff_carts_collection = database["staff_carts"]
transactions_collection = database["transactions"]
debtors_collection = database["debtors"]
debtor_records_collection = database["debtor_records"]

# human TheUser("Victor Abuka", "vickerdent@gmail.com", "vickerdent", "Male", "08080360932",
#                 "No. 42, Winners' Way, Dawaki, Abuja", "F.C.T.", [], True, True, True)

# first = user_collection.insert_one(human.to_dict())
# print(first.inserted_id, first.acknowledged)

# Create index
# what = staff_carts_collection.create_index([("staff_id", pymongo.ASCENDING)])
# what2 = debtors_collection.create_index([("phone_no.number", pymongo.ASCENDING)], unique=True)
# print(what)


def code_generator():
    """Generate random code"""

    alpha_num_list = (
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'
        'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
        )
    
    first_elem = random.choice(alpha_num_list)
    second_elem = random.randint(1, 9)
    third_elem = random.randint(1, 9)
    fourth_elem = random.randint(1, 9)
    fifth_elem = random.randint(1, 9)
    sixth_elem = random.randint(1, 9)
    seventh_elem = random.choice(alpha_num_list)
    eight_elem = random.randint(1, 9)

    char_list = str(first_elem) + str(second_elem) + str(third_elem) + \
    str(fourth_elem) + str(fifth_elem) + str(sixth_elem) + str(seventh_elem) + str(eight_elem)

    return char_list

def send_email_code(receiver: str):
    email_sender = os.getenv("EMAIL_SENDER")
    email_password = os.getenv("EMAIL_PASSWORD")
    
    print(email_sender)
    print(email_password)
    code = code_generator()
    new_user = user_collection.find_one({"email": receiver})

    subject = f"{new_user['first_name']} {new_user['last_name']}, Confirm Your Account with Jovimifah Destiny Store"
    body = f"""
        Here is your one-time passcode: {code}
        This code will expire in 59 minutes.


        Got any problem? Simply reply us.
        """
    # Run Mongo_DB Code Here
    new_accounts_collection.insert_one({"email": receiver, "passcode": code})

    msg = EmailMessage()
    msg["From"]  = email_sender
    msg["To"] = receiver
    msg["Subject"] = subject
    msg.set_content(body)

    context = ssl.create_default_context()

    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as smtp:
        smtp.login(email_sender, email_password)
        smtp.sendmail(email_sender, receiver, msg.as_string())
