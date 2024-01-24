import pprint
product = {"bulk_type_1": "Victor", "bulk_price_1": "Joshua", "no_in_bulk_1": "Dog", "bulk_image_1": "Donkey", 
            "bulk_type_2": "Loise", "bulk_price_2": "Queen", "no_in_bulk_2": "Zebra", "bulk_image_2": "Giraffe",
            "bulk_type_3": "Micah", "bulk_price_3": "Sockot", "no_in_bulk_3": "Lion", "bulk_image_3": "Tiger",
            "bulk_type_4": "Loise", "bulk_price_4": "Queen", "no_in_bulk_4": "Zebra", "bulk_image_4": "Giraffe"}

i = 1
bulk_type = "bulk_type_" + str(i)
bulk_price = "bulk_price_" + str(i)
no_in_bulk = "no_in_bulk_" + str(i)
bulk_image = "bulk_image_" + str(i)

bulk = []

while product.get(bulk_type):
    # Check through bulk items, if bulk_type or bulk_price already exists
    for item in bulk:
        if product.get(bulk_type) in item.values():
            print("You can't have duplicate bulk types!")
            break

        if product.get(bulk_price) in item.values():
            print("You can't have duplicate bulk prices!")
            break
    
    # At this point, duplicates have been handled
    # Handle images next
    bulk_item = {
        "bulk_type": product[bulk_type],
        "bulk_price": product[bulk_price],
        "no_in_bulk": product[no_in_bulk],
        "bulk_image": product[bulk_image]
    }

    bulk.append(bulk_item)

    i += 1
    # Check for next bulk info in request
    bulk_type = "bulk_type_" + str(i)
    bulk_price = "bulk_price_" + str(i)
    no_in_bulk = "no_in_bulk_" + str(i)
    bulk_image = "bulk_image_" + str(i)

pprint.pprint(bulk)

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


