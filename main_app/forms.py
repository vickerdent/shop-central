from collections.abc import Mapping
from typing import Any
from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.forms import UserCreationForm, PasswordChangeForm, \
      PasswordResetForm, SetPasswordForm
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from django import forms
from django.contrib.auth.tokens import default_token_generator
from django.forms.widgets import TextInput
from django.template import loader
from django.contrib.sites.shortcuts import get_current_site
from .o_functions import send_email_resetpassword
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from tinymce import models as tinymce_models
from tinymce.widgets import TinyMCE

UserModel = get_user_model()

class TinyMCEWidget(TinyMCE):
    def use_required_attribute(self, *args):
        return False

class DataListInput(TextInput):
    """
    Subclass to create a datalist widget
    making use of the Input class
    """

    template_name = "main_app/datalist.html"


class SignUpForm(UserCreationForm):
    """Enables users to sign up to the web app."""
    
    MALE_FEMALE_CHOICES = [
        ("", "Select one"),
        ("Male", "Male"),
        ("Female", "Female"),
    ]

    COUNTRY_CODE = [
        ("+234", "+234 (Nigeria)"),
        ("+233", "+233 (Ghana)"),
        ("+1", "+1 (USA)"),
        ("+44", "+44 (UK)"),
    ]

    email = forms.CharField(label="E-mail Address", required=True, widget=forms.EmailInput(
        attrs={"name": "email", "class": "form-control", "placeholder":"sample@email.com",
               "autocomplete": "off"}), label_suffix="")
    first_name = forms.CharField(label="First Name", required=True, max_length=150, widget=forms.widgets.TextInput(
        attrs={"name": "first_name", "class": "form-control", "autofocus": "true", 
               "placeholder":"Your First Name", "autocomplete": "off"}), label_suffix="")
    last_name = forms.CharField(label="Last Name", required=True, max_length=150, widget=forms.widgets.TextInput(
        attrs={"name": "last_name", "class": "form-control", 
               "placeholder":"Your Last Name", "autocomplete": "off"}), label_suffix="")
    gender = forms.ChoiceField(required=True, choices=MALE_FEMALE_CHOICES, widget=forms.widgets.Select(
        attrs={"placeholder":"choose", "class":"form-select", "name": "gender"}), label="Gender")
    dialing_code = forms.ChoiceField(required=True, choices=COUNTRY_CODE, widget=forms.widgets.Select(
        attrs={"placeholder":"choose", "class":"form-select", "name": "dialing_code"}), label="Country Code")
    phone_number = forms.CharField(label="Phone Number", required=True, min_length=10, max_length=11, widget=forms.widgets.TextInput(
        attrs={"name": "phone_number", "class": "form-control", "placeholder":"08058482381", "autocomplete": "off"}),
        label_suffix="")
    address = forms.CharField(label="Address", required=True, max_length=1000, widget=forms.widgets.TextInput(
        attrs={"name": "address", "class": "form-control", "placeholder":"No. 23, Super Way", "autocomplete": "off"}),
        label_suffix="")
    state = forms.CharField(label="State", required=True, max_length=100, widget=forms.widgets.TextInput(
        attrs={"name": "state", "class": "form-control", "placeholder":"Port Harcourt", "autocomplete": "off"}),
        label_suffix="")
                             
    class Meta:
        model = User
        fields = ("first_name", "last_name", "username", "email", "gender", "dialing_code", "phone_number",
                   "address", "state", "password1", "password2")

    def __init__(self, *args: Any, **kwargs: Any):
        super(SignUpForm, self).__init__(*args, **kwargs)

        self.fields['username'].widget.attrs['class'] = 'form-control'
        self.fields['username'].widget.attrs['placeholder'] = 'username'
        self.fields['username'].widget.attrs['autocomplete'] = 'off'
        self.fields['username'].label = 'Username'
        self.fields['username'].label_suffix = ""
        self.fields['username'].help_text = '<span class="form-text text-muted"><small>150 characters or fewer. Letters, digits and @, ., +, - or _ only.</small></span>'

        self.fields['password1'].widget.attrs['class'] = 'form-control'
        self.fields['password1'].widget.attrs['placeholder'] = 'Password'
        self.fields['password1'].widget.attrs['autocomplete'] = 'off'
        self.fields['password1'].label = 'Password'
        self.fields['password1'].label_suffix = ""
        self.fields['password1'].help_text = '<span class="form-text text-muted"><small>Enter a unique password made up of at least 8 characters: Letters, digits and special characters.</small></span>'

        self.fields['password2'].widget.attrs['class'] = 'form-control'
        self.fields['password2'].widget.attrs['placeholder'] = 'Confirm Password'
        self.fields['password2'].widget.attrs['autocomplete'] = 'off'
        self.fields['password2'].label = 'Confirm Password'
        self.fields['password2'].label_suffix = ""
        self.fields['password2'].help_text = '<span class="form-text text-muted"><small>Enter the same password as before, for verification.</small></span>'	

