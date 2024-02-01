import pprint
product = {"bulk_type_1": "Victor", "bulk_price_1": "Joshua", "no_in_bulk_1": "Dog", "bulk_image_1": "Donkey", 
            "bulk_type_2": "Loise", "bulk_price_2": "Queen", "no_in_bulk_2": "Zebra", "bulk_image_2": "Giraffe",
            "bulk_type_3": "Micah", "bulk_price_3": "Sockot", "no_in_bulk_3": "Lion", "bulk_image_3": "Tiger",
            "bulk_type_4": "Loise", "bulk_price_4": "Queen", "no_in_bulk_4": "Zebra", "bulk_image_4": "Giraffe"}

# run through these to extract only bulk, then implement in views
# run through post data, check if item in array matches both slug and item's true_sale_type
# True sale type: Roll, Pack, retail_price;, wholesale_price, carton_bag_price etc.


# for item in product["all_of"]:
#     if item["human_2"] == "Queen":
#         print("Found the human")
#         break
#     print("Zuba")


# inputed_phone = "8036069832"
# if len(inputed_phone) == 11:
#     processed_phone = inputed_phone[1:]
# else:
#     processed_phone = inputed_phone

# print(processed_phone)

# from email.message import EmailMessage
# import ssl, smtplib


# receiver = "vickerdenzy@outlook.com"
# subject = "Testing This Thing"
# body = "Mega test is on going"

# msg = EmailMessage()
# msg["From"]  = email_sender
# msg["To"] = receiver
# msg["subject"] = subject
# msg.set_content(body)

# context = ssl.create_default_context()

# with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as smtp:
#     smtp.login(email_sender, email_password)
#     smtp.sendmail(email_sender, receiver, msg.as_string())