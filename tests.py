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

import requests
from PIL import Image

# Retrieve image from url
img_url = "https://f005.backblazeb2.com/file/shop-central/product_images/bama-mayosauce-17ml-carton-image.jpg"

# Get the data into variable
img_data = requests.get(img_url).content

file_name = "main_app/static/cached_files/bama.jpg"
# Save to file
with open(file_name, "wb") as f:
    f.write(img_data)

# Open the image and display it
img = Image.open(r"main_app/static/cached_files/bama.jpg")
img.show()

print(file_name)