class ConfirmCodeForm(forms.Form):
    """Form to confirm code sent to new users """
    code = forms.CharField(required=True, max_length=12, widget=forms.widgets.TextInput(
        attrs={"placeholder":"Confirmation", "class":"form-control"}), label="Enter Confirmation Code",
        label_suffix="")
    
class ChangePasswordForm(PasswordChangeForm):
    """
    Enables users to change their passwords in
    the web application.
    """
    class Meta:
        model = User
        fields = ("old_password", "new_password1", "new_password2")

    def __init__(self, user: AbstractBaseUser | None, *args: Any, **kwargs: Any) -> None:
        super(PasswordChangeForm, self).__init__(user, *args, **kwargs)

        self.fields['old_password'].widget.attrs['class'] = 'form-control'
        self.fields['old_password'].widget.attrs['placeholder'] = 'Old Password'
        self.fields['old_password'].label = 'Old Password'
        self.fields['old_password'].label_suffix = ""

        self.fields['new_password1'].widget.attrs['class'] = 'form-control'
        self.fields['new_password1'].widget.attrs['placeholder'] = 'New Password'
        self.fields['new_password1'].label = 'New Password'
        self.fields['new_password1'].label_suffix = ""
        self.fields['new_password1'].help_text = '<span class="form-text text-muted"><small>Enter a unique password made up of at least 8 characters: Letters, digits and special characters.</small></span>'

        self.fields['new_password2'].widget.attrs['class'] = 'form-control'
        self.fields['new_password2'].widget.attrs['placeholder'] = 'Confirm New Password'
        self.fields['new_password2'].label = 'Confirm New Password'
        self.fields['new_password2'].label_suffix = ""
        self.fields['new_password2'].help_text = '<span class="form-text text-muted"><small>Enter the same password as before, for verification.</small></span>'	

class ResetPasswordForm(PasswordResetForm):
    """
    Enables users to reset their passwords in
    the web application.
    """

    class Meta:
        model = User
        fields = ("email")
    
    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super(PasswordResetForm, self).__init__(*args, **kwargs)
        
        self.fields['email'].widget.attrs['class'] = 'form-control'
        self.fields['email'].widget.attrs['placeholder'] = 'Your email address'
        self.fields['email'].label = 'Email Address'
        self.fields['email'].label_suffix = ""

    def send_email_message(self, subject_template_name, email_template_name,
                           context, to_email):
        """
        Send the email message
        """
        subject = loader.render_to_string(subject_template_name, context)
        # Email subject *must not* contain newlines
        subject = "".join(subject.splitlines())
        body = loader.render_to_string(email_template_name, context)

        send_email_resetpassword(subject, body, to_email)

    def save_func(self, domain_override=None,
        subject_template_name="",
        email_template_name="",
        use_https=False,
        token_generator=default_token_generator,
        request=None,
        extra_email_context=None,
    ):
        """
        Generate a one-use only link for resetting password and send it to the
        user.
        """
        email = self.cleaned_data["email"]
        if not domain_override:
            current_site = get_current_site(request)
            site_name = current_site.name
            domain = current_site.domain
        else:
            site_name = domain = domain_override
        email_field_name = UserModel.get_email_field_name()
        for user in self.get_users(email):
            user_email = getattr(user, email_field_name)
            context = {
                "email": user_email,
                "domain": domain,
                "site_name": site_name,
                "uid": urlsafe_base64_encode(force_bytes(user.pk)),
                "user": user,
                "token": token_generator.make_token(user),
                "protocol": "https" if use_https else "http",
                **(extra_email_context or {}),
            }
            self.send_email_message(subject_template_name, email_template_name,
                                    context, user_email)
            
