from django.shortcuts import render, redirect
from django.utils.text import slugify
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from datetime import datetime, timedelta
from django.conf import settings
from django.http import JsonResponse
from bson.son import SON
import pymongo, json
from decimal import Decimal

from .o_functions import humans, payment_callback, standardize_phone, strip_id
from .forms import SignUpForm, ConfirmCodeForm, ChangePasswordForm, ResetPasswordForm, \
    EditProfileImageForm, EditNameForm, AddProductForm, CarouselForm, EditProductForm, AddDebtorForm
from .models import TheUser, Buyer, Product, StaffCart, Carousel, Transaction
from .custom_storage import handle_user_image, default_user_image, compress_image, \
    change_image_name, delete_image, default_bulk_image, default_carton_image, \
        handle_product_image
from utils import user_collection, send_email_code, new_accounts_collection, products_collection, \
      staff_carts_collection, transactions_collection, debtors_collection, code_generator, client

# Create your views here.
@login_required
def home(request):
    # Get all products from DB
    all_products = list(products_collection.find().sort("price_modified_date", pymongo.DESCENDING))
    inventory = []
    for product in all_products:
        item = Product(product["brand_name"], product["product_name"], product["size"], product["product_image"],
                       product["tags"], product["retail_price"], product["wholesale_price"],
                       product["is_discount"], product["discount_retail_price"], product["has_bulk"],
                       {bk_price : product["bulk"][bk_price] for bk_price in product["bulk"] if bk_price.startswith("bulk_price")},
                       {bk_type : product["bulk"][bk_type] for bk_type in product["bulk"] if bk_type.startswith("bulk_type")},
                       {bk_no : product["bulk"][bk_no] for bk_no in product["bulk"] if bk_no.startswith("no_in_bulk")},
                       {bk_img : product["bulk"][bk_img] for bk_img in product["bulk"] if bk_img.startswith("bulk_image")},
                       product["is_carton_bag"], product["carton_bag_price"], product["no_in_carton_bag"],
                       product["carton_bag_image"], product["price_modified_date"], product["singles_stock"],
                       product["carton_bag_stock"], product["description"], product["slug"], product["is_divisible"],
                       product["is_carton_bag_divisible"])
        inventory.append(item)

    # Also get all carts for user
    all_carts = list(staff_carts_collection.find({"staff_id": request.user.email}))
    noOfCarts = len(all_carts)

    # check that user is registered
    # then check if user is staff or admin
    curr_user = user_collection.find_one({"email": request.user.email})

    if curr_user:
        a_user = TheUser(curr_user["first_name"], curr_user["last_name"], curr_user["username"],
                         curr_user["email"], curr_user["gender"], curr_user["phone_no"],
                         curr_user["address"], curr_user["state"], curr_user["image"],
                         curr_user["registered"], curr_user["is_staff"], curr_user["is_admin"])
        
        if not a_user.registered:
            messages.error(request, "Please confirm your email address.")
            return redirect("confirm_code")
        
        if a_user.is_admin:
            return render(request, "main_app/home.html", {"is_admin": True, "is_staff": True, 
                                                          "inventory": inventory, "noOfCarts": noOfCarts})
        elif a_user.is_staff:
            return render(request, "main_app/home.html", {"is_staff": True, "inventory": inventory, "carts": noOfCarts})
        else:
            return render(request, "main_app/home.html", {"inventory": inventory})
        
    return render(request, "main_app/home.html", {"inventory": inventory})

def login_user(request):
    # check if user is already logged in
    if request.user.is_authenticated:
        return redirect("username")
    
    # check if login attempt or normal request
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]

        nxt = request.POST.get("next")

        user = authenticate(username=username, password=password)
        if user:
            login(request, user)
            messages.success(request, "You have logged in successfully.")

            if nxt == "":
                # print("no next", nxt)
                return redirect(settings.LOGIN_REDIRECT_URL)
            # FOR USE WHEN USING HTTPS
            # elif not url_has_allowed_host_and_scheme(
            #         url=nxt,
            #         allowed_hosts={request.get_host()},
            #         require_https=request.is_secure()):
            # #     print("next not safe", nxt)
            #     return redirect(settings.LOGIN_REDIRECT_URL)
            else:
                # print("next very safe", nxt)
                return redirect(nxt)
        else:
            messages.error(request, "Incorrect username or password.")
    return render(request, "main_app/login.html", {})

def logout_user(request):
    logout(request)
    messages.success(request, "You've been logged out successfully.")
    return redirect(settings.LOGOUT_REDIRECT_URL)

def sign_up(request):
    # check if registration attempt or normal request
    if request.method == "POST":
        form = SignUpForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data.get("email") # get email from form
            if User.objects.filter(email=email).exists():
                messages.error(request, "Email already exists! Email must be unique!")
                return render(request, "main_app/signup.html", {"form": form})

            # Add user to MongoDB
            username = form.cleaned_data["username"]
            password = form.cleaned_data["password1"]
            first_name = form.cleaned_data.get("first_name")
            last_name = form.cleaned_data.get("last_name")
            gender = form.cleaned_data.get("gender")
            dialing_code = form.cleaned_data.get("dialing_code")
            phone_number = standardize_phone(form.cleaned_data.get("phone_number"))
            address = form.cleaned_data.get("address")
            state = form.cleaned_data.get("state")

            if gender in humans:
                if default_user_image:
                    image_url, image_path = default_user_image()
                else:
                    messages.error(request, "An internal Server error occurred. Please try again later.")
                    return redirect("sign_up")
                
                complete_phone = [{"dialing_code": dialing_code, "phone_number": phone_number}]
                
                new_user = TheUser(first_name, last_name, username, email, gender, complete_phone, address,
                                   state, [image_url, image_path])

                user_collection.insert_one(new_user.to_dict())

                form.save()
                # Send Confirmation code to user
                send_email_code(email)
                
                # Authenticate and login user
                user = authenticate(username=username, password=password)
                login(request, user)
                messages.success(request, "You have signed up and logged in successfully.")
                return redirect("confirm_code")
            else:
                messages.error(request, "An internal error occurred. Please try again later.")
                return render(request, "main_app/signup.html", {"form": form})
    else:
        form = SignUpForm()
        return render(request, "main_app/signup.html", {"form": form})

