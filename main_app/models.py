from datetime import datetime
from decimal import Decimal
from django.db import models
from .custom_storage import MediaStorage

# Create your models here.
class Human:
    """
    Class defining who a human being is
    """
    __slot__ = ("first_name", "last_name", "email", "username",  "gender", "phone_no", "address", "state")

    def __init__(self, first_name: str, last_name: str, username: str, email: str, gender: str,
                 phone_no: list, address: str, state: str) -> None:
        self.first_name = first_name
        self.last_name = last_name
        self.username = username
        self.email = email
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

    def __init__(self, first_name: str, last_name: str, username: str, email: str, gender: str, phone_no: list,
                 address: str, state: str, image: list, registered: bool = False, 
                 is_staff: bool = False, is_admin: bool = False) -> None:
        super().__init__(first_name, last_name, username, email, gender, phone_no, address, state)
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

    def __init__(self, first_name: str, last_name: str, username: str, email: str, gender: str, phone_no: list,
                 address: str, state: str, date_modified: datetime, amount_owed: str,
                 description: str, image: list) -> None:
        super().__init__(first_name, last_name, username, email, gender, phone_no, address, state)
        self.description = description
        self.date_modified = date_modified
        self.amount_owed = Decimal(str(amount_owed)) + Decimal("0.00")
        self.image = image
        self.name = self.first_name + " " + self.last_name

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
            "gender": self.gender,
            "phone_no": self.phone_no,
            "address": self.address,
            "state": self.state,
            "date_modified": self.date_modified,
            "amount_owed": str(self.amount_owed),
            "description": self.description,
            "image": self.image
        }

# Add discount and proper bulk and carton/bag variables
class Product:
    """
    Class defining products in the shop's inventory

    Bulk here means either roll, or dozen, 
    depending on how the product is produced

    Note that price-related variables accept strings
    to convert to their decimals before finally storing as strings
    """
    __slot__ = ("brand_name", "product_name", "size", "product_image", "tags", "retail_price", "wholesale_price",
                "is_discount", "discount_retail_price", "has_bulk", "bulk",
                "is_carton_bag", "carton_bag_price", "no_in_carton_bag", "carton_bag_image", "price_modified_date",
                "singles_stock", "carton_bag_stock", "description", "slug", "is_divisible", "is_carton_bag_divisible")
    
    def __init__(self, brand_name: str, product_name: str, size: str, product_image: list, tags: list,
                 retail_price: str, wholesale_price: str, is_discount: bool, discount_retail_price: str, has_bulk: bool,
                 bulk: list, is_carton_bag: str, carton_bag_price: str, no_in_carton_bag: int, carton_bag_image: list,
                 price_modified_date: datetime, singles_stock: int, carton_bag_stock: int, description: str, slug: str,
                 is_divisible: bool, is_carton_bag_divisible: bool) -> None:
        self.brand_name = brand_name
        self.product_name = product_name
        self.size = size
        self.product_image = product_image
        self.tags = tags
        self.retail_price = Decimal(str(retail_price)) + Decimal("0.00")
        self.wholesale_price = Decimal(str(wholesale_price)) + Decimal("0.00")
        self.is_discount = is_discount
        self.discount_retail_price = Decimal(str(discount_retail_price)) + Decimal("0.00")
        self.is_divisible = is_divisible
        self.has_bulk = has_bulk
        self.bulk = bulk
        self.is_carton_bag = is_carton_bag # Does Product come in Cartons or Bags?
        self.carton_bag_price = Decimal(str(carton_bag_price)) + Decimal("0.00")
        self.no_in_carton_bag = no_in_carton_bag
        self.carton_bag_image = carton_bag_image
        self.price_modified_date = price_modified_date
        self.singles_stock = singles_stock
        self.carton_bag_stock = carton_bag_stock
        self.descripton = description
        self.is_carton_bag_divisible = is_carton_bag_divisible
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
            "retail_price": str(self.retail_price),
            "wholesale_price": str(self.wholesale_price),
            "is_discount": self.is_discount,
            "discount_retail_price": str(self.discount_retail_price),
            "is_divisible": self.is_divisible,
            "has_bulk": self.has_bulk,
            "bulk": self.bulk,
            "is_carton_bag": self.is_carton_bag,
            "carton_bag_price": str(self.carton_bag_price),
            "no_in_carton_bag": self.no_in_carton_bag,
            "carton_bag_image": self.carton_bag_image,
            "is_carton_bag_divisible": self.is_carton_bag_divisible,
            "price_modified_date": self.price_modified_date,
            "singles_stock": self.singles_stock,
            "carton_bag_stock": self.carton_bag_stock,
            "description": self.descripton,
            "slug": self.slug
        }