class NewPasswordForm(SetPasswordForm):
    """
    Enables users to set new passwords in
    the web application.
    """

    def __init__(self, user: AbstractBaseUser | None, *args: Any, **kwargs: Any) -> None:
        super().__init__(user, *args, **kwargs)

        self.fields['new_password1'].widget.attrs['class'] = 'form-control'
        self.fields['new_password1'].widget.attrs['placeholder'] = 'New Password'
        self.fields['new_password1'].label = 'New Password'
        self.fields['new_password1'].label_suffix = ""
        self.fields['new_password1'].help_text = '<span class="form-text text-muted"><small>Enter a unique password made up of at least 8 characters: Letters, digits and special characters.</small></span>'

        self.fields['new_password2'].widget.attrs['class'] = 'form-control'
        self.fields['new_password2'].widget.attrs['placeholder'] = 'Confirm New Password'
        self.fields['new_password2'].label = 'Confirm New Password'
        self.fields['new_password2'].label_suffix = ""
        self.fields['new_password2'].help_text = '<span class="form-text text-muted"><small>Enter the same password as before, for verification.</small></span>'

class EditProfileImageForm(forms.Form):
    """Form to edit profile images for users
     of the web application """

    image = forms.ImageField(required=True, widget=forms.widgets.ClearableFileInput(
        attrs={"placeholder":"", "class":"form-control"}), label="Image")

class EditNameForm(forms.Form):
    """Form to edit a user's first and last name
     inside of the web application """

    first_name = forms.CharField(label="First Name", required=True, max_length=150, widget=forms.widgets.TextInput(
        attrs={"name": "first_name", "class": "form-control", "autofocus": "true", 
               "placeholder":"Your First Name"}), label_suffix="")
    last_name = forms.CharField(label="Last Name", required=True, max_length=150, widget=forms.widgets.TextInput(
        attrs={"name": "last_name", "class": "form-control", 
               "placeholder":"Your Last Name"}), label_suffix="")