@login_required
def change_password(request):
    if request.method == "POST":
        form = ChangePasswordForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)
            messages.success(request, "You have successfully changed your password.")
            return redirect("username")
    else:
        form = ChangePasswordForm(request.user)
        curr_user = user_collection.find_one({"email": request.user.email})

        if curr_user:
            a_user = TheUser(curr_user["first_name"], curr_user["last_name"], curr_user["username"],
                         curr_user["email"], curr_user["gender"], curr_user["phone_no"],
                         curr_user["address"], curr_user["state"], curr_user["image"],
                         curr_user["registered"], curr_user["is_staff"], curr_user["is_admin"])

            all_carts = list(staff_carts_collection.find({"staff_id": a_user.email}))
            noOfCarts = len(all_carts)
            
            if a_user.is_admin:
                return render(request, "main_app/change_password.html", {"form": form, "is_admin": True, 
                                                              "is_staff": True, "noOfCarts": noOfCarts})
            elif a_user.is_staff:
                return render(request, "main_app/change_password.html", {"form": form, "is_staff": True, "noOfCarts": noOfCarts})
            
        return render(request, "main_app/change_password.html", {"form": form})
    
def reset_password(request):
    form = ResetPasswordForm(request.POST or None)
    if form.is_valid():
        form.save_func(
            subject_template_name="main_app/password-reset/password_reset_subject.txt",
            email_template_name="main_app/password-reset/password_reset_email.html",
            request=request
            )
        return redirect("password_reset_done")
    return render(request, "main_app/password-reset/reset_password.html", {"form": form})

def password_reset_done(request):
    return render(request, "main_app/password-reset/password_reset_done.html", {})

def password_reset_complete(request):
    return render(request, "main_app/password-reset/password_reset_complete.html", {})

@login_required
def user_profile(request):
    # check that user is logged in
    # then get user's details from mongodb
    curr_user = user_collection.find_one({"email": request.user.email})

    if curr_user:
        a_user = TheUser(curr_user["first_name"], curr_user["last_name"], curr_user["username"],
                         curr_user["email"], curr_user["gender"], curr_user["phone_no"],
                         curr_user["address"], curr_user["state"], curr_user["image"],
                         curr_user["registered"], curr_user["is_staff"], curr_user["is_admin"])
        if not a_user.registered:
            messages.error(request, "Please confirm your email address.")
            return redirect("confirm_code")
        
        image_form = EditProfileImageForm(request.POST or None, request.FILES or None)
        if image_form.is_valid():
            image = request.FILES["image"]
            
            image.name = change_image_name(image, a_user.username)

            compressed_image = compress_image(image)

            # add function to delete previous image from bucket
            if curr_user["image"][1] != "app_defaults/user_frame.png":
                delete_image(curr_user["image"][1])

            image_url, image_path = handle_user_image(compressed_image)

            user_collection.update_one({"email": request.user.email},
                                       {"$set": {"image": [image_url, image_path]}})

            messages.success(request, "You have successfully changed your profile image.")
            return redirect("username")
        
        initial_data = {"first_name": curr_user["first_name"],
                        "last_name": curr_user["last_name"]}

        name_form = EditNameForm(request.POST or None, initial=initial_data)
        if name_form.is_valid():
            first_name = name_form.cleaned_data["first_name"]
            last_name = name_form.cleaned_data["last_name"]

            user_collection.update_one({"email": request.user.email},
                                       {"$set": {"first_name": first_name,
                                                 "last_name": last_name}})
            
            messages.success(request, "You have successfully changed your name.")
            return redirect("username")
        
        context = {"curr_user": a_user, "image_form": image_form, "name_form": name_form}
        all_carts = list(staff_carts_collection.find({"staff_id": a_user.email}))
        noOfCarts = len(all_carts)

        if a_user.is_admin:
            context = {"curr_user": a_user, "image_form": image_form, "name_form": name_form,
                       "noOfCarts": noOfCarts, "is_admin": True, "is_staff": True}
            return render(request, "main_app/user_profile.html", context)
        elif a_user.is_staff:
            context = {"curr_user": a_user, "image_form": image_form,
                       "name_form": name_form, "noOfCarts": noOfCarts, "is_staff": True}
            return render(request, "main_app/user_profile.html", context)

        return render(request, "main_app/user_profile.html", context)
    else:
        messages.error(request, "An internal error occurred. Please try again later.")
        return render(request, "main_app/404.html", {})
    