class TestProduct(models.Model):
    pro_name = models.CharField(max_length=100)
    pro_size = models.CharField(max_length = 14)
    pro_price = models.DecimalField(max_digits=8, decimal_places=2)
    pro_image = models.FileField(upload_to="test_folder", storage=MediaStorage)
    
class ProductLite:
    """
    Class defining products in the shop's inventory
    to be displayed in the product's page
    """
    __slot__ = ("brand_name", "product_name", "size", "product_image", "tags", "retail_price",
                "singles_stock", "slug")
    
    def __init__(self, brand_name: str, product_name: str, size: str, product_image: list,
                 retail_price: str, singles_stock: int, slug: str) -> None:
        self.brand_name = brand_name
        self.product_name = product_name
        self.size = size
        self.product_image = product_image
        self.retail_price = Decimal(str(retail_price)) + Decimal("0.00")
        self.singles_stock = singles_stock
        self.slug = slug
        self.name = self.brand_name + " " + self.product_name + " - " + self.size

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

class StaffCart:
    """
    Class definition for carts containing
    items to be bought.

    Note that price-related variables accept strings
    to convert to their decimals
    """
    __slot__ = ("name_of_buyer", "staff_id", "items", "total_amount", "checkout_date",
                "amount_paid", "created_date")
    
    def __init__(self, name_of_buyer: str, staff_id: str, items: list, total_amount: str,
                 amount_paid: str, created_date = datetime.now(), checkout_date = datetime.now()) -> None:
        self.name_of_buyer = name_of_buyer
        self.staff_id = staff_id
        self.items = items
        self.total_amount = Decimal(str(total_amount))
        self.checkout_date = checkout_date
        self.amount_paid = Decimal(str(amount_paid)) + Decimal("0.00")
        # Note that amount owed can be negative, which will translate to giving customer change
        self.amount_owed = self.total_amount - self.amount_paid
        self.created_date = created_date

    def to_dict(self):
        """
        Returns dictionary containing info for
        writing to MongoDB
        """
        return {
            "name_of_buyer": self.name_of_buyer,
            "staff_id": self.staff_id,
            "items": self.items,
            "total_amount": str(self.total_amount),
            "amount_paid": str(self.amount_paid),
            "amount_owed": str(self.amount_owed),
            "created_date": self.created_date,
            "checkout_date": self.checkout_date
        }
    
class Transaction:
    """
    Class definition for transactions created
    from a typical cart.

    Note that price-related variables accept strings
    to convert to their decimals.

    buyer_id should be phone numbers, only necessary
    if buyer is owing money
    """
    __slot__ = ("txn_type", "txn_initiator", "name_of_buyer", "staff_id", "items", "total_amount", "checkout_date",
                "amount_paid", "reference_no", "buyer_id")
    
    def __init__(self, txn_type, txn_initiator, name_of_buyer, staff_id, items, checkout_date: datetime, total_amount,
                 amount_paid, reference_no, buyer_id = "") -> None:
        self.txn_type = txn_type
        self.txn_initiator = txn_initiator
        self.name_of_buyer = name_of_buyer
        self.staff_id = staff_id
        self.items = items
        self.checkout_date = checkout_date
        self.total_amount = Decimal(str(total_amount))
        self.amount_paid = Decimal(str(amount_paid)) + Decimal("0.00")
        # Note that amount owed can be negative, which will translate to giving customer change
        self.amount_owed = self.total_amount - self.amount_paid
        self.reference_no = reference_no
        self.buyer_id = buyer_id

    def to_dict(self):
        """
        Returns dictionary containing info for
        writing to MongoDB
        """
        return {
            "txn_type": self.txn_type,
            "txn_by": self.txn_initiator,
            "name_of_buyer": self.name_of_buyer,
            "buyer_id": self.buyer_id,
            "staff_id": self.staff_id,
            "items": self.items,
            "total_amount": str(self.total_amount),
            "amount_paid": str(self.amount_paid),
            "checkout_date": self.checkout_date,
            "reference_no": self.reference_no,
            "balance": str(self.amount_owed)
        }