from datetime import datetime

# Create your models here.
class Human:
    """
    Class defining who a human being is
    """
    __slot__ = ("first_name", "last_name", "email", "username",  "gender", "phone_no", "address", "state")

    def __init__(self, first_name: str, last_name: str, email: str, username: str, gender: str,
                 phone_no: str, address: str, state: str) -> None:
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.username = username
        self.gender = gender
        self.phone_no = phone_no
        self.address = address
        self.state = state


class TheUser(Human):
    """
    Child class inheriting from the Human class,
    and defining a user of the web application
    """
    __slot__ = ("registered", "is_staff", "is_admin", "image")

    def __init__(self, first_name: str, last_name: str, email: str, username: str, gender: str, phone_no: str,
                 address: str, state: str, image: list, registered: bool = False, 
                 is_staff: bool = False, is_admin: bool = False) -> None:
        super().__init__(first_name, last_name, email, username, gender, phone_no, address, state)
        self.image = image
        self.is_staff = is_staff
        self.is_admin = is_admin
        self.registered = registered

    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name}"

    def to_dict(self) -> dict:
        """
        Returns dictionary containing info for
        writing to MongoDB
        """
        return {
            "first_name": self.first_name,
            "last_name": self.last_name,
            "username": self.username,
            "email": self.email,
            "phone_no": self.phone_no,
            "gender": self.gender,
            "address": self.address,
            "state": self.state,
            "registered": self.registered,
            "is_staff": self.is_staff,
            "is_admin": self.is_admin,
            "image": self.image
        }
    

class Buyer(Human):
    """
    Child class inheriting from the Human class,
    and defining a buyer of items in the web
    application
    """
    __slot__ = ("date_modified", "amount_owed", "description", "image")

    def __init__(self, first_name: str, last_name: str, email: str, username: str, gender: str, phone_no: str,
                 address: str, state: str, date_modified: datetime, amount_owed: int,
                 description: str, image: list) -> None:
        super().__init__(first_name, last_name, email, username, gender, phone_no, address, state)
        self.description = description
        self.date_modified = date_modified
        self.amount_owed = amount_owed
        self.image = image

    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name}"
    
    def to_dict(self) -> dict:
        """
        Returns dictionary containing info for
        writing to MongoDB
        """
        return {
            "full_name": self.full_name,
            "username": self.username,
            "email": self.email,
            "phone_no": self.phone_no,
            "gender": self.gender,
            "address": self.address,
            "state": self.state,
            "image": self.image
        }

# Add discount and proper bulk and carton/bag variables
class Product:
    """
    Class defining products in the shop's inventory

    Bulk here means either roll, or dozen, 
    depending on how the product is produced
    """
    __slot__ = ("brand_name", "product_name", "size", "product_image", "tags", "retail_price", "wholesale_price",
                "is_discount", "discount_retail_price", "has_bulk", "bulk_prices", "bulk_types", "nos_in_bulk", "bulk_images",
                "is_carton_bag", "carton_bag_price", "no_in_carton_bag", "carton_bag_image", "price_modified_date",
                "singles_stock", "carton_bag_stock", "description", "slug")
    
    def __init__(self, brand_name: str, product_name: str, size: str, product_image: list, tags: list,
                 retail_price: int, wholesale_price: int, is_discount: bool, discount_retail_price: int, has_bulk: bool,
                 bulk_prices: dict, bulk_types: dict, nos_in_bulk: dict, bulk_images: dict, is_carton_bag: str,
                 carton_bag_price: int, no_in_carton_bag: int, carton_bag_image: list, price_modified_date: datetime,
                 singles_stock: int, carton_bag_stock: int, description: str, slug: str) -> None:
        self.brand_name = brand_name
        self.product_name = product_name
        self.size = size
        self.product_image = product_image
        self.tags = tags
        self.retail_price = retail_price
        self.wholesale_price = wholesale_price
        self.is_discount = is_discount
        self.discount_retail_price = discount_retail_price
        self.has_bulk = has_bulk
        self.bulk_prices = bulk_prices
        self.bulk_types = bulk_types
        self.nos_in_bulk = nos_in_bulk
        self.bulk_images = bulk_images
        self.is_carton_bag = is_carton_bag # Does Product come in Cartons or Bags?
        self.carton_bag_price = carton_bag_price
        self.no_in_carton_bag = no_in_carton_bag
        self.carton_bag_image = carton_bag_image
        self.price_modified_date = price_modified_date
        self.singles_stock = singles_stock
        self.carton_bag_stock = carton_bag_stock
        self.descripton = description
        self.slug = slug
        self.name = self.brand_name + " " + self.product_name + " - " + self.size

    def to_dict(self) -> dict:
        """
        Returns dictionary containing info for
        writing to MongoDB
        """
        return {
            "brand_name": self.brand_name,
            "product_name": self.product_name,
            "size": self.size,
            "product_image": self.product_image,
            "tags": self.tags,
            "retail_price": self.retail_price,
            "wholesale_price": self.wholesale_price,
            "is_discount": self.is_discount,
            "discount_retail_price": self.discount_retail_price,
            "has_bulk": self.has_bulk,
            "bulk": {**self.bulk_types, **self.bulk_prices, **self.nos_in_bulk, **self.bulk_images},
            "is_carton_bag": self.is_carton_bag,
            "carton_bag_price": self.carton_bag_price,
            "no_in_carton_bag": self.no_in_carton_bag,
            "carton_bag_image": self.carton_bag_image,
            "price_modified_date": self.price_modified_date,
            "singles_stock": self.singles_stock,
            "carton_bag_stock": self.carton_bag_stock,
            "description": self.descripton,
            "slug": self.slug
        }

class Carousel:
    """
    Class definition for headline pics
    """
    __slot__ = ("images")

    def __init__(self, images: dict) -> None:
        self.images = images

    def to_dict(self):
        return {
            "images": {**self.images}
        }

class Cart:
    """
    Class definition for carts containing
    items to be bought.
    """
    __slot__ = ("name_of_buyer", "staff_id", "items", "total_amount", "checkout_date",
                "amount_paid")
    
    def __init__(self, name_of_buyer: str, staff_id: str, items: list, total_amount: int,
                 checkout_date: datetime, amount_paid: int) -> None:
        self.name_of_buyer = name_of_buyer
        self.staff_id = staff_id
        self.items = items
        self.total_amount = total_amount
        self.checkout_date = checkout_date
        self.amount_paid = amount_paid
        self.amount_owed = self.total_amount - self.amount_paid
    