@login_required
def add_product(request):
    # check if user is staff or admin
    curr_user = user_collection.find_one({"email": request.user.email})

    if curr_user:
        a_user = TheUser(curr_user["first_name"], curr_user["last_name"], curr_user["username"],
                         curr_user["email"], curr_user["gender"], curr_user["phone_no"],
                         curr_user["address"], curr_user["state"], curr_user["image"],
                         curr_user["registered"], curr_user["is_staff"], curr_user["is_admin"])
        
        all_carts = list(staff_carts_collection.find({"staff_id": a_user.email}))
        noOfCarts = len(all_carts)

        form = AddProductForm(request.POST or None, request.FILES or None)

        if form.is_valid():
            brand_name = form.cleaned_data["brand_name"]
            product_name = form.cleaned_data["product_name"]
            size = form.cleaned_data["size"]
            product_image = request.FILES.get("product_image")
            retail_price = form.cleaned_data["retail_price"]
            wholesale_price = form.cleaned_data["wholesale_price"]
            is_discount = form.cleaned_data["is_discount"]
            discount_retail_price = form.cleaned_data["discount_retail_price"]
            is_divisible = form.cleaned_data["is_divisible"]
            has_bulk = form.cleaned_data["has_bulk"]
            is_carton_bag = form.cleaned_data["is_carton_bag"]
            carton_price = form.cleaned_data["carton_price"]
            no_in_carton = form.cleaned_data["no_in_carton"]
            carton_image = request.FILES.get("carton_image", False)
            carton_stock = form.cleaned_data["carton_stock"]
            is_carton_divisible = form.cleaned_data["is_carton_divisible"]
            bag_price = form.cleaned_data["bag_price"]
            no_in_bag = form.cleaned_data["no_in_bag"]
            bag_image = request.FILES.get("bag_image", False)
            bag_stock = form.cleaned_data["bag_stock"]
            is_bag_divisible = form.cleaned_data["is_bag_divisible"]
            singles_stock = form.cleaned_data["singles_stock"]
            tags = form.cleaned_data["tags"]
            description = form.cleaned_data.get("description")
            
            # Check that product does not already exist
            product_id = slugify(brand_name + " " + product_name + " " + size)

            # Request all products that match the brand name and place in list
            product_check = products_collection.find_one({"slug": product_id})

            # Run for loop and call: 
            if product_check:
                messages.error(request, "Product already exists in database!")
    
                BULK_CHOICES = ("Dozen", "Pack", "Packet", "Roll")

                if a_user.is_admin:
                    context = {"form": form, "is_admin": True, "is_staff": True,
                               "bulk": BULK_CHOICES, "noOfCarts": noOfCarts}
                    return render(request, "main_app/add_product.html", context)
                elif a_user.is_staff:
                    context = {"form": form, "is_staff": True, "bulk": BULK_CHOICES, "noOfCarts": noOfCarts}
                    return render(request, "main_app/add_product.html", context)

            i = 1
            bulk_type = "bulk_type_" + str(i)
            bulk_price = "bulk_price_" + str(i)
            no_in_bulk = "no_in_bulk_" + str(i)
            bulk_image = "bulk_image_" + str(i)

            bulk_types = {}
            bulk_prices = {}
            nos_in_bulk = {}
            bulk_images = {}

            if has_bulk == "True":
                # Bulk type
                while request.POST.get(bulk_type):
                    if request.POST.get(bulk_type) in bulk_types.values():
                        messages.warning(request, "You can't have duplicate bulk types!")
            
                        BULK_CHOICES = ("Dozen", "Pack", "Packet", "Roll")

                        if a_user.is_admin:
                            context = {"form": form, "is_admin": True, "is_staff": True,
                                       "bulk": BULK_CHOICES, "noOfCarts": noOfCarts}
                            return render(request, "main_app/add_product.html", context)
                        elif a_user.is_staff:
                            context = {"form": form, "is_staff": True, "bulk": BULK_CHOICES, "noOfCarts": noOfCarts}
                            return render(request, "main_app/add_product.html", context)
                    else:
                        bulk_types[bulk_type] = request.POST.get(bulk_type)
                    
                    i += 1
                    bulk_type = "bulk_type_" + str(i)

                    # Check if corresponding bulk_image exists, else use default image
                    if request.FILES.get(bulk_image):
                        # Image was uploaded
                        image = request.FILES[bulk_image]

                        # process image: change name and compress it
                        img_num = int(bulk_image.split("_")[2])
                        image_id = slugify(brand_name + " " + product_name + " " + size + " " + bulk_image + " " + str(img_num))
                        image.name = change_image_name(image, image_id)
                        compressed_image = compress_image(image)
                    
                        # upload compressed image and obtain its url and path
                        image_url, image_path = handle_product_image(compressed_image)

                        # Add obtained image's uri to bulk_image's dictionary
                        bulk_images[bulk_image] = [image_url, image_path]
                    else:
                        # No corresponding image, so use default
                        image_url, image_path = default_bulk_image()
                        bulk_images[bulk_image] = [image_url, image_path]

                    # Increment image's name in order
                    bulk_image = "bulk_image_" + str(i)

                    # Bulk_price
                    if request.POST.get(bulk_price) in bulk_prices.values():
                        messages.warning(request, "You can't have duplicate bulk prices!")
            
                        BULK_CHOICES = ("Dozen", "Pack", "Packet", "Roll")

                        if a_user.is_admin:
                            context = {"form": form, "is_admin": True, "is_staff": True,
                                       "bulk": BULK_CHOICES, "noOfCarts": noOfCarts}
                            return render(request, "main_app/add_product.html", context)
                        elif a_user.is_staff:
                            context = {"form": form, "is_staff": True,
                                       "bulk": BULK_CHOICES, "noOfCarts": noOfCarts}
                            return render(request, "main_app/add_product.html", context)
                    else:
                        bulk_prices[bulk_price] = Decimal(request.POST.get(bulk_price)) + Decimal("0.00")

                    bulk_price = "bulk_price_" + str(i)

                    # No in bulk
                    nos_in_bulk[no_in_bulk] = int(request.POST.get(no_in_bulk))
                    no_in_bulk = "no_in_bulk_" + str(i)
    
            # Process product image as well
            # modify this to make queries faster

            product_image.name = change_image_name(product_image, product_id)

            product_img_url, product_img_path = handle_product_image(compress_image(product_image))

            # Determine if carton or bag and process accordingly
            is_carton_bag_divisible = False

            if is_carton_bag == "carton":
                carton_bag_price = carton_price
                no_in_carton_bag = no_in_carton
                carton_bag_stock = carton_stock
                if is_carton_divisible == "True":
                    is_carton_bag_divisible = True
            elif is_carton_bag == "bag":
                carton_bag_price = bag_price
                no_in_carton_bag = no_in_bag
                carton_bag_stock = bag_stock
                if is_bag_divisible == "True":
                    is_carton_bag_divisible = True
            else:
                carton_bag_price = 0
                no_in_carton_bag = 0
                carton_bag_stock = 0

            # Determine if image was uploaded for carton/bag and process accordingly
            if carton_image:
                # process image as before
                carton_image_id = slugify(brand_name + " " + product_name + " " + size + " " + "carton" + " " + "image")
                carton_image.name = change_image_name(carton_image, carton_image_id)
                carton_img_url, carton_img_path = handle_product_image(compress_image(carton_image))
                carton_bag_image = [carton_img_url, carton_img_path]
            elif bag_image:
                # process image as before
                bag_image_id = slugify(brand_name + " " + product_name + " " + size + " " + "bag" + " " + "image")
                bag_image.name = change_image_name(bag_image, bag_image_id)
                bag_img_url, bag_img_path = handle_product_image(compress_image(bag_image))
                carton_bag_image = [bag_img_url, bag_img_path]
            else:
                if is_carton_bag != "none":
                    img_url, img_path = default_carton_image()
                    carton_bag_image = [img_url, img_path]
                else:
                    carton_bag_image = None

            # Use bool value for is_discount and has_bulk
            if is_discount == "True":
                discount_fact = True
            else:
                discount_fact = False

            if has_bulk == "True":
                bulk_fact = True
            else:
                bulk_fact = False

            if is_divisible == "True":
                divisible_fact = True
            else:
                divisible_fact = False

            new_tags = str(tags).split(", ")
            
            # Create Product object and add to mongodb
            new_product = Product(brand_name, product_name, size, [product_img_url, product_img_path], new_tags,
                                  retail_price, wholesale_price, discount_fact, discount_retail_price if discount_fact else 0,
                                  bulk_fact, bulk_prices, bulk_types, nos_in_bulk, bulk_images, is_carton_bag,
                                  carton_bag_price, no_in_carton_bag, carton_bag_image, datetime.now(), singles_stock,
                                  carton_bag_stock, description, product_id, divisible_fact, is_carton_bag_divisible
                                  )

            products_collection.insert_one(new_product.to_dict())
            
            messages.success(request, "Product added succesfully.")
            return redirect("home")
        else:
            BULK_CHOICES = ("Dozen", "Pack", "Packet", "Roll")

            if a_user.is_admin:
                context = {"form": form, "is_admin": True, "is_staff": True,
                           "bulk": BULK_CHOICES, "noOfCarts": noOfCarts}
                return render(request, "main_app/add_product.html", context)
            elif a_user.is_staff:
                context = {"form": form, "is_staff": True, "bulk": BULK_CHOICES, "noOfCarts": noOfCarts}
                return render(request, "main_app/add_product.html", context)
        
        BULK_CHOICES = ("Dozen", "Pack", "Packet", "Roll")

        if a_user.is_admin:
            context = {"form": form, "is_admin": True, "is_staff": True,
                       "bulk": BULK_CHOICES, "noOfCarts": noOfCarts}
            return render(request, "main_app/add_product.html", context)
        elif a_user.is_staff:
            context = {"form": form, "is_staff": True, "bulk": BULK_CHOICES, "noOfCarts": noOfCarts}
            return render(request, "main_app/add_product.html", context)
        else:
            messages.error(request, "You're not permitted to view this page. Contact a staff or admin")
            return render(request, "main_app/400.html", {})
    else:
        messages.error(request, "An internal error occurred. Please try again later.")
        return render(request, "main_app/404.html", {})
    
