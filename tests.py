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

print("nothing")

# inputed_phone = "8036069832"
# if len(inputed_phone) == 11:
#     processed_phone = inputed_phone[1:]
# else:
#     processed_phone = inputed_phone

# print(processed_phone)
from datetime import datetime, timedelta
a_date = "2024-02-25"
ano_date = "2024-02-26"
first_date = datetime.strptime(a_date, "%Y-%m-%d")
second_date = datetime.strptime(ano_date, "%Y-%m-%d")

# time_difference = timedelta(hours=23, minutes=59, seconds=59, microseconds=999999)
# second_date = second_date + time_difference

if datetime.date(second_date) > datetime.date(datetime.today()):
    print("Is less than")
else:
    print("Can't see it")
