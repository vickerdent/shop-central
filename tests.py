# product = {"name_of": "Victor",
#     "all_of" : {"human_1": "Victor", "human_2": "Joshua", "human_3": "Micah",
#             "animal_1": "Dog", "animal_3": "Donkey", "animal_4": "Lion"}}

# allof = {inst : product["all_of"][inst] for inst in product["all_of"] if inst.startswith("animal")}
# print(allof)

# price = 1000
# hum_price = ""

# price_str = str(price)
# rev_price = price_str[::-1]

# if len(price_str) > 3:
#     for i, val in enumerate(rev_price):
#         hum_price += val
#         if (i + 1) % 3 == 0 and i != len(rev_price) - 1:
#             hum_price += ","

# print(hum_price[::-1])