# Work needed here
@login_required
def change_carousel(request):
    # check if user is staff or admin
    curr_user = user_collection.find_one({"email": request.user.email})

    if curr_user:
        a_user = TheUser(curr_user["first_name"], curr_user["last_name"], curr_user["username"],
                         curr_user["email"], curr_user["gender"], curr_user["phone_no"],
                         curr_user["address"], curr_user["state"], curr_user["image"],
                         curr_user["registered"], curr_user["is_staff"], curr_user["is_admin"])

        all_carts = list(staff_carts_collection.find({"staff_id": a_user.email}))
        noOfCarts = len(all_carts)

        form = CarouselForm(request.POST or None, request.FILES or None)

        if form.is_valid():
            pass
        else:
            if a_user.is_admin:
                context = {"form": form, "is_admin": True, "is_staff": True, "noOfCarts": noOfCarts}
                return render(request, "main_app/change_carousel.html", context)
            elif a_user.is_staff:
                context = {"form": form, "is_staff": True, "noOfCarts": noOfCarts}
                return render(request, "main_app/change_carousel.html", context)
        
        if a_user.is_admin:
            context = {"form": form, "is_admin": True, "is_staff": True, "noOfCarts": noOfCarts}
            return render(request, "main_app/change_carousel.html", context)
        elif a_user.is_staff:
            context = {"form": form, "is_staff": True, "noOfCarts": noOfCarts}
            return render(request, "main_app/change_carousel.html", context)
        else:
            messages.error(request, "You're not permitted to view this page. Contact a staff or admin")
            return render(request, "main_app/400.html", {})
    else:
        messages.error(request, "An internal error occurred. Please try again later.")
        return render(request, "main_app/404.html", {})

@login_required
def confirm_code(request):
    # check that user exists
    if user_collection.find_one({"email": request.user.email, "registered": True}):
        messages.warning(request, "Account is already confirmed.")
        return redirect("home")
    
    form = ConfirmCodeForm(request.POST or None)
    if form.is_valid():
        code = form.cleaned_data["code"]
        new_user = new_accounts_collection.find_one({"email": request.user.email})
        if new_user and code == new_user["passcode"]:
            user_collection.update_one({"email": request.user.email}, 
                                        {"$set": {"registered": True}})
            return redirect("home")
        else:
            messages.error(request, "Confirmation code is incorrect!")
            return render(request, "main_app/confirm_code.html", {"form": form})
    return render(request, "main_app/confirm_code.html", {"form": form})
    
@login_required
def resend_code(request):
    # check that user is logged in
    if user_collection.find_one({"email": request.user.email, "registered": True}):
        messages.info(request, "Account is already confirmed.")
        return redirect("home")
    
    new_accounts_collection.delete_one({"email": request.user.email})
    send_email_code(request.user.email)
    messages.info(request, "Confirmation Code has been sent")
    return redirect("confirm_code")

def privacy_policy(request):
    # Check if user is admin or staff
    if request.user.is_authenticated:
        curr_user = user_collection.find_one({"email": request.user.email})

        if curr_user:
            a_user = TheUser(curr_user["first_name"], curr_user["last_name"], curr_user["username"],
                         curr_user["email"], curr_user["gender"], curr_user["phone_no"],
                         curr_user["address"], curr_user["state"], curr_user["image"],
                         curr_user["registered"], curr_user["is_staff"], curr_user["is_admin"])
            
            all_carts = list(staff_carts_collection.find({"staff_id": a_user.email}))
            noOfCarts = len(all_carts)

            if a_user.is_admin:
                return render(request, "main_app/privacy.html", {"is_admin": True,
                                                                "is_staff": True, "noOfCarts": noOfCarts})
            elif a_user.is_staff:
                return render(request, "main_app/privacy.html", {"is_staff": True, "noOfCarts": noOfCarts})
    else:
        return render(request, "main_app/privacy.html", {})

def find_product(request, slug):
    # Find product from mongodb
    the_product = products_collection.find_one({"slug": slug}, {"_id": 0})
    if the_product:
        return JsonResponse(the_product)

@login_required
def open_staff_carts(request):
    # Get all carts from mongodb belonging to particular user
    all_carts = list(staff_carts_collection.find({"staff_id": request.user.email}))
    cart_names = []
    for i in all_carts:
        cart_names.append(i["name_of_buyer"])
    
    return JsonResponse({"carts": cart_names})

