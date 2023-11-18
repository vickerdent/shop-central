product = {"name_of": "Victor",
    "all_of" : {"human_1": "Victor", "human_2": "Joshua", "human_3": "Micah",
            "animal_1": "Dog", "animal_3": "Donkey", "animal_4": "Lion"}}

allof = {inst : product["all_of"][inst] for inst in product["all_of"] if inst.startswith("animal")}
print(allof)