class AddProductForm(forms.Form):
    """Form to add products to the
    web application for use"""

    BULK_NAME_CHOICES = [
        ("", "Select one"),
        ("dozen", "Dozen"),
        ("packet", "Packet"),
        ("pack", "Pack"),
        ("roll", "Roll"),
    ]

    YES_NO_CHOICES = [
        ("", "---Select one---"),
        ("True", "True"),
        ("False", "False"),
    ]

    CARTON_BAG_CHOICES = [
        ("", "---Select one---"),
        ("none", "None"),
        ("carton", "Carton"),
        ("bag", "Bag"),
    ]   

    brand_name = forms.CharField(label="Brand Name", required=True, max_length=150, widget=forms.widgets.TextInput(
        attrs={"name": "brand_name", "class": "form-control", "autofocus": "true", 
               "placeholder": "The Brand's Name"}), label_suffix="")
    
    product_name = forms.CharField(label="Product Name", required=True, max_length=150, widget=forms.widgets.TextInput(
        attrs={"name": "product_name", "class": "form-control", 
               "placeholder": "The Product's Name"}), label_suffix="")
    
    size = forms.CharField(label="Size", required=True, max_length=150, widget=forms.widgets.TextInput(
        attrs={"name": "size", "class": "form-control", 
               "placeholder": "One Size"}), label_suffix="")
    
    product_image = forms.ImageField(required=True, widget=forms.widgets.ClearableFileInput(
        attrs={"name": "product_image", "class":"form-control"}), label="Product's Image")

    retail_price = forms.IntegerField(label="Retail Price", required=True, widget=forms.widgets.NumberInput(
        attrs={"name": "retail_price", "class": "form-control", "id": "retail_price",
               "placeholder": "The Retail Price"}), label_suffix="")
    
    wholesale_price = forms.IntegerField(label="Wholesale Price", required=True, widget=forms.widgets.NumberInput(
        attrs={"name": "wholesale_price", "class": "form-control", 
               "placeholder": "The wholesale price"}), label_suffix="")

    is_discount = forms.ChoiceField(required=True, choices=YES_NO_CHOICES, widget=forms.widgets.Select(
        attrs={"placeholder":"is discount", "class":"form-select", "id": "is_discount"}),
        label="Does Product's Retail Price Have Discount?", label_suffix="", initial=False)
    
    discount_retail_price = forms.IntegerField(label="Discounted Retail Price", required=False, widget=forms.widgets.NumberInput(
        attrs={"class": "form-control", "id": "discount_retail_price", "placeholder": "Discounted Retail Price"}), label_suffix="")

    is_divisible = forms.ChoiceField(required=True, choices=YES_NO_CHOICES, widget=forms.widgets.Select(
        attrs={"placeholder":"is divisible", "class":"form-select", "id": "is_divisible"}),
        label="Can Product Be Divided For Sale?", label_suffix="", initial=False)

    has_bulk = forms.ChoiceField(required=True, choices=YES_NO_CHOICES, widget=forms.widgets.Select(
        attrs={"placeholder":"has bulk", "class":"form-select", "id": "has_bulk"}),
        label="Does Product Have Bulk?", label_suffix="")
    
    bulk_type_1 = forms.CharField(required=False, widget=DataListInput(
        attrs={"class":"form-control", "id": "bulk_type_1", "autocomplete": "off"}),
        label="Type of Bulk 1", label_suffix="")

    bulk_price_1 = forms.IntegerField(label="Price of Bulk 1", required=False, widget=forms.widgets.NumberInput(
        attrs={"class": "form-control", "placeholder": "bulk price", "id": "bulk_price_1"}), label_suffix="")

    no_in_bulk_1 = forms.IntegerField(label="Number In Bulk 1", required=False, max_value=100, widget=forms.widgets.NumberInput(
        attrs={"class": "form-control", 
               "placeholder": "no in bulk", "id": "no_in_bulk_1"}), label_suffix="")

    bulk_image_1 = forms.ImageField(required=False, widget=forms.widgets.ClearableFileInput(
        attrs={"class":"form-control", "id": "bulk_image_1"}), label="Bulk 1's Image")

    is_carton_bag = forms.ChoiceField(required=True, choices=CARTON_BAG_CHOICES, widget=forms.widgets.Select(
        attrs={"placeholder":"is carton or bag", "class":"form-select", "id": "is_carton_bag"}),
        label="Does Product come in Cartons or Bags?", label_suffix="")

    carton_price = forms.IntegerField(label="Price of Carton", required=False, widget=forms.widgets.NumberInput(
        attrs={"name": "carton_price", "class": "form-control", 
               "placeholder":"carton price", "id": "carton_price"}), label_suffix="")
    
    no_in_carton = forms.IntegerField(label="Quantity In Carton", required=False, widget=forms.widgets.NumberInput(
        attrs={"name": "no_in_carton", "class": "form-control", 
               "placeholder":"no in carton", "id": "no_in_carton"}), label_suffix="")
    
    carton_image = forms.ImageField(required=False, widget=forms.widgets.ClearableFileInput(
        attrs={"class":"form-control", "id": "carton_image"}), label="Image of Carton")

    carton_stock = forms.IntegerField(label="Number of Cartons in Stock", required=False, widget=forms.widgets.NumberInput(
        attrs={"id": "carton_stock", "class": "form-control", 
               "placeholder":"The carton stock"}), label_suffix="")
    
    is_carton_divisible = forms.ChoiceField(required=True, choices=YES_NO_CHOICES, widget=forms.widgets.Select(
        attrs={"placeholder":"is carton divisible", "class":"form-select", "id": "is_carton_divisible"}),
        label="Can Carton Be Divided For Sale?", label_suffix="", initial=True)
    
    bag_price = forms.IntegerField(label="Price of Bag", required=False, widget=forms.widgets.NumberInput(
        attrs={"name": "bag_price", "class": "form-control", 
               "placeholder":"bag price", "id": "bag_price"}), label_suffix="")
    
    no_in_bag = forms.IntegerField(label="Quantity In Bag", required=False, widget=forms.widgets.NumberInput(
        attrs={"name": "no_in_bag", "class": "form-control", 
               "placeholder":"no in bag", "id": "no_in_bag"}), label_suffix="")

    bag_image = forms.ImageField(required=False, widget=forms.widgets.ClearableFileInput(
        attrs={"class":"form-control", "id": "bag_image"}), label="Image of Bag")

    bag_stock = forms.IntegerField(label="Number of Bags in Stock", required=False, widget=forms.widgets.NumberInput(
        attrs={"id": "bag_stock", "class": "form-control", 
               "placeholder":"The bag stock"}), label_suffix="")
    
    is_bag_divisible = forms.ChoiceField(required=True, choices=YES_NO_CHOICES, widget=forms.widgets.Select(
        attrs={"placeholder":"is bag divisible", "class":"form-select", "id": "is_bag_divisible"}),
        label="Can Bag Be Divided For Sale?", label_suffix="", initial=True)

    singles_stock = forms.IntegerField(label="Number of Single Quantities in Stock", required=True, widget=forms.widgets.NumberInput(
        attrs={"name": "singles_stock", "class": "form-control", 
               "placeholder":"The single's stock"}), label_suffix="")

    tags = forms.CharField(label="Tags", required=True, widget=forms.widgets.TextInput(
        attrs={"name": "tags", "class": "form-control",
               "placeholder": "The Tags"}), label_suffix="",
               help_text='<span class="form-text text-muted"><small>Separate each tag \
                            value with commas. Each genre can have spaces in its name.</small></span>')
    
    description = forms.CharField(label="Description", required=False, widget=TinyMCEWidget(attrs={
        "required": False, "cols": 30, "rows": 10
    }))

    def __init__(self, *args, **kwargs) -> None:
        super(AddProductForm, self).__init__(*args, **kwargs)
        # create empty fields at first
        field_name = "bulk_name_1"
        # self.fields[field_name] = forms.ChoiceField(required=False, choices=self.BULK_NAME_CHOICES, widget=forms.widgets.Select(
        # attrs={"placeholder":"has bulk", "name": "bulk_name_1", "class":"form-select", "id": "bulk_name_1"}),
        # label="Name of Bulk 1", label_suffix="")
        
        field_name_2 = "bulk_price_1"
        # self.fields[field_name_2] = forms.IntegerField(label="Price of Bulk 1", required=False, widget=forms.widgets.NumberInput(
        # attrs={"name": "bulk_price_1", "class": "form-control", 
        #        "placeholder":"bulk price", "id": "bulk_price_1"}), label_suffix="")
        
        field_name_3 = "no_in_bulk_1"
        # self.fields[field_name_3] = forms.IntegerField(label="Number In Bulk 1", required=False, max_value=100, widget=forms.widgets.NumberInput(
        # attrs={"name": "no_in_bulk_1", "class": "form-control", 
        #        "placeholder":"no in bulk", "id": "no_in_bulk_1"}), label_suffix="")
        
        field_name_4 = "bulk_image_1"
        # self.fields[field_name_4] = forms.ImageField(required=True, widget=forms.widgets.ClearableFileInput(
        # attrs={"name": "bulk_image_1", "class":"form-control", "id": "bulk_image_1"}), label="Bulk 1's Image")

        # self.field_order = ["brand_name", "product_name", "retail_price", "size", "product_image", "retail_price", "wholesale_price", 
        #            "has_bulk", "bulk_name_1", "no_in_bulk_1", "bulk_price_1", "bulk_image_1", ]
        

    def clean(self):
        super().clean()
        
        # raise validation for if_discount
        is_discount = self.cleaned_data.get("is_discount")
        if is_discount:
            discount_retail_price = self.cleaned_data.get("discount_retail_price")

            if is_discount == "True" and discount_retail_price == None:
                self.add_error("discount_retail_price", "Discounted price required!")
            elif is_discount == "True" and discount_retail_price < 1:
                self.add_error("discount_retail_price", "Discounted price must be greater than 0!")
            elif is_discount == "False" and discount_retail_price != None:
                self.add_error("is_discount", "Product does not have a discount price!")

        # Raise validation for carton/bag
        is_carton_bag = self.cleaned_data.get("is_carton_bag")

        carton_price = self.cleaned_data.get("carton_price")
        no_in_carton = self.cleaned_data.get("no_in_carton")
        carton_image = self.cleaned_data.get("carton_image")
        carton_stock = self.cleaned_data.get("carton_stock")
        is_carton_divisible = self.cleaned_data.get("is_carton_divisible")

        bag_price = self.cleaned_data.get("bag_price")
        no_in_bag = self.cleaned_data.get("no_in_bag")
        bag_image = self.cleaned_data.get("bag_image")
        bag_stock = self.cleaned_data.get("bag_stock")
        is_bag_divisible = self.cleaned_data.get("is_bag_divisible")

        if is_carton_bag:
            if is_carton_bag == "carton" and carton_price == None:
                self.add_error("carton_price", "Price of carton required!")
            elif is_carton_bag == "carton" and carton_price < 1:
                self.add_error("carton_price", "Price of Carton must be greater than 0!")
            elif is_carton_bag == "carton" and no_in_carton == None:
                self.add_error("no_in_carton", "Quantity in carton required!")
            elif is_carton_bag == "carton" and no_in_carton < 1:
                self.add_error("no_in_carton", "Number in Carton must be greater than 0!")
            elif is_carton_bag == "carton" and carton_stock == None:
                self.add_error("carton_stock", "Number of cartons in stock required!")
            elif is_carton_bag == "carton" and carton_stock < 0:
                self.add_error("carton_stock", "You can't have a negative stock!")
            elif is_carton_bag == "bag" and is_carton_divisible == None:
                self.add_error("bag_stock", "Carton's Divisibility required!")

            if is_carton_bag == "bag" and bag_price == None:
                self.add_error("bag_price", "Price of bag required!")
            elif is_carton_bag == "bag" and bag_price < 1:
                self.add_error("bag_price", "Price of bag must be greater than 0!")
                #bags can be unquantifiable, e.g. rice, garri
            # elif is_carton_bag == "bag" and no_in_bag == None:
            #     self.add_error("no_in_bag", "Quantity in bag required!")
            elif is_carton_bag == "bag" and no_in_bag <= 0:
                self.add_error("no_in_bag", "Number in Bag must be greater than 0!")
            elif is_carton_bag == "bag" and bag_stock == None:
                self.add_error("bag_stock", "Number of bags in stock required!")
            elif is_carton_bag == "bag" and bag_stock < 0:
                self.add_error("bag_stock", "You can't have a negative stock!")
            elif is_carton_bag == "bag" and is_bag_divisible == None:
                self.add_error("bag_stock", "Carton's Divisibility required!")

            if is_carton_bag == "none" and carton_price != None:
                self.add_error("is_carton_bag", "Product does not have carton/bag!")
            elif is_carton_bag == "none" and no_in_carton != None:
                self.add_error("is_carton_bag", "Product does not have carton/bag!")
            elif is_carton_bag == "none" and carton_image != None:
                self.add_error("is_carton_bag", "Product does not have carton/bag!")
            elif is_carton_bag == "none" and carton_stock != None:
                self.add_error("is_carton_bag", "Product does not have carton/bag!")
            elif is_carton_bag == "none" and is_carton_divisible != None:
                self.add_error("is_carton_bag", "Product does not have carton/bag!")
            elif is_carton_bag == "none" and bag_price != None:
                self.add_error("is_carton_bag", "Product does not have carton/bag!")
            elif is_carton_bag == "none" and no_in_bag != None:
                self.add_error("is_carton_bag", "Product does not have carton/bag!")
            elif is_carton_bag == "none" and bag_image != None:
                self.add_error("is_carton_bag", "Product does not have carton/bag!")
            elif is_carton_bag == "none" and bag_stock != None:
                self.add_error("is_carton_bag", "Product does not have carton/bag!")
            elif is_carton_bag == "none" and is_bag_divisible != None:
                self.add_error("is_carton_bag", "Product does not have carton/bag!")

        return self.cleaned_data
    
    def get_size_fields(self):
        # to be used when editing product fields and all,
        # though may not be necessary since invoking mongodb
        for field_name in self.fields:
            if field_name.startswith("size_") or field_name.startswith("size_image_"):
                yield self[field_name]
    

    def clean_retail_price(self):
        data = self.cleaned_data["retail_price"]
        if data < 1:
            raise forms.ValidationError("Retail price must be greater than 0!")
        return data
    
    def clean_wholesale_price(self):
        data = self.cleaned_data["wholesale_price"]
        if data < 1:
            raise forms.ValidationError("Wholesale price must be greater than 0!")
        return data
            
    def clean_singles_stock(self):
        data = self.cleaned_data["singles_stock"]
        if data < 0:
            raise forms.ValidationError("You can't have a negative stock!")
        return data
    