@login_required
def find_staff_cart(request):
    # Gotta be POST
    if request.method == "POST":
        post_data = json.loads(request.body.decode("utf-8"))

        cartName = post_data.get("cartName")
        prodName = post_data.get("prodName")
        saleType = post_data.get("saleType").strip()
        prodPrice = post_data.get("prodPrice")
        prodImage = post_data.get("prodImage")
        prodQuantity = post_data.get("prodQuantity")
        totalProdQuantity = post_data.get("totalProdQuantity")
        prodSlug = post_data.get("prodSlug")
        subTotal = Decimal(prodPrice) * Decimal(prodQuantity) + Decimal("0.00")
        finSub = subTotal.quantize(Decimal("1.00"))
        # Check for cart name from mongodb
        the_cart = staff_carts_collection.find_one({"name_of_buyer": cartName})

        if the_cart:
            # Such a cart already exists
            total_amount = Decimal(the_cart["total_amount"])
            # Ensure item isn't in cart list already
            for product in the_cart["items"]:
                if prodSlug in product.values():
                    # product is among items in cart
                    # Check which slug has the info we need
                    for item in the_cart["items"]:
                        if item.get("product_slug") == prodSlug:
                            # Found the slug
                            # Get the appended item num and current price
                            zehPrice = Decimal(item["product_price"])
                            zehQuantity = Decimal(item["product_quantity"])
                            priceDiff = finSub - zehPrice * zehQuantity
                            # Update each related info of dictionary, mongo tho
                            # item["sale_type_" + str(zehNum)] = saleType
                            # item["product_price_" + str(zehNum)] = int(prodPrice)
                            # item["product_quantity_" + str(zehNum)] = float(prodQuantity)
                            updateResult = staff_carts_collection.update_one({"name_of_buyer": cartName}, 
                                                                {"$set": {"items.$[elem].sale_type": saleType,
                                                                          "items.$[elem].product_price": str(prodPrice),
                                                                          "items.$[elem].product_quantity": str(prodQuantity),
                                                                          "items.$[elem].total_product_quantity": str(totalProdQuantity),
                                                                          "items.$[elem].sub_total": str(finSub),
                                                                          "amount_owed": str(total_amount + priceDiff),
                                                                          "total_amount": str(total_amount + priceDiff)},
                                                                },
                                                                array_filters=[{"elem.product_slug": prodSlug}])
                            
                            if updateResult.modified_count == 1:
                                return JsonResponse(data={"result": 1})
                            else:
                                print("Error here")
                                return JsonResponse(data={"result": False})

            # Create dictionary for new item
            new_item = SON([("product_name", prodName),
                            ("sale_type", saleType),
                            ("product_price", str(prodPrice)),
                            ("product_image", prodImage),
                            ("product_quantity", str(prodQuantity)),
                            ("total_product_quantity", str(totalProdQuantity)),
                            ("sub_total", str(finSub)),
                            ("product_slug", prodSlug)])

            # new_item = {"product_name_" + str(curr_num + 1): prodName,
            #             "sale_type_" + str(curr_num + 1): saleType,
            #             "product_price_" + str(curr_num + 1): prodPrice,
            #             "product_image_" + str(curr_num + 1): prodImage,
            #             "product_quantity_" + str(curr_num + 1): prodQuantity,
            #             "product_slug_" + str(curr_num + 1): prodSlug}

            # Add dictionary to list of items: {"product_name": prodName, "sale_type": saleType}
            staff_carts_collection.update_one({"name_of_buyer": cartName},
                                            {"$push": {"items": new_item},
                                            "$set": {"amount_owed": str(total_amount + finSub),
                                                     "total_amount": str(total_amount + finSub)}})
            
            return JsonResponse(data={"result": True})
        else:
            # It's a new cart
            # Create dictionary for new item
            new_item = SON([("product_name", prodName),
                            ("sale_type", saleType),
                            ("product_price", str(prodPrice)),
                            ("product_image", prodImage),
                            ("product_quantity", str(prodQuantity)),
                            ("total_product_quantity", str(totalProdQuantity)),
                            ("sub_total", str(finSub)),
                            ("product_slug", prodSlug)])
            
            whole_cart = StaffCart(cartName, request.user.email, [new_item], finSub, 0)

            staff_carts_collection.insert_one(whole_cart.to_dict())

            return JsonResponse(data={"result": True})
    else:
        print("Error here instead")
        return JsonResponse(data={"result": False})
    
# Create view to check if given product is in cart already
@login_required
def check_product_in_cart(request, slug):
    # Check through all carts belonging to user in mongo, if product is already in
    all_carts = list(staff_carts_collection.find({"staff_id": request.user.email}))
    for cart in all_carts:
        for item in cart["items"]:
            if slug in item.values():
                # Given product is already in cart
                return JsonResponse(data={"result": True})

    return JsonResponse(data={"result": False})

@login_required
def staff_carts(request):
    # Check if user is admin or staff
    curr_user = user_collection.find_one({"email": request.user.email})

    if curr_user:
        a_user = TheUser(curr_user["first_name"], curr_user["last_name"], curr_user["username"],
                         curr_user["email"], curr_user["gender"], curr_user["phone_no"],
                         curr_user["address"], curr_user["state"], curr_user["image"],
                         curr_user["registered"], curr_user["is_staff"], curr_user["is_admin"])
        
        all_carts = list(staff_carts_collection.find({"staff_id": a_user.email}))
        noOfCarts = len(all_carts)
        
        if a_user.is_admin:
            context = {"is_admin": True, "is_staff": True, "carts": all_carts, "noOfCarts": noOfCarts}
            return render(request, "main_app/staff_carts.html", context)
        elif a_user.is_staff:
            context = {"is_staff": True, "carts": all_carts}
            return render(request, "main_app/staff_carts.html", context)
        else:
            messages.error(request, "You're not permitted to view this page. Contact a staff or admin")
            return render(request, "main_app/400.html", {})
    else:
        messages.error(request, "An internal error occurred. Please try again later.")
        return render(request, "main_app/404.html", {})

@login_required
def edit_product(request, slug):
    # Check if user is admin or staff
    curr_user = user_collection.find_one({"email": request.user.email})

    if curr_user:
        a_user = TheUser(curr_user["first_name"], curr_user["last_name"], curr_user["username"],
                         curr_user["email"], curr_user["gender"], curr_user["phone_no"],
                         curr_user["address"], curr_user["state"], curr_user["image"],
                         curr_user["registered"], curr_user["is_staff"], curr_user["is_admin"])
        
        curr_product = products_collection.find_one({"slug": slug})
        
        form = EditProductForm(request.POST or None, request.FILES or None)

        BULK_CHOICES = ("Dozen", "Pack", "Packet", "Roll")

        if a_user.is_admin:
            context = {"form": form, "is_admin": True, "is_staff": True, "bulk": BULK_CHOICES}
            return render(request, "main_app/edit_product.html", context)
        elif a_user.is_staff:
            context = {"form": form, "is_staff": True, "bulk": BULK_CHOICES}
            return render(request, "main_app/edit_product.html", context)
        else:
            messages.error(request, "You're not permitted to view this page. Contact a staff or admin")
            return render(request, "main_app/400.html", {})
    else:
        messages.error(request, "An internal error occurred. Please try again later.")
        return render(request, "main_app/404.html", {})

