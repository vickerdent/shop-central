product = {"name_of": "Victor",
    "all_of" : [{"human_1": "Victor", "human_2": "Joshua", "animal_1": "Dog", "animal_2": "Donkey"}, 
            {"human_1": "Loise", "human_2": "Queen", "animal_1": "Zebra", "animal_2": "Giraffe"},
            {"human_1": "Micah", "human_2": "Sockot", "animal_1": "Lion", "animal_2": "Tiger"}]}

# allof = {inst : product["all_of"][inst] for inst in product["all_of"] if inst.startswith("animal")}
# print(allof)

for item in product["all_of"]:
    if item["human_2"] == "Queen":
        print("Found the human")
        break
    print("Zuba")


# inputed_phone = "8036069832"
# if len(inputed_phone) == 11:
#     processed_phone = inputed_phone[1:]
# else:
#     processed_phone = inputed_phone

# print(processed_phone)