class CarouselForm(forms.Form):
    """
    Form to add Carousel Images to Home page of web application
    Least number of images is always 3
    """
    car_image_1 = forms.ImageField(required=False, widget=forms.widgets.ClearableFileInput(
        attrs={"class":"form-control", "id": "car_image_1"}), label="Slide 1")
    
    car_image_2 = forms.ImageField(required=False, widget=forms.widgets.ClearableFileInput(
        attrs={"class":"form-control", "id": "car_image_2"}), label="Slide 2")

    car_image_3 = forms.ImageField(required=False, widget=forms.widgets.ClearableFileInput(
        attrs={"class":"form-control", "id": "car_image_3"}), label="Slide 3")


class EditProductForm(forms.Form):
    """Form to edit products already in MongoDB in the
    web application for use"""

    BULK_NAME_CHOICES = [
        ("", "Select one"),
        ("dozen", "Dozen"),
        ("packet", "Packet"),
        ("pack", "Pack"),
        ("roll", "Roll"),
    ]

    YES_NO_CHOICES = [
        ("", "---Select one---"),
        ("True", "True"),
        ("False", "False"),
    ]

    CARTON_BAG_CHOICES = [
        ("", "---Select one---"),
        ("none", "None"),
        ("carton", "Carton"),
        ("bag", "Bag"),
    ]

    brand_name = forms.CharField(label="Brand Name", required=True, max_length=150, widget=forms.widgets.TextInput(
        attrs={"name": "brand_name", "class": "form-control", "autofocus": "true",
               "placeholder": "The Brand's Name"}), label_suffix="")
    
    product_name = forms.CharField(label="Product Name", required=True, max_length=150, widget=forms.widgets.TextInput(
        attrs={"name": "product_name", "class": "form-control",
               "placeholder": "The Product's Name"}), label_suffix="")
    
    size = forms.CharField(label="Size", required=True, max_length=150, widget=forms.widgets.TextInput(
        attrs={"name": "size", "class": "form-control", 
               "placeholder": "One Size"}), label_suffix="")

    retail_price = forms.IntegerField(label="Retail Price", required=True, widget=forms.widgets.NumberInput(
        attrs={"name": "retail_price", "class": "form-control", "id": "retail_price",
               "placeholder": "The Retail Price"}), label_suffix="")
    
    wholesale_price = forms.IntegerField(label="Wholesale Price", required=True, widget=forms.widgets.NumberInput(
        attrs={"name": "wholesale_price", "class": "form-control", 
               "placeholder": "The wholesale price"}), label_suffix="")

    is_discount = forms.ChoiceField(required=True, choices=YES_NO_CHOICES, widget=forms.widgets.Select(
        attrs={"placeholder":"is discount", "class":"form-select", "id": "is_discount"}),
        label="Does Product's Retail Price Have Discount?", label_suffix="", initial=False)
    
    discount_retail_price = forms.IntegerField(label="Discounted Retail Price", required=False, widget=forms.widgets.NumberInput(
        attrs={"class": "form-control", "id": "discount_retail_price", "placeholder": "Discounted Retail Price"}), label_suffix="")

    # Will add soon

    has_bulk = forms.ChoiceField(required=True, choices=YES_NO_CHOICES, widget=forms.widgets.Select(
        attrs={"placeholder":"has bulk", "class":"form-select", "id": "has_bulk"}),
        label="Does Product Have Bulk?", label_suffix="")
    
    bulk_type_1 = forms.CharField(required=False, widget=DataListInput(
        attrs={"class":"form-control", "id": "bulk_type_1", "autocomplete": "off"}),
        label="Type of Bulk 1", label_suffix="")

    bulk_price_1 = forms.IntegerField(label="Price of Bulk 1", required=False, widget=forms.widgets.NumberInput(
        attrs={"class": "form-control", "placeholder": "bulk price", "id": "bulk_price_1"}), label_suffix="")

    no_in_bulk_1 = forms.IntegerField(label="Number In Bulk 1", required=False, max_value=100, widget=forms.widgets.NumberInput(
        attrs={"class": "form-control", 
               "placeholder": "no in bulk", "id": "no_in_bulk_1"}), label_suffix="")

    bulk_image_1 = forms.ImageField(required=False, widget=forms.widgets.ClearableFileInput(
        attrs={"class":"form-control", "id": "bulk_image_1"}), label="Bulk 1's Image")

    is_carton_bag = forms.ChoiceField(required=True, choices=CARTON_BAG_CHOICES, widget=forms.widgets.Select(
        attrs={"placeholder":"is carton or bag", "class":"form-select", "id": "is_carton_bag"}),
        label="Does Product come in Cartons or Bags?", label_suffix="")

    carton_price = forms.IntegerField(label="Price of Carton", required=False, widget=forms.widgets.NumberInput(
        attrs={"name": "carton_price", "class": "form-control", 
               "placeholder":"carton price", "id": "carton_price"}), label_suffix="")
    
    no_in_carton = forms.IntegerField(label="Quantity In Carton", required=False, widget=forms.widgets.NumberInput(
        attrs={"name": "no_in_carton", "class": "form-control", 
               "placeholder":"no in carton", "id": "no_in_carton"}), label_suffix="")
    
    carton_image = forms.ImageField(required=False, widget=forms.widgets.ClearableFileInput(
        attrs={"class":"form-control", "id": "carton_image"}), label="Image of Carton")

    carton_stock = forms.IntegerField(label="Number of Cartons in Stock", required=False, widget=forms.widgets.NumberInput(
        attrs={"id": "carton_stock", "class": "form-control", 
               "placeholder":"The carton stock"}), label_suffix="")
    
    # Will add soon
    
    bag_price = forms.IntegerField(label="Price of Bag", required=False, widget=forms.widgets.NumberInput(
        attrs={"name": "bag_price", "class": "form-control", 
               "placeholder":"bag price", "id": "bag_price"}), label_suffix="")
    
    no_in_bag = forms.IntegerField(label="Quantity In Bag", required=False, widget=forms.widgets.NumberInput(
        attrs={"name": "no_in_bag", "class": "form-control", 
               "placeholder":"no in bag", "id": "no_in_bag"}), label_suffix="")

    bag_image = forms.ImageField(required=False, widget=forms.widgets.ClearableFileInput(
        attrs={"class":"form-control", "id": "bag_image"}), label="Image of Bag")

    bag_stock = forms.IntegerField(label="Number of Bags in Stock", required=False, widget=forms.widgets.NumberInput(
        attrs={"id": "bag_stock", "class": "form-control", 
               "placeholder":"The bag stock"}), label_suffix="")
    
    # Will add soon

    singles_stock = forms.IntegerField(label="Number of Single Quantities in Stock", required=True, widget=forms.widgets.NumberInput(
        attrs={"name": "singles_stock", "class": "form-control", 
               "placeholder":"The single's stock"}), label_suffix="")

    tags = forms.CharField(label="Tags", required=True, widget=forms.widgets.TextInput(
        attrs={"name": "tags", "class": "form-control",
               "placeholder": "The Tags"}), label_suffix="",
               help_text='<span class="form-text text-muted"><small>Separate each tag \
                            value with commas. Each genre can have spaces in its name.</small></span>')
    
    description = forms.CharField(label="Description", required=False, widget=TinyMCEWidget(attrs={
        "required": False, "cols": 30, "rows": 10
    }))