@login_required
def debtors(request):
    # Get all debtors/buyers from DB
    all_debtors = list(debtors_collection.find().sort("date_modified", pymongo.DESCENDING))
    full_list = []
    for debtor in all_debtors:
        item = Buyer(debtor["first_name"], debtor["last_name"], debtor["username"], debtor["email"],
                    debtor["gender"], debtor["phone_no"], debtor["address"], debtor["state"],
                    debtor["date_modified"], debtor["amount_owed"], debtor["description"],
                    debtor["image"])
        full_list.append(item)

    # Also get all carts for user
    all_carts = list(staff_carts_collection.find({"staff_id": request.user.email}))
    noOfCarts = len(all_carts)

    # check that user is registered
    # then check if user is staff or admin
    curr_user = user_collection.find_one({"email": request.user.email})

    if curr_user:
        a_user = TheUser(curr_user["first_name"], curr_user["last_name"], curr_user["username"],
                         curr_user["email"], curr_user["gender"], curr_user["phone_no"],
                         curr_user["address"], curr_user["state"], curr_user["image"],
                         curr_user["registered"], curr_user["is_staff"], curr_user["is_admin"])
        
        form = AddDebtorForm(request.POST or None)

        if form.is_valid():
            first_name = form.cleaned_data["first_name"]
            last_name = form.cleaned_data["last_name"]
            email = form.cleaned_data["email"]
            gender = form.cleaned_data["gender"]
            dialing_code = form.cleaned_data["dialing_code"]
            phone_number = standardize_phone(form.cleaned_data["phone_number"])
            address = form.cleaned_data["address"]
            state = form.cleaned_data["state"]
            amount_owed = form.cleaned_data["amount_owed"]
            description = form.cleaned_data["description"]

            complete_phone = [{"dialing_code": dialing_code, "number": phone_number}]

            if default_user_image:
                image_url, image_path = default_user_image()
            else:
                messages.error(request, "An internal Server error occurred. Please try again later.")
                return redirect("debtors")
            
            username = slugify(first_name + last_name)

            new_debtor = Buyer(first_name, last_name, username, email, gender, complete_phone, address,
                               state, datetime.now(), str(amount_owed), description, [image_url, image_path])
            
            debtors_collection.insert_one(new_debtor.to_dict())

            messages.success(request, "Debtor has been added successfully.")
            return redirect("debtors")
        
        if a_user.is_admin:
            return render(request, "main_app/debtors.html", {"is_admin": True, "is_staff": True, "form": form, 
                                                          "debtors": full_list, "noOfCarts": noOfCarts})
        elif a_user.is_staff:
            return render(request, "main_app/debtors.html", {"is_staff": True, "debtors": full_list,
                                                             "form": form, "carts": noOfCarts})
        else:
            messages.error(request, "You're not permitted to view this page. Contact a staff or admin")
            return render(request, "main_app/400.html", {})
    else:
        messages.error(request, "An internal error occurred. Please try again later.")
        return render(request, "main_app/404.html", {})

@login_required
def add_debtor(request):
    # then check if user is staff or admin
    curr_user = user_collection.find_one({"email": request.user.email})

    if curr_user:
        a_user = TheUser(curr_user["first_name"], curr_user["last_name"], curr_user["username"],
                         curr_user["email"], curr_user["gender"], curr_user["phone_no"],
                         curr_user["address"], curr_user["state"], curr_user["image"],
                         curr_user["registered"], curr_user["is_staff"], curr_user["is_admin"])
        
        if a_user.is_admin or a_user.is_staff:
            if request.method == "POST":
                post_data = json.loads(request.body.decode("utf-8"))

                first_name = post_data.get("debtor_first_name")
                last_name = post_data.get("debtor_last_name")
                email = post_data.get("debtor_email")
                gender = post_data.get("debtor_gender")
                dialing_code = post_data.get("debtor_dialing_code")
                phone_number = standardize_phone(post_data.get("debtor_phone_no"))
                address = post_data.get("debtor_address")
                state = post_data.get("debtor_state")
                # Don't forget to convert to string before storing
                amount_owed = post_data.get("debt_amount")
                description = post_data.get("debtor_description")
                name_in_cart = post_data.get("name_in_cart")
                amount_paid = post_data.get("amount_paid")

                complete_phone = [{"dialing_code": dialing_code, "number": phone_number}]

                if default_user_image:
                    image_url, image_path = default_user_image()
                else:
                    messages.error(request, "An internal Server error occurred. Please try again later.")
                    return JsonResponse(data={"result": "Image Error"})
            
                username = slugify(first_name + last_name)

                new_debtor = Buyer(first_name, last_name, username, email, gender, complete_phone, address,
                                   state, datetime.now(), amount_owed, description, [image_url, image_path])

                # Create reference number for information storage
                reference_no = strip_id(str(datetime.now()) + code_generator())
                curr_customer = staff_carts_collection.find_one({"name_of_buyer": name_in_cart,
                                                                 "staff_id": a_user.email})
                # Or Cash Payment
                # Date - Buyer ID - Transaction Type - Transaction Reference - Transaction Amount - Amount Paid - Balance
                # Today - 0909233 - Goods Purchase - all that reference - 5000 - 4500 - 500 (or inc current debt)
                # Today - 0909233 - Cash Payment - all that reference - 500 - 500 - 0 (or dec current debt)
                new_transaction = Transaction("Goods Purchase", "Staff", new_debtor.first_name + " " + new_debtor.last_name, a_user.email,
                                              curr_customer["items"], datetime.now(), curr_customer["total_amount"],
                                              amount_paid, reference_no, phone_number)

                product_slugs = []
                product_quantities = []
                for item in curr_customer["items"]:
                    product_slugs.append(item["product_slug"])
                    product_quantities.append(item["total_product_quantity"])
                
                # Proceed to call the call_back function. Adjust variables to include buyer info
                with client.start_session() as session:
                    session.with_transaction(lambda s: payment_callback(s, name_in_cart,
                                                                        new_transaction.to_dict(),
                                                                        product_slugs,
                                                                        product_quantities,
                                                                        new_debtor.to_dict()))

                # Check if products have negative stock quantities and address
                for slug in product_slugs:
                    product = products_collection.find_one({"slug": slug})
                    if product and int(product["singles_stock"]) <= 0:
                        products_collection.update_one({"slug": slug},
                                                        {"$inc": {"carton_bag_stock": -1,
                                                                    "singles_stock": int(product["no_in_carton_bag"])}})
                        
                new_txn = transactions_collection.find_one({"reference_no": reference_no})

                return JsonResponse(data={"result": "New Debtor", "txn_id": str(new_txn["_id"]), "ref_no": reference_no,
                                          "debt": str(amount_owed)})
            
@login_required
def update_debtor(request):
    # then check if user is staff or admin
    curr_user = user_collection.find_one({"email": request.user.email})

    if curr_user:
        a_user = TheUser(curr_user["first_name"], curr_user["last_name"], curr_user["username"],
                         curr_user["email"], curr_user["gender"], curr_user["phone_no"],
                         curr_user["address"], curr_user["state"], curr_user["image"],
                         curr_user["registered"], curr_user["is_staff"], curr_user["is_admin"])
        
        if a_user.is_admin or a_user.is_staff:
            if request.method == "POST":
                post_data = json.loads(request.body.decode("utf-8"))

                cust_phone_no = post_data.get("d_phone_no")
                cust_new_debt = post_data.get("d_new_debt")
                cust_total_debt = post_data.get("d_total_debt")
                customer_name = post_data.get("customer_name")
                amount_brought = post_data.get("amount_brought")

                curr_customer = staff_carts_collection.find_one({"name_of_buyer": customer_name,
                                                                 "staff_id": a_user.email})
                
                curr_debtor = debtors_collection.find_one({"phone_no.number": cust_phone_no})

                # Create debtor/Buyer class from gotten info, use class to calculate debt
                old_debtor = Buyer(curr_debtor["first_name"], curr_debtor["last_name"], curr_debtor["username"],
                                   curr_debtor["email"], curr_debtor["gender"], curr_debtor["phone_no"],
                                   curr_debtor["address"], curr_debtor["state"], datetime.now(),
                                   str(cust_total_debt), curr_debtor["description"], curr_debtor["image"])
                
                # Create reference number for information storage
                reference_no = strip_id(str(datetime.now()) + code_generator())

                new_transaction = Transaction("Goods Purchase", "Staff", old_debtor.first_name + " " + old_debtor.last_name, a_user.email,
                                              curr_customer["items"], datetime.now(), curr_customer["total_amount"],
                                              amount_brought, reference_no, cust_phone_no)

                product_slugs = []
                product_quantities = []
                for item in curr_customer["items"]:
                    product_slugs.append(item["product_slug"])
                    product_quantities.append(item["total_product_quantity"])
                
                # Proceed to call the call_back function. Adjust variables to include buyer info
                with client.start_session() as session:
                    session.with_transaction(lambda s: payment_callback(s, customer_name,
                                                                        new_transaction.to_dict(),
                                                                        product_slugs,
                                                                        product_quantities,
                                                                        old_debtor.to_dict()))

                # Check if products have negative stock quantities and address
                for slug in product_slugs:
                    product = products_collection.find_one({"slug": slug})
                    if product and int(product["singles_stock"]) <= 0:
                        products_collection.update_one({"slug": slug},
                                                        {"$inc": {"carton_bag_stock": -1,
                                                                    "singles_stock": int(product["no_in_carton_bag"])}})
                        
                new_txn = transactions_collection.find_one({"reference_no": reference_no})

                return JsonResponse(data={"result": "Old Debtor", "txn_id": str(new_txn["_id"]), "ref_no": reference_no,
                                          "debt": str(cust_new_debt), "total_debt": str(cust_total_debt)})

@login_required
def get_debtors(request):
    # then check if user is staff or admin
    curr_user = user_collection.find_one({"email": request.user.email})

    if curr_user:
        a_user = TheUser(curr_user["first_name"], curr_user["last_name"], curr_user["username"],
                         curr_user["email"], curr_user["gender"], curr_user["phone_no"],
                         curr_user["address"], curr_user["state"], curr_user["image"],
                         curr_user["registered"], curr_user["is_staff"], curr_user["is_admin"])
        
        if a_user.is_admin or a_user.is_staff:
            all_debtors = list(debtors_collection.find({}, {"_id": 0}))
            return JsonResponse(data={"result": True, "debtors": all_debtors})
        else:
            return JsonResponse(data={"result": False})
    else:
        return JsonResponse(data={"result": False})
        
def get_the_debtor(request, slug):
    # then check if user is staff or admin
    curr_user = user_collection.find_one({"email": request.user.email})

    if curr_user:
        a_user = TheUser(curr_user["first_name"], curr_user["last_name"], curr_user["username"],
                         curr_user["email"], curr_user["gender"], curr_user["phone_no"],
                         curr_user["address"], curr_user["state"], curr_user["image"],
                         curr_user["registered"], curr_user["is_staff"], curr_user["is_admin"])
        
        if a_user.is_admin or a_user.is_staff:
            the_debtor = debtors_collection.find_one({"slug": slug}, {"_id": 0})
            return JsonResponse(data={"result": True, "debtor": the_debtor})
        else:
            return JsonResponse(data={"result": False})
    else:
        return JsonResponse(data={"result": False})