class AddDebtorForm(forms.Form):
    """
    Form handling the adding of debtors
    within the application
    """

    MALE_FEMALE_CHOICES = [
        ("", "--Select one--"),
        ("Male", "Male"),
        ("Female", "Female"),
    ]

    COUNTRY_CODE = [
        ("+234", "+234 (Nigeria)"),
        ("+233", "+233 (Ghana)"),
        ("+1", "+1 (USA)"),
        ("+44", "+44 (UK)"),
    ]

    first_name = forms.CharField(label="First Name", required=True, max_length=150, widget=forms.widgets.TextInput(
        attrs={"name": "first_name", "class": "form-control", "autofocus": "true", 
               "placeholder":"Your First Name", "autocomplete": "off"}), label_suffix="")
    
    last_name = forms.CharField(label="Last Name", required=True, max_length=150, widget=forms.widgets.TextInput(
        attrs={"name": "last_name", "class": "form-control", 
               "placeholder":"Your Last Name", "autocomplete": "off"}), label_suffix="")
    
    email = forms.CharField(label="E-mail Address", required=True, widget=forms.EmailInput(
        attrs={"name": "email", "class": "form-control", "placeholder":"sample@email.com",
               "autocomplete": "off"}), label_suffix="")
    
    gender = forms.ChoiceField(required=True, choices=MALE_FEMALE_CHOICES, widget=forms.widgets.Select(
        attrs={"placeholder":"choose", "class":"form-select", "name": "gender"}), label="Gender")
    
    dialing_code = forms.ChoiceField(required=True, choices=COUNTRY_CODE, widget=forms.widgets.Select(
        attrs={"placeholder":"choose", "class":"form-select", "name": "dialing_code"}), label="Country Code")
    phone_number = forms.CharField(label="Phone Number", required=True, min_length=10, max_length=11, widget=forms.widgets.TextInput(
        attrs={"name": "phone_number", "class": "form-control", "placeholder":"08058482381", "autocomplete": "off"}),
        label_suffix="")
    address = forms.CharField(label="Address", required=True, max_length=1000, widget=forms.widgets.TextInput(
        attrs={"name": "address", "class": "form-control", "placeholder":"No. 23, Super Way", "autocomplete": "off"}),
        label_suffix="")
    state = forms.CharField(label="State", required=True, max_length=100, widget=forms.widgets.TextInput(
        attrs={"name": "state", "class": "form-control", "placeholder":"Port Harcourt",
               "autocomplete": "off"}), label_suffix="")

    amount_owed = forms.IntegerField(label="Amount Owed", required=True, widget=forms.widgets.NumberInput(
        attrs={"name": "amount_owed", "class": "form-control",
               "placeholder": "The Retail Price", "autocomplete": "off"}), label_suffix="")
    
    description = forms.CharField(label="Description", required=True, max_length=100, widget=forms.widgets.TextInput(
        attrs={"name": "description", "class": "form-control", "placeholder":"Port Harcourt",
               "autocomplete": "off"}), label_suffix="")
    
    