@login_required
def make_payment(request):
    # then check if user is staff or admin
    curr_user = user_collection.find_one({"email": request.user.email})

    if curr_user:
        a_user = TheUser(curr_user["first_name"], curr_user["last_name"], curr_user["username"],
                         curr_user["email"], curr_user["gender"], curr_user["phone_no"],
                         curr_user["address"], curr_user["state"], curr_user["image"],
                         curr_user["registered"], curr_user["is_staff"], curr_user["is_admin"])
        
        if a_user.is_admin or a_user.is_staff:
            if request.method == "POST":
                post_data = json.loads(request.body.decode("utf-8"))

                customer_name = post_data.get("customerName")
                amount_paid = post_data.get("amountPaid")
                reference_no = strip_id(str(datetime.now()) + code_generator())
                curr_customer = staff_carts_collection.find_one({"name_of_buyer": customer_name,
                                                                 "staff_id": a_user.email})

                new_transaction = Transaction("Goods Purchase", "Staff", customer_name, a_user.email, curr_customer["items"],
                                                  datetime.now(), curr_customer["total_amount"], amount_paid,
                                                  reference_no)

                if curr_customer and Decimal(str(amount_paid)) == Decimal(curr_customer["total_amount"]):
                    # Customer neither owes nor is owed
                    product_slugs = []
                    product_quantities = []
                    for item in curr_customer["items"]:
                        product_slugs.append(item["product_slug"])
                        product_quantities.append(item["total_product_quantity"])
                    
                    # Proceed to call the call_back function
                    with client.start_session() as session:
                        session.with_transaction(lambda s: payment_callback(s, customer_name,
                                                                            new_transaction.to_dict(),
                                                                            product_slugs,
                                                                            product_quantities))

                    # Check if products have negative stock quantities and address
                    for slug in product_slugs:
                        product = products_collection.find_one({"slug": slug})
                        if product and int(product["singles_stock"]) <= 0:
                            products_collection.update_one({"slug": slug},
                                                           {"$inc": {"carton_bag_stock": -1,
                                                                     "singles_stock": int(product["no_in_carton_bag"])}})
                            
                    new_txn = transactions_collection.find_one({"reference_no": reference_no})
                            
                    return JsonResponse(data={"result": "Exact", "txn_id": str(new_txn["_id"]), "ref_no": reference_no})
                
                elif curr_customer and Decimal(str(amount_paid)) > Decimal(curr_customer["total_amount"]):
                    # Customer is owed change
                    product_slugs = []
                    product_quantities = []
                    for item in curr_customer["items"]:
                        product_slugs.append(item["product_slug"])
                        product_quantities.append(item["total_product_quantity"])
                    
                    # Proceed to call the call_back function
                    with client.start_session() as session:
                        session.with_transaction(lambda s: payment_callback(s, customer_name,
                                                                            new_transaction.to_dict(),
                                                                            product_slugs,
                                                                            product_quantities))

                    # Check if products have negative stock quantities and address
                    for slug in product_slugs:
                        product = products_collection.find_one({"slug": slug})
                        if product and int(product["singles_stock"]) <= 0:
                            products_collection.update_one({"slug": slug},
                                                           {"$inc": {"carton_bag_stock": -1,
                                                                     "singles_stock": int(product["no_in_carton_bag"])}})
                            
                    new_txn = transactions_collection.find_one({"reference_no": reference_no})
                    la_change = Decimal(str(amount_paid)) - Decimal(curr_customer["total_amount"])

                    return JsonResponse(data={"result": "Change", "txn_id": str(new_txn["_id"]),
                                              "ref_no": reference_no, "change": str(la_change)})
                else:
                    # Customer doesn't exist
                    return JsonResponse(data={"result": "Error"})
                    
@login_required
def get_transactions(request):
    # Get all transactions from DB
    today = datetime.today()
    oneday = timedelta(days=1)
    yesterday = today - oneday

    all_transactions = list(transactions_collection.find({"checkout_date": {"$gt": yesterday}}).sort("checkout_date", pymongo.DESCENDING))
    full_list = []
    for txn in all_transactions:
        item = Transaction(txn["txn_type"], txn["txn_by"], txn["name_of_buyer"], txn["staff_id"],
                           txn["items"], txn["checkout_date"], txn["total_amount"], txn["amount_paid"],
                           txn["reference_no"], txn["buyer_id"])
        full_list.append(item)

    # Also get all carts for user
    all_carts = list(staff_carts_collection.find({"staff_id": request.user.email}))
    noOfCarts = len(all_carts)

    # then check if user is staff or admin
    curr_user = user_collection.find_one({"email": request.user.email})

    if curr_user:
        a_user = TheUser(curr_user["first_name"], curr_user["last_name"], curr_user["username"],
                         curr_user["email"], curr_user["gender"], curr_user["phone_no"],
                         curr_user["address"], curr_user["state"], curr_user["image"],
                         curr_user["registered"], curr_user["is_staff"], curr_user["is_admin"])
        
        if a_user.is_admin:
            return render(request, "main_app/transactions.html", {"is_admin": True, "is_staff": True,
                                                          "transactions": full_list, "noOfCarts": noOfCarts})
        elif a_user.is_staff:
            return render(request, "main_app/transactions.html", {"is_staff": True, "transactions": full_list,
                                                            "carts": noOfCarts})
        else:
            messages.error(request, "You're not permitted to view this page. Contact a staff or admin")
            return render(request, "main_app/400.html", {})
    else:
        messages.error(request, "An internal error occurred. Please try again later.")
        return render(request, "main_app/404.html", {})

def delete_item(request):
    # then check if user is staff or admin
    curr_user = user_collection.find_one({"email": request.user.email})

    if curr_user:
        a_user = TheUser(curr_user["first_name"], curr_user["last_name"], curr_user["username"],
                         curr_user["email"], curr_user["gender"], curr_user["phone_no"],
                         curr_user["address"], curr_user["state"], curr_user["image"],
                         curr_user["registered"], curr_user["is_staff"], curr_user["is_admin"])
        
        if a_user.is_staff or a_user.is_admin:
            if request.method == "POST":
                post_data = json.loads(request.body.decode("utf-8"))
                d_slug = post_data.get("item_slug")
                d_customer = post_data.get("item_customer")
                
                # Find and delete document if it only has one item in cart. Else, just remove the item
                delete_op = staff_carts_collection.find_one_and_delete({"name_of_buyer": d_customer,
                                                                        "staff_id": a_user.email,
                                                                        "items": {"$size": 1}})
                
                if delete_op:
                    # Customer only had one item in cart. Deleted
                    return JsonResponse(data={"result": "Successful"})
                else:
                    # Customer has other items he/she intends to buy
                    # Get the particular product's subtotal
                    the_cart = staff_carts_collection.find_one({"name_of_buyer": d_customer, "staff_id": a_user.email})
                    product_sub = "0.00"
                    for item in the_cart["items"]:
                        if item["product_slug"] == d_slug:
                            product_sub = item["sub_total"]
                            break
                    
                    cart_total = the_cart["total_amount"]
                    new_total = Decimal(cart_total) - Decimal(product_sub)

                    # Update cart with new details
                    staff_carts_collection.update_one({"name_of_buyer": d_customer,
                                                        "staff_id": a_user.email},
                                                        {"$pull": {"items": {"product_slug": d_slug}},
                                                        "$set": {"total_amount": str(new_total),
                                                                "amount_owed": str(new_total)}})
                    
                    return JsonResponse(data={"result": "Successful"})
        else:
            messages.error(request, "You're not permitted to view this page. Contact a staff or admin")
            return render(request, "main_app/400.html", {})
    else:
        messages.error(request, "An internal error occurred. Please try again later.")
        return render(request, "main_app/404.html", {})